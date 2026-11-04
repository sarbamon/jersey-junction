'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  Heart, 
  MapPin, 
  Lock, 
  Ticket, 
  Headphones, 
  ArrowRight,
  LogOut
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { productService } from '../../lib/services/productService';
import { settingsService } from '../../lib/services/settingsService';
import { JerseyProduct } from '../../types';
import { OrderProductImage } from '../../components/OrderProductImage';

export default function AccountOverviewPage() {
  const router = useRouter();
  const { currentUser, logoutUser } = useStore();
  const [recommended, setRecommended] = useState<JerseyProduct[]>([]);

  useEffect(() => {
    let isMounted = true;
    productService.getActiveProducts().then((prods) => {
      if (isMounted && prods && prods.length > 0) {
        setRecommended(prods.slice(0, 4));
      }
    }).catch(() => {
      const cached = productService.getCachedProductsSync();
      if (isMounted && cached && cached.length > 0) {
        setRecommended(cached.slice(0, 4));
      }
    });
    return () => { isMounted = false; };
  }, []);

  if (!currentUser) return null;

  const handleLogout = () => {
    logoutUser();
    router.push('/');
  };

  const storeSettings = settingsService.getSettings();
  const rawWa = storeSettings?.storeWhatsapp || storeSettings?.storePhone || '917002740268';
  const whatsappNumber = rawWa.replace(/[^0-9]/g, '') || '917002740268';

  const actionTiles = [
    { label: 'Orders', href: '/account/orders', icon: Package },
    { label: 'Wishlist', href: '/account/wishlist', icon: Heart },
    { label: 'Address', href: '/account/addresses', icon: MapPin },
    { label: 'Set Password', href: '/account/profile', icon: Lock },
    { label: 'Coupons', href: '/account/coupons', icon: Ticket },
    { label: 'Help Center', href: `https://wa.me/${whatsappNumber}`, icon: Headphones, isExternal: true },
  ];

  return (
    <div className="space-y-10 font-sans max-w-5xl mx-auto">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#242424] gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif uppercase tracking-tight text-white">
            Hello, {currentUser.name}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-mono mt-1">
            {currentUser.email}
          </p>
        </div>

        <div>
          <button
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300 font-bold uppercase tracking-wider text-xs border border-red-500/30 px-4 py-2 rounded-xl hover:bg-red-500/10 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>SIGN OUT</span>
          </button>
        </div>
      </div>

      {/* 6 Action Tiles Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {actionTiles.map((tile) => {
          const Icon = tile.icon;
          const content = (
            <div className="bg-[#0d0d0d] border border-[#242424] hover:border-[#f4c84a]/60 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center gap-3 transition-all duration-200 group hover:-translate-y-0.5 shadow-sm min-h-[130px] sm:min-h-[150px]">
              <div className="text-gray-300 group-hover:text-[#f4c84a] transition-colors">
                <Icon className="w-7 h-7 sm:w-8 sm:h-8 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-gray-200 group-hover:text-white transition-colors">
                {tile.label}
              </span>
            </div>
          );

          if (tile.isExternal) {
            return (
              <a
                key={tile.label}
                href={tile.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {content}
              </a>
            );
          }

          return (
            <Link key={tile.label} href={tile.href} className="block">
              {content}
            </Link>
          );
        })}
      </div>

      {/* Recommended Jerseys */}
      {recommended.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold font-serif uppercase tracking-wider text-white">
              Recommended Jerseys
            </h2>
            <Link
              href="/shop"
              className="text-xs font-bold text-[#f4c84a] hover:underline flex items-center gap-1"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recommended.map((item) => (
              <Link
                key={item.id}
                href={`/shop/${item.slug}`}
                className="bg-[#0d0d0d] border border-[#242424] hover:border-[#f4c84a]/60 rounded-2xl p-3 flex flex-col justify-between space-y-3 group transition-all"
              >
                <div className="aspect-[3/4] w-full rounded-xl bg-black border border-[#222] relative overflow-hidden flex items-center justify-center">
                  <OrderProductImage
                    src={item.image}
                    name={item.name}
                    productId={item.id}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white uppercase truncate">
                    {item.name}
                  </div>
                  <div className="text-xs font-mono font-bold text-[#f4c84a]">
                    ₹{item.price}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
