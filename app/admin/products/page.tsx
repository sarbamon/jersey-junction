'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit, Trash2, Package, RefreshCw, CheckSquare, Trash, PackageX, Type } from 'lucide-react';
import { ConfirmModal } from '../../../components/admin/ConfirmModal';
import { Toast } from '../../../components/admin/Toast';
import { productService } from '../../../lib/services/productService';
import { categoryService } from '../../../lib/services/categoryService';
import { AdminProduct, AdminCategory } from '../../../lib/types/admin';

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<AdminProduct[]>(() => productService.getAdminProductsSync());
  const [categories, setCategories] = useState<AdminCategory[]>(() => categoryService.getCategoriesSync());
  const [isLoading, setIsLoading] = useState<boolean>(() => productService.getAdminProductsSync().length === 0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Modal & Toast states
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const loadData = async (forceSpinner = false) => {
    if (forceSpinner || products.length === 0) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setError('');

    try {
      const [prods, cats] = await Promise.all([
        productService.getAdminProducts(),
        Promise.resolve(categoryService.getCategories()),
      ]);
      if (Array.isArray(prods)) setProducts(prods);
      if (Array.isArray(cats) && cats.length > 0) setCategories(cats);
    } catch (err: any) {
      if (products.length === 0) {
        setError(err.message || 'Failed to load products from database server.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleProductsUpdated = () => {
      const fresh = productService.getAdminProductsSync();
      if (Array.isArray(fresh)) setProducts(fresh);
      loadData(false);
    };
    window.addEventListener('jj_products_updated', handleProductsUpdated);
    return () => {
      window.removeEventListener('jj_products_updated', handleProductsUpdated);
    };
  }, []);

  const filteredProducts = products.filter((p) => {
    const queryLower = searchQuery.toLowerCase();
    const matchesSearch = 
      p.name.toLowerCase().includes(queryLower) ||
      p.sku.toLowerCase().includes(queryLower) ||
      p.category.toLowerCase().includes(queryLower);

    const matchesCategory = 
      categoryFilter === 'all' ||
      (categoryFilter.toLowerCase().includes('fan') && p.category.toLowerCase().includes('fan')) ||
      (categoryFilter.toLowerCase().includes('player') && p.category.toLowerCase().includes('player') && !p.category.toLowerCase().includes('fan'));

    return matchesSearch && matchesCategory;
  });

  const isAllSelected = filteredProducts.length > 0 && filteredProducts.every(p => selectedIds.includes(p.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map(p => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.length} selected product(s)?`)) {
      setIsDeleting(true);
      const toDelete = [...selectedIds];
      setProducts(prev => prev.filter(p => !toDelete.includes(p.id)));
      setSelectedIds([]);
      try {
        await productService.deleteProductsBulk(toDelete);
        setToastMessage(`Successfully deleted ${toDelete.length} product(s).`);
        await loadData();
      } catch (err: any) {
        setToastMessage(`Error deleting selected products: ${err.message || 'Failed'}`);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      setIsDeleting(true);
      const target = deleteTarget;
      setProducts(prev => prev.filter(p => p.id !== target.id));
      setSelectedIds(prev => prev.filter(id => id !== target.id));
      setDeleteTarget(null);
      try {
        await productService.deleteProduct(target.id);
        setToastMessage(`Product "${target.name}" deleted successfully.`);
        await loadData();
      } catch (err: any) {
        setToastMessage(`Error deleting product: ${err.message || 'Failed to delete'}`);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleBulkOutOfStock = async () => {
    if (selectedIds.length === 0) return;
    setIsUpdatingStatus(true);
    try {
      await Promise.all(
        selectedIds.map((id) =>
          productService.updateProduct(id, {
            status: 'Out of Stock',
            stock: 0,
            sizeStock: { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 },
          })
        )
      );
      setProducts((prev) =>
        prev.map((p) =>
          selectedIds.includes(p.id)
            ? {
                ...p,
                status: 'Out of Stock',
                stock: 0,
                sizeStock: { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 },
              }
            : p
        )
      );
      setToastMessage(`Marked ${selectedIds.length} product(s) as Out of Stock!`);
      setSelectedIds([]);
    } catch (err: any) {
      setToastMessage(`Failed to update products: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleBulkSetBestseller = async (isBestseller: boolean) => {
    if (selectedIds.length === 0) return;
    setIsUpdatingStatus(true);
    try {
      await Promise.all(
        selectedIds.map((id) =>
          productService.updateProduct(id, { isBestseller })
        )
      );
      setProducts((prev) =>
        prev.map((p) =>
          selectedIds.includes(p.id) ? { ...p, isBestseller } : p
        )
      );
      setToastMessage(`${isBestseller ? 'Added' : 'Removed'} ${selectedIds.length} product(s) ${isBestseller ? 'to' : 'from'} Best Sellers!`);
      setSelectedIds([]);
    } catch (err: any) {
      setToastMessage(`Failed to update best seller status: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleBulkEditSelected = () => {
    if (selectedIds.length === 0) return;
    router.push(`/admin/products/bulk-edit?ids=${selectedIds.join(',')}`);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/90 p-6 rounded-3xl border border-zinc-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Package className="w-4 h-4" />
            <span>CATALOG MANAGEMENT SYSTEM</span>
          </div>
          <h1 className="text-2xl font-black font-serif uppercase tracking-tight text-white flex items-center gap-3">
            PRODUCTS ({filteredProducts.length})
            {(isLoading || isRefreshing) && <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />}
          </h1>
          <p className="text-xs text-zinc-400">
            Manage store catalog, prices, inventory levels, and product availability.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => loadData(true)}
            className="p-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold transition-all cursor-pointer border border-zinc-700"
            title="Refresh Product List"
          >
            <RefreshCw className={`w-4 h-4 ${(isLoading || isRefreshing) ? 'animate-spin' : ''}`} />
          </button>

          <Link
            href="/admin/products/bulk-edit"
            className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 border border-zinc-700 transition-all cursor-pointer uppercase tracking-wider"
          >
            <Edit className="w-4 h-4 text-amber-400" />
            <span>Bulk Edit</span>
          </Link>

          <Link
            href="/admin/products/bulk"
            className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 border border-zinc-700 transition-all cursor-pointer uppercase tracking-wider"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Bulk Add</span>
          </Link>
          
          <Link
            href="/admin/products/add"
            className="px-5 py-3 bg-amber-400 hover:bg-amber-500 text-black font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs font-bold flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => loadData(true)} className="underline text-white hover:text-amber-400">Retry</button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800/80 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search products by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-zinc-300 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Action Toolbar Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-amber-400/10 border border-amber-400/30 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
          <div className="text-amber-400 flex items-center gap-2 font-mono">
            <CheckSquare className="w-4 h-4" />
            <span>SELECTED {selectedIds.length} OF {filteredProducts.length} PRODUCTS</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleBulkEditSelected}
              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-500 text-black font-extrabold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Selected ({selectedIds.length})</span>
            </button>

            <button
              onClick={() => handleBulkSetBestseller(true)}
              disabled={isUpdatingStatus}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-extrabold rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-md disabled:opacity-50"
              title="Show selected products in Best Seller section on Homepage"
            >
              <span>Best Seller: ON ({selectedIds.length})</span>
            </button>

            <button
              onClick={() => handleBulkSetBestseller(false)}
              disabled={isUpdatingStatus}
              className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-lg flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
              title="Hide selected products from Best Seller section"
            >
              <span>Best Seller: OFF ({selectedIds.length})</span>
            </button>

            <button
              onClick={handleBulkOutOfStock}
              disabled={isUpdatingStatus}
              className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <PackageX className="w-3.5 h-3.5" />
              <span>{isUpdatingStatus ? 'Updating...' : `Out of Stock (${selectedIds.length})`}</span>
            </button>

            <button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Trash className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 uppercase font-mono text-[10px] tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-4 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    title="Select All Products"
                    className="w-4 h-4 rounded accent-amber-400 cursor-pointer"
                  />
                </th>
                <th className="py-4 px-4 font-bold">Image</th>
                <th className="py-4 px-4 font-bold">Product Name</th>
                <th className="py-4 px-4 font-bold">Category</th>
                <th className="py-4 px-4 font-bold">Price</th>
                <th className="py-4 px-4 font-bold">Stock</th>
                <th className="py-4 px-4 font-bold">Created</th>
                <th className="py-4 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-zinc-400 text-xs">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500 text-xs">
                    No products found in backend database matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isSelected = selectedIds.includes(p.id);
                  return (
                    <tr
                      key={p.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-amber-400/5' : 'hover:bg-zinc-800/40'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(p.id)}
                          className="w-4 h-4 rounded accent-amber-400 cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-4">
                        <div className="h-12 w-12 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden relative shrink-0">
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <img src="/placeholder-jersey.svg" alt="Placeholder" className="w-full h-full object-cover opacity-60" />
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white max-w-xs truncate">{p.name}</span>
                          {p.isBestseller && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[9px] font-black uppercase tracking-wider shrink-0" title="Featured in Best Sellers on Homepage">
                              <span>Bestseller</span>
                            </span>
                          )}
                          {p.isCustomizable && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-sky-400/10 border border-sky-400/30 text-sky-400 text-[9px] font-black uppercase tracking-wider shrink-0" title="Custom Name & Number enabled">
                              <Type className="w-2.5 h-2.5" />
                              <span>Customizable</span>
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-bold">
                          {p.category.toLowerCase().includes('fan') ? 'Fan Version' : 'Player Version'}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-extrabold text-amber-400">
                        ₹{p.price}
                        {p.originalPrice && (
                          <span className="text-[10px] text-zinc-500 line-through ml-1 font-normal">₹{p.originalPrice}</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`font-mono font-bold ${p.status === 'Out of Stock' || p.stock === 0 ? 'text-red-400' : p.stock <= 5 ? 'text-amber-400' : 'text-zinc-300'}`}>
                          {p.status === 'Out of Stock' || p.stock === 0 ? 'Out of Stock' : `${p.stock} units`}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-zinc-400">
                        {p.createdDate}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/products/${p.id}`}
                            className="p-2 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded-lg transition-all"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => setDeleteTarget(p)}
                            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Action cannot be undone.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete Product'}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage('')} />
      )}

    </div>
  );
}
