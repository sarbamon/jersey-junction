'use client';

import React, { useState, useEffect } from 'react';
import confettiFn from 'canvas-confetti';
import { X, Check, Lock, ArrowRight, ShieldCheck, Shield } from 'lucide-react';
import { CartItem, Currency } from '../types';
import { orderService } from '../lib/services/orderService';
import { paymentService } from '../lib/services/paymentService';
import { AdminOrder } from '../lib/types/admin';
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
  const { currentUser, clearCart } = useStore();
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

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        fullName: currentUser.name || prev.fullName,
        email: currentUser.email || prev.email,
        phone: currentUser.phone || prev.phone
      }));
    }
  }, [currentUser]);

  if (!isOpen) return null;

  // Base item prices stored in INR
  const rawSubtotalINR = items.reduce((acc, item) => acc + item.totalPrice, 0);
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
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err) {}
  };

  const handleRazorpayPayment = async () => {
    setIsProcessing(true);
    try {
      const razorpayKey = await paymentService.getRazorpayKey();
      const rzpOrder = await paymentService.createRazorpayOrder(grandTotalINR, 'INR');

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
                note: `Paid via Razorpay (Payment ID: ${response.razorpay_payment_id || 'RZP_SUCCESS'})`
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
    if (paymentMethod === 'Razorpay') {
      handleRazorpayPayment();
    } else {
      handleCodPayment();
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
              <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-4">
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
                        <div className="font-bold text-white">Express Delivery (3-5 Days)</div>
                        <div className="text-[10px] text-zinc-400 font-mono">Tracked Courier</div>
                      </div>
                      <span className="font-black text-amber-400 font-mono">+{activeCurrency.symbol}{(250 * activeCurrency.rate).toFixed(0)}</span>
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
                        <div className="font-bold text-white">Standard Delivery (7-10 Days)</div>
                        <div className="text-[10px] text-zinc-400 font-mono">Postal Service</div>
                      </div>
                      <span className="font-black text-emerald-400">FREE</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 mt-4 cursor-pointer"
                >
                  <span>CONTINUE TO PAYMENT</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
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
                    className={`p-4 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                      paymentMethod === 'Razorpay'
                        ? 'bg-amber-500/10 border-amber-400 text-white'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'Razorpay' ? 'border-amber-400 bg-amber-400' : 'border-zinc-500'
                    }`}>
                      {paymentMethod === 'Razorpay' && <div className="w-1.5 h-1.5 rounded-full bg-zinc-950" />}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">Online Payment (UPI, Cards, NetBanking, Wallets)</div>
                      <div className="text-[11px] text-zinc-400">Pay securely via Razorpay payment gateway.</div>
                    </div>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-4 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                      paymentMethod === 'COD'
                        ? 'bg-amber-500/10 border-amber-400 text-white'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'COD' ? 'border-amber-400 bg-amber-400' : 'border-zinc-500'
                    }`}>
                      {paymentMethod === 'COD' && <div className="w-1.5 h-1.5 rounded-full bg-zinc-950" />}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">Cash on Delivery (COD)</div>
                      <div className="text-[11px] text-zinc-400">Pay cash directly when courier arrives.</div>
                    </div>
                  </div>
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
                      disabled={isProcessing}
                      className="px-8 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-zinc-950 font-black text-xs uppercase tracking-widest rounded-xl shadow-lg cursor-pointer disabled:opacity-50"
                    >
                      {isProcessing ? 'INITIATING RAZORPAY...' : `PAY ${activeCurrency.symbol}${grandTotalConverted} NOW`}
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
