'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { JerseyViewerSVG } from './JerseyViewerSVG';
import { Currency, JerseyProduct } from '../types';

interface HeroBannerProps {
  activeCurrency: Currency;
  onOpenCustomLab: () => void;
  onSelectCategory: (category: string) => void;
  onSelectProduct: (product: JerseyProduct) => void;
  featuredProducts: JerseyProduct[];
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  activeCurrency,
  onOpenCustomLab,
  onSelectCategory,
  onSelectProduct,
  featuredProducts
}) => {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      title: 'WEAR THE GAME.',
      highlight: 'FEEL THE PASSION.',
      subtitle: 'Premium football jerseys crafted for true fans.',
      badge: '2024/25 NEW ARRIVALS',
      image: '/jersey/WhatsApp Image 2026-09-08 at 11.44.00 PM.jpeg',
      primaryColor: '#db0007',
      secondaryColor: '#ffffff',
      accentColor: '#061922',
      textColor: '#ffffff',
      sponsorText: 'Emirates',
      name: 'SAKA',
      number: '7',
      productId: 'set-arsenal-se'
    },
    {
      title: 'REAL MADRID 24/25',
      highlight: 'BELLINGHAM #5 PLAYER EDITION',
      subtitle: 'Heat-applied 3D crests, houndstooth texture, & laser perforated ventilation.',
      badge: 'MATCH ISSUE SPECIFICATION',
      image: '/jersey/WhatsApp Image 2026-09-08 at 11.44.17 PM.jpeg',
      primaryColor: '#ffffff',
      secondaryColor: '#09152b',
      accentColor: '#f4c84a',
      textColor: '#09152b',
      sponsorText: 'Emirates',
      name: 'BELLINGHAM',
      number: '5',
      productId: 'rm-player-2425'
    },
    {
      title: 'MESSI #10 PINK PASSION',
      subtitle: 'Official Inter Miami CF 2024 Home Kit with free official MLS printing.',
      highlight: 'MOST WANTED WORLDWIDE',
      badge: 'OFFICIAL MLS PRINT',
      image: '/jersey/WhatsApp Image 2026-09-08 at 11.44.39 PM.jpeg',
      primaryColor: '#f7b5cd',
      secondaryColor: '#101820',
      accentColor: '#f7b5cd',
      textColor: '#101820',
      sponsorText: 'Royal Caribbean',
      name: 'MESSI',
      number: '10',
      productId: 'inter-miami-messi-pink'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const current = slides[activeSlide];

  return (
    <section className="group relative w-full overflow-hidden bg-black dark:bg-black light:bg-slate-950 text-white border-b border-[#242424] dark:border-[#242424] light:border-slate-800 transition-colors">
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-72 sm:w-[500px] h-72 sm:h-[500px] bg-[#f4c84a]/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-3 sm:space-y-5 text-left">
            <span className="inline-block rounded-full bg-[#f4c84a]/10 px-3 py-1 text-[10px] sm:text-xs font-black tracking-[0.2em] text-[#f4c84a] border border-[#f4c84a]/30">
              {current.badge}
            </span>

            <h1 className="font-serif text-2xl sm:text-4xl lg:text-6xl font-black text-white leading-tight uppercase tracking-tight">
              {current.title}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f4c84a] to-[#ffd96a]">
                {current.highlight}
              </span>
            </h1>

            <p className="max-w-xl text-xs sm:text-base leading-relaxed text-gray-300 font-sans">
              {current.subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center gap-2.5 pt-1 sm:pt-2">
              <button
                onClick={() => {
                  const p = featuredProducts.find((item) => item.id === current.productId);
                  if (p) onSelectProduct(p);
                  else onSelectCategory('all');
                }}
                className="group flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#f4c84a] to-[#d4af37] px-6 py-3 sm:px-8 sm:py-4 text-xs sm:text-sm font-black tracking-wider text-black transition-all hover:shadow-[0_0_25px_rgba(244,200,74,0.4)]"
              >
                <span>SHOP NOW</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Right Live Product Image Preview */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center mt-1 lg:mt-0">
            <div 
              onClick={() => {
                const p = featuredProducts.find((item) => item.id === current.productId);
                if (p) onSelectProduct(p);
              }}
              className="w-full max-w-[280px] sm:max-w-sm bg-[#080808] dark:bg-[#080808] light:bg-slate-900 p-3 sm:p-5 rounded-2xl border border-[#242424] dark:border-[#242424] light:border-slate-800 shadow-2xl relative cursor-pointer group hover:border-[#f4c84a]/60 transition-all overflow-hidden"
            >
              <div className="py-2 flex justify-center items-center min-h-[200px] sm:min-h-[250px]">
                <img
                  src={current.image}
                  alt={current.title}
                  className="w-full h-48 sm:h-60 object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-500 rounded-lg"
                />
              </div>

              <div className="text-center pt-2">
                <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-widest group-hover:text-[#f4c84a] transition-colors">
                  TAP TO VIEW PRODUCT DETAILS
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Carousel Indicators & Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-[#222] dark:border-[#222] light:border-slate-800 mt-4 sm:mt-6">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                  activeSlide === idx ? 'w-6 sm:w-8 bg-[#f4c84a]' : 'w-1.5 sm:w-2 bg-gray-700 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-white">
            <button
              onClick={() => setActiveSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
              className="p-1.5 sm:p-2 rounded-full bg-[#111] dark:bg-[#111] light:bg-slate-900 border border-[#333] hover:bg-[#222]"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#f4c84a]" />
            </button>
            <button
              onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
              className="p-1.5 sm:p-2 rounded-full bg-[#111] dark:bg-[#111] light:bg-slate-900 border border-[#333] hover:bg-[#222]"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#f4c84a]" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
