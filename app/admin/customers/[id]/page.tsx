'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Mail, Phone, MapPin, ShoppingBag, DollarSign, Calendar, Eye, Ban, ShieldCheck, KeyRound, X, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { customerService } from '../../../../lib/services/customerService';
import { orderService } from '../../../../lib/services/orderService';
import { AdminCustomer, AdminOrder } from '../../../../lib/types/admin';
import { StatusBadge } from '../../../../components/admin/StatusBadge';

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [customer, setCustomer] = useState<AdminCustomer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<AdminOrder[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 4000);
  };

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      customerService.getCustomerById(id),
      orderService.fetchOrdersAsync()
    ]).then(([found, allOrders]) => {
      if (isMounted && found) {
        setCustomer(found);
        const matched = allOrders.filter((o: AdminOrder) => 
          o.email.toLowerCase() === found.email.toLowerCase() || 
          o.customerName.toLowerCase() === found.name.toLowerCase()
        );
        setCustomerOrders(matched);
      }
    });
    return () => { isMounted = false; };
  }, [id]);

  const handleToggleBan = async () => {
    if (!customer) return;
    const isCurrentlyBanned = customer.isBanned || customer.status === 'Banned';
    let reason = '';
    
    if (!isCurrentlyBanned) {
      const inputReason = window.prompt(`Enter a reason for banning customer "${customer.name}":`, 'Suspicious activity / Terms violation');
      if (inputReason === null) return;
      reason = inputReason || 'Suspicious activity / Terms violation';
    } else {
      if (!window.confirm(`Are you sure you want to UNBAN customer "${customer.name}"?`)) {
        return;
      }
    }

    setActionLoading(true);
    const res = await customerService.banCustomer(customer.id, !isCurrentlyBanned, reason);
    if (res.success) {
      setCustomer(prev => prev ? { ...prev, isBanned: !isCurrentlyBanned, status: !isCurrentlyBanned ? 'Banned' : 'Active', banReason: reason } : null);
      showToast('success', res.message || `Customer status updated`);
    } else {
      showToast('error', res.message || 'Failed to update status');
    }
    setActionLoading(false);
  };

  const handleConfirmResetPassword = async () => {
    if (!customer) return;
    if (!newPasswordInput || newPasswordInput.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    setActionLoading(true);
    const res = await customerService.adminResetPassword(customer.id, newPasswordInput);
    if (res.success) {
      showToast('success', `Password successfully updated for ${customer.name}`);
      setShowResetModal(false);
      setNewPasswordInput('');
    } else {
      showToast('error', res.message || 'Failed to update password');
    }
    setActionLoading(false);
  };

  if (!customer) {
    return (
      <div className="p-12 text-center text-zinc-400 font-mono text-xs space-y-4">
        <div>Customer record ID &quot;{id}&quot; not found.</div>
        <Link href="/admin/customers" className="text-amber-400 font-bold hover:underline">
          ← Return to Customers Directory
        </Link>
      </div>
    );
  }

  const isBanned = customer.isBanned || customer.status === 'Banned';

  return (
    <div className="space-y-8 font-sans relative">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/90 p-6 rounded-3xl border border-zinc-800 shadow-xl">
        <div className="flex items-center gap-3">
          <Link href="/admin/customers" className="p-2.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 rounded-2xl border border-zinc-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-black font-serif font-black flex items-center justify-center text-xl shadow">
              {customer.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black font-serif uppercase tracking-tight text-white">
                  {customer.name}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  isBanned 
                    ? 'bg-red-500/10 text-red-400 border-red-500/30' 
                    : customer.status === 'VIP' 
                      ? 'bg-amber-400/10 text-amber-400 border-amber-400/30' 
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                }`}>
                  {isBanned ? '● Banned' : customer.status}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">Customer ID: {customer.id}</p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => { setShowResetModal(true); setNewPasswordInput(''); }}
            className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Reset Password</span>
          </button>

          <button
            type="button"
            onClick={handleToggleBan}
            disabled={actionLoading}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border shadow-sm ${
              isBanned
                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30'
            }`}
          >
            {isBanned ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Unban Customer</span>
              </>
            ) : (
              <>
                <Ban className="w-3.5 h-3.5" />
                <span>Ban Customer</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Customer Overview Specs */}
        <div className="space-y-6">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
            <h3 className="text-sm font-extrabold font-serif uppercase tracking-wider text-amber-400 border-b border-zinc-800 pb-3">
              Contact & Location Specs
            </h3>

            <div className="space-y-3 font-mono">
              <div className="flex items-center gap-2.5 text-zinc-300">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{customer.email}</span>
              </div>

              <div className="flex items-center gap-2.5 text-zinc-300">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{customer.phone}</span>
              </div>

              <div className="flex items-center gap-2.5 text-zinc-300">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{customer.city}, {customer.state}, {customer.country}</span>
              </div>

              <div className="flex items-center gap-2.5 text-zinc-300 pt-2 border-t border-zinc-800/80">
                <Calendar className="w-4 h-4 text-zinc-500 shrink-0" />
                <span className="text-zinc-400">Customer Joined: {customer.joinedDate}</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-3 text-center">
            <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">Lifetime Total Spending</span>
            <div className="text-3xl font-mono font-black text-amber-400">
              ₹{customer.totalSpent.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-zinc-400 font-mono">
              Over {customer.ordersCount} total store purchases
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Order History Table */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-black font-serif uppercase tracking-tight text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <span>Customer Purchase History ({customerOrders.length})</span>
          </h2>

          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-950 text-zinc-400 uppercase font-mono text-[10px] tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">Order ID</th>
                    <th className="py-3.5 px-4 font-bold">Date</th>
                    <th className="py-3.5 px-4 font-bold">Items</th>
                    <th className="py-3.5 px-4 font-bold">Amount</th>
                    <th className="py-3.5 px-4 font-bold">Status</th>
                    <th className="py-3.5 px-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-medium">
                  {customerOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-500 text-xs">
                        No orders recorded under this customer profile.
                      </td>
                    </tr>
                  ) : (
                    customerOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-extrabold text-amber-400">
                          {o.id}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-zinc-400 text-[11px]">
                          {o.date}
                        </td>
                        <td className="py-3.5 px-4 truncate max-w-xs text-zinc-200">
                          {o.items.map(i => i.name).join(', ')}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-white">
                          ₹{o.totalAmount}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={o.orderStatus} type="order" />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/admin/orders/${o.id.replace('#', '')}`}
                            className="p-2 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded-lg inline-block"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <KeyRound className="w-4 h-4" />
                <span>Reset Customer Password</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowResetModal(false);
                  setNewPasswordInput('');
                }}
                className="text-zinc-500 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="text-zinc-400">
                Setting new password for: <strong className="text-white">{customer.name}</strong> ({customer.email})
              </div>

              <div>
                <label className="font-bold text-zinc-400 block mb-1 uppercase text-[10px]">
                  New Password *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Enter min 6 chars or click Auto"
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const rand = Math.random().toString(36).substring(2, 9) + '123';
                      setNewPasswordInput(rand);
                    }}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1 shrink-0"
                    title="Generate secure random password"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Auto</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowResetModal(false);
                  setNewPasswordInput('');
                }}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading || !newPasswordInput || newPasswordInput.length < 6}
                onClick={handleConfirmResetPassword}
                className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-500 text-black font-extrabold rounded-xl text-xs cursor-pointer transition-all disabled:opacity-50"
              >
                {actionLoading ? 'Updating...' : 'Save New Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl border shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-bottom-5 ${
          toastMsg.type === 'success' 
            ? 'bg-zinc-900/95 border-emerald-500/40 text-emerald-300' 
            : 'bg-zinc-900/95 border-red-500/40 text-red-300'
        }`}>
          {toastMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{toastMsg.text}</span>
        </div>
      )}

    </div>
  );
}
