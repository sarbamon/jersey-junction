'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  User, 
  ShoppingBag, 
  Heart, 
  Ticket, 
  MapPin, 
  LogOut, 
  ChevronRight, 
  LayoutDashboard, 
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

  const handleLogout = () => {
    logoutUser();
    router.push('/');
  };

  const navItems = [
    { label: 'Overview', href: '/account', icon: LayoutDashboard },
    { label: 'My Orders', href: '/account/orders', icon: ShoppingBag },
    { label: 'Wishlist', href: '/account/wishlist', icon: Heart },
    { label: 'Coupons', href: '/account/coupons', icon: Ticket },
    { label: 'Profile', href: '/account/profile', icon: User },
    { label: 'Addresses', href: '/account/addresses', icon: MapPin },
  ];

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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Navigation Sidebar */}
            <div className="lg:col-span-3 space-y-4">
              
              {/* Customer Avatar & Name Badge */}
              <div className="bg-[#0d0d0d] border border-[#242424] rounded-2xl p-4 flex items-center gap-3 shadow-md">
                <div className="h-10 w-10 rounded-full bg-[#f4c84a]/10 border border-[#f4c84a]/30 text-[#f4c84a] font-serif font-black flex items-center justify-center text-base shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="truncate">
                  <div className="font-serif font-bold text-sm text-white truncate">{currentUser.name}</div>
                  <div className="text-[11px] text-gray-400 truncate">{currentUser.email}</div>
                </div>
              </div>

              {/* Static Grid / Vertical Navigation Menu (No sliding or scrolling bar) */}
              <div className="bg-[#0d0d0d] border border-[#242424] rounded-2xl p-3 font-sans shadow-md space-y-2">
                
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 pb-2 border-b border-[#1f1f1f]">
                  MY ACCOUNT
                </div>

                <nav className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1.5">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== '/account' && pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-[#f4c84a] text-black font-extrabold shadow-sm'
                            : 'text-gray-300 hover:text-[#f4c84a] hover:bg-[#161616]'
                        }`}
                      >
                        <span className="flex items-center gap-2.5 truncate">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-black' : 'text-[#f4c84a]'}`} />
                          <span className="truncate">{item.label}</span>
                        </span>
                        {isActive && <ChevronRight className="w-4 h-4 text-black hidden lg:block shrink-0" />}
                      </Link>
                    );
                  })}

                  <button
                    onClick={handleLogout}
                    className="col-span-2 sm:col-span-3 lg:col-span-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer mt-1 border-t border-[#1f1f1f] pt-2"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>Logout</span>
                  </button>
                </nav>

              </div>

            </div>

            {/* Right Main Content Panel */}
            <div className="lg:col-span-9 min-w-0">
              {children}
            </div>

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
      <AuthModal />
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
