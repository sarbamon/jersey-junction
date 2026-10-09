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

  useEffect(() => {
    // If on /admin/login, bypass auth check
    if (pathname === '/admin/login') {
      setIsAuthorized(true);
      return;
    }

    // Auth guard check
    if (!authService.isAuthenticated()) {
      router.push('/admin/login');
    } else {
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
          {children}
        </main>
      </div>
    </div>
  );
}
