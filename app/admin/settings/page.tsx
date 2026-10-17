'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, ShieldCheck, Truck, CreditCard, Share2, Store, Image as ImageIcon, Upload, Loader2, X } from 'lucide-react';
import { settingsService } from '../../../lib/services/settingsService';
import { uploadService } from '../../../lib/services/uploadService';
import { StoreSettings } from '../../../lib/types/admin';
import { Toast } from '../../../components/admin/Toast';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  useEffect(() => {
    setSettings(settingsService.getSettings());
  }, []);

  if (!settings) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = settingsService.updateSettings(settings);
      setSettings(updated);
      setToastMsg('Store settings saved successfully!');
    } catch (err: any) {
      console.error('Save failed:', err);
      setToastMsg(`Could not save settings: ${err.message || 'Storage error'}`);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBanner(true);
    try {
      const url = await uploadService.uploadImage(file);
      setSettings((prev) => (prev ? { ...prev, midBannerImage: url } : prev));
      setToastMsg('Showcase banner picture uploaded successfully!');
    } catch (err: any) {
      setToastMsg(`Upload failed: ${err.message || 'Image upload error'}`);
    } finally {
      setIsUploadingBanner(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/90 p-6 rounded-3xl border border-zinc-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Settings className="w-4 h-4" />
            <span>GLOBAL STORE CONFIGURATION</span>
          </div>
          <h1 className="text-2xl font-black font-serif uppercase tracking-tight text-white">
            STORE SETTINGS
          </h1>
          <p className="text-xs text-zinc-400">
            Configure store profile, shipping thresholds, &amp; payment gateway toggles.
          </p>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Store Profile Card */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 text-amber-400">
            <Store className="w-4 h-4" />
            <h2 className="text-sm font-extrabold font-serif uppercase tracking-wider text-white">
              Store Identity & Contact Info
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-zinc-400 block mb-1 uppercase">Store Name</label>
              <input
                type="text"
                required
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-400 block mb-1 uppercase">Support Email</label>
              <input
                type="email"
                required
                value={settings.storeEmail}
                onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-400 block mb-1 uppercase">Store Phone</label>
              <input
                type="text"
                required
                value={settings.storePhone}
                onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-zinc-400 block mb-1 uppercase">Physical Store Address</label>
            <input
              type="text"
              value={settings.storeAddress}
              onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Shipping & Payment Settings Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Shipping Settings */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 text-amber-400">
              <Truck className="w-4 h-4" />
              <h2 className="text-sm font-extrabold font-serif uppercase tracking-wider text-white">
                Fulfillment & Shipping Rules
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-zinc-400 block mb-1 uppercase">Base Shipping Charge (₹)</label>
                <input
                  type="number"
                  value={settings.shippingCharge}
                  onChange={(e) => setSettings({ ...settings, shippingCharge: Number(e.target.value) })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-400 block mb-1 uppercase">Free Shipping Threshold (₹)</label>
                <input
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.codEnabled}
                  onChange={(e) => setSettings({ ...settings, codEnabled: e.target.checked })}
                  className="w-4 h-4 rounded accent-amber-400 cursor-pointer"
                />
                <span className="font-bold text-white uppercase text-xs">Allow Cash On Delivery (COD)</span>
              </label>
            </div>
          </div>

          {/* Payment Gateway Settings */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 text-amber-400">
              <CreditCard className="w-4 h-4" />
              <h2 className="text-sm font-extrabold font-serif uppercase tracking-wider text-white">
                Payment Integration Gateways
              </h2>
            </div>

            <div className="pt-2 space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.razorpayEnabled}
                  onChange={(e) => setSettings({ ...settings, razorpayEnabled: e.target.checked })}
                  className="w-4 h-4 rounded accent-amber-400 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-white uppercase text-xs block">Razorpay 256-Bit Encrypted Gateway</span>
                  <span className="text-[10px] text-zinc-400">Enables UPI, Credit/Debit Cards, NetBanking at Checkout</span>
                </div>
              </label>
            </div>
          </div>

        </div>

        {/* Social Links Card */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 text-amber-400">
            <Share2 className="w-4 h-4" />
            <h2 className="text-sm font-extrabold font-serif uppercase tracking-wider text-white">
              Social Brand Channels
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-zinc-400 block mb-1 uppercase">Instagram URL</label>
              <input
                type="text"
                value={settings.socials.instagram}
                onChange={(e) => setSettings({ ...settings, socials: { ...settings.socials, instagram: e.target.value } })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-300 font-mono text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-400 block mb-1 uppercase">Facebook URL</label>
              <input
                type="text"
                value={settings.socials.facebook}
                onChange={(e) => setSettings({ ...settings, socials: { ...settings.socials, facebook: e.target.value } })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-300 font-mono text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-400 block mb-1 uppercase">YouTube Channel</label>
              <input
                type="text"
                value={settings.socials.youtube}
                onChange={(e) => setSettings({ ...settings, socials: { ...settings.socials, youtube: e.target.value } })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-300 font-mono text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Homepage Showcase Banner Picture & Content */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 text-amber-400">
            <ImageIcon className="w-4 h-4" />
            <h2 className="text-sm font-extrabold font-serif uppercase tracking-wider text-white">
              Homepage Mid Showcase Banner Picture & Text ("Represent Your Club")
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              <div>
                <label className="font-bold text-zinc-400 block mb-1.5 uppercase">
                  Showcase Banner Picture
                </label>

                {/* Upload action buttons */}
                <div className="flex flex-wrap items-center gap-3 mb-2.5">
                  <label className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all border shadow ${
                    isUploadingBanner 
                      ? 'bg-zinc-800 text-zinc-400 border-zinc-700 cursor-not-allowed' 
                      : 'bg-amber-400 hover:bg-amber-500 text-black border-amber-300 hover:shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                  }`}>
                    {isUploadingBanner ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                        <span>Uploading to Cloudinary...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-black" />
                        <span>Upload Image File</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingBanner}
                      onChange={handleBannerUpload}
                      className="hidden"
                    />
                  </label>

                  {settings.midBannerImage && (
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, midBannerImage: '' })}
                      className="px-3 py-2.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-xs font-bold flex items-center gap-1.5 border border-zinc-800"
                      title="Clear picture"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Remove Picture</span>
                    </button>
                  )}
                </div>

                {/* Direct URL input fallback */}
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                    Or Enter Image URL Directly:
                  </label>
                  <input
                    type="text"
                    placeholder="https://res.cloudinary.com/..."
                    value={settings.midBannerImage || ''}
                    onChange={(e) => setSettings({ ...settings, midBannerImage: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                  />
                  <p className="text-[10px] text-zinc-500">
                    Click <strong>Upload Image File</strong> to choose an image from your device, or paste any image link.
                  </p>
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-400 block mb-1 uppercase">Badge / Tag Text</label>
                <input
                  type="text"
                  value={settings.midBannerTag || ''}
                  onChange={(e) => setSettings({ ...settings, midBannerTag: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-400 block mb-1 uppercase">Main Title</label>
                  <input
                    type="text"
                    value={settings.midBannerTitle || ''}
                    onChange={(e) => setSettings({ ...settings, midBannerTitle: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-400 block mb-1 uppercase">Gold Subtitle</label>
                  <input
                    type="text"
                    value={settings.midBannerSubtitle || ''}
                    onChange={(e) => setSettings({ ...settings, midBannerSubtitle: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="border-t border-zinc-800/80 pt-4 space-y-3">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                    Banner Picture Overlay Text (Bottom-Left of Jersey Photo)
                  </span>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    Leave these empty if you do not want any text displayed over the banner photo.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-zinc-400 block mb-1 uppercase text-[10px]">
                      Overlay Tag / Subtitle
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. AUTHENTIC MASTER QUALITY KITS (optional)"
                      value={settings.midBannerOverlayTag || ''}
                      onChange={(e) => setSettings({ ...settings, midBannerOverlayTag: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-amber-400 font-mono text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-zinc-400 block mb-1 uppercase text-[10px]">
                      Overlay Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. PERFECT FIT & MATCH QUALITY (optional)"
                      value={settings.midBannerOverlayTitle || ''}
                      onChange={(e) => setSettings({ ...settings, midBannerOverlayTitle: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-bold text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Live Picture Preview Box */}
            <div className="space-y-2">
              <label className="font-bold text-zinc-400 block uppercase text-[10px]">Picture Preview:</label>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-inner flex items-center justify-center">
                {settings.midBannerImage ? (
                  <img
                    src={settings.midBannerImage}
                    alt="Mid Banner Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-zinc-600 space-y-2">
                    <ImageIcon className="w-8 h-8 text-zinc-700" />
                    <span className="text-xs font-bold text-zinc-500 uppercase">No image selected</span>
                    <span className="text-[10px] text-zinc-600">Upload an image file using the button on the left</span>
                  </div>
                )}

                {isUploadingBanner && (
                  <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-30">
                    <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Uploading picture...</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
                {(settings.midBannerOverlayTag || settings.midBannerOverlayTitle) ? (
                  <div className="absolute bottom-3 left-3 text-white text-xs font-serif font-bold space-y-0.5 z-10 pointer-events-none">
                    {settings.midBannerOverlayTag && (
                      <span className="text-amber-400 text-[10px] block font-mono uppercase">{settings.midBannerOverlayTag}</span>
                    )}
                    {settings.midBannerOverlayTitle && (
                      <span className="text-white text-xs block font-bold uppercase">{settings.midBannerOverlayTitle}</span>
                    )}
                  </div>
                ) : (
                  <div className="absolute bottom-3 left-3 text-zinc-500 text-[10px] italic z-10 pointer-events-none">
                    (No text overlay on image)
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-extrabold text-xs uppercase tracking-widest rounded-2xl shadow-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-5 h-5" />
            <span>Save Store Configuration</span>
          </button>
        </div>

      </form>

      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}

    </div>
  );
}
