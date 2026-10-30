'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  FolderTree, 
  Ticket, 
  Star, 
  Image as ImageIcon, 
  Settings, 
  LogOut, 
  X
} from 'lucide-react';
import { authService } from '../../lib/services/authService';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const router = useRouter();

  const currentUser = authService.getAdminUser();
  const isBoss = currentUser?.role === 'admin';

  const handleLogout = () => {
    authService.logout();
    router.push('/admin/login');
  };

  const allNavItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, perm: 'dashboard' },
    { label: 'Products', href: '/admin/products', icon: Package, perm: 'products' },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag, perm: 'orders' },
    { label: 'Customers', href: '/admin/customers', icon: Users, perm: 'customers' },
    { label: 'Categories', href: '/admin/categories', icon: FolderTree, perm: 'categories' },
    { label: 'Coupons', href: '/admin/coupons', icon: Ticket, perm: 'coupons' },
    { label: 'Reviews', href: '/admin/reviews', icon: Star, perm: 'reviews' },
    { label: 'Banners CMS', href: '/admin/banners', icon: ImageIcon, perm: 'banners' },
    { label: 'Settings', href: '/admin/settings', icon: Settings, perm: 'settings' },
  ];

  // Filter items: Boss gets all, employee only gets explicitly permitted sections
  const filteredNavItems = allNavItems.filter((item) => {
    if (isBoss) return true;
    return authService.hasPermission(item.perm);
  });

  const sidebarContent = (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-300 border-r border-zinc-800/80 w-64 select-none font-sans">
      
      {/* Brand Header */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-zinc-800/80">
        <Link href={authService.getFirstAllowedRoute()} className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-serif font-black text-black text-lg shadow-lg group-hover:scale-105 transition-transform">
            JJ
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-extrabold text-sm tracking-wide text-white group-hover:text-amber-400 transition-colors">
              JERSEY JUNCTION
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                isBoss 
                  ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30' 
                  : 'bg-sky-400/20 text-sky-400 border border-sky-400/30'
              }`}>
                {isBoss ? 'ADMIN' : (currentUser?.employeeTitle || 'EMPLOYEE')}
              </span>
            </div>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-zinc-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 scrollbar-thin">
        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-3 mb-2">
          <span>{isBoss ? 'NAVIGATION' : 'MY WORKSPACE'}</span>
        </div>
        
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                isActive 
                  ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20 font-extrabold' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/80'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-zinc-400 group-hover:text-amber-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Employees Section */}
        {isBoss && (
          <div className="pt-4 mt-4 border-t border-zinc-900 space-y-1.5">
            <div className="text-[10px] font-black text-amber-400/80 uppercase tracking-widest px-3 mb-2 flex items-center gap-1.5">
              <span>MANAGEMENT</span>
            </div>
            <Link
              href="/admin/employees"
              onClick={onClose}
              className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                pathname.startsWith('/admin/employees')
                  ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20 font-extrabold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/80'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Employees</span>
            </Link>
          </div>
        )}
      </nav>

      {/* User Info & Logout Footer */}
      <div className="p-4 border-t border-zinc-800/80 space-y-3">
        <div className="px-3 py-2 bg-zinc-900/60 rounded-xl border border-zinc-800/60">
          <div className="text-xs font-bold text-white truncate">{currentUser?.name || 'User'}</div>
          <div className="text-[10px] text-zinc-400 truncate font-mono">{currentUser?.email}</div>
          <div className="text-[9px] font-extrabold text-amber-400/90 mt-1 uppercase tracking-wider">
            {isBoss ? 'Administrator' : (currentUser?.employeeTitle || 'Employee')}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:text-white hover:bg-red-500/20 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-red-400" />
          <span>Sign Out</span>
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block h-screen sticky top-0 shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
          <div className="relative z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
