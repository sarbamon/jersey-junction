'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ChevronRight, 
  UserCheck
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { useStore } from '../../context/StoreContext';
import { PRODUCTS } from '../../data/jerseys';
import { SizeGuideModal } from '../../components/SizeGuideModal';
import { CustomJerseyStudio } from '../../components/CustomJerseyStudio';
import { CartDrawer } from '../../components/CartDrawer';
import { CheckoutModal } from '../../components/CheckoutModal';
import { AuthModal } from '../../components/AuthModal';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { 
    currentUser, 
    logoutUser, 
    setIsAuthOpen, 
    wishlist, 
    cartItems, 
    activeCurrency, 
    setActiveCurrency, 
    isCartOpen, 
    setIsCartOpen 
  } = useStore();

  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isCustomStudioOpen, setIsCustomStudioOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);


  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-[#f4c84a] selection:text-black">
      
      {/* Store Navbar */}
      <Navbar
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        wishlistCount={wishlist.length}
        activeCurrency={activeCurrency}
        onSelectCurrency={setActiveCurrency}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenCustomLab={() => setIsCustomStudioOpen(true)}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onSelectCategory={() => router.push('/shop')}
        products={PRODUCTS}
        onSelectProduct={(p) => router.push(`/shop/${p.slug}`)}
      />

      {/* Breadcrumb Navigation Bar */}
      <div className="bg-[#0a0a0a] border-b border-[#242424] py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-gray-400 font-medium">
          <Link href="/" className="hover:text-[#f4c84a] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
          <span className="text-[#f4c84a] font-bold uppercase tracking-wider">My Account</span>
        </div>
      </div>

      {/* Account Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {!currentUser ? (
          /* Unauthenticated Login Required Prompt */
          <div className="max-w-md mx-auto my-12 bg-[#0d0d0d] border border-[#242424] rounded-2xl p-8 text-center space-y-6 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-[#f4c84a]/10 border border-[#f4c84a]/30 text-[#f4c84a] flex items-center justify-center mx-auto">
              <UserCheck className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold font-serif uppercase tracking-tight text-white">
                CUSTOMER SIGN-IN REQUIRED
              </h2>
              <p className="text-xs text-gray-400">
                Please sign in to your Jersey Junction account to view your orders, coupons, addresses, and wishlist.
              </p>
            </div>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="w-full py-3.5 bg-[#f4c84a] hover:bg-[#e0b438] text-black font-extrabold uppercase rounded-xl text-xs tracking-wider transition-all cursor-pointer shadow-lg"
            >
              SIGN IN TO ACCOUNT
            </button>
          </div>
        ) : (
          <div className="w-full min-w-0">
            {children}
          </div>
        )}

      </main>

      {/* Global Customer Modals & Drawers */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems} 
        onUpdateQuantity={useStore().updateQuantity} 
        onRemoveItem={useStore().removeFromCart} 
        activeCurrency={activeCurrency} 
        onOpenCheckout={() => router.push('/checkout')} 
        discountPercentage={useStore().discountPercentage} 
        onApplyCoupon={useStore().applyCoupon} 
      />
      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
      <CustomJerseyStudio 
        isOpen={isCustomStudioOpen} 
        onClose={() => setIsCustomStudioOpen(false)} 
        activeCurrency={activeCurrency} 
        onAddToCart={useStore().addToCart} 
      />

      {/* Store Footer */}
      <Footer
        onOpenCustomLab={() => setIsCustomStudioOpen(true)}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onSelectSport={() => router.push('/shop')}
      />

    </div>
  );
}
