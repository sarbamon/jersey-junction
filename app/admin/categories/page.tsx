'use client';

import React, { useState, useEffect } from 'react';
import { FolderTree, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { categoryService } from '../../../lib/services/categoryService';
import { productService } from '../../../lib/services/productService';
import { matchesCategory } from '../../../lib/utils/categoryMatcher';
import { AdminCategory } from '../../../lib/types/admin';
import { ConfirmModal } from '../../../components/admin/ConfirmModal';
import { Toast } from '../../../components/admin/Toast';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [status, setStatus] = useState<'Active' | 'Disabled'>('Active');

  const [editTarget, setEditTarget] = useState<AdminCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  const loadData = async () => {
    const rawCats = await categoryService.getCategories();
    try {
      const prods = await productService.getActiveProducts();
      const updatedCats = rawCats.map((cat) => {
        const count = prods.filter((p) => matchesCategory(p, cat.slug || cat.id || cat.name)).length;
        return { ...cat, productsCount: count };
      });
      setCategories(updatedCats);
    } catch {
      setCategories(rawCats);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await categoryService.addCategory({
      name,
      slug,
      tag: tag || 'Sport Collection',
      status
    });

    setName('');
    setTag('');
    setIsAddOpen(false);
    setToastMsg(`Category "${name}" created successfully.`);
    await loadData();
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;

    await categoryService.updateCategory(editTarget.id, {
      name: editTarget.name,
      tag: editTarget.tag,
      status: editTarget.status
    });

    setEditTarget(null);
    setToastMsg(`Category updated successfully.`);
    await loadData();
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      await categoryService.deleteCategory(deleteTarget.id);
      setToastMsg(`Category "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      await loadData();
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/90 p-6 rounded-3xl border border-zinc-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
            <FolderTree className="w-4 h-4" />
            <span>CATALOG TAXONOMY & CATEGORIES</span>
          </div>
          <h1 className="text-2xl font-black font-serif uppercase tracking-tight text-white">
            CATEGORIES ({categories.length})
          </h1>
          <p className="text-xs text-zinc-400">
            Organize kit collections, sport types, fit versions, and department tags.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(!isAddOpen)}
          className="px-5 py-3 bg-amber-400 hover:bg-amber-500 text-black font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer uppercase tracking-wider"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Add New Category Drawer Form */}
      {isAddOpen && (
        <form onSubmit={handleCreate} className="bg-zinc-900 border border-amber-400/40 rounded-3xl p-6 shadow-2xl space-y-4 text-xs animate-fade-in">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="font-serif font-black uppercase text-amber-400 text-sm">Create New Category</h3>
            <button onClick={() => setIsAddOpen(false)} type="button" className="text-zinc-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-zinc-400 block mb-1 uppercase">Category Title *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. National Teams"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-400 block mb-1 uppercase">Tag / Badge Subtitle</label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="e.g. World Cup & Euro Kits"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-400 block mb-1 uppercase">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Disabled">Disabled</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-black font-extrabold uppercase rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow"
            >
              <Save className="w-4 h-4" />
              <span>Save Category</span>
            </button>
          </div>
        </form>
      )}

      {/* Edit Category Modal Form */}
      {editTarget && (
        <form onSubmit={handleUpdate} className="bg-zinc-900 border border-amber-400/40 rounded-3xl p-6 shadow-2xl space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="font-serif font-black uppercase text-amber-400 text-sm">Edit Category: {editTarget.name}</h3>
            <button onClick={() => setEditTarget(null)} type="button" className="text-zinc-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-zinc-400 block mb-1 uppercase">Title</label>
              <input
                type="text"
                required
                value={editTarget.name}
                onChange={(e) => setEditTarget({ ...editTarget, name: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-400 block mb-1 uppercase">Tag Subtitle</label>
              <input
                type="text"
                value={editTarget.tag}
                onChange={(e) => setEditTarget({ ...editTarget, tag: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-400 block mb-1 uppercase">Status</label>
              <select
                value={editTarget.status}
                onChange={(e) => setEditTarget({ ...editTarget, status: e.target.value as any })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Disabled">Disabled</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setEditTarget(null)}
              type="button"
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-amber-400 hover:bg-amber-500 text-black font-extrabold uppercase rounded-xl text-xs flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Update Category</span>
            </button>
          </div>
        </form>
      )}

      {/* Categories Grid Table */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 uppercase font-mono text-[10px] tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-4 px-4 font-bold">Category Title</th>
                <th className="py-4 px-4 font-bold">Tag / Subtitle</th>
                <th className="py-4 px-4 font-bold">Products Count</th>
                <th className="py-4 px-4 font-bold">Status</th>
                <th className="py-4 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white text-sm">
                    {c.name}
                  </td>

                  <td className="py-3.5 px-4 text-zinc-400 font-mono">
                    {c.tag}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                    {c.productsCount} items
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      c.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
                    }`}>
                      {c.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setEditTarget(c)}
                        className="p-2 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded-lg transition-all"
                        title="Edit Category"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setDeleteTarget(c)}
                        className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Category"
        message={`Are you sure you want to delete category "${deleteTarget?.name}"?`}
        confirmText="Delete Category"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}

    </div>
  );
}
