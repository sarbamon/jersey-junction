'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ChevronRight, 
  MessageSquare, 
  CheckCircle2,
  HelpCircle,
  Truck,
  RotateCcw,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { useStore } from '../../context/StoreContext';
import { productService } from '../../lib/services/productService';
import { JerseyProduct } from '../../types';
import { SizeGuideModal } from '../../components/SizeGuideModal';
import { CustomJerseyStudio } from '../../components/CustomJerseyStudio';
import { CartDrawer } from '../../components/CartDrawer';
import { settingsService } from '../../lib/services/settingsService';
import { orderService } from '../../lib/services/orderService';
import { AdminOrder } from '../../lib/types/admin';

export default function ContactPage() {
  const router = useRouter();
  const { 
    currentUser,
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
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isCustomStudioOpen, setIsCustomStudioOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [subject, setSubject] = useState('Order & Shipping Inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [whatsappSentUrl, setWhatsappSentUrl] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('917002740268');

  // User Account Orders
  const [userOrders, setUserOrders] = useState<AdminOrder[]>([]);
  const [isManualOrder, setIsManualOrder] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Pre-fill Order ID from URL query parameters if present (e.g. /contact?orderId=JJ1001)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlOrderId = params.get('orderId') || params.get('order');
      if (urlOrderId) {
        setOrderNumber(urlOrderId.startsWith('#') ? urlOrderId : `#${urlOrderId}`);
      }
    }
  }, []);

  // Fetch orders from logged-in user account & auto-fill credentials
  useEffect(() => {
    let isMounted = true;
    if (currentUser) {
      if (currentUser.name && !name) setName(currentUser.name);

      setIsLoadingOrders(true);
      orderService
        .getUserOrdersAsync(currentUser.email, currentUser.phone)
        .then((orders) => {
          if (isMounted) {
            if (orders && orders.length > 0) {
              setUserOrders(orders);
            } else {
              const local = orderService.getOrders();
              if (local.length > 0) setUserOrders(local);
            }
          }
        })
        .catch(() => {
          if (isMounted) {
            const local = orderService.getOrders();
            if (local.length > 0) setUserOrders(local);
          }
        })
        .finally(() => {
          if (isMounted) setIsLoadingOrders(false);
        });
    } else {
      const local = orderService.getOrders();
      if (local.length > 0) setUserOrders(local);
    }
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  useEffect(() => {
    const s = settingsService.getSettings();
    const raw = s.storeWhatsapp || s.storePhone || '917002740268';
    const clean = raw.replace(/\D/g, '');
    const withCountry = clean.startsWith('91') ? clean : (clean.length === 10 ? `91${clean}` : clean);
    setWhatsappNumber(withCountry || '917002740268');
  }, []);

  useEffect(() => {
    const cached = productService.getCachedProductsSync();
    if (cached.length > 0) setProducts(cached);
    productService.getActiveProducts().then(setProducts).catch(() => {});
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    const lines = [
      `*New Inquiry - Jersey Junction*`,
      `*Name:* ${name.trim()}`,
      orderNumber.trim() ? `*Order ID:* ${orderNumber.trim()}` : null,
      `*Subject:* ${subject.trim()}`,
      ``,
      `*Message:*`,
      message.trim(),
    ].filter(Boolean).join('\n');

    const clean = whatsappNumber.replace(/\D/g, '') || '917002740268';
    const target = clean.startsWith('91') ? clean : (clean.length === 10 ? `91${clean}` : clean);
    const waUrl = `https://wa.me/${target}?text=${encodeURIComponent(lines)}`;

    setWhatsappSentUrl(waUrl);
    setIsSubmitted(true);

    if (typeof window !== 'undefined') {
      window.open(waUrl, '_blank');
    }
  };

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
          <h1 className="text-3xl sm:text-5xl font-black font-serif uppercase tracking-tight text-white">
            WE ARE HERE TO HELP
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
            Have questions regarding your jersey order, sizing recommendations, or bespoke customization? Reach out and our support crew will get back to you within 24 hours.
          </p>
        </div>

        {/* Contact Form Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-7 bg-[#0d0d0d] border border-[#242424] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
            <div className="border-b border-[#202020] pb-4 space-y-1">
              <h2 className="font-serif font-black text-xl sm:text-2xl uppercase tracking-tight text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <span>Send Us A Message</span>
              </h2>
              <p className="text-xs text-gray-400">
                Fill out the form below to chat directly with our team on WhatsApp.
              </p>
            </div>

            {isSubmitted ? (
              <div className="bg-[#141414] border border-emerald-500/30 rounded-2xl p-8 text-center space-y-4 animate-fade-in shadow-2xl">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="font-serif font-black text-xl text-white uppercase tracking-tight">WhatsApp Chat Initiated!</h3>
                <p className="text-xs text-gray-300 max-w-md mx-auto leading-relaxed">
                  We opened WhatsApp with your inquiry details. You can now chat directly with our team at <strong className="text-emerald-400 font-mono">+91 70027 40268</strong>.
                </p>
                {whatsappSentUrl && (
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={whatsappSentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold uppercase rounded-xl text-xs transition-transform hover:scale-105 inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30"
                    >
                      <span>Open WhatsApp Again</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => {
                        setIsSubmitted(false);
                        setMessage('');
                      }}
                      className="px-6 py-2.5 bg-[#202020] hover:bg-[#282828] text-white border border-[#333] font-bold uppercase rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Send Another Message
                    </button>
                  </div>
                )}
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
                      className="w-full bg-[#141414] border border-[#2a2a2a] focus:border-emerald-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-300 uppercase">Subject *</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-[#141414] border border-[#2a2a2a] focus:border-emerald-500 rounded-xl px-4 py-3 text-white focus:outline-none transition-colors cursor-pointer"
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

                {/* Order ID: auto-fetched from user account or entered manually */}
                {userOrders.length > 0 ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-gray-300 uppercase flex items-center gap-1.5 text-xs">
                        <span>Order ID (Optional)</span>
                        {isLoadingOrders && <Loader2 className="w-3 h-3 animate-spin text-[#f4c84a]" />}
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsManualOrder(!isManualOrder)}
                        className="text-[11px] text-[#f4c84a] hover:underline cursor-pointer font-medium"
                      >
                        {isManualOrder ? 'Select from my orders' : 'Enter manually'}
                      </button>
                    </div>

                    {isManualOrder ? (
                      <input
                        type="text"
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(e.target.value)}
                        placeholder="e.g. #JJ-10492"
                        className="w-full bg-[#141414] border border-[#2a2a2a] focus:border-[#f4c84a] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors font-mono"
                      />
                    ) : (
                      <div className="relative">
                        <select
                          value={orderNumber}
                          onChange={(e) => {
                            if (e.target.value === '__custom__') {
                              setIsManualOrder(true);
                              setOrderNumber('');
                            } else {
                              setOrderNumber(e.target.value);
                            }
                          }}
                          className="w-full bg-[#141414] border border-[#2a2a2a] focus:border-[#f4c84a] rounded-xl px-4 py-3 text-white focus:outline-none transition-colors font-mono cursor-pointer"
                        >
                          <option value="">Select from your orders ({userOrders.length})...</option>
                          {userOrders.map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.id} • {o.items?.[0]?.name ? `${o.items[0].name.slice(0, 28)}...` : 'Jersey Order'} ({o.date})
                            </option>
                          ))}
                          <option value="__custom__">+ Enter another Order ID manually</option>
                        </select>
                      </div>
                    )}

                    {/* Quick Clickable Chips for Recent Orders */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] text-gray-500 font-mono">My orders:</span>
                      {userOrders.slice(0, 4).map((o) => (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => {
                            setOrderNumber(o.id);
                            setIsManualOrder(false);
                          }}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-mono border transition-all cursor-pointer ${
                            orderNumber === o.id
                              ? 'bg-[#f4c84a] text-black border-[#f4c84a] font-bold shadow-xs'
                              : 'bg-[#181818] text-gray-300 border-[#2a2a2a] hover:border-[#f4c84a] hover:text-white'
                          }`}
                          title={`Select order ${o.id}`}
                        >
                          {o.id}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
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
                )}

                <div className="space-y-1">
                  <label className="font-bold text-gray-300 uppercase">Message *</label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your inquiry with detail..."
                    className="w-full bg-[#141414] border border-[#2a2a2a] focus:border-emerald-500 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none transition-colors resize-none leading-relaxed"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-extrabold uppercase rounded-xl text-xs flex items-center justify-center gap-2.5 cursor-pointer transition-all shadow-lg shadow-emerald-950/60 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.65-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.004c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      <span>Send on WhatsApp</span>
                    </button>
                  </div>

              </form>
            )}

          </div>

          {/* Right Column: Quick FAQ */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-[#0d0d0d] border border-[#242424] rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
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
                    <RotateCcw className="w-3.5 h-3.5 text-[#f4c84a] shrink-0" />
                    <span>What is your return policy?</span>
                  </h4>
                  <p className="text-gray-400 leading-relaxed pl-5">
                    Defective or incorrect items can be returned within 7 days of delivery with original tags intact.
                  </p>
                </div>

                <div className="pt-3 space-y-1">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>How fast is WhatsApp support?</span>
                  </h4>
                  <p className="text-gray-400 leading-relaxed pl-5">
                    Our team is active from 10:00 AM to 9:00 PM IST daily on <strong className="text-emerald-400 font-mono">+91 70027 40268</strong> for tracking, sizing, and order assistance.
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
