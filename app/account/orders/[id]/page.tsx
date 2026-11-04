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

  const getTrackingStage = (status: string) => {
    const s = String(status || '').toLowerCase().trim();
    if (s.includes('cancel') || s.includes('fail') || s === 'returned') {
      return {
        key: 'CANCELLED',
        label: 'Order Cancelled',
        step: -1,
        message: 'This order has been cancelled by store administration.'
      };
    }
    if (s === 'delivered') {
      return {
        key: 'DELIVERED',
        label: 'Delivered',
        step: 5,
        message: 'Your jersey has been successfully delivered. Enjoy the match!'
      };
    }
    if (s.includes('out for delivery')) {
      return {
        key: 'OUT_FOR_DELIVERY',
        label: 'Out for Delivery',
        step: 4,
        message: 'Your package is out for delivery with the local courier today.'
      };
    }
    if (s.includes('ship') || s.includes('transit')) {
      return {
        key: 'IN_TRANSIT',
        label: 'In Transit',
        step: 3,
        message: 'Your package is in transit with the courier.'
      };
    }
    if (s.includes('pack') || s.includes('process')) {
      return {
        key: 'ORDER_PROCESSED',
        label: 'Order Processed',
        step: 2,
        message: 'Your order has been processed and packed for dispatch.'
      };
    }
    return {
      key: 'ORDER_RECEIVED',
      label: 'Order Received',
      step: 1,
      message: 'Your order has been received and confirmed.'
    };
  };

  const TRACKING_STEPS = [
    { step: 1, label: 'Order Received' },
    { step: 2, label: 'Order Processed' },
    { step: 3, label: 'In Transit' },
    { step: 4, label: 'Out for Delivery' },
    { step: 5, label: 'Delivered' },
  ];

  const currentStage = getTrackingStage(order.orderStatus);

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
      {currentStage.key === 'CANCELLED' ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-red-400 uppercase tracking-wide">
              {currentStage.label}
            </h2>
            <p className="text-xs text-gray-300">
              {currentStage.message}
            </p>
          </div>
        </div>
      ) : currentStage.key === 'DELIVERED' ? (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wide">
              {currentStage.label}
            </h2>
            <p className="text-xs text-gray-300">
              {currentStage.message}
            </p>
          </div>
        </div>
      ) : currentStage.key === 'OUT_FOR_DELIVERY' || currentStage.key === 'IN_TRANSIT' ? (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
          <Truck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wide">
              {currentStage.label}
            </h2>
            <p className="text-xs text-gray-300">
              {currentStage.message}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-[#f4c84a]/10 border border-[#f4c84a]/30 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
          <Package className="w-5 h-5 text-[#f4c84a] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-[#f4c84a] uppercase tracking-wide">
              {currentStage.label}
            </h2>
            <p className="text-xs text-gray-300">
              {currentStage.message}
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
      <div className="bg-[#0d0d0d] border border-[#242424] rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white uppercase tracking-wide">
            {currentStage.label}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
            currentStage.key === 'CANCELLED'
              ? 'bg-red-500/10 text-red-400 border-red-500/30'
              : currentStage.key === 'DELIVERED'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-[#f4c84a]/10 text-[#f4c84a] border border-[#f4c84a]/30'
          }`}>
            {currentStage.label}
          </span>
        </div>

        {/* 5-Step Visual Progress Stepper (Order Received -> Order Processed -> In Transit -> Out for Delivery -> Delivered) */}
        {currentStage.step > 0 && (
          <div className="pt-2 pb-1">
            <div className="relative">
              {/* Background Line */}
              <div className="absolute top-2.5 left-4 right-4 h-0.5 bg-[#222] -translate-y-1/2 z-0" />
              {/* Active Gold Line */}
              <div 
                className="absolute top-2.5 left-4 h-0.5 bg-[#f4c84a] -translate-y-1/2 z-0 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, ((currentStage.step - 1) / 4) * 100))}%` }}
              />

              <div className="relative z-10 grid grid-cols-5 text-center">
                {TRACKING_STEPS.map((s) => {
                  const isDone = s.step <= currentStage.step;
                  const isCurrent = s.step === currentStage.step;
                  return (
                    <div key={s.step} className="flex flex-col items-center">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                        isCurrent
                          ? 'bg-[#f4c84a] text-black ring-4 ring-[#f4c84a]/20 scale-110 font-black'
                          : isDone
                          ? 'bg-[#f4c84a] text-black font-bold'
                          : 'bg-[#1a1a1a] border border-[#333] text-gray-500'
                      }`}>
                        {s.step}
                      </div>
                      <span className={`text-[10px] sm:text-[11px] mt-2 font-medium leading-tight ${
                        isCurrent
                          ? 'text-[#f4c84a] font-bold'
                          : isDone
                          ? 'text-white'
                          : 'text-gray-500'
                      }`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="p-3.5 rounded-xl border border-[#242424] bg-black/40 text-xs text-gray-400">
          {currentStage.message}
        </div>
      </div>

      {/* LIVE COURIER TRACKING CARD (For dispatched / booked orders) */}
      {(order.trackingNumber || order.shippingStatus === 'Booked') && (
        <div className="bg-[#0d0d0d] border border-[#242424] rounded-2xl p-5 sm:p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#242424]">
            <h3 className="text-lg font-bold font-serif text-white">
              Live Tracking
            </h3>

            <button
              type="button"
              onClick={() => fetchTracking(order.id)}
              disabled={isLoadingTracking}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh tracking status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTracking ? 'animate-spin text-amber-400' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Status Box */}
          <div className="p-4 rounded-xl border border-[#242424] bg-black/50 space-y-1 text-xs">
            <div className="text-sm font-bold text-white">
              Status:{' '}
              <span className="text-[#3b82f6] font-bold">
                {liveStatus}
              </span>
            </div>
            <div className="text-gray-400">
              Courier:{' '}
              <span className="uppercase text-gray-300 font-mono">
                {courier}
              </span>
            </div>
            {awb && (
              <div className="text-[11px] text-gray-500 font-mono pt-1 flex items-center justify-between">
                <span>AWB: <strong className="text-gray-300">{awb}</strong></span>
                <button
                  onClick={copyAwb}
                  className="hover:text-white transition-colors cursor-pointer"
                  title="Copy Tracking Number"
                >
                  {copiedAwb ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Scans Activity Log */}
          {trackingData?.history && trackingData.history.length > 0 ? (
            <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#242424]">
              {trackingData.history.map((step, idx) => (
                <div key={idx} className="relative">
                  <div
                    className={`absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full ${
                      idx === 0
                        ? 'bg-[#3b82f6] ring-4 ring-[#3b82f6]/20'
                        : 'bg-white'
                    }`}
                  />
                  <div className="space-y-0.5 text-xs">
                    <div className="text-gray-400 font-mono text-[11px]">
                      {step.timestamp}
                    </div>
                    <div className="font-bold text-white text-xs sm:text-sm">
                      {step.location || step.details || 'In Transit'}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {formatShippingStatusText(step.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-xs text-gray-400">
              {isLoadingTracking ? 'Fetching live courier tracking scans...' : 'Shipment booked with courier. Live scans will appear once picked up.'}
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
