import React, { useState } from 'react';
import { Role, UserProfile } from '../types';
import { Eye, EyeOff, RefreshCw, Smartphone, ShieldCheck } from 'lucide-react';
import { OtpVerificationModal } from '../components/OtpVerificationModal';
import { requestMobileOtp, verifyMobileOtp } from '../services/otpService';

interface LoginPageProps {
  onLoginSuccess: (role: Role, userProfile?: UserProfile) => void;
  onNavigateToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigateToRegister,
}) => {
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [captchaCode, setCaptchaCode] = useState('JMVFB');
  const [captchaInput, setCaptchaInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [statusNotice, setStatusNotice] = useState('');
  const [pendingRole, setPendingRole] = useState<Role>('farmer');

  const generateNewCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput('');
  };

  const createAndSendOtp = async (forMobile: string) => {
    const res = await requestMobileOtp(forMobile);
    setGeneratedOtp(res.success && res.mode === 'demo' ? (res.devOtp || '') : '');
    if (!res.success) {
      setErrorMsg(res.error || res.message || 'Could not send verification code.');
    }
    return res;
  };

  const handleSendOtpClick = async () => {
    if (!identifier.trim()) {
      setErrorMsg('Please enter your Registered Mobile Number or Username');
      return;
    }
    setErrorMsg('');
    const result = await createAndSendOtp(identifier);
    if (result.success) setShowOtpModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMsg('Please enter Registered Mobile / Email / Username');
      return;
    }

    if (loginMode === 'password' && !password.trim()) {
      setErrorMsg('Please enter your password.');
      return;
    }

    // Verify captcha
    if (captchaInput.trim() && captchaInput.trim().toUpperCase() !== captchaCode) {
      setErrorMsg('Incorrect captcha code. Captcha letters are case sensitive.');
      return;
    }

    const detectedRole: Role = identifier.toLowerCase().includes('buyer') ? 'buyer' : 'farmer';
    setPendingRole(detectedRole);

    if (loginMode === 'otp') {
      // If user typed OTP directly in the form input
      if (otpInput.trim()) {
        const verifyRes = await verifyMobileOtp(identifier, otpInput.trim());
        if (!verifyRes.success) {
          setErrorMsg(
            verifyRes.error ||
              `❌ Incorrect OTP! "${otpInput}" is invalid. Please check your mobile inbox and enter the exact code.`
          );
          return;
        }
        completeLogin(detectedRole);
        return;
      }

      // If OTP input is empty, dispatch OTP and open verification modal only on success.
      const sendResult = await createAndSendOtp(identifier);
      if (sendResult.success) setShowOtpModal(true);
    } else {
      // Password mode: Verify credentials via strict mobile OTP
      const sendResult = await createAndSendOtp(identifier);
      if (sendResult.success) setShowOtpModal(true);
    }
  };

  const [customName, setCustomName] = useState('');

  const completeLogin = (roleToSet: Role, overrideName?: string) => {
    const isBuyer = roleToSet === 'buyer';

    // Retrieve registered profile matching identifier if available
    let storedUser: UserProfile | null = null;
    try {
      const listStr = localStorage.getItem('agriconnect_registered_users_list');
      const list: UserProfile[] = listStr ? JSON.parse(listStr) : [];
      const single = localStorage.getItem('agriconnect_registered_user');
      if (single) {
        list.push(JSON.parse(single));
      }
      const cleanId = identifier.trim().toLowerCase();
      storedUser = list.find(
        (u) =>
          (u.mobile && u.mobile.toLowerCase() === cleanId) ||
          (u.email && u.email.toLowerCase() === cleanId) ||
          (u.name && u.name.toLowerCase() === cleanId)
      ) || null;
    } catch {}

    const resolvedName =
      overrideName?.trim() ||
      customName.trim() ||
      storedUser?.name ||
      (identifier.trim() && !/^\d+$/.test(identifier.trim()) && !identifier.includes('@')
        ? identifier.trim().charAt(0).toUpperCase() + identifier.trim().slice(1)
        : isBuyer
        ? 'Buyer Account'
        : 'Farmer Account');

    const profile: UserProfile = {
      name: resolvedName,
      mobile: storedUser?.mobile || (identifier.match(/\d{10}/)?.[0] || identifier.trim() || ''),
      email: storedUser?.email || (identifier.includes('@') ? identifier.trim() : ''),
      role: storedUser?.role || roleToSet,
      apmc: storedUser?.apmc || (isBuyer ? 'Vijayawada APMC' : 'Tenali APMC'),
      state: storedUser?.state || 'Andhra Pradesh',
      isLoggedIn: true,
    };
    setShowOtpModal(false);
    onLoginSuccess(roleToSet, profile);
  };

  return (
    <div className="min-h-[82vh] bg-white flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* OTP Verification Modal */}
      <OtpVerificationModal
        isOpen={showOtpModal}
        mobile={identifier}
        expectedOtp={generatedOtp}
        actionType="login"
        onVerified={() => completeLogin(pendingRole)}
        onResendOtp={() => createAndSendOtp(identifier)}
        onClose={() => setShowOtpModal(false)}
      />

      <div className="max-w-md w-full space-y-8">
        {/* Title */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-[#1b5e20] tracking-tight">Login</h2>
          <p className="text-xs text-gray-500 mt-1">
            Access live mandi rates, direct buyers & crop listings
          </p>
        </div>

        {/* Tab Toggle: Login with Password vs Login with OTP */}
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setLoginMode('password')}
            className={`px-5 py-2.5 rounded-full border text-xs sm:text-sm font-semibold flex items-center gap-2 transition ${
              loginMode === 'password'
                ? 'border-[#2e7d32] bg-[#f1f8e9] text-[#1b5e20] ring-1 ring-[#2e7d32]'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span
              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                loginMode === 'password' ? 'border-[#2e7d32]' : 'border-gray-400'
              }`}
            >
              {loginMode === 'password' && (
                <span className="w-2 h-2 rounded-full bg-[#2e7d32]" />
              )}
            </span>
            <span>Login with Password</span>
          </button>

          <button
            type="button"
            onClick={() => setLoginMode('otp')}
            className={`px-5 py-2.5 rounded-full border text-xs sm:text-sm font-semibold flex items-center gap-2 transition ${
              loginMode === 'otp'
                ? 'border-[#2e7d32] bg-[#f1f8e9] text-[#1b5e20] ring-1 ring-[#2e7d32]'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span
              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                loginMode === 'otp' ? 'border-[#2e7d32]' : 'border-gray-400'
              }`}
            >
              {loginMode === 'otp' && (
                <span className="w-2 h-2 rounded-full bg-[#2e7d32]" />
              )}
            </span>
            <span>Login with OTP</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-in fade-in">
            {errorMsg}
          </div>
        )}

        {statusNotice && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in">
            <span>{statusNotice}</span>
            <button
              type="button"
              onClick={() => setStatusNotice('')}
              className="text-emerald-700 hover:text-emerald-950 text-xs font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Field 1: Identifier */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Registered Mobile Number / Email Id / Username *
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter Mobile Number / Email / Username"
              required
              className="w-full px-3.5 py-2.5 bg-[#eef4ff] border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#2e7d32] focus:outline-hidden transition font-medium placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
              <span>Your Name (Optional)</span>
              <span className="text-[10px] text-gray-400 font-normal">Auto-detected if registered</span>
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Enter your name (e.g. Ramesh or Priya)"
              className="w-full px-3.5 py-2.5 bg-[#eef4ff] border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#2e7d32] focus:outline-hidden transition placeholder:text-gray-400"
            />
          </div>

          {/* Field 2: Password mode or OTP mode */}
          {loginMode === 'password' ? (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-[#eef4ff] border border-gray-200 rounded-lg text-sm text-gray-900 pr-10 focus:bg-white focus:ring-2 focus:ring-[#2e7d32] focus:outline-hidden transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    if (identifier.trim()) {
                      setErrorMsg('');
                      setStatusNotice(`Password reset instructions sent to ${identifier.trim()}! Please check your mobile/email.`);
                    } else {
                      setErrorMsg('Please enter your Registered Mobile Number or Username first.');
                    }
                  }}
                  className="text-xs font-semibold text-[#1b5e20] hover:underline"
                >
                  Forgot/Set Password?
                </button>
                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> OTP Verified Login
                </span>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-700">
                  Enter OTP *
                </label>
                <button
                  type="button"
                  onClick={handleSendOtpClick}
                  className="text-xs font-bold text-[#1b5e20] hover:underline flex items-center gap-1"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Send OTP to Mobile</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#2e7d32] focus:outline-hidden tracking-widest font-mono"
                />
                <button
                  type="button"
                  onClick={handleSendOtpClick}
                  className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-[#1b5e20] rounded-lg text-xs font-bold shrink-0 border border-emerald-200 transition"
                >
                  Get OTP
                </button>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Click &quot;Get OTP&quot; to receive a 6-digit verification code via SMS.
              </p>
            </div>
          )}

          {/* Captcha Block exactly matching screenshot */}
          <div className="grid grid-cols-12 gap-4 items-center">
            {/* Distorted Captcha graphic box */}
            <div className="col-span-5 text-center">
              <div className="h-14 bg-white border border-gray-300 rounded-lg flex items-center justify-center shadow-inner tracking-widest font-mono text-xl font-bold select-none text-slate-800">
                {captchaCode}
              </div>
              <button
                type="button"
                onClick={generateNewCaptcha}
                className="text-xs font-semibold text-[#1b5e20] hover:underline mt-1 inline-block"
              >
                Generate New
              </button>
            </div>

            {/* Captcha Input */}
            <div className="col-span-7">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Enter the shown Captcha *
              </label>
              <input
                type="text"
                placeholder="Enter Captcha"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#2e7d32] focus:outline-hidden"
              />
              <p className="text-[10px] text-gray-500 mt-1">Captcha letters are case sensitive</p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 px-4 bg-[#5b9570] hover:bg-[#487a5b] text-white rounded-lg text-base font-bold shadow-xs transition active:scale-98 flex items-center justify-center gap-2"
          >
            <span>Login &amp; Verify OTP</span>
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="text-center pt-2">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <button
              onClick={onNavigateToRegister}
              className="text-[#1b5e20] font-semibold underline hover:text-emerald-900"
            >
              Sign Up Now
            </button>
          </p>
        </div>

        {/* Quick Demo Shortcuts */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-center gap-3 text-xs text-gray-500">
          <span>Quick Demo Login:</span>
          <button
            type="button"
            onClick={() => completeLogin('farmer')}
            className="px-2.5 py-1 bg-emerald-50 text-emerald-800 font-semibold rounded-md hover:bg-emerald-100"
          >
            Farmer Login
          </button>
          <button
            type="button"
            onClick={() => completeLogin('buyer')}
            className="px-2.5 py-1 bg-blue-50 text-blue-800 font-semibold rounded-md hover:bg-blue-100"
          >
            Buyer Login
          </button>
        </div>
      </div>
    </div>
  );
};
