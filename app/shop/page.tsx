'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, SlidersHorizontal, ChevronLeft, ChevronRight, RefreshCw, X, Search } from 'lucide-react';
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
import { matchesCategory } from '../../lib/utils/categoryMatcher';
import { categoryService } from '../../lib/services/categoryService';
import { INITIAL_CATEGORIES } from '../../lib/mock/categories';

const PRODUCTS_PER_PAGE = 70;

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

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
  const [activeCategory, setActiveCategory] = useState<string>(() => searchParams.get('category') || 'all');
  const [searchTerm, setSearchTerm] = useState<string>(() => searchParams.get('search') || searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState<'featured' | 'bestseller' | 'price-low' | 'price-high'>('featured');
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const p = parseInt(searchParams.get('page') || '1', 10);
    return isNaN(p) || p < 1 ? 1 : p;
  });

  // React reactively to URL parameter changes (when searching, switching categories, or paginating)
  useEffect(() => {
    const s = searchParams.get('search') || searchParams.get('q') || '';
    setSearchTerm(s);
    const cat = searchParams.get('category');
    if (cat) {
      setActiveCategory(cat);
    } else if (s) {
      setActiveCategory('all');
    }
    const p = parseInt(searchParams.get('page') || '1', 10);
    if (!isNaN(p) && p >= 1) {
      setCurrentPage(p);
    } else {
      setCurrentPage(1);
    }
  }, [searchParams]);

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
        console.error('Failed to load shop products:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isCustomStudioOpen, setIsCustomStudioOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const [adminCategories, setAdminCategories] = useState<any[]>(INITIAL_CATEGORIES);

  useEffect(() => {
    let isMounted = true;
    setAdminCategories(categoryService.getCategoriesSync().filter((c) => c.status === 'Active'));
    categoryService.getActiveCategories().then((cats) => {
      if (isMounted) setAdminCategories(cats);
    });
    return () => { isMounted = false; };
  }, []);

  // Display only real active categories configured in admin/backend
  const allCategoryList = adminCategories.map((c) => ({
    id: c.slug || c.id,
    name: c.name,
  }));

  // Filter products by category & search term
  let filteredProducts = products.filter((p) => {
    if (!matchesCategory(p, activeCategory)) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      const matchName = (p.name || '').toLowerCase().includes(term);
      const matchTeam = (p.team || '').toLowerCase().includes(term);
      const matchLeague = (p.league || '').toLowerCase().includes(term);
      const matchCategory = ((p as any).category || '').toLowerCase().includes(term);
      const matchSport = (p.sport || '').toLowerCase().includes(term);
      const matchDesc = (p.description || '').toLowerCase().includes(term);
      const matchDefaultName = (p.defaultName || '').toLowerCase().includes(term);
      const matchTags = Array.isArray(p.tags) && p.tags.some((t: string) => (t || '').toLowerCase().includes(term));
      if (!matchName && !matchTeam && !matchLeague && !matchCategory && !matchSport && !matchDesc && !matchDefaultName && !matchTags) {
        return false;
      }
    }
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

  // Pagination: Max 70 products per page
  const totalProducts = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / PRODUCTS_PER_PAGE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = Math.min(startIndex + PRODUCTS_PER_PAGE, totalProducts);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const goToPage = (pageNumber: number) => {
    const pageClamped = Math.max(1, Math.min(pageNumber, totalPages));
    setCurrentPage(pageClamped);

    const params = new URLSearchParams(searchParams.toString());
    if (pageClamped > 1) {
      params.set('page', pageClamped.toString());
    } else {
      params.delete('page');
    }
    const qs = params.toString();
    router.push(qs ? `/shop?${qs}` : '/shop', { scroll: false });

    if (typeof window !== 'undefined') {
      const topElem = document.getElementById('shop-catalog-top');
      if (topElem) {
        topElem.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 180, behavior: 'smooth' });
      }
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safeCurrentPage > 3) pages.push('...');
      const start = Math.max(2, safeCurrentPage - 1);
      const end = Math.min(totalPages - 1, safeCurrentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (safeCurrentPage < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  const getCategoryTitle = (catKey: string) => {
    if (catKey === 'all') return 'All Jerseys & Apparel';
    const found = adminCategories.find(c => (c.slug || c.id) === catKey || c.id === catKey);
    if (found) return found.name;
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
        <div id="shop-catalog-top" className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#242424] pb-6 scroll-mt-24">
          <div>
            <p className="text-xs font-bold text-[#f4c84a] uppercase tracking-widest mb-1">OFFICIAL CATALOG</p>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif text-white uppercase flex items-center gap-3 flex-wrap">
              <span>{searchTerm ? `SEARCH: "${searchTerm.toUpperCase()}"` : getCategoryTitle(activeCategory)}</span>
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setCurrentPage(1);
                    router.push(activeCategory !== 'all' ? `/shop?category=${encodeURIComponent(activeCategory)}` : '/shop');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold normal-case px-3 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-gray-300 hover:text-white border border-zinc-700 transition-colors cursor-pointer"
                  title="Clear search filter"
                >
                  <span>Clear</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </h1>
            <p className="mt-1.5 text-xs text-gray-400 font-mono">
              Showing {totalProducts > 0 ? `${startIndex + 1}–${endIndex}` : '0'} of {totalProducts} jerseys
              {totalPages > 1 && ` • Page ${safeCurrentPage} of ${totalPages}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Category Dropdown Filter */}
            <div className="flex items-center gap-1.5 bg-[#111] border border-[#242424] rounded-xl px-3 py-2 text-xs">
              <Filter className="w-3.5 h-3.5 text-[#f4c84a]" />
              <select
                value={activeCategory}
                onChange={(e) => {
                  setActiveCategory(e.target.value);
                  setCurrentPage(1);
                  const params = new URLSearchParams(searchParams.toString());
                  if (e.target.value !== 'all') {
                    params.set('category', e.target.value);
                  } else {
                    params.delete('category');
                  }
                  params.delete('page');
                  const qs = params.toString();
                  router.push(qs ? `/shop?${qs}` : '/shop', { scroll: false });
                }}
                aria-label="Filter by Category"
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-black">All Categories</option>
                {allCategoryList.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-black">
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1.5 bg-[#111] border border-[#242424] rounded-xl px-3 py-2 text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as any);
                  setCurrentPage(1);
                }}
                aria-label="Sort Catalog"
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

        {/* Product Cards Grid (Max 70 products per page) */}
        {isLoading ? (
          <div className="py-24 text-center text-zinc-400 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-amber-400 animate-spin" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center text-zinc-500 font-mono text-xs space-y-3">
            <p>No products found matching {searchTerm ? `search "${searchTerm}"` : 'selected filter options'}.</p>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                  router.push(activeCategory !== 'all' ? `/shop?category=${encodeURIComponent(activeCategory)}` : '/shop');
                }}
                className="px-4 py-2 bg-[#f4c84a] text-black text-xs font-bold rounded-lg hover:bg-amber-400 cursor-pointer"
              >
                Clear Search &amp; View All
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6 mt-6">
              {paginatedProducts.map((product) => (
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <nav
                aria-label="Shop Catalog Pagination"
                className="mt-12 sm:mt-16 pt-8 border-t border-[#242424] flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                {/* Product Count Summary */}
                <div className="text-xs text-gray-400 font-mono">
                  Showing <span className="text-[#f4c84a] font-bold">{startIndex + 1}</span>–<span className="text-[#f4c84a] font-bold">{endIndex}</span> of <span className="text-white font-bold">{totalProducts}</span> jerseys
                </div>

                {/* Pagination Buttons */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* Previous Page Button */}
                  <button
                    onClick={() => goToPage(safeCurrentPage - 1)}
                    disabled={safeCurrentPage <= 1}
                    aria-label="Previous Page"
                    className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      safeCurrentPage <= 1
                        ? 'bg-[#111] text-zinc-600 border border-[#222] cursor-not-allowed opacity-50'
                        : 'bg-[#161616] text-white border border-[#333] hover:border-[#f4c84a] hover:text-[#f4c84a] active:scale-95'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Prev</span>
                  </button>

                  {/* Page Numbers */}
                  {getPageNumbers().map((item, idx) => {
                    if (item === '...') {
                      return (
                        <span key={`ellipsis-${idx}`} className="px-2 text-zinc-500 font-bold select-none text-xs">
                          ...
                        </span>
                      );
                    }
                    const pageNum = Number(item);
                    const isActive = pageNum === safeCurrentPage;
                    return (
                      <button
                        key={`page-${pageNum}`}
                        onClick={() => goToPage(pageNum)}
                        aria-current={isActive ? 'page' : undefined}
                        aria-label={`Page ${pageNum}`}
                        className={`min-w-[36px] h-9 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                          isActive
                            ? 'bg-[#f4c84a] text-black font-black shadow-[0_0_15px_rgba(244,200,74,0.4)] scale-105'
                            : 'bg-[#161616] text-gray-300 border border-[#2a2a2a] hover:border-[#f4c84a] hover:text-[#f4c84a] hover:bg-[#1a1a1a]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {/* Next Page Button */}
                  <button
                    onClick={() => goToPage(safeCurrentPage + 1)}
                    disabled={safeCurrentPage >= totalPages}
                    aria-label="Next Page"
                    className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      safeCurrentPage >= totalPages
                        ? 'bg-[#111] text-zinc-600 border border-[#222] cursor-not-allowed opacity-50'
                        : 'bg-[#161616] text-white border border-[#333] hover:border-[#f4c84a] hover:text-[#f4c84a] active:scale-95'
                    }`}
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </nav>
            )}
          </>
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

    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
