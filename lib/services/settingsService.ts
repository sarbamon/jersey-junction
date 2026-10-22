import { StoreSettings } from '../types/admin';
import { INITIAL_SETTINGS } from '../mock/settings';
import { icarryService } from './icarryService';
import { INITIAL_PRODUCTS } from '../mock/products';
import { INITIAL_ORDERS } from '../mock/orders';
import { INITIAL_CUSTOMERS } from '../mock/customers';
import { INITIAL_CATEGORIES } from '../mock/categories';
import { INITIAL_COUPONS } from '../mock/coupons';
import { INITIAL_REVIEWS } from '../mock/reviews';
import { INITIAL_BANNERS } from '../mock/banners';
import { apiClient } from '../apiClient';

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

  fetchSettingsAsync: async (): Promise<StoreSettings> => {
    const local = settingsService.getSettings();
    try {
      const res = await apiClient.get<StoreSettings>('/settings');
      if (res && res.success && res.data) {
        const merged: StoreSettings = {
          ...local,
          ...res.data,
          // Retain local pickup locations if backend doesn't have them
          icarryPickupLocations: local.icarryPickupLocations || INITIAL_SETTINGS.icarryPickupLocations,
        };
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
            window.dispatchEvent(new CustomEvent('jj_store_settings_updated', { detail: merged }));
          } catch (_) {}
        }
        return merged;
      }
    } catch (e) {
      // Fallback silently to local cache
    }
    return local;
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
        window.dispatchEvent(new CustomEvent('jj_store_settings_updated', { detail: updated }));
      } catch (err: any) {
        console.error('LocalStorage quota exceeded or failed to save settings:', err);
        // Attempt recovery by purging old bulky demo data
        try {
          localStorage.removeItem('jj_admin_products');
          localStorage.removeItem('jj_admin_orders');
          localStorage.removeItem('jj_admin_customers');
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
          window.dispatchEvent(new CustomEvent('jj_store_settings_updated', { detail: updated }));
        } catch (recoveryErr) {
          console.error('Critical quota error even after cleanup:', recoveryErr);
        }
      }
    }

    // Automatically sync store settings (like codEnabled, razorpayEnabled, shipping charge) to backend
    apiClient.put('/settings', {
      storeName: updated.storeName,
      storeEmail: updated.storeEmail,
      storePhone: updated.storePhone,
      storeAddress: updated.storeAddress,
      shippingCharge: updated.shippingCharge,
      expressShippingCharge: updated.expressShippingCharge,
      standardShippingCharge: updated.standardShippingCharge,
      freeShippingThreshold: updated.freeShippingThreshold,
      codEnabled: updated.codEnabled,
      razorpayEnabled: updated.razorpayEnabled,
    }).catch(() => {});

    // Automatically sync iCarry pickup address ID, name, and pincode with backend
    if (updated.icarryPickupAddressId !== undefined || updated.icarryPickupName !== undefined || updated.icarryPickupPincode !== undefined) {
      icarryService.saveConfig({
        pickupAddressId: updated.icarryPickupAddressId || '',
        senderName: updated.icarryPickupName || '',
        senderPincode: updated.icarryPickupPincode || '',
      }).catch(() => {});
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
