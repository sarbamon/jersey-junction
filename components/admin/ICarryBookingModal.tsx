'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Truck, 
  Package, 
  MapPin, 
  CheckCircle2, 
  Printer, 
  ExternalLink, 
  Key, 
  ShieldCheck, 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { AdminOrder } from '../../lib/types/admin';
import { icarryService, CourierEstimate, ICarryConfig } from '../../lib/services/icarryService';

interface ICarryBookingModalProps {
  order: AdminOrder;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess: (updatedOrder: AdminOrder) => void;
}

export const ICarryBookingModal: React.FC<ICarryBookingModalProps> = ({
  order,
  isOpen,
  onClose,
  onBookingSuccess,
}) => {
  const [config, setConfig] = useState<ICarryConfig | null>(null);
  const [couriers, setCouriers] = useState<CourierEstimate[]>([]);
  const [selectedCourier, setSelectedCourier] = useState<string>('Delhivery Surface');
  const [weight, setWeight] = useState<number>(order.packageWeight || 0.4);
  const [dimensions, setDimensions] = useState({ length: 25, breadth: 20, height: 3 });
  const [isLoadingEstimates, setIsLoadingEstimates] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [apiTokenInput, setApiTokenInput] = useState('');
  const [pickupAddressId, setPickupAddressId] = useState('WH-01');
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [saveTokenMsg, setSaveTokenMsg] = useState('');
  const [bookingSuccessData, setBookingSuccessData] = useState<{
    awb: string;
    courier: string;
    labelUrl: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Destination pincode from order
  const destPincode = order.shippingAddress?.pincode || '400001';
  const isCOD = order.paymentMethod === 'COD' || order.paymentStatus === 'COD';

  useEffect(() => {
    if (!isOpen) {
      setBookingSuccessData(null);
      setErrorMessage('');
      return;
    }

    // Load iCarry configuration
    icarryService.getConfig().then((cfg) => {
      if (cfg) {
        setConfig(cfg);
        setIsLiveMode(Boolean(cfg.isLiveMode));
        setPickupAddressId(cfg.pickupAddressId || 'WH-01');
        if (cfg.apiToken) setApiTokenInput(cfg.apiToken);
      }
    });

    // Fetch live courier rates
    setIsLoadingEstimates(true);
    icarryService
      .getEstimates('400001', destPincode, weight)
      .then((estimates) => {
        setCouriers(estimates);
        if (estimates.length > 0) {
          const rec = estimates.find((c) => c.recommended) || estimates[0];
          setSelectedCourier(rec.name);
        }
      })
      .finally(() => setIsLoadingEstimates(false));
  }, [isOpen, destPincode, weight, order]);

  if (!isOpen) return null;

  const handleSaveConfig = async () => {
    const ok = await icarryService.saveConfig({
      apiToken: apiTokenInput.trim(),
      pickupAddressId,
      isLiveMode,
    });
    if (ok) {
      setSaveTokenMsg('iCarry API credentials saved!');
      setTimeout(() => setSaveTokenMsg(''), 3000);
      const updated = await icarryService.getConfig();
      if (updated) setConfig(updated);
    }
  };

  const handleConfirmBooking = async () => {
    setIsBooking(true);
    setErrorMessage('');

    try {
      const res = await icarryService.bookShipment({
        orderId: order.id,
        courierName: selectedCourier,
        weight: Number(weight),
        dimensions,
        pickupAddress: config || undefined,
      });

      if (res.success && res.data) {
        setBookingSuccessData({
          awb: res.data.trackingNumber,
          courier: res.data.courierName,
          labelUrl: res.data.labelUrl,
        });

        // Notify parent to refresh order state
        const updatedOrder: AdminOrder = {
          ...order,
          orderStatus: 'Shipped',
          shippingStatus: 'Booked',
          trackingNumber: res.data.trackingNumber,
          courierName: res.data.courierName,
          labelUrl: res.data.labelUrl,
          icarryShipmentId: res.data.shipmentId,
          bookedAt: res.data.bookedAt,
        };
        onBookingSuccess(updatedOrder);
      } else {
        setErrorMessage(res.message || 'Booking failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during shipment booking.');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div 
        className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col text-white"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-zinc-800/80 sticky top-0 bg-zinc-950/95 backdrop-blur z-20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#f4c84a] to-amber-600 flex items-center justify-center text-black font-black shadow-lg">
              <Truck className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black font-serif uppercase tracking-tight text-white">
                  Book Shipment via iCarry.in
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30 text-[10px] font-mono font-bold">
                  API Integrated
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">
                Order <strong className="text-amber-400">{order.id}</strong> • {order.customerName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 flex-1 text-xs">
          
          {/* Success Screen if Booked */}
          {bookingSuccessData ? (
            <div className="p-6 rounded-3xl bg-emerald-950/30 border border-emerald-500/40 text-center space-y-5 animate-fade-in">
              <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black font-serif text-white uppercase tracking-tight">
                  Shipment Booked Successfully!
                </h3>
                <p className="text-xs text-zinc-300">
                  Carrier pickup has been requested on the iCarry logistics network.
                </p>
              </div>

              {/* Waybill & Courier Badge */}
              <div className="p-4 rounded-2xl bg-black/60 border border-zinc-800 space-y-2 max-w-md mx-auto font-mono">
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Assigned Courier:</span>
                  <strong className="text-amber-400 font-sans">{bookingSuccessData.courier}</strong>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>AWB Tracking No:</span>
                  <strong className="text-white text-sm tracking-wider select-all font-bold">
                    {bookingSuccessData.awb}
                  </strong>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Status:</span>
                  <span className="text-emerald-400 font-bold uppercase text-[10px]">Manifest Generated</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href={bookingSuccessData.labelUrl.startsWith('http') ? bookingSuccessData.labelUrl : `http://localhost:5000${bookingSuccessData.labelUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-[#f4c84a] to-amber-500 text-black font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-lg cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Shipping Label</span>
                </a>

                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Back to Orders
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Order Consignee & Shipping Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Consignee (Destination) */}
                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase text-[10px] tracking-wider">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Delivery Address (Consignee)</span>
                  </div>
                  <div className="font-bold text-white text-sm">
                    {order.shippingAddress?.name || order.customerName}
                  </div>
                  <div className="text-zinc-400 leading-relaxed text-[11px]">
                    {order.shippingAddress?.addressLine || 'Address'}
                    <br />
                    {order.shippingAddress?.city}, {order.shippingAddress?.state} - <strong className="text-amber-400 font-mono">{destPincode}</strong>
                  </div>
                  <div className="text-zinc-500 font-mono text-[10px]">
                    Phone: {order.shippingAddress?.phone || order.phone}
                  </div>
                </div>

                {/* Pickup Origin (Store Warehouse) */}
                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-zinc-400 font-bold uppercase text-[10px] tracking-wider">
                    <Package className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pickup Address (Origin Hub)</span>
                  </div>
                  <div className="font-bold text-white text-sm">
                    {config?.senderName || 'Jersey Junction Fulfillment'}
                  </div>
                  <div className="text-zinc-400 leading-relaxed text-[11px]">
                    {config?.senderAddress || 'Stadium Road, Shop 14'}
                    <br />
                    {config?.senderCity || 'Mumbai'}, {config?.senderState || 'Maharashtra'} - <strong className="text-white font-mono">{config?.senderPincode || '400001'}</strong>
                  </div>
                  <div className="text-zinc-500 font-mono text-[10px]">
                    Pickup ID: {config?.pickupAddressId || 'WH-01'}
                  </div>
                </div>
              </div>

              {/* Package Weight & Dimensions */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold uppercase text-[10px] text-zinc-400 tracking-wider">
                    Parcel Specifications
                  </span>
                  <span className="text-zinc-500 text-[10px] font-mono">
                    {order.items?.length || 1} item(s) in order
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Weight (KG)</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.1"
                      value={weight}
                      onChange={(e) => setWeight(parseFloat(e.target.value) || 0.4)}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono font-bold focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Length (cm)</label>
                    <input
                      type="number"
                      value={dimensions.length}
                      onChange={(e) => setDimensions({ ...dimensions, length: parseInt(e.target.value) || 25 })}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono font-bold focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Breadth (cm)</label>
                    <input
                      type="number"
                      value={dimensions.breadth}
                      onChange={(e) => setDimensions({ ...dimensions, breadth: parseInt(e.target.value) || 20 })}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono font-bold focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Height (cm)</label>
                    <input
                      type="number"
                      value={dimensions.height}
                      onChange={(e) => setDimensions({ ...dimensions, height: parseInt(e.target.value) || 3 })}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono font-bold focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Courier Selection with Live Estimates */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold uppercase text-[10px] text-zinc-400 tracking-wider">
                    Select Courier Partner via iCarry
                  </span>
                  <span className="text-zinc-500 text-[10px] font-mono">
                    {isLoadingEstimates ? 'Calculating rates...' : `${couriers.length} options serviceable`}
                  </span>
                </div>

                {isLoadingEstimates ? (
                  <div className="py-6 text-center text-zinc-500 font-mono flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                    <span>Quoting rates from iCarry network...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {couriers.map((c) => {
                      const isSelected = selectedCourier === c.name;
                      return (
                        <div
                          key={c.id}
                          onClick={() => setSelectedCourier(c.name)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-amber-400/10 border-amber-400 shadow-[0_0_15px_rgba(244,200,74,0.15)]'
                              : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-xs">{c.name}</span>
                              {c.recommended && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-extrabold uppercase">
                                  Fast &amp; Cheap
                                </span>
                              )}
                            </div>
                            <div className="text-zinc-400 text-[10px] flex items-center gap-1.5 font-mono">
                              <Clock className="w-3 h-3 text-zinc-500" />
                              <span>ETA: {c.estimatedDays}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-mono font-black text-amber-400 text-sm">
                              ₹{c.rate}
                            </div>
                            <span className="text-[9px] text-zinc-500 uppercase">{c.mode}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Payment Summary Box */}
              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between font-mono">
                <div>
                  <span className="text-zinc-400 block text-[10px]">Payment Type</span>
                  <strong className={isCOD ? 'text-amber-400 font-sans' : 'text-emerald-400 font-sans'}>
                    {isCOD ? 'Cash on Delivery (COD)' : 'Prepaid (Online Paid)'}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-zinc-400 block text-[10px]">
                    {isCOD ? 'COD Collection Amount' : 'Invoice Value'}
                  </span>
                  <strong className="text-white text-sm">₹{order.totalAmount}</strong>
                </div>
              </div>

              {/* iCarry Configuration Drawer Toggle */}
              <div className="pt-2 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setIsConfigOpen(!isConfigOpen)}
                  className="w-full flex items-center justify-between text-zinc-400 hover:text-white py-2 text-[11px] font-bold uppercase tracking-wider cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>iCarry.in API Token &amp; Credentials Settings</span>
                  </div>
                  {isConfigOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isConfigOpen && (
                  <div className="mt-3 p-4 rounded-2xl bg-black border border-zinc-800 space-y-3 animate-fade-in font-mono">
                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-1 font-bold">iCarry.in API Token</label>
                      <input
                        type="password"
                        placeholder="Paste your iCarry API Token"
                        value={apiTokenInput}
                        onChange={(e) => setApiTokenInput(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                      />
                      <span className="text-[9px] text-zinc-500 font-sans mt-0.5 block">
                        Get from your iCarry.in account under &quot;API &amp; Plugins / Developer Documentation&quot;.
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-zinc-400 block mb-1 font-bold">Pickup Address ID</label>
                        <input
                          type="text"
                          value={pickupAddressId}
                          onChange={(e) => setPickupAddressId(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center pt-5">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-sans">
                          <input
                            type="checkbox"
                            checked={isLiveMode}
                            onChange={(e) => setIsLiveMode(e.target.checked)}
                            className="rounded accent-amber-400 w-4 h-4"
                          />
                          <span>Live Production Mode</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[10px] text-emerald-400 font-sans font-bold">{saveTokenMsg}</span>
                      <button
                        type="button"
                        onClick={handleSaveConfig}
                        className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-bold cursor-pointer transition-colors"
                      >
                        Save Credentials
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </>
          )}

        </div>

        {/* Modal Footer */}
        {!bookingSuccessData && (
          <div className="p-5 sm:p-6 border-t border-zinc-800/80 bg-zinc-950/95 sticky bottom-0 flex flex-col sm:flex-row items-center justify-between gap-3 z-20">
            <div className="text-[11px] text-zinc-400 font-mono">
              Courier: <strong className="text-amber-400">{selectedCourier}</strong>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={isBooking}
                className="w-full sm:w-auto px-7 py-2.5 rounded-full bg-gradient-to-r from-[#f4c84a] to-amber-500 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBooking ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Booking with iCarry...</span>
                  </>
                ) : (
                  <>
                    <Truck className="w-4 h-4 text-black" />
                    <span>Confirm &amp; Book via iCarry</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
