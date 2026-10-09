'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, UserRound, Mail, Lock, User, ArrowRight, Sparkles, ShieldAlert } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { UserProfile } from '../types';

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

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  if (!isAuthOpen) return null;

  const handleClose = () => {
    setIsAuthOpen(false);
    setError('');
  };

  const handleGoogleSignIn = () => {
    const user: UserProfile = {
      name: 'Google User',
      email: 'user.google@gmail.com',
      role: 'user',
      phone: '+91 98765 43210'
    };
    loginUser(user);
    handleClose();
  };

  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    const user: UserProfile = {
      name: email.split('@')[0].toUpperCase(),
      email,
      role: 'user',
      phone: phone || '+91 98765 43210'
    };

    loginUser(user);
    handleClose();
  };

  const handleUserSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    const user: UserProfile = {
      name,
      email,
      role: 'user',
      phone: phone || '+91 98765 43210'
    };

    loginUser(user);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-6 text-white font-sans overflow-hidden">
        
        {/* Decorative Radial Background Accent */}
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
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/20 mb-2">
            <UserRound className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-black uppercase text-white tracking-tight">
            {currentUser ? 'MY ACCOUNT' : (mode === 'signup' ? 'CREATE AN ACCOUNT' : 'CUSTOMER LOGIN')}
          </h2>
          <p className="text-xs text-zinc-400 font-medium">
            {currentUser ? `Logged in as ${currentUser.name}` : 'Sign in to track orders, save wishlists, & fast checkout'}
          </p>
        </div>

        {/* If user is already logged in, show User Card */}
        {currentUser ? (
          <div className="space-y-4">
            <div className="p-4 bg-zinc-900/80 rounded-2xl border border-zinc-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-400/20 border border-amber-400/30 text-amber-400 flex items-center justify-center font-serif font-black text-lg">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-sm text-white">{currentUser.name}</div>
                  <div className="text-xs text-zinc-400">{currentUser.email}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-zinc-500 uppercase font-bold text-[10px]">Account Type:</span>
                <span className="font-mono font-bold text-amber-400 uppercase bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  Customer
                </span>
              </div>
            </div>

            <button
              onClick={() => { handleClose(); router.push('/account'); }}
              className="w-full py-3.5 bg-amber-400 hover:bg-amber-500 text-black font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>GO TO ACCOUNT DASHBOARD</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => { logoutUser(); handleClose(); }}
              className="w-full py-3 bg-zinc-900 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-zinc-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              LOG OUT
            </button>
          </div>
        ) : (
          <>
            {/* Mode Switcher Tabs */}
            <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs font-bold">
              <button
                onClick={() => { setMode('login'); setError(''); }}
                className={`flex-1 py-2 rounded-lg transition-all ${mode === 'login' ? 'bg-amber-400 text-black shadow-md' : 'text-zinc-400 hover:text-white'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setMode('signup'); setError(''); }}
                className={`flex-1 py-2 rounded-lg transition-all ${mode === 'signup' ? 'bg-amber-400 text-black shadow-md' : 'text-zinc-400 hover:text-white'}`}
              >
                Sign Up
              </button>
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl border border-zinc-800 transition-all flex items-center justify-center gap-3 cursor-pointer shadow-md group hover:border-zinc-700 text-xs"
            >
              <GoogleIcon />
              <span>{mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}</span>
            </button>

            {/* OR Divider */}
            <div className="flex items-center gap-3 my-1">
              <div className="h-[1px] flex-1 bg-zinc-800/80"></div>
              <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">OR WITH EMAIL</span>
              <div className="h-[1px] flex-1 bg-zinc-800/80"></div>
            </div>

            {/* Form Fields */}
            <form onSubmit={mode === 'signup' ? handleUserSignUp : handleUserLogin} className="space-y-4 text-xs">
              
              {mode === 'signup' && (
                <div>
                  <label className="font-bold text-zinc-400 block mb-1 uppercase">Full Name</label>
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
              )}

              <div>
                <label className="font-bold text-zinc-400 block mb-1 uppercase">
                  Email Address
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
                <label className="font-bold text-zinc-400 block mb-1 uppercase">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-extrabold rounded-xl transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <span>{mode === 'signup' ? 'CREATE ACCOUNT' : 'SIGN IN'}</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
};
