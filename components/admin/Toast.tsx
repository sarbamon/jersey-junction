'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in font-sans">
      <div className={`px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 text-xs font-bold ${
        type === 'success' 
          ? 'bg-zinc-950 border-emerald-500/40 text-emerald-400' 
          : 'bg-zinc-950 border-red-500/40 text-red-400'
      }`}>
        {type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
        <span>{message}</span>
        <button onClick={onClose} className="ml-2 text-zinc-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
