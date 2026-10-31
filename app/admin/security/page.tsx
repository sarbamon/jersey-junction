'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ShieldAlert, 
  Loader2, 
  UserCheck, 
  AlertTriangle 
} from 'lucide-react';
import { authService, AuthUser } from '../../../lib/services/authService';
import { Toast } from '../../../components/admin/Toast';

export default function AdminSecurityPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  // Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    // 1. Verify user is logged in
    if (!authService.isAuthenticated()) {
      router.push('/admin/login');
      return;
    }

    const user = authService.getAdminUser();
    if (!user) {
      router.push('/admin/login');
      return;
    }

    // 2. Strict Role Check: ONLY 'admin' (Master Boss) can view this section
    if (user.role !== 'admin') {
      const allowed = authService.getFirstAllowedRoute();
      router.push(allowed);
      return;
    }

    setCurrentUser(user);
    setIsVerifying(false);
  }, [router]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanNew = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();
    const cleanCurrent = currentPassword.trim();

    if (!cleanNew) {
      setErrorMsg('Please enter your new security password.');
      return;
    }

    if (cleanNew.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (cleanNew !== cleanConfirm) {
      setErrorMsg('New passwords do not match. Please verify and re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.changePassword(
        cleanCurrent ? cleanCurrent : cleanNew,
        cleanCurrent ? cleanNew : undefined
      );

      setSuccessMsg(res.message || 'Master Admin password updated successfully in MongoDB!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setToastMsg('Security password updated successfully!');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans max-w-4xl pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black font-serif uppercase tracking-tight text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
              <span>MASTER ADMIN SECURITY</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-black tracking-wider uppercase">
              CONFIDENTIAL
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Exclusive security control panel for the store owner. Employee staff members have zero access to this section.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-mono font-bold self-start">
          <Lock className="w-3.5 h-3.5" />
          <span>OWNER CLEARANCE ONLY</span>
        </div>
      </div>

      {/* Master Administrator Identity Card */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2 text-amber-400">
            <UserCheck className="w-4 h-4" />
            <h2 className="text-sm font-extrabold font-serif uppercase tracking-wider text-white">
              Active Administrator Profile
            </h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-md bg-amber-400 text-black font-black text-[10px] tracking-wider uppercase">
            MASTER ADMIN
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
              Admin Name
            </span>
            <span className="text-sm font-bold text-white">
              {currentUser?.name || 'Administrator'}
            </span>
          </div>

          <div className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
              Login Email
            </span>
            <span className="text-sm font-mono font-bold text-amber-400 truncate block">
              {currentUser?.email || 'admin@jerseyjunction.com'}
            </span>
          </div>

          <div className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
              Access Level
            </span>
            <span className="text-sm font-mono font-bold text-emerald-400">
              Unrestricted Full Access (All Sections)
            </span>
          </div>
        </div>
      </div>

      {/* Change Master Admin Password Card */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-5 text-xs">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 text-amber-400">
          <KeyRound className="w-4 h-4" />
          <h2 className="text-sm font-extrabold font-serif uppercase tracking-wider text-white">
            Change Master Admin Password
          </h2>
        </div>

        <p className="text-zinc-400 text-xs leading-relaxed">
          Set a new security password for your Master Admin account. When you submit, the new password is immediately encrypted with <code>bcrypt</code> and committed to the MongoDB database.
        </p>

        {successMsg && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-semibold flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs font-semibold flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Current Password (Optional for Boss) */}
            <div>
              <label className="font-bold text-zinc-400 block mb-1.5 uppercase tracking-wide">
                Current Password <span className="text-zinc-600 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Leave blank or enter current"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-white font-mono focus:outline-none focus:border-amber-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3.5 top-2.5 text-zinc-500 hover:text-amber-400 p-0.5 transition-colors cursor-pointer"
                  aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="font-bold text-zinc-400 block mb-1.5 uppercase tracking-wide">
                New Security Password * <span className="text-amber-400 font-mono">(Min 6 chars)</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-white font-mono focus:outline-none focus:border-amber-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-2.5 text-zinc-500 hover:text-amber-400 p-0.5 transition-colors cursor-pointer"
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="font-bold text-zinc-400 block mb-1.5 uppercase tracking-wide">
                Confirm New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-white font-mono focus:outline-none focus:border-amber-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-2.5 text-zinc-500 hover:text-amber-400 p-0.5 transition-colors cursor-pointer"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={isLoading || !newPassword}
              className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-black font-extrabold uppercase rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg tracking-wider"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Saving In Database...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-black" />
                  <span>Update Master Admin Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Security Best Practices & Isolation Notice */}
      <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800/90 text-zinc-400 text-xs space-y-2">
        <div className="flex items-center gap-2 text-zinc-200 font-bold uppercase tracking-wider text-[11px]">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Staff Permission Isolation</span>
        </div>
        <p className="text-[11px] leading-relaxed text-zinc-400">
          This <strong>Admin Security</strong> section is hardcoded to require the <code>admin</code> role. Employees assigned to sections like Products, Orders, Customers, or Store Settings cannot view or navigate to this page, ensuring your master administrative credentials remain completely protected.
        </p>
      </div>

      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}
    </div>
  );
}
