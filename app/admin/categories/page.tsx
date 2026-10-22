'use client';

import React, { useState, useEffect } from 'react';
import { 
  FolderTree, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  CheckSquare, 
  GripVertical, 
  ChevronUp, 
  ChevronDown, 
  ArrowUpDown,
  UploadCloud,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { categoryService } from '../../../lib/services/categoryService';
import { productService } from '../../../lib/services/productService';
import { uploadService } from '../../../lib/services/uploadService';
import { matchesCategory } from '../../../lib/utils/categoryMatcher';
import { AdminCategory } from '../../../lib/types/admin';
import { ConfirmModal } from '../../../components/admin/ConfirmModal';
import { Toast } from '../../../components/admin/Toast';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [editTarget, setEditTarget] = useState<AdminCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  // Multiple selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Drag and drop / Reordering state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const newCats = [...categories];
    const [moved] = newCats.splice(index, 1);
    newCats.splice(targetIndex, 0, moved);
    setCategories(newCats);

    const orderedIds = newCats.map((c) => c.id || c.slug);
    await categoryService.reorderCategories(orderedIds);
    setToastMsg(`Category order updated! Live on storefront & navigation.`);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const newCats = [...categories];
    const [moved] = newCats.splice(draggedIndex, 1);
    newCats.splice(targetIndex, 0, moved);
    setDraggedIndex(null);
    setCategories(newCats);

    const orderedIds = newCats.map((c) => c.id || c.slug);
    await categoryService.reorderCategories(orderedIds);
    setToastMsg(`Category order updated! Live on storefront & navigation.`);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadService.uploadImage(file, 'jerseyjunction_uploads');
      if (isEdit && editTarget) {
        setEditTarget({ ...editTarget, image: url });
      } else {
        setImage(url);
      }
      setToastMsg('Category photo uploaded successfully!');
    } catch (err: any) {
      setToastMsg(`Upload failed: ${err.message || 'Image upload error'}`);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await categoryService.addCategory({
      name: name.trim(),
      slug,
      tag: 'Collection',
      status: 'Active',
      image: image || 'https://res.cloudinary.com/mcsohx4p/image/upload/v1792689801/jerseyjunction_uploads/q6fb9r25vwafcwkfhdca.jpg'
    });

    setName('');
    setImage('');
    setIsAddOpen(false);
    setToastMsg(`Category "${name}" created successfully.`);
    await loadData();
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;

    await categoryService.updateCategory(editTarget.id, {
      name: editTarget.name.trim(),
      image: editTarget.image,
      tag: editTarget.tag || 'Collection',
      status: 'Active'
    });

    setEditTarget(null);
    setToastMsg(`Category updated successfully.`);
    await loadData();
  };

  const isAllSelected = categories.length > 0 && selectedIds.length === categories.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(categories.map((c) => c.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      await categoryService.deleteCategory(deleteTarget.id);
      setToastMsg(`Category "${deleteTarget.name}" deleted.`);
      setSelectedIds((prev) => prev.filter((id) => id !== deleteTarget.id));
      setDeleteTarget(null);
      await loadData();
    }
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedIds.length === 0) return;
    setIsDeleting(true);
    try {
      await Promise.all(selectedIds.map((id) => categoryService.deleteCategory(id)));
      setToastMsg(`Successfully deleted ${selectedIds.length} categories.`);
      setSelectedIds([]);
      setIsBulkDeleteModalOpen(false);
      await loadData();
    } catch (err: any) {
      setToastMsg(`Error deleting categories: ${err.message || 'Failed'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/90 p-6 rounded-3xl border border-zinc-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
            <FolderTree className="w-4 h-4" />
            <span>CATALOG TAXONOMY &amp; CATEGORIES</span>
          </div>
          <h1 className="text-2xl font-black font-serif uppercase tracking-tight text-white">
            CATEGORIES ({categories.length})
          </h1>
          <p className="text-xs text-zinc-400">
            Organize kit collections, sport types, and storefront categories.
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <label className="font-bold text-zinc-400 block mb-1 uppercase">Category Title *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cricket Kits"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-400 block mb-1 uppercase">Category Photo</label>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden relative shrink-0 flex items-center justify-center">
                  {image ? (
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-zinc-600" />
                  )}
                </div>

                <label className="px-3.5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer border border-zinc-700 transition-colors">
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  ) : (
                    <UploadCloud className="w-4 h-4 text-amber-400" />
                  )}
                  <span>{isUploading ? 'Uploading...' : image ? 'Change Photo' : 'Upload Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, false)}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>

                {image && (
                  <button
                    type="button"
                    onClick={() => setImage('')}
                    className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                    title="Remove photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <label className="font-bold text-zinc-400 block mb-1 uppercase">Category Title *</label>
              <input
                type="text"
                required
                value={editTarget.name}
                onChange={(e) => setEditTarget({ ...editTarget, name: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-400 block mb-1 uppercase">Category Photo</label>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden relative shrink-0 flex items-center justify-center">
                  {editTarget.image ? (
                    <img src={editTarget.image} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-zinc-600" />
                  )}
                </div>

                <label className="px-3.5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer border border-zinc-700 transition-colors">
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  ) : (
                    <UploadCloud className="w-4 h-4 text-amber-400" />
                  )}
                  <span>{isUploading ? 'Uploading...' : editTarget.image ? 'Change Photo' : 'Upload Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, true)}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>

                {editTarget.image && (
                  <button
                    type="button"
                    onClick={() => setEditTarget({ ...editTarget, image: '' })}
                    className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                    title="Remove photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
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

      {/* Bulk Action Bar when items are selected */}
      {selectedIds.length > 0 && (
        <div className="bg-amber-400/10 border border-amber-400/30 p-4 rounded-2xl flex items-center justify-between text-xs font-bold animate-fade-in shadow-lg">
          <div className="text-amber-400 flex items-center gap-2 font-mono">
            <CheckSquare className="w-4 h-4" />
            <span>SELECTED {selectedIds.length} CATEGORIES</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg cursor-pointer"
            >
              Deselect All
            </button>
            <button
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>
          </div>
        </div>
      )}

      {/* Reorder Hint Sub-bar */}
      <div className="text-[11px] font-mono text-amber-400/90 bg-amber-400/5 border border-amber-400/20 px-4 py-2.5 rounded-2xl flex items-center gap-2">
        <ArrowUpDown className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          Rearrange category sequence by clicking <strong>↑ Move Up</strong> / <strong>↓ Move Down</strong> or dragging rows. This order controls how categories appear on the user storefront, navigation bar, and category grid.
        </span>
      </div>

      {/* Categories Grid Table */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 uppercase font-mono text-[10px] tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-4 px-3 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    title="Select All Categories"
                    className="w-4 h-4 rounded accent-amber-400 cursor-pointer"
                  />
                </th>
                <th className="py-4 px-3 font-bold w-28 text-center">Store Order</th>
                <th className="py-4 px-3 font-bold w-16">Photo</th>
                <th className="py-4 px-4 font-bold">Category Title</th>
                <th className="py-4 px-4 font-bold">Products Count</th>
                <th className="py-4 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium">
              {categories.map((c, idx) => {
                const isSelected = selectedIds.includes(c.id);
                const isBeingDragged = draggedIndex === idx;

                return (
                  <tr
                    key={c.id}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(idx)}
                    className={`transition-colors cursor-default ${
                      isBeingDragged
                        ? 'opacity-40 bg-amber-400/20 border-2 border-dashed border-amber-400'
                        : isSelected
                        ? 'bg-amber-400/10'
                        : 'hover:bg-zinc-800/40'
                    }`}
                  >
                    <td className="py-3.5 px-3 w-10">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(c.id)}
                        className="w-4 h-4 rounded accent-amber-400 cursor-pointer"
                      />
                    </td>

                    {/* Order Rank & Move Up/Down Controls */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <div
                          className="p-1 text-zinc-500 hover:text-amber-400 cursor-grab active:cursor-grabbing transition-colors"
                          title="Drag to rearrange"
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>

                        <span className="w-7 h-6 rounded-md bg-zinc-950 text-amber-400 font-mono font-bold text-[11px] flex items-center justify-center border border-zinc-800">
                          #{idx + 1}
                        </span>

                        <div className="flex flex-col -space-y-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMove(idx, 'up')}
                            className="p-0.5 text-zinc-400 hover:text-amber-400 disabled:opacity-20 disabled:hover:text-zinc-400 transition-colors cursor-pointer disabled:cursor-not-allowed"
                            title="Move Category Up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === categories.length - 1}
                            onClick={() => handleMove(idx, 'down')}
                            className="p-0.5 text-zinc-400 hover:text-amber-400 disabled:opacity-20 disabled:hover:text-zinc-400 transition-colors cursor-pointer disabled:cursor-not-allowed"
                            title="Move Category Down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Photo thumbnail */}
                    <td className="py-3.5 px-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center">
                        {c.image ? (
                          <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-zinc-600" />
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-white text-sm">
                      {c.name}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      {c.productsCount} items
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditTarget(c)}
                          className="p-2 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded-lg transition-all cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteTarget(c)}
                          className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Single Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Category"
        message={`Are you sure you want to delete category "${deleteTarget?.name}"? Products in this category will not be deleted.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Bulk Delete Confirm Modal */}
      <ConfirmModal
        isOpen={isBulkDeleteModalOpen}
        title="Delete Multiple Categories"
        message={`Are you sure you want to delete ${selectedIds.length} categories? Products within them will remain intact.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete Selected'}
        onConfirm={handleBulkDeleteConfirm}
        onCancel={() => setIsBulkDeleteModalOpen(false)}
      />

      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}

    </div>
  );
}
