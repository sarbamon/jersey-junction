'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Edit, Save, CheckCircle2, Lock, ShieldAlert, KeyRound } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { authService } from '../../../lib/services/authService';

export default function ProfilePage() {
  const { currentUser, loginUser } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setPhone(currentUser.phone || '+91 98765 43210');
    }
  }, [currentUser]);

  if (!currentUser) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...currentUser,
      name,
      phone
    };
    loginUser(updated);
    setIsEditing(false);
    setToastMsg('Profile details updated successfully!');
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword) {
      setPasswordError('Please provide both your current and new password.');
      return;
    }

    if (newPassword.trim().length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword.trim() !== confirmPassword.trim()) {
      setPasswordError('New passwords do not match. Please re-enter.');
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await authService.changePassword(currentPassword, newPassword);
      setPasswordSuccess(res.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setIsChangingPassword(false);
        setPasswordSuccess('');
      }, 2500);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="border-b border-[#242424] pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-serif uppercase tracking-tight text-white flex items-center gap-2">
            <User className="w-6 h-6 text-[#f4c84a]" />
            <span>PROFILE INFORMATION</span>
          </h1>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#f4c84a] hover:text-black text-gray-200 border border-[#333] rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Form or Display Card */}
      <div className="bg-[#0d0d0d] border border-[#242424] rounded-2xl p-6 sm:p-8 space-y-6 max-w-2xl">
        
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-gray-400 block mb-1 uppercase">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black border border-[#333] rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-[#f4c84a]"
              />
            </div>

            <div>
              <label className="font-bold text-gray-400 block mb-1 uppercase">Email Address (Read-Only)</label>
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full bg-[#121212] border border-[#222] rounded-xl px-4 py-3 text-gray-500 font-mono text-xs cursor-not-allowed"
              />
            </div>

            <div>
              <label className="font-bold text-gray-400 block mb-1 uppercase">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-black border border-[#333] rounded-xl px-4 py-3 text-white font-mono font-bold focus:outline-none focus:border-[#f4c84a]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-3 bg-[#f4c84a] hover:bg-[#e0b438] text-black font-extrabold uppercase rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-[#222]">
              <span className="text-gray-400 font-bold uppercase">Full Name</span>
              <span className="text-white font-extrabold text-sm">{currentUser.name}</span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-[#222]">
              <span className="text-gray-400 font-bold uppercase">Email Address</span>
              <span className="text-gray-300 font-mono">{currentUser.email}</span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-[#222]">
              <span className="text-gray-400 font-bold uppercase">Phone Number</span>
              <span className="text-gray-300 font-mono">{currentUser.phone || '+91 98765 43210'}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-bold uppercase">Account Role</span>
              <span className="text-[#f4c84a] font-mono font-bold uppercase bg-[#f4c84a]/10 px-2.5 py-0.5 rounded border border-[#f4c84a]/30">
                {currentUser.role}
              </span>
            </div>
          </div>
        )}

      </div>

      {/* Account Security & Change Password Card */}
      <div className="bg-[#0d0d0d] border border-[#242424] rounded-2xl p-6 sm:p-8 space-y-6 max-w-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#222]">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[#f4c84a]" />
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">Account Password & Security</h2>
          </div>
          {!isChangingPassword && (
            <button
              onClick={() => {
                setIsChangingPassword(true);
                setPasswordError('');
                setPasswordSuccess('');
              }}
              className="px-3.5 py-1.5 bg-[#1a1a1a] hover:bg-[#f4c84a] hover:text-black text-gray-200 border border-[#333] rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Change Password
            </button>
          )}
        </div>

        {passwordSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        {isChangingPassword ? (
          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-gray-400 block mb-1 uppercase">Current Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-black border border-[#333] rounded-xl pl-10 pr-4 py-3 text-white font-mono focus:outline-none focus:border-[#f4c84a]"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-400 block mb-1 uppercase">New Password * (Min 6 characters)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="Enter new secure password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-black border border-[#333] rounded-xl pl-10 pr-4 py-3 text-white font-mono focus:outline-none focus:border-[#f4c84a]"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-400 block mb-1 uppercase">Confirm New Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-black border border-[#333] rounded-xl pl-10 pr-4 py-3 text-white font-mono focus:outline-none focus:border-[#f4c84a]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSavingPassword}
                className="px-6 py-3 bg-[#f4c84a] hover:bg-[#e0b438] text-black font-extrabold uppercase rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingPassword ? 'Updating Password...' : 'Update Password'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordError('');
                  setPasswordSuccess('');
                }}
                className="px-4 py-3 bg-transparent hover:bg-zinc-900 text-gray-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <p className="text-xs text-gray-400">
            Keep your account secure by using a strong password with a combination of letters, numbers, and symbols.
          </p>
        )}
      </div>

    </div>
  );
}
