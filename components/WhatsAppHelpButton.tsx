'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Headset } from 'lucide-react';
import { settingsService } from '../lib/services/settingsService';

export function AgentHelpIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return <Headset className={className} />;
}

// Retain WhatsAppIcon alias pointing to Headset for backwards compatibility
export { AgentHelpIcon as WhatsAppIcon };

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

  const defaultMessage = 'Hi Jersey Junction Support! I need agent help with an order / jersey query.';
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
        <span className="text-zinc-200">Agent Help</span>
      </a>

      {/* Floating Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Connect with Agent Help"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
      >
        {/* Radar ping ring */}
        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-30 animate-ping" />
        
        <Headset className="w-7 h-7 relative z-10" />
      </a>
    </div>
  );
}
