'use client';

import React from 'react';
import { Star, ShieldCheck, CheckCircle2, ThumbsUp, MessageSquareQuote } from 'lucide-react';
import { REVIEWS } from '../data/jerseys';

export const ReviewsSection: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 bg-zinc-950 dark:bg-zinc-950 light:bg-slate-100 border-b border-zinc-800 dark:border-zinc-800 light:border-slate-200 transition-colors">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 dark:text-amber-400 light:text-amber-700 text-xs font-bold uppercase tracking-widest">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>VERIFIED FAN FEEDBACK</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white dark:text-white light:text-slate-900 font-mono uppercase tracking-tight">
            RATED <span className="text-amber-500 dark:text-amber-400 light:text-amber-600">4.9 / 5</span> BY OVER 50,000+ FANS
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 dark:text-zinc-400 light:text-slate-600">
            Read real customer feedback from football fans around the world who customize their kits at Jersey Junction.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="bg-zinc-900 dark:bg-zinc-900 light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-slate-200 p-5 sm:p-6 rounded-2xl flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition-all shadow-md"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] text-emerald-400 dark:text-emerald-400 light:text-emerald-700 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    ✓ Verified Buyer
                  </span>
                </div>

                <p className="text-xs text-zinc-300 dark:text-zinc-300 light:text-slate-700 italic leading-relaxed">
                  &quot;{rev.comment}&quot;
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-800/80 dark:border-zinc-800/80 light:border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white dark:text-white light:text-slate-900">{rev.userName}</div>
                  <div className="text-[10px] text-zinc-400 dark:text-zinc-500 light:text-slate-500">{rev.jerseyName}</div>
                </div>
                <ThumbsUp className="w-4 h-4 text-zinc-500 dark:text-zinc-600 light:text-slate-400" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
