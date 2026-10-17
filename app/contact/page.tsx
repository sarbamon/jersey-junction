'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  ChevronRight, 
  MessageSquare, 
  CheckCircle2,
  HelpCircle,
  Truck,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { useStore } from '../../context/StoreContext';
import { settingsService } from '../../lib/services/settingsService';
import { StoreSettings } from '../../lib/types/admin';
import { productService } from '../../lib/services/productService';
import { JerseyProduct } from '../../types';
import { SizeGuideModal } from '../../components/SizeGuideModal';
import { CustomJerseyStudio } from '../../components/CustomJerseyStudio';
import { CartDrawer } from '../../components/CartDrawer';

export default function ContactPage() {
  const router = useRouter();
  const { 
    wishlist, 
    activeCurrency, 
    cartItems, 
    updateQuantity, 
    removeFromCart,
    isCartOpen,
    setIsCartOpen,
    discountPercentage,
    applyCoupon,
    setActiveCurrency,
    addToCart
  } = useStore();

  const [products, setProducts] = useState<JerseyProduct[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isCustomStudioOpen, setIsCustomStudioOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [subject, setSubject] = useState('Order & Shipping Inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    setStoreSettings(settingsService.getSettings());
    const cached = productService.getCachedProductsSync();
    if (cached.length > 0) setProducts(cached);
    productService.getActiveProducts().then(setProducts).catch(() => {});
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setName('');
      setEmail('');
      setOrderNumber('');
      setMessage('');
    }, 800);
  };

  const emailAddress = storeSettings?.storeEmail || 'support@jerseyjunction.com';
  const phoneNumber = storeSettings?.storePhone || '+91 98765 43210';
  const addressText = storeSettings?.storeAddress || '108 Sports Hub Plaza, MG Road, Bengaluru, Karnataka, India';

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-[#f4c84a] selection:text-black">
      
      {/* Navigation Header */}
      <Navbar
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        wishlistCount={wishlist.length}
        activeCurrency={activeCurrency}
        onSelectCurrency={setActiveCurrency}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenCustomLab={() => setIsCustomStudioOpen(true)}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onSelectCategory={() => router.push('/shop')}
        products={products}
        onSelectProduct={(p) => router.push(`/shop/${p.slug}`)}
      />

      {/* Breadcrumb Bar */}
      <div className="bg-[#0a0a0a] border-b border-[#242424] py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-gray-400 font-medium">
          <Link href="/" className="hover:text-[#f4c84a] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
          <span className="text-[#f4c84a] font-bold">Contact Us</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
        
        {/* Header Hero Title */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="inline-block rounded-full bg-[#f4c84a]/10 px-4 py-1 text-xs font-mono font-bold text-[#f4c84a] border border-[#f4c84a]/20 uppercase tracking-widest">
            GET IN TOUCH
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-serif uppercase tracking-tight text-white">
            WE ARE HERE TO HELP
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
            Have questions regarding your jersey order, sizing recommendations, or bespoke customization? Reach out and our support crew will get back to you within 24 hours.
          </p>
        </div>

        {/* Contact Information Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Card 1: Email */}
          <div className="bg-[#0d0d0d] border border-[#242424] hover:border-[#f4c84a]/40 p-6 rounded-2xl space-y-3 transition-colors shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-[#f4c84a]/10 border border-[#f4c84a]/20 flex items-center justify-center text-[#f4c84a]">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-black uppercase text-sm text-white">Email Us</h3>
            <p className="text-xs text-gray-400">Direct response for orders, sizing, and press inquiries.</p>
            <a 
              href={`mailto:${emailAddress}`} 
              className="text-xs font-bold text-[#f4c84a] hover:underline block break-all font-mono"
            >
              {emailAddress}
            </a>
          </div>

          {/* Card 2: Phone & WhatsApp */}
          <div className="bg-[#0d0d0d] border border-[#242424] hover:border-[#f4c84a]/40 p-6 rounded-2xl space-y-3 transition-colors shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-[#f4c84a]/10 border border-[#f4c84a]/20 flex items-center justify-center text-[#f4c84a]">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-black uppercase text-sm text-white">Call / WhatsApp</h3>
            <p className="text-xs text-gray-400">Instant assistance for urgent order tracking or custom prints.</p>
            <a 
              href={`tel:${phoneNumber}`} 
              className="text-xs font-bold text-[#f4c84a] hover:underline block font-mono"
            >
              {phoneNumber}
            </a>
          </div>

          {/* Card 3: Operating Hours */}
          <div className="bg-[#0d0d0d] border border-[#242424] hover:border-[#f4c84a]/40 p-6 rounded-2xl space-y-3 transition-colors shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-[#f4c84a]/10 border border-[#f4c84a]/20 flex items-center justify-center text-[#f4c84a]">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-black uppercase text-sm text-white">Support Hours</h3>
            <p className="text-xs text-gray-400">Available Monday through Saturday</p>
            <span className="text-xs font-bold text-gray-300 block font-mono">
              10:00 AM – 8:00 PM IST
            </span>
          </div>

          {/* Card 4: Headquarters */}
          <div className="bg-[#0d0d0d] border border-[#242424] hover:border-[#f4c84a]/40 p-6 rounded-2xl space-y-3 transition-colors shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-[#f4c84a]/10 border border-[#f4c84a]/20 flex items-center justify-center text-[#f4c84a]">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-black uppercase text-sm text-white">Headquarters</h3>
            <p className="text-xs text-gray-400">Central Fulfillment & Design Studio</p>
            <span className="text-xs text-gray-300 block leading-tight font-sans">
              {addressText}
            </span>
          </div>

        </div>

        {/* Contact Form Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-7 bg-[#0d0d0d] border border-[#242424] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
            <div className="border-b border-[#202020] pb-4 space-y-1">
              <h2 className="font-serif font-black text-xl sm:text-2xl uppercase tracking-tight text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#f4c84a]" />
                <span>Send Us A Message</span>
              </h2>
              <p className="text-xs text-gray-400">
                Fill out the form below and we will get back to you promptly.
              </p>
            </div>

            {isSubmitted ? (
              <div className="bg-[#141414] border border-[#f4c84a]/30 rounded-2xl p-8 text-center space-y-4 animate-fade-in">
                <CheckCircle2 className="w-12 h-12 text-[#f4c84a] mx-auto animate-bounce" />
                <h3 className="font-serif font-black text-xl text-white uppercase">Message Sent Successfully!</h3>
                <p className="text-xs text-gray-300 max-w-md mx-auto">
                  Thank you for reaching out to Jersey Junction. Our customer support team has received your ticket and will reply via email shortly.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="px-6 py-2.5 bg-[#f4c84a] hover:bg-amber-400 text-black font-extrabold uppercase rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-300 uppercase">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Lionel Messi"
                      className="w-full bg-[#141414] border border-[#2a2a2a] focus:border-[#f4c84a] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-300 uppercase">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. you@domain.com"
                      className="w-full bg-[#141414] border border-[#2a2a2a] focus:border-[#f4c84a] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-300 uppercase">Order ID (Optional)</label>
                    <input
                      type="text"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      placeholder="e.g. #JJ-10492"
                      className="w-full bg-[#141414] border border-[#2a2a2a] focus:border-[#f4c84a] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-300 uppercase">Subject *</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-[#141414] border border-[#2a2a2a] focus:border-[#f4c84a] rounded-xl px-4 py-3 text-white focus:outline-none transition-colors"
                    >
                      <option value="Order & Shipping Inquiry">Order & Shipping Inquiry</option>
                      <option value="Size & Fit Assistance">Size & Fit Assistance</option>
                      <option value="Custom Name & Number Request">Custom Name & Number Request</option>
                      <option value="Returns & Exchange Request">Returns & Exchange Request</option>
                      <option value="Wholesale & Bulk Teams">Wholesale & Bulk Teams</option>
                      <option value="Other Questions">Other Questions</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-300 uppercase">Message *</label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your inquiry with detail..."
                    className="w-full bg-[#141414] border border-[#2a2a2a] focus:border-[#f4c84a] rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none transition-colors resize-none leading-relaxed"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#f4c84a] to-amber-500 hover:from-amber-400 hover:to-amber-600 text-black font-extrabold uppercase rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg hover:scale-105"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                  </button>
                </div>

              </form>
            )}

          </div>

          {/* Quick FAQ Helper Box */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-[#0d0d0d] border border-[#242424] rounded-3xl p-6 sm:p-8 space-y-5">
              <div className="flex items-center gap-2 text-[#f4c84a]">
                <HelpCircle className="w-5 h-5" />
                <h3 className="font-serif font-black uppercase text-base text-white">Frequently Asked</h3>
              </div>

              <div className="space-y-4 text-xs divide-y divide-[#1f1f1f]">
                <div className="pt-3 first:pt-0 space-y-1">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-[#f4c84a] shrink-0" />
                    <span>When will my order arrive?</span>
                  </h4>
                  <p className="text-gray-400 leading-relaxed pl-5">
                    Orders are processed within 24-48 hours. Express tracked delivery usually takes 3-7 business days across India.
                  </p>
                </div>

                <div className="pt-3 space-y-1">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#f4c84a] shrink-0" />
                    <span>Are names & numbers heat-pressed?</span>
                  </h4>
                  <p className="text-gray-400 leading-relaxed pl-5">
                    Yes! All custom prints use authentic thermo-bonded official fonts identical to matchday player kits.
                  </p>
                </div>

                <div className="pt-3 space-y-1">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <RotateCcw className="w-3.5 h-3.5 text-[#f4c84a] shrink-0" />
                    <span>What is your return policy?</span>
                  </h4>
                  <p className="text-gray-400 leading-relaxed pl-5">
                    Defective or incorrect items can be returned within 7 days of delivery with original tags intact.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/terms"
                  className="text-xs text-[#f4c84a] hover:underline font-bold flex items-center gap-1 font-mono uppercase"
                >
                  <span>Read Full Policies & Terms</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Footer */}
      <Footer
        onOpenCustomLab={() => setIsCustomStudioOpen(true)}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onSelectSport={() => router.push('/shop')}
      />

      {/* Cart Drawer & Size Guide */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems} 
        onUpdateQuantity={updateQuantity} 
        onRemoveItem={removeFromCart} 
        activeCurrency={activeCurrency} 
        onOpenCheckout={() => router.push('/checkout')} 
        discountPercentage={discountPercentage} 
        onApplyCoupon={applyCoupon} 
      />

      <SizeGuideModal 
        isOpen={isSizeGuideOpen} 
        onClose={() => setIsSizeGuideOpen(false)} 
      />

      {isCustomStudioOpen && (
        <CustomJerseyStudio 
          isOpen={isCustomStudioOpen} 
          onClose={() => setIsCustomStudioOpen(false)} 
          activeCurrency={activeCurrency}
          onAddToCart={addToCart}
        />
      )}

    </div>
  );
}
