'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  UserPlus,
  Sparkles,
  CheckCheck,
  RotateCw,
  BellOff
} from 'lucide-react';
import { GlobalSearch } from './GlobalSearch';
import { authService } from '../../lib/services/authService';
import { notificationService, AdminNotificationItem } from '../../lib/services/notificationService';

interface AdminHeaderProps {
  onOpenMobileSidebar?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onOpenMobileSidebar }) => {
  const router = useRouter();
  const currentUser = authService.getCurrentUser();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);
  const [isLoadingNotifs, setIsLoadingNotifs] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Load real notifications from backend orders, products, and users
  const loadRealNotifications = async () => {
    setIsLoadingNotifs(true);
    try {
      const items = await notificationService.getRealNotifications();
      setNotifications(items);
    } catch (err) {
      console.error('Failed to load admin notifications:', err);
    } finally {
      setIsLoadingNotifs(false);
    }
  };

  useEffect(() => {
    loadRealNotifications();

    // Poll every 30 seconds for live new orders or alerts
    const interval = setInterval(loadRealNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    const allIds = notifications.map((n) => n.id);
    notificationService.markAllAsRead(allIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = (item: AdminNotificationItem) => {
    notificationService.markAsRead(item.id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
    );
    setIsNotifOpen(false);
    if (item.link) {
      router.push(item.link);
    }
  };

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
          className="lg:hidden p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer"
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

        {/* Real Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsProfileOpen(false);
              if (!isNotifOpen) {
                loadRealNotifications();
              }
            }}
            className="p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-900 border border-zinc-800 relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400" />
              </>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 top-full mt-2 w-84 sm:w-96 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl z-50 p-3 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-900 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-white">Notifications</span>
                  {unreadCount > 0 ? (
                    <span className="text-[10px] bg-amber-400/10 text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded font-mono font-bold">
                      {unreadCount} NEW
                    </span>
                  ) : (
                    <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono">
                      ALL READ
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      title="Mark all as read"
                      className="text-[10px] text-zinc-400 hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Mark read</span>
                    </button>
                  )}
                  <button
                    onClick={loadRealNotifications}
                    title="Refresh live notifications"
                    disabled={isLoadingNotifs}
                    className="p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${isLoadingNotifs ? 'animate-spin text-amber-400' : ''}`} />
                  </button>
                </div>
              </div>
              
              {/* Notification Items List */}
              <div className="space-y-1.5 max-h-80 overflow-y-auto pr-0.5">
                {isLoadingNotifs && notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
                    <RotateCw className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Syncing notifications from database...</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-8 text-center text-zinc-500 space-y-1">
                    <BellOff className="w-6 h-6 mx-auto text-zinc-600 mb-1" />
                    <p className="text-xs font-semibold text-zinc-400">No Notifications</p>
                    <p className="text-[10px] text-zinc-600">All orders, customer signups, and stock levels are clear.</p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    let Icon = ShoppingBag;
                    if (n.iconType === 'stock') Icon = AlertTriangle;
                    if (n.iconType === 'customer') Icon = UserPlus;
                    if (n.iconType === 'custom') Icon = Sparkles;

                    return (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-2.5 rounded-xl border flex gap-3 items-start cursor-pointer transition-all ${
                          !n.isRead
                            ? 'bg-zinc-900/90 border-amber-500/30 hover:border-amber-400 hover:bg-zinc-800'
                            : 'bg-zinc-950 border-zinc-900 hover:border-zinc-800 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 border ${n.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5 text-xs flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-white truncate leading-tight">{n.title}</span>
                            {!n.isRead && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-400 leading-snug line-clamp-2">{n.desc}</div>
                          <div className="text-[9px] text-zinc-500 font-mono pt-1 flex items-center justify-between">
                            <span>{n.time}</span>
                            <span className="text-[9px] text-amber-400/80 hover:text-amber-400 font-sans">View →</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
            className="flex items-center gap-2 p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-400/50 transition-all cursor-pointer"
          >
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-black font-serif font-extrabold text-xs flex items-center justify-center">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'M'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-white leading-none">
                {currentUser?.name || 'Master Admin'}
              </span>
              <span className="text-[9px] font-mono text-amber-400 leading-tight">Superuser</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 ml-1" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl z-50 p-2 space-y-1">
              <div className="p-3 bg-zinc-900/80 rounded-xl space-y-1">
                <div className="text-xs font-bold text-white">{currentUser?.name || 'Master Administrator'}</div>
                <div className="text-[10px] text-zinc-400 font-mono">{currentUser?.email || 'admin@jerseyspot.com'}</div>
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
