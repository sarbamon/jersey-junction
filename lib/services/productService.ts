import { apiClient } from '../apiClient';
import { AdminProduct } from '../types/admin';
import { JerseyProduct } from '../../types';
import { SEED_ADMIN_PRODUCTS } from '../mock/products';

// Helper to normalize backend Product Mongoose doc into AdminProduct / JerseyProduct format
export function mapBackendToAdminProduct(item: any): AdminProduct {
  const id = item.id || item._id?.toString() || item.slug;
  return {
    id,
    name: item.name || '',
    slug: item.slug || '',
    category: item.category || (item.sport ? item.sport.toUpperCase() : 'General'),
    subcategory: item.subcategory || item.league || '',
    description: item.description || '',
    shortDescription: item.shortDescription || item.description || '',
    price: item.price || 0,
    originalPrice: item.originalPrice || item.price,
    discount: item.discount || 0,
    stock: item.stock !== undefined ? item.stock : 50,
    sizeStock: item.sizeStock || {},
    sku: item.sku || `JJ-PROD-${id.slice(-6)}`,
    brand: item.brand || 'Jersey Junction',
    sizes: item.sizes || item.availableSizes || ['S', 'M', 'L', 'XL', '2XL'],
    colors: Array.isArray(item.colors) ? item.colors : (item.colors ? [item.colors.primary, item.colors.secondary].filter(Boolean) : []),
    image: item.image || (item.images && item.images[0]) || '',
    images: Array.isArray(item.images) && item.images.length > 0 ? item.images : (item.image ? [item.image] : []),
    isFeatured: Boolean(item.isFeatured),
    isBestseller: Boolean(item.isBestseller),
    isCustomizable: Boolean(item.isCustomizable),
    status: item.status || 'Active',
    createdDate: item.createdDate || item.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
    totalSold: item.totalSold || 0,
    revenueGenerated: item.revenueGenerated || 0,
  };
}

export function mapBackendToJerseyProduct(item: any): JerseyProduct {
  const id = item.slug || item.id || item._id?.toString();
  return {
    id,
    name: item.name || '',
    slug: item.slug || '',
    team: item.team || '',
    league: item.league || item.subcategory || '',
    sport: (item.sport || 'soccer') as any,
    category: item.category || '',
    subcategory: item.subcategory || '',
    season: item.season || '2024/25',
    price: item.price || 0,
    originalPrice: item.originalPrice || item.price,
    rating: item.rating || 5.0,
    reviewCount: item.reviewCount || 0,
    isNew: Boolean(item.isNewProduct || item.isNew),
    isBestseller: Boolean(item.isBestseller),
    isHot: Boolean(item.isHot),
    isCustomizable: Boolean(item.isCustomizable),
    colors: typeof item.colors === 'object' && item.colors !== null && !Array.isArray(item.colors) 
      ? item.colors 
      : { primary: '#000000', secondary: '#ffffff', accent: '#f4c84a', text: '#ffffff' },
    pattern: item.pattern || 'solid',
    sponsorText: item.sponsorText || '',
    crestIcon: item.crestIcon || '',
    availableSizes: item.availableSizes || item.sizes || ['S', 'M', 'L', 'XL', '2XL'],
    sizeStock: item.sizeStock || {},
    defaultName: item.defaultName || '',
    defaultNumber: item.defaultNumber || '',
    description: item.description || '',
    details: item.details || [],
    availablePatches: item.availablePatches || [],
    tags: item.tags || [],
    image: item.image || (item.images && item.images[0]) || '',
    images: Array.isArray(item.images) && item.images.length > 0 ? item.images : (item.image ? [item.image] : []),
  };
}

let memoryProductsCache: JerseyProduct[] | null = null;
const CACHE_KEY = 'jj_store_products_cache';

let memoryAdminProductsCache: AdminProduct[] | null = null;
const ADMIN_CACHE_KEY = 'jj_admin_products_cache';

function getStoredCache(): JerseyProduct[] {
  if (memoryProductsCache && memoryProductsCache.length > 0) return memoryProductsCache;
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryProductsCache = parsed;
          return parsed;
        }
      }
    } catch {}
  }
  return [];
}

function saveStoredCache(products: JerseyProduct[]) {
  if (!products || products.length === 0) return;
  memoryProductsCache = products;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(products));
    } catch {}
  }
}

function getStoredAdminCache(): AdminProduct[] {
  if (memoryAdminProductsCache && memoryAdminProductsCache.length > 0) return memoryAdminProductsCache;
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(ADMIN_CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryAdminProductsCache = parsed;
          return parsed;
        }
      }
    } catch {}
  }
  const defaults = (SEED_ADMIN_PRODUCTS || []).map(mapBackendToAdminProduct);
  memoryAdminProductsCache = defaults;
  return defaults;
}

function saveStoredAdminCache(products: AdminProduct[]) {
  if (!products || products.length === 0) return;
  memoryAdminProductsCache = products;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(ADMIN_CACHE_KEY, JSON.stringify(products));
    } catch {}
  }
}

export const productService = {
  // Synchronous cached products getter (instant 0ms render)
  getCachedProductsSync: (): JerseyProduct[] => {
    return getStoredCache();
  },

  // Synchronous cached admin products getter (instant 0ms render in admin table)
  getAdminProductsSync: (): AdminProduct[] => {
    const adminCached = getStoredAdminCache();
    if (adminCached.length > 0) return adminCached;
    const storeCached = getStoredCache();
    if (storeCached.length > 0) return storeCached.map(mapBackendToAdminProduct);
    return [];
  },

  // Synchronous single product getter from cache
  getCachedProductBySlugSync: (slug: string): JerseyProduct | null => {
    const cached = getStoredCache();
    const lower = (slug || '').toLowerCase();
    return cached.find(p => (p.slug || '').toLowerCase() === lower || (p.id || '').toLowerCase() === lower) || null;
  },

  // Storefront active products with SWR cache
  getActiveProducts: async (filters?: { sport?: string; search?: string; category?: string }): Promise<JerseyProduct[]> => {
    const cached = getStoredCache();

    const params = new URLSearchParams();
    params.append('limit', '1000');
    if (filters?.sport) params.append('sport', filters.sport);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);

    const hasFilters = Boolean(filters?.sport || filters?.category || filters?.search);
    const query = params.toString() ? `?${params.toString()}` : '';

    try {
      const res = await apiClient.get(`/products${query}`);
      if (res.success && Array.isArray(res.data)) {
        const mapped = res.data.map(mapBackendToJerseyProduct);
        if (!hasFilters) {
          saveStoredCache(mapped);
        }
        return mapped;
      }
    } catch (err) {
      console.warn('Failed to fetch products from API, using cache:', err);
    }

    return cached;
  },

  // Admin list all products
  getAdminProducts: async (): Promise<AdminProduct[]> => {
    try {
      const res = await apiClient.get('/products/admin/all');
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const mapped = res.data.map(mapBackendToAdminProduct);
        saveStoredAdminCache(mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('Failed to load /products/admin/all:', e);
    }

    // Fallback to public products if admin call fails or is empty
    try {
      const fallbackRes = await apiClient.get('/products?limit=200');
      if (fallbackRes.success && Array.isArray(fallbackRes.data) && fallbackRes.data.length > 0) {
        const mapped = fallbackRes.data.map(mapBackendToAdminProduct);
        saveStoredAdminCache(mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('Failed to load /products fallback:', e);
    }

    return productService.getAdminProductsSync();
  },

  // Synchronous getter wrapper for admin components transitioning to async
  getProducts: (): AdminProduct[] => {
    return [];
  },

  getProductById: async (id: string): Promise<AdminProduct | null> => {
    const res = await apiClient.get(`/products/${id}`);
    if (res.success && res.data) {
      return mapBackendToAdminProduct(res.data);
    }
    return null;
  },

  getProductBySlug: async (slug: string): Promise<JerseyProduct | null> => {
    // Check cache first for instant 0ms load
    const cached = productService.getCachedProductBySlugSync(slug);
    if (cached) {
      // Revalidate in background
      apiClient.get(`/products/${slug}`).then((res) => {
        if (res.success && res.data) {
          const fresh = mapBackendToJerseyProduct(res.data);
          const currentCache = getStoredCache();
          const idx = currentCache.findIndex(p => p.slug === slug || p.id === slug);
          if (idx !== -1) {
            currentCache[idx] = fresh;
            saveStoredCache(currentCache);
          }
        }
      }).catch(() => {});
      return cached;
    }

    const res = await apiClient.get(`/products/${slug}`);
    if (res.success && res.data) {
      const fresh = mapBackendToJerseyProduct(res.data);
      const currentCache = getStoredCache();
      saveStoredCache([...currentCache.filter(p => p.id !== fresh.id && p.slug !== fresh.slug), fresh]);
      return fresh;
    }
    return null;
  },

  addProduct: async (productData: Partial<AdminProduct>): Promise<AdminProduct> => {
    const payload = {
      name: productData.name,
      slug: productData.slug || productData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: productData.category,
      subcategory: productData.subcategory,
      description: productData.description,
      shortDescription: productData.shortDescription,
      price: productData.price,
      originalPrice: productData.originalPrice,
      discount: productData.discount,
      stock: productData.stock,
      sizeStock: productData.sizeStock,
      sku: productData.sku,
      brand: productData.brand,
      sizes: productData.sizes,
      availableSizes: productData.sizes,
      colors: productData.colors,
      image: productData.image,
      images: productData.images,
      isFeatured: productData.isFeatured,
      isBestseller: productData.isBestseller,
      isCustomizable: Boolean(productData.isCustomizable),
      status: productData.status || 'Active',
      team: productData.subcategory || 'Jersey Junction',
      sport: productData.category?.toLowerCase() || 'soccer',
    };

    const res = await apiClient.post('/products', payload);
    if (!res.success || !res.data) {
      throw new Error(res.error || 'Failed to create product on backend server');
    }
    return mapBackendToAdminProduct(res.data);
  },

  updateProduct: async (id: string, updates: Partial<AdminProduct>): Promise<AdminProduct> => {
    const payload: any = { ...updates };
    if (payload.category) {
      payload.sport = payload.category.toLowerCase();
    }
    if (payload.sizes && !payload.availableSizes) {
      payload.availableSizes = payload.sizes;
    }

    const res = await apiClient.patch(`/products/${id}`, payload);
    if (!res.success || !res.data) {
      throw new Error(res.error || 'Failed to update product on backend server');
    }
    return mapBackendToAdminProduct(res.data);
  },

  deleteProduct: async (id: string): Promise<void> => {
    const res = await apiClient.delete(`/products/${id}`);
    if (!res.success) {
      throw new Error(res.error || 'Failed to delete product from backend server');
    }
  }
};
