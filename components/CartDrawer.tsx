'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Tag, Sparkles } from 'lucide-react';
import { CartItem, Currency } from '../types';
import { JerseyViewerSVG } from './JerseyViewerSVG';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  activeCurrency: Currency;
  onOpenCheckout: () => void;
  discountPercentage: number;
  onApplyCoupon: (code: string) => boolean;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  activeCurrency,
  onOpenCheckout,
  discountPercentage,
  onApplyCoupon
}) => {
  const router = useRouter();
  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Close on Escape key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const rawSubtotalUSD = items.reduce((acc, item) => acc + item.totalPrice, 0);
  const discountUSD = (rawSubtotalUSD * discountPercentage) / 100;
  const finalSubtotalUSD = Math.max(0, rawSubtotalUSD - discountUSD);

  const freeShippingThresholdUSD = 75;
  const progressToFreeShipping = Math.min(100, (rawSubtotalUSD / freeShippingThresholdUSD) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThresholdUSD - rawSubtotalUSD);

  const subtotalConverted = (finalSubtotalUSD * activeCurrency.rate).toFixed(2);

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const success = onApplyCoupon(couponCode.trim());
    if (success) {
      setCouponMsg({ text: 'Coupon SPOT10 Applied! 10% OFF Savings', isError: false });
    } else {
      setCouponMsg({ text: 'Invalid coupon code. Try SPOT10', isError: true });
    }
  };

  return (
    <div className="fixed inset-0 z-[300] overflow-hidden animate-fade-in">
      {/* Clickable Backdrop Overlay */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md transition-opacity duration-300"
        aria-label="Close cart overlay"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10 pointer-events-none">
        <div className="w-screen max-w-md bg-white dark:bg-zinc-950 border-l border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 flex flex-col justify-between shadow-2xl pointer-events-auto relative z-10 animate-slide-in-right">
          
          {/* Header */}
          <div className="px-6 py-4 bg-slate-100 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-mono uppercase tracking-tight">
                YOUR BAG ({items.reduce((sum, i) => sum + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-600 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white rounded-full bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 transition-colors"
              aria-label="Close bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>



          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 bg-slate-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto text-slate-400 dark:text-zinc-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="text-slate-600 dark:text-zinc-300 text-sm font-semibold">Your cart is currently empty.</div>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold text-xs rounded-xl uppercase tracking-wider shadow-md transition-all"
                >
                  Explore Kits
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-2xl flex gap-4 relative group shadow-sm"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-24 bg-white dark:bg-zinc-950 rounded-xl flex items-center justify-center p-1 border border-slate-200 dark:border-zinc-800 shrink-0 overflow-hidden">
                    {item.product.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-contain drop-shadow-md rounded-lg"
                      />
                    ) : (
                      <JerseyViewerSVG
                        primaryColor={item.product.colors.primary}
                        secondaryColor={item.product.colors.secondary}
                        accentColor={item.product.colors.accent}
                        textColor={item.product.colors.text}
                        pattern={item.product.pattern}
                        name={item.customName || item.product.defaultName}
                        number={item.customNumber || item.product.defaultNumber}
                        view="back"
                        height={85}
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{item.product.name}</h4>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-slate-400 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1 text-[10px]">
                      <span className="bg-slate-200 text-slate-800 dark:bg-zinc-800 dark:text-zinc-200 px-1.5 py-0.5 rounded font-bold">
                        SIZE {item.size}
                      </span>
                      {item.customName && (
                        <span className="bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-400/10 dark:text-amber-300 dark:border-amber-400/20 px-1.5 py-0.5 rounded font-bold">
                          PRINT: {item.customName} #{item.customNumber}
                        </span>
                      )}
                      {item.selectedPatches.length > 0 && (
                        <span className="bg-purple-100 text-purple-800 border border-purple-300 dark:bg-purple-400/10 dark:text-purple-300 dark:border-purple-400/20 px-1.5 py-0.5 rounded font-bold">
                          +{item.selectedPatches.length} PATCHES
                        </span>
                      )}
                    </div>

                    {/* Quantity & Item Subtotal */}
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex items-center gap-2 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg p-0.5">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="p-1 text-slate-600 hover:text-amber-600 dark:text-zinc-300 dark:hover:text-amber-400"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center text-slate-900 dark:text-white">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="p-1 text-slate-600 hover:text-amber-600 dark:text-zinc-300 dark:hover:text-amber-400"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-sm font-bold text-amber-700 dark:text-amber-400 font-mono">
                        {activeCurrency.symbol}{(item.totalPrice * activeCurrency.rate).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-6 bg-slate-100 dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 space-y-4">
              
              {/* Coupon code input */}
              <form onSubmit={handleCouponSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Promo code (SPOT10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white uppercase focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-800 dark:bg-zinc-800 hover:bg-slate-700 dark:hover:bg-zinc-700 text-xs font-bold text-white rounded-xl"
                >
                  Apply
                </button>
              </form>

              {couponMsg && (
                <div className={`text-xs font-semibold ${couponMsg.isError ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {couponMsg.text}
                </div>
              )}

              {/* Price totals */}
              <div className="space-y-1.5 text-xs text-slate-700 dark:text-zinc-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-900 dark:text-zinc-100 font-medium">{activeCurrency.symbol}{(rawSubtotalUSD * activeCurrency.rate).toFixed(2)}</span>
                </div>
                {discountPercentage > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Discount ({discountPercentage}%)</span>
                    <span>-{activeCurrency.symbol}{(discountUSD * activeCurrency.rate).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-slate-900 dark:text-zinc-200">
                    Calculated at Checkout
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-zinc-800">
                  <span>Total</span>
                  <span className="text-amber-700 dark:text-amber-400 font-mono">{activeCurrency.symbol}{subtotalConverted}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  onClose();
                  if (onOpenCheckout) onOpenCheckout();
                  router.push('/checkout');
                }}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-widest rounded-xl shadow-xl flex items-center justify-center gap-2 hover:scale-[1.01] transition-all cursor-pointer"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
