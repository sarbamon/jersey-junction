'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Star, 
  Check, 
  Ruler, 
  ShoppingBag, 
  Heart,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Type,
  Hash,
  AlertCircle,
  MapPin,
  CheckCircle2,
  Loader2,
  Truck,
  Zap,
  Share2
} from 'lucide-react';
import { JerseyViewerSVG } from '../../../components/JerseyViewerSVG';
import { JerseyProduct, VersionType, PatchOption } from '../../../types';
import { REVIEWS } from '../../../data/jerseys';
import { productService } from '../../../lib/services/productService';
import { icarryService } from '../../../lib/services/icarryService';
import { Navbar } from '../../../components/Navbar';
import { Footer } from '../../../components/Footer';
import { CartDrawer } from '../../../components/CartDrawer';
import { SizeGuideModal } from '../../../components/SizeGuideModal';
import { CustomJerseyStudio } from '../../../components/CustomJerseyStudio';
import { CheckoutModal } from '../../../components/CheckoutModal';
import { ProductImageZoom } from '../../../components/ProductImageZoom';
import { useStore } from '../../../context/StoreContext';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const router = useRouter();
  
  const { 
    activeCurrency, 
    addToCart, 
    toggleWishlist, 
    wishlist, 
    cartItems, 
    updateQuantity, 
    removeFromCart,
    isCartOpen,
    setIsCartOpen,
    discountPercentage,
    applyCoupon,
    setActiveCurrency,
    currentUser,
    setIsAuthOpen
  } = useStore();

  const [product, setProduct] = useState<JerseyProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState('L');
  const selectedVersion: VersionType = 'Fan Version (Standard Fit)';
  const [wantCustomPrint, setWantCustomPrint] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customNumber, setCustomNumber] = useState('');
  const [customError, setCustomError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedPatches] = useState<PatchOption[]>([]);
  const [view] = useState<'back' | 'front'>('back');
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isCustomStudioOpen, setIsCustomStudioOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Delivery Pincode Checker State
  const [pincodeInput, setPincodeInput] = useState('');
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [pincodeResult, setPincodeResult] = useState<{
    checked: boolean;
    available: boolean;
    pincode?: string;
    estimatedDays?: string;
    couriers?: string[];
    codAvailable?: boolean;
    message?: string;
  } | null>(null);

  const handleCheckPincode = async (e: React.FormEvent) => {
    e.preventDefault();
    const pin = pincodeInput.trim();
    if (!pin || pin.length !== 6) return;

    setIsCheckingPincode(true);
    setPincodeResult(null);
    try {
      const res = await icarryService.checkPincode(pin);
      setPincodeResult({
        checked: true,
        available: Boolean(res.available),
        pincode: pin,
        message: res.available
          ? `Delivery Available to ${pin}`
          : `Delivery Unavailable to ${pin}`
      });
    } catch (err: any) {
      setPincodeResult({
        checked: true,
        available: false,
        pincode: pin,
        message: `Delivery Unavailable to ${pin}`
      });
    } finally {
      setIsCheckingPincode(false);
    }
  };

  const [isCopied, setIsCopied] = useState(false);

  const handleShare = async () => {
    if (!product) return;
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const shareData = {
      title: product.name,
      text: `Check out the ${product.name} on Jersey Junction!`,
      url: url,
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2200);
      }
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2200);
    }
  };

  useEffect(() => {
    // Immediate client cache hydration (prevents SSR mismatch while keeping 0ms speed)
    const cached = productService.getCachedProductBySlugSync(slug);
    if (cached) {
      setProduct(cached);
      setIsLoading(false);
    }

    let isMounted = true;
    const fetchFresh = () => {
      productService.getProductBySlug(slug)
        .then((found) => {
          if (isMounted && found) {
            setProduct(found);
            setIsLoading(false);
          }
        })
        .catch((err) => {
          console.error('Failed to load product by slug:', err);
          if (isMounted) setIsLoading(false);
        });
    };

    fetchFresh();

    const handleUpdated = () => {
      const freshCached = productService.getCachedProductBySlugSync(slug);
      if (freshCached && isMounted) {
        setProduct(freshCached);
      }
      fetchFresh();
    };

    window.addEventListener('jj_products_updated', handleUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener('jj_products_updated', handleUpdated);
    };
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <RefreshCw className="w-6 h-6 text-[#f4c84a] animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 space-y-4 font-sans">
        <h2 className="text-xl font-bold font-serif text-[#f4c84a]">PRODUCT NOT FOUND</h2>
        <p className="text-xs text-gray-400">No matching jersey was found for slug &quot;{slug}&quot;.</p>
        <Link href="/shop" className="px-5 py-2.5 bg-[#f4c84a] text-black font-extrabold text-xs rounded-xl">
          ← Return to Shop Catalog
        </Link>
      </div>
    );
  }

  const patchesExtra = selectedPatches.reduce((acc, p) => acc + p.price, 0);
  const printExtra = (product.isCustomizable && wantCustomPrint) ? 100 : 0;

  const finalUnitPrice = product.price + patchesExtra + printExtra;
  const finalUnitPriceConverted = Math.round(finalUnitPrice * activeCurrency.rate);
  const isWishlisted = wishlist.some((item) => item.id === product.id);

  const handleAddToCart = () => {
    if (product.isCustomizable && wantCustomPrint && !customName.trim()) {
      setCustomError('Please enter a name for the back print, or select Blank Back.');
      return;
    }
    setCustomError('');

    addToCart(
      product,
      selectedSize,
      selectedVersion,
      (product.isCustomizable && wantCustomPrint) ? customName.trim().toUpperCase() : '',
      (product.isCustomizable && wantCustomPrint) ? customNumber.trim() : '',
      []
    );
    setIsCartOpen(true);
  };

  const handleBuyNow = () => {
    if (product.isCustomizable && wantCustomPrint && !customName.trim()) {
      setCustomError('Please enter a name for the back print, or select Blank Back.');
      return;
    }
    setCustomError('');

    addToCart(
      product,
      selectedSize,
      selectedVersion,
      (product.isCustomizable && wantCustomPrint) ? customName.trim().toUpperCase() : '',
      (product.isCustomizable && wantCustomPrint) ? customNumber.trim() : '',
      []
    );
    setIsCartOpen(false);

    if (currentUser) {
      router.push('/checkout');
    } else {
      setIsAuthOpen(true);
    }
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
        onSelectCategory={() => router.push('/shop')}
        products={[product]}
        onSelectProduct={(p) => router.push(`/shop/${p.slug}`)}
      />

      {/* Breadcrumb Navigation */}
      <div className="bg-[#0a0a0a] border-b border-[#242424] py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-gray-400 font-medium">
          <Link href="/" className="hover:text-[#f4c84a]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
          <Link href="/shop" className="hover:text-[#f4c84a]">Shop</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
          <span className="text-[#f4c84a] font-bold truncate">{product.name}</span>
        </div>
      </div>

      {/* MAIN FULL PAGE PRODUCT DISPLAY */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:py-12 space-y-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Product Image Gallery (Supports 2-3 or more photos) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-[#080808] border border-[#242424] rounded-3xl p-6 sm:p-8 relative flex flex-col items-center justify-center shadow-2xl min-h-[350px] sm:min-h-[450px] group">
              
              {/* Photo Indicator Badge */}
              {(() => {
                const allImages = (Array.isArray(product.images) && product.images.length > 0)
                  ? product.images
                  : (product.image ? [product.image] : []);
                const currentDisplayImage = allImages[selectedImageIndex] || product.image;

                return (
                  <>
                    {allImages.length > 1 && (
                      <div className="absolute top-4 left-4 z-10 px-2.5 py-1 rounded-full bg-black/80 border border-zinc-800 text-[11px] font-mono font-bold text-[#f4c84a] backdrop-blur-sm">
                        {selectedImageIndex + 1} / {allImages.length}
                      </div>
                    )}

                    {/* Prev & Next Photo Arrows */}
                    {allImages.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImageIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1));
                          }}
                          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/75 hover:bg-black text-white border border-[#333] hover:border-[#f4c84a] transition-all opacity-80 hover:opacity-100 hover:scale-110 cursor-pointer shadow-lg"
                          aria-label="Previous photo"
                        >
                          <ChevronLeft className="w-5 h-5 text-[#f4c84a]" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImageIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1));
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/75 hover:bg-black text-white border border-[#333] hover:border-[#f4c84a] transition-all opacity-80 hover:opacity-100 hover:scale-110 cursor-pointer shadow-lg"
                          aria-label="Next photo"
                        >
                          <ChevronRight className="w-5 h-5 text-[#f4c84a]" />
                        </button>
                      </>
                    )}

                    {/* Real Product Picture with Zoom / SVG Visualizer Canvas */}
                    <div className="w-full flex flex-col items-center justify-center">
                      {currentDisplayImage ? (
                        <ProductImageZoom
                          images={allImages}
                          selectedIndex={selectedImageIndex}
                          onSelectIndex={setSelectedImageIndex}
                          productName={product.name}
                        />
                      ) : (
                        <JerseyViewerSVG
                          primaryColor={product.colors.primary}
                          secondaryColor={product.colors.secondary}
                          accentColor={product.colors.accent}
                          textColor={product.colors.text}
                          pattern={product.pattern}
                          sponsorText={product.sponsorText}
                          name={(product.isCustomizable && wantCustomPrint && customName) ? customName.trim().toUpperCase() : (product.defaultName || '')}
                          number={(product.isCustomizable && wantCustomPrint && customNumber) ? customNumber.trim() : (product.defaultNumber || '')}
                          view={view}
                          patchNames={[]}
                          height={380}
                        />
                      )}
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Thumbnail Gallery Row for 2, 3 or more photos */}
            {(() => {
              const allImages = (Array.isArray(product.images) && product.images.length > 0)
                ? product.images
                : (product.image ? [product.image] : []);

              if (allImages.length <= 1) return null;

              return (
                <div className="flex items-center gap-3 overflow-x-auto pb-1 px-1">
                  {allImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border p-2 bg-[#0c0c0c] transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                        selectedImageIndex === idx
                          ? 'border-[#f4c84a] shadow-lg shadow-[#f4c84a]/10 scale-105 ring-1 ring-[#f4c84a]'
                          : 'border-[#262626] opacity-60 hover:opacity-100 hover:border-gray-500'
                      }`}
                      title={`View photo ${idx + 1}`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Photo ${idx + 1}`}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </button>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Right Column: Customization & Product Specification Form */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Title & Rating */}
            <div className="space-y-2 border-b border-[#242424] pb-6">
              <div className="flex justify-between items-start">
                <h1 className="font-serif text-2xl sm:text-4xl font-bold text-white uppercase leading-tight">
                  {product.name}
                </h1>

                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="p-3 rounded-full border bg-[#111] text-gray-400 border-[#333] hover:text-[#f4c84a] hover:border-[#f4c84a] transition-all cursor-pointer relative"
                    aria-label="Share"
                    title="Share product link"
                  >
                    <Share2 className="w-5 h-5" />
                    {isCopied && (
                      <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-[#f4c84a] text-black text-[10px] font-bold font-mono shadow-md whitespace-nowrap z-30">
                        Copied!
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleWishlist(product)}
                    className={`p-3 rounded-full border transition-all cursor-pointer ${
                      isWishlisted 
                        ? 'bg-[#f4c84a] text-black border-[#f4c84a]' 
                        : 'bg-[#111] text-gray-400 border-[#333] hover:text-white'
                    }`}
                    aria-label="Wishlist"
                    title="Wishlist"
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-black' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="flex text-[#f4c84a]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#f4c84a]" />
                  ))}
                </div>
                <span className="font-bold text-white text-sm">{product.rating}</span>
                <span className="text-gray-400">({product.reviewCount} Verified Ratings)</span>
              </div>
            </div>

            {/* Pricing Display */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-[#f4c84a] font-mono">
                {activeCurrency.symbol}{finalUnitPriceConverted}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through font-mono">
                  {activeCurrency.symbol}{Math.round(product.originalPrice * activeCurrency.rate)}
                </span>
              )}
            </div>

            {/* Size Selector */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Select Size
                </label>
                <button
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="flex items-center gap-1 text-xs text-[#f4c84a] hover:underline font-semibold"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size Guide &amp; Chart</span>
                </button>
              </div>

              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                {(product.availableSizes || ['S', 'M', 'L', 'XL', '2XL']).map((size) => {
                  const sizeQty = product.sizeStock ? product.sizeStock[size] : undefined;
                  const isOutOfStock = sizeQty !== undefined && sizeQty <= 0;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => !isOutOfStock && setSelectedSize(size)}
                      disabled={isOutOfStock}
                      className={`py-2.5 px-1 text-xs font-black rounded-xl border transition-all flex flex-col items-center justify-center cursor-pointer ${
                        isOutOfStock
                          ? 'opacity-40 cursor-not-allowed border-[#222] bg-[#0c0c0c] text-gray-500 line-through'
                          : selectedSize === size
                            ? 'bg-[#f4c84a] text-black border-[#f4c84a] shadow-md scale-105'
                            : 'bg-[#111] text-gray-300 border-[#333] hover:bg-[#1a1a1a]'
                      }`}
                    >
                      <span>{size}</span>
                      {sizeQty !== undefined && sizeQty > 0 && (
                        <span className={`text-[9px] font-mono font-bold mt-0.5 ${selectedSize === size ? 'text-black/80' : 'text-[#f4c84a]'}`}>
                          {sizeQty} left
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Jersey Name & Number Section (Only when isCustomizable is enabled in Admin) */}
            {product.isCustomizable && (
              <div className="bg-[#0e0e0e] border border-[#262626] rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                      Custom Back Printing
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#f4c84a]/10 text-[#f4c84a] border border-[#f4c84a]/30">
                    +₹100
                  </span>
                </div>

                {/* Option Tabs: Blank Back vs Custom Name & Number */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setWantCustomPrint(false);
                      setCustomError('');
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                      !wantCustomPrint
                        ? 'bg-[#f4c84a] text-black border-[#f4c84a] shadow'
                        : 'bg-[#141414] text-gray-400 border-[#2b2b2b] hover:text-white'
                    }`}
                  >
                    Blank Back (Standard)
                  </button>
                  <button
                    type="button"
                    onClick={() => setWantCustomPrint(true)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                      wantCustomPrint
                        ? 'bg-[#f4c84a] text-black border-[#f4c84a] shadow'
                        : 'bg-[#141414] text-gray-400 border-[#2b2b2b] hover:text-white'
                    }`}
                  >
                    <span>Custom Name &amp; No.</span>
                    <span className={`text-[10px] font-mono px-1 py-0.5 rounded font-bold ${wantCustomPrint ? 'bg-black/20 text-black' : 'bg-[#f4c84a]/20 text-[#f4c84a]'}`}>
                      +₹100
                    </span>
                  </button>
                </div>

                {/* Custom Inputs */}
                {wantCustomPrint && (
                  <div className="pt-2 border-t border-[#222] space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                          <Type className="w-3 h-3 text-[#f4c84a]" />
                          <span>Name on Back</span>
                          <span className="text-[10px] text-gray-500 font-normal">(Max 12)</span>
                        </label>
                        <input
                          type="text"
                          value={customName}
                          onChange={(e) => {
                            setCustomName(e.target.value.toUpperCase().slice(0, 12));
                            if (customError) setCustomError('');
                          }}
                          placeholder="e.g. RONALDO"
                          maxLength={12}
                          className="w-full bg-[#161616] border border-[#333] focus:border-[#f4c84a] text-white px-3 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-widest focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                          <Hash className="w-3 h-3 text-[#f4c84a]" />
                          <span>Number</span>
                          <span className="text-[10px] text-gray-500 font-normal">(0-99)</span>
                        </label>
                        <input
                          type="text"
                          value={customNumber}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
                            setCustomNumber(val);
                          }}
                          placeholder="7"
                          maxLength={2}
                          className="w-full bg-[#161616] border border-[#333] focus:border-[#f4c84a] text-white px-3 py-2.5 rounded-xl text-xs font-mono font-bold text-center focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Live Preview pill */}
                    {customName.trim() && (
                      <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl px-3 py-2 flex items-center justify-between text-xs">
                        <span className="text-gray-400 text-[11px]">Print Preview:</span>
                        <span className="font-mono font-extrabold text-[#f4c84a] tracking-widest uppercase">
                          {customName.trim()} {customNumber ? `#${customNumber}` : ''}
                        </span>
                      </div>
                    )}

                    {customError && (
                      <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-950/30 border border-red-800/40 rounded-lg p-2 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{customError}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* CTA Buttons: Add to Bag & Buy Now */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-[#f4c84a] text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg flex items-center justify-center hover:scale-[1.01] transition-all cursor-pointer"
              >
                <span>ADD TO BAG</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full py-4 bg-gradient-to-r from-[#f4c84a] to-[#d4af37] hover:from-[#ffd96a] hover:to-[#f4c84a] text-black font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl flex items-center justify-center hover:scale-[1.01] transition-all cursor-pointer"
              >
                <span>BUY NOW</span>
              </button>
            </div>

            {/* Delivery Pincode Checker */}
            <div className="mt-5 p-4 rounded-2xl bg-[#111111] border border-[#242424] space-y-3">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#f4c84a]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Check Delivery
                </span>
              </div>

              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit Pincode"
                    value={pincodeInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setPincodeInput(val);
                      if (pincodeResult) setPincodeResult(null);
                    }}
                    className="w-full bg-[#181818] border border-[#2e2e2e] focus:border-[#f4c84a] text-white pl-9 pr-3 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider placeholder:text-zinc-500 focus:outline-none transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isCheckingPincode || pincodeInput.trim().length !== 6}
                  className="px-5 py-2.5 bg-[#f4c84a] hover:bg-[#ffe17d] disabled:opacity-40 disabled:hover:bg-[#f4c84a] text-black text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider shrink-0"
                >
                  {isCheckingPincode ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    'Check'
                  )}
                </button>
              </form>

              {pincodeResult && (
                <div
                  className={`text-xs p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                    pincodeResult.available
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                      : 'bg-red-950/20 border-red-500/30 text-red-300'
                  }`}
                >
                  {pincodeResult.available ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span className="font-bold text-white text-xs">
                    {pincodeResult.message}
                  </span>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Specifications & Reviews Section */}
        <div className="bg-[#080808] border border-[#242424] rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex border-b border-[#242424] gap-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-3 text-sm font-bold transition-all border-b-2 font-serif uppercase tracking-wider ${
                activeTab === 'details'
                  ? 'border-[#f4c84a] text-[#f4c84a]'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Kit Features &amp; Fabric Details
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 text-sm font-bold transition-all border-b-2 font-serif uppercase tracking-wider ${
                activeTab === 'reviews'
                  ? 'border-[#f4c84a] text-[#f4c84a]'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Verified Reviews ({REVIEWS.length})
            </button>
          </div>

          {activeTab === 'details' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-300">
              {(product.details || ['Official match quality fabric', 'Moisture-wicking tech', 'Embroidered club crest']).map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-[#111] rounded-xl border border-[#222]">
                  <Check className="w-4 h-4 text-[#f4c84a] shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {REVIEWS.map((rev) => (
                <div key={rev.id} className="bg-[#111] p-4 rounded-xl border border-[#222] space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-sm">{rev.userName}</span>
                    <div className="flex text-[#f4c84a]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#f4c84a]" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-300">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* Footer */}
      <Footer
        onOpenCustomLab={() => setIsCustomStudioOpen(true)}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onSelectSport={() => router.push('/shop')}
      />

      {/* Slide-over Cart & Modals */}
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
