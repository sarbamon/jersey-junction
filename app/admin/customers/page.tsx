'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Users, Eye, CheckSquare } from 'lucide-react';
import { customerService } from '../../../lib/services/customerService';
import { AdminCustomer } from '../../../lib/types/admin';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    customerService.getCustomers().then(setCustomers);
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery) ||
    c.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isAllSelected = filteredCustomers.length > 0 && filteredCustomers.every(c => selectedIds.includes(c.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCustomers.map(c => c.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/90 p-6 rounded-3xl border border-zinc-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>CUSTOMER ACCOUNTS DIRECTORY</span>
          </div>
          <h1 className="text-2xl font-black font-serif uppercase tracking-tight text-white">
            CUSTOMERS ({filteredCustomers.length})
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

      {/* Bulk Action Toolbar */}
      {selectedIds.length > 0 && (
        <div className="bg-amber-400/10 border border-amber-400/30 p-4 rounded-2xl flex items-center justify-between text-xs font-bold">
          <div className="text-amber-400 flex items-center gap-2 font-mono">
            <CheckSquare className="w-4 h-4" />
            <span>SELECTED {selectedIds.length} OF {filteredCustomers.length} CUSTOMERS</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg cursor-pointer"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Customers Table */}
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
                    title="Select All Customers"
                    className="w-4 h-4 rounded accent-amber-400 cursor-pointer"
                  />
                </th>
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
                  <td colSpan={9} className="py-12 text-center text-zinc-500 text-xs">
                    No customer accounts found matching search term.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const isSelected = selectedIds.includes(c.id);
                  return (
                    <tr
                      key={c.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-amber-400/5' : 'hover:bg-zinc-800/40'
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(c.id)}
                          className="w-4 h-4 rounded accent-amber-400 cursor-pointer"
                        />
                      </td>

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
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          c.status === 'VIP' 
                            ? 'bg-amber-400/10 text-amber-400 border-amber-400/30' 
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}>
                          {c.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/customers/${c.id}`}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-amber-400 hover:text-black rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Profile</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
