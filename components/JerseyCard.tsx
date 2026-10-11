'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Sparkles, ShoppingBag } from 'lucide-react';
import { JerseyProduct, Currency } from '../types';
import { JerseyViewerSVG } from './JerseyViewerSVG';
import { useStore } from '../context/StoreContext';

interface JerseyCardProps {
  product: JerseyProduct;
  activeCurrency: Currency;
  onSelectProduct: (product: JerseyProduct) => void;
  onQuickCustomize: (product: JerseyProduct) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (product: JerseyProduct) => void;
}

export const JerseyCard: React.FC<JerseyCardProps> = ({
  product,
  activeCurrency,
  onSelectProduct,
  onQuickCustomize,
  isWishlisted = false,
  onToggleWishlist
}) => {
  const { addToCart } = useStore();
  const [viewMode, setViewMode] = useState<'back' | 'front'>('back');
  const [isHovered, setIsHovered] = useState(false);

  const priceConverted = Math.round(product.price * activeCurrency.rate);
  const origPriceConverted = product.originalPrice 
    ? Math.round(product.originalPrice * activeCurrency.rate) 
    : null;

  const handleQuickAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(
      product,
      product.availableSizes[0] || 'L',
      'Fan Version (Standard Fit)',
      '',
      '',
      []
    );
  };

  return (
    <div
      className="group flex flex-col rounded-xl border border-[#242424] dark:border-[#242424] light:border-slate-200 bg-[#0c0c0c] dark:bg-[#0c0c0c] light:bg-white p-3 sm:p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#f4c84a]/60 hover:shadow-md text-white dark:text-white light:text-slate-900 font-sans justify-between"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Header Tag & Wishlist Button */}
      <div className="mb-2.5 flex items-center justify-between min-h-[24px]">
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="border border-[#f4c84a] px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#f4c84a] rounded-sm bg-[#f4c84a]/10">
            {product.sport === 'soccer' ? (product.name.toLowerCase().includes('set') ? 'SET' : 'FOOTBALL') : product.sport.toUpperCase()}
          </div>
          {product.isCustomizable && (
            <div className="border border-[#f4c84a]/40 px-1.5 py-0.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-[#f4c84a] rounded-sm bg-[#f4c84a]/10 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>CUSTOM</span>
            </div>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleWishlist) onToggleWishlist(product);
          }}
          className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full transition-transform hover:scale-110 ${
            isWishlisted ? 'bg-[#f4c84a] text-black' : 'bg-[#1a1a1a] dark:bg-[#1a1a1a] light:bg-slate-200 text-gray-400 hover:text-white dark:hover:text-white light:hover:text-black'
          }`}
          aria-label="Wishlist"
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? 'fill-black text-black' : ''}`} />
        </button>
      </div>

      {/* Jersey Visual Box - Links to full product page */}
      <Link
        href={`/shop/${product.slug}`}
        className="relative mb-3 flex w-full flex-1 items-center justify-center overflow-hidden rounded-lg bg-[#050505] dark:bg-[#050505] light:bg-slate-100 p-2 sm:p-4 cursor-pointer border border-[#1a1a1a] dark:border-[#1a1a1a] light:border-slate-200 min-h-[160px] sm:min-h-[200px]"
      >
        <div className="w-full flex justify-center items-center transform group-hover:scale-105 transition-transform duration-300">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-36 sm:h-44 w-full object-contain drop-shadow-xl rounded"
            />
          ) : (
            <JerseyViewerSVG
              primaryColor={product.colors.primary}
              secondaryColor={product.colors.secondary}
              accentColor={product.colors.accent}
              textColor={product.colors.text}
              pattern={product.pattern}
              sponsorText={product.sponsorText}
              name={product.defaultName || 'JUNCTION'}
              number={product.defaultNumber || '10'}
              view={isHovered ? (viewMode === 'back' ? 'front' : 'back') : viewMode}
              height={170}
            />
          )}
        </div>
      </Link>

      {/* Product Information */}
      <div className="space-y-1.5">
        <Link
          href={`/shop/${product.slug}`}
          className="line-clamp-2 font-serif text-[12px] sm:text-[14px] font-black uppercase leading-tight text-white dark:text-white light:text-slate-900 group-hover:text-[#f4c84a] cursor-pointer transition-colors block"
        >
          {product.name}
        </Link>

        <div className="flex items-center justify-between text-[9px] sm:text-[10px]">
          <p className="font-bold uppercase tracking-widest text-[#f4c84a] dark:text-[#f4c84a] light:text-amber-600">
            {product.isNew ? 'NEW' : (product.isBestseller ? 'BESTSELLER' : product.season)}
          </p>
          <span className="text-gray-400 dark:text-gray-400 light:text-slate-500 font-semibold">{product.league}</span>
        </div>

        {/* Price & Action Buttons */}
        <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#1a1a1a] dark:border-[#1a1a1a] light:border-slate-200">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm sm:text-base font-black text-[#f4c84a] dark:text-[#f4c84a] light:text-amber-600 font-mono">
              {activeCurrency.symbol}{priceConverted}
            </span>
            {origPriceConverted && (
              <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-500 light:text-slate-400 line-through">
                {activeCurrency.symbol}{origPriceConverted}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={handleQuickAddToCart}
              className="flex-1 sm:flex-none text-center justify-center px-2.5 py-1.5 bg-[#f4c84a] hover:bg-[#ffd96a] text-black font-extrabold text-[10px] sm:text-xs rounded uppercase tracking-wider flex items-center gap-1 transition-transform hover:scale-105 shadow-sm cursor-pointer"
              title="Add to Cart"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>ADD TO CART</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
