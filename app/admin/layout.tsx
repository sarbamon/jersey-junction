'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { authService } from '../../lib/services/authService';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);

  useEffect(() => {
    // If on /admin/login, bypass auth check
    if (pathname === '/admin/login') {
      setIsAuthorized(true);
      return;
    }

    // Auth guard check
    if (!authService.isAuthenticated()) {
      router.push('/admin/login');
      return;
    }

    const user = authService.getAdminUser();
    if (!user) {
      router.push('/admin/login');
      return;
    }

    // Boss has access to all sections
    if (user.role === 'admin') {
      setIsAuthorized(true);
      setAccessDeniedMessage(null);
      return;
    }

    // Role is Employee: Check granular permissions
    if (user.role === 'employee') {
      // 1. Employees can NEVER access the Employees management section (Boss only)
      if (pathname.startsWith('/admin/employees')) {
        const fallback = authService.getFirstAllowedRoute();
        router.push(fallback);
        return;
      }

      // 2. Check path permission
      const pathPermissionsMap: Record<string, string> = {
        '/admin/products': 'products',
        '/admin/orders': 'orders',
        '/admin/categories': 'categories',
        '/admin/customers': 'customers',
        '/admin/coupons': 'coupons',
        '/admin/reviews': 'reviews',
        '/admin/banners': 'banners',
        '/admin/settings': 'settings',
      };

      // Check if trying to view root /admin (dashboard) without dashboard permission
      if (pathname === '/admin') {
        if (!authService.hasPermission('dashboard')) {
          const fallback = authService.getFirstAllowedRoute();
          if (fallback !== '/admin') {
            router.push(fallback);
            return;
          } else {
            setAccessDeniedMessage('You do not have permission to view the Executive Dashboard.');
            setIsAuthorized(true);
            return;
          }
        }
      }

      // Check specific section prefixes
      for (const [prefix, perm] of Object.entries(pathPermissionsMap)) {
        if (pathname.startsWith(prefix)) {
          if (!authService.hasPermission(perm)) {
            setAccessDeniedMessage(`Access restricted: You do not have permission to view the "${perm.toUpperCase()}" section. Please ask the Administrator.`);
            setIsAuthorized(true);
            return;
          }
        }
      }

      setAccessDeniedMessage(null);
      setIsAuthorized(true);
    }
  }, [pathname, router]);

  // If on login route, render standalone without sidebar/header
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Prevent flicker during auth check
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
          <span>Authorizing Admin Session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex font-sans selection:bg-[#f4c84a] selection:text-black">
      {/* Sidebar Navigation */}
      <AdminSidebar 
        isOpen={isMobileSidebarOpen} 
        onClose={() => setIsMobileSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#09090b]">
        <AdminHeader onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
          {accessDeniedMessage ? (
            <div className="bg-zinc-900/90 border border-amber-400/30 rounded-3xl p-8 max-w-xl mx-auto my-12 text-center space-y-4 shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center mx-auto text-2xl font-bold">
                🔒
              </div>
              <h2 className="text-lg font-black uppercase font-serif text-white">Section Access Restricted</h2>
              <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                {accessDeniedMessage}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => router.push(authService.getFirstAllowedRoute())}
                  className="px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-black font-extrabold uppercase rounded-xl text-xs transition-colors cursor-pointer shadow-lg"
                >
                  Go to My Assigned Workspace
                </button>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
