import React, { useState, useEffect, useRef } from 'react';
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
  X,
  ChevronLeft,
  User,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTraveler } from '../../context/TravelerContext';
import { useToast } from '../../context/ToastContext';

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

export default function AuthModal({ isOpen, onClose, onSuccess, initialType = 'email' }) {
  const { sendOtp, verifyOtp } = useAuth();
  const { updateProfile } = useTraveler();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [authType, setAuthType] = useState(initialType);
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');

  // OTP State
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [devOtp, setDevOtp] = useState(null);
  const [gatewayInfo, setGatewayInfo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [otpExpiryCountdown, setOtpExpiryCountdown] = useState(300); // 5 minutes

  const otpInputRefs = useRef([]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setOtpDigits(['', '', '', '', '', '']);
      setDevOtp(null);
      setGatewayInfo(null);
      setPreviewUrl(null);
      setResendCountdown(0);
      setOtpExpiryCountdown(300);
    }
  }, [isOpen]);

  // Resend countdown timer (45s)
  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // 5-Minute OTP Expiry Countdown (300s)
  useEffect(() => {
    let timer;
    if (step === 2 && otpExpiryCountdown > 0) {
      timer = setTimeout(() => setOtpExpiryCountdown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, otpExpiryCountdown]);

  if (!isOpen) return null;

  const getIdentifier = () => {
    if (authType === 'email') {
      return email.trim();
    }
    return `${countryCode} ${phone.replace(/\D/g, '')}`.trim();
  };

  const formatExpiryTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

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
        setGatewayInfo(res.gateway || null);
        setPreviewUrl(res.previewUrl || null);
        setStep(2);
        setResendCountdown(45);
        setOtpExpiryCountdown(res.expiresInSeconds || 300);
        showToast(res.message || `Verification code sent to ${identifier}!`, 'success');
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 150);
      } else {
        showToast(res.error || 'Failed to send OTP. Please try again.', 'error');
      }
    } catch (err) {
      showToast('Engaging local verification mode.', 'info');
      setDevOtp('123456');
      setStep(2);
      setResendCountdown(45);
      setOtpExpiryCountdown(300);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const val = value.replace(/\D/g, '');
    const newOtp = [...otpDigits];

    if (val.length > 1) {
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

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length < 6) {
      showToast('Please enter the full 6-digit verification code.', 'warning');
      return;
    }

    if (otpExpiryCountdown === 0) {
      showToast('This verification code has expired. Please request a new code.', 'error');
      return;
    }

    const identifier = getIdentifier();
    setIsVerifying(true);

    try {
      const res = await verifyOtp(identifier, fullOtp);
      if (res.success) {
        showToast('Authentication successful! SafeVisit pass activated.', 'success');
        if (res.user) {
          updateProfile(res.user, res.journey);
        }
        if (onSuccess) {
          onSuccess(res.user, res.journey);
        }
        onClose();
      } else {
        showToast(res.error || 'Invalid verification code. Please check and try again.', 'error');
      }
    } catch (err) {
      showToast('Verification failed. Please try again.', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSelectDemo = (demo) => {
    setAuthType(demo.type);
    setName(demo.name);
    if (demo.type === 'email') {
      setEmail(demo.identifier);
    } else {
      setCountryCode(demo.countryCode);
      setPhone(demo.phone);
    }
    showToast(`Loaded ${demo.label} for testing. Click "Send Code"!`, 'info', 2500);
  };

  const handleAutoFillDevOtp = () => {
    if (!devOtp) return;
    setOtpDigits(devOtp.split(''));
    showToast('Demo OTP code auto-filled!', 'info', 1800);
    setTimeout(() => {
      otpInputRefs.current[5]?.focus();
    }, 50);
  };

  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md glass-card rounded-3xl p-6 sm:p-7 border border-white/20 shadow-2xl space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          id="btn-close-auth-modal"
          aria-label="Close Authentication Modal"
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="inline-flex items-center justify-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-base font-black font-display text-white tracking-tight leading-none">
                TRAVEL<span className="text-emerald-400">MATE</span>
              </div>
              <div className="text-[9px] font-bold text-emerald-300 uppercase tracking-widest">
                SafeVisit Pass Security
              </div>
            </div>
          </div>

          <h2 className="text-lg sm:text-xl font-black font-display text-white tracking-tight">
            {step === 1 ? 'Verify Your Identity' : 'Enter Verification Code'}
          </h2>
          <p className="text-xs text-slate-400">
            {step === 1
              ? 'Passwordless OTP verification via official SMS or Email gateway.'
              : `6-digit security code dispatched to ${getIdentifier()}`}
          </p>
        </div>

        {/* STEP 1: Enter Identifier */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            {/* Tab Selector */}
            <div className="flex p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold">
              <button
                type="button"
                id="btn-modal-tab-email"
                onClick={() => setAuthType('email')}
                className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                  authType === 'email'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email ID</span>
              </button>

              <button
                type="button"
                id="btn-modal-tab-mobile"
                onClick={() => setAuthType('mobile')}
                className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                  authType === 'mobile'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Mobile Number</span>
              </button>
            </div>

            {/* Name Input */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300">
                Full Name / Traveler Handle <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Email or Phone Input */}
            {authType === 'email' ? (
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  Email Address <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    id="input-modal-email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  Mobile Number <span className="text-emerald-400">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-24 px-2 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500 shrink-0"
                  >
                    {COUNTRY_CODES.map((item) => (
                      <option key={item.code} value={item.code} className="bg-slate-900 text-white">
                        {item.flag} {item.code}
                      </option>
                    ))}
                  </select>
                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      id="input-modal-phone"
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              id="btn-modal-send-otp"
              disabled={isSendingOtp}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 border border-emerald-400/30 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isSendingOtp ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Dispatching via Gateway...</span>
                </>
              ) : (
                <>
                  <span>Send 6-Digit Code</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            {/* Demo Quick Accounts */}
            <div className="pt-2 border-t border-white/10">
              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Quick Evaluation Profiles:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {DEMO_ACCOUNTS.map((demo) => (
                  <button
                    key={demo.identifier}
                    type="button"
                    onClick={() => handleSelectDemo(demo)}
                    className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-slate-300 hover:text-white transition-colors"
                  >
                    {demo.label}
                  </button>
                ))}
              </div>
            </div>
          </form>
        )}

        {/* STEP 2: Verify 6-Digit OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {/* Gateway Dispatch Badge & Live Preview Link */}
            <div className="space-y-2">
              {gatewayInfo && (
                <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-[11px] text-emerald-300">
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Gateway: <strong>{gatewayInfo}</strong></span>
                  </div>
                </div>
              )}

              {/* Clickable Ethereal Live Web Preview Link */}
              {previewUrl && (
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="btn-open-email-preview-modal"
                  className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-400/40 text-indigo-300 text-xs font-bold transition-all hover:scale-[1.01]"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Open Sent Email (Ethereal Web Preview)</span>
                </a>
              )}

              {/* Demo OTP Helper */}
              {devOtp && (
                <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
                  <div className="flex items-center space-x-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    <span>Demo OTP: <strong className="font-mono text-white text-sm">{devOtp}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFillDevOtp}
                    className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}
            </div>

            {/* 6 Digit Inputs */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <label className="font-bold uppercase tracking-wider text-slate-300">
                  Enter 6-Digit Code
                </label>
                {/* 5-Minute Countdown */}
                <div className={`flex items-center space-x-1 font-mono font-bold ${
                  otpExpiryCountdown <= 60 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
                }`}>
                  <Clock className="w-3 h-3" />
                  <span>
                    {otpExpiryCountdown > 0 ? formatExpiryTime(otpExpiryCountdown) : 'Expired'}
                  </span>
                </div>
              </div>

              <div className="flex justify-between gap-1 sm:gap-1.5">
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
                    className="w-10 h-11 sm:w-11 sm:h-12 text-center font-mono font-black text-lg rounded-xl bg-white/5 border border-white/15 text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-inner"
                  />
                ))}
              </div>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              id="btn-modal-verify-otp"
              disabled={isVerifying || otpDigits.join('').length < 6 || otpExpiryCountdown === 0}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 border border-emerald-400/30 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : otpExpiryCountdown === 0 ? (
                <span>Code Expired — Request New Code</span>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Verify &amp; Activate SafeVisit</span>
                </>
              )}
            </button>

            {/* Actions: Edit Identifier & Resend */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1.5 border-t border-white/10">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-3 h-3" />
                <span>Edit {authType === 'email' ? 'Email' : 'Number'}</span>
              </button>

              <button
                type="button"
                disabled={resendCountdown > 0 || isSendingOtp}
                onClick={() => handleSendOtp()}
                className="text-emerald-400 hover:underline disabled:text-slate-500 disabled:no-underline font-semibold text-xs"
              >
                {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend Code'}
              </button>
            </div>
          </form>
        )}

        {/* Security Footer */}
        <div className="text-center text-[9px] text-slate-500 pt-1">
          Cryptographically signed SafeVisit pass • No passport retention
        </div>
      </div>
    </div>
  );
}
