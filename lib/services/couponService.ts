import { AdminCoupon } from '../types/admin';
import { INITIAL_COUPONS } from '../mock/coupons';

const COUPONS_KEY = 'jj_admin_coupons';

export const couponService = {
  getCoupons: (): AdminCoupon[] => {
    if (typeof window === 'undefined') return INITIAL_COUPONS;
    const stored = localStorage.getItem(COUPONS_KEY);
    if (!stored) {
      localStorage.setItem(COUPONS_KEY, JSON.stringify(INITIAL_COUPONS));
      return INITIAL_COUPONS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_COUPONS;
    }
  },

  addCoupon: (data: Omit<AdminCoupon, 'id' | 'usedCount'>): AdminCoupon => {
    const coupons = couponService.getCoupons();
    const newCoupon: AdminCoupon = {
      ...data,
      id: `coup-${Date.now()}`,
      usedCount: 0
    };
    const updated = [newCoupon, ...coupons];
    if (typeof window !== 'undefined') {
      localStorage.setItem(COUPONS_KEY, JSON.stringify(updated));
    }
    return newCoupon;
  },

  updateCoupon: (id: string, updates: Partial<AdminCoupon>): AdminCoupon => {
    const coupons = couponService.getCoupons();
    const index = coupons.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Coupon not found');

    const updated = { ...coupons[index], ...updates };
    coupons[index] = updated;

    if (typeof window !== 'undefined') {
      localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons));
    }
    return updated;
  },

  deleteCoupon: (id: string): void => {
    const coupons = couponService.getCoupons();
    const filtered = coupons.filter(c => c.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(COUPONS_KEY, JSON.stringify(filtered));
    }
  }
};
