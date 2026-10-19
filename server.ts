import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { computeMarketPrices } from './src/services/marketPriceService';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // In-memory OTP storage: cleanMobile -> { otp, expiresAt, attempts }
  const otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>();
  // Demo OTP is allowed only when explicitly enabled outside production.
  const demoMode = process.env.OTP_DEMO_MODE === 'true' && process.env.NODE_ENV !== 'production';

  // API endpoint: Send OTP directly to mobile number
  app.post('/api/send-otp', async (req, res) => {
    try {
      const { mobile } = req.body;
      if (!mobile) {
        return res.status(400).json({ success: false, error: 'Mobile number is required' });
      }

      const cleanMobile = mobile.toString().replace(/\D/g, '').slice(-10);
      if (cleanMobile.length !== 10) {
        return res.status(400).json({ success: false, error: 'Please enter a valid 10-digit mobile number' });
      }

      const formattedPhone = mobile.toString().startsWith('+') ? mobile.toString().trim() : `+91${cleanMobile}`;

      // Demo mode is deliberately opt-in and cannot run in production.
      if (demoMode) {
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        otpStore.set(cleanMobile, { otp, expiresAt: Date.now() + 10 * 60 * 1000, attempts: 0 });
        console.log(`[AgriConnect DEMO MODE] Demo OTP generated for ${formattedPhone}; no SMS was sent.`);
        return res.json({
          success: true,
          mode: 'demo',
          message: 'DEMO MODE: No SMS was sent. Use the clearly labelled demonstration code.',
          mobile: cleanMobile,
          gateway: 'AgriConnect Demo',
          smsDelivered: false,
          devOtp: otp,
        });
      }

      const twilioSid = process.env.TWILIO_ACCOUNT_SID;
      const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
      const twilioVerifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

      if (!twilioSid || !twilioAuth || !twilioVerifyServiceSid) {
        return res.status(503).json({
          success: false,
          mode: 'sms',
          error: 'Real SMS verification is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_SID on the server.',
        });
      }

      try {
        const auth = Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64');
        const params = new URLSearchParams();
        params.append('To', formattedPhone);
        params.append('Channel', 'sms');

        const twRes = await fetch(
          `https://verify.twilio.com/v2/Services/${twilioVerifyServiceSid}/Verifications`,
          {
            method: 'POST',
            headers: {
              Authorization: `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
          }
        );
        const twData = (await twRes.json()) as any;

        if (twRes.ok && (twData.status === 'pending' || twData.status === 'approved')) {
          console.log(`[Twilio Verify] Verification request accepted for ${formattedPhone}`);
          return res.json({
            success: true,
            mode: 'sms',
            message: `Verification request accepted for ${formattedPhone}. Check your SMS inbox.`,
            mobile: cleanMobile,
            gateway: 'Twilio Verify',
            smsDelivered: true,
          });
        }

        console.warn('[Twilio Verify Send Error]:', twData.message || twData.code || 'Unknown Twilio error');
        return res.status(502).json({
          success: false,
          mode: 'sms',
          error: 'Twilio could not send the verification code. Check your Twilio Verify service, trial restrictions, and recipient number, then try again. No demo code was generated.',
        });
      } catch (twErr) {
        console.error('[Twilio Verify Network Error]:', twErr);
        return res.status(502).json({
          success: false,
          mode: 'sms',
          error: 'Could not reach Twilio to send the verification code. Please try again. No demo code was generated.',
        });
      }
    } catch (err: any) {
      console.error('Send OTP error:', err);
      return res.status(500).json({ success: false, error: 'Internal server error while sending SMS' });
    }
  });

  // API endpoint: Verify OTP strictly
  app.post('/api/verify-otp', async (req, res) => {
    try {
      const { mobile, otp } = req.body;
      if (!mobile || !otp) {
        return res.status(400).json({ success: false, error: 'Mobile number and OTP are required' });
      }

      const cleanMobile = mobile.toString().replace(/\D/g, '').slice(-10);
      const cleanEntered = otp.toString().trim();
      const formattedPhone = mobile.toString().startsWith('+') ? mobile.toString().trim() : `+91${cleanMobile}`;

      // Local OTP verification is reachable only in explicitly enabled non-production demo mode.
      if (demoMode) {
        const record = otpStore.get(cleanMobile);
        if (!record) {
          return res.status(400).json({ success: false, error: 'No active demo code found. Request a new demo code.' });
        }
        if (Date.now() > record.expiresAt) {
          otpStore.delete(cleanMobile);
          return res.status(400).json({ success: false, error: 'Demo code expired. Request a new one.' });
        }
        record.attempts += 1;
        if (record.attempts > 5) {
          otpStore.delete(cleanMobile);
          return res.status(429).json({ success: false, error: 'Too many incorrect attempts. Request a new demo code.' });
        }
        if (cleanEntered !== record.otp) {
          return res.status(400).json({ success: false, error: 'Incorrect demo code. Please enter the displayed six-digit code.' });
        }
        otpStore.delete(cleanMobile);
        return res.json({ success: true, mode: 'demo', message: 'Demo code accepted. This does not verify a real mobile number.' });
      }

      const twilioSid = process.env.TWILIO_ACCOUNT_SID;
      const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
      const twilioVerifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

      if (!twilioSid || !twilioAuth || !twilioVerifyServiceSid) {
        return res.status(503).json({
          success: false,
          mode: 'sms',
          error: 'Real SMS verification is not configured on the server. Demo codes are disabled in normal mode.',
        });
      }

      try {
        const auth = Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64');
        const params = new URLSearchParams();
        params.append('To', formattedPhone);
        params.append('Code', cleanEntered);

        const twRes = await fetch(
          `https://verify.twilio.com/v2/Services/${twilioVerifyServiceSid}/VerificationCheck`,
          {
            method: 'POST',
            headers: {
              Authorization: `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
          }
        );
        const checkData = (await twRes.json()) as any;

        if (twRes.ok && checkData.status === 'approved') {
          console.log(`[Twilio Verify] OTP approved for ${formattedPhone}`);
          return res.json({ success: true, mode: 'sms', message: 'Mobile number verified successfully via Twilio Verify.' });
        }

        const errorMsg = checkData.status === 'pending'
          ? 'Incorrect OTP. Check your SMS inbox and enter the six-digit code.'
          : 'OTP verification failed or expired. Request a new SMS code.';
        return res.status(400).json({ success: false, mode: 'sms', error: errorMsg });
      } catch (twErr) {
        console.error('[Twilio Verify Check Error]:', twErr);
        return res.status(502).json({ success: false, mode: 'sms', error: 'Could not verify the code with Twilio. Please try again.' });
      }
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      return res.status(500).json({ success: false, error: 'Internal server error during OTP verification' });
    }
  });

  // API endpoint: Dynamic Location-based Market Price Discovery
  app.get('/api/market-prices', (req, res) => {
    try {
      const crop = (req.query.crop as string) || 'tomato';
      const location = (req.query.location as string) || 'Vijayawada';
      const radius = Number(req.query.radius) || 150;

      const result = computeMarketPrices(crop, location, radius);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      console.error('Market prices API error:', err);
      return res.status(500).json({ success: false, error: 'Internal server error while computing market prices' });
    }
  });

  // API endpoint: AgriConnect Multilingual AI Assistant
  app.post('/api/agri-ai/chat', async (req, res) => {
    try {
      const { messages, language, context } = req.body;

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ success: false, error: 'Messages array is required' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          success: false,
          error: 'AI service is temporarily unavailable. GEMINI_API_KEY is not configured in the server environment.',
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const langMap: Record<string, string> = {
        te: 'Telugu (తెలుగు)',
        hi: 'Hindi (हिन्दी)',
        ta: 'Tamil (தமிழ்)',
        kn: 'Kannada (ಕನ್ನಡ)',
        ml: 'Malayalam (മലയാളം)',
        bn: 'Bengali (বাংলা)',
        mr: 'Marathi (मराठी)',
        pa: 'Punjabi (ਪੰਜਾਬੀ)',
        gu: 'Gujarati (ગુજરાતી)',
        en: 'English',
        auto: 'Auto-detect (Match the farmer\'s language and native script)',
      };

      const targetLanguage = langMap[language] || 'Auto-detect';

      const systemPrompt = `You are "AgriConnect AI" (రైతు మిత్ర / కృషి మిత్ర), an expert, deeply caring, multilingual agricultural assistant empowering Indian farmers, buyers, and traders on the AgriConnect platform.

COMMUNICATION & LANGUAGE RULES:
1. Target Language: ${targetLanguage}.
2. If the user writes in Telugu (or requests Telugu), reply in natural, fluent Telugu script (తెలుగు).
3. If the user writes in Hindi, reply in Hindi (हिन्दी).
4. If the user writes in Tamil, Kannada, Malayalam, Bengali, Marathi, Punjabi, or Gujarati, reply in that native script.
5. If in Auto-detect mode, automatically detect the language and script used in the latest user message and respond in that exact language. NEVER reply in English to a regional query.
6. Speak in warm, respectful, farmer-friendly terms. Avoid overly dense academic jargon.

FARMING DOMAIN EXPERTISE:
- Crop Cycles & Seasons: Kharif (June-Oct, monsoon), Rabi (Oct-March, winter), Zaid (March-June, summer).
- Soil & Nutrients: Black cotton soil, Red loamy, Alluvial soil. Balanced NPK fertilizer use, organic manure, biofertilizers.
- Integrated Pest Management (IPM): Cultural, physical, and biological methods first (neem oil, yellow sticky traps, pheromone traps).
- Safety Disclaimer: Always advise farmers to cross-verify specific pesticide/chemical doses with their local Rythu Bharosa Kendram (RBK), Krishi Vigyan Kendra (KVK), or agricultural officer before spraying.
- Market Price Guidance & Profit Optimization: Help farmers understand APMC mandi pricing, transportation costs, handling charges, and net returns. Explain how selling in high-demand mandis nearby increases profit.
- Current Context:
${context?.location ? `• Farmer Location: ${context.location}` : '• Location: Andhra Pradesh / Telangana region'}
${context?.crop ? `• Selected Crop: ${context.crop}` : ''}
${context?.role ? `• User Role: ${context.role}` : '• User Role: Farmer'}
${context?.userName ? `• User Name: ${context.userName}` : ''}
• Current Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

FORMATTING:
- Keep answers concise, clear, and action-oriented.
- Use bullet points and bold headers for easy reading on mobile screens.
- Where appropriate, encourage farmers to use AgriConnect's "Market Prices" and "Price Discovery" features.`;

      // Map messages to Gemini format: array of { role: 'user' | 'model', parts: [{ text: string }] }
      const contents = messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: String(m.text || m.content || '') }],
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
      });

      const replyText =
        response.text ||
        'I apologize, but I could not generate an answer at this moment. Please try asking again.';

      return res.json({
        success: true,
        reply: replyText,
        language: targetLanguage,
      });
    } catch (err: any) {
      console.error('Agri AI Chat error:', err);
      const isRateLimit = err?.status === 429 || String(err?.message).includes('429');
      return res.status(500).json({
        success: false,
        error: isRateLimit
          ? 'AI rate limit reached. Please wait a few seconds and try again.'
          : err?.message || 'Failed to generate AI response. Please try again later.',
      });
    }
  });

  // Mount Vite in dev mode
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AgriConnect Full-Stack Server running on port ${PORT}`);
  });
}

startServer();
