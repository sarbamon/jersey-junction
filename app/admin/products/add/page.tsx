'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, UploadCloud, Image as ImageIcon } from 'lucide-react';
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
  const [subcategory, setSubcategory] = useState('Premier League');
  const [description, setDescription] = useState('Official high-performance match jersey with moisture-wicking technology and official crest.');
  const [shortDescription, setShortDescription] = useState('Authentic master-quality match kit');
  const [price, setPrice] = useState(799);
  const [originalPrice, setOriginalPrice] = useState(1200);
  const [stock, setStock] = useState(25);
  const [sku, setSku] = useState('');
  const [brand, setBrand] = useState('Nike');
  const [selectedSizes, setSelectedSizes] = useState<('XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL')[]>(['S', 'M', 'L', 'XL']);
  const [colors, setColors] = useState('Red, White, Gold');
  const [image, setImage] = useState('/jersey/WhatsApp Image 2026-09-08 at 11.44.00 PM.jpeg');
  const [isFeatured, setIsFeatured] = useState(true);
  const [isBestseller, setIsBestseller] = useState(false);
  const [status, setStatus] = useState<'Active' | 'Draft' | 'Out of Stock'>('Active');

  const [toastMsg, setToastMsg] = useState('');

  // Auto-generate slug and SKU when name changes
  const handleNameChange = (val: string) => {
    setName(val);
    const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setSlug(generatedSlug);
    const generatedSku = `JJ-${val.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    if (!sku) setSku(generatedSku);
  };

  const toggleSize = (sz: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL') => {
    if (selectedSizes.includes(sz)) {
      setSelectedSizes(selectedSizes.filter(s => s !== sz));
    } else {
      setSelectedSizes([...selectedSizes, sz]);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

      await productService.addProduct({
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category,
        subcategory,
        description,
        shortDescription,
        price: Number(price),
        originalPrice: Number(originalPrice),
        discount,
        stock: Number(stock),
        sku: sku || `SKU-${Date.now()}`,
        brand,
        sizes: selectedSizes,
        colors: colors.split(',').map(c => c.trim()),
        image,
        isFeatured,
        isBestseller,
        status
      });

      setToastMsg('Product added successfully to MongoDB database!');
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-zinc-400 block mb-1 uppercase">Slug / URL Key</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-300 font-mono text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-400 block mb-1 uppercase">SKU Code</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="ARS-HM-2425"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-300 font-mono text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-zinc-400 block mb-1 uppercase">Category *</label>
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
                  <label className="font-bold text-zinc-400 block mb-1 uppercase">Subcategory / League</label>
                  <input
                    type="text"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    placeholder="Premier League / La Liga"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
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

          {/* Pricing & Stock Card */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
            <h2 className="text-sm font-extrabold font-serif uppercase tracking-wider text-amber-400 border-b border-zinc-800 pb-3">
              Pricing & Inventory
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

              <div>
                <label className="font-bold text-zinc-400 block mb-1 uppercase">Stock Units *</label>
                <input
                  type="number"
                  required
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-mono font-bold text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Col: Attributes, Images & Actions */}
        <div className="space-y-6">
          
          {/* Cloudinary Image & Brand Card */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
            <h2 className="text-sm font-extrabold font-serif uppercase tracking-wider text-amber-400 border-b border-zinc-800 pb-3 flex justify-between items-center">
              <span>Cloudinary Image Upload</span>
              <span className="text-[10px] text-amber-400 font-mono">Cloudinary Connected</span>
            </h2>

            {/* Image Preview Box */}
            <div className="relative w-full h-48 bg-zinc-950 border-2 border-dashed border-zinc-800 rounded-2xl overflow-hidden flex flex-col items-center justify-center group">
              {image ? (
                <>
                  <img src={image} alt="Preview" className="w-full h-full object-contain p-2" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center text-[10px] text-zinc-300">
                    Click file button below to replace
                  </div>
                </>
              ) : (
                <div className="text-center p-4 space-y-2 text-zinc-500">
                  <ImageIcon className="w-8 h-8 mx-auto text-zinc-600" />
                  <span className="block text-xs font-bold text-zinc-400">No Image Uploaded</span>
                </div>
              )}
            </div>

            {/* Cloudinary Direct File Upload Button */}
            <div>
              <label className="font-bold text-zinc-400 block mb-1.5 uppercase flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-amber-400" />
                Upload Image File (Cloudinary)
              </label>
              <label className="w-full py-3 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/30 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-all">
                {isUploadingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Uploading to Cloudinary...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Select Local File &amp; Upload</span>
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
              <label className="font-bold text-zinc-400 block mb-1 uppercase">Or Image URL</label>
              <input
                type="text"
                required
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://res.cloudinary.com/..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-300 font-mono text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-400 block mb-1 uppercase">Manufacturer / Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Adidas / Nike / Puma"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-400 block mb-2 uppercase">Available Sizes</label>
              <div className="flex flex-wrap gap-2">
                {(['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const).map((sz) => {
                  const isSel = selectedSizes.includes(sz);
                  return (
                    <button
                      type="button"
                      key={sz}
                      onClick={() => toggleSize(sz)}
                      className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                        isSel ? 'bg-amber-400 text-black shadow-md' : 'bg-zinc-950 text-zinc-500 border border-zinc-800'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="font-bold text-zinc-400 block mb-1 uppercase">Colors (comma separated)</label>
              <input
                type="text"
                value={colors}
                onChange={(e) => setColors(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-400"
              />
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
                <option value="Active">Active (Visible in Store)</option>
                <option value="Draft">Draft (Hidden)</option>
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
