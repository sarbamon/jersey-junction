'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, UploadCloud, Image as ImageIcon, Trash2, Plus, Star } from 'lucide-react';
import { productService } from '../../../../lib/services/productService';
import { categoryService } from '../../../../lib/services/categoryService';
import { uploadService } from '../../../../lib/services/uploadService';
import { AdminCategory } from '../../../../lib/types/admin';
import { Toast } from '../../../../components/admin/Toast';

export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    categoryService.getCategories().then(setCategories);
  }, []);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Player Version');
  const [description, setDescription] = useState('Official high-performance match jersey with moisture-wicking technology and official crest.');
  const [shortDescription, setShortDescription] = useState('Authentic master-quality match kit');
  const [price, setPrice] = useState(799);
  const [originalPrice, setOriginalPrice] = useState(1200);
  const [sku, setSku] = useState('');
  const [sizeStock, setSizeStock] = useState<Record<string, number>>({
    XS: 0,
    S: 5,
    M: 5,
    L: 5,
    XL: 5,
    XXL: 0,
  });
  const [image, setImage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadProgress, setUploadProgress] = useState('');
  const [isFeatured, setIsFeatured] = useState(true);
  const [isBestseller, setIsBestseller] = useState(false);
  const [isCustomizable, setIsCustomizable] = useState(false);
  const [status, setStatus] = useState<'Active' | 'Out of Stock'>('Active');

  const [toastMsg, setToastMsg] = useState('');

  const totalStock = Object.values(sizeStock).reduce((sum, val) => sum + (Number(val) || 0), 0);

  const handleSizeStockChange = (sz: string, val: number) => {
    setSizeStock(prev => ({
      ...prev,
      [sz]: Math.max(0, val)
    }));
  };

  // Auto-generate slug and SKU when name changes
  const handleNameChange = (val: string) => {
    setName(val);
    const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setSlug(generatedSlug);
    const generatedSku = `JJ-${val.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    if (!sku) setSku(generatedSku);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploadingImage(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        setUploadProgress(`Uploading ${i + 1} of ${files.length}...`);
        const url = await uploadService.uploadImage(files[i], 'jerseyjunction_uploads');
        if (url) uploadedUrls.push(url);
      }

      setImages(prev => {
        const combined = [...prev, ...uploadedUrls];
        if (!image && combined.length > 0) {
          setImage(combined[0]);
        }
        return combined;
      });

      if (!image && uploadedUrls.length > 0) {
        setImage(uploadedUrls[0]);
      }

      setToastMsg(`Successfully uploaded ${uploadedUrls.length} photo(s)!`);
    } catch (err: any) {
      setToastMsg(`Upload failed: ${err.message || 'Could not upload image'}`);
    } finally {
      setIsUploadingImage(false);
      setUploadProgress('');
      e.target.value = '';
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    const url = imageUrlInput.trim();
    setImages(prev => {
      const updated = [...prev, url];
      if (!image) setImage(url);
      return updated;
    });
    if (!image) setImage(url);
    setImageUrlInput('');
    setToastMsg('Photo URL added to gallery!');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages(prev => {
      const targetUrl = prev[indexToRemove];
      const updated = prev.filter((_, idx) => idx !== indexToRemove);
      if (image === targetUrl) {
        setImage(updated[0] || '');
      }
      return updated;
    });
  };

  const handleSetPrimaryImage = (targetImg: string) => {
    setImage(targetImg);
    setImages(prev => [targetImg, ...prev.filter(img => img !== targetImg)]);
    setToastMsg('Set as primary cover photo');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
      const derivedSlug = (name || 'product')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

      const inStockSizes = (['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const).filter(sz => (sizeStock[sz] || 0) > 0);
      const activeSizes = inStockSizes.length > 0 ? inStockSizes : (['M', 'L'] as const);

      const finalImages = images.length > 0 ? images : (image ? [image] : []);
      const primaryImage = image || (finalImages[0] || '');

      await productService.addProduct({
        name,
        slug: slug || derivedSlug,
        category,
        subcategory: '',
        description,
        shortDescription,
        price: Number(price),
        originalPrice: Number(originalPrice),
        discount,
        stock: totalStock,
        sizeStock,
        sku: sku || `SKU-${Date.now()}`,
        brand: 'Jersey Junction',
        sizes: activeSizes as any,
        colors: [],
        image: primaryImage,
        images: finalImages,
        isFeatured,
        isBestseller,
        isCustomizable,
        status
      });

      setToastMsg('Product added successfully!');
      setTimeout(() => {
        router.push('/admin/products');
      }, 1200);
    } catch (err: any) {
      setToastMsg(`Error creating product: ${err.message || 'Failed to connect to backend'}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-zinc-900/90 p-6 rounded-3xl border border-zinc-800 shadow-xl">
        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="p-2.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 rounded-2xl border border-zinc-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black font-serif uppercase tracking-tight text-white">
              ADD NEW PRODUCT
            </h1>
            <p className="text-xs text-zinc-400">Fill in details & upload Cloudinary images to update store catalog</p>
          </div>
        </div>
      </div>

      {/* Product Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Main Info */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Basic Details Card */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-extrabold font-serif uppercase tracking-wider text-amber-400 border-b border-zinc-800 pb-3">
              General Product Information
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-zinc-400 block mb-1 uppercase">Product Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. ARSENAL HOME 24/25 PLAYER VERSION"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-400 block mb-1 uppercase">Category *</label>
                <select
                  value={categories.find(c => c.name.toLowerCase() === (category || '').toLowerCase())?.name || category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-zinc-400 block mb-1 uppercase">Short Summary</label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-400 block mb-1 uppercase">Full Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Stock by Size Card */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-sm font-extrabold font-serif uppercase tracking-wider text-amber-400">
                Pricing &amp; Inventory by Size
              </h2>
              <div className="flex items-center gap-2 font-mono text-xs bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-xl">
                <span className="text-zinc-400 uppercase font-bold text-[10px]">Total Stock:</span>
                <span className="text-amber-400 font-black text-sm">{totalStock}</span>
                <span className="text-zinc-500 text-[10px]">units</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-zinc-400 block mb-1 uppercase">Sale Price (₹) *</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-amber-400 font-mono font-bold text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-400 block mb-1 uppercase">Original Price (₹)</label>
                <input
                  type="number"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-400 font-mono font-bold text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Per Size Stock Inputs (e.g. M: 5, L: 5) */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="font-bold text-zinc-300 block mb-1 uppercase tracking-wide text-xs">
                  Stock Units Per Size (e.g. M: 5, L: 5)
                </label>
                <p className="text-zinc-500 text-[11px]">Set inventory count for each jersey size. Sizes with 0 are marked out of stock.</p>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {(['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const).map((sz) => {
                  const qty = sizeStock[sz] ?? 0;
                  return (
                    <div
                      key={sz}
                      className={`p-3 rounded-2xl border transition-all text-center flex flex-col items-center justify-between ${
                        qty > 0 
                          ? 'bg-zinc-950 border-amber-400/50 shadow-sm' 
                          : 'bg-zinc-950/60 border-zinc-800/80 opacity-70'
                      }`}
                    >
                      <span className="font-black text-sm text-white block mb-1.5 font-mono">{sz}</span>
                      <input
                        type="number"
                        min={0}
                        value={qty}
                        onChange={(e) => handleSizeStockChange(sz, parseInt(e.target.value) || 0)}
                        className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl py-1.5 text-center font-mono font-black text-amber-400 text-sm focus:outline-none focus:border-amber-400"
                      />
                      <span className="text-[10px] text-zinc-400 mt-1 font-mono font-semibold">
                        {qty > 0 ? `${qty} in stock` : 'empty'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Right Col: Attributes, Images & Actions */}
        <div className="space-y-6">
          
          {/* Product Photos Gallery Card */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
            <h2 className="text-sm font-extrabold font-serif uppercase tracking-wider text-amber-400 border-b border-zinc-800 pb-3 flex justify-between items-center">
              <span>Product Photos Gallery</span>
              <span className="text-[10px] text-amber-400 font-mono font-bold">
                {images.length > 0 ? `${images.length} Photo${images.length > 1 ? 's' : ''}` : 'No Photos'}
              </span>
            </h2>

            {/* Multiple File Upload Button */}
            <div>
              <label className="font-bold text-zinc-300 block mb-1.5 uppercase flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-amber-400" />
                <span>Upload Photos (Select 2-3 or more)</span>
              </label>
              <label className="w-full py-3.5 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/30 rounded-2xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-all">
                {isUploadingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>{uploadProgress || 'Uploading to Cloudinary...'}</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Select Multiple Files to Upload</span>
                  </>
                )}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploadingImage}
                  className="hidden"
                />
              </label>
              <p className="text-[10px] text-zinc-500 mt-1">Tip: Hold Ctrl / Shift to pick 2 or 3 photos at once.</p>
            </div>

            {/* Direct Image URL input */}
            <div className="space-y-1.5">
              <label className="font-bold text-zinc-400 block uppercase">Or Add Photo by URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddImageUrl();
                    }
                  }}
                  placeholder="https://res.cloudinary.com/..."
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-300 font-mono text-xs focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-amber-400 rounded-xl font-bold text-xs cursor-pointer border border-zinc-700 shrink-0"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Uploaded Gallery Grid */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <label className="font-bold text-zinc-400 block uppercase">
                Uploaded Photos ({images.length})
              </label>

              {images.length === 0 ? (
                <div className="h-32 bg-zinc-950 border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center p-4 text-center text-zinc-500 space-y-1">
                  <ImageIcon className="w-7 h-7 text-zinc-600" />
                  <span className="text-xs font-bold text-zinc-400">No photos uploaded yet</span>
                  <span className="text-[10px] text-zinc-500">Upload 2 or 3 photos (Front, Back, Details)</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.map((imgUrl, idx) => {
                    const isCover = (imgUrl === image) || (idx === 0 && !image);
                    return (
                      <div
                        key={idx}
                        className={`relative group rounded-2xl overflow-hidden border bg-zinc-950 flex flex-col items-center justify-between ${
                          isCover ? 'border-amber-400 shadow-md ring-1 ring-amber-400/50' : 'border-zinc-800'
                        }`}
                      >
                        <div className="h-28 w-full p-2 flex items-center justify-center bg-zinc-950">
                          <img
                            src={imgUrl}
                            alt={`Photo ${idx + 1}`}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        {/* Cover badge */}
                        {isCover && (
                          <div className="absolute top-1.5 left-1.5 bg-amber-400 text-black font-black text-[9px] px-1.5 py-0.5 rounded shadow uppercase tracking-wider flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-black" />
                            <span>COVER</span>
                          </div>
                        )}

                        {/* Bottom action bar */}
                        <div className="w-full bg-zinc-900 border-t border-zinc-800/80 px-2 py-1.5 flex items-center justify-between gap-1">
                          {!isCover ? (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(imgUrl)}
                              className="text-[10px] text-zinc-400 hover:text-amber-400 font-bold hover:underline cursor-pointer"
                            >
                              Make Cover
                            </button>
                          ) : (
                            <span className="text-[10px] text-amber-400 font-bold">Main Photo</span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="p-1 text-zinc-500 hover:text-red-400 rounded transition-colors cursor-pointer"
                            title="Remove photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Visibility & Status Card */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
            <h2 className="text-sm font-extrabold font-serif uppercase tracking-wider text-amber-400 border-b border-zinc-800 pb-3">
              Visibility Flags
            </h2>

            <div>
              <label className="font-bold text-zinc-400 block mb-1 uppercase">Product Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="Active">Active (In Stock / Live)</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>

            <div className="space-y-2 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded accent-amber-400 cursor-pointer"
                />
                <span className="font-bold text-white uppercase text-xs">Featured Product</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBestseller}
                  onChange={(e) => setIsBestseller(e.target.checked)}
                  className="w-4 h-4 rounded accent-amber-400 cursor-pointer"
                />
                <span className="font-bold text-white uppercase text-xs">Best Seller Badge</span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-zinc-800">
                <input
                  type="checkbox"
                  checked={isCustomizable}
                  onChange={(e) => setIsCustomizable(e.target.checked)}
                  className="w-4 h-4 rounded accent-amber-400 cursor-pointer mt-0.5"
                />
                <div>
                  <span className="font-bold text-white uppercase text-xs block">Custom Name &amp; Number</span>
                  <span className="text-[10px] text-zinc-400 block">Allow customers to customize the back with their name &amp; number (+₹100)</span>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || isUploadingImage}
            className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-extrabold text-xs uppercase tracking-widest rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-black" />
                <span>Saving to Database...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Create Product & Save</span>
              </>
            )}
          </button>

        </div>

      </form>

      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}

    </div>
  );
}
