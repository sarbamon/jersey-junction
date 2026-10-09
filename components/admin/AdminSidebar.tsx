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

  const handleLogout = () => {
    authService.logout();
    router.push('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Categories', href: '/admin/categories', icon: FolderTree },
    { label: 'Coupons', href: '/admin/coupons', icon: Ticket },
    { label: 'Reviews', href: '/admin/reviews', icon: Star },
    { label: 'Banners CMS', href: '/admin/banners', icon: ImageIcon },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-300 border-r border-zinc-800/80 w-64 select-none font-sans">
      
      {/* Brand Header */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-zinc-800/80">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-serif font-black text-black text-lg shadow-lg group-hover:scale-105 transition-transform">
            JJ
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-extrabold text-sm tracking-wide text-white group-hover:text-amber-400 transition-colors">
              JERSEY JUNCTION
            </span>
            <span className="text-[10px] font-bold text-amber-400/90 tracking-widest uppercase">
              ADMIN PANEL
            </span>
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
          MAIN MENU
        </div>
        
        {navItems.map((item) => {
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
      </nav>

      {/* Logout Footer */}
      <div className="p-4 border-t border-zinc-800/80 space-y-2">
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
