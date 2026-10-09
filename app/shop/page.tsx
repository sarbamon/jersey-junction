'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Filter, SlidersHorizontal, ChevronRight, RefreshCw } from 'lucide-react';
import { JerseyProduct } from '../../types';
import { productService } from '../../lib/services/productService';
import { JerseyCard } from '../../components/JerseyCard';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { CartDrawer } from '../../components/CartDrawer';
import { SizeGuideModal } from '../../components/SizeGuideModal';
import { AuthModal } from '../../components/AuthModal';
import { CustomJerseyStudio } from '../../components/CustomJerseyStudio';
import { CheckoutModal } from '../../components/CheckoutModal';
import { useStore } from '../../context/StoreContext';
import { CATEGORIES } from '../../data/jerseys';
import { matchesCategory } from '../../lib/utils/categoryMatcher';
import { categoryService } from '../../lib/services/categoryService';

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

  const [products, setProducts] = useState<JerseyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedLeague, setSelectedLeague] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'bestseller' | 'price-low' | 'price-high'>('featured');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const catParam = params.get('category');
      if (catParam) {
        setActiveCategory(catParam);
      }
    }

    let isMounted = true;
    setIsLoading(true);
    productService.getActiveProducts()
      .then((prods) => {
        if (isMounted) {
          setProducts(prods);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load shop products:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isCustomStudioOpen, setIsCustomStudioOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const [adminCategories, setAdminCategories] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    categoryService.getActiveCategories().then((cats) => {
      if (isMounted) setAdminCategories(cats);
    });
    return () => { isMounted = false; };
  }, []);

  // Filter products by category & league
  let filteredProducts = products.filter((p) => {
    if (!matchesCategory(p, activeCategory)) return false;
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

  const leagues = ['all', ...Array.from(new Set(products.map((p) => p.league).filter(Boolean)))];

  const getCategoryTitle = (catKey: string) => {
    if (catKey === 'all') return 'All Jerseys & Apparel';
    const found = adminCategories.find(c => c.slug === catKey || c.id === catKey);
    if (found) return found.name;
    const staticFound = CATEGORIES.find(c => c.id === catKey);
    if (staticFound) return staticFound.name;
    return catKey.replace(/-/g, ' ').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-[#f4c84a] selection:text-black">
      
      {/* Navbar */}
      <Navbar
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        wishlistCount={wishlist.length}
        activeCurrency={activeCurrency}
        onSelectCurrency={setActiveCurrency}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenCustomLab={() => setIsCustomStudioOpen(true)}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onSelectCategory={(cat) => setActiveCategory(cat)}
        products={products}
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
            <p className="text-xs font-bold text-[#f4c84a] uppercase tracking-widest mb-1">OFFICIAL CATALOG (MONGODB)</p>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif text-white uppercase">
              {getCategoryTitle(activeCategory)}
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

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[#1c1c1c]">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              activeCategory === 'all'
                ? 'bg-[#f4c84a] text-black border-[#f4c84a] shadow-lg scale-105'
                : 'bg-[#111] text-gray-300 border-[#242424] hover:border-[#f4c84a]/50 hover:text-white'
            }`}
          >
            All Items ({products.length})
          </button>
          {adminCategories.map((cat) => {
            const catKey = cat.slug || cat.id;
            const count = products.filter((p) => matchesCategory(p, catKey)).length;
            const isActive = activeCategory === catKey;
            return (
              <button
                key={cat.id || cat.slug}
                onClick={() => setActiveCategory(catKey)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-[#f4c84a] text-black border-[#f4c84a] shadow-lg scale-105'
                    : 'bg-[#111] text-gray-300 border-[#242424] hover:border-[#f4c84a]/50 hover:text-white'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Product Cards Grid */}
        {isLoading ? (
          <div className="py-24 text-center text-zinc-400 font-mono text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
            <span>Loading shop items from backend...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center text-zinc-500 font-mono text-xs">
            No products found matching selected filter options.
          </div>
        ) : (
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
        )}

      </main>

      <Footer
        onOpenCustomLab={() => setIsCustomStudioOpen(true)}
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
        onOpenCheckout={() => router.push('/checkout')}
        discountPercentage={discountPercentage}
        onApplyCoupon={applyCoupon}
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

      <AuthModal />

    </div>
  );
}
