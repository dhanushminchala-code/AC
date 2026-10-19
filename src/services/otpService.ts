export interface SendOtpResult {
  success: boolean;
  message: string;
  mobile?: string;
  gateway?: string;
  error?: string;
  devOtp?: string;
  mode?: 'demo' | 'sms';
}

export interface VerifyOtpResult {
  success: boolean;
  message?: string;
  error?: string;
  mode?: 'demo' | 'sms';
}

export async function requestMobileOtp(mobile: string): Promise<SendOtpResult> {
  const cleanMobile = mobile.replace(/\\D/g, '').slice(-10);
  if (cleanMobile.length !== 10) {
    return { success: false, message: 'Please enter a valid 10-digit mobile number.', error: 'Invalid mobile number' };
  }

  try {
    const res = await fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: cleanMobile }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      return { success: false, message: data.error || 'Could not send OTP.', error: data.error || 'Could not send OTP.' };
    }
    return data as SendOtpResult;
  } catch (err) {
    console.error('OTP backend unavailable; refusing to generate a client-side OTP.', err);
    return { success: false, message: 'OTP service is unavailable. No code was generated.', error: 'Cannot reach the OTP server. Please try again.' };
  }
}

export async function verifyMobileOtp(mobile: string, enteredOtp: string): Promise<VerifyOtpResult> {
  const cleanMobile = mobile.replace(/\\D/g, '').slice(-10);
  const cleanEntered = enteredOtp.trim();
  if (!/^\\d{6}$/.test(cleanEntered)) {
    return { success: false, error: 'Please enter all six digits of the verification code.' };
  }

  try {
    const res = await fetch('/api/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: cleanMobile, otp: cleanEntered }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'OTP verification failed.', mode: data.mode };
    }
    return data as VerifyOtpResult;
  } catch (err) {
    console.error('OTP backend unavailable; refusing local OTP verification.', err);
    return { success: false, error: 'Cannot reach the verification server. Please try again.' };
  }
}
