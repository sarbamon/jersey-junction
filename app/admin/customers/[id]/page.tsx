'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Mail, Phone, MapPin, ShoppingBag, DollarSign, Calendar, Eye } from 'lucide-react';
import { customerService } from '../../../../lib/services/customerService';
import { orderService } from '../../../../lib/services/orderService';
import { AdminCustomer, AdminOrder } from '../../../../lib/types/admin';
import { StatusBadge } from '../../../../components/admin/StatusBadge';

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [customer, setCustomer] = useState<AdminCustomer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<AdminOrder[]>([]);

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

  return (
    <div className="space-y-8 font-sans">
      
      {/* Top Header */}
      <div className="flex items-center justify-between bg-zinc-900/90 p-6 rounded-3xl border border-zinc-800 shadow-xl">
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
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  customer.status === 'VIP' ? 'bg-amber-400/10 text-amber-400 border-amber-400/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                }`}>
                  {customer.status}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">Customer ID: {customer.id}</p>
            </div>
          </div>
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

    </div>
  );
}
