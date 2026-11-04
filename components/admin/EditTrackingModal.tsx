'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { AdminOrder } from '@/lib/types/admin';

interface EditTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: AdminOrder | null;
  onSave: (trackingNumber: string, courierName: string, trackingUrl: string) => Promise<void> | void;
}

export const EditTrackingModal: React.FC<EditTrackingModalProps> = ({
  isOpen,
  onClose,
  order,
  onSave,
}) => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierName, setCourierName] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (order && isOpen) {
      setTrackingNumber(order.trackingNumber || '');
      setCourierName(order.courierName || '');
      setTrackingUrl(order.labelUrl || '');
      setErrorMsg('');
    }
  }, [order, isOpen]);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAwb = trackingNumber.trim();
    if (!cleanAwb) {
      setErrorMsg('Tracking / AWB Number is required.');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');
    try {
      await onSave(cleanAwb, courierName.trim() || 'BlueDart', trackingUrl.trim());
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update tracking details.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden text-slate-900 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header matching reference image */}
        <div className="pt-6 px-6 pb-2">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-extrabold font-sans uppercase tracking-tight text-slate-900">
                {order.trackingNumber ? 'EDIT TRACKING INFO' : 'ADD TRACKING MANUALLY'}
              </h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Order <span className="font-semibold text-slate-700">#{order.id.replace('#', '')}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1 -mr-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Solid horizontal line below header */}
          <div className="w-full h-[1.5px] bg-slate-900 mt-3" />
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Field 1: Tracking / AWB Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              TRACKING / AWB NUMBER *
            </label>
            <input
              type="text"
              required
              value={trackingNumber}
              onChange={(e) => {
                setTrackingNumber(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder={order.trackingNumber ? "e.g. 16249323805492" : "e.g. 1234567890 or AWB98765"}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all shadow-xs"
            />
          </div>

          {/* Field 2: Courier Partner Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              COURIER PARTNER NAME
            </label>
            <input
              type="text"
              value={courierName}
              onChange={(e) => setCourierName(e.target.value)}
              placeholder="e.g. BlueDart, DTDC, Delhivery, Speed Post"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-sans text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all shadow-xs"
            />
          </div>

          {/* Field 3: Direct Tracking URL (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              DIRECT TRACKING URL (OPTIONAL)
            </label>
            <input
              type="url"
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              placeholder="https://www.bluedart.com/tracking?id=..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-sans text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all shadow-xs"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              Customer can click this link on their order tracking page.
            </p>
          </div>

          {/* Divider above buttons */}
          <div className="w-full h-px bg-slate-200 pt-1" />

          {/* Bottom Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 pb-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer transition-colors shadow-xs"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-lg bg-black hover:bg-slate-800 text-white text-xs font-extrabold uppercase tracking-wider cursor-pointer transition-colors shadow-sm flex items-center gap-1.5"
            >
              {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
              <span>{isSaving ? 'SAVING...' : 'SAVE DETAILS'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

