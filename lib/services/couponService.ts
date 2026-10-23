import { apiClient } from '../apiClient';
import { AdminCoupon } from '../types/admin';
import { INITIAL_COUPONS } from '../mock/coupons';

const COUPONS_KEY = 'jj_admin_coupons';

const filterOutLegacyCoupons = (list: AdminCoupon[]): AdminCoupon[] => {
  if (!Array.isArray(list)) return [];
  return list.filter((c) => {
    const code = (c.code || '').trim().toUpperCase();
    return code !== 'SPOT10' && code !== 'JUNCTION10';
  });
};

export const couponService = {
  getCoupons: (): AdminCoupon[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(COUPONS_KEY);
    if (!stored) {
      return [];
    }
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        const cleaned = filterOutLegacyCoupons(parsed);
        if (cleaned.length !== parsed.length) {
          localStorage.setItem(COUPONS_KEY, JSON.stringify(cleaned));
        }
        return cleaned;
      }
      return [];
    } catch {
      return [];
    }
  },

  fetchCoupons: async (): Promise<AdminCoupon[]> => {
    try {
      const res = await apiClient.get<AdminCoupon[]>('/coupons');
      if (res.success && Array.isArray(res.data)) {
        const cleaned = filterOutLegacyCoupons(res.data);
        if (typeof window !== 'undefined') {
          localStorage.setItem(COUPONS_KEY, JSON.stringify(cleaned));
        }
        return cleaned;
      }
    } catch (err) {
      console.warn('Failed to fetch coupons from server, using local store:', err);
    }
    return couponService.getCoupons();
  },

  validateCoupon: async (
    code: string,
    subtotal: number = 0
  ): Promise<{
    valid: boolean;
    coupon?: Partial<AdminCoupon>;
    discountPercentage: number;
    discountAmount: number;
    message: string;
  }> => {
    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode) {
      return {
        valid: false,
        discountPercentage: 0,
        discountAmount: 0,
        message: 'Please enter a coupon code',
      };
    }

    // Immediately reject legacy fake coupons
    if (cleanCode === 'SPOT10' || cleanCode === 'JUNCTION10') {
      return {
        valid: false,
        discountPercentage: 0,
        discountAmount: 0,
        message: 'Invalid or inactive coupon code',
      };
    }

    // 1. Validate against backend database
    try {
      const res = await apiClient.post<any>('/coupons/validate', {
        code: cleanCode,
        subtotal,
      });

      if (res && typeof (res as any).valid === 'boolean') {
        const payload = (res.data || res) as any;
        return {
          valid: Boolean(payload.valid),
          coupon: payload.coupon,
          discountPercentage: Number(payload.discountPercentage) || 0,
          discountAmount: Number(payload.discountAmount) || 0,
          message: payload.message || (payload.valid ? 'Coupon applied!' : 'Invalid or inactive coupon code'),
        };
      }
    } catch (err) {
      console.warn('Server coupon validation error:', err);
    }

    // 2. Fallback to active admin coupons in local storage (guaranteed free of SPOT10/JUNCTION10)
    const localCoupons = couponService.getCoupons();
    const matched = localCoupons.find(
      (c) => (c.code || '').toUpperCase() === cleanCode
    );

    if (!matched || matched.status !== 'Active') {
      return {
        valid: false,
        discountPercentage: 0,
        discountAmount: 0,
        message: 'Invalid or inactive coupon code',
      };
    }

    if (matched.expiryDate) {
      const today = new Date().toISOString().slice(0, 10);
      if (matched.expiryDate < today) {
        return {
          valid: false,
          discountPercentage: 0,
          discountAmount: 0,
          message: 'This coupon has expired',
        };
      }
    }

    if (matched.minOrder > 0 && subtotal < matched.minOrder) {
      return {
        valid: false,
        discountPercentage: 0,
        discountAmount: 0,
        message: `Minimum order of ₹${matched.minOrder} required for this coupon`,
      };
    }

    let discountAmount = 0;
    let discountPercentage = 0;

    if (matched.discountType === 'percentage') {
      discountPercentage = matched.discountValue;
      discountAmount = (subtotal * matched.discountValue) / 100;
      if (matched.maxDiscount && matched.maxDiscount > 0 && discountAmount > matched.maxDiscount) {
        discountAmount = matched.maxDiscount;
      }
    } else {
      discountAmount = Math.min(subtotal, matched.discountValue);
      discountPercentage = subtotal > 0 ? Math.round((discountAmount / subtotal) * 100) : 0;
    }

    return {
      valid: true,
      coupon: matched,
      discountPercentage,
      discountAmount,
      message: `Coupon "${matched.code}" applied! You saved ₹${discountAmount.toFixed(0)}`,
    };
  },

  addCoupon: async (data: Omit<AdminCoupon, 'id' | 'usedCount'>): Promise<AdminCoupon> => {
    const cleanCode = data.code.trim().toUpperCase();
    const coupons = couponService.getCoupons();
    const newCoupon: AdminCoupon = {
      ...data,
      code: cleanCode,
      id: `coup-${Date.now()}`,
      usedCount: 0,
    };
    const updated = [newCoupon, ...coupons];
    if (typeof window !== 'undefined') {
      localStorage.setItem(COUPONS_KEY, JSON.stringify(updated));
    }

    try {
      const res = await apiClient.post<AdminCoupon>('/coupons', {
        ...data,
        code: cleanCode,
      });
      if (res.success && res.data) {
        const serverItem = res.data;
        const synced = updated.map((c) => (c.id === newCoupon.id ? serverItem : c));
        if (typeof window !== 'undefined') {
          localStorage.setItem(COUPONS_KEY, JSON.stringify(synced));
        }
        return serverItem;
      }
    } catch (err) {
      console.warn('Failed to save coupon to server, saved locally:', err);
    }

    return newCoupon;
  },

  updateCoupon: async (id: string, updates: Partial<AdminCoupon>): Promise<AdminCoupon> => {
    const coupons = couponService.getCoupons();
    const index = coupons.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Coupon not found');

    const updated = { ...coupons[index], ...updates };
    coupons[index] = updated;

    if (typeof window !== 'undefined') {
      localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons));
    }

    try {
      await apiClient.put(`/coupons/${id}`, updates);
    } catch (err) {
      console.warn('Failed to update coupon on server:', err);
    }

    return updated;
  },

  deleteCoupon: async (id: string): Promise<void> => {
    const coupons = couponService.getCoupons();
    const filtered = coupons.filter((c) => c.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(COUPONS_KEY, JSON.stringify(filtered));
    }

    try {
      await apiClient.delete(`/coupons/${id}`);
    } catch (err) {
      console.warn('Failed to delete coupon on server:', err);
    }
  },
};
