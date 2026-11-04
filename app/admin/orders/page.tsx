'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Eye, CheckSquare, Truck, MapPin, Tag, Zap, Loader2 } from 'lucide-react';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { orderService } from '../../../lib/services/orderService';
import { icarryService } from '../../../lib/services/icarryService';
import { AdminOrder, OrderStatus, PaymentStatus } from '../../../lib/types/admin';
import { Toast } from '../../../components/admin/Toast';
import { ICarryBookingModal } from '../../../components/admin/ICarryBookingModal';
import { LiveTrackingModal } from '../../../components/admin/LiveTrackingModal';
import { CancelOrderModal } from '../../../components/admin/CancelOrderModal';
import { OrderProductsModal } from '../../../components/admin/OrderProductsModal';
import { OrderProductImage } from '../../../components/OrderProductImage';

const getCanonicalStatus = (status: string, shippingStatus?: string, cancellationReason?: string): OrderStatus => {
  const s = String(status || '').toLowerCase().trim();
  const ship = String(shippingStatus || '').toLowerCase().trim();
  const reason = String(cancellationReason || '').trim();

  // If orderStatus, courier shippingStatus, or cancellationReason indicates cancellation:
  if (
    s.includes('cancel') ||
    s.includes('fail') ||
    s === 'returned' ||
    ship.includes('cancel') ||
    ship.includes('rto') ||
    (reason && s !== 'delivered')
  ) {
    return 'Cancelled';
  }
  if (s === 'delivered' || ship.includes('delivered')) return 'Delivered';
  if (s.includes('out for delivery') || ship.includes('out for delivery')) return 'Out for Delivery';
  if (s.includes('ship') || s.includes('transit') || ship.includes('in transit') || ship.includes('dispatched')) return 'In Transit';
  if (s.includes('pack') || s.includes('process') || s.includes('not picked') || s.includes('softdata')) return 'Order Processed';
  return 'Order Received';
};

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
  const [cancelTargetOrder, setCancelTargetOrder] = useState<AdminOrder | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [viewingProductsOrder, setViewingProductsOrder] = useState<AdminOrder | null>(null);
  const [isSyncingAwb, setIsSyncingAwb] = useState<string | null>(null);

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

  const handleSyncTracking = async (order: AdminOrder) => {
    if (!order.trackingNumber) return;
    setIsSyncingAwb(order.trackingNumber);
    try {
      const res = await icarryService.trackShipment(order.id);
      if (res) {
        // If live scans or status say cancelled, immediately update order to Cancelled
        if (res.shippingStatus === 'Cancelled' || res.orderStatus === 'Cancelled') {
          const cancelStep = (res.history || []).find((h) => /cancel/i.test(h.status || '') || /cancel/i.test(h.details || ''));
          const reason = cancelStep?.details || cancelStep?.status || 'Seller cancelled the order';
          setOrders((prev) =>
            prev.map((o) => (o.id === order.id ? { ...o, orderStatus: 'Cancelled', shippingStatus: 'Cancelled', cancellationReason: reason } : o))
          );
          await orderService.updateOrderStatusAsync(order.id, 'Cancelled', reason).catch(() => {});
        }
        setToastMsg(`Tracking synced: ${res.shippingStatus || 'Scanned'} for AWB ${order.trackingNumber}`);
        loadOrders();
      } else {
        setToastMsg(`Synced status for AWB ${order.trackingNumber}`);
      }
    } catch {
      setToastMsg(`Failed to sync tracking for ${order.trackingNumber}`);
    } finally {
      setIsSyncingAwb(null);
    }
  };

  const handleDeleteShipment = async (order: AdminOrder) => {
    if (!confirm(`Are you sure you want to unlink and remove the courier shipment for order ${order.id}?`)) {
      return;
    }
    try {
      await icarryService.cancelShipment(order.id);
      setToastMsg(`Courier shipment removed from order ${order.id}`);
      loadOrders();
    } catch (err: any) {
      setToastMsg(`Failed to remove shipment: ${err.message || 'Error'}`);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    // If cancelling, open the cancellation reason popup modal first (NEVER call updateOrderStatusAsync directly)
    if (newStatus === 'Cancelled') {
      const cleanOrderId = String(orderId || '').replace(/^#+/, '').toLowerCase();
      const target = orders.find(o => String(o.id || '').replace(/^#+/, '').toLowerCase() === cleanOrderId) || ({ id: orderId } as AdminOrder);
      setCancelTargetOrder(target);
      setIsCancelModalOpen(true);
      return;
    }

    // 1. Optimistic UI update so dropdown updates immediately without snapping back
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
    );

    try {
      await orderService.updateOrderStatusAsync(orderId, newStatus);
      setToastMsg(`Order ${orderId} status updated to ${newStatus}`);
    } catch (err: any) {
      setToastMsg(`Failed to update status: ${err.message || 'Error'}`);
    }
    loadOrders();
  };

  const handleConfirmCancel = async (reason: string) => {
    if (!cancelTargetOrder || isCancelling) return;
    setIsCancelling(true);
    try {
      setOrders((prev) =>
        prev.map((o) => (o.id === cancelTargetOrder.id ? { ...o, orderStatus: 'Cancelled', cancellationReason: reason } : o))
      );
      await orderService.updateOrderStatusAsync(cancelTargetOrder.id, 'Cancelled', reason);
      setToastMsg(`Order ${cancelTargetOrder.id} cancelled & moved to Order Cancel section`);
      setIsCancelModalOpen(false);
      setCancelTargetOrder(null);
      // Automatically move view to the Order Cancel section
      setStatusFilter('cancelled');
    } catch (err: any) {
      setToastMsg(`Failed to cancel order: ${err.message || 'Error'}`);
    } finally {
      setIsCancelling(false);
      loadOrders();
    }
  };

  const adminTabs: { label: string; value: string; isDanger?: boolean }[] = [
    { label: 'All Orders', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'In Transit', value: 'in transit' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Order Cancel', value: 'cancelled', isDanger: true },
  ];

  const getTabCount = (tabValue: string) => {
    return orders.filter((o) => {
      const isCOD = o.paymentMethod === 'COD' || (o.paymentMethod as string) === 'Cash on Delivery';
      const isPaid = o.paymentStatus === 'Paid';
      const isCancelled = getCanonicalStatus(o.orderStatus, o.shippingStatus, o.cancellationReason) === 'Cancelled';
      const isRefunded = o.paymentStatus === 'Refunded';
      if (!isCOD && !isPaid && !isCancelled && !isRefunded) return false;

      const s = getCanonicalStatus(o.orderStatus, o.shippingStatus, o.cancellationReason).toLowerCase();
      if (tabValue === 'all') return true;
      if (tabValue === 'active') return s !== 'delivered' && s !== 'cancelled';
      if (tabValue === 'cancelled') return s === 'cancelled';
      return s === tabValue.toLowerCase();
    }).length;
  };

  const filteredOrders = orders.filter((o) => {
    // Only show confirmed orders: Paid online orders, Cash on Delivery, or Cancelled/Refunded orders
    // Exclude any unpaid orders where payment portal was just opened
    const isCOD = o.paymentMethod === 'COD' || (o.paymentMethod as string) === 'Cash on Delivery';
    const isPaid = o.paymentStatus === 'Paid';
    const isCancelled = getCanonicalStatus(o.orderStatus, o.shippingStatus, o.cancellationReason) === 'Cancelled';
    const isRefunded = o.paymentStatus === 'Refunded';
    if (!isCOD && !isPaid && !isCancelled && !isRefunded) return false;

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

    let matchesStatus = true;
    if (statusFilter === 'active') {
      const s = getCanonicalStatus(o.orderStatus, o.shippingStatus, o.cancellationReason).toLowerCase();
      matchesStatus = s !== 'delivered' && s !== 'cancelled';
    } else if (statusFilter !== 'all') {
      matchesStatus = getCanonicalStatus(o.orderStatus, o.shippingStatus, o.cancellationReason).toLowerCase() === statusFilter.toLowerCase();
    }

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

  const handleBulkStatusChange = async (newStatus: OrderStatus) => {
    if (selectedIds.length === 0) return;
    setOrders((prev) =>
      prev.map((o) => (selectedIds.includes(o.id) ? { ...o, orderStatus: newStatus } : o))
    );
    setToastMsg(`Updating ${selectedIds.length} order(s) to ${newStatus}...`);
    for (const id of selectedIds) {
      await orderService.updateOrderStatusAsync(id, newStatus);
    }
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

      {/* Status Navigation Tabs (All Orders / Active / In Transit / Delivered / Order Cancel) */}
      <div className="flex flex-wrap items-center gap-2">
        {adminTabs.map((tab) => {
          const isActive = statusFilter === tab.value;
          const count = getTabCount(tab.value);
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                isActive
                  ? tab.isDanger
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/20 font-black'
                    : 'bg-[#f4c84a] text-black shadow-lg shadow-amber-500/20 font-black'
                  : tab.isDanger
                  ? 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                isActive
                  ? tab.isDanger
                    ? 'bg-black/30 text-white font-bold'
                    : 'bg-black/20 text-black font-bold'
                  : tab.isDanger
                  ? 'bg-red-500/20 text-red-300'
                  : 'bg-zinc-800 text-zinc-300'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-zinc-900/90 p-4 rounded-2xl border border-zinc-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Order ID (#JJ1001), Customer Name, Email, Phone, Address, or Item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Payment Status Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-bold text-zinc-300 focus:outline-none focus:border-amber-400 cursor-pointer"
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
              <option value="Order Received">Set to Order Received</option>
              <option value="Order Processed">Set to Order Processed</option>
              <option value="In Transit">Set to In Transit</option>
              <option value="Out for Delivery">Set to Out for Delivery</option>
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

      {/* Orders Table (Clean High-Contrast Card Table) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden text-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#f8fafc] text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-4 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    title="Select All Orders"
                    className="w-4 h-4 rounded border-slate-300 accent-amber-500 cursor-pointer"
                  />
                </th>
                <th className="py-4 px-4 font-bold min-w-[200px]">Order &amp; Customer</th>
                <th className="py-4 px-4 font-bold min-w-[250px]">Product Details</th>
                <th className="py-4 px-4 font-bold min-w-[140px]">Total &amp; Coupon</th>
                <th className="py-4 px-4 font-bold min-w-[100px]">Payment</th>
                <th className="py-4 px-4 font-bold min-w-[210px]">Courier / Tracking</th>
                <th className="py-4 px-4 font-bold min-w-[170px]">Fulfillment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400 text-xs">
                    No orders found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const isSelected = selectedIds.includes(o.id);
                  const isBooked = Boolean(o.trackingNumber || o.shippingStatus === 'Booked');
                  const canonical = getCanonicalStatus(o.orderStatus, o.shippingStatus, o.cancellationReason);
                  const isOrderCancelled = canonical === 'Cancelled';
                  const isSoftdataOrNotPicked = (o.shippingStatus?.toLowerCase().includes('softdata') || o.shippingStatus?.toLowerCase().includes('not picked')) && !isOrderCancelled;

                  return (
                    <tr
                      key={o.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-amber-50/60' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 px-3 align-top text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(o.id)}
                          className="w-4 h-4 rounded border-slate-300 accent-amber-500 cursor-pointer mt-1"
                        />
                      </td>

                      {/* Order & Customer Column */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-1">
                          <Link 
                            href={`/admin/orders/${o.id.replace('#', '')}`}
                            className="font-mono font-extrabold text-slate-900 text-sm hover:text-amber-600 transition-colors inline-block"
                            title="Open Order Details"
                          >
                            {o.id}
                          </Link>
                          <div className="font-bold text-slate-800 text-xs">{o.customerName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{o.phone || o.shippingAddress?.phone}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[200px]" title={o.shippingAddress?.addressLine || ''}>
                            📍 {o.shippingAddress?.city ? `${o.shippingAddress.city}, ${o.shippingAddress?.state || ''}` : 'Address recorded'}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono pt-0.5">
                            Placed: {o.date}
                          </div>
                        </div>
                      </td>

                      {/* Product Details (Shows up to 2 items + View Products button) */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-2">
                          {o.items.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2.5">
                              {/* Square image thumbnail */}
                              <div className="h-10 w-10 rounded-md bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                                <OrderProductImage
                                  src={item.image}
                                  name={item.name}
                                  productId={item.productId}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              <div className="min-w-0 flex-1 space-y-0.5">
                                <div className="text-xs font-bold text-slate-900 truncate max-w-[180px]" title={item.name}>
                                  {item.name}
                                </div>
                                <div className="text-[11px] text-slate-500 font-medium font-mono">
                                  <span>Size: <strong className="text-slate-800">{item.size}</strong></span>
                                  <span className="mx-1">•</span>
                                  <span>Qty: <strong className="text-slate-800">{item.quantity}</strong></span>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* View Products (X) Button */}
                          <button
                            type="button"
                            onClick={() => setViewingProductsOrder(o)}
                            className="mt-1 px-3 py-1 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs hover:border-slate-400"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>View Products ({o.items.length})</span>
                          </button>
                        </div>
                      </td>

                      {/* Total & Coupon Column */}
                      <td className="py-4 px-4 whitespace-nowrap align-top">
                        <div className="space-y-1.5">
                          <div className="font-mono font-extrabold text-slate-900 text-sm sm:text-base">
                            ₹{o.totalAmount?.toLocaleString('en-IN')}
                          </div>

                          {/* Coupon Tag */}
                          {o.discountAmount > 0 || o.couponCode ? (
                            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#ecfdf5] border border-[#a7f3d0] text-[#059669] text-xs font-bold font-mono shadow-xs">
                              <span>🏷</span>
                              <span>{o.couponCode || '100@OFF'} (-₹{o.discountAmount || 100})</span>
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-400 font-mono">
                              No coupon
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Payment Status Column */}
                      <td className="py-4 px-4 whitespace-nowrap align-top">
                        <div className="flex flex-col items-start gap-1">
                          <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase font-mono tracking-wider shadow-xs ${
                            o.paymentStatus === 'Paid'
                              ? 'bg-[#dcfce7] border border-[#bbf7d0] text-[#15803d]'
                              : o.paymentStatus === 'Pending'
                              ? 'bg-[#fef3c7] border border-[#fde68a] text-[#b45309]'
                              : o.paymentStatus === 'Failed'
                              ? 'bg-[#fee2e2] border border-[#fecaca] text-[#b91c1c]'
                              : 'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}>
                            {o.paymentStatus === 'Paid' ? 'PAID' : o.paymentStatus}
                          </span>
                        </div>
                      </td>

                      {/* Courier / Live Tracking Column */}
                      <td className="py-4 px-4 whitespace-nowrap align-top">
                        {isBooked ? (
                          <div className="space-y-1">
                            {/* Tracking Number */}
                            <div className="font-mono font-bold text-slate-900 text-sm tracking-wide">
                              {o.trackingNumber}
                            </div>

                            {/* Courier Service Name */}
                            <div className="text-[11px] text-slate-400 font-mono uppercase tracking-wider font-semibold">
                              {o.courierName || 'DELHIVERY SURFACE'}
                            </div>

                            {/* Checkpoint / Destination Location */}
                            <div className="text-xs text-slate-600 font-medium flex items-center gap-1 max-w-[210px] truncate" title={o.shippingAddress?.city ? `Mumbai / ${o.shippingAddress.city}` : 'In Transit'}>
                              <span>📍</span>
                              <span className="truncate">{o.shippingAddress?.city ? `Mumbai_${o.shippingAddress.city}...` : 'Mumbai_MahimJunction...'}</span>
                            </div>

                            {/* Action Links: VIEW | SYNC | EDIT | DELETE */}
                            <div className="pt-1 flex items-center gap-1.5 text-xs font-mono font-bold">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedOrderForTracking(o);
                                  setIsTrackingModalOpen(true);
                                }}
                                className="text-[#2563eb] hover:text-[#1d4ed8] hover:underline cursor-pointer"
                              >
                                VIEW
                              </button>
                              <span className="text-slate-300 font-normal">|</span>
                              <button
                                type="button"
                                onClick={() => handleSyncTracking(o)}
                                className="text-[#059669] hover:text-[#047857] hover:underline cursor-pointer flex items-center gap-1"
                                title="Sync latest status from iCarry courier"
                              >
                                {isSyncingAwb === o.trackingNumber && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
                                <span>SYNC</span>
                              </button>
                              <span className="text-slate-300 font-normal">|</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedOrderForICarry(o);
                                  setIsICarryModalOpen(true);
                                }}
                                className="text-[#d97706] hover:text-[#b45309] hover:underline cursor-pointer"
                                title="Modify weight, dimensions or courier"
                              >
                                EDIT
                              </button>
                              <span className="text-slate-300 font-normal">|</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteShipment(o)}
                                className="text-[#dc2626] hover:text-[#b91c1c] hover:underline cursor-pointer"
                                title="Cancel courier shipment"
                              >
                                DELETE
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <span className="text-xs font-mono text-slate-400 block font-medium">Not Booked</span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOrderForICarry(o);
                                setIsICarryModalOpen(true);
                              }}
                              className="px-3 py-1.5 bg-[#f4c84a] hover:bg-[#e0b438] text-slate-950 font-bold text-xs rounded-lg transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-105 active:scale-95 shrink-0"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Book Shipment</span>
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Fulfillment Status & iCarry Badge */}
                      <td className="py-4 px-4 whitespace-nowrap align-top">
                        <div className="space-y-1.5 flex flex-col items-start min-w-[150px]">
                          <select
                            value={isOrderCancelled ? 'Cancelled' : (isSoftdataOrNotPicked ? 'Not Picked' : canonical)}
                            onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                            className={`bg-white border rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none cursor-pointer w-full shadow-sm ${
                              isOrderCancelled
                                ? 'border-red-400 text-red-600 focus:ring-2 focus:ring-red-200'
                                : 'border-slate-300 text-slate-800 focus:ring-2 focus:ring-amber-400'
                            }`}
                          >
                            <option value="Not Picked">Not Picked</option>
                            <option value="Order Received">Order Received</option>
                            <option value="Order Processed">Order Processed</option>
                            <option value="In Transit">In Transit</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>

                          {/* ⚡ Auto-Synced iCarry badge */}
                          {isBooked ? (
                            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#fffbeb] border border-[#fef08a] text-[#b45309] text-[11px] font-bold font-mono shadow-xs">
                              <Zap className="w-3 h-3 text-[#d97706] fill-[#d97706]" />
                              <span>Auto-Synced iCarry</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-mono">
                              <span>Not Synced</span>
                            </div>
                          )}

                          {isOrderCancelled && (
                            <div className="mt-1.5 text-xs text-red-600 font-semibold max-w-[170px] leading-tight">
                              Reason: {o.cancellationReason || 'Seller cancelled the order'}
                            </div>
                          )}
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
        onOrderUpdated={(id, status, reason) => {
          setOrders((prev) =>
            prev.map((o) => (o.id === id ? { ...o, orderStatus: status, shippingStatus: 'Cancelled', cancellationReason: reason || o.cancellationReason } : o))
          );
          orderService.updateOrderStatusAsync(id, status, reason).catch(() => {});
        }}
      />

      {/* Cancel Order Reason Modal */}
      <CancelOrderModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setCancelTargetOrder(null);
        }}
        onConfirm={handleConfirmCancel}
        orderId={cancelTargetOrder?.id || ''}
        customerEmail={cancelTargetOrder?.email || ''}
        customerName={cancelTargetOrder?.customerName}
        isLoading={isCancelling}
      />

      {/* Ordered Products Inspection Modal */}
      <OrderProductsModal
        isOpen={Boolean(viewingProductsOrder)}
        onClose={() => setViewingProductsOrder(null)}
        order={viewingProductsOrder}
      />

      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}

    </div>
  );
}
