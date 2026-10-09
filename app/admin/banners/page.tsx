'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Image as ImageIcon, Plus, Edit, Trash2, Save, X, ExternalLink } from 'lucide-react';
import { bannerService } from '../../../lib/services/bannerService';
import { AdminBanner } from '../../../lib/types/admin';
import { ConfirmModal } from '../../../components/admin/ConfirmModal';
import { Toast } from '../../../components/admin/Toast';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<AdminBanner[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New Banner State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('/hero/colin-meg-R8ayF9Qwu5Y-unsplash.webp');
  const [buttonText, setButtonText] = useState('SHOP THE COLLECTION');
  const [buttonLink, setButtonLink] = useState('/shop');
  const [status, setStatus] = useState<'Active' | 'Disabled'>('Active');

  const [editTarget, setEditTarget] = useState<AdminBanner | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminBanner | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  const loadData = () => {
    setBanners(bannerService.getBanners());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    bannerService.addBanner({
      title: title.toUpperCase(),
      subtitle,
      imageUrl,
      buttonText: buttonText.toUpperCase(),
      buttonLink,
      status
    });

    setTitle('');
    setIsAddOpen(false);
    setToastMsg('Hero Banner added successfully!');
    loadData();
  };

  const handleToggleStatus = (b: AdminBanner) => {
    const nextStatus = b.status === 'Active' ? 'Disabled' : 'Active';
    bannerService.updateBanner(b.id, { status: nextStatus });
    setToastMsg(`Banner status changed to ${nextStatus}`);
    loadData();
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      bannerService.deleteBanner(deleteTarget.id);
      setToastMsg('Banner slide deleted.');
      setDeleteTarget(null);
      loadData();
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/90 p-6 rounded-3xl border border-zinc-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
            <ImageIcon className="w-4 h-4" />
            <span>HOMEPAGE HERO CMS & BANNERS</span>
          </div>
          <h1 className="text-2xl font-black font-serif uppercase tracking-tight text-white">
            HERO BANNERS ({banners.length})
          </h1>
          <p className="text-xs text-zinc-400">
            Manage promotional hero slides, background artwork, CTA buttons, and store campaigns.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(!isAddOpen)}
          className="px-5 py-3 bg-amber-400 hover:bg-amber-500 text-black font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer uppercase tracking-wider"
        >
          <Plus className="w-4 h-4" />
          <span>Add Hero Banner</span>
        </button>
      </div>

      {/* Add Banner Form */}
      {isAddOpen && (
        <form onSubmit={handleCreate} className="bg-zinc-900 border border-amber-400/40 rounded-3xl p-6 shadow-2xl space-y-4 text-xs animate-fade-in">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="font-serif font-black uppercase text-amber-400 text-sm">Add New Homepage Hero Banner</h3>
            <button onClick={() => setIsAddOpen(false)} type="button" className="text-zinc-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-zinc-400 block mb-1 uppercase">Banner Headline *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. CHAMPIONS CHOICE 24/25"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-400 block mb-1 uppercase">Subtitle Tagline</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Authentic master quality kits with official badges"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-zinc-400 block mb-1 uppercase">Image Asset URL *</label>
              <input
                type="text"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-300 font-mono text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-400 block mb-1 uppercase">Button Text</label>
              <input
                type="text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="SHOP NOW"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

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

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-black font-extrabold uppercase rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow"
            >
              <Save className="w-4 h-4" />
              <span>Save Hero Banner</span>
            </button>
          </div>
        </form>
      )}

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((b) => (
          <div key={b.id} className="bg-zinc-900/90 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between">
            <div className="h-44 w-full relative bg-zinc-950 border-b border-zinc-800 overflow-hidden">
              <Image src={b.imageUrl} alt={b.title} fill className="object-cover opacity-70" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent p-5 flex flex-col justify-end">
                <span className="text-[10px] font-mono text-amber-400 font-extrabold uppercase tracking-widest">HERO BANNER</span>
                <h3 className="text-xl font-serif font-black uppercase text-white tracking-tight">{b.title}</h3>
                <p className="text-xs text-zinc-300 font-medium line-clamp-1">{b.subtitle}</p>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between gap-4 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-400 font-bold rounded-lg text-[10px]">
                  Button: {b.buttonText} ({b.buttonLink})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleStatus(b)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold border cursor-pointer ${
                    b.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
                  }`}
                >
                  {b.status}
                </button>

                <button
                  onClick={() => setDeleteTarget(b)}
                  className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
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
        message={`Are you sure you want to delete banner "${deleteTarget?.title}"?`}
        confirmText="Delete Banner"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}

    </div>
  );
}
