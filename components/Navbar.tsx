'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  Search, 
  Heart, 
  UserRound, 
  ChevronDown, 
  Menu, 
  X,
  Sparkles,
  PackageCheck,
  Ruler,
  Globe,
  Sun,
  Moon,
  FileText,
  Mail,
  Phone,
  MapPin,
  Truck
} from 'lucide-react';
import { JerseyProduct, Currency } from '../types';
import { CURRENCIES } from '../data/jerseys';
import { useStore } from '../context/StoreContext';
import { categoryService } from '../lib/services/categoryService';
import { settingsService } from '../lib/services/settingsService';
import { AdminCategory, StoreSettings } from '../lib/types/admin';
import { INITIAL_CATEGORIES } from '../lib/mock/categories';
import { TrackOrderModal } from './TrackOrderModal';

interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
  activeCurrency: Currency;
  onSelectCurrency: (currency: Currency) => void;
  onOpenCart: () => void;
  onOpenCustomLab: () => void;
  onOpenSizeGuide: () => void;
  onSelectCategory: (category: string) => void;
  products: JerseyProduct[];
  onSelectProduct: (product: JerseyProduct) => void;
  onOpenWishlist?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  wishlistCount,
  activeCurrency,
  onSelectCurrency,
  onOpenCart,
  onOpenCustomLab,
  onOpenSizeGuide,
  onSelectCategory,
  products,
  onSelectProduct,
  onOpenWishlist
}) => {
  const router = useRouter();
  const { theme, toggleTheme, currentUser, setIsAuthOpen } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileShopOpen, setIsMobileShopOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);

  const [adminCategories, setAdminCategories] = useState<AdminCategory[]>(INITIAL_CATEGORIES);

  React.useEffect(() => {
    setStoreSettings(settingsService.getSettings());
  }, []);

  React.useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  React.useEffect(() => {
    let isMounted = true;
    setAdminCategories(categoryService.getCategoriesSync().filter((c) => c.status === 'Active'));
    categoryService.getActiveCategories().then((cats) => {
      if (isMounted) setAdminCategories(cats);
    });
    return () => { isMounted = false; };
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    setIsSearchOpen(false);
    router.push(`/shop?search=${encodeURIComponent(trimmed)}`);
  };
  const scrollToShop = (catId?: string) => {
    if (catId && catId !== 'all') {
      router.push(`/shop?category=${catId}`);
    } else {
      router.push('/shop');
    }
  };

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-[#242424] bg-black text-[#f4c84a] shadow-md font-sans">
      
      {/* Main Header Container */}
      <div className="relative mx-auto flex h-[60px] sm:h-[72px] w-full max-w-7xl items-center justify-between px-2 sm:px-6 lg:h-[78px] lg:px-10">
        
        {/* Left Side: Hamburger Toggle + Brand Logo (Left on mobile) + Desktop Navigation Links */}
        <div className="flex items-center gap-1 sm:gap-3">
          {/* Hamburger Menu Toggle Button (Mobile & Tablet Only, Hidden on Desktop) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex lg:hidden h-9 w-9 sm:h-10 sm:w-10 items-center justify-center text-[#f4c84a] hover:opacity-80 p-1 cursor-pointer transition-opacity shrink-0"
            aria-label="Toggle navigation menu"
            title="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>

          {/* Brand Logo (Left-aligned next to hamburger button, prevents any collision) */}
          <Link 
            href="/"
            className="cursor-pointer flex flex-col items-center pointer-events-auto shrink-0"
          >
            <div className="header-logo-crest border px-2 sm:px-3 py-1 rounded-md flex items-center justify-center gap-1 group hover:scale-105 transition-transform">
              <span className="font-serif text-[11px] xs:text-xs sm:text-base lg:text-xl font-black tracking-tighter whitespace-nowrap">
                <span className="logo-jersey">JERSEY</span> <span className="logo-junction font-extrabold">JUNCTION</span>
              </span>
            </div>
          </Link>

          {/* Left Nav Menu Links (Desktop) */}
          <nav className="hidden items-center gap-6 xl:gap-8 lg:flex ml-4">
            <Link
              href="/"
              className="font-serif text-[14px] font-bold tracking-[0.08em] hover:opacity-70 uppercase transition-opacity"
            >
              HOME
            </Link>

            {/* SHOP Dropdown */}
            <div className="relative" onMouseLeave={() => setIsShopDropdownOpen(false)}>
              <button
                onMouseEnter={() => setIsShopDropdownOpen(true)}
                onClick={() => scrollToShop('all')}
                className="flex items-center gap-1.5 font-serif text-[14px] font-bold tracking-[0.08em] uppercase hover:opacity-80 transition-opacity cursor-pointer"
              >
                <span>SHOP</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {isShopDropdownOpen && (
                <div 
                  className="absolute left-0 top-full mt-2 w-64 bg-black border border-[#242424] rounded-lg shadow-2xl py-2 z-50 divide-y divide-[#181818]"
                  onMouseEnter={() => setIsShopDropdownOpen(true)}
                >
                  <button
                    onClick={() => {
                      scrollToShop('all');
                      setIsShopDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-300 hover:text-[#f4c84a] hover:bg-[#111] transition-colors flex justify-between items-center cursor-pointer"
                  >
                    <span>All Jerseys</span>
                    <span className="text-[10px] text-gray-500 font-mono">Catalog</span>
                  </button>
                  {adminCategories.map((cat) => {
                    const catKey = cat.slug || cat.id;
                    return (
                      <button
                        key={cat.id || cat.slug}
                        onClick={() => {
                          scrollToShop(catKey);
                          setIsShopDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-300 hover:text-[#f4c84a] hover:bg-[#111] transition-colors flex justify-between items-center cursor-pointer"
                      >
                        <span>{cat.name}</span>
                        {cat.tag && <span className="text-[10px] text-gray-500 font-mono">{cat.tag}</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ABOUT US */}
            <Link
              href="/about"
              className="font-serif text-[14px] font-bold tracking-[0.08em] hover:opacity-70 uppercase transition-opacity"
            >
              ABOUT US
            </Link>

            {/* CONTACT US */}
            <Link
              href="/contact"
              className="font-serif text-[14px] font-bold tracking-[0.08em] hover:opacity-70 uppercase transition-opacity"
            >
              CONTACT US
            </Link>

            {/* MORE Dropdown */}
            <div className="relative" onMouseLeave={() => setIsMoreDropdownOpen(false)}>
              <button
                onMouseEnter={() => setIsMoreDropdownOpen(true)}
                onClick={() => setIsMoreDropdownOpen(!isMoreDropdownOpen)}
                className="flex items-center gap-1.5 font-serif text-[14px] font-bold tracking-[0.08em] uppercase hover:opacity-80 transition-opacity cursor-pointer"
              >
                <span>MORE</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {isMoreDropdownOpen && (
                <div 
                  className="absolute left-0 top-full mt-2 w-56 bg-black border border-[#242424] rounded-lg shadow-2xl py-2 z-50 divide-y divide-[#181818]"
                  onMouseEnter={() => setIsMoreDropdownOpen(true)}
                >
                  <Link
                    href="/terms"
                    onClick={() => setIsMoreDropdownOpen(false)}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-300 hover:text-[#f4c84a] hover:bg-[#111] flex items-center justify-between cursor-pointer"
                  >
                    <span>Terms & Conditions</span>
                    <FileText className="w-3.5 h-3.5 text-[#f4c84a]" />
                  </Link>

                  <button
                    onClick={() => { setIsTrackOrderOpen(true); setIsMoreDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-300 hover:text-[#f4c84a] hover:bg-[#111] flex items-center justify-between cursor-pointer"
                  >
                    <span>Track Order</span>
                    <Truck className="w-3.5 h-3.5 text-[#f4c84a]" />
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right Header Icons */}
        <div className="ml-auto flex items-center gap-0.5 sm:gap-3 shrink-0">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="transition-transform hover:scale-110 text-[#f4c84a] p-1 sm:p-1.5 rounded-full hover:bg-zinc-800/40"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-indigo-600" />}
          </button>

          {/* Search Trigger */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="transition-opacity hover:opacity-70 text-[#f4c84a] p-1 sm:p-1.5"
            aria-label="Search"
          >
            <Search className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          </button>

          {/* Account Icon */}
          <button
            onClick={() => {
              if (currentUser) {
                router.push('/account');
              } else {
                setIsAuthOpen(true);
              }
            }}
            className="flex items-center gap-2 transition-all p-0.5 rounded-full cursor-pointer"
            aria-label="Account"
            title={currentUser ? `Account: ${currentUser.name}` : 'Login / Register'}
          >
            {currentUser ? (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 text-black font-extrabold flex items-center justify-center text-xs shadow-md border-2 border-amber-300 hover:scale-105 transition-transform uppercase font-mono">
                {currentUser.name ? currentUser.name.trim().charAt(0).toUpperCase() : 'U'}
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 text-amber-400 hover:border-amber-400/50 hover:bg-zinc-800/80 flex items-center justify-center transition-all shadow-sm">
                <UserRound className="w-4 h-4" />
              </div>
            )}
          </button>

          {/* Wishlist Icon */}
          <button
            onClick={() => {
              if (onOpenWishlist) {
                onOpenWishlist();
              } else {
                router.push('/wishlist');
              }
            }}
            className="relative transition-opacity hover:opacity-70 text-[#f4c84a] p-1 sm:p-1.5 cursor-pointer"
            aria-label="Wishlist"
            title="Wishlist"
          >
            <Heart className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#f4c84a] text-black text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Shopping Cart Drawer Trigger */}
          <button
            onClick={onOpenCart}
            className="relative transition-opacity hover:opacity-70 text-[#f4c84a] p-1 sm:p-1.5"
            aria-label="Cart"
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#f4c84a] text-black text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search Input Bar (Expandable) */}
      {isSearchOpen && (
        <div className="bg-[#111] border-t border-[#242424] p-3 relative z-50">
          <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto relative flex items-center">
            <input
              type="text"
              placeholder="Search jerseys, teams, players (Press Enter to search)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchSubmit(e);
                }
              }}
              autoFocus
              className="w-full bg-black border border-[#f4c84a] rounded-lg pl-3.5 pr-24 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#f4c84a]"
            />
            <div className="absolute right-2 flex items-center gap-1.5">
              {searchQuery && (
                <button 
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-gray-400 hover:text-white p-1"
                  title="Clear text"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="bg-[#f4c84a] text-black px-2.5 py-1 rounded text-xs font-bold hover:bg-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
                title="Search on Enter"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Drawer Menu (Unified Mobile & Desktop) */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop Overlay for Desktop */}
          <div 
            onClick={() => setIsMobileMenuOpen(false)}
            className="hidden lg:block fixed inset-0 top-[78px] bg-black/70 backdrop-blur-sm z-[115] animate-fade-in cursor-pointer"
          />

          <div className="fixed inset-x-0 top-[60px] sm:top-[72px] lg:top-[78px] lg:left-0 lg:right-auto lg:w-[380px] bottom-0 z-[120] bg-black text-[#f4c84a] overflow-y-auto animate-fade-in divide-y divide-[#181818] border-t lg:border-t-0 lg:border-r border-[#181818] shadow-2xl">
          
          {/* 1. HOME */}
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block w-full px-6 py-4 text-left font-serif text-[15px] sm:text-base font-black tracking-wider uppercase text-[#f4c84a] hover:text-white hover:bg-zinc-950 transition-colors"
          >
            HOME
          </Link>

          {/* 2. SHOP (with expandable categories) */}
          <div className="w-full">
            <button
              onClick={() => setIsMobileShopOpen(!isMobileShopOpen)}
              className="w-full px-6 py-4 flex items-center justify-between font-serif text-[15px] sm:text-base font-black tracking-wider uppercase text-[#f4c84a] hover:text-white hover:bg-zinc-950 transition-colors cursor-pointer"
            >
              <span>SHOP</span>
              <ChevronDown 
                className={`w-5 h-5 text-[#f4c84a] transition-transform duration-300 ${isMobileShopOpen ? 'rotate-180' : ''}`} 
              />
            </button>

            {isMobileShopOpen && (
              <div className="bg-[#0a0a0a] border-t border-[#181818] divide-y divide-[#141414] animate-fade-in">
                <button
                  onClick={() => {
                    scrollToShop('all');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-10 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-[#f4c84a] hover:bg-black/50 transition-colors flex items-center justify-between"
                >
                  <span>All Jerseys</span>
                  <span className="text-[10px] text-zinc-500 font-mono">Catalog</span>
                </button>
                {adminCategories.map((cat) => (
                  <button
                    key={cat.id || cat.slug}
                    onClick={() => {
                      scrollToShop(cat.slug || cat.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full px-10 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-[#f4c84a] hover:bg-black/50 transition-colors flex items-center justify-between"
                  >
                    <span>{cat.name}</span>
                    {cat.tag && (
                      <span className="text-[10px] text-zinc-500 font-mono uppercase">{cat.tag}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. WISHLIST */}
          <Link
            href="/wishlist"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full px-6 py-4 flex items-center justify-between font-serif text-[15px] sm:text-base font-black tracking-wider uppercase text-[#f4c84a] hover:text-white hover:bg-zinc-950 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Heart className="w-4 h-4 text-[#f4c84a]" />
              <span>WISHLIST</span>
            </div>
            {wishlistCount > 0 && (
              <span className="bg-[#f4c84a] text-black text-[10px] font-mono font-black px-2 py-0.5 rounded-full">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* 4. ABOUT US */}
          <Link
            href="/about"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block w-full px-6 py-4 text-left font-serif text-[15px] sm:text-base font-black tracking-wider uppercase text-[#f4c84a] hover:text-white hover:bg-zinc-950 transition-colors"
          >
            ABOUT US
          </Link>

          {/* 4. CONTACT US */}
          <Link
            href="/contact"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block w-full px-6 py-4 text-left font-serif text-[15px] sm:text-base font-black tracking-wider uppercase text-[#f4c84a] hover:text-white hover:bg-zinc-950 transition-colors"
          >
            CONTACT US
          </Link>

          {/* 5. TERMS AND CONDITIONS */}
          <Link
            href="/terms"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block w-full px-6 py-4 text-left font-serif text-[15px] sm:text-base font-black tracking-wider uppercase text-[#f4c84a] hover:text-white hover:bg-zinc-950 transition-colors"
          >
            TERMS AND CONDITIONS
          </Link>

          {/* 6. MY ACCOUNT */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              if (currentUser) {
                router.push('/account');
              } else {
                setIsAuthOpen(true);
              }
            }}
            className="block w-full px-6 py-4 text-left font-serif text-[15px] sm:text-base font-black tracking-wider uppercase text-[#f4c84a] hover:text-white hover:bg-zinc-950 transition-colors cursor-pointer"
          >
            MY ACCOUNT
          </button>

          {/* 7. TRACK ORDER */}
          <button
            onClick={() => {
              setIsTrackOrderOpen(true);
              setIsMobileMenuOpen(false);
            }}
            className="block w-full px-6 py-4 text-left font-serif text-[15px] sm:text-base font-black tracking-wider uppercase text-[#f4c84a] hover:text-white hover:bg-zinc-950 transition-colors cursor-pointer"
          >
            TRACK ORDER
          </button>


          </div>
        </>
      )}

      {/* Track Order Live Modal */}
      <TrackOrderModal
        isOpen={isTrackOrderOpen}
        onClose={() => setIsTrackOrderOpen(false)}
      />

    </header>
  );
};
