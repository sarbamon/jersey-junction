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
      ? `https://www.icarry.in/track-shipment?awb=${encodeURIComponent(order.trackingNumber)}`
      : 'https://www.icarry.in/track-shipment');

  const copyAwb = () => {
    if (awb && awb !== 'PENDING') {
      navigator.clipboard.writeText(awb);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-[#0d0d0d] border border-[#242424] rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-white font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#242424] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-serif text-white">
              Live Tracking
            </h2>
            <button
              onClick={fetchTracking}
              disabled={isLoading}
              title="Refresh tracking data"
              className="p-1 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>

          <button
            onClick={onClose}
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Status Box */}
          <div className="p-4 rounded-xl border border-[#242424] bg-black/50 space-y-1">
            <div className="text-sm font-bold text-white">
              Status:{' '}
              <span className="text-[#3b82f6] font-bold">
                {status}
              </span>
            </div>
            <div className="text-xs text-gray-400">
              Courier:{' '}
              <span className="uppercase text-gray-300 font-mono">
                {courier}
              </span>
            </div>
            {awb && awb !== 'PENDING' && (
              <div className="text-[11px] text-gray-500 font-mono pt-1 flex items-center justify-between">
                <span>AWB: <strong className="text-gray-300">{awb}</strong></span>
                <button
                  onClick={copyAwb}
                  className="hover:text-white transition-colors cursor-pointer"
                  title="Copy AWB"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Vertical Scan Timeline */}
          {trackingData?.history && trackingData.history.length > 0 ? (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#242424]">
              {trackingData.history.map((step, idx) => (
                <div key={idx} className="relative">
                  {/* Milestone Dot */}
                  <div
                    className={`absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full ${
                      idx === 0
                        ? 'bg-[#3b82f6] ring-4 ring-[#3b82f6]/20'
                        : 'bg-white'
                    }`}
                  />

                  {/* Scan Info */}
                  <div className="space-y-0.5 text-xs">
                    <div className="text-gray-400 font-mono text-[11px]">
                      {step.timestamp}
                    </div>
                    <div className="font-bold text-white text-xs sm:text-sm">
                      {step.location || step.details || 'In Transit'}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {formatShippingStatusText(step.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400 text-xs space-y-2">
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
