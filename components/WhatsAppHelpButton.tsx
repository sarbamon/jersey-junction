'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { settingsService } from '../lib/services/settingsService';

export function WhatsAppIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
      aria-hidden="true"
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.34C9.33 7.34 9.09 7.41 8.89 7.63C8.69 7.84 8.13 8.37 8.13 9.44C8.13 10.51 8.91 11.55 9.02 11.7C9.13 11.85 10.53 14.07 12.75 14.96C14.54 15.68 14.95 15.53 15.42 15.49C15.89 15.45 16.92 14.88 17.13 14.29C17.34 13.7 17.34 13.2 17.27 13.09C17.2 12.98 17.06 12.92 16.85 12.81C16.64 12.7 15.43 12.11 15.2 12.03C14.97 11.95 14.83 11.91 14.69 12.13C14.55 12.35 14.12 12.87 14 13.01C13.88 13.15 13.75 13.17 13.54 13.06C13.33 12.95 12.65 12.73 11.85 12.02C11.23 11.47 10.81 10.79 10.69 10.58C10.57 10.37 10.68 10.25 10.78 10.15C10.88 10.05 11 9.89 11.11 9.77C11.22 9.65 11.26 9.56 11.33 9.41C11.4 9.26 11.37 9.14 11.31 9.03C11.25 8.92 10.75 7.69 10.54 7.18C10.33 6.69 10.12 6.75 9.96 6.75C9.81 6.75 9.68 6.75 9.53 6.75V7.34Z" />
    </svg>
  );
}

export function WhatsAppHelpButton() {
  const pathname = usePathname();
  const [whatsappNumber, setWhatsappNumber] = useState<string>('917002740268');
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const loadNum = () => {
      const s = settingsService.getSettings();
      const raw = s.storeWhatsapp || s.storePhone || '917002740268';
      const clean = raw.replace(/\D/g, '');
      const withCountry = clean.startsWith('91') ? clean : (clean.length === 10 ? `91${clean}` : clean);
      setWhatsappNumber(withCountry || '917002740268');
    };

    loadNum();
    settingsService.fetchSettingsAsync().then(loadNum);

    const onUpdate = () => loadNum();
    window.addEventListener('jj_store_settings_updated', onUpdate);
    return () => window.removeEventListener('jj_store_settings_updated', onUpdate);
  }, []);

  // Do not render floating button on admin dashboard pages
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  const defaultMessage = 'Hi Jersey Junction Support! I need help with an order / jersey query.';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 select-none group font-sans">
      
      {/* Tooltip Pill */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full bg-zinc-900/95 border border-emerald-500/30 text-white text-xs font-bold shadow-xl backdrop-blur-md transition-all duration-300 hover:border-emerald-400 ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-90'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-zinc-200">WhatsApp Help</span>
      </a>

      {/* Floating Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp Support"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
      >
        {/* Radar ping ring */}
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-30 animate-ping" />
        
        <WhatsAppIcon className="w-7 h-7 relative z-10" />
      </a>
    </div>
  );
}
