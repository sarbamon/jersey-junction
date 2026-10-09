'use client';

import React, { useState, useEffect } from 'react';
import { Ticket, Plus, Edit, Trash2, Save, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { couponService } from '../../../lib/services/couponService';
import { AdminCoupon } from '../../../lib/types/admin';
import { ConfirmModal } from '../../../components/admin/ConfirmModal';
import { Toast } from '../../../components/admin/Toast';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New Coupon Form
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(10);
  const [minOrder, setMinOrder] = useState(499);
  const [maxDiscount, setMaxDiscount] = useState(200);
  const [expiryDate, setExpiryDate] = useState('2026-12-31');
  const [usageLimit, setUsageLimit] = useState(500);
  const [status, setStatus] = useState<'Active' | 'Expired' | 'Disabled'>('Active');

  const [editTarget, setEditTarget] = useState<AdminCoupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminCoupon | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  const loadData = () => {
    setCoupons(couponService.getCoupons());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    couponService.addCoupon({
      code: code.toUpperCase().trim(),
      discountType,
      discountValue: Number(discountValue),
      minOrder: Number(minOrder),
      maxDiscount: Number(maxDiscount),
      expiryDate,
      usageLimit: Number(usageLimit),
      status
    });

    setCode('');
    setIsAddOpen(false);
    setToastMsg(`Coupon code "${code.toUpperCase()}" created!`);
    loadData();
  };

  const handleToggleStatus = (c: AdminCoupon) => {
    const nextStatus = c.status === 'Active' ? 'Disabled' : 'Active';
    couponService.updateCoupon(c.id, { status: nextStatus });
    setToastMsg(`Coupon ${c.code} status changed to ${nextStatus}`);
    loadData();
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      couponService.deleteCoupon(deleteTarget.id);
      setToastMsg(`Coupon "${deleteTarget.code}" deleted.`);
      setDeleteTarget(null);
      loadData();
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/90 p-6 rounded-3xl border border-zinc-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Ticket className="w-4 h-4" />
            <span>DISCOUNT & PROMOTIONAL ENGINE</span>
          </div>
          <h1 className="text-2xl font-black font-serif uppercase tracking-tight text-white">
            COUPONS ({coupons.length})
          </h1>
          <p className="text-xs text-zinc-400">
            Create checkout promo codes, percentage discounts, and fixed cart deductions.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(!isAddOpen)}
          className="px-5 py-3 bg-amber-400 hover:bg-amber-500 text-black font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer uppercase tracking-wider"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* Add Coupon Form */}
      {isAddOpen && (
        <form onSubmit={handleCreate} className="bg-zinc-900 border border-amber-400/40 rounded-3xl p-6 shadow-2xl space-y-4 text-xs animate-fade-in">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="font-serif font-black uppercase text-amber-400 text-sm">Create New Promo Coupon</h3>
            <button onClick={() => setIsAddOpen(false)} type="button" className="text-zinc-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="font-bold text-zinc-400 block mb-1 uppercase">Coupon Code *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. MATCHDAY15"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-amber-400 font-mono font-bold uppercase focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-400 block mb-1 uppercase">Discount Type</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-zinc-400 block mb-1 uppercase">Discount Value *</label>
              <input
                type="number"
                required
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-400 block mb-1 uppercase">Min Order Amount (₹)</label>
              <input
                type="number"
                value={minOrder}
                onChange={(e) => setMinOrder(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-zinc-400 block mb-1 uppercase">Max Discount Cap (₹)</label>
              <input
                type="number"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-400 block mb-1 uppercase">Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-400 block mb-1 uppercase">Usage Limit</label>
              <input
                type="number"
                value={usageLimit}
                onChange={(e) => setUsageLimit(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-black font-extrabold uppercase rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow"
            >
              <Save className="w-4 h-4" />
              <span>Create Coupon</span>
            </button>
          </div>
        </form>
      )}

      {/* Coupons Table */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 uppercase font-mono text-[10px] tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-4 px-4 font-bold">Coupon Code</th>
                <th className="py-4 px-4 font-bold">Discount</th>
                <th className="py-4 px-4 font-bold">Min Order</th>
                <th className="py-4 px-4 font-bold">Usage</th>
                <th className="py-4 px-4 font-bold">Expiry Date</th>
                <th className="py-4 px-4 font-bold">Status</th>
                <th className="py-4 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-extrabold text-amber-400 text-sm">
                    {c.code}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-zinc-400">
                    ₹{c.minOrder}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-zinc-300">
                    {c.usedCount} / {c.usageLimit}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-400">
                    {c.expiryDate}
                  </td>

                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleToggleStatus(c)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border cursor-pointer ${
                        c.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
                      }`}
                    >
                      {c.status}
                    </button>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setDeleteTarget(c)}
                      className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Delete Coupon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Promo Coupon"
        message={`Are you sure you want to delete coupon code "${deleteTarget?.code}"?`}
        confirmText="Delete Coupon"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}

    </div>
  );
}
