'use client';

import React, { useState, useEffect } from 'react';
import {
  Truck,
  X,
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building,
  RefreshCw,
  Check,
  ExternalLink,
} from 'lucide-react';
import {
  icarryService,
  ICarryConfig,
  CourierEstimate,
} from '@/lib/services/icarryService';
import { settingsService } from '@/lib/services/settingsService';
import { apiClient } from '@/lib/apiClient';
import { AdminOrder, ICarryPickupLocation } from '@/lib/types/admin';

interface ICarryBookingModalProps {
  order: AdminOrder;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess: (updatedOrder: AdminOrder) => void;
  onOpenTracking?: (order: AdminOrder) => void;
}

export const ICarryBookingModal: React.FC<ICarryBookingModalProps> = ({
  order,
  isOpen,
  onClose,
  onBookingSuccess,
  onOpenTracking,
}) => {
  const [config, setConfig] = useState<ICarryConfig | null>(null);
  const [couriers, setCouriers] = useState<CourierEstimate[]>([]);
  const [selectedCourier, setSelectedCourier] = useState<string>('');
  
  // Parcel Details (Default values as shown in user's reference system)
  const [originPincode, setOriginPincode] = useState<string>('400052');
  const [mode, setMode] = useState<string>('Surface');
  const [weightGrams, setWeightGrams] = useState<number>(order.packageWeight ? Math.round(order.packageWeight * 1000) : 500);
  const [invoiceValue, setInvoiceValue] = useState<number>(order.totalAmount || 1388);
  const [dimensions, setDimensions] = useState({ length: 25, breadth: 10, height: 9.2 });
  const [parcelContents, setParcelContents] = useState<string>('Jersey');

  // Consignee Details (Directly editable form fields as requested)
  const [consignee, setConsignee] = useState({
    name: order.shippingAddress?.name || order.customerName || '',
    phone: order.shippingAddress?.phone || order.phone || '',
    addressLine: order.shippingAddress?.addressLine || '',
    pincode: order.shippingAddress?.pincode || '',
    city: order.shippingAddress?.city || '',
    state: order.shippingAddress?.state || '',
  });

  const [isLoadingEstimates, setIsLoadingEstimates] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccessData, setBookingSuccessData] = useState<{
    awb: string;
    courier: string;
    labelUrl: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);

  // Store settings & Multiple Pickup Locations
  const [storeSettings, setStoreSettings] = useState(settingsService.getSettings());
  const [selectedAddressId, setSelectedAddressId] = useState<string>('103215');
  const [shipperLabelOption, setShipperLabelOption] = useState<string>('same');

  // Preset pickup locations matching the user's system
  const defaultPickupPresets: ICarryPickupLocation[] = [
    { id: 'sufi', name: 'SUFI', addressId: '103215', pincode: '400052', isDefault: true },
    { id: 'aahil', name: 'AAHIL', addressId: '103216', pincode: '400102' },
    { id: 'pla', name: 'PLA', addressId: '103217', pincode: '400050' },
    { id: 'vnn', name: 'VNN', addressId: '103218', pincode: '400706' },
    { id: 'abhi', name: 'ABHI', addressId: '34272', pincode: '782460' },
    { id: 'bla', name: 'BLA', addressId: '103219', pincode: '400003' },
  ];

  const pickupLocations: ICarryPickupLocation[] = (storeSettings.icarryPickupLocations && storeSettings.icarryPickupLocations.length > 0)
    ? storeSettings.icarryPickupLocations
    : defaultPickupPresets;

  // Active pickup location
  const activeLocation = pickupLocations.find((l) => l.addressId === selectedAddressId)
    || pickupLocations.find((l) => l.isDefault)
    || pickupLocations[0]
    || { id: 'sufi', name: 'SUFI', addressId: '103215', pincode: '400052' };

  const effectiveAddressId = selectedAddressId || activeLocation.addressId || '103215';
  const effectiveName = activeLocation.name || 'Warehouse';
  const isCOD = order.paymentMethod === 'COD' || order.paymentStatus === 'COD';

  // Handle pickup address dropdown change: updates address ID and automatically sets Origin Pincode
  const handlePickupAddressChange = (addressId: string) => {
    setSelectedAddressId(addressId);
    const loc = pickupLocations.find((l) => l.addressId === addressId);
    if (loc && loc.pincode) {
      setOriginPincode(loc.pincode);
    }
    setErrorMessage('');
    setCouriers([]);
    setHasCalculated(false);
  };

  // Sync state whenever order opens
  useEffect(() => {
    if (!isOpen) {
      setBookingSuccessData(null);
      setErrorMessage('');
      setHasCalculated(false);
      setCouriers([]);
      setSelectedCourier('');
      return;
    }

    const currentSettings = settingsService.getSettings();
    setStoreSettings(currentSettings);

    const initialLoc = (currentSettings.icarryPickupLocations?.find((l) => l.isDefault)) || pickupLocations[0];
    if (initialLoc) {
      setSelectedAddressId(initialLoc.addressId);
      if (initialLoc.pincode) {
        setOriginPincode(initialLoc.pincode);
      }
    }

    setConsignee({
      name: order.shippingAddress?.name || order.customerName || '',
      phone: order.shippingAddress?.phone || order.phone || '',
      addressLine: order.shippingAddress?.addressLine || '',
      pincode: order.shippingAddress?.pincode || '',
      city: order.shippingAddress?.city || '',
      state: order.shippingAddress?.state || '',
    });

    setInvoiceValue(order.totalAmount || 1388);
    setWeightGrams(order.packageWeight ? Math.round(order.packageWeight * 1000) : 500);

    // Load backend config without auto-estimating
    icarryService.getConfig().then((cfg) => {
      if (cfg) setConfig(cfg);
    }).catch(() => {});
  }, [isOpen, order]);

  if (!isOpen) return null;

  // Calculate live courier rates
  const handleGetRatesAndCouriers = async () => {
    const trimmedOrigin = originPincode.trim();
    if (!trimmedOrigin || trimmedOrigin.length !== 6) {
      setErrorMessage('Please enter a valid 6-digit Origin Pincode.');
      return;
    }

    const trimmedDest = consignee.pincode.trim();
    if (!trimmedDest || trimmedDest.length !== 6) {
      setErrorMessage('Please enter a valid 6-digit Customer Destination Pincode.');
      return;
    }

    if (!consignee.name.trim()) {
      setErrorMessage('Please enter Customer Contact Name.');
      return;
    }

    if (!consignee.addressLine.trim()) {
      setErrorMessage('Please enter Customer Street Address.');
      return;
    }

    setIsLoadingEstimates(true);
    setErrorMessage('');
    setHasCalculated(true);

    try {
      const res = await icarryService.getEstimates(
        trimmedOrigin,
        trimmedDest,
        weightGrams,
        dimensions,
        effectiveAddressId,
        mode,
        invoiceValue,
        isCOD
      );

      if (res.success && res.couriers.length > 0) {
        setCouriers(res.couriers);
        const rec = res.couriers.find((c) => c.recommended) || res.couriers[0];
        setSelectedCourier(rec.name);
      } else {
        setCouriers([]);
        if (res.message) {
          setErrorMessage(res.message);
        } else {
          setErrorMessage('No courier rates found for this pincode route.');
        }
      }
    } catch (err: any) {
      console.warn('Error fetching rates:', err);
      setErrorMessage(err.message || 'Error loading live courier rates from iCarry.');
    } finally {
      setIsLoadingEstimates(false);
    }
  };

  // Confirm and book shipment
  const handleConfirmBooking = async () => {
    if (!selectedCourier) {
      setErrorMessage('Please select a Courier Partner from the dropdown.');
      return;
    }

    if (!originPincode || originPincode.length !== 6) {
      setErrorMessage('Origin Pincode must be 6 digits.');
      return;
    }

    if (!consignee.pincode || consignee.pincode.length !== 6) {
      setErrorMessage('Customer Pincode must be 6 digits.');
      return;
    }

    setIsBooking(true);
    setErrorMessage('');

    try {
      // 1. Also update shipping address in Mongo for consistency
      apiClient.patch(`/orders/${order.id}`, {
        customerName: consignee.name.trim(),
        phone: consignee.phone.trim(),
        shippingAddress: {
          name: consignee.name.trim(),
          phone: consignee.phone.trim(),
          addressLine: consignee.addressLine.trim(),
          city: consignee.city.trim(),
          state: consignee.state.trim(),
          pincode: consignee.pincode.trim(),
        },
      }).catch(() => {});

      // 2. Book shipment via iCarry API
      const selectedCourierObj = couriers.find((c) => c.name === selectedCourier);
      const res = await icarryService.bookShipment({
        orderId: order.id,
        courierName: selectedCourier,
        courierId: selectedCourierObj?.id,
        weight: weightGrams,
        dimensions,
        pickupAddressId: effectiveAddressId,
        invoiceValue: invoiceValue,
        parcelContents: parcelContents,
        mode: mode,
        consignee: {
          name: consignee.name.trim(),
          phone: consignee.phone.trim(),
          addressLine: consignee.addressLine.trim(),
          city: consignee.city.trim(),
          state: consignee.state.trim(),
          pincode: consignee.pincode.trim(),
        },
      });

      if (res.success && res.data) {
        setBookingSuccessData({
          awb: res.data.trackingNumber,
          courier: res.data.courierName,
          labelUrl: res.data.labelUrl,
        });

        const updatedOrder: AdminOrder = {
          ...order,
          customerName: consignee.name.trim(),
          phone: consignee.phone.trim(),
          shippingAddress: {
            ...(order.shippingAddress || {}),
            name: consignee.name.trim(),
            phone: consignee.phone.trim(),
            addressLine: consignee.addressLine.trim(),
            city: consignee.city.trim(),
            state: consignee.state.trim(),
            pincode: consignee.pincode.trim(),
            country: 'India',
          },
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
        setErrorMessage(res.message || 'Booking failed on iCarry. Please verify credentials in .env.');
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
              <h2 className="text-base sm:text-lg font-black font-serif uppercase tracking-tight text-white">
                Shipment Booking
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                Order <strong className="text-amber-400">{order.id}</strong> • {consignee.name || order.customerName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-wider px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            CANCEL
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
                  Carrier pickup has been scheduled with the delivery partner.
                </p>
              </div>

              {/* Booking Summary Box */}
              <div className="p-4 rounded-2xl bg-black/60 border border-zinc-800 max-w-md mx-auto text-left space-y-2 font-mono text-xs">
                <div className="flex justify-between items-center py-1 border-b border-zinc-800/80">
                  <span className="text-zinc-400">Assigned Courier:</span>
                  <strong className="text-amber-400 font-sans font-bold">{bookingSuccessData.courier}</strong>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-zinc-800/80">
                  <span className="text-zinc-400">AWB Tracking No:</span>
                  <strong className="text-white font-bold tracking-wider">{bookingSuccessData.awb}</strong>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-zinc-800/80">
                  <span className="text-zinc-400">Origin Warehouse:</span>
                  <strong className="text-zinc-300 font-bold">{effectiveName} ({originPincode})</strong>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-zinc-400">Status:</span>
                  <span className="text-emerald-400 font-bold uppercase text-[10px]">PICKUP REQUESTED</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const bookedOrder: AdminOrder = {
                      ...order,
                      trackingNumber: bookingSuccessData.awb,
                      courierName: bookingSuccessData.courier,
                      shippingStatus: 'Booked',
                      orderStatus: 'Shipped',
                    };
                    onClose();
                    if (onOpenTracking) {
                      onOpenTracking(bookedOrder);
                    } else {
                      window.open(
                        `https://www.icarry.in/track-shipment&awb=${encodeURIComponent(bookingSuccessData.awb)}`,
                        '_blank'
                      );
                    }
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-[#f4c84a] to-amber-500 text-black font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-lg cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  <span>Track Live Shipment</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Back to Orders
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* SECTION 1: Address Settings */}
              <div className="space-y-3 pb-4 border-b border-zinc-800/80">
                <h3 className="font-extrabold uppercase text-xs text-amber-400 tracking-wider">
                  Address Settings
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-zinc-400 font-bold block mb-1">
                      Pickup Address *
                    </label>
                    <select
                      value={selectedAddressId}
                      onChange={(e) => handlePickupAddressChange(e.target.value)}
                      className="w-full bg-black border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-white font-bold text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="">Select Pickup Address</option>
                      {pickupLocations.map((loc) => (
                        <option key={loc.id || loc.addressId} value={loc.addressId}>
                          {loc.name} {loc.pincode ? `(${loc.pincode})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-zinc-400 font-bold block mb-1">
                      Shipper Address on Label (From Address) *
                    </label>
                    <select
                      value={shipperLabelOption}
                      onChange={(e) => setShipperLabelOption(e.target.value)}
                      className="w-full bg-black border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-white font-bold text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="same">Same as Pickup Address</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Consignee Details (Customer Address) */}
              <div className="space-y-3 pb-4 border-b border-zinc-800/80">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold uppercase text-xs text-amber-400 tracking-wider">
                    Consignee Details
                  </h3>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Directly editable customer address
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-zinc-400 font-bold block mb-1">
                        Contact Name *
                      </label>
                      <input
                        type="text"
                        value={consignee.name}
                        onChange={(e) => setConsignee({ ...consignee, name: e.target.value })}
                        className="w-full bg-black border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-white font-medium text-xs focus:outline-none"
                        placeholder="Customer Name"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 font-bold block mb-1">
                        Mobile *
                      </label>
                      <input
                        type="text"
                        value={consignee.phone}
                        onChange={(e) => setConsignee({ ...consignee, phone: e.target.value })}
                        className="w-full bg-black border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:outline-none"
                        placeholder="10-digit mobile"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-zinc-400 font-bold block mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={consignee.addressLine}
                      onChange={(e) => setConsignee({ ...consignee, addressLine: e.target.value })}
                      className="w-full bg-black border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-white font-medium text-xs focus:outline-none"
                      placeholder="Flat, Road, Area, Landmark"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-zinc-400 font-bold block mb-1">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={consignee.pincode}
                        onChange={(e) => setConsignee({ ...consignee, pincode: e.target.value.replace(/[^0-9]/g, '') })}
                        className="w-full bg-black border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:outline-none"
                        placeholder="412110"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 font-bold block mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={consignee.city}
                        onChange={(e) => setConsignee({ ...consignee, city: e.target.value })}
                        className="w-full bg-black border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-white font-medium text-xs focus:outline-none"
                        placeholder="City"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-zinc-400 font-bold block mb-1">
                      State Code (e.g. MH) *
                    </label>
                    <input
                      type="text"
                      value={consignee.state}
                      onChange={(e) => setConsignee({ ...consignee, state: e.target.value })}
                      className="w-full sm:w-1/2 bg-black border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-white font-medium text-xs focus:outline-none"
                      placeholder="MH, AS, DL, KA..."
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Parcel Details */}
              <div className="space-y-3 pb-4 border-b border-zinc-800/80">
                <h3 className="font-extrabold uppercase text-xs text-amber-400 tracking-wider">
                  Parcel Details
                </h3>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-zinc-400 font-bold block mb-1">
                        Origin Pincode *
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={originPincode}
                        onChange={(e) => setOriginPincode(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full bg-black border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:outline-none"
                        placeholder="400052"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 font-bold block mb-1">
                        Mode *
                      </label>
                      <select
                        value={mode}
                        onChange={(e) => setMode(e.target.value)}
                        className="w-full bg-black border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-white font-bold text-xs focus:outline-none cursor-pointer"
                      >
                        <option value="Surface">Surface</option>
                        <option value="Air">Air</option>
                        <option value="Express">Express</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-zinc-400 font-bold block mb-1">
                        Weight (Grams) *
                      </label>
                      <input
                        type="number"
                        step="10"
                        min="50"
                        value={weightGrams}
                        onChange={(e) => setWeightGrams(parseInt(e.target.value) || 500)}
                        className="w-full bg-black border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:outline-none"
                        placeholder="500"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 font-bold block mb-1">
                        Invoice Value (₹) *
                      </label>
                      <input
                        type="number"
                        value={invoiceValue}
                        onChange={(e) => setInvoiceValue(parseInt(e.target.value) || 0)}
                        className="w-full bg-black border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:outline-none"
                        placeholder="1388"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-zinc-400 font-bold block mb-1">
                        Length (cm) *
                      </label>
                      <input
                        type="number"
                        value={dimensions.length}
                        onChange={(e) => setDimensions({ ...dimensions, length: parseFloat(e.target.value) || 25 })}
                        className="w-full bg-black border border-zinc-700 focus:border-amber-400 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 font-bold block mb-1">
                        Breadth (cm) *
                      </label>
                      <input
                        type="number"
                        value={dimensions.breadth}
                        onChange={(e) => setDimensions({ ...dimensions, breadth: parseFloat(e.target.value) || 10 })}
                        className="w-full bg-black border border-zinc-700 focus:border-amber-400 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 font-bold block mb-1">
                        Height (cm) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={dimensions.height}
                        onChange={(e) => setDimensions({ ...dimensions, height: parseFloat(e.target.value) || 9.2 })}
                        className="w-full bg-black border border-zinc-700 focus:border-amber-400 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-zinc-400 font-bold block mb-1">
                      Parcel Contents *
                    </label>
                    <input
                      type="text"
                      value={parcelContents}
                      onChange={(e) => setParcelContents(e.target.value)}
                      className="w-full bg-black border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-white font-medium text-xs focus:outline-none"
                      placeholder="Jersey"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: Rates & Couriers */}
              <div className="space-y-3 pb-2">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleGetRatesAndCouriers}
                    disabled={isLoadingEstimates}
                    className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 border border-zinc-700 transition-all cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isLoadingEstimates ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                        <span>Fetching Rates...</span>
                      </>
                    ) : (
                      <>
                        <Truck className="w-3.5 h-3.5 text-amber-400" />
                        <span>GET RATES &amp; COURIERS</span>
                      </>
                    )}
                  </button>

                  {hasCalculated && !isLoadingEstimates && couriers.length > 0 && (
                    <span className="text-emerald-400 font-bold text-xs font-mono">
                      {couriers.length} couriers found!
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-zinc-400 font-bold block mb-1">
                    Select Courier *
                  </label>
                  <select
                    value={selectedCourier}
                    onChange={(e) => setSelectedCourier(e.target.value)}
                    className="w-full bg-black border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-white font-bold text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="">
                      {couriers.length === 0 ? 'Click GET RATES & COURIERS first' : 'Select Courier'}
                    </option>
                    {couriers.map((c) => (
                      <option key={c.id || c.name} value={c.name}>
                        {c.name} (₹{c.rate}) - {c.estimatedDays || 'Surface'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Error Message Alert */}
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-red-950/30 border border-red-500/40 text-red-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="block font-bold text-red-200">Error:</strong>
                    <p className="leading-relaxed font-mono text-[11px]">{errorMessage}</p>
                    {errorMessage.includes('Invalid username and key combination') && (
                      <p className="text-zinc-400 text-[10px] pt-1">
                        👉 Tip: Check your <strong>ICARRY_API_KEY</strong> and <strong>ICARRY_API_USERNAME</strong> in your backend <code className="text-amber-400">.env</code>. Make sure the API key doesn't have accidental extra characters like &lt; or ?.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* Modal Footer */}
        {!bookingSuccessData && (
          <div className="p-5 sm:p-6 border-t border-zinc-800/80 bg-zinc-950/95 sticky bottom-0 flex items-center justify-end gap-3 z-20">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold cursor-pointer transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirmBooking}
              disabled={isBooking || !selectedCourier}
              className="px-6 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBooking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Booking...</span>
                </>
              ) : (
                <span>Confirm Booking</span>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
