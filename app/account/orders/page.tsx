'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Eye, Clock, CheckCircle2, Truck } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { orderService } from '../../../lib/services/orderService';
import { AdminOrder, OrderStatus } from '../../../lib/types/admin';
import { LiveTrackingModal } from '../../../components/admin/LiveTrackingModal';

export default function MyOrdersPage() {
  const { currentUser } = useStore();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<AdminOrder | null>(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    if (currentUser && currentUser.email) {
      orderService.getUserOrdersAsync(currentUser.email).then((userOrders) => {
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

  const filterTabs = [
    { label: 'All', value: 'all' },
    { label: 'Processing', value: 'processing' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  const filteredOrders = orders.filter(o => {
    if (filter === 'all') return true;
    return o.orderStatus.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Title Header */}
      <div className="border-b border-[#242424] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-serif uppercase tracking-tight text-white">
            MY ORDERS ({filteredOrders.length})
          </h1>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#0d0d0d] p-1 rounded-xl border border-[#242424] text-xs font-bold">
          {filterTabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filter === tab.value 
                  ? 'bg-[#f4c84a] text-black font-extrabold' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-[#0d0d0d] border border-[#242424] rounded-2xl p-12 text-center text-xs text-gray-400 space-y-4">
          <ShoppingBag className="w-10 h-10 text-gray-600 mx-auto" />
          <div className="font-medium">No orders found under selected status &quot;{filter}&quot;.</div>
          <Link href="/shop" className="inline-block px-4 py-2 bg-[#f4c84a] text-black font-bold uppercase rounded-lg text-xs">
            Explore Shop
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((o) => (
            <div key={o.id} className="bg-[#0d0d0d] border border-[#242424] rounded-2xl p-5 sm:p-6 space-y-4">
              
              {/* Top Order Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#222] pb-4 gap-2 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-base text-[#f4c84a]">{o.id}</span>
                    <span className="text-gray-400 font-mono">({o.date})</span>
                  </div>
                  <div className="text-gray-400 text-[11px]">Payment: <strong className="text-white font-mono">{o.paymentMethod} ({o.paymentStatus})</strong></div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                    o.orderStatus === 'Delivered' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                      : (o.orderStatus === 'Cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30')
                  }`}>
                    {o.orderStatus}
                  </span>
                </div>
              </div>

              {/* Order Purchased Items */}
              <div className="space-y-3">
                {o.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-black border border-[#222] overflow-hidden relative shrink-0">
                        {item.image && (
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{item.name}</div>
                        <div className="text-gray-400 text-[11px] font-mono">
                          Size: <strong className="text-white">{item.size}</strong> • Qty: <strong className="text-white">{item.quantity}</strong>
                        </div>
                        {(item.customName || item.customNumber) && (
                          <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-400/15 border border-amber-400/30 text-[10px] font-mono text-amber-300 font-bold">
                            <span>★ CUSTOM PRINT:</span>
                            <span className="uppercase text-white">{item.customName || 'CUSTOM'}</span>
                            <span className="text-amber-400">#{item.customNumber || '00'}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right font-mono font-bold text-white">
                      ₹{item.unitPrice * item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Row */}
              <div className="pt-4 border-t border-[#222] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-gray-500 uppercase block">Total Amount</span>
                  <span className="font-mono font-extrabold text-lg text-[#f4c84a]">₹{o.totalAmount}</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  {(o.trackingNumber || o.shippingStatus === 'Booked') && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOrderForTracking(o);
                        setIsTrackingModalOpen(true);
                      }}
                      className="px-4 py-2.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-bold uppercase rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-105"
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <Truck className="w-4 h-4" />
                      <span>Track Shipment</span>
                    </button>
                  )}

                  <Link
                    href={`/account/orders/${o.id.replace('#', '')}`}
                    className="px-5 py-2.5 bg-[#f4c84a] hover:bg-[#e0b438] text-black font-extrabold uppercase rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Order Details</span>
                  </Link>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Live Tracking Modal for User */}
      <LiveTrackingModal
        order={selectedOrderForTracking}
        isOpen={isTrackingModalOpen}
        onClose={() => {
          setIsTrackingModalOpen(false);
          setSelectedOrderForTracking(null);
        }}
      />

    </div>
  );
}
