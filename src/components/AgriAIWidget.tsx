import React, { useState, useEffect, useRef } from 'react';
import { Language, UserProfile, FarmerCropItem } from '../types';
import { recommendedBuyersList } from '../data/mockData';
import {
  MessageSquare,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  RefreshCw,
  Globe,
  Bot,
  User,
  AlertCircle,
  HelpCircle,
  Minimize2,
  Maximize2
} from 'lucide-react';

interface AgriAIWidgetProps {
  lang: Language;
  currentUser?: UserProfile | null;
  crops: FarmerCropItem[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

const SUPPORTED_LANGUAGES = [
  { code: 'auto', label: '🌐 Auto-detect (స్వయం చాలిత)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ml', label: 'മലയാളം (Malayalam)' },
  { code: 'bn', label: 'বাংলা (Bengali)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
  { code: 'en', label: 'English' },
];

const SUGGESTED_PROMPTS = [
  {
    en: 'Which crop should I grow now?',
    te: 'ప్రస్తుత సీజన్‌లో ఏ పంట వేస్తే ఎక్కువ లాభం వస్తుంది?',
    label: '🌾 Best Crops for Season',
  },
  {
    en: 'How can I control pests safely?',
    te: 'పురుగుల నివారణకు ఎలాంటి మందులు, జాగ్రత్తలు తీసుకోవాలి?',
    label: '🐛 Pest Control / నివారణ',
  },
  {
    en: 'What fertilizer schedule should I follow?',
    te: 'వరి, మిర్చి పంటలకు ఎరువుల మోతాదు ఎంత?',
    label: '🌿 Fertilizer Guidance',
  },
  {
    en: 'How can I maximize my mandi net profit?',
    te: 'మార్కెట్ యార్డులో ఎక్కువ నికర లాభం ఎలా పొందాలి?',
    label: '💰 Maximize Profit / లాభం',
  },
];

export const AgriAIWidget: React.FC<AgriAIWidgetProps> = ({ lang, currentUser, crops }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState<string>('auto');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const initialWelcome: ChatMessage = {
    id: 'welcome-1',
    role: 'model',
    text:
      selectedLang === 'te' || lang === 'te'
        ? `నమస్కారం ${currentUser?.name ? currentUser.name + ' గారు' : 'రైతు మిత్రులారా'}! 🙏\nనేను మీ **AgriConnect AI** (రైతు మిత్ర). పంటల సాగు, క్రిమిసంహారకాలు, ఎరువులు, మార్కెట్ ధరలు లేదా ఎక్కువ లాభం పొందడం గురించి మీరు మీ మాతృభాషలో నన్ను ఏదైనా అడగవచ్చు!`
        : `Namaste ${currentUser?.name ? currentUser.name : 'Farmer friend'}! 🙏\nI am **AgriConnect AI**, your multilingual farming assistant. Ask me anything in your preferred language about crop advice, pest control, fertilizers, or maximizing your mandi profits!`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialWelcome]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    } else {
      // Stop speech synthesis if widget is closed
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setSpeakingId(null);
      }
    }
  }, [isOpen]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    setError(null);
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation payload for backend
      const historyPayload = newMessages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const location = currentUser?.apmc
        ? `${currentUser.apmc}${currentUser.state ? `, ${currentUser.state}` : ''}`
        : '';
      const weatherLocation = currentUser?.apmc
        ? `${currentUser.apmc.replace(/\\s*APMC.*$/i, '').replace(/\\s*mandi.*$/i, '')}${currentUser.state ? `, ${currentUser.state}` : ''}`
        : '';
      const savedCropRecords = (() => {
        try { return Boolean(localStorage.getItem('agriconnect_crops')); } catch { return false; }
      })();
      const firstCrop = crops?.[0];
      const cropForLookup = firstCrop?.cropKey || firstCrop?.name || '';
      const [marketSnapshot, weatherSnapshot] = await Promise.all([
        cropForLookup && location
          ? fetch(`/api/market-prices?crop=${encodeURIComponent(cropForLookup)}&location=${encodeURIComponent(location)}&radius=150`)
              .then(async (r) => r.ok ? (await r.json())?.data || null : null)
              .catch(() => null)
          : Promise.resolve(null),
        weatherLocation
          ? fetch(`/api/agri-ai/weather?location=${encodeURIComponent(weatherLocation)}`)
              .then(async (r) => r.ok ? await r.json() : null)
              .catch(() => null)
          : Promise.resolve(null),
      ]);

      const buyerListings = recommendedBuyersList.slice(0, 10).map((buyer) => ({
        companyName: buyer.companyName,
        businessType: buyer.businessType,
        requiredCrop: buyer.requiredCrop,
        quantity: buyer.quantity,
        location: buyer.location,
        offeredPrice: buyer.offeredPrice,
        sourceStatus: 'demo/sample listing; not a verified live offer',
      }));

      const res = await fetch('/api/agri-ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyPayload,
          language: selectedLang,
          context: {
            userName: currentUser?.name,
            role: currentUser?.role,
            location: location || '',
            farmCrops: (crops || []).map((crop) => ({
              name: crop.name,
              cropKey: crop.cropKey,
              quantity: crop.quantity,
              expectedPrice: crop.price,
            })),
            farmCropsSource: savedCropRecords ? 'localStorage app crop records' : 'demo starter crop records; not confirmed farmer data',
            marketSnapshot,
            weatherSnapshot,
            buyerListings,
            soilData: null,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to get answer from AI. Please try again.');
      }

      const botMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Agri AI Error:', err);
      setError(err?.message || 'AI service temporarily unavailable. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryLastMessage = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.text);
    }
  };

  // Text-To-Speech (TTS)
  const handleToggleSpeak = (msg: ChatMessage) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-Speech is not supported in this browser.');
      return;
    }

    if (speakingId === msg.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setSpeakingId(msg.id);

    // Clean markdown characters for spoken audio
    const cleanText = msg.text
      .replace(/[*_#>`-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Pick appropriate voice
    const isTelugu = /[\u0C00-\u0C7F]/.test(cleanText);
    const isHindi = /[\u0900-\u097F]/.test(cleanText);

    if (isTelugu) {
      utterance.lang = 'te-IN';
    } else if (isHindi) {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    utterance.rate = 0.95; // comfortable speaking pace for farmers

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    window.speechSynthesis.speak(utterance);
  };

  // Speech-To-Text (STT)
  const handleToggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Voice input (Speech recognition) is not supported in this browser. Please use Chrome or type your question.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;

      // Select speech language
      if (selectedLang === 'te') {
        recognition.lang = 'te-IN';
      } else if (selectedLang === 'hi') {
        recognition.lang = 'hi-IN';
      } else if (selectedLang === 'ta') {
        recognition.lang = 'ta-IN';
      } else if (selectedLang === 'kn') {
        recognition.lang = 'kn-IN';
      } else {
        recognition.lang = 'en-IN';
      }

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech Recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setError('Microphone access denied. Please allow microphone permissions to use voice input.');
        } else if (event.error === 'no-speech') {
          // No speech detected, silently stop
        } else {
          setError(`Voice input error (${event.error}). Please try again or type.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      console.error('Speech recognition start error:', err);
      setIsListening(false);
      setError('Could not start speech recognition. Please type your query.');
    }
  };

  // Helper to render formatted text with bold headers and bullet points
  const renderMessageContent = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={idx} className="h-1" />;
          }

          // Horizontal rule
          if (trimmed === '---') {
            return <hr key={idx} className="my-2 border-gray-200" />;
          }

          // Headings
          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-gray-900 mt-2 text-xs sm:text-sm">
                {trimmed.replace('### ', '')}
              </h4>
            );
          }

          // Bullet points
          if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
            const content = trimmed.substring(2);
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1">
                <span className="text-emerald-600 font-bold">•</span>
                <span className="flex-1">{parseBolding(content)}</span>
              </div>
            );
          }

          // Numbered lists
          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1">
                <span className="font-bold text-emerald-700 min-w-[14px]">{numMatch[1]}.</span>
                <span className="flex-1">{parseBolding(numMatch[2])}</span>
              </div>
            );
          }

          // Blockquotes
          if (trimmed.startsWith('> ')) {
            return (
              <div key={idx} className="border-l-2 border-emerald-500 pl-2.5 py-1 text-xs italic bg-emerald-50/60 rounded-r-md text-emerald-900 my-1">
                {parseBolding(trimmed.replace('> ', ''))}
              </div>
            );
          }

          return <p key={idx}>{parseBolding(line)}</p>;
        })}
      </div>
    );
  };

  // Parse **bold** within line
  const parseBolding = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-gray-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Circular Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-50 group">
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open AgriConnect AI Assistant"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#0e6834] via-emerald-600 to-green-500 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center relative cursor-pointer border-2 border-white/60 focus:outline-hidden focus:ring-4 focus:ring-emerald-300/60"
          >
            {/* Animated Glow Halo */}
            <span className="absolute -inset-1 rounded-full bg-emerald-500/30 animate-pulse pointer-events-none" />

            <div className="relative flex flex-col items-center justify-center">
              <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              <span className="text-[9px] font-extrabold tracking-tight uppercase leading-none mt-0.5">
                AI
              </span>
            </div>

            {/* Online Green Indicator Dot */}
            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-lime-400 border-2 border-white rounded-full shadow-xs" />
          </button>

          {/* Floating Tooltip Bubble */}
          <div className="hidden sm:block absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 bg-gray-900/90 text-white text-xs font-semibold rounded-xl shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            🌱 Ask AgriConnect AI (రైతు మిత్ర)
          </div>
        </div>
      )}

      {/* Floating Chat Panel anchored to bottom-right */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="AgriConnect Multilingual AI Assistant"
          className={`fixed z-50 bg-white shadow-2xl border border-gray-200/90 flex flex-col transition-all duration-300 ${
            isExpanded
              ? 'inset-3 sm:inset-auto sm:bottom-5 sm:right-5 sm:w-[540px] sm:h-[82vh] rounded-3xl'
              : 'bottom-4 right-4 sm:bottom-5 sm:right-5 w-[calc(100vw-32px)] sm:w-[430px] h-[82vh] sm:h-[620px] max-h-[88vh] rounded-3xl'
          } overflow-hidden`}
        >
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-[#0e6834] via-emerald-700 to-green-700 text-white p-3.5 sm:p-4 flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20 shadow-xs">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-extrabold tracking-tight">AgriConnect AI</h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-lime-400/20 text-lime-200 border border-lime-300/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-lime-300 animate-pulse" />
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100 font-medium">
                  రైతు మిత్ర • Multilingual Farming Advisor
                </p>
              </div>
            </div>

            {/* Actions: Language selector, Expand, Close */}
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="bg-black/25 hover:bg-black/40 text-white text-[11px] font-semibold py-1 px-2 pr-6 rounded-lg border border-white/20 focus:outline-hidden cursor-pointer appearance-none"
                  title="Choose conversation language"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code} className="text-gray-900 bg-white">
                      {l.label}
                    </option>
                  ))}
                </select>
                <Globe className="w-3 h-3 text-emerald-200 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
                className="hidden sm:flex p-1.5 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition cursor-pointer"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                title="Close AgriConnect AI"
                className="ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/50 bg-white/15 text-white shadow-sm transition hover:bg-rose-600 hover:border-white focus:outline-none focus:ring-2 focus:ring-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Notice banner */}
          <div className="bg-emerald-50 px-3.5 py-1.5 border-b border-emerald-100 text-[11px] text-emerald-900 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>Real Gemini AI farming advice in English, Telugu &amp; Indian languages</span>
            </span>
            <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
              RBK Grounded
            </span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/70">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                      isUser
                        ? 'bg-slate-700 text-white'
                        : 'bg-emerald-700 text-white shadow-xs'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-xs relative group ${
                      isUser
                        ? 'bg-[#0e6834] text-white rounded-tr-xs'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-xs'
                    }`}
                  >
                    {isUser ? (
                      <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                        {msg.text}
                      </p>
                    ) : (
                      renderMessageContent(msg.text)
                    )}

                    {/* Timestamp & Speak Aloud Button */}
                    <div
                      className={`flex items-center justify-between gap-2 mt-1.5 pt-1 border-t text-[10px] ${
                        isUser
                          ? 'border-emerald-700/50 text-emerald-100'
                          : 'border-gray-100 text-gray-400'
                      }`}
                    >
                      <span>{msg.timestamp}</span>

                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => handleToggleSpeak(msg)}
                          className="flex items-center gap-1 hover:text-emerald-700 transition cursor-pointer text-[10px] font-semibold"
                          title="Read message aloud"
                        >
                          {speakingId === msg.id ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                              <span className="text-rose-600">Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5 text-gray-500 hover:text-emerald-700" />
                              <span>Listen</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium">Agri AI is thinking...</span>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message with Retry */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Service Notice:</strong>
                    <span>{error}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRetryLastMessage}
                  className="px-2 py-1 bg-white hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-bold shrink-0 transition flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  Retry
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Question Chips (Scrollable row) */}
          <div className="px-3 py-2 bg-white border-t border-gray-100 overflow-x-auto flex items-center gap-1.5 shrink-0 scrollbar-none">
            <span className="text-[10px] text-gray-400 font-bold uppercase shrink-0 flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-emerald-600" />
              Suggested:
            </span>
            {SUGGESTED_PROMPTS.map((prompt, i) => {
              const query = selectedLang === 'te' || lang === 'te' ? prompt.te : prompt.en;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSendMessage(query)}
                  className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-emerald-50/80 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/60 font-medium transition cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {prompt.label}
                </button>
              );
            })}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-white border-t border-gray-100 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              {/* Mic Speech-to-Text Button */}
              <button
                type="button"
                onClick={handleToggleListening}
                title={isListening ? 'Stop listening' : 'Speak your question (Voice Input)'}
                className={`p-2.5 rounded-xl border transition shrink-0 cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 text-white border-rose-600 animate-pulse shadow-md'
                    : 'border-gray-200 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Text Input */}
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isListening
                    ? 'Listening... Speak now...'
                    : selectedLang === 'te' || lang === 'te'
                    ? 'మీ ప్రశ్నను ఇక్కడ అడగండి...'
                    : 'Ask about crops, pests, fertilizers, prices...'
                }
                disabled={isLoading}
                className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
                className="p-2.5 bg-[#0e6834] hover:bg-[#0b542a] text-white rounded-xl shadow-xs transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Input hint */}
            <div className="flex items-center justify-between mt-1.5 px-1 text-[10px] text-gray-400">
              <span>Supports Telugu, Hindi, Tamil &amp; 10+ languages</span>
              <span>🔒 Private &amp; Secure</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
