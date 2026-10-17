import { StoreSettings } from '../types/admin';
import { INITIAL_SETTINGS } from '../mock/settings';
import { INITIAL_PRODUCTS } from '../mock/products';
import { INITIAL_ORDERS } from '../mock/orders';
import { INITIAL_CUSTOMERS } from '../mock/customers';
import { INITIAL_CATEGORIES } from '../mock/categories';
import { INITIAL_COUPONS } from '../mock/coupons';
import { INITIAL_REVIEWS } from '../mock/reviews';
import { INITIAL_BANNERS } from '../mock/banners';

const SETTINGS_KEY = 'jj_admin_settings';

export const settingsService = {
  getSettings: (): StoreSettings => {
    if (typeof window === 'undefined') return INITIAL_SETTINGS;
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) {
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(INITIAL_SETTINGS));
      } catch (err) {
        console.warn('Unable to write initial settings to localStorage:', err);
      }
      return INITIAL_SETTINGS;
    }
    try {
      const parsed = JSON.parse(stored);
      // Clean up any giant base64 strings that might have bloated localStorage in previous attempts
      if (parsed.midBannerImage && typeof parsed.midBannerImage === 'string' && parsed.midBannerImage.startsWith('data:image')) {
        parsed.midBannerImage = INITIAL_SETTINGS.midBannerImage;
        try {
          localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...INITIAL_SETTINGS, ...parsed }));
        } catch (_) {}
      }
      return { ...INITIAL_SETTINGS, ...parsed };
    } catch {
      return INITIAL_SETTINGS;
    }
  },

  updateSettings: (updates: Partial<StoreSettings>): StoreSettings => {
    const current = settingsService.getSettings();
    const updated = { ...current, ...updates };

    // Prevent storing massive base64 image strings directly in localStorage (which causes QuotaExceededError)
    if (updated.midBannerImage && typeof updated.midBannerImage === 'string' && updated.midBannerImage.startsWith('data:image') && updated.midBannerImage.length > 5000) {
      console.warn('Prevented storing raw base64 image in localStorage. Use hosted URL instead.');
      updated.midBannerImage = current.midBannerImage || INITIAL_SETTINGS.midBannerImage;
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      } catch (err: any) {
        console.error('LocalStorage quota exceeded or failed to save settings:', err);
        // Attempt recovery by purging old bulky demo data
        try {
          localStorage.removeItem('jj_admin_products');
          localStorage.removeItem('jj_admin_orders');
          localStorage.removeItem('jj_admin_customers');
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
        } catch (recoveryErr) {
          console.error('Critical quota error even after cleanup:', recoveryErr);
        }
      }
    }
    return updated;
  },

  resetAllDemoData: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('jj_admin_products');
    localStorage.removeItem('jj_admin_orders');
    localStorage.removeItem('jj_admin_customers');
    localStorage.removeItem('jj_admin_categories');
    localStorage.removeItem('jj_admin_coupons');
    localStorage.removeItem('jj_admin_reviews');
    localStorage.removeItem('jj_admin_banners');
    localStorage.removeItem('jj_cart');
    localStorage.removeItem('jj_wishlist');
    localStorage.setItem('jj_admin_products', JSON.stringify([]));
    localStorage.setItem('jj_admin_orders', JSON.stringify([]));
    localStorage.setItem('jj_admin_customers', JSON.stringify([]));
    localStorage.setItem('jj_admin_coupons', JSON.stringify([]));
    localStorage.setItem('jj_admin_reviews', JSON.stringify([]));
    localStorage.setItem('jj_admin_banners', JSON.stringify([]));
  }
};
