'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Filter, 
  Sparkles, 
  ArrowRight, 
  SlidersHorizontal,
  TrendingUp,
  Award
} from 'lucide-react';
import { JerseyProduct, VersionType, PatchOption } from '../types';
import { PRODUCTS, CURRENCIES, CATEGORIES } from '../data/jerseys';
import { Navbar } from '../components/Navbar';
import { HeroBanner } from '../components/HeroBanner';
import { CategoryGrid } from '../components/CategoryGrid';
import { JerseyCard } from '../components/JerseyCard';
import { CustomJerseyStudio } from '../components/CustomJerseyStudio';
import { CartDrawer } from '../components/CartDrawer';
import { CheckoutModal } from '../components/CheckoutModal';
import { TrackOrderModal } from '../components/TrackOrderModal';
import { SizeGuideModal } from '../components/SizeGuideModal';
import { ReviewsSection } from '../components/ReviewsSection';
import { Footer } from '../components/Footer';
import { useStore } from '../context/StoreContext';

export default function Home() {
  const router = useRouter();
  const {
    activeCurrency,
    setActiveCurrency,
    cartItems,
    wishlist,
    isCartOpen,
    setIsCartOpen,
    discountPercentage,
    applyCoupon,
    addToCart,
    updateQuantity,
    removeFromCart,
    toggleWishlist
  } = useStore();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedLeague, setSelectedLeague] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'bestseller' | 'price-low' | 'price-high'>('featured');

  const [isCustomStudioOpen, setIsCustomStudioOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Filter products
  let filteredProducts = PRODUCTS.filter((p) => {
    if (activeCategory !== 'all') {
      if (activeCategory === 'player-version' && !p.name.includes('PLAYER VERSION')) return false;
      if (activeCategory === 'retro' && p.sport !== 'retro') return false;
      if (activeCategory === 'formula-1' && p.league !== 'Formula 1') return false;
      if (activeCategory === 'cricket' && p.sport !== 'cricket') return false;
      if (activeCategory === 'nba' && p.sport !== 'nba') return false;
      if (activeCategory === 'jackets' && p.sport !== 'jackets') return false;
    }
    if (selectedLeague !== 'all' && p.league !== selectedLeague) return false;
    return true;
  });

  // Sort
  if (sortBy === 'bestseller') {
    filteredProducts = [...filteredProducts].sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
  } else if (sortBy === 'price-low') {
    filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-[#f4c84a] selection:text-black">
      
      {/* Navbar */}
      <Navbar
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        wishlistCount={wishlist.length}
        activeCurrency={activeCurrency}
        onSelectCurrency={setActiveCurrency}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
        onOpenCustomLab={() => setIsCustomStudioOpen(true)}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onSelectCategory={(cat) => setActiveCategory(cat)}
        products={PRODUCTS}
        onSelectProduct={(p) => router.push(`/shop/${p.slug}`)}
      />

      {/* Hero Banner Slider */}
      <HeroBanner
        activeCurrency={activeCurrency}
        onOpenCustomLab={() => setIsCustomStudioOpen(true)}
        onSelectCategory={(cat) => setActiveCategory(cat)}
        onSelectProduct={(p) => router.push(`/shop/${p.slug}`)}
        featuredProducts={PRODUCTS}
      />

      {/* Category Grid Section */}
      <CategoryGrid
        onSelectCategory={(catId) => setActiveCategory(catId)}
      />

      {/* Mid Banner Showcase Section */}
      <section className="bg-[#050505] px-5 py-16 lg:px-12 lg:py-24 relative overflow-hidden border-b border-[#242424]">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#f4c84a]/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="mx-auto grid max-w-[1420px] items-center gap-12 lg:grid-cols-2 lg:gap-24 relative z-10">
          
          <div className="hidden lg:block group relative aspect-[4/3] overflow-hidden rounded-2xl border border-[#242424] bg-[#0c0c0c] shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
            <img
              src="https://res.cloudinary.com/mcsohx4p/image/upload/v1788513650/jerseyspot/gojvmjz31hz2thbpruu4.webp"
              alt="Premium Football Jerseys"
              className="object-cover w-full h-full opacity-60 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute bottom-6 left-6 z-20 space-y-1">
              <span className="text-xs font-bold text-[#f4c84a] uppercase tracking-widest font-mono">
                AUTHENTIC MASTER QUALITY KITS
              </span>
              <h3 className="text-2xl font-black font-serif text-white uppercase">
                PERFECT FIT & MATCH QUALITY
              </h3>
            </div>
          </div>

          <div className="text-center lg:text-left flex flex-col items-center lg:items-start space-y-4">
            <span className="mb-2 inline-block rounded-full bg-[#f4c84a]/10 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-[#f4c84a] border border-[#f4c84a]/20">
              PREMIUM COLLECTION
            </span>

            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              WEAR THE GAME.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f4c84a] to-[#d4af37]">
                FEEL THE PASSION.
              </span>
            </h2>

            <p className="max-w-md text-base leading-relaxed text-gray-400">
              Experience the ultimate in fan apparel. Our premium football jerseys are crafted for true fans, featuring perfect fits, authentic details, and all-day comfort that stands the test of time.
            </p>

            <button
              onClick={() => router.push('/shop')}
              className="group flex items-center gap-3 rounded-full bg-gradient-to-r from-[#f4c84a] to-[#d4af37] px-8 py-4 text-sm font-bold tracking-wider text-black transition-all hover:shadow-[0_0_20px_rgba(244,200,74,0.4)] hover:-translate-y-1 mt-4"
            >
              <span>EXPLORE CATALOG</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

        </div>
      </section>

      {/* Featured Jerseys Product Showcase */}
      <section id="shop" className="bg-black px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-7xl">
          
          <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-end justify-between border-b border-[#242424] pb-6 gap-4">
            <div>
              <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-[#f4c84a]">JERSEY JUNCTION</p>
              <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl uppercase">
                {activeCategory === 'all' ? 'Featured Jerseys' : `${activeCategory.replace('-', ' ').toUpperCase()}`}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-[#111] border border-[#242424] rounded-lg px-3 py-2 text-xs text-white">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#f4c84a]" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
                >
                  <option value="featured" className="bg-black">Featured</option>
                  <option value="bestseller" className="bg-black">Bestseller</option>
                  <option value="price-low" className="bg-black">Price: Low to High</option>
                  <option value="price-high" className="bg-black">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {filteredProducts.map((product) => (
              <JerseyCard
                key={product.id}
                product={product}
                activeCurrency={activeCurrency}
                onSelectProduct={(p) => router.push(`/shop/${p.slug}`)}
                onQuickCustomize={(p) => router.push(`/shop/${p.slug}`)}
                isWishlisted={wishlist.some((item) => item.id === product.id)}
                onToggleWishlist={toggleWishlist}
              />
            ))}
          </div>

        </div>
      </section>

      {/* Customer Reviews Section */}
      <ReviewsSection />

      {/* Footer */}
      <Footer
        onOpenCustomLab={() => setIsCustomStudioOpen(true)}
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onSelectSport={(sport) => setActiveCategory(sport)}
      />

      {/* Slide-over Cart & Modals */}
      <CustomJerseyStudio
        isOpen={isCustomStudioOpen}
        onClose={() => setIsCustomStudioOpen(false)}
        activeCurrency={activeCurrency}
        onAddToCart={addToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        activeCurrency={activeCurrency}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
        discountPercentage={discountPercentage}
        onApplyCoupon={applyCoupon}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        activeCurrency={activeCurrency}
        onOrderSuccess={() => {}}
      />

      <TrackOrderModal
        isOpen={isTrackOrderOpen}
        onClose={() => setIsTrackOrderOpen(false)}
      />

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />

    </div>
  );
}
