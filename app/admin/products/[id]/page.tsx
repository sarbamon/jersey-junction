'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2, RefreshCw, UploadCloud, Loader2, Image as ImageIcon, Star, Plus } from 'lucide-react';
import { productService } from '../../../../lib/services/productService';
import { categoryService } from '../../../../lib/services/categoryService';
import { uploadService } from '../../../../lib/services/uploadService';
import { orderService } from '../../../../lib/services/orderService';
import { AdminProduct, AdminCategory, AdminOrder } from '../../../../lib/types/admin';
import { StatusBadge } from '../../../../components/admin/StatusBadge';
import { ConfirmModal } from '../../../../components/admin/ConfirmModal';
import { Toast } from '../../../../components/admin/Toast';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [relatedOrders, setRelatedOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Editable state
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [sizeStock, setSizeStock] = useState<Record<string, number>>({
    XS: 0,
    S: 5,
    M: 5,
    L: 5,
    XL: 5,
    XXL: 0,
  });
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<'Active' | 'Out of Stock'>('Active');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadProgress, setUploadProgress] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [isCustomizable, setIsCustomizable] = useState(false);

  const fetchProduct = async () => {
    setIsLoading(true);
    try {
      const cats = await categoryService.getCategories();
      setCategories(cats);

      const found = await productService.getProductById(id);
      if (found) {
        // Fetch all orders to compute live sales telemetry & orders breakdown
        try {
          const allOrders = await orderService.fetchOrdersAsync();
          const validOrders = allOrders.filter((o) => o.orderStatus !== 'Cancelled');
          const prodIdStr = (found.id || '').toLowerCase();
          const prodSlug = (found.slug || '').toLowerCase();
          const prodName = (found.name || '').toLowerCase().trim();

          let dynamicSold = 0;
          let dynamicRevenue = 0;
          const matchedOrders: AdminOrder[] = [];

          validOrders.forEach((ord) => {
            let matchedInOrder = false;
            ord.items?.forEach((itm: any) => {
              const itmPid = (itm.productId || '').toString().toLowerCase();
              const itmName = (itm.name || '').toLowerCase().trim();

              if (itmPid === prodIdStr || itmPid === prodSlug || itmName === prodName) {
                const q = Number(itm.quantity) || 1;
                const p = Number(itm.unitPrice) || found.price || 0;
                dynamicSold += q;
                dynamicRevenue += q * p;
                matchedInOrder = true;
              }
            });

            if (matchedInOrder) {
              matchedOrders.push(ord);
            }
          });

          found.totalSold = Math.max(found.totalSold || 0, dynamicSold);
          found.revenueGenerated = Math.max(found.revenueGenerated || 0, dynamicRevenue);
          setRelatedOrders(matchedOrders);
        } catch (ordErr) {
          console.error('Error fetching related orders for product:', ordErr);
        }

        setProduct(found);
        setName(found.name);
        setPrice(found.price);
        setOriginalPrice(found.originalPrice || 0);
        setCategory(found.category);
        if (found.sizeStock && Object.keys(found.sizeStock).length > 0) {
          setSizeStock(found.sizeStock);
        } else {
          const sList = found.sizes || ['S', 'M', 'L', 'XL'];
          const initStock: Record<string, number> = { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
          sList.forEach((sz: string) => {
            initStock[sz] = Math.max(1, Math.floor((found.stock || 10) / (sList.length || 1)));
          });
          setSizeStock(initStock);
        }
        setStatus(found.status === 'Out of Stock' ? 'Out of Stock' : 'Active');
        setDescription(found.description);
        const coverImg = found.image || (found.images && found.images[0]) || '';
        const galleryImgs = Array.isArray(found.images) && found.images.length > 0 ? found.images : (coverImg ? [coverImg] : []);
        setImage(coverImg);
        setImages(galleryImgs);
        setIsFeatured(found.isFeatured);
        setIsBestseller(found.isBestseller);
        setIsCustomizable(Boolean(found.isCustomizable));
      }
    } catch (err: any) {
      setToastMsg(`Error loading product: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploadingImage(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        setUploadProgress(`Uploading ${i + 1} of ${files.length}...`);
        const url = await uploadService.uploadImage(files[i]);
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

  if (isLoading) {
    return (
      <div className="p-16 text-center text-zinc-400 font-mono text-xs flex items-center justify-center">
        <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-12 text-center text-zinc-400 font-mono text-xs space-y-4">
        <div>Product with ID &quot;{id}&quot; not found in backend database.</div>
        <Link href="/admin/products" className="text-amber-400 font-bold hover:underline">
          ← Return to Products List
        </Link>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

      const totalStock = Object.values(sizeStock).reduce((sum, val) => sum + (Number(val) || 0), 0);
      const inStockSizes = (['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const).filter(sz => (sizeStock[sz] || 0) > 0);
      const activeSizes = inStockSizes.length > 0 ? inStockSizes : (['M', 'L'] as const);
      const finalImages = images.length > 0 ? images : (image ? [image] : []);
      const primaryImage = image || (finalImages[0] || '');

      const updated = await productService.updateProduct(product.id, {
        name,
        price: Number(price),
        originalPrice: Number(originalPrice),
        discount,
        stock: totalStock,
        sizeStock,
        sizes: activeSizes as any,
        category,
        status,
        description,
        image: primaryImage,
        images: finalImages,
        isFeatured,
        isBestseller,
        isCustomizable
      });

      setProduct(updated);
      setIsCustomizable(Boolean(updated.isCustomizable));
      setIsEditing(false);
      setToastMsg('Product updated successfully!');
    } catch (err: any) {
      setToastMsg(`Failed to save changes: ${err.message || 'Error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await productService.deleteProduct(product.id);
      router.push('/admin/products');
    } catch (err: any) {
      setToastMsg(`Error deleting product: ${err.message}`);
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/90 p-6 rounded-3xl border border-zinc-800 shadow-xl">
        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="p-2.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 rounded-2xl border border-zinc-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <StatusBadge status={product.status} type="product" />
            </div>
            <h1 className="text-xl font-black font-serif uppercase tracking-tight text-white max-w-xl truncate">
              {product.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isEditing 
                ? 'bg-zinc-800 text-zinc-300 border border-zinc-700' 
                : 'bg-amber-400 hover:bg-amber-500 text-black font-extrabold shadow-lg'
            }`}
          >
            {isEditing ? 'Cancel Edit' : 'Edit Product'}
          </button>

          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl transition-all cursor-pointer"
            title="Delete Product"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Details or Edit Mode */}
      {isEditing ? (
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
              <h2 className="text-sm font-extrabold font-serif uppercase tracking-wider text-amber-400 border-b border-zinc-800 pb-3">
                Edit Product Information
              </h2>

              <div>
                <label className="font-bold text-zinc-400 block mb-1 uppercase">Title</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-zinc-400 block mb-1 uppercase">Category</label>
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
                  <label className="font-bold text-zinc-400 block mb-1 uppercase">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-400 block mb-1 uppercase">Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h2 className="text-sm font-extrabold font-serif uppercase tracking-wider text-amber-400">
                  Price &amp; Stock by Size
                </h2>
                <div className="flex items-center gap-2 font-mono text-xs bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-xl">
                  <span className="text-zinc-400 uppercase font-bold text-[10px]">Total Stock:</span>
                  <span className="text-amber-400 font-black text-sm">
                    {Object.values(sizeStock).reduce((sum, val) => sum + (Number(val) || 0), 0)}
                  </span>
                  <span className="text-zinc-500 text-[10px]">units</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-zinc-400 block mb-1 uppercase">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-400 block mb-1 uppercase">Original Price</label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-400 font-mono font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="font-bold text-zinc-300 block mb-1 uppercase tracking-wide text-xs">
                    Stock Units Per Size (e.g. M: 5, L: 5)
                  </label>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {(['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const).map((sz) => {
                    const qty = sizeStock[sz] ?? 0;
                    return (
                      <div
                        key={sz}
                        className={`p-3 rounded-2xl border transition-all text-center flex flex-col items-center justify-between ${
                          qty > 0 ? 'bg-zinc-950 border-amber-400/50' : 'bg-zinc-950/60 border-zinc-800 opacity-70'
                        }`}
                      >
                        <span className="font-black text-sm text-white block mb-1.5 font-mono">{sz}</span>
                        <input
                          type="number"
                          min={0}
                          value={qty}
                          onChange={(e) => setSizeStock(prev => ({ ...prev, [sz]: Math.max(0, parseInt(e.target.value) || 0) }))}
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
                <p className="text-[10px] text-zinc-500 mt-1">Tip: Select 2 or 3 photos to show different jersey angles.</p>
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

            {/* Visibility Flags Card */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
              <h2 className="text-sm font-extrabold font-serif uppercase tracking-wider text-amber-400 border-b border-zinc-800 pb-3">
                Visibility Flags
              </h2>
              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded accent-amber-400 cursor-pointer"
                  />
                  <span className="font-bold text-white uppercase">Featured</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBestseller}
                    onChange={(e) => setIsBestseller(e.target.checked)}
                    className="w-4 h-4 rounded accent-amber-400 cursor-pointer"
                  />
                  <span className="font-bold text-white uppercase">Best Seller</span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-zinc-800">
                  <input
                    type="checkbox"
                    checked={isCustomizable}
                    onChange={(e) => setIsCustomizable(e.target.checked)}
                    className="w-4 h-4 rounded accent-amber-400 cursor-pointer mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-white uppercase block text-xs">Custom Name &amp; Number</span>
                    <span className="text-[10px] text-zinc-400 block">Enable customer name and number printing on back (+₹100)</span>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving || isUploadingImage}
              className="w-full py-4 bg-amber-400 hover:bg-amber-500 text-black font-extrabold text-xs uppercase tracking-widest rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              <span>{isSaving ? 'Saving Changes...' : 'Save Product Changes'}</span>
            </button>
          </div>

        </form>
      ) : (
        /* View Mode */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-6">
              
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex flex-col gap-2 shrink-0">
                  <div className="h-48 w-48 rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden relative">
                    {product.image && (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  {product.images && product.images.length > 1 && (
                    <div className="flex gap-1.5 overflow-x-auto max-w-[192px] pt-1">
                      {product.images.map((img, i) => (
                        <div key={i} className="h-12 w-12 rounded-lg border border-zinc-800 overflow-hidden shrink-0 bg-zinc-950 p-0.5">
                          <img src={img} alt={`Photo ${i + 1}`} className="w-full h-full object-contain" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3 flex-1">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">{product.category}</span>
                    <h2 className="text-2xl font-black font-serif uppercase text-white">{product.name}</h2>
                  </div>

                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-2xl font-extrabold text-amber-400">₹{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-zinc-500 line-through">₹{product.originalPrice}</span>
                    )}
                    {product.discount ? (
                      <span className="px-2 py-0.5 bg-amber-400/20 text-amber-400 text-xs font-bold rounded">
                        {product.discount}% OFF
                      </span>
                    ) : null}
                  </div>

                  <div className="pt-2 flex flex-wrap gap-2">
                    {product.sizes.map((sz) => (
                      <span key={sz} className="px-3 py-1 bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono text-xs font-bold rounded-lg">
                        {sz}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-4 space-y-2 text-xs">
                <h3 className="font-bold text-amber-400 uppercase font-serif">Description</h3>
                <p className="text-zinc-300 leading-relaxed">{product.description}</p>
              </div>

            </div>

            {/* Sales & Analytics Card */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-extrabold font-serif uppercase tracking-wider text-amber-400">
                  Sales Telemetry & Performance
                </h3>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2.5 py-1 rounded-full border border-zinc-800">
                  Live Orders Sync
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold">Total Sold</span>
                  <div className="text-xl font-mono font-black text-white">{product.totalSold} units</div>
                </div>

                <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold">Revenue</span>
                  <div className="text-xl font-mono font-black text-amber-400">₹{product.revenueGenerated.toLocaleString('en-IN')}</div>
                </div>

                <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold">Stock Remaining</span>
                  <div className="text-xl font-mono font-black text-white">{product.stock} units</div>
                </div>
              </div>

              {/* Related Orders Breakdown */}
              <div className="pt-2">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-3">
                  Orders For This Jersey ({relatedOrders.length})
                </h4>
                {relatedOrders.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 text-center text-xs text-zinc-500">
                    No orders placed for this jersey yet. When a customer purchases this product, telemetry and order records will display here automatically.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {relatedOrders.map((ord) => {
                      const cleanOrdId = ord.id.replace('#', '');
                      const jerseyItem = ord.items?.find((i: any) => 
                        (i.productId && (i.productId.toLowerCase() === product.id.toLowerCase() || i.productId.toLowerCase() === (product.slug || '').toLowerCase())) ||
                        (i.name && i.name.toLowerCase().trim() === product.name.toLowerCase().trim())
                      );

                      return (
                        <Link
                          key={ord.id}
                          href={`/admin/orders/${cleanOrdId}`}
                          className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 hover:border-amber-400/50 transition-colors text-xs"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-amber-400">{ord.id}</span>
                              <span className="text-zinc-400 font-medium">• {ord.customerName}</span>
                              {jerseyItem?.size && (
                                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-mono font-bold text-zinc-300">
                                  Size {jerseyItem.size}
                                </span>
                              )}
                              {(jerseyItem?.customName || jerseyItem?.customNumber) && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/30 text-[9px] font-mono font-bold">
                                  Custom &quot;{jerseyItem.customName}&quot; #{jerseyItem.customNumber}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-zinc-500 font-mono">
                              {ord.date} • {ord.paymentMethod} • Status: {ord.orderStatus}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-white">
                              ₹{(jerseyItem ? ((jerseyItem.quantity || 1) * (jerseyItem.unitPrice || product.price)) : ord.totalAmount).toLocaleString('en-IN')}
                            </span>
                            <div className="text-[10px] text-amber-400/80">View Order →</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Col */}
          <div className="space-y-6">
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
              <h3 className="text-sm font-extrabold font-serif uppercase tracking-wider text-amber-400 border-b border-zinc-800 pb-3">
                Metadata Specs
              </h3>

              <div className="space-y-3 font-mono">
                <div className="flex justify-between border-b border-zinc-800/60 pb-2">
                  <span className="text-zinc-500">Product ID:</span>
                  <span className="text-white font-bold">{product.id}</span>
                </div>

                <div className="flex justify-between border-b border-zinc-800/60 pb-2">
                  <span className="text-zinc-500">Brand:</span>
                  <span className="text-white font-bold">{product.brand}</span>
                </div>

                <div className="flex justify-between border-b border-zinc-800/60 pb-2">
                  <span className="text-zinc-500">Date Created:</span>
                  <span className="text-white font-bold">{product.createdDate}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Product"
        message={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete Product'}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />

      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}

    </div>
  );
}
