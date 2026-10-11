'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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
      id: 'hero-1',
      badge: '2024/25 OFFICIAL KITS',
      title: 'WEAR THE GAME.',
      highlight: 'FEEL THE PASSION.',
      subtitle: 'Authentic match-specification football jerseys & player edition kits crafted for true fans.',
      image: '/hero/colin-meg-R8ayF9Qwu5Y-unsplash.webp',
    },
    {
      id: 'hero-2',
      badge: 'MATCHDAY EDITION',
      title: 'AUTHENTIC PERFORMANCE.',
      highlight: 'UNMATCHED COMFORT.',
      subtitle: 'Lightweight, heat-applied crests and breathability for maximum pitch performance.',
      image: '/hero/cristian-tarzi-uBgmduO_ZBg-unsplash.webp',
    },
    {
      id: 'hero-3',
      badge: 'WORLDWIDE FAVORITES',
      title: 'LEGENDARY COLORS.',
      highlight: 'ICONIC STYLES.',
      subtitle: 'Stand out with official club & national team jerseys.',
      image: '/hero/simon-reza-Yfv7JszxYyw-unsplash.webp',
    },
    {
      id: 'hero-4',
      badge: 'VINTAGE CLASSICS',
      title: 'RETRO LEGENDS.',
      highlight: 'TIMELESS DESIGNS.',
      subtitle: 'Relive classic World Cup and Champions League victories with vintage kits.',
      image: '/hero/bibesh-manandhar-e-OfH1yh_hs-unsplash.webp',
    },
    {
      id: 'hero-5',
      badge: 'STREET & STADIUM',
      title: 'EVERYDAY ATHLETIC.',
      highlight: 'AUTHENTIC QUALITY.',
      subtitle: 'Crafted with high-grade performance fabrics for matchdays and streetwear.',
      image: '/hero/michael-kyule-Lhd0RRDTTOo-unsplash.webp',
    },
    {
      id: 'hero-6',
      badge: 'PRO COLLECTION',
      title: 'CHAMPIONS CHOICE.',
      highlight: 'JERSEY JUNCTION.',
      subtitle: 'Your #1 destination for official high-quality sportswear and custom kits.',
      image: '/hero/vladislav-glukhotko-HPDtJ0V_cNI-unsplash.webp',
    }
  ];

  useEffect(() => {
    // Preload all hero slide images into browser cache
    slides.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
    });

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const current = slides[activeSlide];

  return (
    <section className="relative w-full overflow-hidden bg-black text-white h-[460px] sm:h-[560px] lg:h-[620px] flex items-center justify-center border-b border-[#242424]">
      
      {/* Full-Size Background Images Stack with Opacity Transition */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {slides.map((slide, idx) => (
          <img
            key={slide.id}
            src={slide.image}
            alt={slide.title}
            loading="eager"
            // @ts-ignore
            fetchPriority={idx === 0 ? 'high' : 'auto'}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ease-in-out brightness-110 ${
              activeSlide === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          />
        ))}
        {/* Light Overlay for Vivid Hero Imagery */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent z-20"></div>
        <div className="absolute inset-0 bg-black/10 z-20"></div>
      </div>

      {/* Background Radial Glow Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[700px] h-[350px] sm:h-[700px] bg-[#f4c84a]/25 rounded-full blur-[120px] pointer-events-none z-20"></div>

      {/* Content Layered Above Full-Size Image */}
      <div className="relative z-30 mx-auto max-w-4xl px-4 py-8 text-center flex flex-col items-center justify-end h-full pb-8 sm:pb-12 w-full space-y-4">

        {/* CENTERED SHOP NOW BUTTON */}
        <div>
          <Link
            href="/shop"
            className="group flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#f4c84a] to-[#d4af37] px-8 py-3.5 sm:px-10 sm:py-4 text-sm sm:text-base font-black tracking-widest text-black transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(244,200,74,0.7)] cursor-pointer shadow-2xl"
          >
            <span>SHOP NOW</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1 text-black" />
          </Link>
        </div>

        {/* Slide Indicator Dots */}
        <div className="flex items-center justify-center gap-2.5 pt-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`h-2.5 sm:h-3 rounded-full transition-all duration-300 cursor-pointer ${
                activeSlide === idx ? 'w-8 sm:w-10 bg-[#f4c84a] shadow-[0_0_12px_rgba(244,200,74,0.8)]' : 'w-2.5 sm:w-3 bg-white/40 hover:bg-white/80'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};




