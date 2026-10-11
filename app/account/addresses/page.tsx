'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit, Trash2, Check, X, Save, Star } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';

export interface SavedAddress {
  id: string;
  name: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

const ADDRESSES_STORAGE_KEY = 'jj_customer_addresses';

export default function AddressesPage() {
  const { currentUser } = useStore();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<SavedAddress | null>(null);

  // New Address Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (currentUser) {
      try {
        const stored = localStorage.getItem(ADDRESSES_STORAGE_KEY);
        if (stored) {
          setAddresses(JSON.parse(stored));
        } else {
          setAddresses([]);
        }
      } catch (e) {}
    }
  }, [currentUser]);

  const saveAddressesToStorage = (updated: SavedAddress[]) => {
    setAddresses(updated);
    try {
      localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(updated));
      const def = updated.find(a => a.isDefault) || updated[0];
      if (def) {
        localStorage.setItem('jj_last_address', JSON.stringify(def));
      }
    } catch (e) {}
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !addressLine || !city || !pincode) return;

    let updated = [...addresses];
    if (isDefault || updated.length === 0) {
      updated = updated.map(a => ({ ...a, isDefault: false }));
    }

    const newAddr: SavedAddress = {
      id: `addr-${Date.now()}`,
      name,
      phone: phone || '+91 98765 43210',
      addressLine,
      city,
      state,
      pincode,
      isDefault: isDefault || updated.length === 0
    };

    updated.push(newAddr);
    saveAddressesToStorage(updated);

    // Reset Form
    setName('');
    setPhone('');
    setAddressLine('');
    setCity('');
    setState('');
    setPincode('');
    setIsDefault(false);
    setIsAddOpen(false);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;

    let updated = [...addresses];
    if (editTarget.isDefault) {
      updated = updated.map(a => ({ ...a, isDefault: false }));
    }

    updated = updated.map(a => a.id === editTarget.id ? editTarget : a);
    saveAddressesToStorage(updated);
    setEditTarget(null);
  };

  const handleDelete = (id: string) => {
    const filtered = addresses.filter(a => a.id !== id);
    if (filtered.length > 0 && !filtered.some(a => a.isDefault)) {
      filtered[0].isDefault = true;
    }
    saveAddressesToStorage(filtered);
  };

  const handleSetDefault = (id: string) => {
    const updated = addresses.map(a => ({ ...a, isDefault: a.id === id }));
    saveAddressesToStorage(updated);
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="border-b border-[#242424] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-serif uppercase tracking-tight text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-[#f4c84a]" />
            <span>SAVED ADDRESSES ({addresses.length})</span>
          </h1>
          <p className="text-xs text-gray-400">Manage delivery locations and default shipping addresses</p>
        </div>

        <button
          onClick={() => { setIsAddOpen(!isAddOpen); setEditTarget(null); }}
          className="px-4 py-2.5 bg-[#f4c84a] hover:bg-[#e0b438] text-black font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer uppercase tracking-wider"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Add Address Form */}
      {isAddOpen && (
        <form onSubmit={handleCreate} className="bg-[#0d0d0d] border border-[#f4c84a]/40 rounded-2xl p-6 space-y-4 text-xs animate-fade-in">
          <div className="flex items-center justify-between border-b border-[#222] pb-3">
            <h3 className="font-serif font-bold uppercase text-[#f4c84a] text-sm">ADD NEW DELIVERY ADDRESS</h3>
            <button onClick={() => setIsAddOpen(false)} type="button" className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-gray-400 block mb-1 uppercase">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aarav Sharma"
                className="w-full bg-black border border-[#333] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#f4c84a]"
              />
            </div>

            <div>
              <label className="font-bold text-gray-400 block mb-1 uppercase">Phone Number *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-black border border-[#333] rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-[#f4c84a]"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-400 block mb-1 uppercase">House / Street / Area *</label>
            <input
              type="text"
              required
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              placeholder="Flat 402, Golden Heights, Indiranagar"
              className="w-full bg-black border border-[#333] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#f4c84a]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-gray-400 block mb-1 uppercase">City *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Bengaluru"
                className="w-full bg-black border border-[#333] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#f4c84a]"
              />
            </div>

            <div>
              <label className="font-bold text-gray-400 block mb-1 uppercase">State *</label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Karnataka"
                className="w-full bg-black border border-[#333] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#f4c84a]"
              />
            </div>

            <div>
              <label className="font-bold text-gray-400 block mb-1 uppercase">PIN Code *</label>
              <input
                type="text"
                required
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="560038"
                className="w-full bg-black border border-[#333] rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-[#f4c84a]"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 rounded accent-[#f4c84a]"
            />
            <span className="font-bold text-white uppercase text-xs">Set as Default Delivery Address</span>
          </label>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#f4c84a] hover:bg-[#e0b438] text-black font-extrabold uppercase rounded-xl text-xs flex items-center gap-2 shadow cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Address</span>
            </button>
          </div>
        </form>
      )}

      {/* Edit Address Form */}
      {editTarget && (
        <form onSubmit={handleUpdate} className="bg-[#0d0d0d] border border-[#f4c84a]/40 rounded-2xl p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-[#222] pb-3">
            <h3 className="font-serif font-bold uppercase text-[#f4c84a] text-sm">EDIT ADDRESS</h3>
            <button onClick={() => setEditTarget(null)} type="button" className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-gray-400 block mb-1 uppercase">Full Name</label>
              <input
                type="text"
                required
                value={editTarget.name}
                onChange={(e) => setEditTarget({ ...editTarget, name: e.target.value })}
                className="w-full bg-black border border-[#333] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#f4c84a]"
              />
            </div>

            <div>
              <label className="font-bold text-gray-400 block mb-1 uppercase">Phone</label>
              <input
                type="text"
                required
                value={editTarget.phone}
                onChange={(e) => setEditTarget({ ...editTarget, phone: e.target.value })}
                className="w-full bg-black border border-[#333] rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-[#f4c84a]"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-400 block mb-1 uppercase">House / Street / Area</label>
            <input
              type="text"
              required
              value={editTarget.addressLine}
              onChange={(e) => setEditTarget({ ...editTarget, addressLine: e.target.value })}
              className="w-full bg-black border border-[#333] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#f4c84a]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-gray-400 block mb-1 uppercase">City</label>
              <input
                type="text"
                required
                value={editTarget.city}
                onChange={(e) => setEditTarget({ ...editTarget, city: e.target.value })}
                className="w-full bg-black border border-[#333] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#f4c84a]"
              />
            </div>

            <div>
              <label className="font-bold text-gray-400 block mb-1 uppercase">State</label>
              <input
                type="text"
                required
                value={editTarget.state}
                onChange={(e) => setEditTarget({ ...editTarget, state: e.target.value })}
                className="w-full bg-black border border-[#333] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#f4c84a]"
              />
            </div>

            <div>
              <label className="font-bold text-gray-400 block mb-1 uppercase">PIN Code</label>
              <input
                type="text"
                required
                value={editTarget.pincode}
                onChange={(e) => setEditTarget({ ...editTarget, pincode: e.target.value })}
                className="w-full bg-black border border-[#333] rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-[#f4c84a]"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={editTarget.isDefault}
              onChange={(e) => setEditTarget({ ...editTarget, isDefault: e.target.checked })}
              className="w-4 h-4 rounded accent-[#f4c84a]"
            />
            <span className="font-bold text-white uppercase text-xs">Set as Default Address</span>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditTarget(null)}
              className="px-4 py-2 bg-[#222] hover:bg-[#333] text-gray-300 rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#f4c84a] text-black font-extrabold uppercase rounded-xl flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Update Address</span>
            </button>
          </div>
        </form>
      )}

      {/* Saved Addresses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((a) => (
          <div key={a.id} className="bg-[#0d0d0d] border border-[#242424] rounded-2xl p-5 space-y-3 relative flex flex-col justify-between">
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="font-bold text-white text-sm">{a.name}</div>
                {a.isDefault && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#f4c84a]/10 text-[#f4c84a] border border-[#f4c84a]/30 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-[#f4c84a]" />
                    <span>DEFAULT</span>
                  </span>
                )}
              </div>

              <div className="text-gray-300 space-y-0.5 leading-relaxed">
                <div>{a.addressLine}</div>
                <div>{a.city}, {a.state} - <strong className="font-mono text-white">{a.pincode}</strong></div>
                <div className="font-mono text-gray-400 pt-1">Phone: {a.phone}</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#222] text-xs font-bold">
              {!a.isDefault ? (
                <button
                  onClick={() => handleSetDefault(a.id)}
                  className="text-gray-400 hover:text-[#f4c84a] text-[11px] underline cursor-pointer"
                >
                  Set as Default
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditTarget(a)}
                  className="p-1.5 text-gray-400 hover:text-[#f4c84a] rounded"
                  title="Edit Address"
                >
                  <Edit className="w-4 h-4" />
                </button>

                {addresses.length > 1 && (
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="p-1.5 text-gray-400 hover:text-red-400 rounded"
                    title="Delete Address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
