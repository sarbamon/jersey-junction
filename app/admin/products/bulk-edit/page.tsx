'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Sparkles, Loader2, UploadCloud, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { categoryService } from '../../../../lib/services/categoryService';
import { productService } from '../../../../lib/services/productService';
import { uploadService } from '../../../../lib/services/uploadService';
import { AdminProduct, AdminCategory } from '../../../../lib/types/admin';
import { Toast } from '../../../../components/admin/Toast';

export default function BulkEditProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingProductId, setUploadingProductId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  // Batch Presets for editing
  const [presetCategory, setPresetCategory] = useState('');
  const [presetPrice, setPresetPrice] = useState('');
  const [presetStatus, setPresetStatus] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        productService.getAdminProducts(),
        Promise.resolve(categoryService.getCategories()),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err: any) {
      setToastMsg(`Error loading data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateProductRow = (id: string, field: keyof AdminProduct, value: any) => {
    setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const applyPresets = () => {
    setProducts(products.map(p => ({
      ...p,
      category: presetCategory || p.category,
      price: presetPrice ? Number(presetPrice) : p.price,
      status: (presetStatus as any) || p.status,
    })));
    setToastMsg('Applied batch presets to all products in editor');
  };

  const handleRowImageUpload = async (prodId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProductId(prodId);
    try {
      const uploadedUrl = await uploadService.uploadImage(file);
      updateProductRow(prodId, 'image', uploadedUrl);
      setToastMsg('Image uploaded to Cloudinary successfully!');
    } catch (err: any) {
      setToastMsg(`Image upload failed: ${err.message}`);
    } finally {
      setUploadingProductId(null);
    }
  };

  const handleSaveAll = async () => {
    setIsSubmitting(true);
    try {
      for (const p of products) {
        const discount = p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
        await productService.updateProduct(p.id, {
          name: p.name,
          category: p.category,
          price: Number(p.price),
          originalPrice: Number(p.originalPrice || 0),
          discount,
          stock: Number(p.stock),
          status: p.status,
          image: p.image,
        });
      }

      setToastMsg(`Successfully updated all ${products.length} products in MongoDB database!`);
      setTimeout(() => {
        router.push('/admin/products');
      }, 1200);
    } catch (err: any) {
      setToastMsg(`Bulk update failed: ${err.message || 'Error updating database'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/90 p-6 rounded-3xl border border-zinc-800 shadow-xl">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="p-2.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 rounded-2xl border border-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black font-serif uppercase tracking-wider text-white">
              Bulk Edit Catalog Products ({products.length})
            </h1>
            <p className="text-xs text-zinc-400">
              Edit title, category, prices, stock, status, and Cloudinary images across all store items simultaneously.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-zinc-700"
          >
            <RefreshCw className={`w-4 h-4 text-amber-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Reload Data</span>
          </button>
        </div>
      </div>

      {/* Quick Batch Presets */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2 text-amber-400 font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>BATCH PRESETS (UPDATE ALL PRODUCTS BELOW AT ONCE)</span>
          </div>

          <button
            onClick={applyPresets}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-black font-extrabold uppercase rounded-xl text-[11px] tracking-wider transition-all cursor-pointer shadow-lg"
          >
            APPLY PRESETS TO ALL
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="font-bold text-zinc-400 block mb-1 uppercase text-[10px]">SET CATEGORY</label>
            <select
              value={presetCategory}
              onChange={(e) => setPresetCategory(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="">Keep Existing Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-zinc-400 block mb-1 uppercase text-[10px]">SET PRICE (₹)</label>
            <input
              type="number"
              placeholder="Leave blank to keep existing"
              value={presetPrice}
              onChange={(e) => setPresetPrice(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="font-bold text-zinc-400 block mb-1 uppercase text-[10px]">SET STATUS</label>
            <select
              value={presetStatus}
              onChange={(e) => setPresetStatus(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="">Keep Existing Statuses</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Spreadsheet Table */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 uppercase font-mono text-[10px] tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-4 px-3 w-10 text-center font-bold">#</th>
                <th className="py-4 px-4 font-bold min-w-[220px]">PRODUCT TITLE</th>
                <th className="py-4 px-4 font-bold min-w-[160px]">CATEGORY</th>
                <th className="py-4 px-4 font-bold min-w-[110px]">PRICE (₹)</th>
                <th className="py-4 px-4 font-bold min-w-[110px]">REG. PRICE (₹)</th>
                <th className="py-4 px-4 font-bold min-w-[100px]">STOCK</th>
                <th className="py-4 px-4 font-bold min-w-[130px]">STATUS</th>
                <th className="py-4 px-4 font-bold min-w-[160px]">IMAGE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-zinc-400 text-xs font-mono">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                      <span>Loading product catalog from MongoDB...</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500 text-xs">
                    No products found in MongoDB database.
                  </td>
                </tr>
              ) : (
                products.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-3 text-center font-mono text-zinc-500 font-bold">
                      {idx + 1}
                    </td>

                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) => updateProductRow(p.id, 'name', e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-none focus:border-amber-400"
                      />
                      <div className="text-[10px] font-mono text-zinc-500 mt-1">{p.sku}</div>
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={p.category}
                        onChange={(e) => updateProductRow(p.id, 'category', e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3 px-4">
                      <input
                        type="number"
                        value={p.price}
                        onChange={(e) => updateProductRow(p.id, 'price', Number(e.target.value))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold text-xs focus:outline-none focus:border-amber-400"
                      />
                    </td>

                    <td className="py-3 px-4">
                      <input
                        type="number"
                        value={p.originalPrice || ''}
                        onChange={(e) => updateProductRow(p.id, 'originalPrice', Number(e.target.value))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-400 font-mono font-bold text-xs focus:outline-none focus:border-amber-400"
                      />
                    </td>

                    <td className="py-3 px-4">
                      <input
                        type="number"
                        value={p.stock}
                        onChange={(e) => updateProductRow(p.id, 'stock', Number(e.target.value))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono font-bold text-xs focus:outline-none focus:border-amber-400"
                      />
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={p.status}
                        onChange={(e) => updateProductRow(p.id, 'status', e.target.value as any)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-2 text-white text-xs font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        <option value="Active">Active</option>
                        <option value="Draft">Draft</option>
                        <option value="Out of Stock">Out of Stock</option>
                      </select>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden relative shrink-0">
                          {p.image ? (
                            <img src={p.image} alt="Thumb" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-zinc-600 m-2" />
                          )}
                        </div>

                        <label className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer shrink-0 border border-zinc-700">
                          {uploadingProductId === p.id ? (
                            <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                          ) : (
                            <UploadCloud className="w-3 h-3 text-amber-400" />
                          )}
                          <span>{uploadingProductId === p.id ? 'Uploading...' : 'Replace Image'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleRowImageUpload(p.id, e)}
                            disabled={uploadingProductId === p.id}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <span className="text-xs font-mono text-zinc-400">
          Total items to update: <strong className="text-white">{products.length}</strong>
        </span>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl text-xs uppercase cursor-pointer border border-zinc-700"
          >
            CANCEL
          </Link>
          <button
            onClick={handleSaveAll}
            disabled={isSubmitting || isLoading}
            className="px-8 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-xl transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>SAVING ALL TO MONGODB...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>SAVE ALL EDITED PRODUCTS</span>
              </>
            )}
          </button>
        </div>
      </div>

      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}

    </div>
  );
}
