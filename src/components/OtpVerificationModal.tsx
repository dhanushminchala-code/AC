import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, CheckCircle, X, ShieldCheck, RefreshCw, ArrowRight } from 'lucide-react';
import { verifyMobileOtp } from '../services/otpService';

interface OtpVerificationModalProps {
  isOpen: boolean;
  mobile: string;
  expectedOtp?: string; // Optional internal ref for dev testing
  actionType: 'login' | 'register';
  onVerified: () => void;
  onResendOtp: () => void;
  onClose: () => void;
}

export const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
  isOpen,
  mobile,
  expectedOtp,
  actionType,
  onVerified,
  onResendOtp,
  onClose,
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState<number>(30);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [showDevHint, setShowDevHint] = useState<boolean>(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const cleanMobileDigits = (mobile || '').replace(/\D/g, '').slice(-10);

  // Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (isOpen) {
      setTimer(30);
      setCanResend(false);
      setErrorMsg('');
      setIsSuccess(false);
      setShowDevHint(false);
      setDigits(['', '', '', '', '', '']);
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen]);

  // Focus first input on open
  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const newDigits = [...digits];
    newDigits[index] = val.slice(-1);
    setDigits(newDigits);
    setErrorMsg('');

    // Advance to next input
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto verify only when all 6 digits are typed
    if (index === 5 && val) {
      const fullOtp = newDigits.join('');
      handleVerify(fullOtp);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      const splitted = pasteData.split('');
      setDigits(splitted);
      handleVerify(pasteData);
    }
  };

  const handleVerify = async (otpToVerify: string) => {
    const cleanEntered = (otpToVerify || '').trim();

    if (!cleanEntered || cleanEntered.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');

    try {
      const result = await verifyMobileOtp(mobile, cleanEntered);

      setIsVerifying(false);

      if (result.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onVerified();
        }, 900);
      } else {
        setErrorMsg(
          result.error ||
            '❌ Incorrect OTP. Please check your mobile inbox and enter the exact 6-digit code.'
        );
        setDigits(['', '', '', '', '', '']);
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }
    } catch {
      setIsVerifying(false);
      setErrorMsg('Verification failed. Please try again.');
    }
  };

  const handleManualVerify = () => {
    const fullOtp = digits.join('');
    if (fullOtp.length < 6) {
      setErrorMsg('Please enter all 6 digits of the OTP.');
      return;
    }
    handleVerify(fullOtp);
  };

  const handleResend = () => {
    if (!canResend) return;
    setDigits(['', '', '', '', '', '']);
    setTimer(30);
    setCanResend(false);
    setErrorMsg('');
    onResendOtp();
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-800 to-green-700 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0">
              <Smartphone className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-200 bg-white/10 px-2 py-0.5 rounded-full mb-1">
                <ShieldCheck className="w-3 h-3 text-emerald-300" /> Mobile SMS Verification
              </div>
              <h3 className="text-xl font-bold">
                {actionType === 'register' ? 'Verify Mobile & Register' : 'Verify Login OTP'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isSuccess ? (
            <div className="py-6 text-center space-y-3 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-gray-900">Mobile Verified Successfully!</h4>
              <p className="text-xs text-gray-500">
                {actionType === 'register'
                  ? 'Registration complete! Redirecting to your dashboard...'
                  : 'Login authenticated! Loading your profile...'}
              </p>
            </div>
          ) : (
            <>
              {/* Recipient Notice */}
              <div className="text-center space-y-1.5">
                <p className="text-xs text-gray-500">
                  We have sent an SMS with a 6-digit verification code to
                </p>
                <p className="text-base font-extrabold text-gray-900 tracking-wide">
                  {cleanMobileDigits ? `+91 ${cleanMobileDigits}` : (mobile || 'Your Registered Mobile')}
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-[11px] font-semibold border border-emerald-200/60">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span>Delivered to your mobile inbox via SMS</span>
                </div>
              </div>

              {/* 6 Digit Inputs */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 text-center">
                  Enter 6-digit OTP from your mobile inbox:
                </label>
                <div className="flex justify-between gap-2 max-w-xs mx-auto" onPaste={handlePaste}>
                  {digits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className={`w-11 h-13 text-center text-xl font-bold rounded-xl border-2 transition-all focus:outline-hidden ${
                        errorMsg
                          ? 'border-rose-400 bg-rose-50/50 text-rose-900 ring-2 ring-rose-400/20'
                          : digit
                          ? 'border-emerald-600 bg-emerald-50/40 text-emerald-950 ring-2 ring-emerald-500/20'
                          : 'border-gray-200 bg-gray-50/50 text-gray-900 focus:border-emerald-600 focus:bg-white'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold text-center animate-in shake duration-200 leading-snug">
                  {errorMsg}
                </div>
              )}

              {/* Resend & Timer */}
              <div className="flex items-center justify-between text-xs pt-1 px-1">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="font-bold text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Resend SMS OTP</span>
                  </button>
                ) : (
                  <span className="text-gray-400 font-medium">
                    Resend SMS in <strong className="text-gray-700">{timer}s</strong>
                  </span>
                )}

                <span className="text-[11px] text-gray-400">Valid for 10 mins</span>
              </div>

              {/* Action Button */}
              <button
                type="button"
                disabled={isVerifying}
                onClick={handleManualVerify}
                className="w-full py-3 bg-[#0e6834] hover:bg-[#0b542a] text-white rounded-xl text-sm font-bold shadow-xs transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-70 cursor-pointer"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Verify &amp; Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Demonstration Sandbox Mode (Active when no paid SMS gateway configured) */}
              {expectedOtp && (
                <div className="pt-3 border-t border-gray-100">
                  <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 font-bold text-[11px] text-amber-900 uppercase tracking-wide">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        Demo Sandbox (Zero SMS Cost)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const splitted = expectedOtp.split('');
                          setDigits(splitted);
                          setErrorMsg('');
                          handleVerify(expectedOtp);
                        }}
                        className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition shadow-xs active:scale-95 cursor-pointer"
                      >
                        Auto-Fill &amp; Verify
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-amber-200/60">
                      <span className="text-amber-800 font-medium">Demo OTP Code:</span>
                      <code className="bg-amber-100/90 px-2 py-0.5 rounded font-mono font-extrabold text-amber-950 tracking-widest text-sm">
                        {expectedOtp}
                      </code>
                    </div>
                    <p className="text-[10px] text-amber-700/80 leading-tight">
                      For live carrier SMS to phone inboxes, configure Twilio Verify in <code>.env</code>.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
