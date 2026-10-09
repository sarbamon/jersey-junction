'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Menu, 
  Bell, 
  ExternalLink, 
  LogOut, 
  ChevronDown, 
  ShieldCheck, 
  ShoppingBag, 
  AlertTriangle, 
  Star, 
  Check
} from 'lucide-react';
import { GlobalSearch } from './GlobalSearch';
import { authService } from '../../lib/services/authService';

interface AdminHeaderProps {
  onOpenMobileSidebar?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onOpenMobileSidebar }) => {
  const router = useRouter();
  const currentUser = authService.getCurrentUser();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'New Order #JJ1004 Received',
      desc: 'Priya Verma placed a new Cash on Delivery order (₹1,298)',
      time: '10m ago',
      icon: ShoppingBag,
      color: 'text-emerald-400 bg-emerald-500/10'
    },
    {
      id: 2,
      title: 'Low Stock Alert',
      desc: 'MANCHESTER UNITED AWAY 24/25 has only 3 units left in stock',
      time: '1h ago',
      icon: AlertTriangle,
      color: 'text-amber-400 bg-amber-500/10'
    },
    {
      id: 3,
      title: 'New Review Posted',
      desc: 'Deepak Rao rated Team India T20 Cricket Kit 5 stars',
      time: '2h ago',
      icon: Star,
      color: 'text-blue-400 bg-blue-500/10'
    }
  ];

  const handleLogout = () => {
    authService.logout();
    router.push('/admin/login');
  };

  return (
    <header className="h-16 lg:h-20 bg-zinc-950 border-b border-zinc-800/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 font-sans">
      
      {/* Mobile Menu & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-900 border border-zinc-800"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <GlobalSearch />
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        
        {/* Storefront Link Button */}
        <Link
          href="/"
          target="_blank"
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 hover:bg-amber-400/20 text-xs font-bold transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>View Store</span>
        </Link>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
            className="p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-900 border border-zinc-800 relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400" />
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl z-50 p-3 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-900 px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-white">Notifications</span>
                <span className="text-[10px] bg-amber-400/10 text-amber-400 px-2 py-0.5 rounded font-mono font-bold">3 NEW</span>
              </div>
              
              <div className="space-y-1.5 max-h-72 overflow-y-auto">
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div key={n.id} className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex gap-3 items-start">
                      <div className={`p-2 rounded-lg shrink-0 ${n.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5 text-xs">
                        <div className="font-bold text-white leading-tight">{n.title}</div>
                        <div className="text-[11px] text-zinc-400 leading-snug">{n.desc}</div>
                        <div className="text-[9px] text-zinc-500 font-mono pt-1">{n.time}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
            className="flex items-center gap-2 p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-400/50 transition-all cursor-pointer"
          >
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-black font-serif font-extrabold text-xs flex items-center justify-center">
              M
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-white leading-none">Master Admin</span>
              <span className="text-[9px] font-mono text-amber-400 leading-tight">Superuser</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 ml-1" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl z-50 p-2 space-y-1">
              <div className="p-3 bg-zinc-900/80 rounded-xl space-y-1">
                <div className="text-xs font-bold text-white">Master Administrator</div>
                <div className="text-[10px] text-zinc-400 font-mono">admin@jerseyspot.com</div>
              </div>

              <Link
                href="/admin/settings"
                onClick={() => setIsProfileOpen(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-zinc-300 hover:text-amber-400 hover:bg-zinc-900 rounded-xl transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Store Settings</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

      </div>

    </header>
  );
};
