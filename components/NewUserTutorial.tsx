'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  ShoppingBag, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Hand, 
  Shirt, 
  CreditCard, 
  Tag, 
  Truck,
  RotateCcw
} from 'lucide-react';

interface Step {
  stepNumber: number;
  title: string;
  subtitle: string;
  tapTargetLabel: string;
  description: string;
  tip: string;
  visualType: 'card' | 'options' | 'addcart' | 'cartbag' | 'checkout';
}

const TUTORIAL_STEPS: Step[] = [
  {
    stepNumber: 1,
    title: '1. Tap Any Jersey to Open Details',
    subtitle: 'Browse through our authentic kits and fan editions',
    tapTargetLabel: 'Tap on Jersey Card',
    description: 'Browse the home page, collections, or search for your favorite club or country. Tap anywhere on a jersey card to open its full customization page.',
    tip: '💡 Look out for "BESTSELLER" tags for the hottest match-day drops.',
    visualType: 'card',
  },
  {
    stepNumber: 2,
    title: '2. Tap to Choose Size & Custom Printing',
    subtitle: 'Personalize your fit and sleeve badges',
    tapTargetLabel: 'Tap Size (S, M, L, XL...) & Version',
    description: 'Tap your preferred size, select Fan Version (standard fit) or Player Version (athletic slim fit). You can also add your custom Name & Number printed on the back!',
    tip: '💡 Check the "Size Guide" ruler icon anytime to ensure a perfect fit.',
    visualType: 'options',
  },
  {
    stepNumber: 3,
    title: '3. Tap the Gold "Add to Cart" Button',
    subtitle: 'Save your customized kit to your bag',
    tapTargetLabel: 'Tap "Add to Cart"',
    description: 'Once you select your size and options, tap the big gold "Add to Cart" button at the bottom of the product page. Your selection is immediately saved in your bag.',
    tip: '💡 You can add multiple kits before heading to checkout.',
    visualType: 'addcart',
  },
  {
    stepNumber: 4,
    title: '4. Tap the Cart Bag (Top-Right)',
    subtitle: 'Review items and enter discount coupons',
    tapTargetLabel: 'Tap Cart Bag in Top Navigation',
    description: 'Look at the top-right corner of your screen and tap the Shopping Bag icon. The cart drawer will slide open showing your items, shipping fee, and coupon box.',
    tip: '💡 Have a discount code? Type it in the coupon box and tap "Apply".',
    visualType: 'cartbag',
  },
  {
    stepNumber: 5,
    title: '5. Tap "Proceed to Checkout" to Order',
    subtitle: 'Fast delivery with COD or UPI payment',
    tapTargetLabel: 'Tap "Proceed to Checkout"',
    description: 'Tap "Proceed to Checkout", type your delivery address and mobile number, then choose Cash on Delivery (COD) or Online UPI payment to confirm your order!',
    tip: '💡 You will receive instant order confirmation and live tracking.',
    visualType: 'checkout',
  },
];

const TUTORIAL_STORAGE_KEY = 'jj_new_user_tutorial_completed_v1';

export const NewUserTutorial: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);

  useEffect(() => {
    // Only show for new users who haven't completed or dismissed it
    try {
      const isCompleted = localStorage.getItem(TUTORIAL_STORAGE_KEY);
      if (!isCompleted) {
        // Slight delay so the page loads first
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch (e) {}
    setHasCheckedStorage(true);
  }, []);

  // Listen for manual trigger (e.g. from footer or help button)
  useEffect(() => {
    const handleOpenTutorial = () => {
      setCurrentStepIndex(0);
      setIsOpen(true);
    };
    window.addEventListener('jj:open-tutorial', handleOpenTutorial);
    return () => window.removeEventListener('jj:open-tutorial', handleOpenTutorial);
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    } catch (e) {}
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStepIndex < TUTORIAL_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleDismiss();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  if (!isOpen) {
    return null;
  }

  const step = TUTORIAL_STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === TUTORIAL_STEPS.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-title"
      className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 select-none animate-fade-in"
    >
      <div className="w-full max-w-xl bg-zinc-950 border border-amber-400/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col font-sans">
        
        {/* Top Header Bar */}
        <div className="bg-zinc-900/90 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>FIRST TIME HERE? HOW TO ORDER</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-zinc-400 font-bold">
              Step {step.stepNumber} of {TUTORIAL_STEPS.length}
            </span>
            <button
              onClick={handleDismiss}
              className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              title="Close Tutorial"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Interactive Visual Demo Card */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Animated Tap Playground Box */}
          <div 
            onClick={handleNext}
            className="group relative bg-zinc-900 border border-zinc-800 hover:border-amber-400/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all overflow-hidden min-h-[170px]"
          >
            {/* Pulsing Tap Indicator */}
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-[10px] font-bold text-amber-400 font-mono">
              <Hand className="w-3 h-3 animate-bounce" />
              <span>TAP HERE TO TRY</span>
            </div>

            {/* Visual Step Illustration */}
            {step.visualType === 'card' && (
              <div className="space-y-3 flex flex-col items-center">
                <div className="relative w-28 h-28 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <Shirt className="w-14 h-14 text-amber-400" />
                  <span className="absolute -top-2 bg-amber-400 text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                    TAP ME
                  </span>
                </div>
                <div className="text-xs font-bold text-zinc-200">
                  Real Madrid 24/25 Home Kit
                </div>
              </div>
            )}

            {step.visualType === 'options' && (
              <div className="space-y-3 w-full max-w-xs">
                <div className="text-[11px] text-zinc-400 font-bold uppercase">SELECT SIZE & FIT:</div>
                <div className="flex justify-center gap-2">
                  {['S', 'M', 'L', 'XL', 'XXL'].map((sz, i) => (
                    <span
                      key={sz}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                        i === 1
                          ? 'bg-amber-400 text-black border-amber-400 font-black scale-105'
                          : 'bg-zinc-950 text-zinc-300 border-zinc-800'
                      }`}
                    >
                      {sz}
                    </span>
                  ))}
                </div>
                <div className="inline-block px-3 py-1 bg-zinc-950 border border-amber-400/40 rounded-full text-[10px] text-amber-300 font-bold">
                  ✓ Player Version + Custom Name Printing
                </div>
              </div>
            )}

            {step.visualType === 'addcart' && (
              <div className="space-y-3 flex flex-col items-center w-full max-w-xs">
                <div className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black text-xs uppercase tracking-widest rounded-xl shadow-xl flex items-center justify-center gap-2 group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-4 h-4" />
                  <span>ADD TO CART — ₹1,199</span>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">
                  Items are immediately secured in your bag
                </span>
              </div>
            )}

            {step.visualType === 'cartbag' && (
              <div className="space-y-3 flex flex-col items-center">
                <div className="relative p-4 rounded-2xl bg-zinc-950 border border-zinc-700 shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-10 h-10 text-amber-400" />
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-black text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shadow">
                    1
                  </span>
                </div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cart Drawer with Coupon Code Support</span>
                </div>
              </div>
            )}

            {step.visualType === 'checkout' && (
              <div className="space-y-3 w-full max-w-xs flex flex-col items-center">
                <div className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300 font-mono flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <Truck className="w-3.5 h-3.5" /> Cash on Delivery (COD)
                  </span>
                  <span className="text-amber-400 font-bold">Available</span>
                </div>
                <div className="w-full py-3 bg-gradient-to-r from-[#f4c84a] to-[#d4af37] text-black font-black text-xs uppercase tracking-widest rounded-xl shadow-lg flex items-center justify-center gap-2 group-hover:scale-105 transition-transform">
                  <CreditCard className="w-4 h-4" />
                  <span>PROCEED TO CHECKOUT</span>
                </div>
              </div>
            )}

          </div>

          {/* Text Instructions */}
          <div className="space-y-2">
            <h2 id="tutorial-title" className="text-lg sm:text-xl font-bold text-white">
              {step.title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {step.description}
            </p>
            <div className="p-3 bg-amber-400/10 border border-amber-400/20 rounded-xl text-xs text-amber-300 font-medium">
              {step.tip}
            </div>
          </div>

          {/* Step Dots Indicator */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {TUTORIAL_STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIndex
                    ? 'w-8 bg-amber-400'
                    : 'w-2 bg-zinc-800 hover:bg-zinc-700'
                }`}
                title={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-zinc-900/90 border-t border-zinc-800 px-6 py-4 flex items-center justify-between gap-3">
          <button
            onClick={handleDismiss}
            className="text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            Skip Tutorial
          </button>

          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrev}
                className="px-4 py-2.5 rounded-xl border border-zinc-800 hover:bg-zinc-800 text-xs font-bold text-zinc-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow flex items-center gap-2 cursor-pointer"
            >
              <span>{isLastStep ? 'Start Shopping' : 'Next Step'}</span>
              {isLastStep ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
