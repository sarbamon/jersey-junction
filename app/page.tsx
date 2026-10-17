'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import { JerseyProduct } from '../types';
import { productService } from '../lib/services/productService';
import { Navbar } from '../components/Navbar';
import { HeroBanner } from '../components/HeroBanner';
import { CategoryGrid } from '../components/CategoryGrid';
import { JerseyCard } from '../components/JerseyCard';
import { CustomJerseyStudio } from '../components/CustomJerseyStudio';
import { CartDrawer } from '../components/CartDrawer';
import { CheckoutModal } from '../components/CheckoutModal';
import { SizeGuideModal } from '../components/SizeGuideModal';
import { AuthModal } from '../components/AuthModal';
import { Footer } from '../components/Footer';
import { useStore } from '../context/StoreContext';
import { settingsService } from '../lib/services/settingsService';
import { StoreSettings } from '../lib/types/admin';

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

  const [products, setProducts] = useState<JerseyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedLeague] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'bestseller' | 'price-low' | 'price-high'>('featured');

  const [isCustomStudioOpen, setIsCustomStudioOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    // Immediate client cache hydration (prevents SSR mismatch while keeping 0ms speed)
    const cached = productService.getCachedProductsSync();
    if (cached.length > 0) {
      setProducts(cached);
      setIsLoading(false);
    }

    let isMounted = true;
    productService.getActiveProducts()
      .then((prods) => {
        if (isMounted) {
          setProducts(prods);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error loading products:', err);
        if (isMounted) setIsLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    setStoreSettings(settingsService.getSettings());
  }, []);

  // Homepage: Show only bestseller jerseys (capped at maximum 10 products)
  const bestsellerJerseys = products.filter((p) => p.isBestseller);
  let displayProducts = bestsellerJerseys.length > 0 ? [...bestsellerJerseys] : [...products];

  // Sort
  if (sortBy === 'price-low') {
    displayProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    displayProducts.sort((a, b) => b.price - a.price);
  }

  const finalDisplayProducts = displayProducts.slice(0, 10);

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

      {/* Hero Banner Slider */}
      <HeroBanner
        activeCurrency={activeCurrency}
        onOpenCustomLab={() => setIsCustomStudioOpen(true)}
        onSelectCategory={(cat) => setActiveCategory(cat)}
        onSelectProduct={(p) => router.push(`/shop/${p.slug}`)}
        featuredProducts={products}
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
              src={storeSettings?.midBannerImage || 'https://res.cloudinary.com/mcsohx4p/image/upload/v1788513650/jerseyspot/gojvmjz31hz2thbpruu4.webp'}
              alt="Authentic Football Jerseys"
              className="object-cover w-full h-full opacity-70 group-hover:scale-105 transition-transform duration-700"
            />
            {(storeSettings?.midBannerOverlayTag || storeSettings?.midBannerOverlayTitle) && (
              <div className="absolute bottom-6 left-6 z-20 space-y-1">
                {storeSettings?.midBannerOverlayTag && (
                  <span className="text-xs font-bold text-[#f4c84a] uppercase tracking-widest font-mono">
                    {storeSettings.midBannerOverlayTag}
                  </span>
                )}
                {storeSettings?.midBannerOverlayTitle && (
                  <h3 className="text-2xl font-black font-serif text-white uppercase">
                    {storeSettings.midBannerOverlayTitle}
                  </h3>
                )}
              </div>
            )}
          </div>

          <div className="text-center lg:text-left flex flex-col items-center lg:items-start space-y-4">
            <span className="mb-2 inline-block rounded-full bg-[#f4c84a]/10 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-[#f4c84a] border border-[#f4c84a]/20">
              {storeSettings?.midBannerTag || 'AUTHENTIC COLLECTION'}
            </span>

            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight uppercase">
              {storeSettings?.midBannerTitle || 'REPRESENT YOUR CLUB.'}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f4c84a] to-[#d4af37]">
                {storeSettings?.midBannerSubtitle || 'WEAR YOUR COLORS.'}
              </span>
            </h2>

            <p className="max-w-md text-base leading-relaxed text-gray-400">
              From electric matchdays at the stadium to weekend watch parties, wear your club&apos;s official crest with pride. Discover authentic player-version and fan-version kits for top European football clubs.
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

      {/* Bestseller Jerseys Product Showcase */}
      <section id="shop" className="bg-black px-5 py-14 sm:px-8 lg:px-12 lg:py-20 border-b border-[#242424]">
        <div className="mx-auto max-w-7xl">
          
          <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-end justify-between border-b border-[#242424] pb-6 gap-4">
            <div>
              <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-[#f4c84a]">TOP PICKS</p>
              <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl uppercase">
                Bestseller Jerseys
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-[#111] border border-[#242424] rounded-lg px-3 py-2 text-xs text-white">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#f4c84a]" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  aria-label="Sort products"
                  className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
                >
                  <option value="featured" className="bg-black">Featured</option>
                  <option value="price-low" className="bg-black">Price: Low to High</option>
                  <option value="price-high" className="bg-black">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="py-20 text-center text-zinc-400 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-amber-400 animate-spin" />
            </div>
          ) : finalDisplayProducts.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 font-mono text-xs">
              No bestseller jerseys found.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {finalDisplayProducts.map((product) => (
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

          {/* Down Center: View All Jerseys button redirecting to /shop in next page */}
          <div className="mt-12 sm:mt-16 flex justify-center">
            <Link
              href="/shop"
              id="view-all-jerseys-btn"
              className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#f4c84a] via-[#e8be42] to-[#d4af37] px-8 sm:px-10 py-3.5 sm:py-4 text-xs sm:text-sm font-black tracking-widest text-black uppercase transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(244,200,74,0.5)] active:scale-95 cursor-pointer shadow-xl"
            >
              <span>View All Jerseys</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-black" />
            </Link>
          </div>

        </div>
      </section>

      {/* Footer */}
      <Footer
        onOpenCustomLab={() => setIsCustomStudioOpen(true)}
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
        onOpenCheckout={() => router.push('/checkout')}
        discountPercentage={discountPercentage}
        onApplyCoupon={applyCoupon}
      />

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />

    </div>
  );
}
