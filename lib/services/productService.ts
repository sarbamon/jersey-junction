import { apiClient } from '../apiClient';
import { AdminProduct } from '../types/admin';
import { JerseyProduct } from '../../types';

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
    sku: item.sku || `JJ-PROD-${id.slice(-6)}`,
    brand: item.brand || 'Jersey Junction',
    sizes: item.sizes || item.availableSizes || ['S', 'M', 'L', 'XL', '2XL'],
    colors: Array.isArray(item.colors) ? item.colors : (item.colors ? [item.colors.primary, item.colors.secondary].filter(Boolean) : []),
    image: item.image || '/jersey/WhatsApp Image 2026-09-08 at 11.44.00 PM.jpeg',
    images: item.images || [item.image].filter(Boolean),
    isFeatured: Boolean(item.isFeatured),
    isBestseller: Boolean(item.isBestseller),
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
    colors: typeof item.colors === 'object' && item.colors !== null && !Array.isArray(item.colors) 
      ? item.colors 
      : { primary: '#000000', secondary: '#ffffff', accent: '#f4c84a', text: '#ffffff' },
    pattern: item.pattern || 'solid',
    sponsorText: item.sponsorText || '',
    crestIcon: item.crestIcon || '',
    availableSizes: item.availableSizes || item.sizes || ['S', 'M', 'L', 'XL', '2XL'],
    defaultName: item.defaultName || '',
    defaultNumber: item.defaultNumber || '',
    description: item.description || '',
    details: item.details || [],
    availablePatches: item.availablePatches || [],
    tags: item.tags || [],
    image: item.image || '/jersey/WhatsApp Image 2026-09-08 at 11.44.00 PM.jpeg',
  };
}

export const productService = {
  // Storefront active products
  getActiveProducts: async (filters?: { sport?: string; search?: string; category?: string }): Promise<JerseyProduct[]> => {
    const params = new URLSearchParams();
    if (filters?.sport) params.append('sport', filters.sport);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await apiClient.get(`/products${query}`);

    if (res.success && Array.isArray(res.data)) {
      return res.data.map(mapBackendToJerseyProduct);
    }
    return [];
  },

  // Admin list all products
  getAdminProducts: async (): Promise<AdminProduct[]> => {
    const res = await apiClient.get('/products/admin/all');
    if (res.success && Array.isArray(res.data)) {
      return res.data.map(mapBackendToAdminProduct);
    }
    // Fallback to public products if admin call fails or user lacks token
    const fallbackRes = await apiClient.get('/products');
    if (fallbackRes.success && Array.isArray(fallbackRes.data)) {
      return fallbackRes.data.map(mapBackendToAdminProduct);
    }
    return [];
  },

  // Synchronous getter wrapper for admin components transitioning to async
  getProducts: (): AdminProduct[] => {
    // Note: Callers should use getAdminProducts() async instead
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
    const res = await apiClient.get(`/products/${slug}`);
    if (res.success && res.data) {
      return mapBackendToJerseyProduct(res.data);
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
      sku: productData.sku,
      brand: productData.brand,
      sizes: productData.sizes,
      availableSizes: productData.sizes,
      colors: productData.colors,
      image: productData.image,
      images: productData.images,
      isFeatured: productData.isFeatured,
      isBestseller: productData.isBestseller,
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
