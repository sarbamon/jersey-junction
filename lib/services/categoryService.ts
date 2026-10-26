import { apiClient } from '../apiClient';
import { AdminCategory } from '../types/admin';
import { INITIAL_CATEGORIES } from '../mock/categories';

const CATEGORIES_KEY = 'jj_admin_categories';

function getLocalCategories(): AdminCategory[] {
  if (typeof window === 'undefined') return INITIAL_CATEGORIES;
  const stored = localStorage.getItem(CATEGORIES_KEY);
  if (!stored) {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(INITIAL_CATEGORIES));
    return INITIAL_CATEGORIES;
  }
  try {
    const parsed: AdminCategory[] = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : INITIAL_CATEGORIES;
  } catch {
    return INITIAL_CATEGORIES;
  }
}

function saveLocalCategories(cats: AdminCategory[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats));
  }
}

let inFlightActiveCategoriesPromise: Promise<AdminCategory[]> | null = null;
let memoryActiveCategories: AdminCategory[] | null = null;

export const categoryService = {
  // Synchronous local fallback getter
  getCategoriesSync: (): AdminCategory[] => {
    if (memoryActiveCategories && memoryActiveCategories.length > 0) {
      return memoryActiveCategories;
    }
    return getLocalCategories();
  },

  // Async get all categories for admin
  getCategories: async (): Promise<AdminCategory[]> => {
    try {
      const res = await apiClient.get('/categories/admin/all');
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const mapped: AdminCategory[] = res.data.map((c: any, idx: number) => ({
          id: c._id || c.id || c.slug,
          name: c.name,
          slug: c.slug,
          tag: c.tag || 'Sport Collection',
          productsCount: c.productsCount || 0,
          status: c.status || 'Active',
          image: c.image || '/placeholder-category.svg',
          order: typeof c.order === 'number' ? c.order : idx,
        }));
        saveLocalCategories(mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('Failed to load categories from backend, using local storage:', err);
    }
    return getLocalCategories();
  },

  // Async get ACTIVE categories for public store (with deduplication & memory cache)
  getActiveCategories: async (): Promise<AdminCategory[]> => {
    if (inFlightActiveCategoriesPromise) {
      return inFlightActiveCategoriesPromise;
    }

    inFlightActiveCategoriesPromise = (async () => {
      try {
        const res = await apiClient.get('/categories');
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: AdminCategory[] = res.data.map((c: any, idx: number) => ({
            id: c.slug || c._id || c.id,
            name: c.name,
            slug: c.slug,
            tag: c.tag || 'Sport Collection',
            productsCount: c.productsCount || 0,
            status: c.status || 'Active',
            image: c.image || '/placeholder-category.svg',
            order: typeof c.order === 'number' ? c.order : idx,
          }));
          memoryActiveCategories = mapped;
          saveLocalCategories(mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Failed to load active categories from backend, using local storage:', err);
      } finally {
        setTimeout(() => {
          inFlightActiveCategoriesPromise = null;
        }, 3000);
      }
      return getLocalCategories().filter(c => c.status === 'Active');
    })();

    return inFlightActiveCategoriesPromise;
  },

  addCategory: async (data: Omit<AdminCategory, 'id' | 'productsCount'>): Promise<AdminCategory> => {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const local = getLocalCategories();
    const newLocal: AdminCategory = {
      ...data,
      id: `cat-${Date.now()}`,
      slug,
      productsCount: 0
    };
    saveLocalCategories([...local, newLocal]);

    try {
      const res = await apiClient.post('/categories', { ...data, slug });
      if (res.success && res.data) {
        const created: AdminCategory = {
          id: res.data._id || res.data.id || res.data.slug,
          name: res.data.name,
          slug: res.data.slug,
          tag: res.data.tag || 'Sport Collection',
          productsCount: 0,
          status: res.data.status || 'Active',
          image: res.data.image,
        };
        return created;
      }
    } catch (err) {
      console.error('Failed to post category to backend:', err);
    }
    return newLocal;
  },

  updateCategory: async (id: string, updates: Partial<AdminCategory>): Promise<AdminCategory> => {
    const local = getLocalCategories();
    const index = local.findIndex(c => c.id === id || c.slug === id);
    if (index !== -1) {
      local[index] = { ...local[index], ...updates };
      saveLocalCategories(local);
    }

    try {
      const res = await apiClient.put(`/categories/${id}`, updates);
      if (res.success && res.data) {
        return {
          id: res.data._id || res.data.id || res.data.slug,
          name: res.data.name,
          slug: res.data.slug,
          tag: res.data.tag,
          productsCount: res.data.productsCount || 0,
          status: res.data.status,
          image: res.data.image,
        };
      }
    } catch (err) {
      console.error('Failed to update category on backend:', err);
    }
    return local[index] || (updates as AdminCategory);
  },

  deleteCategory: async (id: string): Promise<void> => {
    const local = getLocalCategories();
    const filtered = local.filter(c => c.id !== id && c.slug !== id);
    saveLocalCategories(filtered);

    try {
      await apiClient.delete(`/categories/${id}`);
    } catch (err) {
      console.error('Failed to delete category on backend:', err);
    }
  },

  deleteCategoriesBulk: async (ids: string[]): Promise<void> => {
    if (!ids || ids.length === 0) return;
    const local = getLocalCategories();
    const filtered = local.filter(c => !ids.includes(c.id) && !ids.includes(c.slug));
    saveLocalCategories(filtered);

    try {
      await apiClient.post('/categories/bulk-delete', { ids });
    } catch (err) {
      console.error('Failed to bulk delete categories on backend:', err);
    }
  },

  // Reorder categories
  reorderCategories: async (orderedIds: string[]): Promise<AdminCategory[]> => {
    const local = getLocalCategories();
    const orderedLocal: AdminCategory[] = [];
    orderedIds.forEach((id, index) => {
      const found = local.find(c => c.id === id || c.slug === id);
      if (found) {
        orderedLocal.push({ ...found, order: index });
      }
    });
    local.forEach(c => {
      if (!orderedLocal.some(o => o.id === c.id || o.slug === c.slug)) {
        orderedLocal.push({ ...c, order: orderedLocal.length });
      }
    });

    saveLocalCategories(orderedLocal);

    try {
      const res = await apiClient.put('/categories/reorder', { orderedIds });
      if (res.success && Array.isArray(res.data)) {
        const mapped: AdminCategory[] = res.data.map((c: any, idx: number) => ({
          id: c._id || c.id || c.slug,
          name: c.name,
          slug: c.slug,
          tag: c.tag || 'Sport Collection',
          productsCount: c.productsCount || 0,
          status: c.status || 'Active',
          image: c.image || '/placeholder-category.svg',
          order: typeof c.order === 'number' ? c.order : idx,
        }));
        saveLocalCategories(mapped);
        return mapped;
      }
    } catch (err) {
      console.error('Failed to update category order on backend:', err);
    }
    return orderedLocal;
  }
};
