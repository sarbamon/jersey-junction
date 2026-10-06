'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Star, 
  Check, 
  ShieldCheck, 
  Truck, 
  RotateCw, 
  Ruler, 
  ShoppingBag, 
  Sparkles, 
  Heart,
  ArrowLeft,
  ChevronRight,
  MessageSquare,
  ThumbsUp
} from 'lucide-react';
import { JerseyViewerSVG } from '../../../components/JerseyViewerSVG';
import { JerseyProduct, VersionType, PatchOption } from '../../../types';
import { PRODUCTS, AVAILABLE_PATCHES, REVIEWS } from '../../../data/jerseys';
import { Navbar } from '../../../components/Navbar';
import { Footer } from '../../../components/Footer';
import { CartDrawer } from '../../../components/CartDrawer';
import { SizeGuideModal } from '../../../components/SizeGuideModal';
import { TrackOrderModal } from '../../../components/TrackOrderModal';
import { CustomJerseyStudio } from '../../../components/CustomJerseyStudio';
import { CheckoutModal } from '../../../components/CheckoutModal';
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
    setActiveCurrency
  } = useStore();

  const product = PRODUCTS.find((p) => p.slug === slug) || PRODUCTS.find((p) => p.id === slug) || PRODUCTS[0];

  const [selectedSize, setSelectedSize] = useState('L');
  const [selectedVersion, setSelectedVersion] = useState<VersionType>('Player Edition (Slim Fit)');
  const [printOption, setPrintOption] = useState<'blank' | 'preset' | 'custom'>('preset');
  const [customName, setCustomName] = useState(product?.defaultName || '');
  const [customNumber, setCustomNumber] = useState(product?.defaultNumber || '');
  const [selectedPatches, setSelectedPatches] = useState<PatchOption[]>([]);
  const [view, setView] = useState<'back' | 'front'>('back');
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [isCustomStudioOpen, setIsCustomStudioOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const versionExtra = selectedVersion.includes('Player') ? 150 : 0;
  const patchesExtra = selectedPatches.reduce((acc, p) => acc + p.price, 0);
  const printExtra = printOption === 'blank' ? 0 : 100;

  const finalUnitPrice = product.price + versionExtra + patchesExtra + printExtra;
  const finalUnitPriceConverted = Math.round(finalUnitPrice * activeCurrency.rate);
  const isWishlisted = wishlist.some((item) => item.id === product.id);

  const handleTogglePatch = (patch: PatchOption) => {
    if (selectedPatches.some((p) => p.id === patch.id)) {
      setSelectedPatches(selectedPatches.filter((p) => p.id !== patch.id));
    } else {
      setSelectedPatches([...selectedPatches, patch]);
    }
  };

  const handleAddToCart = () => {
    addToCart(
      product,
      selectedSize,
      selectedVersion,
      '',
      '',
      []
    );
    setIsCartOpen(true);
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
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
        onOpenCustomLab={() => setIsCustomStudioOpen(true)}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onSelectCategory={() => router.push('/shop')}
        products={PRODUCTS}
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
          
          {/* Left Column: Product Image */}
          <div className="lg:col-span-6 bg-[#080808] border border-[#242424] rounded-3xl p-6 sm:p-8 relative flex flex-col items-center justify-center shadow-2xl min-h-[350px] sm:min-h-[450px]">
            
            {/* Real Product Picture / SVG Visualizer Canvas */}
            <div className="py-4 my-auto w-full flex flex-col items-center justify-center">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-72 sm:h-96 w-full object-contain drop-shadow-2xl rounded-xl"
                />
              ) : (
                <JerseyViewerSVG
                  primaryColor={product.colors.primary}
                  secondaryColor={product.colors.secondary}
                  accentColor={product.colors.accent}
                  textColor={product.colors.text}
                  pattern={product.pattern}
                  sponsorText={product.sponsorText}
                  name={product.defaultName || ''}
                  number={product.defaultNumber || ''}
                  view={view}
                  patchNames={[]}
                  height={380}
                />
              )}
            </div>
          </div>

          {/* Right Column: Customization & Product Specification Form */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Title & Rating */}
            <div className="space-y-2 border-b border-[#242424] pb-6">
              <div className="flex justify-between items-start">
                <h1 className="font-serif text-2xl sm:text-4xl font-bold text-white uppercase leading-tight">
                  {product.name}
                </h1>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-3 rounded-full border transition-all ${
                    isWishlisted 
                      ? 'bg-[#f4c84a] text-black border-[#f4c84a]' 
                      : 'bg-[#111] text-gray-400 border-[#333] hover:text-white'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-black' : ''}`} />
                </button>
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
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                IN STOCK & READY TO SHIP
              </span>
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
                  <span>Size Guide & Chart</span>
                </button>
              </div>

              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                {product.availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 text-xs font-black rounded-xl border transition-all ${
                      selectedSize === size
                        ? 'bg-[#f4c84a] text-black border-[#f4c84a] shadow-md scale-105'
                        : 'bg-[#111] text-gray-300 border-[#333] hover:bg-[#1a1a1a]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Cart CTA Button */}
            <button
              onClick={handleAddToCart}
              className="w-full py-4 bg-gradient-to-r from-[#f4c84a] to-[#d4af37] hover:from-[#ffd96a] hover:to-[#f4c84a] text-black font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:scale-[1.01] transition-all mt-6"
            >
              <ShoppingBag className="w-5 h-5 text-black" />
              <span>ADD TO BAG ({activeCurrency.symbol}{Math.round(product.price * activeCurrency.rate)})</span>
            </button>

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
              Kit Features & Fabric Details
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
              {product.details.map((item, idx) => (
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
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
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
