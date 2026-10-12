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
  Moon
} from 'lucide-react';
import { JerseyProduct, Currency } from '../types';
import { CURRENCIES, CATEGORIES } from '../data/jerseys';
import { useStore } from '../context/StoreContext';
import { categoryService } from '../lib/services/categoryService';
import { AdminCategory } from '../lib/types/admin';

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
  onSelectProduct
}) => {
  const router = useRouter();
  const { theme, toggleTheme, currentUser, setIsAuthOpen } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);

  const [adminCategories, setAdminCategories] = useState<AdminCategory[]>([]);

  React.useEffect(() => {
    let isMounted = true;
    categoryService.getActiveCategories().then((cats) => {
      if (isMounted) setAdminCategories(cats);
    });
    return () => { isMounted = false; };
  }, []);

  const searchResults = searchQuery.trim()
    ? products.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.league.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];
  const scrollToShop = (catId?: string) => {
    if (catId) onSelectCategory(catId);
    setTimeout(() => {
      const shopElem = document.getElementById('shop');
      if (shopElem) {
        shopElem.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-[#242424] bg-black text-[#f4c84a] shadow-md font-sans">
      
      {/* Main Header Container */}
      <div className="relative mx-auto flex h-[60px] sm:h-[72px] w-full max-w-7xl items-center justify-between px-3 sm:px-6 lg:h-[78px] lg:px-10">
        
        {/* Mobile Hamburger Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex h-10 w-10 items-center justify-center lg:hidden text-[#f4c84a] p-1"
          aria-label="Open menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Left Nav Menu Links (Desktop) */}
        <nav className="hidden items-center gap-8 lg:flex">
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
              className="flex items-center gap-1.5 font-serif text-[14px] font-bold tracking-[0.08em] uppercase hover:opacity-80 transition-opacity"
            >
              <span>SHOP</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {isShopDropdownOpen && (
              <div 
                className="absolute left-0 top-full mt-2 w-64 bg-black border border-[#242424] rounded-lg shadow-2xl py-2 z-50"
                onMouseEnter={() => setIsShopDropdownOpen(true)}
              >
                {adminCategories.map((cat) => {
                  const catKey = cat.slug || cat.id;
                  return (
                    <button
                      key={cat.id || cat.slug}
                      onClick={() => {
                        scrollToShop(catKey);
                        setIsShopDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-gray-300 hover:text-[#f4c84a] hover:bg-[#111] transition-colors flex justify-between items-center"
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] text-gray-500 font-mono">{cat.tag}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* MORE Dropdown */}
          <div className="relative" onMouseLeave={() => setIsMoreDropdownOpen(false)}>
            <button
              onMouseEnter={() => setIsMoreDropdownOpen(true)}
              onClick={() => setIsMoreDropdownOpen(!isMoreDropdownOpen)}
              className="flex items-center gap-1.5 font-serif text-[14px] font-bold tracking-[0.08em] uppercase"
            >
              <span>MORE</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {isMoreDropdownOpen && (
              <div 
                className="absolute left-0 top-full mt-2 w-48 bg-black border border-[#242424] rounded-lg shadow-2xl py-2 z-50"
                onMouseEnter={() => setIsMoreDropdownOpen(true)}
              >
                <button
                  onClick={() => { onOpenSizeGuide(); setIsMoreDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-gray-300 hover:text-[#f4c84a] hover:bg-[#111]"
                >
                  Size Guide
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Center Brand Logo */}
        <Link 
          href="/"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer flex flex-col items-center pointer-events-auto max-w-[50%] sm:max-w-none"
        >
          <div className="header-logo-crest border px-2 sm:px-4 py-1 rounded-md flex items-center justify-center gap-1 group hover:scale-105 transition-transform">
            <span className="font-serif text-[11px] xs:text-xs sm:text-xl lg:text-2xl font-black tracking-tighter whitespace-nowrap">
              <span className="logo-jersey">JERSEY</span> <span className="logo-junction font-extrabold">JUNCTION</span>
            </span>
          </div>
        </Link>

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
              <div className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 text-black font-extrabold flex items-center justify-center text-xs shadow-md border-2 border-amber-300 group-hover:scale-105 transition-transform uppercase font-mono">
                  {currentUser.name ? currentUser.name.trim().charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden sm:inline font-bold text-xs text-white max-w-[80px] truncate group-hover:text-amber-400 transition-colors">
                  {currentUser.name}
                </span>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 text-amber-400 hover:border-amber-400/50 hover:bg-zinc-800/80 flex items-center justify-center transition-all shadow-sm">
                <UserRound className="w-4 h-4" />
              </div>
            )}
          </button>

          {/* Wishlist Icon */}
          <button
            onClick={() => onSelectCategory('all')}
            className="relative transition-opacity hover:opacity-70 text-[#f4c84a] p-1 sm:p-1.5"
            aria-label="Wishlist"
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
          <div className="max-w-xl mx-auto relative">
            <input
              type="text"
              placeholder="Search Arsenal, Real Madrid, Messi, Kobe, Retro..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full bg-black border border-[#f4c84a] rounded-lg px-3.5 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Dropdown Overlay Results */}
            {searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-11 bg-black border border-[#333] rounded-lg shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        onSelectProduct(p);
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="p-3 hover:bg-[#1a1a1a] flex items-center justify-between cursor-pointer border-b border-[#222] last:border-0"
                    >
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-white">{p.name}</div>
                        <div className="text-[10px] text-gray-400">{p.team} • {p.season}</div>
                      </div>
                      <div className="text-[#f4c84a] font-black text-xs sm:text-sm">
                        {activeCurrency.symbol}{(p.price * activeCurrency.rate).toFixed(0)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-gray-400">
                    No jerseys found matching &quot;{searchQuery}&quot;
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-black border-t border-[#242424] p-4 space-y-4 font-sans text-xs">
          <div className="grid grid-cols-2 gap-2 font-bold">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full p-3 bg-[#111] hover:bg-[#222] rounded text-center text-white font-bold"
            >
              HOME
            </Link>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (currentUser) {
                  router.push('/account');
                } else {
                  setIsAuthOpen(true);
                }
              }}
              className="block w-full p-3 bg-[#111] hover:bg-[#222] text-[#f4c84a] rounded text-center font-bold"
            >
              MY ACCOUNT
            </button>
          </div>

          <div className="flex justify-center items-center bg-[#111] p-3 rounded border border-[#222]">
            <button 
              onClick={() => { onOpenSizeGuide(); setIsMobileMenuOpen(false); }}
              className="text-gray-300 font-bold hover:text-[#f4c84a] flex items-center gap-1.5"
            >
              <Ruler className="w-4 h-4 text-[#f4c84a]" />
              <span>Size Guide</span>
            </button>
          </div>

          <div className="text-xs font-bold text-[#f4c84a] uppercase tracking-wider pt-2 border-t border-[#222]">
            SHOP BY CATEGORY
          </div>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  scrollToShop(cat.id);
                  setIsMobileMenuOpen(false);
                }}
                className="p-2.5 bg-[#111] hover:bg-[#222] rounded text-left text-gray-300 font-semibold"
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

    </header>
  );
};
