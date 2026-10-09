'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Save, Trash2, RefreshCw, UploadCloud, Loader2, Image as ImageIcon } from 'lucide-react';
import { productService } from '../../../../lib/services/productService';
import { categoryService } from '../../../../lib/services/categoryService';
import { uploadService } from '../../../../lib/services/uploadService';
import { AdminProduct, AdminCategory } from '../../../../lib/types/admin';
import { StatusBadge } from '../../../../components/admin/StatusBadge';
import { ConfirmModal } from '../../../../components/admin/ConfirmModal';
import { Toast } from '../../../../components/admin/Toast';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
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
  const [stock, setStock] = useState(0);
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<'Active' | 'Draft' | 'Out of Stock'>('Active');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);

  const fetchProduct = async () => {
    setIsLoading(true);
    try {
      const cats = await categoryService.getCategories();
      setCategories(cats);

      const found = await productService.getProductById(id);
      if (found) {
        setProduct(found);
        setName(found.name);
        setPrice(found.price);
        setOriginalPrice(found.originalPrice || 0);
        setStock(found.stock);
        setCategory(found.category);
        setStatus(found.status);
        setDescription(found.description);
        setImage(found.image);
        setIsFeatured(found.isFeatured);
        setIsBestseller(found.isBestseller);
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
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const uploadedUrl = await uploadService.uploadImage(file);
      setImage(uploadedUrl);
      setToastMsg('Image uploaded to Cloudinary successfully!');
    } catch (err: any) {
      setToastMsg(`Upload failed: ${err.message || 'Could not upload image'}`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center text-zinc-400 font-mono text-xs flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
        <span>Loading product details from database...</span>
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

      const updated = await productService.updateProduct(product.id, {
        name,
        price: Number(price),
        originalPrice: Number(originalPrice),
        discount,
        stock: Number(stock),
        category,
        status,
        description,
        image,
        isFeatured,
        isBestseller
      });

      setProduct(updated);
      setIsEditing(false);
      setToastMsg('Product updated successfully in MongoDB database!');
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
              <span className="font-mono text-xs text-amber-400 font-bold">{product.sku}</span>
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
                    value={category}
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
                    <option value="Draft">Draft</option>
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
              <h2 className="text-sm font-extrabold font-serif uppercase tracking-wider text-amber-400 border-b border-zinc-800 pb-3">
                Price & Stock Controls
              </h2>

              <div className="grid grid-cols-3 gap-4">
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

                <div>
                  <label className="font-bold text-zinc-400 block mb-1 uppercase">Stock Units</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
              <h2 className="text-sm font-extrabold font-serif uppercase tracking-wider text-amber-400 border-b border-zinc-800 pb-3">
                Cloudinary Media Upload
              </h2>

              {/* Preview */}
              <div className="relative w-full h-40 bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden flex items-center justify-center">
                {image ? (
                  <img src={image} alt="Preview" className="w-full h-full object-contain p-2" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-zinc-600" />
                )}
              </div>

              <div>
                <label className="font-bold text-zinc-400 block mb-1.5 uppercase flex items-center gap-1.5">
                  <UploadCloud className="w-4 h-4 text-amber-400" />
                  Upload Image File (Cloudinary)
                </label>
                <label className="w-full py-2.5 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/30 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-all">
                  {isUploadingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Uploading to Cloudinary...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span>Select File to Upload</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploadingImage}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="font-bold text-zinc-400 block mb-1 uppercase">Image URL</label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-300 font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-2 pt-2">
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
                <div className="h-48 w-48 rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden relative shrink-0">
                  {product.image && (
                    <Image src={product.image} alt={product.name} fill className="object-cover" />
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
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-extrabold font-serif uppercase tracking-wider text-amber-400 border-b border-zinc-800 pb-3">
                Sales Telemetry & Performance
              </h3>

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
                  <span className="text-zinc-500">SKU:</span>
                  <span className="text-white font-bold">{product.sku}</span>
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
        message={`Are you sure you want to delete "${product.name}"? This will permanently erase it from MongoDB.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete Product'}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />

      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}

    </div>
  );
}
