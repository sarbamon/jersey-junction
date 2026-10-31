'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Calendar,
  Package,
} from 'lucide-react';
import { useStore } from '../../../../context/StoreContext';
import { orderService } from '../../../../lib/services/orderService';
import { AdminOrder } from '../../../../lib/types/admin';
import { icarryService, TrackingResult } from '../../../../lib/services/icarryService';
import { OrderProductImage } from '../../../../components/OrderProductImage';

export default function CustomerOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { currentUser } = useStore();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [trackingData, setTrackingData] = useState<TrackingResult | null>(null);
  const [isLoadingTracking, setIsLoadingTracking] = useState<boolean>(false);
  const [copiedAwb, setCopiedAwb] = useState<boolean>(false);

  const fetchTracking = async (orderId: string) => {
    setIsLoadingTracking(true);
    try {
      const data = await icarryService.trackShipment(orderId);
      if (data) setTrackingData(data);
    } catch (err) {
      console.warn('Live tracking error:', err);
    } finally {
      setIsLoadingTracking(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    orderService.getOrderByIdAsync(id).then((found) => {
      if (isMounted && found) {
        setOrder(found);
        if (found.trackingNumber || found.shippingStatus === 'Booked') {
          fetchTracking(found.id);
        }
      }
    }).catch(() => {
      if (isMounted) {
        const local = orderService.getOrderById(id) || null;
        setOrder(local);
        if (local && (local.trackingNumber || local.shippingStatus === 'Booked')) {
          fetchTracking(local.id);
        }
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
  const awb = trackingData?.trackingNumber || order.trackingNumber || '';
  const courier = trackingData?.courier || order.courierName || 'Assigned Courier';
  const liveStatus = trackingData?.shippingStatus || order.shippingStatus || 'Booked';
  const externalTrackingUrl =
    trackingData?.externalTrackingUrl ||
    (order.trackingNumber
      ? `https://www.icarry.in/track-shipment&awb=${encodeURIComponent(order.trackingNumber)}`
      : '');

  const copyAwb = () => {
    if (awb) {
      navigator.clipboard.writeText(awb);
      setCopiedAwb(true);
      setTimeout(() => setCopiedAwb(false), 2000);
    }
  };

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

      {/* LIVE COURIER TRACKING CARD (For dispatched / booked orders) */}
      {(order.trackingNumber || order.shippingStatus === 'Booked') && (
        <div className="bg-gradient-to-br from-zinc-900 to-black border border-amber-500/30 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-black uppercase text-white tracking-wide">
                    Live Shipment Tracking
                  </h2>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-mono">
                  Partner: <strong className="text-amber-400">{courier}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => fetchTracking(order.id)}
                disabled={isLoadingTracking}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                title="Refresh tracking status"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTracking ? 'animate-spin text-amber-400' : ''}`} />
                <span>Refresh</span>
              </button>

              {externalTrackingUrl && (
                <a
                  href={externalTrackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-extrabold uppercase flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <span>Carrier Tracking Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-black/60 border border-zinc-800 space-y-1">
              <span className="text-zinc-500 text-[10px] uppercase font-bold block">AWB Tracking Number</span>
              <div className="flex items-center justify-between">
                <strong className="text-white text-sm tracking-wider">{awb}</strong>
                <button
                  onClick={copyAwb}
                  className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded transition-colors"
                  title="Copy Tracking Number"
                >
                  {copiedAwb ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/60 border border-zinc-800 space-y-1">
              <span className="text-zinc-500 text-[10px] uppercase font-bold block">Current Live Status</span>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                <strong className="text-emerald-400 text-xs uppercase">{liveStatus}</strong>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/60 border border-zinc-800 space-y-1">
              <span className="text-zinc-500 text-[10px] uppercase font-bold block">Estimated Delivery</span>
              <strong className="text-zinc-200 text-xs">
                {trackingData?.edd || '2 - 4 Business Days'}
              </strong>
            </div>
          </div>

          {/* Live Courier Scans Log */}
          {trackingData?.history && trackingData.history.length > 0 && (
            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Carrier Scan Activity Log
              </span>
              <div className="p-4 rounded-xl bg-black/50 border border-zinc-800/80 space-y-3">
                <div className="relative pl-5 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
                  {trackingData.history.map((step, idx) => (
                    <div key={idx} className="relative">
                      <div
                        className={`absolute -left-5 top-1 h-3.5 w-3.5 rounded-full border-2 ${
                          idx === 0
                            ? 'bg-amber-400 border-amber-300 ring-2 ring-amber-400/20'
                            : 'bg-zinc-900 border-zinc-600'
                        }`}
                      />
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <strong className="text-white font-medium">{step.status}</strong>
                        <span className="text-zinc-500 text-[10px] font-mono">{step.timestamp}</span>
                      </div>
                      {step.location && (
                        <span className="text-zinc-400 text-[10px] font-mono block">{step.location}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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
                    <div className="h-14 w-14 rounded-xl bg-black border border-[#222] overflow-hidden relative shrink-0 flex items-center justify-center">
                      <OrderProductImage
                        src={item.image}
                        name={item.name}
                        productId={item.productId}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
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
