'use client';

import React, { useState, useEffect } from 'react';
import { Ticket, Copy, Check, Sparkles } from 'lucide-react';
import { couponService } from '../../../lib/services/couponService';
import { AdminCoupon } from '../../../lib/types/admin';
import { useStore } from '../../../context/StoreContext';

export default function CouponsPage() {
  const { applyCoupon } = useStore();
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const list = couponService.getCoupons();
    setCoupons(list.filter(c => c.status === 'Active'));
  }, []);

  const handleApply = (code: string) => {
    try {
      navigator.clipboard.writeText(code);
    } catch (e) {}

    applyCoupon(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="border-b border-[#242424] pb-4">
        <h1 className="text-xl sm:text-2xl font-black font-serif uppercase tracking-tight text-white flex items-center gap-2">
          <Ticket className="w-6 h-6 text-[#f4c84a]" />
          <span>AVAILABLE COUPONS ({coupons.length})</span>
        </h1>
        <p className="text-xs text-gray-400">Copy or apply promo codes for instant savings at checkout</p>
      </div>

      {/* Coupons List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {coupons.map((c) => {
          const isCopied = copiedCode === c.code;
          return (
            <div key={c.id} className="bg-[#0d0d0d] border border-[#242424] rounded-2xl p-5 space-y-4 hover:border-[#f4c84a]/40 transition-colors relative overflow-hidden group">
              
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="px-3 py-1 bg-[#f4c84a]/10 border border-[#f4c84a]/30 text-[#f4c84a] font-mono font-extrabold text-sm rounded-lg inline-block uppercase">
                    {c.code}
                  </div>
                  <div className="text-2xl font-black font-serif uppercase text-white tracking-tight pt-1">
                    {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                  </div>
                </div>

                <button
                  onClick={() => handleApply(c.code)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 uppercase tracking-wider ${
                    isCopied
                      ? 'bg-emerald-500 text-white shadow'
                      : 'bg-[#f4c84a] hover:bg-[#e0b438] text-black shadow-md font-extrabold'
                  }`}
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'COPIED!' : 'APPLY'}</span>
                </button>
              </div>

              <div className="space-y-2 text-xs text-gray-300">
                <p>
                  Get {c.discountType === 'percentage' ? `${c.discountValue}% off` : `₹${c.discountValue} flat discount`} on orders above ₹{c.minOrder}.
                  {c.maxDiscount ? ` (Max discount ₹${c.maxDiscount})` : ''}
                </p>

                <div className="flex items-center justify-between text-[11px] font-mono text-gray-500 pt-2 border-t border-[#222]">
                  <span>Expires: {c.expiryDate}</span>
                  <span className="text-amber-400">Valid on All Kits</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
