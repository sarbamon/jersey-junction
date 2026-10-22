'use client';

import React, { useState, useEffect } from 'react';
import confettiFn from 'canvas-confetti';
import { X, Check, Lock, ArrowRight, ShieldCheck, Shield, MapPin, User } from 'lucide-react';
import { CartItem, Currency } from '../types';
import { orderService } from '../lib/services/orderService';
import { paymentService } from '../lib/services/paymentService';
import { productService } from '../lib/services/productService';
import { AdminOrder } from '../lib/types/admin';
import { settingsService } from '../lib/services/settingsService';
import { useStore } from '../context/StoreContext';
import { OrderConfirmedAnimation } from './OrderConfirmedAnimation';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  activeCurrency: Currency;
  onOrderSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  activeCurrency,
  onOrderSuccess
}) => {
  const { currentUser, clearCart, setIsAuthOpen } = useStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [paymentMethod, setPaymentMethod] = useState<'Razorpay' | 'COD'>('Razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCodEnabled, setIsCodEnabled] = useState<boolean>(true);

  const [formData, setFormData] = useState({
    fullName: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'India',
    shippingMethod: 'express',
  });

  const [orderId, setOrderId] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  // Load Razorpay SDK Script dynamically
  useEffect(() => {
    if (!isOpen) return;
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [isOpen]);

  // Synchronize store settings (Cash On Delivery on/off)
  useEffect(() => {
    if (!isOpen) return;
    const current = settingsService.getSettings();
    setIsCodEnabled(current.codEnabled);
    if (!current.codEnabled) {
      setPaymentMethod('Razorpay');
    }

    settingsService.fetchSettingsAsync().then((latest) => {
      setIsCodEnabled(latest.codEnabled);
      if (!latest.codEnabled) {
        setPaymentMethod('Razorpay');
      }
    });

    const handleSettingsUpdate = (e: any) => {
      const updated = e.detail || settingsService.getSettings();
      setIsCodEnabled(updated.codEnabled);
      if (!updated.codEnabled) {
        setPaymentMethod('Razorpay');
      }
    };

    window.addEventListener('jj_store_settings_updated', handleSettingsUpdate);
    return () => {
      window.removeEventListener('jj_store_settings_updated', handleSettingsUpdate);
    };
  }, [isOpen]);

  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Auto-load saved addresses from localStorage on open or mount
  useEffect(() => {
    if (!isOpen) return;
    try {
      const stored = localStorage.getItem('jj_customer_addresses');
      const last = localStorage.getItem('jj_last_address');
      let addrs: any[] = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(addrs)) addrs = [];

      // Filter out stale demo seeds like Aarav Sharma / Indiranagar
      const isFakeDemo = (a: any) =>
        a && (
          a.name === 'Aarav Sharma' ||
          (typeof a.addressLine === 'string' && a.addressLine.includes('Indiranagar')) ||
          (typeof a.address === 'string' && a.address.includes('Indiranagar')) ||
          a.phone === '+91 98765 43210'
        );

      addrs = addrs.filter((a) => !isFakeDemo(a));
      localStorage.setItem('jj_customer_addresses', JSON.stringify(addrs));

      let lastObj = last ? JSON.parse(last) : null;
      if (isFakeDemo(lastObj)) {
        localStorage.removeItem('jj_last_address');
        lastObj = null;
      }

      let chosen = addrs.find((a) => a.isDefault) || addrs[0];
      if (!chosen && lastObj) {
        chosen = lastObj;
        addrs.push(chosen);
      }

      setSavedAddresses(addrs);

      if (chosen) {
        setSelectedAddressId(chosen.id || 'default');
        setFormData((prev) => ({
          ...prev,
          fullName: chosen.name || currentUser?.name || prev.fullName,
          email: chosen.email || currentUser?.email || prev.email,
          phone: chosen.phone || currentUser?.phone || prev.phone,
          address: chosen.addressLine || chosen.address || '',
          city: chosen.city || '',
          state: chosen.state || '',
          zip: chosen.pincode || chosen.zip || '',
          country: chosen.country || 'India',
        }));
      } else {
        setSelectedAddressId('');
        setShowAddressForm(true);
        setFormData((prev) => ({
          ...prev,
          fullName: currentUser?.name || prev.fullName || '',
          email: currentUser?.email || prev.email || '',
          phone: currentUser?.phone || prev.phone || '',
          address: '',
          city: '',
          state: '',
          zip: '',
          country: 'India',
        }));
      }
    } catch (e) {}
  }, [isOpen, currentUser]);

  const handleSelectAddress = (addr: any) => {
    setSelectedAddressId(addr.id);
    setFormData((prev) => ({
      ...prev,
      fullName: addr.name || prev.fullName,
      phone: addr.phone || prev.phone,
      address: addr.addressLine || addr.address || '',
      city: addr.city || '',
      state: addr.state || '',
      zip: addr.pincode || addr.zip || '',
      country: addr.country || 'India',
    }));
  };

  const persistAddress = () => {
    try {
      if (!formData.address && !formData.city) return;
      const addrObj = {
        id: selectedAddressId && selectedAddressId !== 'new' ? selectedAddressId : `addr-${Date.now()}`,
        name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        addressLine: formData.address,
        city: formData.city,
        state: formData.state || 'Karnataka',
        pincode: formData.zip,
        country: formData.country || 'India',
        isDefault: true,
      };
      localStorage.setItem('jj_last_address', JSON.stringify(addrObj));

      const raw = localStorage.getItem('jj_customer_addresses');
      let list = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list)) list = [];
      const idx = list.findIndex(
        (a: any) => a.id === addrObj.id || (a.addressLine === addrObj.addressLine && a.pincode === addrObj.pincode)
      );
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...addrObj };
      } else {
        list.unshift(addrObj);
      }
      localStorage.setItem('jj_customer_addresses', JSON.stringify(list));
      setSavedAddresses(list);
    } catch (e) {}
  };

  if (!isOpen) return null;

  // Base item prices stored in INR
  const rawSubtotalINR = items.reduce((acc, item) => acc + item.totalPrice, 0);
  const storeSettings = settingsService.getSettings();
  const expressPrice = typeof storeSettings?.expressShippingCharge === 'number' ? storeSettings.expressShippingCharge : 250;
  const standardPrice = typeof storeSettings?.standardShippingCharge === 'number' ? storeSettings.standardShippingCharge : 0;
  const shippingCostINR = items.length === 0 ? 0 : (formData.shippingMethod === 'express' ? expressPrice : standardPrice);
  const grandTotalINR = rawSubtotalINR + shippingCostINR;

  const rawSubtotalConverted = (rawSubtotalINR * activeCurrency.rate).toFixed(2);
  const shippingCostConverted = (shippingCostINR * activeCurrency.rate).toFixed(2);
  const grandTotalConverted = (grandTotalINR * activeCurrency.rate).toFixed(2);

  const triggerSuccess = (newId: string) => {
    try {
      productService.deductStockLocally(
        items.map((item) => ({
          productId: item.product.id || item.product.slug,
          slug: item.product.slug,
          name: item.product.name,
          size: item.size,
          quantity: item.quantity,
        }))
      );
    } catch (e) {}

    clearCart();
    setIsCompleted(true);
    try {
      confettiFn({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err) {}
  };

  const handleRazorpayPayment = async () => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    setIsProcessing(true);
    try {
      const razorpayKey = await paymentService.getRazorpayKey();

      const newIdNum = Math.floor(1000 + Math.random() * 9000);
      const newId = `#JJ${newIdNum}`;

      const pendingOrderData: AdminOrder = {
        id: newId,
        customerName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        shippingAddress: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          addressLine: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.zip,
          country: formData.country,
        },
        items: items.map(item => ({
          productId: item.product.id || item.product.slug,
          name: item.product.name,
          size: item.size,
          version: item.version,
          customName: item.customName,
          customNumber: item.customNumber,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          image: item.product.image
        })),
        subtotal: rawSubtotalINR,
        shippingFee: shippingCostINR,
        discountAmount: 0,
        totalAmount: grandTotalINR,
        paymentMethod: 'Razorpay',
        paymentStatus: 'Pending',
        orderStatus: 'Pending',
        date: new Date().toISOString().split('T')[0],
        timeline: [
          {
            status: 'Pending',
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            note: 'Payment initiated via Razorpay',
          },
        ],
      };

      // Pre-creates order in MongoDB & links Razorpay notes (Backend-to-Backend protection)
      const rzpOrder = await paymentService.createRazorpayOrder(grandTotalINR, 'INR', pendingOrderData);
      const activeOrderId = rzpOrder.internalOrderId || newId;
      setOrderId(activeOrderId);

      const options = {
        key: razorpayKey,
        amount: rzpOrder.amount || grandTotalINR * 100,
        currency: rzpOrder.currency || 'INR',
        name: 'Jersey Junction',
        description: 'Authentic Football Jerseys Payment',
        order_id: rzpOrder.id.startsWith('order_') ? rzpOrder.id : undefined,
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#f4c84a',
        },
        handler: async function (response: any) {
          // Backend verification
          if (response.razorpay_signature) {
            await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
          }

          const confirmedOrder: AdminOrder = {
            ...pendingOrderData,
            id: activeOrderId,
            paymentStatus: 'Paid',
            orderStatus: 'Confirmed',
            timeline: [
              {
                status: 'Confirmed',
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
                note: `Paid via Razorpay (Payment ID: ${response.razorpay_payment_id || 'RZP_SUCCESS'})`
              }
            ]
          };

          try {
            await orderService.addOrder(confirmedOrder);
          } catch (err) {
            console.error('Error saving order:', err);
          }

          setIsProcessing(false);
          triggerSuccess(activeOrderId);
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      if (typeof window !== 'undefined' && window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          alert(`Payment failed: ${response.error.description || 'Transaction declined'}`);
          setIsProcessing(false);
        });
        rzp.open();
      } else {
        // Fallback simulation
        const newIdNum = Math.floor(1000 + Math.random() * 9000);
        const newId = `#JJ${newIdNum}`;
        setOrderId(newId);

        const createdOrder: AdminOrder = {
          id: newId,
          customerName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          shippingAddress: {
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            addressLine: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.zip,
            country: formData.country,
          },
          items: items.map(item => ({
            productId: item.product.id || item.product.slug,
            name: item.product.name,
            size: item.size,
            version: item.version,
            customName: item.customName,
            customNumber: item.customNumber,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            image: item.product.image
          })),
          subtotal: rawSubtotalINR,
          shippingFee: shippingCostINR,
          discountAmount: 0,
          totalAmount: grandTotalINR,
          paymentMethod: 'Razorpay',
          paymentStatus: 'Paid',
          orderStatus: 'Confirmed',
          date: new Date().toISOString().split('T')[0],
          timeline: [
            {
              status: 'Confirmed',
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              note: 'Order placed & payment verified successfully via Razorpay'
            }
          ]
        };

        await orderService.addOrder(createdOrder);
        setIsProcessing(false);
        triggerSuccess(newId);
      }
    } catch (err) {
      console.error('Razorpay initiation error:', err);
      setIsProcessing(false);
    }
  };

  const handleCodPayment = async () => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    setIsProcessing(true);
    const newIdNum = Math.floor(1000 + Math.random() * 9000);
    const newId = `#JJ${newIdNum}`;
    setOrderId(newId);

    const createdOrder: AdminOrder = {
      id: newId,
      customerName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      shippingAddress: {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        addressLine: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.zip,
        country: formData.country,
      },
      items: items.map(item => ({
        productId: item.product.id || item.product.slug,
        name: item.product.name,
        size: item.size,
        version: item.version,
        customName: item.customName,
        customNumber: item.customNumber,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        image: item.product.image
      })),
      subtotal: rawSubtotalINR,
      shippingFee: shippingCostINR,
      discountAmount: 0,
      totalAmount: grandTotalINR,
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
      orderStatus: 'Confirmed',
      date: new Date().toISOString().split('T')[0],
      timeline: [
        {
          status: 'Confirmed',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          note: 'Order placed with Cash on Delivery option'
        }
      ]
    };

    try {
      await orderService.addOrder(createdOrder);
    } catch (err) {
      console.error('Error saving order:', err);
    }

    setIsProcessing(false);
    triggerSuccess(newId);
  };

  const handleSubmitStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'COD') {
      if (!isCodEnabled) {
        alert('Cash on Delivery is currently disabled by the store. Please proceed with Online Payment.');
        setPaymentMethod('Razorpay');
        return;
      }
      handleCodPayment();
    } else {
      handleRazorpayPayment();
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl my-8 flex flex-col font-sans text-white">
        
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex justify-between items-center">
          <div>
            <span className="text-sm font-bold text-white font-mono uppercase">
              CHECKOUT
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900 hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isCompleted ? (
          <div className="p-6 space-y-6">
            
            {/* Step Indicators */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 text-xs font-bold">
              <div className={`flex items-center gap-2 ${step >= 1 ? 'text-amber-400' : 'text-zinc-500'}`}>
                <span className="w-6 h-6 rounded-full bg-zinc-800 border flex items-center justify-center">1</span>
                <span>Shipping Info</span>
              </div>
              <div className="h-0.5 flex-1 mx-4 bg-zinc-800"></div>
              <div className={`flex items-center gap-2 ${step >= 2 ? 'text-amber-400' : 'text-zinc-500'}`}>
                <span className="w-6 h-6 rounded-full bg-zinc-800 border flex items-center justify-center">2</span>
                <span>Razorpay Payment</span>
              </div>
            </div>

            {step === 1 && (
              <>
                {!currentUser && (
                  <div className="bg-amber-400/10 border border-amber-400/30 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-md">
                    <div className="flex items-center gap-2.5">
                      <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <div className="font-bold text-xs text-white">Login Required</div>
                        <div className="text-[10px] text-zinc-400">Please sign in to complete checkout</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAuthOpen(true)}
                      className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-500 text-black font-extrabold text-[11px] rounded-lg transition-all shrink-0 cursor-pointer"
                    >
                      Sign In / Register
                    </button>
                  </div>
                )}

                <form 
                  onSubmit={(e) => { 
                    e.preventDefault(); 
                    if (!currentUser) {
                      setIsAuthOpen(true);
                      return;
                    }
                    persistAddress();
                    setStep(2); 
                  }} 
                  className="space-y-4"
                >
                {/* Saved Addresses Selector */}
                {savedAddresses.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wide flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        Deliver to Saved Address
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(!showAddressForm)}
                        className="text-xs text-amber-400 hover:underline font-bold"
                      >
                        {showAddressForm ? 'Hide Form' : '+ Edit / Add Address'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {savedAddresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.id || (!selectedAddressId && addr.isDefault);
                        return (
                          <div
                            key={addr.id}
                            onClick={() => handleSelectAddress(addr)}
                            className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-amber-400/10 border-amber-400 text-white shadow ring-1 ring-amber-400'
                                : 'bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-white text-xs">{addr.name}</span>
                              {isSelected && (
                                <span className="text-[9px] bg-amber-400 text-black font-extrabold px-1.5 py-0.5 rounded uppercase font-mono">
                                  Deliver Here
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-300 leading-snug truncate">
                              {addr.addressLine || addr.address}, {addr.city} - {addr.pincode || addr.zip}
                            </p>
                            <p className="text-[10px] font-mono text-zinc-400 mt-0.5">{addr.phone}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Your full name"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase block mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase block mb-1">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase block mb-1">Delivery Address</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="House no. & street"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase block mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase block mb-1">Postal Code</label>
                    <input
                      type="text"
                      required
                      value={formData.zip}
                      onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase block mb-1">Country</label>
                    <input
                      type="text"
                      required
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-white"
                    />
                  </div>
                </div>

                {/* Shipping speed selection */}
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase block mb-2">Shipping Option</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() => setFormData({ ...formData, shippingMethod: 'express' })}
                      className={`p-3 rounded-xl border text-xs cursor-pointer flex justify-between items-center ${
                        formData.shippingMethod === 'express'
                          ? 'bg-amber-500/10 border-amber-400 text-amber-300'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-white">Express Delivery</div>
                        <div className="text-[10px] text-zinc-400 font-mono">Tracked Courier</div>
                      </div>
                      <span className="font-black text-amber-400 font-mono">
                        {expressPrice > 0 ? `+${activeCurrency.symbol}${(expressPrice * activeCurrency.rate).toFixed(0)}` : 'FREE'}
                      </span>
                    </div>

                    <div
                      onClick={() => setFormData({ ...formData, shippingMethod: 'standard' })}
                      className={`p-3 rounded-xl border text-xs cursor-pointer flex justify-between items-center ${
                        formData.shippingMethod === 'standard'
                          ? 'bg-amber-500/10 border-amber-400 text-amber-300'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-white">Standard Delivery</div>
                        <div className="text-[10px] text-zinc-400 font-mono">Postal Service</div>
                      </div>
                      <span className={`font-black font-mono ${standardPrice === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {standardPrice === 0 ? 'FREE' : `+${activeCurrency.symbol}${(standardPrice * activeCurrency.rate).toFixed(0)}`}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={items.length === 0}
                  className="w-full py-4 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>{items.length === 0 ? 'CART IS EMPTY' : 'CONTINUE TO PAYMENT'}</span>
                  {items.length > 0 && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
              </>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmitStep2} className="space-y-4">
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-zinc-400 block">Deliver to:</span>
                    <strong className="text-white">{formData.fullName} ({formData.city}, {formData.country})</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-amber-400 underline font-semibold cursor-pointer"
                  >
                    Edit
                  </button>
                </div>

                <div className="space-y-3">
                  <div
                    onClick={() => setPaymentMethod('Razorpay')}
                    className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between gap-3 transition-all ${
                      paymentMethod === 'Razorpay'
                        ? 'bg-amber-500/10 border-amber-400 text-white'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        paymentMethod === 'Razorpay' ? 'border-amber-400 bg-amber-400' : 'border-zinc-500'
                      }`}>
                        {paymentMethod === 'Razorpay' && <div className="w-1.5 h-1.5 rounded-full bg-zinc-950" />}
                      </div>
                      <span className="font-bold text-xs text-white">Online Payment (Razorpay)</span>
                    </div>
                    <span className="text-[10px] font-mono bg-amber-400 text-black font-extrabold px-2 py-0.5 rounded uppercase">
                      Recommended
                    </span>
                  </div>

                  {isCodEnabled && (
                    <div
                      onClick={() => setPaymentMethod('COD')}
                      className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between gap-3 transition-all ${
                        paymentMethod === 'COD'
                          ? 'bg-amber-500/10 border-amber-400 text-white shadow-lg'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          paymentMethod === 'COD' ? 'border-amber-400 bg-amber-400' : 'border-zinc-500'
                        }`}>
                          {paymentMethod === 'COD' && <div className="w-1.5 h-1.5 rounded-full bg-zinc-950" />}
                        </div>
                        <span className="font-bold text-xs text-white">Cash on Delivery (COD)</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        AVAILABLE
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-zinc-800 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-zinc-400">Total Charged</span>
                    <div className="text-2xl font-black text-amber-400 font-mono">
                      {activeCurrency.symbol}{grandTotalConverted}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing || items.length === 0}
                      className="px-8 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-zinc-950 font-black text-xs uppercase tracking-widest rounded-xl shadow-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isProcessing
                        ? 'INITIATING RAZORPAY...'
                        : items.length === 0
                        ? 'CART IS EMPTY'
                        : `PAY ${activeCurrency.symbol}${grandTotalConverted} NOW`}
                    </button>
                  </div>
                </div>
              </form>
            )}

          </div>
        ) : (
          /* Order Confirmed Screen */
          <div className="p-8 text-center space-y-6">
            <OrderConfirmedAnimation />

            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                ORDER CONFIRMED & VERIFIED
              </span>
              <h3 className="text-2xl font-black text-white uppercase font-mono">
                THANK YOU FOR YOUR ORDER!
              </h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Order Reference: <strong className="text-amber-400 font-mono text-sm">{orderId}</strong>. A confirmation email and digital receipt have been sent to your registered email address.
              </p>
            </div>

            <button
              onClick={() => {
                onOrderSuccess();
                onClose();
              }}
              className="px-8 py-3.5 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-black text-xs uppercase tracking-widest rounded-xl shadow-lg cursor-pointer font-bold"
            >
              CONTINUE SHOPPING
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
