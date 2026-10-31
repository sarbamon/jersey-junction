'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { OrderProductImage } from '../../../components/OrderProductImage';

export default function AccountWishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useStore();

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="border-b border-[#242424] pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-serif uppercase tracking-tight text-white flex items-center gap-2">
            <Heart className="w-6 h-6 text-[#f4c84a] fill-[#f4c84a]" />
            <span>WISHLIST ({wishlist.length})</span>
          </h1>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-[#0d0d0d] border border-[#242424] rounded-2xl p-12 text-center text-xs text-gray-400 space-y-4">
          <Heart className="w-10 h-10 text-gray-600 mx-auto" />
          <div className="font-medium">Your wishlist is currently empty.</div>
          <Link href="/shop" className="inline-block px-4 py-2 bg-[#f4c84a] text-black font-bold uppercase rounded-lg text-xs">
            Discover Jerseys
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.map((item) => (
            <div key={item.id} className="bg-[#0d0d0d] border border-[#242424] rounded-2xl p-4 flex flex-col justify-between space-y-4 group">
              
              <div className="space-y-3">
                <div className="h-44 w-full rounded-xl bg-black border border-[#222] relative overflow-hidden flex items-center justify-center">
                  <OrderProductImage
                    src={item.image}
                    name={item.name}
                    productId={item.id}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {item.originalPrice && (
                    <span className="absolute top-2 left-2 bg-[#f4c84a] text-black text-[10px] font-black px-2 py-0.5 rounded uppercase">
                      SALE
                    </span>
                  )}
                </div>

                <div>
                  <Link href={`/shop/${item.slug}`} className="font-bold text-white text-xs hover:text-[#f4c84a] line-clamp-1">
                    {item.name}
                  </Link>
                  <span className="text-[10px] text-gray-400 font-mono block">{item.team} • {item.season}</span>
                </div>

                <div className="flex items-center gap-2 font-mono">
                  <span className="font-extrabold text-white text-base">₹{item.price}</span>
                  {item.originalPrice && (
                    <span className="text-xs text-gray-500 line-through">₹{item.originalPrice}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-[#222]">
                <button
                  onClick={() => addToCart(item, item.availableSizes[0] || 'L', 'Fan Version (Standard Fit)', '', '', [])}
                  className="flex-1 py-2 bg-[#f4c84a] hover:bg-[#e0b438] text-black font-extrabold uppercase rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={() => toggleWishlist(item)}
                  className="p-2 text-gray-400 hover:text-red-400 bg-black border border-[#222] rounded-lg transition-colors cursor-pointer"
                  title="Remove from Wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
