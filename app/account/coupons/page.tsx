'use client';

import React from 'react';
import Link from 'next/link';
import { Ticket, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';

export default function CouponsPage() {
  const { appliedCouponCode, appliedCoupon } = useStore();

  return (
    <div className="space-y-6 font-sans max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#242424] pb-4 flex items-center gap-3">
        <Link 
          href="/account"
          className="p-2 rounded-xl bg-[#0d0d0d] border border-[#242424] text-gray-300 hover:text-white hover:border-[#f4c84a]/50 transition-colors"
          title="Back to My Account"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl sm:text-2xl font-black font-serif uppercase tracking-tight text-white flex items-center gap-2">
          <Ticket className="w-6 h-6 text-[#f4c84a]" />
          <span>PROMO &amp; COUPON CODES</span>
        </h1>
      </div>

      {appliedCouponCode ? (
        <div className="bg-[#0d0d0d] border border-emerald-500/30 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Active Coupon in Session</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xl font-black text-[#f4c84a] bg-[#f4c84a]/10 border border-[#f4c84a]/30 px-3 py-1 rounded-lg uppercase">
              {appliedCouponCode}
            </span>
            <span className="text-xs text-gray-400">
              {appliedCoupon?.maxDiscount && appliedCoupon.maxDiscount > 0
                ? `Capped at ₹${appliedCoupon.maxDiscount}`
                : `${appliedCoupon?.discountValue}% OFF`}
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-[#0d0d0d] border border-[#242424] rounded-2xl p-8 text-center space-y-4 max-w-lg mx-auto">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4c84a]/10 text-[#f4c84a] border border-[#f4c84a]/20">
            <Ticket className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold font-serif uppercase text-white">Have a Promotional Code?</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Promotional and influencer coupon codes can be applied directly in your cart or during checkout. Keep an eye out for special seasonal codes sent to your registered email!
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#f4c84a] hover:bg-[#ffd96a] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow"
          >
            <span>Explore Jerseys</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
