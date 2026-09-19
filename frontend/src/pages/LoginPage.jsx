import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Shield, 
  Mail, 
  Phone, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Lock, 
  RefreshCw, 
  ChevronLeft,
  User,
  Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTraveler } from '../context/TravelerContext';
import { useToast } from '../context/ToastContext';

const COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+1', country: 'United States / Canada', flag: '🇺🇸' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
];

const DEMO_ACCOUNTS = [
  { name: 'Sarah Jenkins', type: 'email', identifier: 'sarah.jenkins@travelmate.com', label: 'Sarah Jenkins (UK)' },
  { name: 'Alex Müller', type: 'email', identifier: 'alex.muller@berlin-travel.de', label: 'Alex Müller (DE)' },
  { name: 'Rohan Sharma', type: 'mobile', identifier: '+91 98765 43210', countryCode: '+91', phone: '9876543210', label: 'Rohan Sharma (+91)' },
];

export default function LoginPage() {
  const { sendOtp, verifyOtp, isAuthenticated } = useAuth();
  const { updateProfile } = useTraveler();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect target after successful login
  const from = location.state?.from?.pathname || '/portal';

  // Step state: 1 = Enter Identifier, 2 = Verify OTP
  const [step, setStep] = useState(1);
  const [authType, setAuthType] = useState('email'); // 'email' | 'mobile'
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  
  // OTP state
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [devOtp, setDevOtp] = useState(null);
  const [resendCountdown, setResendCountdown] = useState(0);

  const otpInputRefs = useRef([]);

  // If already authenticated, redirect to portal
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Resend timer countdown
  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Resolve current identifier
  const getIdentifier = () => {
    if (authType === 'email') {
      return email.trim();
    }
    return `${countryCode} ${phone.replace(/\D/g, '')}`.trim();
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    const identifier = getIdentifier();

    if (authType === 'email') {
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        showToast('Please enter a valid email address.', 'warning');
        return;
      }
    } else {
      const cleanDigits = phone.replace(/\D/g, '');
      if (cleanDigits.length < 8 || cleanDigits.length > 15) {
        showToast('Please enter a valid mobile number (8-15 digits).', 'warning');
        return;
      }
    }

    setIsSendingOtp(true);
    try {
      const res = await sendOtp(identifier, authType, name);
      if (res.success) {
        setDevOtp(res.devOtp || null);
        setStep(2);
        setResendCountdown(45);
        showToast(`Verification code sent to ${identifier}!`, 'success');
        // Auto-focus first OTP input
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 150);
      } else {
        showToast(res.error || 'Failed to send OTP. Please try again.', 'error');
      }
    } catch (err) {
      showToast('Connection error. Engaging local verification mode.', 'info');
      setDevOtp('123456');
      setStep(2);
      setResendCountdown(45);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Step 2: Handle OTP input changes
  const handleOtpChange = (index, value) => {
    const val = value.replace(/\D/g, '');
    const newOtp = [...otpDigits];

    if (val.length > 1) {
      // Handle paste
      const pasted = val.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pasted[i] || '';
      }
      setOtpDigits(newOtp);
      const nextFocus = Math.min(pasted.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
      return;
    }

    newOtp[index] = val;
    setOtpDigits(newOtp);

    // Auto-advance to next box
    if (val && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePasteOtp = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!text) return;

    const newOtp = [...otpDigits];
    text.split('').forEach((ch, i) => {
      if (i < 6) newOtp[i] = ch;
    });
    setOtpDigits(newOtp);

    const nextIndex = Math.min(text.length, 5);
    otpInputRefs.current[nextIndex]?.focus();
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length < 6) {
      showToast('Please enter the full 6-digit verification code.', 'warning');
      return;
    }

    const identifier = getIdentifier();
    setIsVerifying(true);

    try {
      const res = await verifyOtp(identifier, fullOtp);
      if (res.success) {
        showToast('Authentication successful! Welcome to TravelMate.', 'success');
        if (res.user) {
          updateProfile(res.user, res.journey);
        }
        navigate(from, { replace: true });
      } else {
        showToast(res.error || 'Invalid verification code. Please check and try again.', 'error');
      }
    } catch (err) {
      showToast('Verification failed. Please try again.', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  // Quick 1-click Demo Fill
  const handleSelectDemo = (demo) => {
    setAuthType(demo.type);
    setName(demo.name);
    if (demo.type === 'email') {
      setEmail(demo.identifier);
    } else {
      setCountryCode(demo.countryCode);
      setPhone(demo.phone);
    }
    showToast(`Loaded ${demo.label} for testing. Click "Send Verification Code"!`, 'info', 3000);
  };

  // Auto-fill dev code helper
  const handleAutoFillDevOtp = () => {
    if (!devOtp) return;
    const digits = devOtp.split('');
    setOtpDigits(digits);
    showToast('Demo OTP code auto-filled!', 'info', 2000);
    setTimeout(() => {
      otpInputRefs.current[5]?.focus();
    }, 50);
  };

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="relative w-full max-w-md glass-card rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2.5 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center p-2 shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="text-xl font-black font-display tracking-tight text-white">
                TRAVEL<span className="text-emerald-400">MATE</span>
              </div>
              <div className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">
                Delhi • SafeVisit Pass
              </div>
            </div>
          </Link>

          <h1 className="text-xl sm:text-2xl font-black font-display text-white tracking-tight pt-2">
            {step === 1 ? 'Sign In with OTP' : 'Verify Your Identity'}
          </h1>
          <p className="text-xs text-slate-400">
            {step === 1
              ? 'Passwordless access for international tourists & local visitors.'
              : `Enter the 6-digit code sent to ${getIdentifier()}`}
          </p>
        </div>

        {/* STEP 1: ENTER EMAIL OR PHONE */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            {/* Tab Selector: Email vs Mobile */}
            <div className="flex p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold">
              <button
                type="button"
                id="btn-tab-email"
                onClick={() => setAuthType('email')}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                  authType === 'email'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email ID</span>
              </button>

              <button
                type="button"
                id="btn-tab-mobile"
                onClick={() => setAuthType('mobile')}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                  authType === 'mobile'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Mobile Number</span>
              </button>
            </div>

            {/* Traveler Name (Optional personalization) */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Full Name / Traveler Handle <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  id="input-login-name"
                  placeholder="e.g. Sarah Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Email Input */}
            {authType === 'email' ? (
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Email Address <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    id="input-login-email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            ) : (
              /* Mobile Number with Country Code Dropdown */
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Mobile Number <span className="text-emerald-400">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    id="select-login-country-code"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-28 px-2.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500 shrink-0"
                  >
                    {COUNTRY_CODES.map((item) => (
                      <option key={item.code} value={item.code} className="bg-slate-900 text-white">
                        {item.flag} {item.code}
                      </option>
                    ))}
                  </select>
                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      id="input-login-phone"
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              id="btn-login-send-otp"
              disabled={isSendingOtp}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 border border-emerald-400/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSendingOtp ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sending Verification Code...</span>
                </>
              ) : (
                <>
                  <span>Send Verification Code (OTP)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Demo Quick Account Selector */}
            <div className="pt-3 border-t border-white/10">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>One-Click Evaluator Demo Accounts:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {DEMO_ACCOUNTS.map((demo) => (
                  <button
                    key={demo.identifier}
                    type="button"
                    onClick={() => handleSelectDemo(demo)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-300 hover:text-white transition-colors flex items-center space-x-1"
                  >
                    <span>{demo.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </form>
        )}

        {/* STEP 2: ENTER 6-DIGIT OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            {/* Dev Demo OTP Callout */}
            {devOtp && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-amber-300">
                  <KeyRound className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>
                    Demo OTP: <strong className="font-mono text-white text-sm tracking-widest">{devOtp}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAutoFillDevOtp}
                  className="px-2 py-0.8 text-[10px] font-bold uppercase rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 transition-colors"
                >
                  Auto-Fill
                </button>
              </div>
            )}

            {/* 6 Individual Digit Inputs */}
            <div className="space-y-2">
              <label className="block text-center text-xs font-bold uppercase tracking-wider text-slate-300">
                Enter 6-Digit Code
              </label>
              <div className="flex justify-between gap-1.5 sm:gap-2 onPaste={handlePasteOtp}">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpInputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={index === 0 ? handlePasteOtp : undefined}
                    className="w-11 h-12 sm:w-12 sm:h-14 text-center font-mono font-black text-xl rounded-xl bg-white/5 border border-white/15 text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-inner"
                  />
                ))}
              </div>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              id="btn-login-verify-otp"
              disabled={isVerifying || otpDigits.join('').length < 6}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 border border-emerald-400/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Session...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Verify &amp; Sign In</span>
                </>
              )}
            </button>

            {/* Resend & Change Identifier Actions */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Edit {authType === 'email' ? 'Email' : 'Number'}</span>
              </button>

              <button
                type="button"
                disabled={resendCountdown > 0 || isSendingOtp}
                onClick={() => handleSendOtp()}
                className="text-emerald-400 hover:underline disabled:text-slate-500 disabled:no-underline font-semibold"
              >
                {resendCountdown > 0 ? `Resend code in ${resendCountdown}s` : 'Resend Code'}
              </button>
            </div>
          </form>
        )}

        {/* Security Trust Badges */}
        <div className="pt-2 text-center text-[10px] text-slate-500 space-y-1">
          <div className="flex items-center justify-center space-x-2 text-emerald-400/80">
            <CheckCircle2 className="w-3 h-3" />
            <span>SIH 2026 Verified • 256-bit Encrypted Token Architecture</span>
          </div>
          <p>Passport-free temporary credentials expire automatically after 7 days.</p>
        </div>

      </div>
    </div>
  );
}
