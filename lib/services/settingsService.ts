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
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_SETTINGS;
    }
  },

  updateSettings: (updates: Partial<StoreSettings>): StoreSettings => {
    const current = settingsService.getSettings();
    const updated = { ...current, ...updates };
    if (typeof window !== 'undefined') {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
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
