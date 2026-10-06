'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, ShieldCheck, FileText } from 'lucide-react';

const InstagramIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);


interface FooterProps {
  onOpenCustomLab?: () => void;
  onOpenTrackOrder?: () => void;
  onOpenSizeGuide?: () => void;
  onSelectSport?: (sport: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenCustomLab,
  onOpenTrackOrder,
  onOpenSizeGuide,
  onSelectSport
}) => {
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<'terms' | 'privacy' | null>(null);

  const handleCategoryClick = (categorySlug: string) => {
    if (onSelectSport) {
      onSelectSport(categorySlug);
    }
    router.push('/shop');
  };

  const shopLinks = [
    { label: 'PLAYER VERSION', slug: 'player-version' },
    { label: 'FAN VERSION', slug: 'fan-version' },
    { label: 'SET', slug: 'set' },
    { label: 'RETRO', slug: 'retro' },
    { label: 'CLEARANCE', slug: 'clearance' },
    { label: 'FORMULA 1', slug: 'formula-1' },
    { label: 'CRICKET', slug: 'cricket' },
    { label: 'NBA', slug: 'nba' },
    { label: 'JACKETS', slug: 'jackets' },
    { label: 'POLO', slug: 'polo' },
    { label: 'FULL SLEEVE FAN', slug: 'full-sleeve-fan' },
    { label: 'FULL SLEEVE PLAYER', slug: 'full-sleeve-player' },
    { label: 'FULL SLEEVE SET', slug: 'full-sleeve-set' },
  ];

  return (
    <footer className="bg-black text-white border-t border-[#1a1a1a] pt-16 pb-12 font-sans relative z-10">
      <div className="container mx-auto px-6 sm:px-12 lg:px-16 max-w-7xl">
        
        {/* Main Content Layout - Mobile & Desktop Responsive */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 lg:gap-16 pb-12 md:pb-16">
          
          {/* Column 1: Brand Logo & Info */}
          <div className="md:col-span-5 lg:col-span-5 space-y-5 sm:space-y-6">
            
            {/* Gold Framed Logo Box */}
            <Link href="/" className="inline-block group">
              <div className="footer-logo-crest border px-5 py-3 sm:px-6 sm:py-3.5 inline-flex flex-col items-center justify-center rounded-sm transition-transform duration-300 group-hover:scale-105">
                <span className="logo-js font-serif text-2xl sm:text-3xl font-black tracking-[0.15em] leading-none">
                  JS
                </span>
                <span className="logo-spot font-serif text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase mt-1">
                  JERSEY SPOT
                </span>
              </div>
            </Link>

            {/* Description Text */}
            <p className="text-slate-600 dark:text-[#a1a1a1] text-xs sm:text-sm leading-relaxed max-w-sm font-normal">
              We bring you premium-quality imported football jerseys with authentic designs and perfect fit. Experience the game like never before.
            </p>

            {/* Instagram Social Icon Button */}
            <div className="pt-1">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 dark:bg-[#141414] border border-slate-300 dark:border-[#282828] flex items-center justify-center text-slate-800 dark:text-gray-300 hover:text-[#d4af37] hover:border-[#d4af37] transition-all duration-300 hover:scale-110 shadow-sm"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
            </div>

          </div>

          {/* Grid Wrapper for Information & Shop */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-8 sm:gap-10">
            
            {/* Column 2: Information */}
            <div className="md:col-span-3 space-y-4 sm:space-y-5">
              <h3 className="font-serif font-bold text-amber-700 dark:text-[#d4af37] text-xs sm:text-sm tracking-[0.25em] uppercase">
                INFORMATION
              </h3>
              
              <ul className="space-y-2.5 sm:space-y-3.5 text-xs sm:text-sm">
                <li>
                  <Link href="/" className="text-slate-600 dark:text-[#a1a1a1] hover:text-[#d4af37] transition-colors duration-200 block">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-slate-600 dark:text-[#a1a1a1] hover:text-[#d4af37] transition-colors duration-200 block">
                    About us
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => setActiveModal('terms')}
                    className="text-slate-600 dark:text-[#a1a1a1] hover:text-[#d4af37] transition-colors duration-200 text-left block"
                  >
                    Terms & Conditions
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveModal('privacy')}
                    className="text-slate-600 dark:text-[#a1a1a1] hover:text-[#d4af37] transition-colors duration-200 text-left block"
                  >
                    Privacy Policy
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Shop */}
            <div className="md:col-span-4 space-y-4 sm:space-y-5">
              <h3 className="font-serif font-bold text-amber-700 dark:text-[#d4af37] text-xs sm:text-sm tracking-[0.25em] uppercase">
                SHOP
              </h3>
              
              <ul className="grid grid-cols-2 sm:grid-cols-1 gap-2.5 text-xs sm:text-sm">
                {shopLinks.map((item) => (
                  <li key={item.slug}>
                    <button
                      onClick={() => handleCategoryClick(item.slug)}
                      className="text-slate-600 dark:text-[#a1a1a1] hover:text-[#d4af37] transition-colors duration-200 text-left block uppercase font-medium tracking-wide"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

        {/* Bottom Bar matching exact layout */}
        <div className="border-t border-slate-200 dark:border-[#181818] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          
          {/* Copyright & Powered By */}
          <div className="text-slate-500 dark:text-[#888888] text-[11px] sm:text-xs text-center sm:text-left font-normal">
            © {new Date().getFullYear()} – Copyright, All Rights reserved. Powered by Akieme Tech
          </div>

          {/* Razorpay Payment Secured Note */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-700 dark:text-gray-300 font-bold text-[11px] sm:text-xs">
              100% Payment Secured by
            </span>
            <div className="flex items-center gap-1 text-[#0284c7] font-black italic tracking-tighter text-sm">
              <svg className="w-4 h-4 fill-current text-[#0284c7]" viewBox="0 0 24 24">
                <path d="M22.43 4.27L12.57 20.89c-.27.45-.96.38-1.13-.11L8.85 13.3 3.1 19.05c-.39.39-1.02.39-1.41 0s-.39-1.02 0-1.41l6.44-6.44L4.82 4.41c-.17-.49.27-1 .78-.93l16.14 2.21c.54.07.87.6.69 1.12 z" />
              </svg>
              <span className="text-slate-900 dark:text-white font-extrabold not-italic font-sans text-xs tracking-tight bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700">
                Razorpay
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Terms & Conditions / Privacy Policy Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-6 sm:p-8 max-w-xl w-full max-h-[80vh] overflow-y-auto relative text-gray-300 text-xs sm:text-sm space-y-4 shadow-2xl">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full bg-[#1a1a1a] hover:bg-[#2a2a2a]"
            >
              <X className="w-5 h-5" />
            </button>

            {activeModal === 'terms' ? (
              <>
                <div className="flex items-center gap-2 text-[#d4af37] font-serif font-bold text-lg uppercase border-b border-[#222] pb-3">
                  <FileText className="w-5 h-5" />
                  <span>Terms & Conditions</span>
                </div>
                <div className="space-y-3 text-gray-400 leading-relaxed">
                  <p>Welcome to Jersey Spot. By using our website and placing an order, you agree to the following terms and conditions:</p>
                  <h4 className="font-bold text-white">1. Orders & Customization</h4>
                  <p>Custom printed jerseys are tailored specifically to user specifications. Please double check sizing, names, and numbers before finalizing your order.</p>
                  <h4 className="font-bold text-white">2. Shipping & Delivery</h4>
                  <p>Standard delivery takes 3 to 7 business days depending on location. Tracking information will be provided via email or SMS once dispatched.</p>
                  <h4 className="font-bold text-white">3. Returns & Refunds</h4>
                  <p>Items with manufacturing defects or wrong sizes can be returned within 7 days of delivery in original unused condition with tags intact.</p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-[#d4af37] font-serif font-bold text-lg uppercase border-b border-[#222] pb-3">
                  <ShieldCheck className="w-5 h-5" />
                  <span>Privacy Policy</span>
                </div>
                <div className="space-y-3 text-gray-400 leading-relaxed">
                  <p>Your privacy is important to us. Here is how we handle and protect your personal information:</p>
                  <h4 className="font-bold text-white">1. Data Collection</h4>
                  <p>We collect essential details such as your name, shipping address, email, and phone number exclusively to process and deliver your order.</p>
                  <h4 className="font-bold text-white">2. Payment Security</h4>
                  <p>All payments are securely processed through end-to-end 256-bit encrypted payment gateways (Razorpay). We never store your full card numbers or sensitive credentials.</p>
                  <h4 className="font-bold text-white">3. Third-Party Sharing</h4>
                  <p>We do not sell or trade your personal details to third parties. Data is shared only with verified courier partners for shipping purposes.</p>
                </div>
              </>
            )}

            <div className="pt-4 text-right border-t border-[#222]">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 bg-[#d4af37] text-black font-bold uppercase rounded-lg text-xs hover:bg-[#e5c158] transition-colors font-sans"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

