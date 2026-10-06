'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { Lock, Check, CreditCard, ArrowRight, ChevronRight, ShieldCheck } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { PRODUCTS } from '../../data/jerseys';
import { useStore } from '../../context/StoreContext';
import { SizeGuideModal } from '../../components/SizeGuideModal';
import { TrackOrderModal } from '../../components/TrackOrderModal';
import { CustomJerseyStudio } from '../../components/CustomJerseyStudio';

export default function CheckoutPage() {
  const router = useRouter();
  const { 
    cartItems, 
    activeCurrency, 
    clearCart,
    wishlist,
    setActiveCurrency,
    addToCart
  } = useStore();

  const [step, setStep] = useState<1 | 2>(1);
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

  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [isCustomStudioOpen, setIsCustomStudioOpen] = useState(false);

  const rawSubtotalUSD = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const shippingCostUSD = formData.shippingMethod === 'express' ? 12 : 0;
  const grandTotalUSD = rawSubtotalUSD + shippingCostUSD;
  const grandTotalConverted = Math.round(grandTotalUSD * activeCurrency.rate);

  const handleCompletePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `JJ-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderId(newId);
    setIsCompleted(true);
    clearCart();

    try {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 }
      });
    } catch (err) {}
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-[#f4c84a] selection:text-black">
      
      <Navbar
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        wishlistCount={wishlist.length}
        activeCurrency={activeCurrency}
        onSelectCurrency={setActiveCurrency}
        onOpenCart={() => {}}
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
        onOpenCustomLab={() => setIsCustomStudioOpen(true)}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onSelectCategory={() => router.push('/shop')}
        products={PRODUCTS}
        onSelectProduct={(p) => router.push(`/shop/${p.slug}`)}
      />

      <div className="bg-[#0a0a0a] border-b border-[#242424] py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-gray-400 font-medium">
          <Link href="/" className="hover:text-[#f4c84a]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
          <Link href="/cart" className="hover:text-[#f4c84a]">Cart</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
          <span className="text-[#f4c84a] font-bold">Checkout</span>
        </div>
      </div>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 space-y-8">
        
        {!isCompleted ? (
          <div className="bg-[#080808] border border-[#242424] rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl">
            
            <div className="flex justify-between items-center border-b border-[#222] pb-6">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                <h1 className="text-xl font-bold font-serif uppercase tracking-wider text-white">
                  SECURE CHECKOUT
                </h1>
              </div>

              <div className="text-xs text-gray-400 font-mono">
                Step {step} of 2
              </div>
            </div>

            {step === 1 && (
              <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#f4c84a]">Shipping Address</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full bg-[#111] border border-[#333] rounded-xl px-3.5 py-2.5 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-[#111] border border-[#333] rounded-xl px-3.5 py-2.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Delivery Street Address</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-[#111] border border-[#333] rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase block mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full bg-[#111] border border-[#333] rounded-xl px-3.5 py-2.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase block mb-1">State / Zip</label>
                      <input
                        type="text"
                        required
                        value={formData.zip}
                        onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                        className="w-full bg-[#111] border border-[#333] rounded-xl px-3.5 py-2.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Country</label>
                      <input
                        type="text"
                        required
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full bg-[#111] border border-[#333] rounded-xl px-3.5 py-2.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-[#f4c84a] text-black font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 hover:bg-[#ffd96a] transition-all"
                >
                  <span>CONTINUE TO PAYMENT ({activeCurrency.symbol}{grandTotalConverted})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleCompletePayment} className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#f4c84a]">Payment Information</h2>

                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={formData.cardNumber}
                        onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                        className="w-full bg-[#111] border border-[#333] rounded-xl px-3.5 py-2.5 text-xs text-white pl-10"
                      />
                      <CreditCard className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Expiry Date</label>
                      <input
                        type="text"
                        required
                        value={formData.cardExpiry}
                        onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                        className="w-full bg-[#111] border border-[#333] rounded-xl px-3.5 py-2.5 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase block mb-1">CVC Code</label>
                      <input
                        type="text"
                        required
                        value={formData.cardCvc}
                        onChange={(e) => setFormData({ ...formData, cardCvc: e.target.value })}
                        className="w-full bg-[#111] border border-[#333] rounded-xl px-3.5 py-2.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-[#222]">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-4 bg-[#222] hover:bg-[#333] text-white font-bold text-xs rounded-xl"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-[#f4c84a] text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-[#ffd96a] transition-all shadow-lg"
                  >
                    PAY {activeCurrency.symbol}{grandTotalConverted} NOW
                  </button>
                </div>
              </form>
            )}

          </div>
        ) : (
          /* Order Confirmed Screen */
          <div className="bg-[#080808] border border-[#242424] rounded-3xl p-8 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                ORDER SUCCESSFUL & SENT TO PRINT LAB
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white uppercase font-serif">
                THANK YOU FOR YOUR ORDER!
              </h2>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Order Reference: <strong className="text-[#f4c84a] font-mono">{orderId}</strong>. A receipt has been sent to {formData.email}.
              </p>
            </div>

            <Link
              href="/shop"
              className="inline-block px-8 py-3.5 bg-[#f4c84a] hover:bg-[#ffd96a] text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all"
            >
              CONTINUE SHOPPING
            </Link>
          </div>
        )}

      </main>

      <Footer
        onOpenCustomLab={() => setIsCustomStudioOpen(true)}
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onSelectSport={() => router.push('/shop')}
      />

      <TrackOrderModal isOpen={isTrackOrderOpen} onClose={() => setIsTrackOrderOpen(false)} />
      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
      <CustomJerseyStudio isOpen={isCustomStudioOpen} onClose={() => setIsCustomStudioOpen(false)} activeCurrency={activeCurrency} onAddToCart={addToCart} />

    </div>
  );
}
