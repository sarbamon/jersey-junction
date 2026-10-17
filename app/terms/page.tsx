'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
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

export default function TermsPage() {
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

  useEffect(() => {
    setStoreSettings(settingsService.getSettings());
    const cached = productService.getCachedProductsSync();
    if (cached.length > 0) setProducts(cached);
    productService.getActiveProducts().then(setProducts).catch(() => {});
  }, []);

  const emailAddress = storeSettings?.storeEmail || 'support@jerseyjunction.com';

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      
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
        <div className="max-w-4xl mx-auto flex items-center gap-2 text-xs text-zinc-400 font-medium">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-zinc-200">Terms & Conditions</span>
        </div>
      </div>

      {/* Main Content - Normal Text Document */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
        
        {/* Title Header */}
        <div className="space-y-2 border-b border-zinc-800 pb-6">
          <h1 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight text-white uppercase">
            Terms & Conditions
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm">
            Please read these terms carefully before browsing our store or placing an order with Jersey Junction.
          </p>
          <p className="text-xs text-zinc-500 font-mono">
            Last Updated: October 2026
          </p>
        </div>

        {/* Document Sections */}
        <div className="space-y-8 text-zinc-300 text-sm leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wide">
              1. Agreement & Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, or shopping on <strong>Jersey Junction</strong> (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;), you acknowledge and agree to comply with and be bound by the terms, conditions, and policies set forth herein. If you do not agree to all terms, please refrain from using our website or ordering services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wide">
              2. Products, Sizing & Master Quality Standards
            </h2>
            <p>
              We provide premium imported master-quality football and sports jerseys crafted from high-performance breathable fabrics with precision embroidery or heat-applied crests.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li>
                <strong className="text-white">Player Version vs Fan Version:</strong> Player Version jerseys are designed with an athletic, slim fit matching actual pitch kits. If you prefer a relaxed fit, we advise selecting one size larger. Fan Version jerseys feature standard everyday cut.
              </li>
              <li>
                <strong className="text-white">Size Chart:</strong> Please consult our interactive Size Guide prior to checkout. Measurements are in centimeters and inches for chest, waist, and length.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wide">
              3. Custom Names & Numbers (Personalization Policy)
            </h2>
            <p>
              When requesting custom names and numbers on jerseys (e.g. customized names, squad numbers, special tournament sleeve badges):
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li>
                Please verify spelling, numbers, and case carefully before completing your order.
              </li>
              <li>
                Once a personalized kit enters the thermo-printing queue, customized orders cannot be modified or canceled.
              </li>
              <li>
                Personalized jerseys are non-returnable unless there is a confirmed printing error attributable to our workshop.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wide">
              4. Shipping, Dispatch & Tracking
            </h2>
            <p>
              We ship orders promptly via express air courier services.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li>Standard delivery takes 3 to 7 business days depending on destination location.</li>
              <li>Live tracking links will be delivered via SMS and email as soon as the package is handed over to the courier partner.</li>
              <li>Any transit delays resulting from weather anomalies, courier customs clearance, or regional holidays are beyond our immediate control, though our team will proactively follow up.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wide">
              5. Returns, Replacements & Refund Policy
            </h2>
            <p>
              We want you to wear your colors with complete confidence:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li>
                Items received damaged, flawed, or in the wrong size/style are eligible for a replacement or store credit within <strong>7 days</strong> of delivery.
              </li>
              <li>
                Items must be unwashed, unworn, and returned in their original packaging with tags intact.
              </li>
              <li>
                To initiate a claim, please take a clear photo of the issue and contact us at <a href={`mailto:${emailAddress}`} className="text-white underline">{emailAddress}</a>.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wide">
              6. Limitation of Liability & Contact
            </h2>
            <p>
              Jersey Junction shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use this store. For questions regarding our policies or any order inquiries, reach out to our team at:
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
              <span className="text-zinc-400">Email: <a href={`mailto:${emailAddress}`} className="text-white underline">{emailAddress}</a></span>
              <span className="text-zinc-600">|</span>
              <Link href="/contact" className="text-white hover:underline">
                Contact Us &rarr;
              </Link>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <Footer
        onOpenCustomLab={() => setIsCustomStudioOpen(true)}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onSelectSport={() => router.push('/shop')}
      />

      {/* Cart Drawer & Modals */}
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
