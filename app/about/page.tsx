'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Award, Truck, Sparkles, ChevronRight } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { PRODUCTS } from '../../data/jerseys';
import { useStore } from '../../context/StoreContext';
import { SizeGuideModal } from '../../components/SizeGuideModal';
import { TrackOrderModal } from '../../components/TrackOrderModal';
import { CustomJerseyStudio } from '../../components/CustomJerseyStudio';
import { CartDrawer } from '../../components/CartDrawer';
import { CheckoutModal } from '../../components/CheckoutModal';

export default function AboutPage() {
  const router = useRouter();
  const { 
    wishlist, 
    activeCurrency, 
    cartItems, 
    updateQuantity, 
    removeFromCart,
    isCartOpen,
    setIsCartOpen,
    discountPercentage,
    applyCoupon,
    setActiveCurrency,
    addToCart
  } = useStore();

  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [isCustomStudioOpen, setIsCustomStudioOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-[#f4c84a] selection:text-black">
      
      <Navbar
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        wishlistCount={wishlist.length}
        activeCurrency={activeCurrency}
        onSelectCurrency={setActiveCurrency}
        onOpenCart={() => setIsCartOpen(true)}
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
          <span className="text-[#f4c84a] font-bold">About Us</span>
        </div>
      </div>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 space-y-12">
        <div className="text-center space-y-4 border-b border-[#242424] pb-8">
          <span className="inline-block rounded-full bg-[#f4c84a]/10 px-4 py-1 text-xs font-bold text-[#f4c84a] border border-[#f4c84a]/20 uppercase">
            ABOUT JERSEY JUNCTION
          </span>
          <h1 className="text-4xl sm:text-5xl font-black font-serif uppercase tracking-tight">
            FOR THE FANS. BY THE FANS.
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm">
            Jersey Junction is your destination for master-quality football kits, NBA swingman jerseys, vintage retros, and bespoke custom printing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-[#080808] border border-[#242424] p-6 rounded-2xl space-y-3">
            <ShieldCheck className="w-8 h-8 text-[#f4c84a] mx-auto" />
            <h3 className="font-bold text-white font-serif uppercase">Master Quality</h3>
            <p className="text-xs text-gray-400">High density crests, moisture wicking fabrics, and official fonts.</p>
          </div>

          <div className="bg-[#080808] border border-[#242424] p-6 rounded-2xl space-y-3">
            <Sparkles className="w-8 h-8 text-[#f4c84a] mx-auto" />
            <h3 className="font-bold text-white font-serif uppercase">Custom Lab</h3>
            <p className="text-xs text-gray-400">Render your custom name & number live in 3D before ordering.</p>
          </div>

          <div className="bg-[#080808] border border-[#242424] p-6 rounded-2xl space-y-3">
            <Truck className="w-8 h-8 text-[#f4c84a] mx-auto" />
            <h3 className="font-bold text-white font-serif uppercase">Express Delivery</h3>
            <p className="text-xs text-gray-400">Fast worldwide tracked air express dispatch in 3-5 days.</p>
          </div>
        </div>
      </main>

      <Footer
        onOpenCustomLab={() => setIsCustomStudioOpen(true)}
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onSelectSport={() => router.push('/shop')}
      />

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cartItems} onUpdateQuantity={updateQuantity} onRemoveItem={removeFromCart} activeCurrency={activeCurrency} onOpenCheckout={() => setIsCheckoutOpen(true)} discountPercentage={discountPercentage} onApplyCoupon={applyCoupon} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} items={cartItems} activeCurrency={activeCurrency} onOrderSuccess={() => {}} />
      <TrackOrderModal isOpen={isTrackOrderOpen} onClose={() => setIsTrackOrderOpen(false)} />
      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
      <CustomJerseyStudio isOpen={isCustomStudioOpen} onClose={() => setIsCustomStudioOpen(false)} activeCurrency={activeCurrency} onAddToCart={addToCart} />

    </div>
  );
}
