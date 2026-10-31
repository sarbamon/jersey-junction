'use client';

import React, { useState } from 'react';
import { X, Search, Package, CheckCircle2, Clock, Truck, MapPin, Loader2, AlertCircle, Copy, Check } from 'lucide-react';
import { icarryService, TrackingResult } from '@/lib/services/icarryService';

const formatShippingStatusText = (status?: string): string => {
  if (!status) return 'Shipping getting ready';
  if (/label\s*generated|manifest\s*generated|softdata\s*upload|shipment\s*created/i.test(status)) {
    return 'Shipping getting ready';
  }
  return status;
};

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({ isOpen, onClose }) => {
  const [orderInput, setOrderInput] = useState('');
  const [trackedResult, setTrackedResult] = useState<TrackingResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = orderInput.trim();
    if (!query) return;

    setIsLoading(true);
    setErrorMsg('');
    setTrackedResult(null);

    try {
      const data = await icarryService.trackShipment(query);
      if (data && (data.trackingNumber || data.shippingStatus || data.history.length > 0)) {
        setTrackedResult(data);
      } else {
        setErrorMsg(`No active shipment found for "${query}". Please check your order ID or AWB number.`);
      }
    } catch (err: any) {
      console.warn('Track order modal error:', err);
      setErrorMsg(err.message || 'Unable to fetch tracking at this time. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyAwb = () => {
    if (trackedResult?.trackingNumber) {
      navigator.clipboard.writeText(trackedResult.trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md animate-fade-in font-sans">
      <div 
        className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-5 text-white max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black font-serif uppercase tracking-tight text-white">
                Live Shipment Tracking
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">Enter your Order ID or Courier AWB</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleTrack} className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. #JJ6013 or ICYC0007855202"
            value={orderInput}
            onChange={(e) => setOrderInput(e.target.value)}
            className="flex-1 bg-black border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase font-mono focus:border-amber-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 bg-gradient-to-r from-[#f4c84a] to-amber-500 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs rounded-xl uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Search className="w-4 h-4 text-black" />}
            <span>{isLoading ? 'Checking...' : 'Track'}</span>
          </button>
        </form>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-snug">{errorMsg}</p>
          </div>
        )}

        <div className="overflow-y-auto space-y-4 flex-1 pr-1">
          {trackedResult ? (
            <div className="bg-black/60 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-4 text-xs font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-3 gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block font-mono">
                    Order {trackedResult.orderId}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-bold text-amber-400 text-sm">{trackedResult.courier}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                      {formatShippingStatusText(trackedResult.shippingStatus)}
                    </span>
                  </div>
                </div>

                {trackedResult.trackingNumber && (
                  <div className="sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block font-mono">AWB Number</span>
                    <div className="flex items-center gap-1 font-mono text-white text-xs font-bold">
                      <span>{trackedResult.trackingNumber}</span>
                      <button onClick={copyAwb} className="p-0.5 text-zinc-400 hover:text-white" title="Copy">
                        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Scans Timeline */}
              <div className="space-y-3 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 font-mono">
                  <Clock className="w-3 h-3 text-amber-400" />
                  Live Courier Scans
                </span>

                {trackedResult.history && trackedResult.history.length > 0 ? (
                  <div className="relative pl-5 space-y-3.5 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
                    {trackedResult.history.map((step, idx) => (
                      <div key={idx} className="relative">
                        <div
                          className={`absolute -left-5 top-1 h-3.5 w-3.5 rounded-full border-2 ${
                            idx === 0
                              ? 'bg-amber-400 border-amber-300 ring-2 ring-amber-400/20'
                              : 'bg-zinc-900 border-zinc-600'
                          }`}
                        />
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <strong className="text-white font-medium">
                            {formatShippingStatusText(step.status)}
                          </strong>
                          <span className="text-zinc-500 text-[10px] font-mono">{step.timestamp}</span>
                        </div>
                        {step.location && (
                          <span className="text-zinc-400 text-[10px] font-mono block">{step.location}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-zinc-500 text-xs">
                    Package registered. First scan will appear once carrier collects the item.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-zinc-400 space-y-2">
              <Package className="w-8 h-8 mx-auto text-zinc-600" />
              <p>Enter your order reference code (e.g. #JJ6013) to view live carrier scan updates.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
