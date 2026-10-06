'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Check, ShieldCheck, Lock, CreditCard, Truck, Sparkles, Download, ArrowLeft, ArrowRight } from 'lucide-react';
import { CartItem, Currency } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  activeCurrency: Currency;
  onOrderSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  activeCurrency,
  onOrderSuccess
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({
    fullName: 'Alexander Wright',
    email: 'alex.wright@example.com',
    address: '742 Evergreen Terrace',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90001',
    country: 'United States',
    shippingMethod: 'express',
    cardNumber: '•••• •••• •••• 4242',
    cardExpiry: '12/28',
    cardCvc: '888'
  });

  const [orderId, setOrderId] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const rawSubtotalUSD = items.reduce((acc, item) => acc + item.totalPrice, 0);
  const shippingCostUSD = formData.shippingMethod === 'express' ? 12.00 : 0.00;
  const grandTotalUSD = rawSubtotalUSD + shippingCostUSD;
  const grandTotalConverted = (grandTotalUSD * activeCurrency.rate).toFixed(2);

  const handleCompletePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `JS-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderId(newId);
    setIsCompleted(true);

    // Fire Confetti Celebration!
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.log('Confetti error', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl my-8 flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-white font-mono uppercase">
              SECURE CHECKOUT
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900 hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isCompleted ? (
          <div className="p-6 space-y-6">
            
            {/* Step Indicators */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 text-xs font-bold">
              <div className={`flex items-center gap-2 ${step >= 1 ? 'text-amber-400' : 'text-zinc-500'}`}>
                <span className="w-6 h-6 rounded-full bg-zinc-800 border flex items-center justify-center">1</span>
                <span>Shipping Info</span>
              </div>
              <div className="h-0.5 flex-1 mx-4 bg-zinc-800"></div>
              <div className={`flex items-center gap-2 ${step >= 2 ? 'text-amber-400' : 'text-zinc-500'}`}>
                <span className="w-6 h-6 rounded-full bg-zinc-800 border flex items-center justify-center">2</span>
                <span>Payment</span>
              </div>
            </div>

            {step === 1 && (
              <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase block mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase block mb-1">Delivery Address</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase block mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase block mb-1">Postal Code</label>
                    <input
                      type="text"
                      required
                      value={formData.zip}
                      onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase block mb-1">Country</label>
                    <input
                      type="text"
                      required
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-white"
                    />
                  </div>
                </div>

                {/* Shipping speed selection */}
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase block mb-2">Shipping Option</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() => setFormData({ ...formData, shippingMethod: 'express' })}
                      className={`p-3 rounded-xl border text-xs cursor-pointer flex justify-between items-center ${
                        formData.shippingMethod === 'express'
                          ? 'bg-amber-500/10 border-amber-400 text-amber-300'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-white">DHL Air Express (3-5 Days)</div>
                        <div className="text-[10px] text-zinc-400">Tracked Air Delivery</div>
                      </div>
                      <span className="font-black text-amber-400">+$12.00</span>
                    </div>

                    <div
                      onClick={() => setFormData({ ...formData, shippingMethod: 'standard' })}
                      className={`p-3 rounded-xl border text-xs cursor-pointer flex justify-between items-center ${
                        formData.shippingMethod === 'standard'
                          ? 'bg-amber-500/10 border-amber-400 text-amber-300'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-white">Standard Delivery (7-10 Days)</div>
                        <div className="text-[10px] text-zinc-400">Global Postal Service</div>
                      </div>
                      <span className="font-black text-emerald-400">FREE</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 mt-4"
                >
                  <span>CONTINUE TO PAYMENT</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleCompletePayment} className="space-y-4">
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-zinc-400 block">Deliver to:</span>
                    <strong className="text-white">{formData.fullName} ({formData.city}, {formData.country})</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-amber-400 underline font-semibold"
                  >
                    Edit
                  </button>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase block mb-1">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.cardNumber}
                      onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-white pl-10"
                    />
                    <CreditCard className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase block mb-1">Expiry Date</label>
                    <input
                      type="text"
                      required
                      value={formData.cardExpiry}
                      onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase block mb-1">CVC Code</label>
                    <input
                      type="text"
                      required
                      value={formData.cardCvc}
                      onChange={(e) => setFormData({ ...formData, cardCvc: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-white"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-zinc-400">Total Charged</span>
                    <div className="text-2xl font-black text-amber-400 font-mono">
                      {activeCurrency.symbol}{grandTotalConverted}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs uppercase tracking-widest rounded-xl shadow-lg"
                    >
                      PAY {activeCurrency.symbol}{grandTotalConverted} NOW
                    </button>
                  </div>
                </div>
              </form>
            )}

          </div>
        ) : (
          /* Order Confirmed Screen */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                ORDER SUCCESSFUL & DISPATCHED TO PRINT LAB
              </span>
              <h3 className="text-2xl font-black text-white uppercase font-mono">
                THANK YOU FOR YOUR ORDER!
              </h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Order Reference: <strong className="text-amber-400 font-mono text-sm">{orderId}</strong>. A tracking link has been sent to {formData.email}.
              </p>
            </div>

            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 text-left max-w-md mx-auto text-xs space-y-2">
              <div className="font-bold text-white border-b border-zinc-800 pb-2">ORDER RECEIPT</div>
              <div className="flex justify-between text-zinc-400">
                <span>Items ({items.length})</span>
                <span className="text-zinc-200">{activeCurrency.symbol}{(rawSubtotalUSD * activeCurrency.rate).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Shipping ({formData.shippingMethod.toUpperCase()})</span>
                <span className="text-zinc-200">{activeCurrency.symbol}{(shippingCostUSD * activeCurrency.rate).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-black text-white pt-2 border-t border-zinc-800 text-sm">
                <span>Grand Total</span>
                <span className="text-amber-400 font-mono">{activeCurrency.symbol}{grandTotalConverted}</span>
              </div>
            </div>

            <button
              onClick={() => {
                onOrderSuccess();
                onClose();
              }}
              className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-widest rounded-xl shadow-lg"
            >
              CONTINUE SHOPPING
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
