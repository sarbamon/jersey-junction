'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Image as ImageIcon, Plus, Edit, Trash2, Save, X, Upload, Loader2 } from 'lucide-react';
import { bannerService } from '../../../lib/services/bannerService';
import { uploadService } from '../../../lib/services/uploadService';
import { AdminBanner } from '../../../lib/types/admin';
import { ConfirmModal } from '../../../components/admin/ConfirmModal';
import { Toast } from '../../../components/admin/Toast';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<AdminBanner[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Banner Form State: Only Photo, Button Text, and Target Link
  const [imageUrl, setImageUrl] = useState('https://res.cloudinary.com/mcsohx4p/image/upload/v1792689794/jerseyjunction_uploads/tx9zw5vb3hmshcf8n4n5.webp');
  const [buttonText, setButtonText] = useState('SHOP THE DROPS');
  const [buttonLink, setButtonLink] = useState('/shop');

  const [editTarget, setEditTarget] = useState<AdminBanner | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminBanner | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  const loadData = async () => {
    // 1. Immediate sync load
    setBanners(bannerService.getBannersSync());
    // 2. Fresh backend sync
    try {
      const data = await bannerService.getAllAdminBanners();
      if (Array.isArray(data)) {
        setBanners(data);
      }
    } catch (err) {
      console.error('Error fetching admin banners:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setImageUrl('https://res.cloudinary.com/mcsohx4p/image/upload/v1792689794/jerseyjunction_uploads/tx9zw5vb3hmshcf8n4n5.webp');
    setButtonText('SHOP THE DROPS');
    setButtonLink('/shop');
    setEditTarget(null);
    setIsAddOpen(false);
  };

  const handleStartEdit = (b: AdminBanner) => {
    setEditTarget(b);
    setImageUrl(b.imageUrl);
    setButtonText(b.buttonText || '');
    setButtonLink(b.buttonLink || '/shop');
    setIsAddOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      setToastMsg('Please provide or upload a banner image.');
      return;
    }

    try {
      const bannerTitle = (buttonText.trim() || 'Hero Banner').toUpperCase();
      if (editTarget) {
        await bannerService.updateBanner(editTarget.id, {
          title: bannerTitle,
          subtitle: '',
          imageUrl,
          buttonText: buttonText.trim().toUpperCase(),
          buttonLink: buttonLink.trim() || '/shop',
          status: 'Active',
        });
        setToastMsg('Hero Banner updated successfully!');
      } else {
        await bannerService.addBanner({
          title: bannerTitle,
          subtitle: '',
          imageUrl,
          buttonText: buttonText.trim().toUpperCase(),
          buttonLink: buttonLink.trim() || '/shop',
          status: 'Active',
          order: banners.length,
        });
        setToastMsg('Hero Banner added successfully!');
      }
      resetForm();
      await loadData();
    } catch (err: any) {
      setToastMsg(`Error saving banner: ${err.message || 'Unknown error'}`);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadService.uploadImage(file, 'jerseyjunction_uploads');
      setImageUrl(url);
      setToastMsg('Banner image uploaded successfully!');
    } catch (err: any) {
      setToastMsg(`Upload failed: ${err.message || 'Image upload error'}`);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      try {
        await bannerService.deleteBanner(deleteTarget.id);
        setToastMsg('Banner slide deleted.');
        setDeleteTarget(null);
        await loadData();
      } catch (err: any) {
        setToastMsg(`Failed to delete banner: ${err.message || 'Error'}`);
      }
    }
  };

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
            <ImageIcon className="w-4 h-4" />
            <span>HOMEPAGE HERO CMS & BANNERS</span>
          </div>
          <h1 className="text-2xl font-black font-serif uppercase tracking-tight text-white">
            HERO BANNERS
          </h1>
          <p className="text-xs text-zinc-400">
            Manage promotional hero slides, background artwork, and CTA buttons live on the storefront.
          </p>
        </div>

        <button
          onClick={() => {
            if (isAddOpen) {
              resetForm();
            } else {
              setEditTarget(null);
              setIsAddOpen(true);
            }
          }}
          className="px-5 py-3 bg-amber-400 hover:bg-amber-500 text-black font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer uppercase tracking-wider"
        >
          {isAddOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{isAddOpen ? 'Close Form' : 'Add Hero Banner'}</span>
        </button>
      </div>

      {/* Add / Edit Banner Form (Only Photo, Button Text, and Target Link) */}
      {isAddOpen && (
        <form onSubmit={handleSaveBanner} className="bg-zinc-900 border border-amber-400/40 rounded-3xl p-6 shadow-2xl space-y-4 text-xs animate-fade-in">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="font-serif font-black uppercase text-amber-400 text-sm">
              {editTarget ? 'Edit Hero Banner (Photo & Button)' : 'Add New Homepage Hero Banner'}
            </h3>
            <button onClick={resetForm} type="button" className="text-zinc-400 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Banner Photo Input */}
            <div className="md:col-span-1">
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-zinc-400 uppercase text-xs">Banner Photo / Image *</label>
                <label className="text-[10px] text-amber-400 hover:text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer">
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3 h-3" />
                      <span>Upload File</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isUploading}
                    onChange={handleUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <input
                type="text"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="/hero/... or upload file"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-300 font-mono text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Button Text */}
            <div>
              <label className="font-bold text-zinc-400 block mb-1 uppercase">Button Text</label>
              <input
                type="text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="e.g. SHOP THE DROPS"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Target Link URL */}
            <div>
              <label className="font-bold text-zinc-400 block mb-1 uppercase">Target Link URL</label>
              <input
                type="text"
                value={buttonLink}
                onChange={(e) => setButtonLink(e.target.value)}
                placeholder="/shop"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-300 font-mono text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Image Preview */}
          {imageUrl && (
            <div className="pt-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Live Image Preview:</span>
              <div className="h-32 w-full max-w-md relative bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
                <Image src={imageUrl} alt="Banner Preview" fill className="object-cover" />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-gray-300 font-bold uppercase rounded-xl text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-black font-extrabold uppercase rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow"
            >
              <Save className="w-4 h-4" />
              <span>{editTarget ? 'Update Hero Banner' : 'Save Hero Banner'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((b, idx) => (
          <div key={b.id} className="bg-zinc-900/90 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between">
            <div className="h-48 w-full relative bg-zinc-950 border-b border-zinc-800 overflow-hidden">
              <Image src={b.imageUrl} alt={`Slide ${idx + 1}`} fill className="object-cover" />
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md border border-zinc-700">
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">SLIDE #{idx + 1}</span>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between gap-4 text-xs font-mono">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="px-3 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-400 font-bold rounded-lg text-[10px] truncate">
                  Button: {b.buttonText || 'No Button'} ({b.buttonLink || '/shop'})
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleStartEdit(b)}
                  className="p-1.5 text-zinc-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-all cursor-pointer"
                  title="Edit Banner"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setDeleteTarget(b)}
                  className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                  title="Delete Banner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Banner Slide"
        message="Are you sure you want to delete this hero banner slide?"
        confirmText="Delete Banner"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}

    </div>
  );
}
