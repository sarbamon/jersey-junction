'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ShoppingBag, Truck, CreditCard, User, MapPin, CheckCircle2, Clock, Printer, ExternalLink } from 'lucide-react';
import { orderService } from '../../../../lib/services/orderService';
import { AdminOrder, OrderStatus, PaymentStatus } from '../../../../lib/types/admin';
import { StatusBadge } from '../../../../components/admin/StatusBadge';
import { OrderTimeline } from '../../../../components/admin/OrderTimeline';
import { Toast } from '../../../../components/admin/Toast';
import { ICarryBookingModal } from '../../../../components/admin/ICarryBookingModal';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [isICarryModalOpen, setIsICarryModalOpen] = useState(false);

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
      <div className="p-12 text-center text-zinc-400 font-mono text-xs space-y-4">
        <div>Order #{id} not found in database records.</div>
        <Link href="/admin/orders" className="text-amber-400 font-bold hover:underline">
          ← Return to Orders List
        </Link>
      </div>
    );
  }

  const handleStatusChange = (newStatus: OrderStatus) => {
    const updated = orderService.updateOrderStatus(order.id, newStatus);
    setOrder(updated);
    setToastMsg(`Order status updated to ${newStatus}`);
  };

  const handlePaymentStatusChange = (newPaymentStatus: PaymentStatus) => {
    const updated = orderService.updatePaymentStatus(order.id, newPaymentStatus);
    setOrder(updated);
    setToastMsg(`Payment status updated to ${newPaymentStatus}`);
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/90 p-6 rounded-3xl border border-zinc-800 shadow-xl">
        <div className="flex items-center gap-3">
          <Link href="/admin/orders" className="p-2.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 rounded-2xl border border-zinc-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-amber-400 font-extrabold">{order.id}</span>
              <StatusBadge status={order.orderStatus} type="order" />
            </div>
            <p className="text-xs text-zinc-400 font-mono">Placed on {order.date}</p>
          </div>
        </div>

        {/* Status Changer & iCarry Shipment Controls */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {/* Book via iCarry or Print Label */}
          {order.trackingNumber || order.shippingStatus === 'Booked' ? (
            <div className="flex items-center gap-2">
              <div className="px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-400" />
                <span>iCarry: {order.trackingNumber}</span>
              </div>
              {order.labelUrl && (
                <a
                  href={order.labelUrl.startsWith('http') ? order.labelUrl : `http://localhost:5000${order.labelUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-[#f4c84a] text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md hover:scale-105 transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Label</span>
                </a>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsICarryModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#f4c84a] to-amber-500 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg hover:scale-105 transition-all cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>Book via iCarry</span>
            </button>
          )}

          <div className="space-y-0.5 text-right">
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">Change Order Status</span>
            <select
              value={order.orderStatus}
              onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
              className="bg-zinc-950 border border-amber-400/40 rounded-xl px-3 py-2 text-xs font-bold text-amber-400 focus:outline-none cursor-pointer"
            >
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Processing">Processing</option>
              <option value="Packed">Packed</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Visual Order Lifecycle Stepper */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h3 className="text-xs font-extrabold font-serif uppercase tracking-wider text-amber-400">
            Fulfillment Progress Stepper
          </h3>
          <span className="text-[10px] font-mono text-zinc-500">Live Stage Tracker</span>
        </div>

        <OrderTimeline currentStatus={order.orderStatus} timeline={order.timeline} />
      </div>

      {/* Order Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Item breakdown & Billing */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Purchased Items Card */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-extrabold font-serif uppercase tracking-wider text-amber-400 border-b border-zinc-800 pb-3">
              Ordered Jerseys & Accessories ({order.items.length})
            </h2>

            <div className="divide-y divide-zinc-800/80">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden relative shrink-0">
                      {item.image && (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="font-extrabold text-white text-sm">{item.name}</div>
                      <div className="flex items-center gap-2 text-zinc-400">
                        <span>Size: <strong className="text-white font-mono">{item.size}</strong></span>
                        <span>•</span>
                        <span>Qty: <strong className="text-white font-mono">{item.quantity}</strong></span>
                      </div>
                      {item.customName ? (
                        <div className="mt-2.5 p-3 rounded-2xl bg-amber-400/15 border border-amber-400/50 shadow-md space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-amber-400 text-black font-mono tracking-wider">
                              ★ CUSTOM KIT PRINT
                            </span>
                            <span className="text-xs text-amber-300 font-bold">Player Name &amp; Number</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs font-mono font-black pt-1">
                            <div className="bg-black/70 px-3 py-1.5 rounded-xl border border-amber-400/30">
                              <span className="text-zinc-400 text-[10px] uppercase block font-sans">BACK NAME</span>
                              <span className="text-amber-300 text-sm tracking-wider font-sans font-extrabold">{item.customName}</span>
                            </div>
                            <div className="bg-black/70 px-3 py-1.5 rounded-xl border border-amber-400/30">
                              <span className="text-zinc-400 text-[10px] uppercase block font-sans">BACK NUMBER</span>
                              <span className="text-amber-300 text-sm tracking-wider font-sans font-extrabold">#{item.customNumber || '00'}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[10px] text-zinc-500 font-mono">
                          Standard Kit (No Custom Back Print)
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="font-extrabold text-white text-sm">₹{item.unitPrice * item.quantity}</span>
                    <span className="block text-[10px] text-zinc-500">₹{item.unitPrice} each</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Breakdown Summary Card */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-3 text-xs">
            <h3 className="text-sm font-extrabold font-serif uppercase tracking-wider text-amber-400 border-b border-zinc-800 pb-3">
              Payment Summary Breakdown
            </h3>

            <div className="space-y-2 font-mono">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal Items</span>
                <span>₹{order.subtotal}</span>
              </div>

              <div className="flex justify-between text-zinc-400">
                <span>Shipping Fee</span>
                <span>{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Coupon Discount</span>
                  <span>-₹{order.discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between text-white font-extrabold text-base pt-3 border-t border-zinc-800">
                <span>
                  {order.paymentStatus === 'Paid'
                    ? 'Total Amount Paid'
                    : order.paymentMethod === 'COD'
                    ? 'Total Amount to Collect (COD)'
                    : 'Total Payable Amount'}
                </span>
                <span className="text-amber-400">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Col: Customer Info & Shipping Address */}
        <div className="space-y-6">
          
          {/* Customer Profile Card */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 text-amber-400">
              <User className="w-4 h-4" />
              <h3 className="text-sm font-extrabold font-serif uppercase tracking-wider text-white">
                Customer Info
              </h3>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-white text-sm">{order.customerName}</div>
              <div className="text-zinc-400 font-mono">{order.email}</div>
              <div className="text-zinc-400 font-mono">{order.phone}</div>
            </div>
          </div>

          {/* Shipping Address Card */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 text-amber-400">
              <MapPin className="w-4 h-4" />
              <h3 className="text-sm font-extrabold font-serif uppercase tracking-wider text-white">
                Shipping Address
              </h3>
            </div>

            <div className="space-y-1 text-zinc-300 leading-relaxed">
              <div className="font-bold text-white">{order.shippingAddress?.name || order.customerName}</div>
              <div>{order.shippingAddress?.addressLine || 'No street address specified'}</div>
              <div>
                {[order.shippingAddress?.city, order.shippingAddress?.state].filter(Boolean).join(', ')}
                {order.shippingAddress?.pincode ? ` - ${order.shippingAddress.pincode}` : ''}
              </div>
              <div className="font-bold text-amber-400 uppercase text-[10px]">{order.shippingAddress?.country || 'INDIA'}</div>
            </div>
          </div>

          {/* Payment Method & Status Card */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 text-amber-400">
              <CreditCard className="w-4 h-4" />
              <h3 className="text-sm font-extrabold font-serif uppercase tracking-wider text-white">
                Payment Verification
              </h3>
            </div>

            <div className="space-y-3 font-mono">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Method:</span>
                <span className="font-bold text-white">{order.paymentMethod}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Status:</span>
                <select
                  value={order.paymentStatus}
                  onChange={(e) => handlePaymentStatusChange(e.target.value as PaymentStatus)}
                  className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs font-bold text-amber-400 cursor-pointer"
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="COD">COD</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>

              {/* COD Explanatory Banner */}
              {order.paymentMethod === 'COD' && order.paymentStatus !== 'Paid' && (
                <div className="mt-3 p-3 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs flex items-center gap-2.5">
                  <span className="text-base">💵</span>
                  <div>
                    <div className="font-bold text-amber-400 uppercase text-[10px]">Cash on Delivery (Pending)</div>
                    <div className="text-[11px] text-zinc-300 font-sans">Collect <strong className="text-white">₹{order.totalAmount}</strong> in cash upon delivery</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* iCarry.in Logistics Card */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400">
                <Truck className="w-4 h-4" />
                <h3 className="text-sm font-extrabold font-serif uppercase tracking-wider text-white">
                  iCarry.in Logistics
                </h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">API Dispatch</span>
            </div>

            {order.trackingNumber || order.shippingStatus === 'Booked' ? (
              <div className="space-y-3 font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Carrier:</span>
                  <span className="font-bold text-white font-sans">{order.courierName || 'Delhivery'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">AWB Number:</span>
                  <span className="font-bold text-amber-400 select-all">{order.trackingNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Shipment Status:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">
                    {order.shippingStatus || 'Booked'}
                  </span>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  {order.labelUrl && (
                    <a
                      href={order.labelUrl.startsWith('http') ? order.labelUrl : `http://localhost:5000${order.labelUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#f4c84a] to-amber-500 text-black font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-md hover:scale-105 transition-all cursor-pointer font-sans"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print Shipping Label</span>
                    </a>
                  )}

                  <button
                    onClick={() => setIsICarryModalOpen(true)}
                    className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold transition-colors cursor-pointer font-sans"
                  >
                    Re-book / Modify Shipment
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 font-sans">
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Generate courier waybills, request rider pickup, and print official shipping labels with iCarry.in API integration.
                </p>

                <button
                  onClick={() => setIsICarryModalOpen(true)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#f4c84a] to-amber-500 hover:from-amber-400 hover:to-amber-500 text-black font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition-all cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  <span>Book via iCarry.in</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* iCarry Booking Modal */}
      <ICarryBookingModal
        order={order}
        isOpen={isICarryModalOpen}
        onClose={() => setIsICarryModalOpen(false)}
        onBookingSuccess={(updatedOrder) => {
          setOrder(updatedOrder);
          setToastMsg(`Shipment booked with iCarry! AWB: ${updatedOrder.trackingNumber}`);
        }}
      />

      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}

    </div>
  );
}
