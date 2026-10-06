'use client';

import React, { useState } from 'react';
import { X, Search, Package, CheckCircle2, Clock, Truck, MapPin } from 'lucide-react';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({ isOpen, onClose }) => {
  const [orderInput, setOrderInput] = useState('');
  const [trackedResult, setTrackedResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderInput.trim()) return;

    // Simulate real tracking status
    setTrackedResult({
      orderId: orderInput.toUpperCase(),
      status: 'In Transit via DHL Express Air',
      estimatedDelivery: 'Oct 8, 2026',
      carrier: 'DHL Express (AWB #8492049182)',
      steps: [
        { title: 'Order Confirmed & Printing Complete', date: 'Oct 4, 10:30 AM', done: true },
        { title: 'Quality Inspection & Patch Application', date: 'Oct 4, 02:15 PM', done: true },
        { title: 'Dispatched from Jersey Junction Logistics Hub', date: 'Oct 5, 08:00 AM', done: true },
        { title: 'In Transit - International Flight Customs', date: 'Oct 6, 04:20 PM', done: false },
        { title: 'Out for Local Courier Delivery', date: 'Pending', done: false }
      ]
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-6">
        
        <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white font-mono uppercase">
              TRACK YOUR PACKAGE
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleTrack} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter Order ID (e.g. JS-98421)"
            value={orderInput}
            onChange={(e) => setOrderInput(e.target.value)}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white uppercase focus:border-amber-400 focus:outline-none"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl uppercase"
          >
            Track
          </button>
        </form>

        {trackedResult ? (
          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-4">
            <div className="flex justify-between items-start text-xs border-b border-zinc-800 pb-2">
              <div>
                <span className="text-zinc-400 block">Status for {trackedResult.orderId}</span>
                <strong className="text-amber-400 text-sm font-bold">{trackedResult.status}</strong>
              </div>
              <div className="text-right">
                <span className="text-zinc-400 block">Estimated Arrival</span>
                <strong className="text-white">{trackedResult.estimatedDelivery}</strong>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {trackedResult.steps.map((s: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    s.done ? 'bg-amber-400 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-600'
                  }`}>
                    {s.done ? '✓' : idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold ${s.done ? 'text-white' : 'text-zinc-500'}`}>{s.title}</div>
                    <div className="text-[10px] text-zinc-500">{s.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-zinc-400">
            Enter your order reference code from your confirmation email to see live shipment progress.
          </div>
        )}

      </div>
    </div>
  );
};
