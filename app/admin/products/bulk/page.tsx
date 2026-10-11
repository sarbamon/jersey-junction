'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Copy, Save, Sparkles, Loader2, UploadCloud, Image as ImageIcon } from 'lucide-react';
import { categoryService } from '../../../../lib/services/categoryService';
import { productService } from '../../../../lib/services/productService';
import { uploadService } from '../../../../lib/services/uploadService';
import { AdminCategory } from '../../../../lib/types/admin';
import { Toast } from '../../../../components/admin/Toast';

interface BulkRow {
  id: string;
  name: string;
  category: string;
  price: number | string;
  originalPrice: number | string;
  stock: number | string;
  sizes: string;
  image: string;
}

export default function BulkAddProductsPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingRowId, setUploadingRowId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  // Batch Presets
  const [presetCategory, setPresetCategory] = useState('Player Version');
  const [presetPrice, setPresetPrice] = useState('1499');
  const [presetRegPrice, setPresetRegPrice] = useState('1999');
  const [presetSizesStock, setPresetSizesStock] = useState('S10, M15, L20, XL10');

  // Rows state
  const [rows, setRows] = useState<BulkRow[]>([
    { id: '1', name: '', category: 'Player Version', price: 1499, originalPrice: 1999, stock: 25, sizes: 'S10, M15, L20, XL10', image: '' },
    { id: '2', name: '', category: 'Player Version', price: 1499, originalPrice: 1999, stock: 25, sizes: 'S10, M15, L20, XL10', image: '' },
    { id: '3', name: '', category: 'Player Version', price: 1499, originalPrice: 1999, stock: 25, sizes: 'S10, M15, L20, XL10', image: '' },
  ]);

  useEffect(() => {
    categoryService.getCategories().then(setCategories);
  }, []);

  const createNewRow = (index: number): BulkRow => ({
    id: Math.random().toString(36).substring(2, 9),
    name: '',
    category: presetCategory || 'Player Version',
    price: presetPrice ? Number(presetPrice) : 1499,
    originalPrice: presetRegPrice ? Number(presetRegPrice) : 1999,
    stock: 25,
    sizes: presetSizesStock || 'S10, M15, L20, XL10',
    image: '',
  });

  const addRows = (count: number) => {
    const newRows: BulkRow[] = [];
    for (let i = 0; i < count; i++) {
      newRows.push(createNewRow(rows.length + i + 1));
    }
    setRows([...rows, ...newRows]);
  };

  const removeRow = (id: string) => {
    if (rows.length <= 1) {
      setToastMsg('At least one row is required');
      return;
    }
    setRows(rows.filter(r => r.id !== id));
  };

  const duplicateRow = (row: BulkRow) => {
    const dup: BulkRow = {
      ...row,
      id: Math.random().toString(36).substring(2, 9),
      name: row.name ? `${row.name} (Copy)` : '',
    };
    setRows([...rows, dup]);
  };

  const updateRow = (id: string, field: keyof BulkRow, value: any) => {
    setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const applyAllPresets = () => {
    setRows(rows.map(r => ({
      ...r,
      category: presetCategory || r.category,
      price: presetPrice ? Number(presetPrice) : r.price,
      originalPrice: presetRegPrice ? Number(presetRegPrice) : r.originalPrice,
      sizes: presetSizesStock || r.sizes,
    })));
    setToastMsg('Applied batch presets to all rows!');
  };

  const handleRowImageUpload = async (rowId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingRowId(rowId);
    try {
      const uploadedUrl = await uploadService.uploadImage(file);
      updateRow(rowId, 'image', uploadedUrl);
      setToastMsg('Image uploaded to Cloudinary successfully!');
    } catch (err: any) {
      setToastMsg(`Image upload failed: ${err.message}`);
    } finally {
      setUploadingRowId(null);
    }
  };

  const handleSaveAll = async () => {
    const validRows = rows.filter(r => r.name.trim() !== '');
    if (validRows.length === 0) {
      setToastMsg('Please enter at least one product name before saving');
      return;
    }

    setIsSubmitting(true);
    try {
      for (const r of validRows) {
        const generatedSlug = r.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const generatedSku = `JJ-${r.name.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

        await productService.addProduct({
          name: r.name,
          slug: generatedSlug || `prod-${Date.now()}`,
          category: r.category || 'Player Version',
          subcategory: 'Featured',
          description: 'Official match jersey with premium breathable fabric and high durability.',
          shortDescription: 'Master quality match jersey',
          price: Number(r.price) || 1499,
          originalPrice: Number(r.originalPrice) || 1999,
          discount: r.originalPrice ? Math.round(((Number(r.originalPrice) - Number(r.price)) / Number(r.originalPrice)) * 100) : 0,
          stock: Number(r.stock) || 25,
          sku: generatedSku,
          brand: 'Nike',
          sizes: ['S', 'M', 'L', 'XL'],
          colors: ['Red', 'White'],
          image: r.image || '',
          isFeatured: true,
          isBestseller: false,
          status: 'Active',
        });
      }

      setToastMsg(`Successfully saved ${validRows.length} products!`);
      setTimeout(() => {
        router.push('/admin/products');
      }, 1200);
    } catch (err: any) {
      setToastMsg(`Bulk save failed: ${err.message || 'Error connecting to database'}`);
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
              Bulk Add Products
            </h1>
            <p className="text-xs text-zinc-400">
              Fill in multiple products at once in a spreadsheet-like form for fast bulk creation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => addRows(1)}
            className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-zinc-700"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>+ ADD ROW</span>
          </button>
          <button
            onClick={() => addRows(5)}
            className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-zinc-700"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>+ ADD 5 ROWS</span>
          </button>
        </div>
      </div>

      {/* Quick Batch Presets */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2 text-amber-400 font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>QUICK BATCH PRESETS (APPLY TO ALL ROWS &amp; AUTO-FILL NEW ROWS)</span>
          </div>

          <button
            onClick={applyAllPresets}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-black font-extrabold uppercase rounded-xl text-[11px] tracking-wider transition-all cursor-pointer shadow-lg"
          >
            APPLY ALL PRESETS TO ALL ROWS
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="font-bold text-zinc-400 block mb-1 uppercase text-[10px]">SET ALL CATEGORY</label>
            <select
              value={presetCategory}
              onChange={(e) => setPresetCategory(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-zinc-400 block mb-1 uppercase text-[10px]">DEFAULT PRICE (₹)</label>
            <input
              type="number"
              value={presetPrice}
              onChange={(e) => setPresetPrice(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="font-bold text-zinc-400 block mb-1 uppercase text-[10px]">DEFAULT REG. PRICE (₹)</label>
            <input
              type="number"
              value={presetRegPrice}
              onChange={(e) => setPresetRegPrice(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-400 font-mono font-bold focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="font-bold text-zinc-400 block mb-1 uppercase text-[10px]">DEFAULT SIZES &amp; STOCK</label>
            <input
              type="text"
              value={presetSizesStock}
              onChange={(e) => setPresetSizesStock(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* Spreadsheet Table */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 uppercase font-mono text-[10px] tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-4 px-3 w-10 text-center font-bold">#</th>
                <th className="py-4 px-4 font-bold min-w-[220px]">PRODUCT NAME *</th>
                <th className="py-4 px-4 font-bold min-w-[160px]">CATEGORY *</th>
                <th className="py-4 px-4 font-bold min-w-[110px]">PRICE (₹) *</th>
                <th className="py-4 px-4 font-bold min-w-[110px]">REG. PRICE (₹)</th>
                <th className="py-4 px-4 font-bold min-w-[160px]">SIZES &amp; STOCK</th>
                <th className="py-4 px-4 font-bold min-w-[160px]">PICTURES</th>
                <th className="py-4 px-4 font-bold text-right w-24">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium">
              {rows.map((row, idx) => (
                <tr key={row.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 px-3 text-center font-mono text-zinc-500 font-bold">
                    {idx + 1}
                  </td>

                  <td className="py-3 px-4">
                    <input
                      type="text"
                      placeholder="e.g. Real Madrid Home 24/25"
                      value={row.name}
                      onChange={(e) => updateRow(row.id, 'name', e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-none focus:border-amber-400"
                    />
                  </td>

                  <td className="py-3 px-4">
                    <select
                      value={row.category}
                      onChange={(e) => updateRow(row.id, 'category', e.target.value)}
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
                      value={row.price}
                      onChange={(e) => updateRow(row.id, 'price', e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold text-xs focus:outline-none focus:border-amber-400"
                    />
                  </td>

                  <td className="py-3 px-4">
                    <input
                      type="number"
                      value={row.originalPrice}
                      onChange={(e) => updateRow(row.id, 'originalPrice', e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-400 font-mono font-bold text-xs focus:outline-none focus:border-amber-400"
                    />
                  </td>

                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={row.sizes}
                      onChange={(e) => updateRow(row.id, 'sizes', e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                    />
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden relative shrink-0">
                        {row.image ? (
                          <img src={row.image} alt="Thumb" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-zinc-600 m-2" />
                        )}
                      </div>

                      <label className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer shrink-0 border border-zinc-700">
                        {uploadingRowId === row.id ? (
                          <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                        ) : (
                          <UploadCloud className="w-3 h-3 text-amber-400" />
                        )}
                        <span>{uploadingRowId === row.id ? 'Uploading...' : 'Select Pictures'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleRowImageUpload(row.id, e)}
                          disabled={uploadingRowId === row.id}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => duplicateRow(row)}
                        className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors cursor-pointer"
                        title="Duplicate Row"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        className="p-1.5 bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                        title="Remove Row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => addRows(1)}
            className="px-5 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all border border-zinc-700"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>+ ADD ROW</span>
          </button>
          <span className="text-xs font-mono text-zinc-400">
            Total rows: <strong className="text-white">{rows.length}</strong> (Fill details &amp; click Save All)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl text-xs uppercase cursor-pointer border border-zinc-700"
          >
            CANCEL
          </Link>
          <button
            onClick={handleSaveAll}
            disabled={isSubmitting}
            className="px-8 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-xl transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>SAVING TO DATABASE...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>SAVE ALL PRODUCTS</span>
              </>
            )}
          </button>
        </div>
      </div>

      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}

    </div>
  );
}
