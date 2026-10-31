import { apiClient } from '../apiClient';

export interface ICarryConfig {
  apiToken: string;
  apiKey?: string;
  apiUsername?: string;
  hasCredentials?: boolean;
  hasToken?: boolean;
  maskedToken?: string;
  credentialsSource?: string;
  pickupAddressId: string;
  isLiveMode: boolean;
  senderName?: string;
  senderPhone?: string;
  senderEmail?: string;
  senderAddress?: string;
  senderCity?: string;
  senderState?: string;
  senderPincode?: string;
  defaultWeight: number;
  defaultLength: number;
  defaultBreadth: number;
  defaultHeight: number;
}

export interface CourierEstimate {
  id: string;
  name: string;
  mode: string;
  rate: number;
  estimatedDays: string;
  recommended?: boolean;
  pickupCutoff?: string;
}

export interface BookShipmentParams {
  orderId: string;
  courierName: string;
  courierId?: string;
  weight: number;
  dimensions?: {
    length: number;
    breadth: number;
    height: number;
  };
  pickupAddress?: Partial<ICarryConfig>;
  pickupAddressId?: string;
  invoiceValue?: number;
  parcelContents?: string;
  mode?: string;
  consignee?: {
    name?: string;
    phone?: string;
    addressLine?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  customNote?: string;
}

export interface BookShipmentResult {
  orderId: string;
  shipmentId: string;
  trackingNumber: string;
  courierName: string;
  labelUrl: string;
  shippingStatus: string;
  bookedAt: string;
}

export interface TrackingMilestone {
  status: string;
  location: string;
  timestamp: string;
  details: string;
  done: boolean;
}

export interface TrackingResult {
  orderId: string;
  trackingNumber: string;
  shipmentId?: string;
  courier: string;
  shippingStatus: string;
  orderStatus: string;
  destination: string;
  edd?: string;
  pickedDateTime?: string;
  deliveredDateTime?: string;
  externalTrackingUrl?: string;
  rawDetails?: Array<{ datetime: string; location: string | null; notes: string }>;
  history: TrackingMilestone[];
}

export const icarryService = {
  // Get current iCarry settings
  getConfig: async (): Promise<ICarryConfig | null> => {
    try {
      const res = await apiClient.get<ICarryConfig>('/icarry/config');
      if (res.success && res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn('Failed to load iCarry config from backend:', err);
    }
    return null;
  },

  // Save iCarry settings
  saveConfig: async (config: Partial<ICarryConfig>): Promise<boolean> => {
    try {
      const res = await apiClient.post('/icarry/config', config);
      return Boolean(res.success);
    } catch (err) {
      console.error('Failed to save iCarry config:', err);
      return false;
    }
  },

  // Get shipping rates and couriers for an order directly from iCarry
  getEstimates: async (
    originPincode: string,
    destinationPincode: string,
    weight = 500,
    dimensions = { length: 25, breadth: 20, height: 3 },
    pickupAddressId?: string,
    mode?: string,
    invoiceValue?: number,
    isCOD?: boolean
  ): Promise<{ success: boolean; couriers: CourierEstimate[]; message?: string }> => {
    try {
      const res = await apiClient.post<{ couriers: CourierEstimate[]; isLive?: boolean }>('/icarry/estimate', {
        originPincode,
        destinationPincode,
        weight,
        dimensions,
        pickupAddressId,
        mode,
        invoiceValue: invoiceValue || 1000,
        parcelType: isCOD ? 'C' : 'P',
        isCOD: Boolean(isCOD),
      });
      const couriersList = (res as any).couriers || (res.data as any)?.couriers || [];
      if (res.success && Array.isArray(couriersList) && couriersList.length > 0) {
        return {
          success: true,
          couriers: couriersList,
        };
      }
      return {
        success: false,
        couriers: [],
        message: res.error || res.message || 'No delivery partners returned by iCarry for this route.',
      };
    } catch (err: any) {
      console.warn('Failed to fetch courier estimates from iCarry:', err);
      return {
        success: false,
        couriers: [],
        message: err.message || 'Could not connect to iCarry to fetch delivery partners.',
      };
    }
  },

  // Fetch registered pickup addresses from iCarry account
  getPickupAddresses: async (): Promise<any[]> => {
    try {
      const res = await apiClient.get<{ addresses: any[] }>('/icarry/pickup-addresses');
      if (res.success && res.data && Array.isArray((res.data as any).addresses)) {
        return (res.data as any).addresses;
      }
    } catch {
      // ignore
    }
    return [];
  },

  // Book shipment with iCarry
  bookShipment: async (params: BookShipmentParams): Promise<{ success: boolean; message: string; data?: BookShipmentResult }> => {
    try {
      const res = await apiClient.post<BookShipmentResult>('/icarry/book', params);
      if (res.success && res.data) {
        return {
          success: true,
          message: (res as any).message || 'Shipment booked via iCarry successfully!',
          data: res.data,
        };
      }
      return {
        success: false,
        message: res.error || 'Failed to book shipment on iCarry.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Network error while booking shipment with iCarry.',
      };
    }
  },

  // Cancel shipment
  cancelShipment: async (orderId: string): Promise<boolean> => {
    try {
      const cleanId = orderId.replace('#', '');
      const res = await apiClient.post(`/icarry/cancel/${cleanId}`);
      return Boolean(res.success);
    } catch (err) {
      console.error('Failed to cancel iCarry shipment:', err);
      return false;
    }
  },

  // Track shipment live
  trackShipment: async (orderId: string): Promise<TrackingResult | null> => {
    try {
      const cleanId = orderId.replace('#', '');
      const res = await apiClient.get<TrackingResult>(`/icarry/track/${cleanId}`);
      if (res.success && res.data) {
        const raw = res.data;
        const normalizeStatus = (str?: string) => {
          if (!str) return 'Shipping getting ready';
          if (/label\s*generated|manifest\s*generated|softdata\s*upload|shipment\s*created/i.test(str)) {
            return 'Shipping getting ready';
          }
          return str;
        };

        return {
          ...raw,
          shippingStatus: normalizeStatus(raw.shippingStatus),
          externalTrackingUrl: '', // Stripped so users stay within site
          history: (raw.history || []).map((step) => ({
            ...step,
            status: normalizeStatus(step.status),
            details: normalizeStatus(step.details),
          })),
        };
      }
    } catch (err) {
      console.error('Failed to track iCarry shipment:', err);
    }
    return null;
  },

  // Check pincode serviceability and auto-detect state & district
  checkPincode: async (pincode: string): Promise<{
    success: boolean;
    available: boolean;
    pincode?: string;
    state?: string;
    district?: string;
    city?: string;
    estimatedDays?: string;
    couriers?: string[];
    codAvailable?: boolean;
    message?: string;
  }> => {
    const cleanPin = String(pincode || '').trim().replace(/\D/g, '');
    if (!cleanPin || cleanPin.length !== 6) {
      return {
        success: false,
        available: false,
        message: 'Please enter a valid 6-digit Indian PIN code.',
      };
    }

    try {
      const res = await apiClient.post<any>('/icarry/check-pincode', { pincode: cleanPin });
      const payload = res && typeof (res as any).available === 'boolean'
        ? (res as any)
        : (res?.success && res.data ? res.data : null);

      if (payload && payload.state) {
        if (payload.message) {
          payload.message = payload.message.replace(/\s*\([Ee]st\.?[^)]*\)/gi, '').trim();
        }
        return payload;
      }
    } catch (err: any) {
      console.warn('Backend iCarry check-pincode deferred, trying client postal lookup:', err.message);
    }

    // Direct browser fallback to official Indian Postal API for instant State & District resolution
    try {
      const postalRes = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
      if (postalRes.ok) {
        const postalData = await postalRes.json();
        if (Array.isArray(postalData) && postalData[0]?.Status === 'Success' && Array.isArray(postalData[0]?.PostOffice) && postalData[0].PostOffice.length > 0) {
          const po = postalData[0].PostOffice[0];
          const state = po.State || '';
          const district = po.District || '';
          const city = (po.Block && po.Block !== 'NA') ? po.Block : (po.Name || po.District || '');

          return {
            success: true,
            available: true,
            pincode: cleanPin,
            state,
            district,
            city,
            estimatedDays: '3 - 5 Days',
            couriers: ['Standard Indian Courier'],
            message: `Delivery available to ${city ? `${city}, ` : ''}${district}, ${state}!`,
          };
        }
      }
    } catch (clientPostalErr) {
      console.warn('Client postal lookup error:', clientPostalErr);
    }

    return {
      success: false,
      available: false,
      pincode: cleanPin,
      message: 'Unable to verify pincode at this time.',
    };
  },
};
