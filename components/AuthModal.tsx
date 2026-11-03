'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, UserRound, Mail, Lock, User, ArrowRight, ShieldAlert, Loader2, Phone, Eye, EyeOff, CheckCircle2, KeyRound } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { authService } from '../lib/services/authService';
import { customerService } from '../lib/services/customerService';

declare global {
  interface Window {
    google?: any;
  }
}

const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const AuthModal: React.FC = () => {
  const router = useRouter();
  const { isAuthOpen, setIsAuthOpen, loginUser, currentUser, logoutUser } = useStore();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'verify-signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [gsiLoaded, setGsiLoaded] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const otpInputRef = useRef<HTMLInputElement>(null);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '690427721204-ku71qit1vt4a7pjnfcn13beqbquj2bpg.apps.googleusercontent.com';

  // Load Google Identity Services script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.google?.accounts) {
      setGsiLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setGsiLoaded(true);
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Prevent background body scroll when auth modal is open
  useEffect(() => {
    if (isAuthOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isAuthOpen]);

  // If user is already logged in, automatically close auth modal
  useEffect(() => {
    if (currentUser && isAuthOpen) {
      setIsAuthOpen(false);
    }
  }, [currentUser, isAuthOpen, setIsAuthOpen]);

  // Cooldown countdown for OTP resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Focus OTP input when switching to verify-signup mode
  useEffect(() => {
    if (mode === 'verify-signup') {
      const timer = setTimeout(() => {
        otpInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [mode]);

  // Close auth modal when user is banned and banned alert pops up
  useEffect(() => {
    const handleBanned = () => {
      handleClose();
    };
    window.addEventListener('jj_customer_banned', handleBanned);
    return () => window.removeEventListener('jj_customer_banned', handleBanned);
  }, []);

  if (!isAuthOpen || currentUser) return null;

  const handleClose = () => {
    setIsAuthOpen(false);
    setError('');
    setSuccessMsg('');
    setIsLoading(false);
    setShowPassword(false);
    setAgreeTerms(false);
    setOtpCode('');
    setResendCooldown(0);
    setIsResending(false);
    setIsVerified(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Please provide your registered email and a new password.');
      return;
    }
    if (cleanPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await customerService.resetPasswordCustomer(cleanEmail, cleanPassword);
      if (res.success) {
        setSuccessMsg(res.message || 'Password reset successfully! Returning to sign in...');
        setTimeout(() => {
          setMode('login');
          setSuccessMsg('');
        }, 1800);
      } else {
        setError(res.message || 'Failed to reset password. Please check your email.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred while resetting password.');
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger Google Official OAuth Popup Window
  const handleGoogleSignInClick = () => {
    setError('');

    if (googleClientId && window.google?.accounts?.oauth2) {
      setIsLoading(true);
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'email profile openid',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              setIsLoading(false);
              return;
            }

            try {
              const authUser = await authService.googleAuth({ accessToken: tokenResponse.access_token });
              loginUser({
                name: authUser.name,
                email: authUser.email,
                role: authUser.role,
                phone: ''
              });
              handleClose();
            } catch (err: any) {
              setError('Failed to authenticate with Google. Please try again.');
            } finally {
              setIsLoading(false);
            }
          }
        });

        tokenClient.requestAccessToken();
        return;
      } catch (err: any) {
        console.error('Google OAuth popup error:', err);
        setIsLoading(false);
      }
    }

    if (!googleClientId) {
      setError('Google Sign-In is not configured yet. Please sign in with your email and password.');
      return;
    }
  };

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const authUser = await authService.loginCustomer(cleanEmail, cleanPassword);
      loginUser({
        name: authUser.name,
        email: authUser.email,
        role: authUser.role,
        phone: authUser.phone || ''
      });
      handleClose();
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('api error') || msg.toLowerCase().includes('status')) {
        setError('An error occurred. Please try again.');
      } else {
        setError(msg || 'Invalid email or password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();
    const cleanPassword = password.trim();

    if (!cleanName || !cleanEmail || !cleanPhone || !cleanPassword) {
      setError('Please fill in all required fields (Name, Email, Phone, Password).');
      return;
    }

    if (cleanPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to the Terms and Conditions to create an account.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await authService.sendSignupOtp({
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword,
        phone: cleanPhone,
      });

      setMode('verify-signup');
      setOtpCode('');
      setResendCooldown(60);
      setSuccessMsg(res.message || `Verification code sent to ${cleanEmail}`);
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('api error') || msg.toLowerCase().includes('status')) {
        setError('An error occurred. Please try again.');
      } else {
        setError(msg || 'Registration failed. Email may already be registered.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySignupOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otpCode.trim();
    const cleanEmail = email.trim();

    if (!cleanOtp || cleanOtp.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const authUser = await authService.verifySignupOtp(cleanEmail, cleanOtp);
      setIsVerified(true);
      setSuccessMsg('Verified');
      loginUser({
        name: authUser.name,
        email: authUser.email,
        role: authUser.role,
        phone: authUser.phone || phone.trim() || '',
      });
      setTimeout(() => {
        handleClose();
      }, 1200);
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('api error') || msg.toLowerCase().includes('status')) {
        setError('An error occurred. Please try again.');
      } else {
        setError(msg || 'Invalid or expired verification code. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendSignupOtp = async () => {
    if (resendCooldown > 0 || isResending) return;
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Email address is missing.');
      return;
    }

    setIsResending(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await authService.resendSignupOtp(cleanEmail);
      setResendCooldown(60);
      setSuccessMsg(res.message || 'New 6-digit verification code sent to your email.');
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('api error') || msg.toLowerCase().includes('status')) {
        setError('An error occurred. Please try again.');
      } else {
        setError(msg || 'Failed to resend code. Please try again.');
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
      className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in overflow-y-auto"
    >
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-6 text-white font-sans overflow-hidden my-auto">

        {/* Decorative Radial Accent */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          {mode !== 'verify-signup' && (
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/20 mb-2">
              <UserRound className="w-6 h-6" />
            </div>
          )}
          <h2 className="font-serif text-2xl font-black uppercase text-white tracking-tight">
            {mode === 'verify-signup'
              ? 'VERIFY YOUR EMAIL'
              : mode === 'signup'
                ? 'CREATE AN ACCOUNT'
                : mode === 'forgot'
                  ? 'RESET PASSWORD'
                  : 'CUSTOMER LOGIN'}
          </h2>
        </div>

        {/* Mode Switcher Tabs */}
        {mode === 'verify-signup' ? (
          <div className="flex items-center justify-between bg-zinc-900 p-2 rounded-xl border border-zinc-800 text-xs font-bold">
            <span className="text-amber-400 font-mono text-[11px] px-2">
              Step 2 of 2: Code Verification
            </span>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError('');
                setSuccessMsg('');
                setIsVerified(false);
              }}
              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[11px] cursor-pointer"
            >
              Edit Details
            </button>
          </div>
        ) : mode === 'forgot' ? (
          <div className="flex items-center justify-between bg-zinc-900 p-2 rounded-xl border border-zinc-800 text-xs font-bold">
            <span className="text-amber-400 font-mono text-[11px] px-2 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              Password Recovery
            </span>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[11px] cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs font-bold">
            <button
              onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); setShowPassword(false); setAgreeTerms(false); }}
              className={`flex-1 py-2 rounded-lg transition-all ${mode === 'login' ? 'bg-amber-400 text-black shadow-md' : 'text-zinc-400 hover:text-white'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); setSuccessMsg(''); setShowPassword(false); setAgreeTerms(false); }}
              className={`flex-1 py-2 rounded-lg transition-all ${mode === 'signup' ? 'bg-amber-400 text-black shadow-md' : 'text-zinc-400 hover:text-white'}`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Official Google OAuth Sign-In Button (hidden in forgot and verify modes) */}
        {mode !== 'forgot' && mode !== 'verify-signup' && (
          <>
            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignInClick}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl border border-zinc-800 transition-all flex items-center justify-center gap-3 cursor-pointer shadow-md group hover:border-zinc-700 text-xs disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              ) : (
                <GoogleIcon />
              )}
              <span>{mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}</span>
            </button>

            {/* OR Divider */}
            <div className="flex items-center gap-3 my-1">
              <div className="h-[1px] flex-1 bg-zinc-800/80"></div>
              <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">OR WITH EMAIL</span>
              <div className="h-[1px] flex-1 bg-zinc-800/80"></div>
            </div>
          </>
        )}

        {/* Verification OTP Form */}
        {mode === 'verify-signup' ? (
          <form onSubmit={handleVerifySignupOtp} className="space-y-5 text-xs">
            <div>
              <label className="font-bold text-zinc-400 block mb-2 uppercase text-center tracking-wider text-[11px]">
                ENTER 6-DIGIT VERIFICATION CODE
              </label>
              <div className="relative">
                <input
                  ref={otpInputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoComplete="one-time-code"
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtpCode(val);
                    if (error) setError('');
                  }}
                  className="w-full bg-black/60 border-2 border-zinc-800 hover:border-zinc-700 focus:border-amber-400 rounded-2xl py-3.5 px-4 text-center text-2xl sm:text-3xl font-mono font-black tracking-[0.4em] text-amber-400 focus:outline-none transition-all shadow-inner"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="leading-snug">{successMsg}</div>
                  {!isVerified && (
                    <div className="text-[11px] text-emerald-400/80 font-normal leading-relaxed">
                      Valid for 10 minutes &bull; Check your Spam/Junk folder if not in inbox
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || otpCode.length !== 6 || isVerified}
              className={`w-full py-3.5 ${
                isVerified
                  ? 'bg-emerald-400 text-black font-black'
                  : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-extrabold'
              } rounded-xl transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50`}
            >
              {isVerified ? (
                <span className="flex items-center gap-2 text-black font-black uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  VERIFIED
                </span>
              ) : isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-black" />
              ) : (
                <>
                  <span>VERIFY & SIGN IN</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-1 text-xs">
              <button
                type="button"
                onClick={handleResendSignupOtp}
                disabled={resendCooldown > 0 || isResending}
                className="text-amber-400 hover:text-amber-300 font-bold transition-colors disabled:opacity-40 disabled:hover:text-amber-400 cursor-pointer disabled:cursor-not-allowed"
              >
                {isResending ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...
                  </span>
                ) : resendCooldown > 0 ? (
                  `Resend Code (${resendCooldown}s)`
                ) : (
                  'Resend Verification Code'
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError('');
                  setSuccessMsg('');
                }}
                className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Change Details
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={mode === 'signup' ? handleUserSignUp : mode === 'forgot' ? handleResetPassword : handleUserLogin} className="space-y-4 text-xs">

              {mode === 'signup' && (
                <>
                  <div>
                    <label className="font-bold text-zinc-400 block mb-1 uppercase">Full Name *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Aarav Sharma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-zinc-400 block mb-1 uppercase">Phone Number *</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        required
                        placeholder="+91 9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="font-bold text-zinc-400 block mb-1 uppercase">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="yourname@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-zinc-400 uppercase">
                    {mode === 'forgot' ? 'New Password (min 6 chars) *' : 'Password *'}
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setError(''); setSuccessMsg(''); }}
                      className="text-amber-400 hover:text-amber-300 text-[11px] font-semibold hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {mode === 'signup' && (
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer group select-none">
                    <input
                      type="checkbox"
                      id="agree-terms-checkbox"
                      required
                      checked={agreeTerms}
                      onChange={(e) => {
                        setAgreeTerms(e.target.checked);
                        if (error.includes('Terms')) setError('');
                      }}
                      className="mt-0.5 h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-amber-400 focus:ring-amber-400 focus:ring-offset-0 cursor-pointer accent-amber-400"
                    />
                    <span className="text-xs text-zinc-400 leading-snug group-hover:text-zinc-300 transition-colors">
                      I agree to the{' '}
                      <a
                        href="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-400 hover:text-amber-300 font-bold underline transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Terms and Conditions
                      </a>
                    </span>
                  </label>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-extrabold rounded-xl transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-black" />
                ) : (
                  <>
                    <span>{mode === 'signup' ? 'CREATE ACCOUNT' : mode === 'forgot' ? 'RESET PASSWORD' : 'SIGN IN'}</span>
                    <ArrowRight className="w-4 h-4 text-black" />
                  </>
                )}
              </button>
            </form>
        )}

      </div>
    </div>
  );
};

