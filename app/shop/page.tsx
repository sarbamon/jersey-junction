'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Filter, SlidersHorizontal, ChevronRight, TrendingUp } from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '../../data/jerseys';
import { JerseyCard } from '../../components/JerseyCard';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { CartDrawer } from '../../components/CartDrawer';
import { SizeGuideModal } from '../../components/SizeGuideModal';
import { TrackOrderModal } from '../../components/TrackOrderModal';
import { CustomJerseyStudio } from '../../components/CustomJerseyStudio';
import { CheckoutModal } from '../../components/CheckoutModal';
import { useStore } from '../../context/StoreContext';

export default function ShopPage() {
  const router = useRouter();
  const { 
    activeCurrency, 
    wishlist, 
    toggleWishlist, 
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

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedLeague, setSelectedLeague] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'bestseller' | 'price-low' | 'price-high'>('featured');

  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [isCustomStudioOpen, setIsCustomStudioOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Filter products by category
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

  const leagues = ['all', ...Array.from(new Set(PRODUCTS.map((p) => p.league)))];

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

      {/* Breadcrumbs */}
      <div className="bg-[#0a0a0a] border-b border-[#242424] py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-gray-400 font-medium">
          <Link href="/" className="hover:text-[#f4c84a]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
          <span className="text-[#f4c84a] font-bold">Shop Catalog</span>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#242424] pb-6">
          <div>
            <p className="text-xs font-bold text-[#f4c84a] uppercase tracking-widest mb-1">OFFICIAL CATALOG</p>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif text-white uppercase">
              {activeCategory === 'all' ? 'All Jerseys & Apparel' : activeCategory.replace('-', ' ').toUpperCase()}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Filter */}
            <div className="flex items-center gap-1.5 bg-[#111] border border-[#242424] rounded-xl px-3 py-2 text-xs">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-black">All Leagues</option>
                {leagues.filter((l) => l !== 'all').map((l) => (
                  <option key={l} value={l} className="bg-black">{l}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1.5 bg-[#111] border border-[#242424] rounded-xl px-3 py-2 text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value="featured" className="bg-black">Sort: Featured</option>
                <option value="bestseller" className="bg-black">Sort: Bestsellers</option>
                <option value="price-low" className="bg-black">Price: Low to High</option>
                <option value="price-high" className="bg-black">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
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

      </main>

      <Footer
        onOpenCustomLab={() => setIsCustomStudioOpen(true)}
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onSelectSport={(cat) => setActiveCategory(cat)}
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

      <CustomJerseyStudio
        isOpen={isCustomStudioOpen}
        onClose={() => setIsCustomStudioOpen(false)}
        activeCurrency={activeCurrency}
        onAddToCart={addToCart}
      />

    </div>
  );
}
