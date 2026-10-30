const PRODUCTION_BACKEND_API = 'https://aqua-pheasant-372889.hostingersite.com/api';

const getNormalizedApiUrl = (): string => {
  // If explicitly set via environment variable
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined') {
    // In production browser, use relative /api proxy to avoid CORS roundtrips
    if (window.location.hostname.includes('jerseyjunction.shop')) {
      return '/api';
    }
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
    return '/api';
  }

  if (process.env.NODE_ENV === 'production') {
    return PRODUCTION_BACKEND_API;
  }

  return 'http://localhost:5000/api';
};

export interface PriceBreakdown {
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  amountInPaise: number;
  shippingMethod: string;
  items: Array<{
    productId: string;
    slug: string;
    name: string;
    size: string;
    version: string;
    customName: string;
    customNumber: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    image: string;
  }>;
  appliedCoupon?: {
    code: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
  } | null;
}

export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  status?: string;
  internalOrderId?: string;
  breakdown?: PriceBreakdown;
  keyId?: string;
}

export const paymentService = {
  // Get public Razorpay Key ID
  getRazorpayKey: async (): Promise<string> => {
    const apiUrl = getNormalizedApiUrl();
    try {
      const res = await fetch(`${apiUrl}/payment/key`);
      const data = await res.json();
      if (data.success && data.keyId) {
        return data.keyId;
      }
    } catch (err) {
      console.warn('Failed to fetch Razorpay key from primary API, trying direct backend:', err);
    }

    try {
      const directRes = await fetch(`${PRODUCTION_BACKEND_API}/payment/key`);
      const directData = await directRes.json();
      if (directData.success && directData.keyId) {
        return directData.keyId;
      }
    } catch (_) {}

    return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TlrrQ97IAsoMYp';
  },

  // Authoritatively calculate order totals and line items from backend
  calculatePriceSummary: async (params: {
    items: any[];
    shippingMethod?: string;
    couponCode?: string;
  }): Promise<PriceBreakdown> => {
    const apiUrl = getNormalizedApiUrl();
    const payload = JSON.stringify(params);

    let res: Response | null = null;
    try {
      res = await fetch(`${apiUrl}/payment/calculate-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });
      if (!res.ok && res.status >= 500 && apiUrl === '/api') {
        res = await fetch(`${PRODUCTION_BACKEND_API}/payment/calculate-summary`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
        });
      }
    } catch {
      res = await fetch(`${PRODUCTION_BACKEND_API}/payment/calculate-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });
    }

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to calculate price summary');
    }
    return data.data;
  },

  // Create Razorpay Order on backend with server-authoritative pricing
  createRazorpayOrder: async (
    amount: number,
    currency: string = 'INR',
    orderData?: any
  ): Promise<RazorpayOrderResponse> => {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('jj_customer_token') || localStorage.getItem('jj_admin_token')
      : null;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const payload = JSON.stringify({
      currency,
      items: orderData?.items || [],
      shippingMethod: orderData?.shippingMethod || 'standard',
      couponCode: orderData?.couponCode || '',
      orderData,
    });

    const apiUrl = getNormalizedApiUrl();
    let res: Response | null = null;

    try {
      res = await fetch(`${apiUrl}/payment/create-order`, {
        method: 'POST',
        headers,
        body: payload,
      });

      // If relative proxy returns server error (500/502/504), fail over directly to Hostinger backend
      if (!res.ok && res.status >= 500 && apiUrl === '/api') {
        console.warn('Proxy returned error, failing over directly to Hostinger backend...');
        res = await fetch(`${PRODUCTION_BACKEND_API}/payment/create-order`, {
          method: 'POST',
          headers,
          body: payload,
        });
      }
    } catch (netErr) {
      console.warn('Network error on primary API, failing over directly to Hostinger backend:', netErr);
      res = await fetch(`${PRODUCTION_BACKEND_API}/payment/create-order`, {
        method: 'POST',
        headers,
        body: payload,
      });
    }

    const data = await res.json();
    if (data.success && data.data) {
      return {
        ...data.data,
        internalOrderId: data.internalOrderId,
        breakdown: data.breakdown,
        keyId: data.keyId,
      };
    }

    throw new Error(data.message || 'Failed to create secure Razorpay order on server');
  },

  // Verify payment signature cryptographically on backend
  verifyPayment: async (paymentDetails: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<boolean> => {
    const apiUrl = getNormalizedApiUrl();
    const payload = JSON.stringify(paymentDetails);

    let res: Response | null = null;
    try {
      res = await fetch(`${apiUrl}/payment/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });
      if (!res.ok && res.status >= 500 && apiUrl === '/api') {
        res = await fetch(`${PRODUCTION_BACKEND_API}/payment/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
        });
      }
    } catch {
      res = await fetch(`${PRODUCTION_BACKEND_API}/payment/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });
    }

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Payment signature verification failed');
    }
    return true;
  },
};
