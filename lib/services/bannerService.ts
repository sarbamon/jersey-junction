import { apiClient } from '../apiClient';
import { AdminBanner } from '../types/admin';
import { INITIAL_BANNERS } from '../mock/banners';

const BANNERS_KEY = 'jj_admin_banners';

function getLocalBanners(): AdminBanner[] {
  if (typeof window === 'undefined') return INITIAL_BANNERS;
  const stored = localStorage.getItem(BANNERS_KEY);
  if (!stored) {
    localStorage.setItem(BANNERS_KEY, JSON.stringify(INITIAL_BANNERS));
    return INITIAL_BANNERS;
  }
  try {
    const parsed: AdminBanner[] = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_BANNERS;
  } catch {
    return INITIAL_BANNERS;
  }
}

function saveLocalBanners(banners: AdminBanner[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(BANNERS_KEY, JSON.stringify(banners));
    window.dispatchEvent(new Event('jj_banners_updated'));
  }
}

let inFlightActiveBannersPromise: Promise<AdminBanner[]> | null = null;
let memoryActiveBanners: AdminBanner[] | null = null;

export const bannerService = {
  // Synchronous getter for instant SSR/client hydration without layout shifts
  getBannersSync: (): AdminBanner[] => {
    if (memoryActiveBanners && memoryActiveBanners.length > 0) {
      return memoryActiveBanners;
    }
    return getLocalBanners();
  },

  // Synchronous getter for active banners
  getActiveBannersSync: (): AdminBanner[] => {
    const all = bannerService.getBannersSync();
    const active = all.filter((b) => b.status === 'Active');
    return active.length > 0 ? active : INITIAL_BANNERS;
  },

  // Backward-compatible alias
  getBanners: (): AdminBanner[] => {
    return bannerService.getBannersSync();
  },

  // Fetch active banners from backend with local cache fallback
  getActiveBanners: async (): Promise<AdminBanner[]> => {
    if (inFlightActiveBannersPromise) return inFlightActiveBannersPromise;

    inFlightActiveBannersPromise = (async () => {
      try {
        const res = await apiClient.get('/banners');
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: AdminBanner[] = res.data.map((b: any, idx: number) => ({
            id: b._id || b.id || `ban-${idx}`,
            title: b.title,
            subtitle: b.subtitle || '',
            imageUrl: b.imageUrl,
            buttonText: b.buttonText || 'SHOP NOW',
            buttonLink: b.buttonLink || '/shop',
            status: b.status || 'Active',
            order: typeof b.order === 'number' ? b.order : idx,
          }));
          memoryActiveBanners = mapped;
          saveLocalBanners(mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Failed to load banners from backend, using local storage:', err);
      } finally {
        inFlightActiveBannersPromise = null;
      }
      return bannerService.getActiveBannersSync();
    })();

    return inFlightActiveBannersPromise;
  },

  // Fetch all banners for admin
  getAllAdminBanners: async (): Promise<AdminBanner[]> => {
    try {
      const res = await apiClient.get('/banners/admin/all');
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const mapped: AdminBanner[] = res.data.map((b: any, idx: number) => ({
          id: b._id || b.id || `ban-${idx}`,
          title: b.title,
          subtitle: b.subtitle || '',
          imageUrl: b.imageUrl,
          buttonText: b.buttonText || 'SHOP NOW',
          buttonLink: b.buttonLink || '/shop',
          status: b.status || 'Active',
          order: typeof b.order === 'number' ? b.order : idx,
        }));
        saveLocalBanners(mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('Failed to fetch admin banners from API:', err);
    }
    return getLocalBanners();
  },

  // Add new banner
  addBanner: async (data: Omit<AdminBanner, 'id'>): Promise<AdminBanner> => {
    // Save to backend
    try {
      const res = await apiClient.post('/banners', data);
      if (res.success && res.data) {
        const b = res.data;
        const newBanner: AdminBanner = {
          id: b._id || b.id,
          title: b.title,
          subtitle: b.subtitle || '',
          imageUrl: b.imageUrl,
          buttonText: b.buttonText || 'SHOP NOW',
          buttonLink: b.buttonLink || '/shop',
          status: b.status || 'Active',
          order: b.order || 0,
        };
        const current = getLocalBanners();
        saveLocalBanners([...current, newBanner]);
        return newBanner;
      }
    } catch (err) {
      console.warn('Backend banner creation failed, saving locally:', err);
    }

    // Local fallback
    const current = getLocalBanners();
    const newBanner: AdminBanner = {
      ...data,
      id: `ban-${Date.now()}`,
    };
    saveLocalBanners([...current, newBanner]);
    return newBanner;
  },

  // Update banner
  updateBanner: async (id: string, updates: Partial<AdminBanner>): Promise<AdminBanner> => {
    try {
      const res = await apiClient.put(`/banners/${id}`, updates);
      if (res.success && res.data) {
        const b = res.data;
        const updated: AdminBanner = {
          id: b._id || b.id || id,
          title: b.title,
          subtitle: b.subtitle || '',
          imageUrl: b.imageUrl,
          buttonText: b.buttonText || 'SHOP NOW',
          buttonLink: b.buttonLink || '/shop',
          status: b.status || 'Active',
          order: b.order ?? 0,
        };
        const current = getLocalBanners();
        const next = current.map((item) => (item.id === id ? updated : item));
        saveLocalBanners(next);
        return updated;
      }
    } catch (err) {
      console.warn('Backend banner update failed, updating locally:', err);
    }

    // Local fallback
    const current = getLocalBanners();
    const next = current.map((item) => (item.id === id ? { ...item, ...updates } : item));
    saveLocalBanners(next);
    const updated = next.find((item) => item.id === id);
    if (!updated) throw new Error('Banner not found');
    return updated;
  },

  // Delete banner
  deleteBanner: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/banners/${id}`);
    } catch (err) {
      console.warn('Backend banner delete failed, removing locally:', err);
    }

    const current = getLocalBanners();
    const next = current.filter((item) => item.id !== id);
    saveLocalBanners(next);
  },
};
