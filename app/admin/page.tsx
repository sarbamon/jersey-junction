'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  ArrowUpRight, 
  Eye, 
  Plus
} from 'lucide-react';
import { StatCard } from '../../components/admin/StatCard';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { productService } from '../../lib/services/productService';
import { orderService } from '../../lib/services/orderService';
import { customerService } from '../../lib/services/customerService';
import { AdminProduct, AdminOrder, AdminCustomer } from '../../lib/types/admin';

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);

  useEffect(() => {
    Promise.all([
      productService.getAdminProducts(),
      orderService.fetchOrdersAsync(),
      customerService.getCustomers(),
    ])
      .then(([prods, ords, custs]) => {
        setProducts(prods);
        setOrders(ords);
        setCustomers(custs);
      })
      .catch(console.error);
  }, []);

  // Real Database Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalOrdersCount = orders.length;
  const totalProductsCount = products.length;
  const totalCustomersCount = customers.length;

  // Real Date-based Sales Calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const todayOrdersList = orders.filter((o) => o.date === todayStr);
  const todayRevenue = todayOrdersList.reduce((sum, o) => sum + (o.totalAmount || 0), 0);


  const currentMonthPrefix = new Date().toISOString().substring(0, 7); // e.g. "2026-10"
  const monthOrdersList = orders.filter((o) => o.date && o.date.startsWith(currentMonthPrefix));
  const monthRevenue = monthOrdersList.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // Low stock products filter (stock <= 10)
  const lowStockProducts = products.filter(p => p.stock <= 10);
  
  // Top selling products
  const topSellingProducts = [...products].sort((a, b) => b.totalSold - a.totalSold).slice(0, 4);

  // Real monthly sales breakdown calculated from MongoDB orders
  const monthsList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();
  const currentMonthIndex = new Date().getMonth();

  const salesByMonth = monthsList.slice(0, currentMonthIndex + 1).map((mName, idx) => {
    const monthNumStr = String(idx + 1).padStart(2, '0');
    const monthPrefix = `${currentYear}-${monthNumStr}`;
    const monthlyRev = orders
      .filter((o) => o.date && o.date.startsWith(monthPrefix))
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    return { month: mName, revenue: monthlyRev };
  });

  const maxMonthlyRevenue = Math.max(...salesByMonth.map(m => m.revenue), 1);

  return (
    <div className="space-y-8 font-sans">
      
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 p-6 rounded-3xl border border-zinc-800 shadow-xl">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black font-serif uppercase tracking-tight text-white">
            STORE EXECUTIVE DASHBOARD
          </h1>
          <p className="text-xs text-zinc-400">
            Real-time revenue telemetry, live inventory counts, and order status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/add"
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-black font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* 4 Core Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          subtitle={`${orders.length} paid orders`}
          icon={DollarSign}
        />

        <StatCard
          title="Total Orders"
          value={`${totalOrdersCount} Orders`}
          subtitle={`${monthOrdersList.length} orders this month`}
          icon={ShoppingBag}
        />

        <StatCard
          title="Total Products"
          value={`${totalProductsCount} Items`}
          subtitle={`${lowStockProducts.length} low stock alerts`}
          icon={Package}
        />

        <StatCard
          title="Total Customers"
          value={`${totalCustomersCount.toLocaleString('en-IN')}`}
          subtitle="Registered database users"
          icon={Users}
        />
      </div>

      {/* Sales Period Breakdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-zinc-400 font-mono">TODAY&apos;S SALES</span>
            <div className="text-xl font-mono font-black text-amber-400">₹{todayRevenue.toLocaleString('en-IN')}</div>
          </div>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 font-bold font-mono">
            {todayOrdersList.length} Order(s) Today
          </span>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-zinc-400 font-mono">THIS MONTH&apos;S SALES</span>
            <div className="text-xl font-mono font-black text-amber-400">₹{monthRevenue.toLocaleString('en-IN')}</div>
          </div>
          <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/20 font-bold font-mono">
            {monthOrdersList.length} Order(s) Month
          </span>
        </div>
      </div>

      {/* Sales Overview Chart Section */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-4">
          <div>
            <h2 className="text-lg font-black font-serif uppercase tracking-tight text-white">
              Sales Revenue Overview ({salesByMonth[0]?.month} - {salesByMonth[salesByMonth.length - 1]?.month})
            </h2>
            <p className="text-xs text-zinc-400">Real monthly cumulative store revenue in INR (₹)</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-xl border border-amber-400/20">
            <TrendingUp className="w-4 h-4" />
            <span>Peak Month: ₹{maxMonthlyRevenue.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Custom Bar Chart Visualizer */}
        <div className="h-64 flex items-end justify-between gap-2 pt-8 pb-2 px-2">
          {salesByMonth.map((item) => {
            const heightPercent = maxMonthlyRevenue > 0 ? Math.max(Math.round((item.revenue / maxMonthlyRevenue) * 100), 4) : 4;
            return (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono font-bold bg-amber-400 text-black px-1.5 py-0.5 rounded shadow whitespace-nowrap mb-1">
                  ₹{item.revenue.toLocaleString('en-IN')}
                </div>

                {/* Bar */}
                <div 
                  style={{ height: `${heightPercent}%` }}
                  className="w-full max-w-[36px] bg-gradient-to-t from-amber-600 via-amber-400 to-amber-300 rounded-t-lg group-hover:from-amber-400 group-hover:to-amber-200 transition-all duration-300 shadow-lg"
                />

                {/* Label */}
                <span className="text-[11px] font-mono font-bold text-zinc-400 group-hover:text-white uppercase">
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Recent Orders & Sidebar Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Recent Orders */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black font-serif uppercase tracking-tight text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <span>Recent Customer Orders</span>
            </h2>
            <Link href="/admin/orders" className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1">
              <span>View All Orders ({orders.length})</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-950 text-zinc-400 uppercase font-mono text-[10px] tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">Order ID</th>
                    <th className="py-3.5 px-4 font-bold">Customer</th>
                    <th className="py-3.5 px-4 font-bold">Amount</th>
                    <th className="py-3.5 px-4 font-bold">Payment</th>
                    <th className="py-3.5 px-4 font-bold">Status</th>
                    <th className="py-3.5 px-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-medium">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-zinc-500 text-xs">
                        No orders recorded yet. Completed checkout orders will appear here automatically.
                      </td>
                    </tr>
                  ) : (
                    orders.slice(0, 5).map((o) => (
                      <tr key={o.id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-extrabold text-amber-400">
                          {o.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white">{o.customerName}</div>
                          <div className="text-[10px] text-zinc-500">{o.email}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-white">
                          ₹{o.totalAmount}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={o.paymentStatus} type="payment" />
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={o.orderStatus} type="order" />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/admin/orders/${o.id.replace('#', '')}`}
                            className="px-3 py-1.5 bg-zinc-800 hover:bg-amber-400 hover:text-black rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
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

        {/* Right Col: Top Products & Low Stock Alerts */}
        <div className="space-y-6">
          
          {/* Top Selling Products */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-extrabold font-serif uppercase tracking-wider text-white">
                Catalog Highlights
              </h3>
              <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">Real Stock</span>
            </div>

            <div className="space-y-3">
              {topSellingProducts.length === 0 ? (
                <div className="text-xs text-zinc-500 text-center py-4">No catalog products found in database.</div>
              ) : (
                topSellingProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-3 text-xs">
                    <div className="truncate">
                      <Link href={`/admin/products/${p.id}`} className="font-bold text-white hover:text-amber-400 truncate block">
                        {p.name}
                      </Link>
                      <span className="text-[10px] text-zinc-400">{p.category}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-amber-400 block">₹{p.price}</span>
                      <span className="text-[10px] font-mono text-zinc-500">{p.stock} in stock</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-zinc-900/90 border border-amber-500/30 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <h3 className="text-sm font-extrabold font-serif uppercase tracking-wider text-white">
                Low Stock Inventory Alerts
              </h3>
            </div>

            <div className="space-y-3">
              {lowStockProducts.length === 0 ? (
                <div className="text-xs text-zinc-500 text-center py-2">All product stock levels healthy.</div>
              ) : (
                lowStockProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-medium text-zinc-300 truncate">{p.name}</span>
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 font-mono font-bold rounded-md shrink-0">
                      {p.stock} left
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
