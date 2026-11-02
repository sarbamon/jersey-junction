'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Eye, CheckSquare, Truck, MapPin, Tag } from 'lucide-react';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { orderService } from '../../../lib/services/orderService';
import { AdminOrder, OrderStatus, PaymentStatus } from '../../../lib/types/admin';
import { Toast } from '../../../components/admin/Toast';
import { ICarryBookingModal } from '../../../components/admin/ICarryBookingModal';
import { LiveTrackingModal } from '../../../components/admin/LiveTrackingModal';
import { OrderProductImage } from '../../../components/OrderProductImage';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toastMsg, setToastMsg] = useState('');
  const [selectedOrderForICarry, setSelectedOrderForICarry] = useState<AdminOrder | null>(null);
  const [isICarryModalOpen, setIsICarryModalOpen] = useState(false);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<AdminOrder | null>(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  const loadOrders = () => {
    orderService.fetchOrdersAsync().then((fetched) => {
      setOrders(fetched);
    }).catch(() => {
      setOrders(orderService.getOrders());
    });
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    orderService.updateOrderStatus(orderId, newStatus);
    setToastMsg(`Order ${orderId} status updated to ${newStatus}`);
    loadOrders();
  };

  const filteredOrders = orders.filter((o) => {
    // Only show confirmed orders: Paid online orders or Cash on Delivery
    // Exclude any unpaid orders where payment portal was just opened
    const isCOD = o.paymentMethod === 'COD' || (o.paymentMethod as string) === 'Cash on Delivery';
    const isPaid = o.paymentStatus === 'Paid';
    if (!isCOD && !isPaid) return false;

    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      o.id.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.email.toLowerCase().includes(q) ||
      o.phone.includes(q) ||
      (o.shippingAddress?.addressLine && o.shippingAddress.addressLine.toLowerCase().includes(q)) ||
      (o.shippingAddress?.city && o.shippingAddress.city.toLowerCase().includes(q)) ||
      (o.shippingAddress?.pincode && o.shippingAddress.pincode.includes(q)) ||
      (o.items && o.items.some(i => i.name.toLowerCase().includes(q)));

    const matchesStatus = statusFilter === 'all' || o.orderStatus.toLowerCase() === statusFilter.toLowerCase();
    const matchesPayment = paymentFilter === 'all' || o.paymentStatus.toLowerCase() === paymentFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const isAllSelected = filteredOrders.length > 0 && filteredOrders.every(o => selectedIds.includes(o.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredOrders.map(o => o.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkStatusChange = (newStatus: OrderStatus) => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach(id => orderService.updateOrderStatus(id, newStatus));
    setToastMsg(`Updated ${selectedIds.length} order(s) status to ${newStatus}`);
    loadOrders();
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/90 p-6 rounded-3xl border border-zinc-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-black font-serif uppercase tracking-tight text-white">
            ORDERS
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage customer orders, view product details, check addresses &amp; dispatch courier shipments.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800/80 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Order ID (#JJ1001), Customer Name, Email, Phone, Address, or Item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Order Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-zinc-300 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="all">All Order Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="out for delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Payment Status Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-zinc-300 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="all">All Payment Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="cod">COD</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedIds.length > 0 && (
        <div className="bg-amber-400/10 border border-amber-400/30 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs font-bold">
          <div className="text-amber-400 flex items-center gap-2 font-mono">
            <CheckSquare className="w-4 h-4" />
            <span>SELECTED {selectedIds.length} OF {filteredOrders.length} ORDERS</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              onChange={(e) => {
                if (e.target.value) handleBulkStatusChange(e.target.value as OrderStatus);
              }}
              defaultValue=""
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-bold text-amber-400 cursor-pointer"
            >
              <option value="" disabled>Change Status for Selected ({selectedIds.length})...</option>
              <option value="Confirmed">Set to Confirmed</option>
              <option value="Processing">Set to Processing</option>
              <option value="Shipped">Set to Shipped</option>
              <option value="Delivered">Set to Delivered</option>
              <option value="Cancelled">Set to Cancelled</option>
            </select>

            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg cursor-pointer"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 uppercase font-mono text-[10px] tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-4 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    title="Select All Orders"
                    className="w-4 h-4 rounded accent-amber-400 cursor-pointer"
                  />
                </th>
                <th className="py-4 px-4 font-bold">Order ID</th>
                <th className="py-4 px-4 font-bold">Customer &amp; Address</th>
                <th className="py-4 px-4 font-bold">Product Details</th>
                <th className="py-4 px-4 font-bold">Total &amp; Coupon</th>
                <th className="py-4 px-4 font-bold">Payment</th>
                <th className="py-4 px-4 font-bold">Order Status</th>
                <th className="py-4 px-4 font-bold">Date</th>
                <th className="py-4 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-zinc-500 text-xs">
                    No orders found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const isSelected = selectedIds.includes(o.id);
                  return (
                    <tr
                      key={o.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-amber-400/5' : 'hover:bg-zinc-800/40'
                      }`}
                    >
                      <td className="py-4 px-4 align-top">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(o.id)}
                          className="w-4 h-4 rounded accent-amber-400 cursor-pointer mt-1"
                        />
                      </td>

                      <td className="py-4 px-4 font-mono font-extrabold text-amber-400 whitespace-nowrap align-top">
                        {o.id}
                      </td>

                      {/* Customer Details & Full Address */}
                      <td className="py-4 px-4 min-w-[220px] max-w-[280px] align-top">
                        <div className="space-y-2">
                          <div>
                            <div className="font-bold text-white text-xs">{o.customerName}</div>
                            <div className="text-[11px] text-zinc-400 font-mono">{o.phone || o.shippingAddress?.phone}</div>
                            <div className="text-[10px] text-zinc-500 truncate" title={o.email}>{o.email}</div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-[11px] text-zinc-300 space-y-1">
                            <div className="flex items-center gap-1 text-amber-400 text-[10px] font-bold uppercase tracking-wider font-mono">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span>Delivery Address</span>
                            </div>
                            <div className="text-white font-medium text-xs leading-snug">
                              {o.shippingAddress?.addressLine || 'Address not provided'}
                            </div>
                            <div className="text-zinc-400 text-[10px]">
                              {[o.shippingAddress?.city, o.shippingAddress?.state].filter(Boolean).join(', ')}
                              {o.shippingAddress?.pincode ? ` - ${o.shippingAddress.pincode}` : ''}
                            </div>
                            {o.shippingAddress?.country && o.shippingAddress.country.toUpperCase() !== 'INDIA' && (
                              <div className="text-zinc-500 text-[9px] font-mono uppercase">{o.shippingAddress.country}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Product Details with Photo Thumbnail */}
                      <td className="py-4 px-4 min-w-[280px] max-w-[360px] align-top">
                        <div className="space-y-2">
                          {o.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 bg-zinc-950/70 p-2 rounded-xl border border-zinc-800/60">
                              <div className="h-12 w-12 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden relative shrink-0 flex items-center justify-center">
                                <OrderProductImage
                                  src={item.image}
                                  name={item.name}
                                  productId={item.productId}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              <div className="flex-1 min-w-0 space-y-0.5">
                                <div className="text-xs font-bold text-white truncate" title={item.name}>
                                  {item.name}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                                  <span>Size: <strong className="text-amber-400 font-bold">{item.size}</strong></span>
                                  <span>•</span>
                                  <span>Qty: <strong className="text-white font-bold">{item.quantity}</strong></span>
                                  <span>•</span>
                                  <span>₹{item.unitPrice * item.quantity}</span>
                                </div>
                                {item.version && (
                                  <div className="text-[9px] text-zinc-400 font-sans truncate">
                                    {item.version}
                                  </div>
                                )}
                                {(item.customName || item.customNumber) && (
                                  <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-300 border border-amber-400/30 text-[9px] font-extrabold uppercase font-mono tracking-wider">
                                    ★ Print: {item.customName || ''} #{item.customNumber || ''}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Total & Coupon Status */}
                      <td className="py-4 px-4 whitespace-nowrap min-w-[150px] align-top">
                        <div className="space-y-1.5">
                          <div className="font-mono font-extrabold text-white text-sm">
                            ₹{o.totalAmount}
                          </div>

                          {/* Coupon Added or Not */}
                          {o.discountAmount > 0 || o.couponCode ? (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold font-mono">
                              <Tag className="w-2.5 h-2.5 shrink-0" />
                              <span>Coupon: {o.couponCode || 'APPLIED'} (-₹{o.discountAmount})</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800/40 text-zinc-500 text-[10px] font-mono">
                              <Tag className="w-2.5 h-2.5 shrink-0" />
                              <span>No coupon applied</span>
                            </div>
                          )}

                          {o.shippingFee !== undefined && (
                            <div className="text-[10px] text-zinc-500 font-mono">
                              Shipping: {o.shippingFee === 0 ? 'FREE' : `₹${o.shippingFee}`}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Payment */}
                      <td className="py-4 px-4 whitespace-nowrap align-top">
                        <div className="flex flex-col items-start gap-1">
                          <StatusBadge status={o.paymentStatus} type="payment" />
                          <span className="text-[9px] font-mono uppercase text-zinc-400">
                            {o.paymentMethod || 'Online'}
                          </span>
                        </div>
                      </td>

                      {/* Order Status */}
                      <td className="py-4 px-4 whitespace-nowrap align-top">
                        <select
                          value={o.orderStatus}
                          onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                          className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs font-bold text-amber-400 focus:outline-none focus:border-amber-400 cursor-pointer"
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
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 font-mono text-[10px] text-zinc-400 whitespace-nowrap align-top">
                        {o.date}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap align-top">
                        <div className="flex items-center justify-end gap-2 flex-wrap sm:flex-nowrap">
                          {/* iCarry Booking Button or Live Tracking */}
                          {o.trackingNumber || o.shippingStatus === 'Booked' ? (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedOrderForTracking(o);
                                  setIsTrackingModalOpen(true);
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-mono text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 shadow-sm"
                                title="Click to track live courier shipment"
                              >
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span>{o.trackingNumber || 'Track Live'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedOrderForICarry(o);
                                  setIsICarryModalOpen(true);
                                }}
                                className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                                title="Modify / Re-book Shipment"
                              >
                                <Truck className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedOrderForICarry(o);
                                setIsICarryModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 bg-gradient-to-r from-[#f4c84a]/20 to-amber-500/20 hover:from-[#f4c84a] hover:to-amber-500 text-amber-300 hover:text-black border border-amber-400/40 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-105 active:scale-95 shrink-0"
                              title="Book courier shipment"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Book Shipment</span>
                            </button>
                          )}

                          <Link
                            href={`/admin/orders/${o.id.replace('#', '')}`}
                            className="px-3 py-1.5 bg-zinc-800 hover:bg-amber-400 hover:text-black rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* iCarry Booking Modal */}
      {selectedOrderForICarry && (
        <ICarryBookingModal
          order={selectedOrderForICarry}
          isOpen={isICarryModalOpen}
          onClose={() => {
            setIsICarryModalOpen(false);
            setSelectedOrderForICarry(null);
          }}
          onBookingSuccess={(updatedOrder) => {
            setToastMsg(`Shipment for ${updatedOrder.id} booked with iCarry! AWB: ${updatedOrder.trackingNumber}`);
            loadOrders();
          }}
          onOpenTracking={(bookedOrder) => {
            setSelectedOrderForTracking(bookedOrder);
            setIsTrackingModalOpen(true);
          }}
        />
      )}

      {/* Live Tracking Modal */}
      <LiveTrackingModal
        order={selectedOrderForTracking}
        isOpen={isTrackingModalOpen}
        onClose={() => {
          setIsTrackingModalOpen(false);
          setSelectedOrderForTracking(null);
        }}
      />

      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}

    </div>
  );
}
