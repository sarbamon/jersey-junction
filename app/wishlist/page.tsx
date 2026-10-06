'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, ChevronRight } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { JerseyCard } from '../../components/JerseyCard';
import { PRODUCTS } from '../../data/jerseys';
import { useStore } from '../../context/StoreContext';
import { SizeGuideModal } from '../../components/SizeGuideModal';
import { TrackOrderModal } from '../../components/TrackOrderModal';
import { CustomJerseyStudio } from '../../components/CustomJerseyStudio';
import { CartDrawer } from '../../components/CartDrawer';
import { CheckoutModal } from '../../components/CheckoutModal';

export default function WishlistPage() {
  const router = useRouter();
  const { 
    wishlist, 
    toggleWishlist, 
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
          <span className="text-[#f4c84a] font-bold">Your Wishlist</span>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:py-12 space-y-8">
        <div className="border-b border-[#242424] pb-6">
          <h1 className="text-3xl sm:text-4xl font-bold font-serif uppercase">Your Saved Wishlist ({wishlist.length})</h1>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-16 space-y-4 bg-[#080808] rounded-3xl border border-[#242424] max-w-md mx-auto">
            <div className="w-16 h-16 bg-[#111] rounded-full flex items-center justify-center mx-auto text-[#f4c84a]">
              <Heart className="w-8 h-8" />
            </div>
            <div className="text-white text-base font-bold">No saved jerseys in your wishlist.</div>
            <Link
              href="/shop"
              className="inline-block px-8 py-3.5 bg-[#f4c84a] text-black font-black text-xs rounded-xl uppercase tracking-wider hover:bg-[#ffd96a] transition-all"
            >
              EXPLORE KITS
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {wishlist.map((product) => (
              <JerseyCard
                key={product.id}
                product={product}
                activeCurrency={activeCurrency}
                onSelectProduct={(p) => router.push(`/shop/${p.slug}`)}
                onQuickCustomize={(p) => router.push(`/shop/${p.slug}`)}
                isWishlisted={true}
                onToggleWishlist={toggleWishlist}
              />
            ))}
          </div>
        )}
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
