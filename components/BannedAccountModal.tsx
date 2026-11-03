'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, AlertTriangle, ArrowRight, Mail, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const BannedAccountModal: React.FC = () => {
  const router = useRouter();
  const { logoutUser } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<string>('');

  useEffect(() => {
    // 1. Listen for global ban events dispatched from API client, auth service, or checkout
    const handleBanned = (event: Event) => {
      const customEvent = event as CustomEvent<{ reason?: string }>;
      const banReason = customEvent.detail?.reason || 'Violation of Store Terms & Conditions';
      setReason(banReason);
      setIsOpen(true);
      try {
        logoutUser();
      } catch (_) {}
    };

    window.addEventListener('jj_customer_banned', handleBanned);

    // 2. Check on initial mount in case user data in localStorage is marked banned
    try {
      const rawUser = localStorage.getItem('jj_customer_user') || localStorage.getItem('jj_user');
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        if (parsed?.isBanned || parsed?.status === 'Banned') {
          setReason(parsed.banReason || 'Violation of Store Terms & Conditions');
          setIsOpen(true);
          try {
            logoutUser();
          } catch (_) {}
        }
      }
    } catch (_) {}

    return () => {
      window.removeEventListener('jj_customer_banned', handleBanned);
    };
  }, [logoutUser]);

  const handleDismiss = () => {
    setIsOpen(false);
    try {
      localStorage.removeItem('jj_customer_token');
      localStorage.removeItem('jj_customer_user');
      localStorage.removeItem('jj_user');
      logoutUser();
    } catch (_) {}

    if (
      typeof window !== 'undefined' &&
      (window.location.pathname.startsWith('/checkout') ||
        window.location.pathname.startsWith('/orders') ||
        window.location.pathname.startsWith('/profile'))
    ) {
      router.push('/');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleDismiss();
        }
      }}
      className="fixed inset-0 z-[999999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in overflow-y-auto"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="banned-modal-title"
    >
      <div className="w-full max-w-md bg-zinc-950/95 border border-red-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_-15px_rgba(239,68,68,0.35)] relative space-y-6 text-white font-sans overflow-hidden my-auto">
        {/* Glow ambient background accents */}
        <div className="absolute -top-24 -right-24 w-52 h-52 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-5 right-5 h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition-all cursor-pointer"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-3 pt-2">
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 bg-red-500/25 rounded-2xl blur-lg animate-pulse" />
            <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-950/70 text-red-500 border border-red-500/40 shadow-inner">
              <ShieldAlert className="w-8 h-8" />
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="inline-block px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-widest">
              Account Suspended
            </span>
            <h2 id="banned-modal-title" className="font-serif text-2xl font-black uppercase text-white tracking-tight">
              Access Revoked
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
              Your Jersey Junction account has been suspended by store administration.
            </p>
          </div>
        </div>

        {/* Reason / Details Box */}
        <div className="bg-red-950/20 border border-red-500/20 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-red-400 uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span>Violation Notice</span>
          </div>
          <p className="text-sm text-zinc-200 font-medium leading-relaxed break-words bg-black/50 p-3.5 rounded-xl border border-red-500/15">
            {reason || 'Violation of Store Terms & Conditions'}
          </p>
          <p className="text-[11px] text-zinc-400 leading-normal pt-1">
            You have been logged out. Placing orders, checkout, and account privileges are disabled for this account.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={handleDismiss}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs rounded-xl uppercase tracking-wider transition-all duration-200 shadow-lg shadow-red-950/50 hover:shadow-red-700/40 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <span>I Understand</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="/contact"
            onClick={() => setIsOpen(false)}
            className="w-full py-3 px-4 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold text-xs rounded-xl border border-zinc-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Mail className="w-4 h-4 text-zinc-400" />
            <span>Contact Support</span>
          </a>
        </div>
      </div>
    </div>
  );
};
