'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, Eye, ArrowUpDown, Clock, Trash2, CheckSquare, Trash, Truck } from 'lucide-react';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { orderService } from '../../../lib/services/orderService';
import { AdminOrder, OrderStatus, PaymentStatus } from '../../../lib/types/admin';
import { Toast } from '../../../components/admin/Toast';
import { ICarryBookingModal } from '../../../components/admin/ICarryBookingModal';
import { LiveTrackingModal } from '../../../components/admin/LiveTrackingModal';

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

  const handleDeleteOrder = (orderId: string) => {
    if (confirm(`Delete order ${orderId}?`)) {
      orderService.deleteOrder(orderId);
      setSelectedIds(selectedIds.filter(id => id !== orderId));
      setToastMsg(`Order ${orderId} deleted`);
      loadOrders();
    }
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
      o.phone.includes(q);

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

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Delete ${selectedIds.length} selected order(s)? This cannot be undone.`)) {
      const toDelete = [...selectedIds];
      const cleanSet = new Set(toDelete.map(id => id.toLowerCase().replace('#', '')));
      setOrders(prev => prev.filter(o => !cleanSet.has((o.id || '').toLowerCase().replace('#', ''))));
      setSelectedIds([]);
      await orderService.deleteOrdersBulk(toDelete);
      setToastMsg(`Deleted ${toDelete.length} order(s) successfully`);
      loadOrders();
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
        </div>

        {orders.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Delete ALL orders? This cannot be undone.')) {
                orderService.deleteAllOrders();
                setToastMsg('All orders deleted successfully');
                setSelectedIds([]);
                loadOrders();
              }
            }}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>CLEAR ALL ORDERS</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800/80 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Order ID (#JJ1001), Customer Name, Email, or Phone..."
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
            <button
              onClick={handleBulkDelete}
              className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Trash className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
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
                <th className="py-4 px-4 font-bold">Customer Details</th>
                <th className="py-4 px-4 font-bold">Items</th>
                <th className="py-4 px-4 font-bold">Total</th>
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
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(o.id)}
                          className="w-4 h-4 rounded accent-amber-400 cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-4 font-mono font-extrabold text-amber-400">
                        {o.id}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{o.customerName}</div>
                        <div className="text-[10px] text-zinc-500">{o.email}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="max-w-xs truncate text-zinc-200 font-bold">
                          {o.items.map(i => i.name).join(', ')}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {o.items.reduce((sum, i) => sum + i.quantity, 0)} item(s)
                          </span>
                          {o.items.some(i => i.customName || i.customNumber) && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[9px] font-extrabold uppercase tracking-wider">
                              ★ Custom Print: {o.items.filter(i => i.customName || i.customNumber).map(i => `${i.customName || ''} #${i.customNumber || ''}`).join(', ')}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-extrabold text-white">
                        ₹{o.totalAmount}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-col items-start gap-1">
                          <StatusBadge status={o.paymentStatus} type="payment" />
                          <span className="text-[9px] font-mono uppercase text-zinc-400">
                            {o.paymentMethod || 'Online'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {/* Inline Status Changer Dropdown */}
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

                      <td className="py-3 px-4 font-mono text-[10px] text-zinc-400">
                        {o.date}
                      </td>

                      <td className="py-3 px-4 text-right">
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
                          <button
                            onClick={() => handleDeleteOrder(o.id)}
                            className="p-1.5 bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 rounded-lg transition-all cursor-pointer shrink-0"
                            title="Delete Order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
