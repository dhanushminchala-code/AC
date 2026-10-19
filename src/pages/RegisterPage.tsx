import React, { useState } from 'react';
import { Role, UserProfile } from '../types';
import { User, Building, Check, ArrowRight, ArrowLeft, Smartphone, ShieldCheck } from 'lucide-react';
import { OtpVerificationModal } from '../components/OtpVerificationModal';
import { requestMobileOtp } from '../services/otpService';

interface RegisterPageProps {
  onRegisterSuccess: (userProfile: UserProfile) => void;
  onNavigateToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onRegisterSuccess,
  onNavigateToLogin,
}) => {
  const [step, setStep] = useState<number>(1);
  const [userCategory, setUserCategory] = useState<'individual' | 'institutional'>('individual');
  const [regType, setRegType] = useState<'Farmer' | 'Buyer'>('Farmer');
  const [state, setState] = useState('Andhra Pradesh');
  const [apmc, setApmc] = useState('Vijayawada APMC');

  // Step 2
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');

  // Step 3
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 4
  const [termsAgreed, setTermsAgreed] = useState(false);

  // OTP Verification state
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [validationError, setValidationError] = useState('');

  const createAndSendOtp = async () => {
    const res = await requestMobileOtp(mobileNumber);
    if (res.devOtp) {
      setGeneratedOtp(res.devOtp);
    }
    setShowOtpModal(true);
    return res;
  };

  const handleGoToStep3 = () => {
    if (!fullName.trim()) {
      setValidationError('Please enter your Full Name.');
      return;
    }
    if (!mobileNumber.trim() || mobileNumber.trim().length < 10) {
      setValidationError('Please enter a valid 10-digit Mobile Number.');
      return;
    }
    setValidationError('');
    setStep(3);
  };

  const handleGoToStep4 = () => {
    if (!username.trim()) {
      setValidationError('Please choose a Username.');
      return;
    }
    if (!password.trim() || password.length < 4) {
      setValidationError('Please enter a password (min 4 characters).');
      return;
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }
    setValidationError('');
    setStep(4);
  };

  const handleCompleteClick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAgreed) {
      setValidationError('Please check the box to agree to the Terms and Conditions before completing registration.');
      return;
    }
    setValidationError('');
    await createAndSendOtp();
  };

  const handleOtpVerified = () => {
    setShowOtpModal(false);

    const role: Role = regType.toLowerCase() === 'buyer' ? 'buyer' : 'farmer';
    const profile: UserProfile = {
      name: fullName.trim() || (role === 'buyer' ? 'Buyer Account' : 'Farmer Account'),
      mobile: mobileNumber.trim(),
      email: emailAddress.trim(),
      role,
      apmc,
      state,
      isLoggedIn: true,
    };

    try {
      localStorage.setItem('agriconnect_registered_user', JSON.stringify(profile));
      localStorage.setItem('agriconnect_user', JSON.stringify(profile));

      // Append/update in multi-user directory
      const listStr = localStorage.getItem('agriconnect_registered_users_list');
      const list: UserProfile[] = listStr ? JSON.parse(listStr) : [];
      const updatedList = list.filter(
        (u) => u.mobile !== profile.mobile && u.name.toLowerCase() !== profile.name.toLowerCase()
      );
      updatedList.push(profile);
      localStorage.setItem('agriconnect_registered_users_list', JSON.stringify(updatedList));
    } catch {}

    onRegisterSuccess(profile);
  };

  return (
    <div className="min-h-[82vh] bg-white flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* OTP Verification Modal */}
      <OtpVerificationModal
        isOpen={showOtpModal}
        mobile={mobileNumber}
        expectedOtp={generatedOtp}
        actionType="register"
        onVerified={handleOtpVerified}
        onResendOtp={createAndSendOtp}
        onClose={() => setShowOtpModal(false)}
      />

      <div className="max-w-2xl w-full space-y-8">
        {/* Header with Title and Stepper */}
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-extrabold text-[#1b5e20] tracking-tight">Register</h2>

          {/* Stepper counter & dots */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-500">{step}/4</span>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center">
                  <span
                    className={`w-3.5 h-3.5 rounded-full border transition-all ${
                      s < step
                        ? 'border-emerald-600 bg-emerald-600'
                        : s === step
                        ? 'border-emerald-600 bg-white ring-2 ring-emerald-600/30'
                        : 'border-gray-300 bg-gray-200'
                    }`}
                  />
                  {s < 4 && (
                    <span
                      className={`w-6 h-0.5 ${
                        s < step ? 'bg-emerald-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Type Toggle */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setUserCategory('individual')}
            className={`px-5 py-2.5 rounded-full border text-xs sm:text-sm font-semibold flex items-center gap-2 transition ${
              userCategory === 'individual'
                ? 'border-[#2e7d32] bg-[#f1f8e9] text-[#1b5e20] ring-1 ring-[#2e7d32]'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span
              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                userCategory === 'individual' ? 'border-[#2e7d32]' : 'border-gray-400'
              }`}
            >
              {userCategory === 'individual' && (
                <span className="w-2 h-2 rounded-full bg-[#2e7d32]" />
              )}
            </span>
            <User className="w-3.5 h-3.5" />
            <span>Individual User</span>
          </button>

          <button
            type="button"
            onClick={() => setUserCategory('institutional')}
            className={`px-5 py-2.5 rounded-full border text-xs sm:text-sm font-semibold flex items-center gap-2 transition ${
              userCategory === 'institutional'
                ? 'border-[#2e7d32] bg-[#f1f8e9] text-[#1b5e20] ring-1 ring-[#2e7d32]'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span
              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                userCategory === 'institutional' ? 'border-[#2e7d32]' : 'border-gray-400'
              }`}
            >
              {userCategory === 'institutional' && (
                <span className="w-2 h-2 rounded-full bg-[#2e7d32]" />
              )}
            </span>
            <Building className="w-3.5 h-3.5" />
            <span>Institutional User</span>
          </button>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-base font-bold text-gray-900 mb-6">
            {step === 1 && 'Registration Details'}
            {step === 2 && 'Personal Details'}
            {step === 3 && 'Account Details'}
            {step === 4 && 'Confirm Registration'}
          </h3>

          {validationError && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
              <span className="text-base shrink-0">⚠️</span>
              <span>{validationError}</span>
            </div>
          )}

          {/* STEP 1: Registration Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Registration Type *
                  </label>
                  <select
                    value={regType}
                    onChange={(e) => setRegType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#2e7d32] focus:outline-hidden"
                  >
                    <option value="Farmer">Farmer</option>
                    <option value="Buyer">Buyer</option>
                  </select>
                </div>

                {regType === 'Buyer' ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Registered State *
                      </label>
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#2e7d32] focus:outline-hidden"
                      >
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Karnataka">Karnataka</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Registered APMC *
                      </label>
                      <select
                        value={apmc}
                        onChange={(e) => setApmc(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#2e7d32] focus:outline-hidden"
                      >
                        <option value="Vijayawada APMC">Vijayawada APMC</option>
                        <option value="Guntur APMC">Guntur APMC</option>
                        <option value="Tenali APMC">Tenali APMC</option>
                        <option value="Nellore APMC">Nellore APMC</option>
                        <option value="Eluru APMC">Eluru APMC</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Registered APMC *
                    </label>
                    <select
                      value={apmc}
                      onChange={(e) => setApmc(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#2e7d32] focus:outline-hidden"
                    >
                      <option value="Vijayawada APMC">Vijayawada APMC</option>
                      <option value="Guntur APMC">Guntur APMC</option>
                      <option value="Tenali APMC">Tenali APMC</option>
                      <option value="Nellore APMC">Nellore APMC</option>
                      <option value="Eluru APMC">Eluru APMC</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-8 py-2.5 bg-[#0e6834] hover:bg-[#0b542a] text-white rounded-lg text-sm font-bold shadow-xs transition"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Personal Details */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your Full Name"
                    required
                    className="w-full px-3.5 py-2.5 bg-[#eef4ff] border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#2e7d32] focus:outline-hidden transition placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Mobile Number (will receive OTP) *
                  </label>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="Enter 10-digit Mobile Number"
                    maxLength={10}
                    required
                    className="w-full px-3.5 py-2.5 bg-[#eef4ff] border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#2e7d32] focus:outline-hidden transition font-medium placeholder:text-gray-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="Enter Email Address (e.g. name@example.com)"
                    required
                    className="w-full px-3.5 py-2.5 bg-[#eef4ff] border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#2e7d32] focus:outline-hidden transition placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-semibold transition"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-8 py-2.5 bg-[#0e6834] hover:bg-[#0b542a] text-white rounded-lg text-sm font-bold shadow-xs transition"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Account Details */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username (e.g. ramu_farmer)"
                    required
                    className="w-full px-3.5 py-2.5 bg-[#eef4ff] border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#2e7d32] focus:outline-hidden transition placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (min 4 characters)"
                    required
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#2e7d32] focus:outline-hidden placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#2e7d32] focus:outline-hidden placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-semibold transition"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-8 py-2.5 bg-[#0e6834] hover:bg-[#0b542a] text-white rounded-lg text-sm font-bold shadow-xs transition"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Confirm Registration & OTP Verification */}
          {step === 4 && (
            <div className="space-y-6">
              <p className="text-xs text-gray-500">
                Please verify your details before completing registration. A verification OTP will be sent to your mobile.
              </p>

              {/* Review Card matching screenshot */}
              <div className="p-6 bg-slate-50/70 border border-gray-200 rounded-2xl space-y-3 text-xs sm:text-sm">
                <div className="grid grid-cols-12 gap-2">
                  <span className="col-span-4 font-bold text-gray-900">Name:</span>
                  <span className="col-span-8 text-gray-700">{fullName}</span>
                </div>
                <div className="grid grid-cols-12 gap-2">
                  <span className="col-span-4 font-bold text-gray-900">Mobile:</span>
                  <span className="col-span-8 text-gray-700 flex items-center gap-1.5 font-semibold">
                    <span>{mobileNumber}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      OTP will be sent here
                    </span>
                  </span>
                </div>
                <div className="grid grid-cols-12 gap-2">
                  <span className="col-span-4 font-bold text-gray-900">Email:</span>
                  <span className="col-span-8 text-gray-700">{emailAddress}</span>
                </div>
                <div className="grid grid-cols-12 gap-2">
                  <span className="col-span-4 font-bold text-gray-900">Registration Type:</span>
                  <span className="col-span-8 text-gray-700 font-semibold">{regType}</span>
                </div>
                <div className="grid grid-cols-12 gap-2">
                  <span className="col-span-4 font-bold text-gray-900">Registered APMC:</span>
                  <span className="col-span-8 text-gray-700">{apmc}</span>
                </div>
              </div>

              {/* Terms checkbox */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="agreeTerms" className="text-xs font-semibold text-gray-700 select-none cursor-pointer">
                  I agree to the Terms and Conditions
                </label>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-semibold transition"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleCompleteClick}
                  className="px-8 py-2.5 bg-[#0e6834] hover:bg-[#0b542a] text-white rounded-lg text-sm font-bold shadow-xs transition flex items-center gap-2 active:scale-98"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Get Mobile OTP &amp; Complete</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Login Link */}
        <div className="text-center pt-2">
          <p className="text-sm text-gray-600">
            Already registered?{' '}
            <button
              onClick={onNavigateToLogin}
              className="text-[#1b5e20] font-semibold underline hover:text-emerald-900"
            >
              Login Here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
