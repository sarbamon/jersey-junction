'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Truck,
  Copy,
  Check,
  RefreshCw,
  Clock,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { useStore } from '../../../../context/StoreContext';
import { orderService } from '../../../../lib/services/orderService';
import { AdminOrder } from '../../../../lib/types/admin';
import { icarryService, TrackingResult } from '../../../../lib/services/icarryService';
import { OrderProductImage } from '../../../../components/OrderProductImage';

const formatShippingStatusText = (status?: string): string => {
  if (!status) return 'Shipping getting ready';
  if (/label\s*generated|manifest\s*generated|softdata\s*upload|shipment\s*created/i.test(status)) {
    return 'Shipping getting ready';
  }
  return status;
};

export default function CustomerOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { currentUser } = useStore();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [trackingData, setTrackingData] = useState<TrackingResult | null>(null);
  const [isLoadingTracking, setIsLoadingTracking] = useState<boolean>(false);
  const [copiedAwb, setCopiedAwb] = useState<boolean>(false);
  const [copiedOrderId, setCopiedOrderId] = useState<boolean>(false);

  // Accordion toggles
  const [isDeliveryOpen, setIsDeliveryOpen] = useState<boolean>(false);
  const [isPriceOpen, setIsPriceOpen] = useState<boolean>(false);

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
      <div className="bg-[#0d0d0d] border border-[#242424] rounded-2xl p-12 text-center text-xs text-gray-400 space-y-4 font-sans max-w-2xl mx-auto">
        <div>Order #{id} not found in account history.</div>
        <Link href="/account/orders" className="text-[#f4c84a] font-bold hover:underline">
          ← Back to My Orders
        </Link>
      </div>
    );
  }

  const getTrackingStatus = (status: string) => {
    const s = String(status || '').toLowerCase().trim();
    if (s.includes('cancel')) return 'CANCELLED';
    if (s.includes('out for delivery') || s.includes('ship') || s.includes('transit')) return 'IN TRANSIT';
    if (s.includes('deliver')) return 'DELIVERED';
    return 'PROCESSING';
  };

  const trackingStatus = getTrackingStatus(order.orderStatus);

  const awb = trackingData?.trackingNumber || order.trackingNumber || '';
  const courier = trackingData?.courier || order.courierName || 'Assigned Courier';
  const liveStatus = formatShippingStatusText(trackingData?.shippingStatus || order.shippingStatus || 'Booked');

  const copyAwb = () => {
    if (awb) {
      navigator.clipboard.writeText(awb);
      setCopiedAwb(true);
      setTimeout(() => setCopiedAwb(false), 2000);
    }
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.id.replace('#', ''));
    setCopiedOrderId(true);
    setTimeout(() => setCopiedOrderId(false), 2000);
  };

  return (
    <div className="space-y-6 font-sans max-w-2xl mx-auto">
      
      {/* Top Header: Back Arrow + Order Details */}
      <div className="flex items-center gap-3 pb-2 border-b border-[#242424]">
        <Link 
          href="/account/orders" 
          className="p-2 rounded-xl bg-[#0d0d0d] border border-[#242424] text-gray-300 hover:text-white hover:border-[#f4c84a]/50 transition-colors"
          title="Back to My Orders"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl sm:text-2xl font-black font-serif uppercase tracking-tight text-white">
          Order Details
        </h1>
      </div>

      {/* Top Status Alert Banner */}
      {trackingStatus === 'CANCELLED' ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-red-400 uppercase tracking-wide">
              Order Cancelled
            </h2>
            <p className="text-xs text-gray-300">
              This order has been cancelled.
            </p>
          </div>
        </div>
      ) : trackingStatus === 'DELIVERED' ? (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wide">
              Order Delivered
            </h2>
            <p className="text-xs text-gray-300">
              Your jersey has been successfully delivered. Enjoy the match!
            </p>
          </div>
        </div>
      ) : trackingStatus === 'IN TRANSIT' ? (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
          <Truck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wide">
              Order In Transit
            </h2>
            <p className="text-xs text-gray-300">
              Your package is dispatched and on its way to your destination.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-[#f4c84a]/10 border border-[#f4c84a]/30 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
          <Package className="w-5 h-5 text-[#f4c84a] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-[#f4c84a] uppercase tracking-wide">
              Order Processing
            </h2>
            <p className="text-xs text-gray-300">
              Your order is confirmed and our kit team is currently preparing your jersey.
            </p>
          </div>
        </div>
      )}

      {/* Product Items Card */}
      <div className="bg-[#0d0d0d] border border-[#242424] rounded-2xl p-4 sm:p-5 space-y-4">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl bg-black border border-[#222] overflow-hidden shrink-0 flex items-center justify-center">
                <OrderProductImage
                  src={item.image}
                  name={item.name}
                  productId={item.productId}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1 min-w-0">
                <h3 className="font-bold text-white text-xs sm:text-sm uppercase truncate">
                  {item.name}
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-400 font-mono">
                  Size: <strong className="text-white">{item.size}</strong> • Qty: <strong className="text-white">{item.quantity}</strong>
                </p>
                {(item.customName || item.customNumber) && (
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#f4c84a]/10 border border-[#f4c84a]/30 text-[10px] font-mono text-[#f4c84a] font-bold">
                    <span>★ CUSTOM:</span>
                    <span className="text-white uppercase">{item.customName || 'NAME'}</span>
                    <span>#{item.customNumber || '00'}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="text-right font-mono font-bold text-white text-sm sm:text-base shrink-0">
              ₹{item.unitPrice * item.quantity}
            </div>
          </div>
        ))}
      </div>

      {/* Order ID Bar with Copy */}
      <div className="bg-[#0d0d0d] border border-[#242424] rounded-2xl px-5 py-3.5 flex items-center justify-between text-xs font-mono">
        <span className="text-gray-400">
          Order <strong className="text-white font-bold ml-1">#{order.id.replace('#', '')}</strong>
        </span>
        <button
          onClick={copyOrderId}
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Copy Order ID"
        >
          {copiedOrderId ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-bold text-[11px]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span className="text-[11px]">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Status Box */}
      <div className="bg-[#0d0d0d] border border-[#242424] rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white uppercase tracking-wide">
            {trackingStatus === 'CANCELLED'
              ? 'Cancelled'
              : trackingStatus === 'DELIVERED'
              ? 'Delivered'
              : trackingStatus === 'IN TRANSIT'
              ? 'In Transit'
              : 'Processing'}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
            trackingStatus === 'CANCELLED'
              ? 'bg-red-500/10 text-red-400 border-red-500/30'
              : trackingStatus === 'DELIVERED'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : trackingStatus === 'IN TRANSIT'
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              : 'bg-[#f4c84a]/10 text-[#f4c84a] border border-[#f4c84a]/30'
          }`}>
            {trackingStatus}
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-[#242424] bg-black/40 text-xs text-gray-400">
          {trackingStatus === 'CANCELLED'
            ? 'Order status: Cancelled by store administration.'
            : trackingStatus === 'DELIVERED'
            ? 'Order status: Completed and delivered.'
            : trackingStatus === 'IN TRANSIT'
            ? 'Order status: Dispatched via courier.'
            : 'Order status: Being processed at warehouse.'}
        </div>
      </div>

      {/* LIVE COURIER TRACKING CARD (For dispatched / booked orders) */}
      {(order.trackingNumber || order.shippingStatus === 'Booked') && (
        <div className="bg-[#0d0d0d] border border-amber-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#242424] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold uppercase text-white tracking-wide">
                  Live Courier Tracking
                </h3>
                <p className="text-[11px] text-zinc-400 font-mono">
                  Partner: <strong className="text-amber-400">{courier}</strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => fetchTracking(order.id)}
              disabled={isLoadingTracking}
              className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh tracking status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTracking ? 'animate-spin text-amber-400' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-black/60 border border-zinc-800 space-y-1">
              <span className="text-zinc-500 text-[10px] uppercase font-bold block">AWB Tracking Number</span>
              <div className="flex items-center justify-between">
                <strong className="text-white text-xs tracking-wider">{awb}</strong>
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
          </div>

          {/* Scans Activity Log */}
          {trackingData?.history && trackingData.history.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[#222]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Carrier Scan Activity Log
              </span>
              <div className="p-3 rounded-xl bg-black/50 border border-zinc-800 space-y-3">
                <div className="relative pl-5 space-y-3 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
                  {trackingData.history.map((step, idx) => (
                    <div key={idx} className="relative text-xs">
                      <div
                        className={`absolute -left-5 top-1 h-3 w-3 rounded-full border-2 ${
                          idx === 0
                            ? 'bg-amber-400 border-amber-300 ring-2 ring-amber-400/20'
                            : 'bg-zinc-900 border-zinc-600'
                        }`}
                      />
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <strong className="text-white font-medium">{formatShippingStatusText(step.status)}</strong>
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

      {/* Accordion 1: Delivery details */}
      <div className="bg-[#0d0d0d] border border-[#242424] rounded-2xl overflow-hidden transition-all">
        <button
          onClick={() => setIsDeliveryOpen(!isDeliveryOpen)}
          className="w-full p-5 flex items-center justify-between text-left hover:bg-[#141414] transition-colors cursor-pointer"
        >
          <div className="space-y-0.5 min-w-0 pr-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">
              Delivery details
            </h3>
            <p className="text-xs text-gray-400 truncate">
              Delivering to <strong className="text-gray-200">{order.shippingAddress.name}</strong> at {order.shippingAddress.city || 'India'}
            </p>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 shrink-0 ${isDeliveryOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDeliveryOpen && (
          <div className="p-5 pt-0 border-t border-[#1f1f1f] mt-1 space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 uppercase font-mono block font-bold">Recipient Name</span>
                <p className="text-white font-medium">{order.shippingAddress.name}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 uppercase font-mono block font-bold">Phone Number</span>
                <p className="text-white font-mono">{order.shippingAddress.phone || 'N/A'}</p>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <span className="text-[10px] text-gray-500 uppercase font-mono block font-bold">Shipping Address</span>
                <p className="text-white leading-relaxed">
                  {order.shippingAddress.addressLine}
                  {order.shippingAddress.city && `, ${order.shippingAddress.city}`}
                  {order.shippingAddress.state && `, ${order.shippingAddress.state}`}
                  {order.shippingAddress.pincode && ` - ${order.shippingAddress.pincode}`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Accordion 2: Price details */}
      <div className="bg-[#0d0d0d] border border-[#242424] rounded-2xl overflow-hidden transition-all">
        <button
          onClick={() => setIsPriceOpen(!isPriceOpen)}
          className="w-full p-5 flex items-center justify-between text-left hover:bg-[#141414] transition-colors cursor-pointer"
        >
          <div className="space-y-0.5 min-w-0 pr-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">
              Price details
            </h3>
            <p className="text-xs text-gray-400 truncate">
              Paid <strong className="text-white font-mono">₹{order.totalAmount}</strong> by {order.paymentMethod}
            </p>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 shrink-0 ${isPriceOpen ? 'rotate-180' : ''}`} />
        </button>

        {isPriceOpen && (
          <div className="p-5 pt-0 border-t border-[#1f1f1f] mt-1 space-y-2.5 text-xs font-mono">
            <div className="pt-3 space-y-2">
              <div className="flex justify-between text-gray-400">
                <span>Jerseys Subtotal</span>
                <span className="text-white">
                  ₹{order.subtotal || order.items.reduce((acc, i) => acc + (i.unitPrice * i.quantity), 0)}
                </span>
              </div>

              {Boolean(order.discountAmount && order.discountAmount > 0) && (
                <div className="flex justify-between text-emerald-400">
                  <span>Coupon Discount</span>
                  <span>-₹{order.discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-400">
                <span>Shipping ({order.shippingMethod || 'Standard'})</span>
                <span className="text-white">₹{order.shippingFee || 0}</span>
              </div>

              <div className="border-t border-[#222] pt-2 flex justify-between font-bold text-sm">
                <span className="text-white">Total Amount</span>
                <span className="text-[#f4c84a]">₹{order.totalAmount}</span>
              </div>

              <div className="pt-1 flex justify-between text-[11px] text-gray-500">
                <span>Payment Method &amp; Status</span>
                <span className="text-gray-300 font-bold uppercase">{order.paymentMethod} • {order.paymentStatus}</span>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
