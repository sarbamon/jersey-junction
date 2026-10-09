'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Package, ShoppingBag, User, X } from 'lucide-react';
import { productService } from '../../lib/services/productService';
import { orderService } from '../../lib/services/orderService';
import { customerService } from '../../lib/services/customerService';
import { AdminProduct, AdminOrder, AdminCustomer } from '../../lib/types/admin';

export const GlobalSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  const [matchedProducts, setMatchedProducts] = useState<AdminProduct[]>([]);
  const [matchedOrders, setMatchedOrders] = useState<AdminOrder[]>([]);
  const [matchedCustomers, setMatchedCustomers] = useState<AdminCustomer[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setMatchedProducts([]);
      setMatchedOrders([]);
      setMatchedCustomers([]);
      return;
    }

    const q = query.toLowerCase();

    let isMounted = true;
    productService.getAdminProducts().then((allProds) => {
      if (!isMounted) return;
      const prods = allProds.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      ).slice(0, 3);
      setMatchedProducts(prods);
    }).catch(console.error);

    const ords = orderService.getOrders().filter(o => 
      o.id.toLowerCase().includes(q) || 
      o.customerName.toLowerCase().includes(q) ||
      o.email.toLowerCase().includes(q) ||
      o.phone.includes(q)
    ).slice(0, 3);

    const custs = customerService.getCustomersSync().filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q)
    ).slice(0, 3);

    setMatchedOrders(ords);
    setMatchedCustomers(custs);

    return () => {
      isMounted = false;
    };
  }, [query]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalResults = matchedProducts.length + matchedOrders.length + matchedCustomers.length;

  return (
    <div ref={dropdownRef} className="relative max-w-md w-full font-sans">
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3 pointer-events-none" />
        <input
          type="text"
          placeholder="Global Search (Products, Orders #JJ1001, Customers)..."
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-10 py-2 text-xs font-medium text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
        />
        {query && (
          <button 
            onClick={() => { setQuery(''); setIsOpen(false); }}
            className="absolute right-3 top-2.5 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && query.trim() !== '' && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-zinc-900">
          
          {totalResults === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-500 font-medium">
              No matching products, orders, or customers found for &quot;{query}&quot;
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto p-2 space-y-3">
              
              {/* Products Section */}
              {matchedProducts.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider px-3 py-1 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    <span>Products</span>
                  </div>
                  <div className="space-y-1">
                    {matchedProducts.map((p) => (
                      <Link
                        key={p.id}
                        href={`/admin/products/${p.id}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-900 transition-colors text-xs group"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="font-bold text-white group-hover:text-amber-400 truncate">{p.name}</span>
                          <span className="text-[10px] font-mono text-zinc-500">{p.sku}</span>
                        </div>
                        <span className="font-extrabold text-amber-400 font-mono">₹{p.price}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Orders Section */}
              {matchedOrders.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider px-3 py-1 flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Orders</span>
                  </div>
                  <div className="space-y-1">
                    {matchedOrders.map((o) => (
                      <Link
                        key={o.id}
                        href={`/admin/orders/${o.id.replace('#', '')}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-900 transition-colors text-xs group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-400">{o.id}</span>
                          <span className="text-zinc-300 font-medium">{o.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="text-zinc-400 font-mono">₹{o.totalAmount}</span>
                          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold">{o.orderStatus}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Customers Section */}
              {matchedCustomers.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider px-3 py-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Customers</span>
                  </div>
                  <div className="space-y-1">
                    {matchedCustomers.map((c) => (
                      <Link
                        key={c.id}
                        href={`/admin/customers/${c.id}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-900 transition-colors text-xs group"
                      >
                        <div>
                          <span className="font-bold text-white group-hover:text-amber-400">{c.name}</span>
                          <span className="text-[10px] text-zinc-500 block">{c.email}</span>
                        </div>
                        <span className="text-[10px] font-mono text-amber-400 font-bold">₹{c.totalSpent} spent</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      )}
    </div>
  );
};
