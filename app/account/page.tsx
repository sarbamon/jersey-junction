'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Clock, Heart, Ticket, ArrowRight, Eye, ChevronRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { orderService } from '../../lib/services/orderService';
import { couponService } from '../../lib/services/couponService';
import { AdminOrder } from '../../lib/types/admin';

export default function AccountOverviewPage() {
  const { currentUser, wishlist } = useStore();
  const [userOrders, setUserOrders] = useState<AdminOrder[]>([]);
  const [availableCouponsCount, setAvailableCouponsCount] = useState(0);

  useEffect(() => {
    if (currentUser) {
      const allOrders = orderService.getOrders();
      const matched = allOrders.filter(o => 
        o.email.toLowerCase() === currentUser.email.toLowerCase() || 
        o.customerName.toLowerCase() === currentUser.name.toLowerCase()
      );
      setUserOrders(matched);

      const coupons = couponService.getCoupons();
      setAvailableCouponsCount(coupons.filter(c => c.status === 'Active').length);
    }
  }, [currentUser]);

  if (!currentUser) return null;

  const pendingOrdersCount = userOrders.filter(o => 
    o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled'
  ).length;

  const recentOrders = userOrders.slice(0, 4);

  return (
    <div className="space-y-8 font-sans">
      
      {/* Welcome Banner */}
      <div className="bg-[#0d0d0d] border border-[#242424] p-6 sm:p-8 rounded-2xl">
        <h1 className="text-2xl sm:text-3xl font-black font-serif uppercase tracking-tight text-white">
          WELCOME BACK, {currentUser.name.split(' ')[0]}
        </h1>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <Link href="/account/orders" className="bg-[#0d0d0d] border border-[#242424] p-4 rounded-2xl hover:border-[#f4c84a]/50 transition-colors group">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-[#f4c84a]" />
          </div>
          <div className="text-2xl font-black font-mono text-white">{userOrders.length}</div>
        </Link>

        <Link href="/account/orders" className="bg-[#0d0d0d] border border-[#242424] p-4 rounded-2xl hover:border-[#f4c84a]/50 transition-colors group">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Pending Orders</span>
            <Clock className="w-4 h-4 text-[#f4c84a]" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-400">{pendingOrdersCount}</div>
        </Link>

        <Link href="/account/wishlist" className="bg-[#0d0d0d] border border-[#242424] p-4 rounded-2xl hover:border-[#f4c84a]/50 transition-colors group">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Wishlist Items</span>
            <Heart className="w-4 h-4 text-[#f4c84a]" />
          </div>
          <div className="text-2xl font-black font-mono text-white">{wishlist.length}</div>
        </Link>

        <Link href="/account/coupons" className="bg-[#0d0d0d] border border-[#242424] p-4 rounded-2xl hover:border-[#f4c84a]/50 transition-colors group">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Coupons</span>
            <Ticket className="w-4 h-4 text-[#f4c84a]" />
          </div>
          <div className="text-2xl font-black font-mono text-[#f4c84a]">{availableCouponsCount}</div>
        </Link>

      </div>

      {/* Recent Orders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold font-serif uppercase tracking-wider text-white">
            RECENT ORDERS
          </h2>
          <Link href="/account/orders" className="text-xs font-bold text-[#f4c84a] hover:underline flex items-center gap-1">
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-[#0d0d0d] border border-[#242424] rounded-2xl overflow-hidden">
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400 space-y-3">
              <ShoppingBag className="w-8 h-8 text-gray-600 mx-auto" />
              <div>You haven&apos;t placed any orders yet.</div>
              <Link href="/shop" className="inline-block px-4 py-2 bg-[#f4c84a] text-black font-bold uppercase rounded-lg text-xs">
                Browse Shop
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#222]">
              {recentOrders.map((o) => (
                <div key={o.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs hover:bg-[#121212] transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-[#f4c84a] text-sm">{o.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        o.orderStatus === 'Delivered' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {o.orderStatus}
                      </span>
                    </div>

                    <div className="text-white font-medium text-xs truncate max-w-md">
                      {o.items.map(i => i.name).join(', ')}
                    </div>

                    <div className="text-[11px] text-gray-400 font-mono">
                      Date: {o.date}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <span className="font-mono font-extrabold text-white text-base">₹{o.totalAmount}</span>
                    <Link
                      href={`/account/orders/${o.id.replace('#', '')}`}
                      className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#f4c84a] hover:text-black text-gray-200 border border-[#333] rounded-lg font-bold transition-all text-xs flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Order</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
