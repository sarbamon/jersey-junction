import { AdminOrder, OrderStatus, PaymentStatus } from '../types/admin';
import { apiClient } from '../apiClient';

const ORDERS_KEY = 'jj_admin_orders';

export const orderService = {
  getOrders: (): AdminOrder[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(ORDERS_KEY);
    if (!stored) {
      return [];
    }
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  },

  async fetchOrdersAsync(): Promise<AdminOrder[]> {
    try {
      const res = await apiClient.get<AdminOrder[]>('/orders');
      if (res.success && Array.isArray(res.data)) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(ORDERS_KEY, JSON.stringify(res.data));
        }
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
    return all.filter(o => o.email.toLowerCase() === query || o.customerName.toLowerCase() === query);
  },

  getOrderById: (id: string): AdminOrder | undefined => {
    const orders = orderService.getOrders();
    const formattedSearch = id.startsWith('#') ? id : `#${id}`;
    return orders.find(o => o.id === id || o.id === formattedSearch || o.id.replace('#', '') === id);
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

  addOrder: (newOrder: AdminOrder): AdminOrder => {
    const orders = orderService.getOrders();
    const updated = [newOrder, ...orders.filter(o => o.id !== newOrder.id)];
    if (typeof window !== 'undefined') {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
    }
    
    // Post to backend asynchronously
    apiClient.post('/orders', newOrder).catch(err => {
      console.error('Failed to persist order to backend API:', err);
    });

    return newOrder;
  },

  updateOrderStatus: (id: string, newStatus: OrderStatus): AdminOrder => {
    const orders = orderService.getOrders();
    const index = orders.findIndex(o => o.id === id || o.id === `#${id}`);
    
    let updatedOrder: AdminOrder;

    if (index !== -1) {
      const order = orders[index];
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

      const newTimeline = [...order.timeline];
      if (!newTimeline.some(t => t.status === newStatus)) {
        newTimeline.push({
          status: newStatus,
          timestamp,
          note: `Order status changed to ${newStatus}`
        });
      }

      updatedOrder = {
        ...order,
        orderStatus: newStatus,
        timeline: newTimeline
      };

      orders[index] = updatedOrder;

      if (typeof window !== 'undefined') {
        localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
      }
    } else {
      updatedOrder = {
        id,
        customerName: 'Customer',
        email: '',
        phone: '',
        shippingAddress: { name: '', email: '', phone: '', addressLine: '', city: '', state: '', pincode: '', country: '' },
        items: [],
        subtotal: 0,
        shippingFee: 0,
        discountAmount: 0,
        totalAmount: 0,
        paymentMethod: 'Credit Card',
        paymentStatus: 'Paid',
        orderStatus: newStatus,
        date: new Date().toISOString().split('T')[0],
        timeline: []
      };
    }

    apiClient.patch(`/orders/${encodeURIComponent(id)}/status`, { orderStatus: newStatus }).catch(err => {
      console.error('Failed to update status on backend API:', err);
    });

    return updatedOrder;
  },

  updatePaymentStatus: (id: string, newStatus: PaymentStatus): AdminOrder => {
    const orders = orderService.getOrders();
    const index = orders.findIndex(o => o.id === id || o.id === `#${id}`);
    if (index === -1) throw new Error(`Order ${id} not found`);

    const updatedOrder: AdminOrder = {
      ...orders[index],
      paymentStatus: newStatus
    };

    orders[index] = updatedOrder;

    if (typeof window !== 'undefined') {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    }

    apiClient.patch(`/orders/${encodeURIComponent(id)}/status`, { paymentStatus: newStatus }).catch(err => {
      console.error('Failed to update payment status on backend API:', err);
    });

    return updatedOrder;
  },

  deleteOrder: (id: string): void => {
    const orders = orderService.getOrders();
    const updated = orders.filter(o => o.id !== id && o.id !== `#${id}` && o.id.replace('#', '') !== id.replace('#', ''));
    if (typeof window !== 'undefined') {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
    }
    apiClient.delete(`/orders/${encodeURIComponent(id)}`).catch(err => {
      console.error('Failed to delete order on backend:', err);
    });
  },

  deleteAllOrders: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ORDERS_KEY, JSON.stringify([]));
    }
    apiClient.delete('/orders').catch(err => {
      console.error('Failed to delete all orders on backend:', err);
    });
  }
};
