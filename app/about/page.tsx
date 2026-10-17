'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Award, 
  Truck, 
  Sparkles, 
  ChevronRight, 
  CheckCircle2, 
  Shirt, 
  Flame, 
  ArrowRight,
  Mail
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { productService } from '../../lib/services/productService';
import { JerseyProduct } from '../../types';
import { useStore } from '../../context/StoreContext';
import { SizeGuideModal } from '../../components/SizeGuideModal';
import { CustomJerseyStudio } from '../../components/CustomJerseyStudio';
import { CartDrawer } from '../../components/CartDrawer';

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

  const [products, setProducts] = useState<JerseyProduct[]>([]);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isCustomStudioOpen, setIsCustomStudioOpen] = useState(false);

  useEffect(() => {
    const cached = productService.getCachedProductsSync();
    if (cached.length > 0) setProducts(cached);
    productService.getActiveProducts().then(setProducts).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-[#f4c84a] selection:text-black">
      
      {/* Navigation Header */}
      <Navbar
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        wishlistCount={wishlist.length}
        activeCurrency={activeCurrency}
        onSelectCurrency={setActiveCurrency}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenCustomLab={() => setIsCustomStudioOpen(true)}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onSelectCategory={() => router.push('/shop')}
        products={products}
        onSelectProduct={(p) => router.push(`/shop/${p.slug}`)}
      />

      {/* Breadcrumb Bar */}
      <div className="bg-[#0a0a0a] border-b border-[#242424] py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-gray-400 font-medium">
          <Link href="/" className="hover:text-[#f4c84a] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
          <span className="text-[#f4c84a] font-bold">About Us</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
        
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="inline-block rounded-full bg-[#f4c84a]/10 px-4 py-1 text-xs font-mono font-bold text-[#f4c84a] border border-[#f4c84a]/20 uppercase tracking-widest">
            OUR STORY & PASSION
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-serif uppercase tracking-tight text-white">
            WEAR THE GAME. FEEL THE PASSION.
          </h1>
          <p className="text-gray-400 text-xs sm:text-base leading-relaxed">
            Jersey Junction was founded by die-hard football fanatics with a single mission: bring master-quality authentic matchday kits, classic retros, and custom player shirts directly to true supporters at honest prices.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0d0d0d] border border-[#242424] hover:border-[#f4c84a]/40 p-8 rounded-3xl space-y-4 transition-colors shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-[#f4c84a]/10 border border-[#f4c84a]/20 flex items-center justify-center text-[#f4c84a]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-black uppercase text-lg text-white">Master Quality Standards</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Every kit features precise 1:1 matchday embroidery, silicone/heat-bonded club crests, official sponsor transfers, and breathable AEROREADY/Dri-FIT weave structures.
            </p>
          </div>

          <div className="bg-[#0d0d0d] border border-[#242424] hover:border-[#f4c84a]/40 p-8 rounded-3xl space-y-4 transition-colors shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-[#f4c84a]/10 border border-[#f4c84a]/20 flex items-center justify-center text-[#f4c84a]">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-black uppercase text-lg text-white">Custom Print Studio</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Customize any club or national jersey with your personal name & number or favorite superstar. Pressed using authentic tournament fonts and thermo-bonded vinyl.
            </p>
          </div>

          <div className="bg-[#0d0d0d] border border-[#242424] hover:border-[#f4c84a]/40 p-8 rounded-3xl space-y-4 transition-colors shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-[#f4c84a]/10 border border-[#f4c84a]/20 flex items-center justify-center text-[#f4c84a]">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-black uppercase text-lg text-white">Fast Tracked Delivery</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Secure express air shipping dispatched in 24-48 hours. Receive automatic tracking updates right to your phone so you never miss matchday kickoff.
            </p>
          </div>
        </div>

        {/* Player vs Fan Cut Comparison Box */}
        <div className="bg-[#0d0d0d] border border-[#242424] rounded-3xl p-6 sm:p-10 space-y-6">
          <div className="border-b border-[#202020] pb-4 space-y-1">
            <h2 className="font-serif font-black text-xl sm:text-2xl uppercase tracking-tight text-[#f4c84a] flex items-center gap-2">
              <Shirt className="w-6 h-6" />
              <span>Player Version vs Fan Version Explained</span>
            </h2>
            <p className="text-xs text-gray-400">
              Choosing the right fit is essential for ultimate matchday comfort.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs leading-relaxed">
            <div className="bg-[#141414] border border-[#2a2a2a] p-6 rounded-2xl space-y-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#f4c84a]">
                ATHLETIC PRO FIT
              </span>
              <h4 className="font-serif font-bold text-white text-base uppercase">Player Version</h4>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#f4c84a] shrink-0 mt-0.5" />
                  <span>Exact cut worn by players on the field.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#f4c84a] shrink-0 mt-0.5" />
                  <span>Heat-applied lightweight silicone badges and sponsor graphics.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#f4c84a] shrink-0 mt-0.5" />
                  <span>Slim, contoured athletic silhouette (order 1 size up if you prefer loose).</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#141414] border border-[#2a2a2a] p-6 rounded-2xl space-y-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">
                CLASSIC STANDARD FIT
              </span>
              <h4 className="font-serif font-bold text-white text-base uppercase">Fan Version</h4>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Standard relaxed cut designed for everyday comfort.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Durable embroidered club crests and badges.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>True to size regular fit suitable for street or stadium wear.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-zinc-900 via-black to-zinc-900 border border-[#f4c84a]/30 rounded-3xl p-8 sm:p-12 text-center space-y-4">
          <h2 className="font-serif font-black text-2xl sm:text-3xl uppercase tracking-tight text-white">
            Ready To Rep Your Colors?
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto">
            Browse our complete catalog of Premier League, La Liga, Serie A, International, NBA, and Vintage Retro kits today.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/shop"
              className="px-8 py-3.5 bg-gradient-to-r from-[#f4c84a] to-amber-500 hover:from-amber-400 hover:to-amber-600 text-black font-extrabold uppercase rounded-full text-xs flex items-center gap-2 cursor-pointer transition-all shadow-xl hover:scale-105"
            >
              <span>Explore The Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3.5 bg-zinc-900 border border-zinc-700 hover:border-[#f4c84a] text-white font-extrabold uppercase rounded-full text-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <Mail className="w-4 h-4 text-[#f4c84a]" />
              <span>Contact Our Team</span>
            </Link>
          </div>
        </div>

      </main>

      {/* Footer */}
      <Footer
        onOpenCustomLab={() => setIsCustomStudioOpen(true)}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onSelectSport={() => router.push('/shop')}
      />

      {/* Modals & Cart */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems} 
        onUpdateQuantity={updateQuantity} 
        onRemoveItem={removeFromCart} 
        activeCurrency={activeCurrency} 
        onOpenCheckout={() => router.push('/checkout')} 
        discountPercentage={discountPercentage} 
        onApplyCoupon={applyCoupon} 
      />

      <SizeGuideModal 
        isOpen={isSizeGuideOpen} 
        onClose={() => setIsSizeGuideOpen(false)} 
      />

      {isCustomStudioOpen && (
        <CustomJerseyStudio 
          isOpen={isCustomStudioOpen} 
          onClose={() => setIsCustomStudioOpen(false)} 
          activeCurrency={activeCurrency}
          onAddToCart={addToCart}
        />
      )}

    </div>
  );
}
