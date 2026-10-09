'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Edit, Save, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';

export default function ProfilePage() {
  const { currentUser, loginUser } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [toastMsg, setToastMsg] = useState('');

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

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="border-b border-[#242424] pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-serif uppercase tracking-tight text-white flex items-center gap-2">
            <User className="w-6 h-6 text-[#f4c84a]" />
            <span>PROFILE INFORMATION</span>
          </h1>
          <p className="text-xs text-gray-400">View and update your personal account information</p>
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

    </div>
  );
}
