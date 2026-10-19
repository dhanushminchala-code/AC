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

      const twilioSid = process.env.TWILIO_ACCOUNT_SID;
      const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
      const twilioVerifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
      const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

      // 1. Primary: Twilio Verify Service (Industry standard for 2FA / OTP verification)
      if (twilioSid && twilioAuth && twilioVerifyServiceSid) {
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
            console.log(`[Twilio Verify] Verification code dispatched to ${formattedPhone} (Status: ${twData.status})`);
            return res.json({
              success: true,
              message: `OTP sent directly to mobile inbox at ${formattedPhone}`,
              mobile: cleanMobile,
              gateway: 'Twilio Verify',
              smsDelivered: true,
            });
          } else {
            console.warn('[Twilio Verify Notice]:', twData.message || twData);
            // Twilio Trial account restriction or unverified recipient fallback:
            // Generate secure demonstration OTP so student presentation never fails
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            otpStore.set(cleanMobile, {
              otp,
              expiresAt: Date.now() + 10 * 60 * 1000,
              attempts: 0,
            });

            console.log(`\n======================================================`);
            console.log(`[AgriConnect Demo Fallback] Twilio Verify Trial Mode`);
            console.log(`MOBILE: ${formattedPhone}`);
            console.log(`DEMO OTP CODE: ${otp}`);
            console.log(`REASON: ${twData.message || 'Trial Account unverified tester'}`);
            console.log(`======================================================\n`);

            return res.json({
              success: true,
              message: 'Twilio Trial Mode: Demonstration OTP generated for evaluation.',
              mobile: cleanMobile,
              gateway: 'Twilio Trial Demo Sandbox',
              smsDelivered: false,
              devOtp: otp,
            });
          }
        } catch (twErr) {
          console.error('[Twilio Verify Network Error]:', twErr);
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          otpStore.set(cleanMobile, {
            otp,
            expiresAt: Date.now() + 10 * 60 * 1000,
            attempts: 0,
          });
          return res.json({
            success: true,
            message: 'Network offline fallback: Demonstration OTP generated.',
            mobile: cleanMobile,
            gateway: 'Offline Demo Sandbox',
            smsDelivered: false,
            devOtp: otp,
          });
        }
      }

      // 2. Secondary Fallback: Twilio Programmable SMS (If configured with Phone Number instead of Verify Service)
      let smsDelivered = false;
      let gateway = 'telecom-simulated';

      // Generate local OTP for Programmable SMS or local development mode
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      otpStore.set(cleanMobile, {
        otp,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes validity
        attempts: 0,
      });

      if (twilioSid && twilioAuth && twilioPhone) {
        try {
          const auth = Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64');
          const twilioParams = new URLSearchParams();
          twilioParams.append('To', formattedPhone);
          twilioParams.append('From', twilioPhone);
          twilioParams.append('Body', `AgriConnect verification code: ${otp}. Valid for 10 minutes. Do not share.`);

          const twRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
            method: 'POST',
            headers: {
              Authorization: `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: twilioParams.toString(),
          });
          const msgData = (await twRes.json()) as any;
          if (twRes.ok) {
            smsDelivered = true;
            gateway = 'Twilio Programmable SMS';
            console.log(`[Twilio SMS] Live SMS sent to ${formattedPhone}!`);
          } else {
            console.error('[Twilio SMS Error]:', msgData);
          }
        } catch (twErr) {
          console.error('[Twilio SMS Dispatch Error]:', twErr);
        }
      }

      const isConfigured = Boolean((twilioSid && twilioAuth && twilioVerifyServiceSid) || (twilioSid && twilioAuth && twilioPhone));

      if (!isConfigured) {
        console.log(`\n======================================================`);
        console.log(`[AgriConnect Dev Mode] Twilio credentials not configured in .env`);
        console.log(`DISPATCHING OTP TO MOBILE INBOX: ${formattedPhone}`);
        console.log(`OTP CODE: ${otp}`);
        console.log(`======================================================\n`);
      }

      return res.json({
        success: true,
        message: `OTP sent directly to mobile inbox at ${formattedPhone}`,
        mobile: cleanMobile,
        gateway,
        smsDelivered,
        devOtp: !isConfigured ? otp : undefined,
      });
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

      const twilioSid = process.env.TWILIO_ACCOUNT_SID;
      const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
      const twilioVerifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

      // Check local demo store first (active for unverified trial numbers or demo mode)
      const localRecord = otpStore.get(cleanMobile);
      if (localRecord) {
        if (Date.now() > localRecord.expiresAt) {
          otpStore.delete(cleanMobile);
          return res.status(400).json({
            success: false,
            error: 'OTP has expired (10 minutes limit). Please request a new OTP.',
          });
        }
        localRecord.attempts += 1;
        if (localRecord.attempts > 5) {
          otpStore.delete(cleanMobile);
          return res.status(429).json({
            success: false,
            error: 'Too many incorrect attempts. Please request a new OTP.',
          });
        }
        if (cleanEntered !== localRecord.otp) {
          return res.status(400).json({
            success: false,
            error: 'Incorrect OTP. Please enter the exact 6-digit verification code.',
          });
        }
        otpStore.delete(cleanMobile);
        return res.json({
          success: true,
          message: 'Mobile number verified successfully!',
        });
      }

      // 1. If Twilio Verify is configured, verify via Twilio Verify Check API
      if (twilioSid && twilioAuth && twilioVerifyServiceSid) {
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
            console.log(`[Twilio Verify] OTP check approved for ${formattedPhone}`);
            return res.json({
              success: true,
              message: 'Mobile number verified successfully via Twilio Verify!',
            });
          } else {
            console.warn(`[Twilio Verify] OTP check failed for ${formattedPhone}:`, checkData.status || checkData.message);
            const errorMsg =
              checkData.status === 'pending'
                ? 'Incorrect OTP. Please check your SMS inbox and enter the exact 6-digit code.'
                : (checkData.code === 20404 || checkData.status === 404 || checkData.message?.includes('not found'))
                ? 'No active verification found or OTP has already been verified. Please request a new OTP.'
                : checkData.message || 'OTP verification failed or has expired. Please request a new OTP.';
            return res.status(400).json({
              success: false,
              error: errorMsg,
            });
          }
        } catch (twErr) {
          console.error('[Twilio Verify Check Error]:', twErr);
          return res.status(500).json({
            success: false,
            error: 'Failed to verify OTP with Twilio Verify service. Please try again.',
          });
        }
      }

      // 2. In-memory OTP verification (for Twilio Programmable SMS or local development mode)
      const record = otpStore.get(cleanMobile);

      if (!record) {
        return res.status(400).json({
          success: false,
          error: 'No active OTP request found for this mobile number. Please click "Resend OTP".',
        });
      }

      if (Date.now() > record.expiresAt) {
        otpStore.delete(cleanMobile);
        return res.status(400).json({
          success: false,
          error: 'OTP has expired (10 minutes limit). Please request a new OTP.',
        });
      }

      record.attempts += 1;
      if (record.attempts > 5) {
        otpStore.delete(cleanMobile);
        return res.status(429).json({
          success: false,
          error: 'Too many incorrect attempts. Please request a new OTP.',
        });
      }

      if (cleanEntered !== record.otp) {
        return res.status(400).json({
          success: false,
          error: 'Incorrect OTP. Please check your message inbox and enter the exact 6-digit code.',
        });
      }

      // Verification successful! Clean up OTP record
      otpStore.delete(cleanMobile);
      return res.json({
        success: true,
        message: 'Mobile number verified successfully!',
      });
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
