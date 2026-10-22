import { AdminOrder, OrderStatus, PaymentStatus } from '../types/admin';
import { apiClient } from '../apiClient';

const ORDERS_KEY = 'jj_admin_orders';

// Safely persist orders to localStorage without exceeding browser storage quota
const safeStoreOrders = (orders: AdminOrder[]): void => {
  if (typeof window === 'undefined') return;
  try {
    // Keep up to 20 most recent orders in localStorage cache (MongoDB has full history)
    // Strip giant base64 data URIs from items so localStorage doesn't hit 5MB quota
    const sanitized = orders.slice(0, 20).map((o) => ({
      ...o,
      items: Array.isArray(o.items)
        ? o.items.map((itm) => ({
            ...itm,
            image: itm.image && itm.image.startsWith('data:') && itm.image.length > 500
              ? ''
              : itm.image,
          }))
        : [],
    }));
    localStorage.setItem(ORDERS_KEY, JSON.stringify(sanitized));
  } catch (err) {
    console.warn('[LocalStorage] Quota exceeded on orders. Pruning cache...', err);
    try {
      // Try saving only the 5 most recent orders without image payloads
      const minimal = orders.slice(0, 5).map((o) => ({
        ...o,
        items: Array.isArray(o.items) ? o.items.map((itm) => ({ ...itm, image: '' })) : [],
      }));
      localStorage.setItem(ORDERS_KEY, JSON.stringify(minimal));
    } catch {
      // Fallback: clear the cached orders key so UI and checkout never crash
      try {
        localStorage.removeItem(ORDERS_KEY);
      } catch {}
    }
  }
};

export const orderService = {
  getOrders: (): AdminOrder[] => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(ORDERS_KEY);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch {
      return [];
    }
  },

  async fetchOrdersAsync(): Promise<AdminOrder[]> {
    try {
      const res = await apiClient.get<AdminOrder[]>('/orders');
      if (res.success && Array.isArray(res.data)) {
        safeStoreOrders(res.data);
        return res.data;
      }
    } catch (err) {
      console.error('Error fetching orders from backend:', err);
    }
    return orderService.getOrders();
  },

  async getUserOrdersAsync(email: string): Promise<AdminOrder[]> {
    try {
      if (email) {
        const res = await apiClient.get<AdminOrder[]>(`/orders/user/${encodeURIComponent(email)}`);
        if (res.success && Array.isArray(res.data)) {
          return res.data;
        }
      }
    } catch (err) {
      console.error('Error fetching user orders from backend:', err);
    }
    // Fallback: search local orders by email or customer name
    const all = orderService.getOrders();
    const query = email.toLowerCase();
    return all.filter((o) => o.email.toLowerCase() === query || o.customerName.toLowerCase() === query);
  },

  getOrderById: (id: string): AdminOrder | undefined => {
    const orders = orderService.getOrders();
    const formattedSearch = id.startsWith('#') ? id : `#${id}`;
    return orders.find((o) => o.id === id || o.id === formattedSearch || o.id.replace('#', '') === id);
  },

  async getOrderByIdAsync(id: string): Promise<AdminOrder | undefined> {
    try {
      const res = await apiClient.get<AdminOrder>(`/orders/${encodeURIComponent(id)}`);
      if (res.success && res.data) {
        return res.data;
      }
    } catch (err) {
      console.error('Error fetching order by ID:', err);
    }
    return orderService.getOrderById(id);
  },

  addOrder: async (newOrder: AdminOrder): Promise<AdminOrder> => {
    const orders = orderService.getOrders();
    const updated = [newOrder, ...orders.filter((o) => o.id !== newOrder.id)];
    
    // Safely update local storage cache without quota crashes
    safeStoreOrders(updated);

    // Post to backend MongoDB API
    try {
      await apiClient.post('/orders', newOrder);
    } catch (err) {
      console.error('Failed to persist order to backend API:', err);
    }

    // Notify admin listeners across tabs / windows
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('jj_new_order_placed', { detail: newOrder }));
        localStorage.setItem('jj_latest_order_timestamp', String(Date.now()));
      } catch (e) {}
    }

    return newOrder;
  },

  updateOrderStatus: (id: string, newStatus: OrderStatus): AdminOrder => {
    const orders = orderService.getOrders();
    const index = orders.findIndex((o) => o.id === id || o.id === `#${id}`);

    let updatedOrder: AdminOrder;

    if (index !== -1) {
      const order = orders[index];
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

      const newTimeline = [...order.timeline];
      if (!newTimeline.some((t) => t.status === newStatus)) {
        newTimeline.push({
          status: newStatus,
          timestamp,
          note: `Order status changed to ${newStatus}`,
        });
      }

      updatedOrder = {
        ...order,
        orderStatus: newStatus,
        timeline: newTimeline,
      };

      orders[index] = updatedOrder;
      safeStoreOrders(orders);
    } else {
      updatedOrder = {
        id,
        customerName: 'Customer',
        email: '',
        phone: '',
        shippingAddress: {
          name: '',
          email: '',
          phone: '',
          addressLine: '',
          city: '',
          state: '',
          pincode: '',
          country: '',
        },
        items: [],
        subtotal: 0,
        shippingFee: 0,
        discountAmount: 0,
        totalAmount: 0,
        paymentMethod: 'Credit Card',
        paymentStatus: 'Paid',
        orderStatus: newStatus,
        date: new Date().toISOString().split('T')[0],
        timeline: [],
      };
    }

    apiClient.patch(`/orders/${encodeURIComponent(id)}/status`, { orderStatus: newStatus }).catch((err) => {
      console.error('Failed to update status on backend API:', err);
    });

    return updatedOrder;
  },

  updatePaymentStatus: (id: string, newStatus: PaymentStatus): AdminOrder => {
    const orders = orderService.getOrders();
    const index = orders.findIndex((o) => o.id === id || o.id === `#${id}`);
    if (index === -1) throw new Error(`Order ${id} not found`);

    const updatedOrder: AdminOrder = {
      ...orders[index],
      paymentStatus: newStatus,
    };

    orders[index] = updatedOrder;
    safeStoreOrders(orders);

    apiClient.patch(`/orders/${encodeURIComponent(id)}/status`, { paymentStatus: newStatus }).catch((err) => {
      console.error('Failed to update payment status on backend API:', err);
    });

    return updatedOrder;
  },

  updateOrder: async (id: string, updates: Partial<AdminOrder>): Promise<AdminOrder> => {
    const orders = orderService.getOrders();
    const index = orders.findIndex(
      (o) => o.id === id || o.id === `#${id}` || o.id.replace('#', '') === id.replace('#', '')
    );
    let localUpdated: AdminOrder | null = null;
    if (index !== -1) {
      localUpdated = { ...orders[index], ...updates };
      orders[index] = localUpdated;
      safeStoreOrders(orders);
    }

    try {
      const res = await apiClient.patch(`/orders/${encodeURIComponent(id)}`, updates);
      if (res.success && res.data) {
        return res.data;
      }
    } catch (err) {
      console.error('Failed to update order on backend:', err);
    }

    return localUpdated || (updates as AdminOrder);
  },

  deleteOrder: (id: string): void => {
    const orders = orderService.getOrders();
    const updated = orders.filter(
      (o) => o.id !== id && o.id !== `#${id}` && o.id.replace('#', '') !== id.replace('#', '')
    );
    safeStoreOrders(updated);
    apiClient.delete(`/orders/${encodeURIComponent(id)}`).catch((err) => {
      console.error('Failed to delete order on backend:', err);
    });
  },

  deleteAllOrders: (): void => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(ORDERS_KEY);
      }
    } catch {}
    apiClient.delete('/orders').catch((err) => {
      console.error('Failed to delete all orders on backend:', err);
    });
  },
};
