'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Loader2,
  UploadCloud,
  RefreshCw,
  X,
  Star,
  Type
} from 'lucide-react';
import { categoryService } from '../../../../lib/services/categoryService';
import { productService } from '../../../../lib/services/productService';
import { uploadService } from '../../../../lib/services/uploadService';
import { AdminProduct, AdminCategory } from '../../../../lib/types/admin';
import { Toast } from '../../../../components/admin/Toast';

export interface EditableProductRow extends AdminProduct {
  sizesText: string;
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
 * - "5" (uniform 5 units per standard size)
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

function formatSizeStockToString(
  sizeStock?: Record<string, number>,
  fallbackStock?: number,
  sizes?: string[]
): string {
  if (sizeStock && Object.keys(sizeStock).length > 0) {
    const parts = Object.entries(sizeStock).map(([sz, qty]) => `${sz}${qty}`);
    return parts.join(', ');
  }
  if (fallbackStock !== undefined && fallbackStock > 0) {
    const sList = sizes && sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL'];
    const perSize = Math.max(1, Math.round(fallbackStock / sList.length));
    return sList.map((s) => `${s}${perSize}`).join(', ');
  }
  return 'S5, M5, L5, XL5';
}

export default function BulkEditProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<EditableProductRow[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingProductId, setUploadingProductId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [toastMsg, setToastMsg] = useState('');

  // Category Filter to view & edit specific categories
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Apply to All controls
  const [applyPrice, setApplyPrice] = useState('');
  const [applyRegPrice, setApplyRegPrice] = useState('');
  const [applySizesStock, setApplySizesStock] = useState('');
  const [applyBestseller, setApplyBestseller] = useState<'keep' | 'yes' | 'no'>('keep');
  const [applyCustom, setApplyCustom] = useState<'keep' | 'yes' | 'no'>('keep');

  const displayedProducts = products.filter((p) => {
    if (categoryFilter === 'all') return true;
    if (categoryFilter.toLowerCase().includes('fan')) return (p.category || '').toLowerCase().includes('fan');
    if (categoryFilter.toLowerCase().includes('player')) return (p.category || '').toLowerCase().includes('player') && !(p.category || '').toLowerCase().includes('fan');
    return (p.category || '').toLowerCase() === categoryFilter.toLowerCase();
  });

  const handleApplyToAll = () => {
    if (
      applyPrice === '' &&
      applyRegPrice === '' &&
      !applySizesStock.trim() &&
      applyBestseller === 'keep' &&
      applyCustom === 'keep'
    ) {
      setToastMsg('Please enter price, size stock, or select best seller / custom status to apply');
      return;
    }

    const targetIds = new Set(displayedProducts.map(p => p.id));
    setProducts((prev) =>
      prev.map((p) => {
        if (!targetIds.has(p.id)) return p;
        const updated = { ...p };
        if (applyPrice !== '') updated.price = Number(applyPrice);
        if (applyRegPrice !== '') updated.originalPrice = Number(applyRegPrice);
        if (applySizesStock.trim()) updated.sizesText = applySizesStock.trim();
        if (applyBestseller === 'yes') updated.isBestseller = true;
        if (applyBestseller === 'no') updated.isBestseller = false;
        if (applyCustom === 'yes') updated.isCustomizable = true;
        if (applyCustom === 'no') updated.isCustomizable = false;
        return updated;
      })
    );
    setToastMsg(`Applied values to ${displayedProducts.length} displayed product(s)!`);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        productService.getAdminProducts(),
        Promise.resolve(categoryService.getCategories()),
      ]);

      let filteredProds = prods;
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const ids = params.get('ids');
        if (ids) {
          const idList = ids.split(',').filter(Boolean);
          if (idList.length > 0) {
            filteredProds = prods.filter(p => idList.includes(p.id));
          }
        }
      }

      const editableRows: EditableProductRow[] = filteredProds.map((p) => ({
        ...p,
        sizesText: formatSizeStockToString(p.sizeStock, p.stock, p.sizes),
      }));

      setProducts(editableRows);
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

  const updateProductRow = (id: string, field: keyof EditableProductRow, value: any) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  // Multiple photo upload for a specific product row
  const handleRowImageUpload = async (prodId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingProductId(prodId);
    setUploadProgress(`Uploading ${files.length} photo(s)...`);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        setUploadProgress(`Uploading ${i + 1} of ${files.length}...`);
        const url = await uploadService.uploadImage(files[i], 'jerseyjunction_uploads');
        if (url) uploadedUrls.push(url);
      }

      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== prodId) return p;
          const currentImages = p.images || (p.image ? [p.image] : []);
          const updated = [...currentImages, ...uploadedUrls];
          return {
            ...p,
            images: updated,
            image: updated[0] || '',
          };
        })
      );
      setToastMsg(`Uploaded ${uploadedUrls.length} photo(s) successfully!`);
    } catch (err: any) {
      setToastMsg(`Photo upload failed: ${err.message}`);
    } finally {
      setUploadingProductId(null);
      setUploadProgress('');
      e.target.value = '';
    }
  };

  // Remove individual photo from row gallery
  const removeRowImage = (prodId: string, imgIdx: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== prodId) return p;
        const updated = (p.images || []).filter((_, idx) => idx !== imgIdx);
        return {
          ...p,
          images: updated,
          image: updated[0] || '',
        };
      })
    );
  };

  // Set an image as primary cover photo (move to index 0)
  const setPrimaryRowImage = (prodId: string, imgIdx: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== prodId) return p;
        const imgs = [...(p.images || [])];
        const selected = imgs.splice(imgIdx, 1)[0];
        if (selected) {
          imgs.unshift(selected);
        }
        return {
          ...p,
          images: imgs,
          image: imgs[0] || '',
        };
      })
    );
    setToastMsg('Set as primary cover photo');
  };

  const handleSaveAll = async () => {
    const missingPhotoProds = products.filter((p) => {
      const finalImages = p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []);
      return finalImages.length === 0;
    });
    if (missingPhotoProds.length > 0) {
      setToastMsg(`Photo is compulsory! "${missingPhotoProds[0].name}" has no photos. Please upload at least one photo.`);
      return;
    }

    setIsSubmitting(true);
    try {
      for (const p of products) {
        const { sizeStock, totalStock, sizes: parsedSizes } = parseSizesAndStock(p.sizesText);
        const finalImages = p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []);
        const primaryImage = finalImages[0] || '';
        const discount = p.originalPrice
          ? Math.round(((Number(p.originalPrice) - Number(p.price)) / Number(p.originalPrice)) * 100)
          : 0;

        await productService.updateProduct(p.id, {
          name: p.name,
          sku: p.sku,
          category: p.category,
          price: Number(p.price),
          originalPrice: Number(p.originalPrice || 0),
          discount,
          stock: totalStock,
          sizeStock,
          sizes: parsedSizes as any,
          image: primaryImage,
          images: finalImages,
          isBestseller: Boolean(p.isBestseller),
          isCustomizable: Boolean(p.isCustomizable),
        });
      }

      setToastMsg(`Successfully updated all ${products.length} products!`);
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
              Bulk Edit Catalog Products ({displayedProducts.length}{categoryFilter !== 'all' ? ` of ${products.length}` : ''})
            </h1>
            <p className="text-xs text-zinc-400">
              Directly edit product title, sku, prices, size inventory (e.g. S5, M5, L5, XL5), and photos for every item.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">CATEGORY:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-amber-400 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-zinc-900 text-white">All Categories ({products.length})</option>
              {categories.map((c) => {
                const count = products.filter(p =>
                  c.name.toLowerCase().includes('fan') ? (p.category || '').toLowerCase().includes('fan') :
                  c.name.toLowerCase().includes('player') ? ((p.category || '').toLowerCase().includes('player') && !(p.category || '').toLowerCase().includes('fan')) :
                  (p.category || '').toLowerCase() === c.name.toLowerCase()
                ).length;
                return (
                  <option key={c.id} value={c.name} className="bg-zinc-900 text-white">
                    {c.name} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          <button
            onClick={loadData}
            className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-zinc-700"
          >
            <RefreshCw className={`w-4 h-4 text-amber-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Reload Data</span>
          </button>
        </div>
      </div>

      {/* Apply to All Section */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-mono font-bold text-amber-400 uppercase tracking-wider text-[11px]">
            APPLY TO ALL DISPLAYED ({displayedProducts.length} PRODUCTS)
          </span>
          <button
            type="button"
            onClick={handleApplyToAll}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-black font-extrabold uppercase rounded-xl text-[11px] tracking-wider transition-all cursor-pointer shadow-lg"
          >
            APPLY TO ALL
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="font-bold text-zinc-400 block mb-1 uppercase text-[10px]">PRICE (₹)</label>
            <input
              type="number"
              placeholder="Leave blank to keep existing"
              value={applyPrice}
              onChange={(e) => setApplyPrice(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="font-bold text-zinc-400 block mb-1 uppercase text-[10px]">REG. PRICE (₹)</label>
            <input
              type="number"
              placeholder="Leave blank to keep existing"
              value={applyRegPrice}
              onChange={(e) => setApplyRegPrice(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-400 font-mono font-bold focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="font-bold text-zinc-400 block mb-1 uppercase text-[10px]">SIZES &amp; STOCK</label>
            <input
              type="text"
              placeholder="e.g. S5, M5, L5, XL5"
              value={applySizesStock}
              onChange={(e) => setApplySizesStock(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="font-bold text-zinc-400 block mb-1 uppercase text-[10px]">
              SHOW IN BEST SELLER
            </label>
            <select
              value={applyBestseller}
              onChange={(e) => setApplyBestseller(e.target.value as any)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-amber-400 font-bold text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="keep" className="bg-zinc-900 text-zinc-400">Keep Existing</option>
              <option value="yes" className="bg-zinc-900 text-amber-400">★ Show in Best Seller (Yes)</option>
              <option value="no" className="bg-zinc-900 text-zinc-300">Hide from Best Seller (No)</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-zinc-400 block mb-1 uppercase text-[10px] flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-amber-400" />
              <span>ENABLE CUSTOM PRINT</span>
            </label>
            <select
              value={applyCustom}
              onChange={(e) => setApplyCustom(e.target.value as any)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-amber-400 font-bold text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="keep" className="bg-zinc-900 text-zinc-400">Keep Existing</option>
              <option value="yes" className="bg-zinc-900 text-amber-400">✨ Enable Custom (Yes)</option>
              <option value="no" className="bg-zinc-900 text-zinc-300">Disable Custom (No)</option>
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
                <th className="py-4 px-4 font-bold min-w-[220px]">PRODUCT TITLE &amp; SKU</th>
                <th className="py-4 px-3 font-bold min-w-[100px]">PRICE (₹)</th>
                <th className="py-4 px-3 font-bold min-w-[100px]">REG. PRICE (₹)</th>
                <th className="py-4 px-3 font-bold text-center min-w-[130px]">BEST SELLER</th>
                <th className="py-4 px-3 font-bold text-center min-w-[130px]">CUSTOM PRINT</th>
                <th className="py-4 px-4 font-bold min-w-[220px]">SIZES &amp; STOCK INVENTORY</th>
                <th className="py-4 px-4 font-bold min-w-[240px]">PHOTOS (MULTI-UPLOAD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-zinc-400 text-xs font-mono">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : displayedProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500 text-xs font-mono">
                    No products found in this category filter.
                  </td>
                </tr>
              ) : (
                displayedProducts.map((p, idx) => {
                  const parsed = parseSizesAndStock(p.sizesText);
                  const imagesCount = p.images?.length || 0;

                  return (
                    <tr key={p.id} className="hover:bg-zinc-800/40 transition-colors">
                      {/* Index */}
                      <td className="py-3 px-3 text-center font-mono text-zinc-500 font-bold">
                        {idx + 1}
                      </td>

                      {/* Product Title & SKU */}
                      <td className="py-3 px-4">
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            placeholder="Product Title"
                            value={p.name}
                            onChange={(e) => updateProductRow(p.id, 'name', e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-none focus:border-amber-400"
                          />
                          <input
                            type="text"
                            placeholder="SKU (e.g. JJ-XXX-123)"
                            value={p.sku || ''}
                            onChange={(e) => updateProductRow(p.id, 'sku', e.target.value)}
                            className="w-full bg-zinc-950/80 border border-zinc-800/80 rounded-lg px-2.5 py-1 text-[11px] font-mono text-zinc-400 focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </td>

                      {/* Sale Price */}
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          value={p.price}
                          onChange={(e) => updateProductRow(p.id, 'price', Number(e.target.value))}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-2 text-amber-400 font-mono font-bold text-xs focus:outline-none focus:border-amber-400"
                        />
                      </td>

                      {/* Regular Price */}
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          value={p.originalPrice || ''}
                          onChange={(e) => updateProductRow(p.id, 'originalPrice', Number(e.target.value))}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-2 text-zinc-400 font-mono font-bold text-xs focus:outline-none focus:border-amber-400"
                        />
                      </td>

                      {/* Show in Best Seller Toggle */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => updateProductRow(p.id, 'isBestseller', !p.isBestseller)}
                          className={`inline-flex items-center justify-center px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            p.isBestseller
                              ? 'bg-amber-400 text-black border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.35)]'
                              : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                          }`}
                          title={p.isBestseller ? 'Featured in Best Sellers (Click to remove)' : 'Click to feature in Best Sellers'}
                        >
                          <span>{p.isBestseller ? 'YES' : 'NO'}</span>
                        </button>
                      </td>

                      {/* Enable Custom Print Toggle */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => updateProductRow(p.id, 'isCustomizable', !p.isCustomizable)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            p.isCustomizable
                              ? 'bg-amber-400 text-black border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.35)]'
                              : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                          }`}
                          title={p.isCustomizable ? 'Custom print enabled (Name & Number) - Click to disable' : 'Click to enable custom name & number printing'}
                        >
                          <Type className={`w-3.5 h-3.5 ${p.isCustomizable ? 'text-black' : 'text-zinc-500'}`} />
                          <span>{p.isCustomizable ? 'YES' : 'NO'}</span>
                        </button>
                      </td>

                      {/* Sizes & Stock Inventory */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <input
                            type="text"
                            value={p.sizesText}
                            placeholder="e.g. S5, M5, L5, XL5"
                            onChange={(e) => updateProductRow(p.id, 'sizesText', e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                          />

                          {/* Live computed stock breakdown badge */}
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
                              {(p.images || []).map((imgUrl, imgIdx) => (
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
                                        onClick={() => setPrimaryRowImage(p.id, imgIdx)}
                                        className="p-1 bg-amber-400 hover:bg-amber-300 text-black rounded cursor-pointer"
                                        title="Set as primary cover"
                                      >
                                        <Star className="w-2.5 h-2.5" />
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => removeRowImage(p.id, imgIdx)}
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
                              {uploadingProductId === p.id ? (
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
                                onChange={(e) => handleRowImageUpload(p.id, e)}
                                disabled={uploadingProductId === p.id}
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
                    </tr>
                  );
                })
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
                <span>SAVING ALL PRODUCTS...</span>
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
