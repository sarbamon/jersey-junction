'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Copy, Check, AlertCircle } from 'lucide-react';
import { icarryService, TrackingResult } from '@/lib/services/icarryService';
import { AdminOrder } from '@/lib/types/admin';

const formatShippingStatusText = (status?: string): string => {
  if (!status) return 'Pending Pickup';
  if (/label\s*generated|manifest\s*generated|softdata\s*upload|shipment\s*created/i.test(status)) {
    return 'Pending Pickup';
  }
  return status;
};

interface LiveTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: AdminOrder | null;
}

export const LiveTrackingModal: React.FC<LiveTrackingModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const [trackingData, setTrackingData] = useState<TrackingResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const fetchTracking = async () => {
    if (!order) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await icarryService.trackShipment(order.id);
      if (data) {
        setTrackingData(data);
      } else {
        setError('No live tracking scans found yet. Shipment may have just been booked.');
      }
    } catch (err: any) {
      console.error('Failed to load tracking:', err);
      setError(err.message || 'Failed to fetch live tracking details from iCarry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && order) {
      fetchTracking();
    } else {
      setTrackingData(null);
      setError('');
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const awb = trackingData?.trackingNumber || order.trackingNumber || '';
  const courier = (trackingData?.courier || order.courierName || 'DELHIVERY SURFACE').toUpperCase();
  const rawStatus = trackingData?.shippingStatus || order.shippingStatus || 'Pending Pickup';
  const status = formatShippingStatusText(rawStatus);

  const copyAwb = () => {
    if (awb && awb !== 'PENDING') {
      navigator.clipboard.writeText(awb);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden text-slate-900 border border-slate-200/90 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header matching reference Image 2 */}
        <div className="pt-6 px-6 pb-2">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">
              Live Tracking
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchTracking}
                disabled={isLoading}
                title="Refresh tracking data"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-500' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
          {/* Solid horizontal divider line right below header */}
          <div className="w-full h-[1.5px] bg-slate-900 mt-3" />
        </div>

        {/* Modal Body */}
        <div className="px-6 pb-6 overflow-y-auto space-y-5 flex-1">
          {/* Status Box matching reference Image 2 */}
          <div className="p-4 rounded-xl border border-slate-200/90 bg-white space-y-1 shadow-xs">
            <div className="text-sm font-bold text-slate-900">
              Status:{' '}
              <span className="text-[#2563eb] font-bold">
                {status}
              </span>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Courier: <span className="uppercase font-semibold text-slate-700">{courier}</span>
            </div>
            {awb && awb !== 'PENDING' && (
              <div className="text-[11px] text-slate-400 font-mono pt-1.5 flex items-center justify-between border-t border-slate-100 mt-2">
                <span>AWB: <strong className="text-slate-800">{awb}</strong></span>
                <button
                  onClick={copyAwb}
                  className="hover:text-slate-900 transition-colors cursor-pointer text-slate-500 flex items-center gap-1"
                  title="Copy AWB"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Vertical Scan Timeline matching reference Image 2 */}
          {trackingData?.history && trackingData.history.length > 0 ? (
            <div className="relative pl-6 space-y-6 before:absolute before:left-[4px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-slate-200">
              {trackingData.history.map((step, idx) => (
                <div key={idx} className="relative">
                  {/* Milestone Dot: Solid black dot matching reference Image 2 */}
                  <div
                    className="absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full bg-slate-900 ring-4 ring-white"
                  />

                  {/* Scan Info */}
                  <div className="space-y-0.5 text-xs">
                    <div className="text-slate-500 font-sans text-xs">
                      {step.timestamp}
                    </div>
                    <div className="font-bold text-slate-900 text-sm">
                      {step.location || step.details || 'In Transit'}
                    </div>
                    <div className="text-slate-500 text-xs font-medium">
                      {step.status || step.details}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 text-xs space-y-2">
              <p>
                {isLoading
                  ? 'Fetching live courier tracking scans...'
                  : 'Shipment created & assigned to courier. Scans will appear once rider picks up the parcel.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
