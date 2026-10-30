'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Users, Eye, Ban, ShieldCheck, KeyRound, X, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { customerService } from '../../../lib/services/customerService';
import { AdminCustomer } from '../../../lib/types/admin';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [resetPasswordCustomer, setResetPasswordCustomer] = useState<AdminCustomer | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 4000);
  };

  useEffect(() => {
    customerService.getCustomers().then(setCustomers);
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery) ||
    c.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleBan = async (c: AdminCustomer) => {
    const isCurrentlyBanned = c.isBanned || c.status === 'Banned';
    let reason = '';
    
    if (!isCurrentlyBanned) {
      const inputReason = window.prompt(`Enter a reason for banning customer "${c.name}" (or leave blank for default):`, 'Suspicious activity / Violation of Terms');
      if (inputReason === null) return;
      reason = inputReason || 'Suspicious activity / Violation of Terms';
    } else {
      if (!window.confirm(`Are you sure you want to UNBAN customer "${c.name}" and restore their account access?`)) {
        return;
      }
    }

    setActionLoading(true);
    const res = await customerService.banCustomer(c.id, !isCurrentlyBanned, reason);
    if (res.success) {
      setCustomers(prev => prev.map(cust => 
        cust.id === c.id 
          ? { ...cust, isBanned: !isCurrentlyBanned, status: !isCurrentlyBanned ? 'Banned' : 'Active', banReason: reason }
          : cust
      ));
      showToast('success', res.message || `Customer successfully ${!isCurrentlyBanned ? 'banned' : 'unbanned'}`);
    } else {
      showToast('error', res.message || 'Failed to update customer status');
    }
    setActionLoading(false);
  };

  const handleOpenResetPassword = (c: AdminCustomer) => {
    setResetPasswordCustomer(c);
    setNewPasswordInput('');
  };

  const handleConfirmResetPassword = async () => {
    if (!resetPasswordCustomer) return;
    if (!newPasswordInput || newPasswordInput.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    setActionLoading(true);
    const res = await customerService.adminResetPassword(resetPasswordCustomer.id, newPasswordInput);
    if (res.success) {
      showToast('success', `Password successfully updated for ${resetPasswordCustomer.name}`);
      setResetPasswordCustomer(null);
      setNewPasswordInput('');
    } else {
      showToast('error', res.message || 'Failed to update password');
    }
    setActionLoading(false);
  };

  return (
    <div className="space-y-6 font-sans relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/90 p-6 rounded-3xl border border-zinc-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>CUSTOMER ACCOUNTS DIRECTORY</span>
          </div>
          <h1 className="text-2xl font-black font-serif uppercase tracking-tight text-white">
            CUSTOMERS
          </h1>
          <p className="text-xs text-zinc-400">
            View registered user profiles, order frequency, total spending, and VIP statuses.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800/80">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search customers by name, email, phone, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 uppercase font-mono text-[10px] tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-4 px-4 font-bold">Customer</th>
                <th className="py-4 px-4 font-bold">Contact</th>
                <th className="py-4 px-4 font-bold">Location</th>
                <th className="py-4 px-4 font-bold">Orders</th>
                <th className="py-4 px-4 font-bold">Total Spent</th>
                <th className="py-4 px-4 font-bold">Joined</th>
                <th className="py-4 px-4 font-bold">Status</th>
                <th className="py-4 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500 text-xs">
                    No customer accounts found matching search term.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-black font-serif font-black flex items-center justify-center text-sm shadow">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">{c.name}</div>
                          <div className="text-[10px] font-mono text-zinc-500">{c.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-zinc-400">
                      <div>{c.email}</div>
                      <div className="text-[10px] text-zinc-500">{c.phone}</div>
                    </td>

                    <td className="py-3.5 px-4 text-zinc-300">
                      {c.city}, {c.state}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {c.ordersCount} orders
                    </td>

                    <td className="py-3.5 px-4 font-mono font-extrabold text-amber-400">
                      ₹{c.totalSpent.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-400">
                      {c.joinedDate}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        c.isBanned || c.status === 'Banned'
                          ? 'bg-red-500/10 text-red-400 border-red-500/30'
                          : c.status === 'VIP' 
                            ? 'bg-amber-400/10 text-amber-400 border-amber-400/30' 
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {c.isBanned || c.status === 'Banned' ? '● Banned' : c.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/customers/${c.id}`}
                          className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                          title="View Customer Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Profile</span>
                        </Link>

                        {/* Reset Password Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenResetPassword(c)}
                          className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                          title="Help Reset Password"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Reset Pass</span>
                        </button>

                        {/* Ban / Unban Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleBan(c)}
                          disabled={actionLoading}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer border ${
                            c.isBanned || c.status === 'Banned'
                              ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30'
                          }`}
                          title={c.isBanned || c.status === 'Banned' ? 'Unban Customer' : 'Ban Customer'}
                        >
                          {c.isBanned || c.status === 'Banned' ? (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Unban</span>
                            </>
                          ) : (
                            <>
                              <Ban className="w-3.5 h-3.5" />
                              <span>Ban</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reset Password Modal */}
      {resetPasswordCustomer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <KeyRound className="w-4 h-4" />
                <span>Reset Customer Password</span>
              </div>
              <button
                type="button"
                onClick={() => setResetPasswordCustomer(null)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="text-zinc-400">
                Setting new password for: <strong className="text-white">{resetPasswordCustomer.name}</strong> ({resetPasswordCustomer.email})
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
                onClick={() => setResetPasswordCustomer(null)}
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

      {/* Toast Notification */}
      {toastMsg && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold border backdrop-blur-md transition-all ${
          toastMsg.type === 'success' 
            ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40' 
            : 'bg-red-950/90 text-red-300 border-red-500/40'
        }`}>
          {toastMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

    </div>
  );
}
