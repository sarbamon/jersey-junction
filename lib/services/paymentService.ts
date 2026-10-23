const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
    try {
      const res = await fetch(`${API_URL}/payment/key`);
      const data = await res.json();
      if (data.success && data.keyId) {
        return data.keyId;
      }
      return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_key';
    } catch (err) {
      console.warn('Failed to fetch Razorpay key from backend, using fallback:', err);
      return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_key';
    }
  },

  // Authoritatively calculate order totals and line items from backend
  calculatePriceSummary: async (params: {
    items: any[];
    shippingMethod?: string;
    couponCode?: string;
  }): Promise<PriceBreakdown> => {
    const res = await fetch(`${API_URL}/payment/calculate-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
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

    const res = await fetch(`${API_URL}/payment/create-order`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        currency,
        items: orderData?.items || [],
        shippingMethod: orderData?.shippingMethod || 'standard',
        couponCode: orderData?.couponCode || '',
        orderData,
      }),
    });

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
    const res = await fetch(`${API_URL}/payment/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentDetails),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Payment signature verification failed');
    }
    return true;
  },
};
