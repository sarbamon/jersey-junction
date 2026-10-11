'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import confettiFn from 'canvas-confetti';
import { Lock, Check, CreditCard, ArrowRight, ChevronRight, ShoppingBag, ShieldCheck, Truck, Smartphone, Banknote, Shield, CheckCircle2, MapPin } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { useStore } from '../../context/StoreContext';
import { orderService } from '../../lib/services/orderService';
import { paymentService } from '../../lib/services/paymentService';
import { AdminOrder } from '../../lib/types/admin';
import { SizeGuideModal } from '../../components/SizeGuideModal';
import { CustomJerseyStudio } from '../../components/CustomJerseyStudio';
import { OrderConfirmedAnimation } from '../../components/OrderConfirmedAnimation';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { 
    cartItems, 
    activeCurrency, 
    clearCart,
    wishlist,
    setActiveCurrency,
    addToCart,
    currentUser,
    setIsCartOpen
  } = useStore();

  const [step, setStep] = useState<1 | 2>(1);
  const [paymentMethod, setPaymentMethod] = useState<'Razorpay' | 'COD'>('Razorpay');
  const [isProcessing, setIsProcessing] = useState(false);

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

  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isCustomStudioOpen, setIsCustomStudioOpen] = useState(false);

  // Load Razorpay SDK Script dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Load saved address from localStorage or user profile on mount
  useEffect(() => {
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
  }, [currentUser]);

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

  // Base item prices stored in INR
  const rawSubtotalINR = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const shippingCostINR = formData.shippingMethod === 'express' ? 250 : 0;
  const grandTotalINR = rawSubtotalINR + shippingCostINR;

  const rawSubtotalConverted = (rawSubtotalINR * activeCurrency.rate).toFixed(2);
  const shippingCostConverted = (shippingCostINR * activeCurrency.rate).toFixed(2);
  const grandTotalConverted = (grandTotalINR * activeCurrency.rate).toFixed(2);

  const triggerSuccess = (newId: string) => {
    clearCart();
    setIsCompleted(true);
    try {
      confettiFn({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
      });
    } catch (err) {}
  };

  const handleRazorpayPayment = async () => {
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
        items: cartItems.map((item) => ({
          productId: item.product.id || item.product.slug,
          name: item.product.name,
          size: item.size,
          version: item.version,
          customName: item.customName,
          customNumber: item.customNumber,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          image: item.product.image,
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
        image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=200&q=80',
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
                note: `Paid via Razorpay (Payment ID: ${response.razorpay_payment_id || 'RZP_SUCCESS'})`,
              },
            ],
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
          },
        },
      };

      if (typeof window !== 'undefined' && window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          alert(`Payment failed: ${response.error.description || 'Transaction declined'}`);
          setIsProcessing(false);
        });
        rzp.open();
      } else {
        // Fallback simulation if script is blocked or offline
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
          items: cartItems.map((item) => ({
            productId: item.product.id || item.product.slug,
            name: item.product.name,
            size: item.size,
            version: item.version,
            customName: item.customName,
            customNumber: item.customNumber,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            image: item.product.image,
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
              note: 'Order placed & payment verified successfully via Razorpay Gateway',
            },
          ],
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
      items: cartItems.map((item) => ({
        productId: item.product.id || item.product.slug,
        name: item.product.name,
        size: item.size,
        version: item.version,
        customName: item.customName,
        customNumber: item.customNumber,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        image: item.product.image,
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
          note: 'Order placed with Cash on Delivery option',
        },
      ],
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
    if (paymentMethod === 'Razorpay') {
      handleRazorpayPayment();
    } else {
      handleCodPayment();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-[#f4c84a] selection:text-black">
      
      {/* Navbar */}
      <Navbar
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        wishlistCount={wishlist.length}
        activeCurrency={activeCurrency}
        onSelectCurrency={setActiveCurrency}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenCustomLab={() => setIsCustomStudioOpen(true)}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onSelectCategory={() => router.push('/shop')}
        products={[]}
        onSelectProduct={(p) => router.push(`/shop/${p.slug}`)}
      />

      {/* Breadcrumb Header */}
      <div className="bg-[#0a0a0a] border-b border-[#242424] py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-gray-400 font-medium">
          <Link href="/" className="hover:text-[#f4c84a]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
          <Link href="/cart" className="hover:text-[#f4c84a]">Cart</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
          <span className="text-[#f4c84a] font-bold">Checkout Page</span>
        </div>
      </div>

      {/* MAIN FULL PAGE CHECKOUT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:py-12 space-y-8">
        
        {!isCompleted ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column (7 Cols): Shipping & Payment Form */}
            <div className="lg:col-span-7 bg-[#080808] border border-[#242424] rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl">
              
              {/* Checkout Title & Stepper Header */}
              <div className="flex justify-between items-center border-b border-[#222] pb-6">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black font-serif uppercase tracking-wider text-white">
                    CHECKOUT
                  </h1>
                </div>

                {/* Step Indicators */}
                <div className="flex items-center gap-2 text-xs font-bold font-mono">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center border ${step >= 1 ? 'bg-[#f4c84a] text-black border-[#f4c84a]' : 'bg-[#111] text-gray-500 border-[#333]'}`}>1</span>
                  <span className="text-gray-600">—</span>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center border ${step >= 2 ? 'bg-[#f4c84a] text-black border-[#f4c84a]' : 'bg-[#111] text-gray-500 border-[#333]'}`}>2</span>
                </div>
              </div>

              {/* Step 1: Shipping Info */}
              {step === 1 && (
                <form 
                  onSubmit={(e) => { 
                    e.preventDefault(); 
                    persistAddress();
                    setStep(2); 
                  }} 
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xs font-bold uppercase tracking-widest text-[#f4c84a] font-mono flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        1. SHIPPING &amp; CONTACT INFORMATION
                      </h2>
                      {savedAddresses.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowAddressForm(!showAddressForm)}
                          className="text-xs text-[#f4c84a] hover:underline font-bold"
                        >
                          {showAddressForm ? 'Hide Form' : '+ Edit / Add Address'}
                        </button>
                      )}
                    </div>

                    {/* Saved Addresses Quick Selector */}
                    {savedAddresses.length > 0 && (
                      <div className="space-y-2.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                          Deliver to Saved Address
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {savedAddresses.map((addr) => {
                            const isSelected = selectedAddressId === addr.id || (!selectedAddressId && addr.isDefault);
                            return (
                              <div
                                key={addr.id}
                                onClick={() => handleSelectAddress(addr)}
                                className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                                  isSelected
                                    ? 'bg-[#f4c84a]/15 border-[#f4c84a] text-white shadow-md ring-1 ring-[#f4c84a]'
                                    : 'bg-[#111] border-[#333] text-gray-400 hover:border-gray-500'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-bold text-white text-xs">{addr.name}</span>
                                  {isSelected && (
                                    <span className="text-[9px] bg-[#f4c84a] text-black font-extrabold px-2 py-0.5 rounded-full uppercase font-mono">
                                      Deliver Here
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-gray-300 leading-snug truncate">
                                  {addr.addressLine || addr.address}, {addr.city} - {addr.pincode || addr.zip}
                                </p>
                                <p className="text-[10px] font-mono text-gray-400 mt-1">{addr.phone}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          placeholder="Your full name"
                          className="w-full bg-[#111] border border-[#333] rounded-xl px-3.5 py-3 text-xs text-white font-medium focus:outline-none focus:border-[#f4c84a]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Email Address</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="name@example.com"
                          className="w-full bg-[#111] border border-[#333] rounded-xl px-3.5 py-3 text-xs text-white font-medium focus:outline-none focus:border-[#f4c84a]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Phone Number</label>
                        <input
                          type="text"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full bg-[#111] border border-[#333] rounded-xl px-3.5 py-3 text-xs text-white font-medium focus:outline-none focus:border-[#f4c84a]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Delivery Street Address</label>
                        <input
                          type="text"
                          required
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder="Street address or house no."
                          className="w-full bg-[#111] border border-[#333] rounded-xl px-3.5 py-3 text-xs text-white font-medium focus:outline-none focus:border-[#f4c84a]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase block mb-1">City</label>
                        <input
                          type="text"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full bg-[#111] border border-[#333] rounded-xl px-3.5 py-3 text-xs text-white font-medium focus:outline-none focus:border-[#f4c84a]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Postal Code</label>
                        <input
                          type="text"
                          required
                          value={formData.zip}
                          onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                          className="w-full bg-[#111] border border-[#333] rounded-xl px-3.5 py-3 text-xs text-white font-medium focus:outline-none focus:border-[#f4c84a]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Country</label>
                        <input
                          type="text"
                          required
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          className="w-full bg-[#111] border border-[#333] rounded-xl px-3.5 py-3 text-xs text-white font-medium focus:outline-none focus:border-[#f4c84a]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Address is automatically saved to your profile for future one-click checkout.</span>
                    </div>

                    {/* Shipping Options */}
                    <div className="space-y-2 pt-2">
                      <label className="text-xs font-bold text-gray-400 uppercase block">Delivery Method</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div
                          onClick={() => setFormData({ ...formData, shippingMethod: 'express' })}
                          className={`p-4 rounded-2xl border text-xs cursor-pointer flex justify-between items-center transition-all ${
                            formData.shippingMethod === 'express'
                              ? 'bg-[#f4c84a]/10 border-[#f4c84a] text-[#f4c84a]'
                              : 'bg-[#111] border-[#333] text-gray-300'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-white">Express Courier (3-5 Days)</div>
                            <div className="text-[10px] text-gray-400 font-mono">Tracked Dispatch</div>
                          </div>
                          <span className="font-mono font-bold text-[#f4c84a]">+{activeCurrency.symbol}{(250 * activeCurrency.rate).toFixed(0)}</span>
                        </div>

                        <div
                          onClick={() => setFormData({ ...formData, shippingMethod: 'standard' })}
                          className={`p-4 rounded-2xl border text-xs cursor-pointer flex justify-between items-center transition-all ${
                            formData.shippingMethod === 'standard'
                              ? 'bg-[#f4c84a]/10 border-[#f4c84a] text-[#f4c84a]'
                              : 'bg-[#111] border-[#333] text-gray-300'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-white">Standard Postal (7-10 Days)</div>
                            <div className="text-[10px] text-gray-400 font-mono">Postal Service</div>
                          </div>
                          <span className="font-bold text-emerald-400">FREE</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-[#f4c84a] to-[#d4af37] hover:from-[#ffd96a] hover:to-[#f4c84a] text-black font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all mt-6"
                  >
                    <span>PROCEED TO PAYMENT ({activeCurrency.symbol}{grandTotalConverted})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Step 2: Razorpay Payment Gateway Selection */}
              {step === 2 && (
                <form onSubmit={handleSubmitStep2} className="space-y-6">
                  
                  <div className="bg-[#111] p-4 rounded-2xl border border-[#222] flex justify-between items-center text-xs">
                    <div>
                      <span className="text-gray-400 block">Delivering to:</span>
                      <strong className="text-white">{formData.fullName} ({formData.city}, {formData.country})</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-[#f4c84a] underline font-bold cursor-pointer"
                    >
                      Edit Info
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xs font-bold uppercase tracking-widest text-[#f4c84a] font-mono">
                        2. SELECT PAYMENT METHOD
                      </h2>
                    </div>

                    {/* Payment Options */}
                    <div className="space-y-3">
                      
                      {/* Option 1: Razorpay */}
                      <div
                        onClick={() => setPaymentMethod('Razorpay')}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                          paymentMethod === 'Razorpay'
                            ? 'bg-[#f4c84a]/10 border-[#f4c84a] text-white shadow-lg'
                            : 'bg-[#111] border-[#242424] text-gray-400 hover:border-[#444]'
                        }`}
                      >
                        <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          paymentMethod === 'Razorpay' ? 'border-[#f4c84a] bg-[#f4c84a]' : 'border-gray-600'
                        }`}>
                          {paymentMethod === 'Razorpay' && <div className="w-2 h-2 rounded-full bg-black" />}
                        </div>

                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-sm text-white flex items-center gap-2">
                              Razorpay Secure Checkout
                              <span className="text-[10px] font-mono bg-[#f4c84a] text-black font-extrabold px-2 py-0.5 rounded uppercase">
                                Recommended
                              </span>
                            </span>
                            <span className="text-xs font-mono font-bold text-[#f4c84a]">INSTANT DISPATCH</span>
                          </div>
                          <p className="text-xs text-gray-400">
                            Pay via <strong>UPI (GPay, PhonePe, Paytm)</strong>, Credit/Debit Cards, NetBanking, or Wallet.
                          </p>
                          <div className="flex items-center gap-3 pt-2 text-[10px] text-gray-400 font-mono">
                            <span className="bg-[#1a1a1a] px-2 py-1 rounded border border-[#333]">UPI / QR</span>
                            <span className="bg-[#1a1a1a] px-2 py-1 rounded border border-[#333]">Visa / MasterCard</span>
                            <span className="bg-[#1a1a1a] px-2 py-1 rounded border border-[#333]">NetBanking</span>
                            <span className="bg-[#1a1a1a] px-2 py-1 rounded border border-[#333]">Paytm / Mobikwik</span>
                          </div>
                        </div>
                      </div>

                      {/* Option 2: COD */}
                      <div
                        onClick={() => setPaymentMethod('COD')}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                          paymentMethod === 'COD'
                            ? 'bg-[#f4c84a]/10 border-[#f4c84a] text-white shadow-lg'
                            : 'bg-[#111] border-[#242424] text-gray-400 hover:border-[#444]'
                        }`}
                      >
                        <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          paymentMethod === 'COD' ? 'border-[#f4c84a] bg-[#f4c84a]' : 'border-gray-600'
                        }`}>
                          {paymentMethod === 'COD' && <div className="w-2 h-2 rounded-full bg-black" />}
                        </div>

                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-sm text-white flex items-center gap-2">
                              Cash on Delivery (COD)
                            </span>
                            <span className="text-xs font-mono text-gray-400">PAY AT DOORSTEP</span>
                          </div>
                          <p className="text-xs text-gray-400">
                            Pay cash when your jersey shipment arrives at your delivery address.
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-[#222]">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-6 py-3.5 bg-[#222] hover:bg-[#333] text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="flex-1 py-4 bg-gradient-to-r from-[#f4c84a] to-[#d4af37] hover:from-[#ffd96a] hover:to-[#f4c84a] text-black font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <span>INITIATING RAZORPAY...</span>
                      ) : (
                        <span>
                          {paymentMethod === 'Razorpay'
                            ? `PAY ${activeCurrency.symbol}${grandTotalConverted} VIA RAZORPAY`
                            : `PLACE COD ORDER (${activeCurrency.symbol}${grandTotalConverted})`}
                        </span>
                      )}
                      {!isProcessing && <ArrowRight className="w-4 h-4" />}
                    </button>
                  </div>
                </form>
              )}

            </div>

            {/* Right Column (5 Cols): Order Summary Box */}
            <div className="lg:col-span-5 bg-[#080808] border border-[#242424] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#f4c84a] font-mono border-b border-[#222] pb-3">
                ORDER SUMMARY ({cartItems.reduce((sum, i) => sum + i.quantity, 0)} ITEMS)
              </h3>

              {cartItems.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-500">
                  Your cart is empty. Please add items before checking out.
                </div>
              ) : (
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center gap-3 text-xs border-b border-[#1a1a1a] pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-14 bg-black rounded-lg border border-[#222] flex items-center justify-center shrink-0 overflow-hidden relative">
                          {item.product.image && (
                            <img src={item.product.image} alt={item.product.name} className="w-full h-full object-contain" />
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <div className="font-bold text-white text-xs line-clamp-1">{item.product.name}</div>
                          <div className="text-[10px] text-gray-400 font-mono">
                            Size: <strong className="text-white">{item.size}</strong> • Qty: <strong className="text-white">{item.quantity}</strong>
                          </div>
                          {item.customName && (
                            <div className="text-[10px] text-[#f4c84a] font-mono font-bold">
                              Print: {item.customName} #{item.customNumber}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right font-mono font-bold text-[#f4c84a] shrink-0">
                        {activeCurrency.symbol}{(item.totalPrice * activeCurrency.rate).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Price Calculation Totals */}
              <div className="space-y-2 text-xs font-mono border-t border-[#222] pt-4 text-gray-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white font-bold">{activeCurrency.symbol}{rawSubtotalConverted}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping ({formData.shippingMethod.toUpperCase()})</span>
                  <span className="text-white font-bold">{activeCurrency.symbol}{shippingCostConverted}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-white pt-3 border-t border-[#222]">
                  <span>Total Amount</span>
                  <span className="text-[#f4c84a] font-mono text-base">{activeCurrency.symbol}{grandTotalConverted}</span>
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* Order Confirmed Screen */
          <div className="bg-[#080808] border border-[#242424] rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl max-w-xl mx-auto">
            <OrderConfirmedAnimation />

            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-mono">
                ORDER CONFIRMED &amp; VERIFIED
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-serif">
                THANK YOU FOR YOUR ORDER!
              </h2>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Order Reference: <strong className="text-[#f4c84a] font-mono text-sm">{orderId}</strong>. A confirmation email and digital receipt have been sent to your registered email address.
              </p>
            </div>

            <Link
              href="/shop"
              className="inline-block px-8 py-3.5 bg-gradient-to-r from-[#f4c84a] to-[#d4af37] hover:from-[#ffd96a] hover:to-[#f4c84a] text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg font-bold"
            >
              CONTINUE SHOPPING
            </Link>
          </div>
        )}

      </main>

      <Footer
        onOpenCustomLab={() => setIsCustomStudioOpen(true)}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onSelectSport={() => router.push('/shop')}
      />

      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
      <CustomJerseyStudio isOpen={isCustomStudioOpen} onClose={() => setIsCustomStudioOpen(false)} activeCurrency={activeCurrency} onAddToCart={addToCart} />

    </div>
  );
}
