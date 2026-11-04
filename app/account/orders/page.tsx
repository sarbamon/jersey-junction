'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Search, 
  ChevronRight, 
  ShoppingBag,
  Package
} from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { orderService } from '../../../lib/services/orderService';
import { AdminOrder } from '../../../lib/types/admin';
import { OrderProductImage } from '../../../components/OrderProductImage';

export default function MyOrdersPage() {
  const { currentUser } = useStore();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'delivered' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    if (currentUser && currentUser.email) {
      orderService.getUserOrdersAsync(currentUser.email, currentUser.phone).then((userOrders) => {
        if (isMounted) {
          setOrders(userOrders || []);
        }
      }).catch(() => {
        if (isMounted) setOrders([]);
      });
    } else {
      setOrders([]);
    }
    return () => { isMounted = false; };
  }, [currentUser]);

  if (!currentUser) return null;

  const filterTabs: { label: string; value: 'all' | 'active' | 'delivered' | 'cancelled' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  const filteredOrders = orders.filter((o) => {
    const status = (o.orderStatus || '').toLowerCase().trim();
    if (filter === 'active') {
      if (status === 'delivered' || status.includes('cancel') || status.includes('fail') || status === 'returned') {
        return false;
      }
    } else if (filter === 'delivered') {
      if (status !== 'delivered') return false;
    } else if (filter === 'cancelled') {
      if (!status.includes('cancel') && !status.includes('fail') && status !== 'returned') {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = (o.id || '').toLowerCase().includes(q);
      const matchItem = (o.items || []).some(i => (i.name || '').toLowerCase().includes(q));
      if (!matchId && !matchItem) return false;
    }

    return true;
  });

  const getStatusBadge = (status: string) => {
    const s = String(status || '').toLowerCase().trim();
    if (s.includes('cancel') || s.includes('fail') || s === 'returned') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-500/10 text-red-400 border border-red-500/30">
          Cancelled
        </span>
      );
    }
    if (s === 'delivered') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          Delivered
        </span>
      );
    }
    if (s.includes('out for delivery')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
          Out for Delivery
        </span>
      );
    }
    if (s.includes('ship') || s.includes('transit')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
          In Transit
        </span>
      );
    }
    if (s.includes('pack') || s.includes('process')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#f4c84a]/10 text-[#f4c84a] border border-[#f4c84a]/30">
          Order Processed
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#f4c84a]/10 text-[#f4c84a] border border-[#f4c84a]/30">
        Order Received
      </span>
    );
  };

  return (
    <div className="space-y-6 font-sans max-w-4xl mx-auto">
      
      {/* Top Header: Back button + My Orders */}
      <div className="flex items-center gap-3 pb-2 border-b border-[#242424]">
        <Link 
          href="/account"
          className="p-2 rounded-xl bg-[#0d0d0d] border border-[#242424] text-gray-300 hover:text-white hover:border-[#f4c84a]/50 transition-colors"
          title="Back to My Account"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl sm:text-2xl font-black font-serif uppercase tracking-tight text-white">
          My Orders
        </h1>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search your order or product here..."
          className="w-full pl-11 pr-4 py-3 bg-[#0d0d0d] border border-[#242424] focus:border-[#f4c84a] rounded-2xl text-xs sm:text-sm text-white placeholder-gray-500 outline-none transition-colors"
        />
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {filterTabs.map((tab) => {
          const isActive = filter === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#f4c84a] text-black shadow-md font-extrabold'
                  : 'bg-[#0d0d0d] border border-[#242424] text-gray-400 hover:text-white hover:border-gray-700'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-[#0d0d0d] border border-[#242424] rounded-2xl p-12 text-center text-xs text-gray-400 space-y-4">
          <ShoppingBag className="w-10 h-10 text-gray-600 mx-auto" />
          <div className="font-medium">No orders found matching your criteria.</div>
          <Link 
            href="/shop" 
            className="inline-block px-5 py-2.5 bg-[#f4c84a] hover:bg-[#e0b438] text-black font-extrabold uppercase rounded-xl text-xs shadow-md transition-all"
          >
            Explore Shop
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((o) => {
            const firstItem = o.items && o.items.length > 0 ? o.items[0] : null;
            const extraCount = (o.items?.length || 0) - 1;

            return (
              <Link
                key={o.id}
                href={`/account/orders/${o.id.replace('#', '')}`}
                className="bg-[#0d0d0d] border border-[#242424] hover:border-[#f4c84a]/60 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 transition-all group block shadow-sm"
              >
                <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
                  {/* Thumbnail */}
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl bg-black border border-[#222] overflow-hidden shrink-0 flex items-center justify-center">
                    {firstItem ? (
                      <OrderProductImage
                        src={firstItem.image}
                        name={firstItem.name}
                        productId={firstItem.productId}
                        alt={firstItem.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-gray-600" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <h2 className="font-bold text-white text-xs sm:text-sm uppercase truncate">
                      {firstItem ? firstItem.name : `Order ${o.id}`}
                    </h2>
                    
                    {firstItem && (
                      <p className="text-[11px] sm:text-xs text-gray-400 font-mono">
                        Size: <strong className="text-white">{firstItem.size}</strong> • Qty: <strong className="text-white">{firstItem.quantity}</strong>
                        {extraCount > 0 && (
                          <span className="text-[#f4c84a] font-bold ml-1.5">
                            (+{extraCount} more {extraCount === 1 ? 'item' : 'items'})
                          </span>
                        )}
                      </p>
                    )}

                    <p className="text-[11px] text-gray-500 font-mono">
                      #{o.id.replace('#', '')}
                    </p>

                    <div className="pt-1">
                      {getStatusBadge(o.orderStatus)}
                    </div>
                  </div>
                </div>

                {/* Right price and chevron */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-gray-500 font-mono">Total</div>
                    <div className="font-mono font-bold text-white text-sm">₹{o.totalAmount}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-[#f4c84a] group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

    </div>
  );
}
