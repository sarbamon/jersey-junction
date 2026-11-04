'use client';

import React, { useState } from 'react';
import { AlertTriangle, Mail, X, Loader2 } from 'lucide-react';

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void> | void;
  orderId: string;
  customerEmail: string;
  customerName?: string;
  isLoading?: boolean;
}

const COMMON_REASONS = [
  'Customer requested cancellation',
  'Item out of stock / inventory unavailable',
  'Incomplete address or unserviceable pincode',
  'Payment verification failed / unpaid order',
  'Duplicate or test order',
];

export const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  orderId,
  customerEmail,
  customerName,
  isLoading = false,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>(COMMON_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = customReason.trim() || selectedPreset;
    if (!finalReason) {
      setErrorMsg('Please select or enter a cancellation reason.');
      return;
    }
    setErrorMsg('');
    await onConfirm(finalReason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in font-sans">
      <div 
        className="w-full max-w-md bg-[#0d0d0d] border border-red-500/40 rounded-2xl shadow-2xl overflow-hidden text-white space-y-5 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#242424]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-white">
                Cancel Order #{orderId.replace('#', '')}
              </h2>
              <p className="text-xs text-gray-400 font-mono truncate">
                Customer: <span className="text-gray-200">{customerName || 'Customer'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-gray-300 font-bold block mb-2 uppercase text-[11px] tracking-wider">
              Select Reason for Cancellation *
            </label>
            <div className="space-y-1.5">
              {COMMON_REASONS.map((reason) => (
                <button
                  type="button"
                  key={reason}
                  onClick={() => {
                    setSelectedPreset(reason);
                    setCustomReason('');
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                    selectedPreset === reason && !customReason
                      ? 'bg-red-500/15 border-red-500/60 text-white font-bold'
                      : 'bg-black/40 border-[#242424] text-gray-400 hover:text-gray-200 hover:border-gray-700'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Reason Textarea */}
          <div>
            <label className="text-gray-300 font-bold block mb-1 uppercase text-[11px] tracking-wider">
              Or Custom Explanation / Additional Notes
            </label>
            <textarea
              rows={3}
              value={customReason}
              onChange={(e) => {
                setCustomReason(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="e.g. Size L is temporarily unavailable from supplier..."
              className="w-full bg-black/60 border border-[#242424] focus:border-red-500 rounded-xl p-3 text-white placeholder-gray-600 outline-none transition-colors"
            />
          </div>

          {errorMsg && (
            <p className="text-red-400 text-xs font-semibold">{errorMsg}</p>
          )}

          {/* Email Notification Notice */}
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-gray-300 text-xs flex items-start gap-2.5">
            <Mail className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              An automated cancellation email with this reason will be sent to{' '}
              <strong className="text-white font-mono">{customerEmail || 'the customer'}</strong>.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-[#333] hover:bg-[#252525] text-gray-300 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              Keep Order Active
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold uppercase tracking-wider transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Cancelling...</span>
                </>
              ) : (
                <span>Confirm &amp; Send Email</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
