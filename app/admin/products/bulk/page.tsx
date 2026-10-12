'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Copy,
  Save,
  Sparkles,
  Loader2,
  UploadCloud,
  X,
  Star
} from 'lucide-react';
import { categoryService } from '../../../../lib/services/categoryService';
import { productService } from '../../../../lib/services/productService';
import { uploadService } from '../../../../lib/services/uploadService';
import { AdminCategory } from '../../../../lib/types/admin';
import { Toast } from '../../../../components/admin/Toast';

export interface BulkRow {
  id: string;
  name: string;
  category: string;
  price: number | string;
  originalPrice: number | string;
  sizes: string;
  images: string[];
}

/**
 * Robust parser for sizes and stock text.
 * Accepts formats:
 * - "S5, M5, L5, XL5"
 * - "S: 5, M: 5, L: 5, XL: 5"
 * - "S10, M15, L20, XL10"
 * - "S 5, M 5, L 5, XL 5"
 * - "S-5, M-5, L-5, XL-5"
 * - "S5 M5 L5 XL5"
 * - "2XL5, XXL5, 3XL10"
 * - "5" (5 units per standard size)
 * - "S, M, L, XL" (defaults to 5 each)
 */
export function parseSizesAndStock(input: string): {
  sizeStock: Record<string, number>;
  totalStock: number;
  sizes: string[];
} {
  const fallback = {
    sizeStock: { S: 5, M: 5, L: 5, XL: 5 },
    totalStock: 20,
    sizes: ['S', 'M', 'L', 'XL'],
  };

  if (!input || !input.trim()) {
    return fallback;
  }

  const str = input.trim();

  // If user entered a single uniform quantity like "5" or "10"
  if (/^\d+$/.test(str)) {
    const qty = parseInt(str, 10);
    return {
      sizeStock: { S: qty, M: qty, L: qty, XL: qty },
      totalStock: qty * 4,
      sizes: ['S', 'M', 'L', 'XL'],
    };
  }

  const sizeStock: Record<string, number> = {};

  // Split tokens by comma, semicolon, slash, or newlines
  const rawTokens = str.split(/[,;\n\/]+/).map((t) => t.trim()).filter(Boolean);

  // If items were separated by spaces e.g. "S5 M5 L5 XL5"
  const tokens = rawTokens.flatMap((t) => {
    if (t.includes(' ') && !t.includes(':') && !t.includes('-') && !t.includes('=')) {
      if (/^[a-zA-Z0-9]+\s+\d+$/.test(t)) {
        return [t];
      }
      return t.split(/\s+/).filter(Boolean);
    }
    return [t];
  });

  for (const token of tokens) {
    const colonMatch = token.match(/^([a-zA-Z0-9]+)\s*[:=\-]\s*(\d+)$/);
    const spaceMatch = token.match(/^([a-zA-Z0-9]+)\s+(\d+)$/);
    const compactMatch = token.match(/^([a-zA-Z]+|\d+[a-zA-Z]+)(\d+)$/);

    if (colonMatch) {
      const size = colonMatch[1].toUpperCase();
      const qty = parseInt(colonMatch[2], 10);
      sizeStock[size] = (sizeStock[size] || 0) + qty;
    } else if (spaceMatch) {
      const size = spaceMatch[1].toUpperCase();
      const qty = parseInt(spaceMatch[2], 10);
      sizeStock[size] = (sizeStock[size] || 0) + qty;
    } else if (compactMatch) {
      const size = compactMatch[1].toUpperCase();
      const qty = parseInt(compactMatch[2], 10);
      sizeStock[size] = (sizeStock[size] || 0) + qty;
    } else {
      const clean = token.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      if (clean) {
        sizeStock[clean] = (sizeStock[clean] || 0) + 5;
      }
    }
  }

  const sizes = Object.keys(sizeStock);
  if (sizes.length === 0) {
    return fallback;
  }

  const totalStock = Object.values(sizeStock).reduce((sum, q) => sum + q, 0);
  return {
    sizeStock,
    totalStock,
    sizes,
  };
}

export default function BulkAddProductsPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingRowId, setUploadingRowId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [toastMsg, setToastMsg] = useState('');

  // Batch Presets
  const [presetCategory, setPresetCategory] = useState('Player Version');
  const [presetPrice, setPresetPrice] = useState('1499');
  const [presetRegPrice, setPresetRegPrice] = useState('1999');
  const [presetSizesStock, setPresetSizesStock] = useState('S5, M5, L5, XL5');

  // Rows state
  const [rows, setRows] = useState<BulkRow[]>([
    { id: '1', name: '', category: 'Player Version', price: 1499, originalPrice: 1999, sizes: 'S5, M5, L5, XL5', images: [] },
    { id: '2', name: '', category: 'Player Version', price: 1499, originalPrice: 1999, sizes: 'S5, M5, L5, XL5', images: [] },
    { id: '3', name: '', category: 'Player Version', price: 1499, originalPrice: 1999, sizes: 'S5, M5, L5, XL5', images: [] },
  ]);

  useEffect(() => {
    categoryService.getCategories().then((cats) => {
      setCategories(cats);
    });
  }, []);

  const createNewRow = (index: number): BulkRow => ({
    id: Math.random().toString(36).substring(2, 9),
    name: '',
    category: presetCategory || 'Player Version',
    price: presetPrice ? Number(presetPrice) : 1499,
    originalPrice: presetRegPrice ? Number(presetRegPrice) : 1999,
    sizes: presetSizesStock || 'S5, M5, L5, XL5',
    images: [],
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
    setRows(rows.filter((r) => r.id !== id));
  };

  const duplicateRow = (row: BulkRow) => {
    const dup: BulkRow = {
      ...row,
      id: Math.random().toString(36).substring(2, 9),
      name: row.name ? `${row.name} (Copy)` : '',
      images: [...(row.images || [])],
    };
    setRows([...rows, dup]);
  };

  const updateRow = (id: string, field: keyof BulkRow, value: any) => {
    setRows(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const applyAllPresets = () => {
    setRows(
      rows.map((r) => ({
        ...r,
        category: presetCategory || r.category,
        price: presetPrice ? Number(presetPrice) : r.price,
        originalPrice: presetRegPrice ? Number(presetRegPrice) : r.originalPrice,
        sizes: presetSizesStock || r.sizes,
      }))
    );
    setToastMsg('Applied batch presets to all rows!');
  };

  // Multiple photo upload for a specific row
  const handleRowImageUpload = async (rowId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingRowId(rowId);
    setUploadProgress(`Uploading ${files.length} photo(s)...`);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        setUploadProgress(`Uploading ${i + 1} of ${files.length}...`);
        const url = await uploadService.uploadImage(files[i]);
        if (url) uploadedUrls.push(url);
      }

      setRows((prev) =>
        prev.map((r) => {
          if (r.id !== rowId) return r;
          const currentImages = r.images || [];
          return {
            ...r,
            images: [...currentImages, ...uploadedUrls],
          };
        })
      );
      setToastMsg(`Successfully uploaded ${uploadedUrls.length} photo(s)!`);
    } catch (err: any) {
      setToastMsg(`Photo upload failed: ${err.message}`);
    } finally {
      setUploadingRowId(null);
      setUploadProgress('');
      e.target.value = '';
    }
  };

  // Remove individual photo from row gallery
  const removeRowImage = (rowId: string, imgIdx: number) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        const nextImages = (r.images || []).filter((_, idx) => idx !== imgIdx);
        return {
          ...r,
          images: nextImages,
        };
      })
    );
  };

  // Set an image as primary cover photo (move to index 0)
  const setPrimaryRowImage = (rowId: string, imgIdx: number) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        const imgs = [...(r.images || [])];
        const selected = imgs.splice(imgIdx, 1)[0];
        if (selected) {
          imgs.unshift(selected);
        }
        return {
          ...r,
          images: imgs,
        };
      })
    );
    setToastMsg('Set as primary cover photo');
  };

  const handleSaveAll = async () => {
    const validRows = rows.filter((r) => r.name.trim() !== '');
    if (validRows.length === 0) {
      setToastMsg('Please enter at least one product name before saving');
      return;
    }

    setIsSubmitting(true);
    try {
      for (const r of validRows) {
        const generatedSlug =
          r.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '') +
          '-' +
          Date.now().toString().slice(-4);
        const generatedSku = `JJ-${r.name.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

        const { sizeStock, totalStock, sizes: parsedSizes } = parseSizesAndStock(r.sizes);
        const rowImages = r.images && r.images.length > 0 ? r.images : [];
        const primaryImage = rowImages[0] || '';
        const inStockSizes = Object.entries(sizeStock)
          .filter(([_, q]) => q > 0)
          .map(([s]) => s);

        await productService.addProduct({
          name: r.name,
          slug: generatedSlug,
          category: r.category || 'Player Version',
          subcategory: 'Featured',
          description: 'Official match jersey with premium breathable fabric and high durability.',
          shortDescription: 'Master quality match jersey',
          price: Number(r.price) || 1499,
          originalPrice: Number(r.originalPrice) || 1999,
          discount: r.originalPrice
            ? Math.round(((Number(r.originalPrice) - Number(r.price)) / Number(r.originalPrice)) * 100)
            : 0,
          stock: totalStock,
          sizeStock,
          sku: generatedSku,
          brand: 'Jersey Junction',
          sizes: parsedSizes as any,
          colors: ['Home', 'Away'],
          image: primaryImage,
          images: rowImages,
          isFeatured: true,
          isBestseller: false,
          status: 'Active',
        });
      }

      setToastMsg(`Successfully saved ${validRows.length} products with stock and photos!`);
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
              Fill in multiple products at once with multi-photo upload and custom size stock (e.g. S5, M5, L5, XL5).
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
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
              value={categories.find(c => c.name.toLowerCase() === (presetCategory || '').toLowerCase())?.name || presetCategory}
              onChange={(e) => {
                const newCat = e.target.value;
                setPresetCategory(newCat);
                setRows((prev) => prev.map((r) => ({ ...r, category: newCat })));
              }}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
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
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-zinc-400 uppercase text-[10px]">DEFAULT SIZES &amp; STOCK</label>
              {(() => {
                const parsed = parseSizesAndStock(presetSizesStock);
                return (
                  <span className="text-[10px] font-mono text-amber-400 font-bold">
                    {parsed.totalStock} units total
                  </span>
                );
              })()}
            </div>
            <input
              type="text"
              value={presetSizesStock}
              placeholder="e.g. S5, M5, L5, XL5"
              onChange={(e) => setPresetSizesStock(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
            />

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => setPresetSizesStock('S5, M5, L5, XL5')}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors ${
                  presetSizesStock === 'S5, M5, L5, XL5'
                    ? 'bg-amber-400 text-black font-bold'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                }`}
              >
                S5, M5, L5, XL5 (20 units)
              </button>
              <button
                type="button"
                onClick={() => setPresetSizesStock('S10, M15, L20, XL10')}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors ${
                  presetSizesStock === 'S10, M15, L20, XL10'
                    ? 'bg-amber-400 text-black font-bold'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                }`}
              >
                S10, M15, L20, XL10 (55 units)
              </button>
              <button
                type="button"
                onClick={() => setPresetSizesStock('XS5, S5, M5, L5, XL5, XXL5')}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors ${
                  presetSizesStock === 'XS5, S5, M5, L5, XL5, XXL5'
                    ? 'bg-amber-400 text-black font-bold'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                }`}
              >
                XS-XXL (30 units)
              </button>
            </div>
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
                <th className="py-4 px-4 font-bold min-w-[200px]">PRODUCT NAME *</th>
                <th className="py-4 px-3 font-bold min-w-[140px]">CATEGORY *</th>
                <th className="py-4 px-3 font-bold min-w-[100px]">PRICE (₹) *</th>
                <th className="py-4 px-3 font-bold min-w-[100px]">REG. PRICE (₹)</th>
                <th className="py-4 px-4 font-bold min-w-[230px]">SIZES &amp; STOCK INVENTORY</th>
                <th className="py-4 px-4 font-bold min-w-[260px]">PHOTOS (MULTI-UPLOAD)</th>
                <th className="py-4 px-3 font-bold text-right w-20">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium">
              {rows.map((row, idx) => {
                const parsed = parseSizesAndStock(row.sizes);
                const imagesCount = row.images?.length || 0;

                return (
                  <tr key={row.id} className="hover:bg-zinc-800/40 transition-colors">
                    {/* Index */}
                    <td className="py-3 px-3 text-center font-mono text-zinc-500 font-bold">
                      {idx + 1}
                    </td>

                    {/* Product Name */}
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        placeholder="e.g. Real Madrid Home 24/25"
                        value={row.name}
                        onChange={(e) => updateRow(row.id, 'name', e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-none focus:border-amber-400"
                      />
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      <select
                        value={categories.find(c => c.name.toLowerCase() === (row.category || '').toLowerCase())?.name || row.category}
                        onChange={(e) => updateRow(row.id, 'category', e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-2 text-white text-xs font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        value={row.price}
                        onChange={(e) => updateRow(row.id, 'price', e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-2 text-amber-400 font-mono font-bold text-xs focus:outline-none focus:border-amber-400"
                      />
                    </td>

                    {/* Regular Price */}
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        value={row.originalPrice}
                        onChange={(e) => updateRow(row.id, 'originalPrice', e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-2 text-zinc-400 font-mono font-bold text-xs focus:outline-none focus:border-amber-400"
                      />
                    </td>

                    {/* Sizes & Stock */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={row.sizes}
                          placeholder="e.g. S5, M5, L5, XL5"
                          onChange={(e) => updateRow(row.id, 'sizes', e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                        />

                        {/* Computed live stock badge */}
                        <div className="flex items-center justify-between text-[10px] font-mono px-1">
                          <span className="text-zinc-400">
                            Breakdown:{' '}
                            <strong className="text-zinc-200">
                              {Object.entries(parsed.sizeStock)
                                .map(([s, q]) => `${s}:${q}`)
                                .join(' ')}
                            </strong>
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/30 text-amber-400 font-black">
                            {parsed.totalStock} in stock
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Multi-Photo Upload & Gallery */}
                    <td className="py-3 px-4">
                      <div className="space-y-2">
                        {/* Gallery Thumbnails List */}
                        {imagesCount > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {row.images.map((imgUrl, imgIdx) => (
                              <div
                                key={imgIdx}
                                className={`relative group w-10 h-10 rounded-lg overflow-hidden border ${
                                  imgIdx === 0 ? 'border-amber-400 ring-1 ring-amber-400/50' : 'border-zinc-800'
                                } bg-zinc-950 shrink-0`}
                                title={imgIdx === 0 ? 'Primary cover photo' : 'Click star to make primary cover photo'}
                              >
                                <img
                                  src={imgUrl}
                                  alt={`Product photo ${imgIdx + 1}`}
                                  className="w-full h-full object-cover"
                                />

                                {/* Primary Badge indicator */}
                                {imgIdx === 0 && (
                                  <div className="absolute top-0.5 left-0.5 bg-amber-400 text-black rounded p-0.5 shadow">
                                    <Star className="w-2.5 h-2.5 fill-black" />
                                  </div>
                                )}

                                {/* Hover action controls */}
                                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                  {imgIdx !== 0 && (
                                    <button
                                      type="button"
                                      onClick={() => setPrimaryRowImage(row.id, imgIdx)}
                                      className="p-1 bg-amber-400 hover:bg-amber-300 text-black rounded cursor-pointer"
                                      title="Set as primary cover"
                                    >
                                      <Star className="w-2.5 h-2.5" />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => removeRowImage(row.id, imgIdx)}
                                    className="p-1 bg-red-500/80 hover:bg-red-500 text-white rounded cursor-pointer"
                                    title="Delete photo"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Upload Button */}
                        <div className="flex items-center gap-2">
                          <label className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-[10px] font-bold flex items-center gap-1.5 cursor-pointer shrink-0 border border-zinc-700 transition-colors">
                            {uploadingRowId === row.id ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                                <span>{uploadProgress || 'Uploading...'}</span>
                              </>
                            ) : (
                              <>
                                <UploadCloud className="w-3 h-3 text-amber-400" />
                                <span>{imagesCount > 0 ? '+ Add More Photos' : 'Upload Photos (Multi)'}</span>
                              </>
                            )}
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => handleRowImageUpload(row.id, e)}
                              disabled={uploadingRowId === row.id}
                              className="hidden"
                            />
                          </label>

                          {imagesCount > 0 && (
                            <span className="text-[10px] font-mono text-zinc-400">
                              {imagesCount} photo{imagesCount !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
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
                );
              })}
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
