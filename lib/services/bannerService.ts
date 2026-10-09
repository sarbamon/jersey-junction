import { AdminBanner } from '../types/admin';
import { INITIAL_BANNERS } from '../mock/banners';

const BANNERS_KEY = 'jj_admin_banners';

export const bannerService = {
  getBanners: (): AdminBanner[] => {
    if (typeof window === 'undefined') return INITIAL_BANNERS;
    const stored = localStorage.getItem(BANNERS_KEY);
    if (!stored) {
      localStorage.setItem(BANNERS_KEY, JSON.stringify(INITIAL_BANNERS));
      return INITIAL_BANNERS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_BANNERS;
    }
  },

  addBanner: (data: Omit<AdminBanner, 'id'>): AdminBanner => {
    const banners = bannerService.getBanners();
    const newBanner: AdminBanner = {
      ...data,
      id: `ban-${Date.now()}`
    };
    const updated = [...banners, newBanner];
    if (typeof window !== 'undefined') {
      localStorage.setItem(BANNERS_KEY, JSON.stringify(updated));
    }
    return newBanner;
  },

  updateBanner: (id: string, updates: Partial<AdminBanner>): AdminBanner => {
    const banners = bannerService.getBanners();
    const index = banners.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Banner not found');

    const updated = { ...banners[index], ...updates };
    banners[index] = updated;

    if (typeof window !== 'undefined') {
      localStorage.setItem(BANNERS_KEY, JSON.stringify(banners));
    }
    return updated;
  },

  deleteBanner: (id: string): void => {
    const banners = bannerService.getBanners();
    const filtered = banners.filter(b => b.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(BANNERS_KEY, JSON.stringify(filtered));
    }
  }
};
