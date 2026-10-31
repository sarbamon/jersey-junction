'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Truck,
  RefreshCw,
  Copy,
  Check,
  MapPin,
  Clock,
  CheckCircle2,
  Package,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { icarryService, TrackingResult } from '@/lib/services/icarryService';
import { AdminOrder } from '@/lib/types/admin';

const formatShippingStatusText = (status?: string): string => {
  if (!status) return 'Shipping getting ready';
  if (/label\s*generated|manifest\s*generated|softdata\s*upload|shipment\s*created/i.test(status)) {
    return 'Shipping getting ready';
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

  const awb = trackingData?.trackingNumber || order.trackingNumber || 'PENDING';
  const courier = trackingData?.courier || order.courierName || 'Assigned Courier';
  const status = formatShippingStatusText(trackingData?.shippingStatus || order.shippingStatus || 'Booked');
  const externalUrl =
    trackingData?.externalTrackingUrl ||
    (order.trackingNumber
      ? `https://www.icarry.in/track-shipment&awb=${encodeURIComponent(order.trackingNumber)}`
      : 'https://www.icarry.in/track-shipment');

  const copyAwb = () => {
    if (awb && awb !== 'PENDING') {
      navigator.clipboard.writeText(awb);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black font-serif uppercase tracking-tight text-white">
                Live Shipment Tracking
              </h2>
              <p className="text-[11px] text-zinc-400 font-mono">
                Order <span className="text-white font-bold">{order.id}</span> • Customer:{' '}
                <span className="text-zinc-300">{order.customerName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchTracking}
              disabled={isLoading}
              title="Refresh tracking data"
              className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Hero Banner: Courier & AWB */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Carrier Partner:
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-amber-400/10 text-amber-400 font-bold text-xs uppercase tracking-wider border border-amber-400/20">
                  {courier}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  AWB Waybill:
                </span>
                <span className="font-mono text-sm sm:text-base font-black text-white tracking-wider">
                  {awb}
                </span>
                {awb !== 'PENDING' && (
                  <button
                    onClick={copyAwb}
                    className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md transition-colors cursor-pointer"
                    title="Copy AWB"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-1.5 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-black text-xs uppercase tracking-wider">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span>{status}</span>
              </div>
              {trackingData?.edd && (
                <span className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-amber-400" />
                  EDD: {trackingData.edd}
                </span>
              )}
            </div>
          </div>

          {/* Destination Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <Package className="w-3 h-3 text-amber-400" />
                Delivery Destination
              </span>
              <p className="text-zinc-200 font-medium">
                {order.shippingAddress?.name || order.customerName}
              </p>
              <p className="text-zinc-400 text-[11px] leading-snug">
                {order.shippingAddress?.addressLine || 'Street Address'}
              </p>
              <p className="text-zinc-300 font-mono text-[11px]">
                {order.shippingAddress?.city || ''}, {order.shippingAddress?.state || ''} -{' '}
                <strong className="text-amber-400">{order.shippingAddress?.pincode || ''}</strong>
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-emerald-400" />
                Booking &amp; Rider Pickup
              </span>
              <p className="text-zinc-300 text-[11px]">
                Booked At: <span className="font-mono text-white">{order.bookedAt || 'Recently'}</span>
              </p>
              {trackingData?.pickedDateTime && (
                <p className="text-zinc-300 text-[11px]">
                  Picked Up: <span className="font-mono text-emerald-400">{trackingData.pickedDateTime}</span>
                </p>
              )}
              {trackingData?.deliveredDateTime && (
                <p className="text-zinc-300 text-[11px]">
                  Delivered: <span className="font-mono text-emerald-400">{trackingData.deliveredDateTime}</span>
                </p>
              )}
              <p className="text-[11px] text-zinc-400">
                Payment: <strong className="text-white">{order.paymentMethod}</strong> (₹{order.totalAmount})
              </p>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold uppercase text-xs text-amber-400 tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Live Courier Scan Timeline
              </h3>
              {isLoading && (
                <span className="text-[10px] text-zinc-400 animate-pulse font-mono">
                  Syncing live scans...
                </span>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {/* Scans List */}
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
              {trackingData?.history && trackingData.history.length > 0 ? (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
                  {trackingData.history.map((step, idx) => (
                    <div key={idx} className="relative group">
                      {/* Milestone Dot */}
                      <div
                        className={`absolute -left-6 top-1 h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                          idx === 0
                            ? 'bg-amber-400 border-amber-300 ring-4 ring-amber-400/20'
                            : 'bg-zinc-900 border-zinc-600'
                        }`}
                      >
                        {idx === 0 && <span className="h-1.5 w-1.5 rounded-full bg-black" />}
                      </div>

                      {/* Content */}
                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <strong className="text-xs text-white font-bold font-sans">
                            {formatShippingStatusText(step.status)}
                          </strong>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {step.timestamp}
                          </span>
                        </div>
                        {step.location && (
                          <div className="text-[11px] text-zinc-400 font-mono flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-zinc-500" />
                            {step.location}
                          </div>
                        )}
                        {step.details && (
                          <p className="text-[11px] text-zinc-300 font-medium">
                            {step.details}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-zinc-400 space-y-2">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-zinc-600" />
                  <p className="text-xs">
                    Shipment created &amp; assigned to courier. First scan will appear once rider picks up the parcel.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-zinc-800/80 bg-zinc-900/50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
