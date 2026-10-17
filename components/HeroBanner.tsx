'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Currency, JerseyProduct } from '../types';
import { AdminBanner } from '../lib/types/admin';
import { bannerService } from '../lib/services/bannerService';
import { INITIAL_BANNERS } from '../lib/mock/banners';

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
  const [banners, setBanners] = useState<AdminBanner[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    // 1. Immediate sync hydration to avoid layout shift or white screens
    const initial = bannerService.getActiveBannersSync();
    if (initial.length > 0) {
      setBanners(initial);
    } else {
      setBanners(INITIAL_BANNERS);
    }

    // 2. Fetch fresh active banners from backend
    let isMounted = true;
    bannerService.getActiveBanners().then((loaded) => {
      if (isMounted && loaded.length > 0) {
        setBanners(loaded);
      }
    });

    // 3. Listen to local/admin banner updates
    const handleUpdate = () => {
      const updated = bannerService.getActiveBannersSync();
      setBanners(updated.length > 0 ? updated : INITIAL_BANNERS);
    };
    window.addEventListener('jj_banners_updated', handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('jj_banners_updated', handleUpdate);
    };
  }, []);

  // Preload hero images whenever banners change
  useEffect(() => {
    banners.forEach((b) => {
      if (b.imageUrl) {
        const img = new Image();
        img.src = b.imageUrl;
      }
    });

    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners]);

  const activeIndex = activeSlide < banners.length ? activeSlide : 0;
  const current = banners[activeIndex] || INITIAL_BANNERS[0];

  return (
    <section className="relative w-full overflow-hidden bg-black text-white h-[460px] sm:h-[560px] lg:h-[620px] flex items-center justify-center border-b border-[#242424]">
      
      {/* Full-Size Background Images Stack with Opacity Transition */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {banners.map((slide, idx) => (
          <img
            key={slide.id || idx}
            src={slide.imageUrl}
            alt={slide.title}
            loading="eager"
            // @ts-ignore
            fetchPriority={idx === 0 ? 'high' : 'auto'}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ease-in-out brightness-105 ${
              activeIndex === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          />
        ))}
        {/* Subtle Bottom Vignette for Button Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-20 pointer-events-none"></div>
      </div>

      {/* Content Layered Above Full-Size Image */}
      <div className="relative z-30 mx-auto max-w-4xl px-4 py-8 text-center flex flex-col items-center justify-end h-full pb-8 sm:pb-12 w-full space-y-4 sm:space-y-5 pointer-events-none">

        {/* DYNAMIC CTA BUTTON (from Admin) */}
        {current.buttonText && (
          <div className="pointer-events-auto">
            <Link
              href={current.buttonLink || '/shop'}
              className="group flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#f4c84a] to-[#d4af37] px-8 py-3.5 sm:px-10 sm:py-4 text-xs sm:text-sm font-black tracking-widest text-black transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(244,200,74,0.7)] cursor-pointer shadow-2xl uppercase"
            >
              <span>{current.buttonText}</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1 text-black" />
            </Link>
          </div>
        )}

        {/* Slide Indicator Dots */}
        {banners.length > 1 && (
          <div className="flex items-center justify-center gap-2.5 pt-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`h-2.5 sm:h-3 rounded-full transition-all duration-300 cursor-pointer ${
                  activeIndex === idx ? 'w-8 sm:w-10 bg-[#f4c84a] shadow-[0_0_12px_rgba(244,200,74,0.8)]' : 'w-2.5 sm:w-3 bg-white/40 hover:bg-white/80'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
