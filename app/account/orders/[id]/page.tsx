'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, MapPin, CreditCard, ShoppingBag, Truck, CheckCircle2, Clock } from 'lucide-react';
import { useStore } from '../../../../context/StoreContext';
import { orderService } from '../../../../lib/services/orderService';
import { AdminOrder } from '../../../../lib/types/admin';

export default function CustomerOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { currentUser } = useStore();
  const [order, setOrder] = useState<AdminOrder | null>(null);

  useEffect(() => {
    let isMounted = true;
    orderService.getOrderByIdAsync(id).then((found) => {
      if (isMounted && found) {
        setOrder(found);
      }
    }).catch(() => {
      if (isMounted) {
        setOrder(orderService.getOrderById(id) || null);
      }
    });
    return () => { isMounted = false; };
  }, [id]);

  if (!order) {
    return (
      <div className="bg-[#0d0d0d] border border-[#242424] rounded-2xl p-12 text-center text-xs text-gray-400 space-y-4 font-sans">
        <div>Order #{id} not found in account history.</div>
        <Link href="/account/orders" className="text-[#f4c84a] font-bold hover:underline">
          ← Back to My Orders
        </Link>
      </div>
    );
  }

  const steps = [
    { status: 'Pending', label: 'Order Placed' },
    { status: 'Confirmed', label: 'Confirmed' },
    { status: 'Processing', label: 'Processing' },
    { status: 'Packed', label: 'Packed' },
    { status: 'Shipped', label: 'Shipped' },
    { status: 'Out for Delivery', label: 'Out for Delivery' },
    { status: 'Delivered', label: 'Delivered' }
  ];

  const currentIdx = steps.findIndex(s => s.status === order.orderStatus);

  return (
    <div className="space-y-8 font-sans">
      
      {/* Header */}
      <div className="bg-[#0d0d0d] border border-[#242424] p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/account/orders" className="p-2 bg-black border border-[#242424] text-gray-300 hover:text-white rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black font-mono text-[#f4c84a]">{order.id}</h1>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-[#f4c84a]/10 text-[#f4c84a] border border-[#f4c84a]/30">
                {order.orderStatus}
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono">Placed on {order.date}</p>
          </div>
        </div>
      </div>

      {/* Visual Order Lifecycle Stepper */}
      <div className="bg-[#0d0d0d] border border-[#242424] p-6 rounded-2xl space-y-4">
        <h2 className="text-xs font-bold font-serif uppercase tracking-wider text-[#f4c84a] border-b border-[#222] pb-3">
          ORDER STATUS TRACKING
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {steps.map((s, idx) => {
            const isDone = idx <= currentIdx;
            const isCurrent = idx === currentIdx;
            return (
              <div
                key={s.status}
                className={`p-3 rounded-xl border text-center space-y-1 transition-all ${
                  isCurrent 
                    ? 'bg-[#f4c84a]/10 border-[#f4c84a] text-[#f4c84a]' 
                    : (isDone ? 'bg-[#141414] border-gray-700 text-gray-200' : 'bg-black border-[#222] text-gray-600')
                }`}
              >
                <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center font-bold text-[10px] ${
                  isCurrent ? 'bg-[#f4c84a] text-black' : (isDone ? 'bg-emerald-500 text-white' : 'bg-[#222] text-gray-500')
                }`}>
                  {idx + 1}
                </div>
                <div className="font-bold text-[11px] uppercase">{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 7 Cols: Products & Price Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Products List Card */}
          <div className="bg-[#0d0d0d] border border-[#242424] p-6 rounded-2xl space-y-4">
            <h2 className="text-xs font-bold font-serif uppercase tracking-wider text-[#f4c84a] border-b border-[#222] pb-3">
              PRODUCTS
            </h2>

            <div className="divide-y divide-[#222]">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-xl bg-black border border-[#222] overflow-hidden relative shrink-0">
                      {item.image && (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="font-bold text-white text-sm">{item.name}</div>
                      <div className="text-gray-400 font-mono text-[11px]">
                        Size: <strong className="text-white">{item.size}</strong> • Qty: <strong className="text-white">{item.quantity}</strong>
                      </div>
                      {item.customName && (
                        <div className="text-[11px] text-[#f4c84a] font-mono">
                          Print: {item.customName} #{item.customNumber}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right font-mono font-bold text-white text-sm">
                    ₹{item.unitPrice * item.quantity}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-[#0d0d0d] border border-[#242424] p-6 rounded-2xl space-y-3 text-xs font-mono">
            <h2 className="text-xs font-bold font-serif uppercase tracking-wider text-[#f4c84a] border-b border-[#222] pb-3 font-sans">
              PRICE DETAILS
            </h2>

            <div className="space-y-2">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>

              <div className="flex justify-between text-gray-400">
                <span>Shipping</span>
                <span>{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount</span>
                  <span>-₹{order.discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between text-white font-extrabold text-base pt-3 border-t border-[#222]">
                <span>Total</span>
                <span className="text-[#f4c84a]">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right 5 Cols: Payment & Address */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Payment Card */}
          <div className="bg-[#0d0d0d] border border-[#242424] p-6 rounded-2xl space-y-3 text-xs">
            <div className="flex items-center gap-2 border-b border-[#222] pb-3 text-[#f4c84a]">
              <CreditCard className="w-4 h-4" />
              <h2 className="font-bold font-serif uppercase tracking-wider text-white">PAYMENT</h2>
            </div>

            <div className="space-y-2 font-mono text-zinc-300">
              <div className="flex justify-between">
                <span className="text-gray-400">Payment Method:</span>
                <span className="font-bold text-white">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payment Status:</span>
                <span className="font-bold text-emerald-400 uppercase">{order.paymentStatus}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address Card */}
          <div className="bg-[#0d0d0d] border border-[#242424] p-6 rounded-2xl space-y-3 text-xs">
            <div className="flex items-center gap-2 border-b border-[#222] pb-3 text-[#f4c84a]">
              <MapPin className="w-4 h-4" />
              <h2 className="font-bold font-serif uppercase tracking-wider text-white">SHIPPING ADDRESS</h2>
            </div>

            <div className="space-y-1 text-gray-300 leading-relaxed">
              <div className="font-bold text-white">{order.shippingAddress.name}</div>
              <div>{order.shippingAddress.addressLine}</div>
              <div>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</div>
              <div className="font-mono text-gray-400 pt-1">{order.shippingAddress.phone}</div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
