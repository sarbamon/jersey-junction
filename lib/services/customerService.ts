import { apiClient } from '../apiClient';
import { AdminCustomer } from '../types/admin';
import { orderService } from './orderService';

const CUSTOMERS_KEY = 'jj_admin_customers';

const DEMO_NAMES = ['aarav sharma', 'rohan mehta', 'vikramaditya k.', 'priya verma', 'kabir das'];
const DEMO_IDS = ['cust-001', 'cust-002', 'cust-003', 'cust-004', 'cust-005'];

function isDemoCustomer(cust: any): boolean {
  if (!cust) return true;
  const name = (cust.name || '').toLowerCase().trim();
  const id = (cust.id || cust._id || '').toString().toLowerCase().trim();
  const email = (cust.email || '').toLowerCase().trim();
  return (
    DEMO_NAMES.includes(name) ||
    DEMO_IDS.includes(id) ||
    email.includes('aarav.sharma') ||
    email.includes('rohan.mehta') ||
    email.includes('vikram.k') ||
    email.includes('priya.v') ||
    email.includes('kabir.das')
  );
}

function filterOutDemo(customers: AdminCustomer[]): AdminCustomer[] {
  return customers.filter(c => !isDemoCustomer(c));
}

function getLocalCustomers(): AdminCustomer[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(CUSTOMERS_KEY);
  if (!stored) {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify([]));
    return [];
  }
  try {
    const parsed = JSON.parse(stored);
    const cleaned = filterOutDemo(Array.isArray(parsed) ? parsed : []);
    if (cleaned.length !== (Array.isArray(parsed) ? parsed.length : 0)) {
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

export const customerService = {
  getCustomersSync: (): AdminCustomer[] => {
    return getLocalCustomers();
  },

  getCustomers: async (): Promise<AdminCustomer[]> => {
    const local = getLocalCustomers();
    try {
      const res = await apiClient.get('/auth/users');
      if (res.success && Array.isArray(res.data)) {
        const realUsers: AdminCustomer[] = res.data
          .filter((u: any) => !isDemoCustomer(u))
          .map((u: any, idx: number) => ({
            id: u.id || u._id || `cust-${idx + 1}`,
            name: u.name || 'Registered User',
            email: u.email || '',
            phone: u.phone || '',
            city: u.city || 'India',
            state: u.state || '',
            country: u.country || 'India',
            ordersCount: Number(u.ordersCount) || 0,
            totalSpent: Number(u.totalSpent) || 0,
            joinedDate: u.joinedDate || (u.createdAt ? u.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
            status: u.isBanned || u.status === 'Banned' ? 'Banned' : (u.status || 'Active'),
            isBanned: Boolean(u.isBanned || u.status === 'Banned'),
            banReason: u.banReason || '',
          }));
        if (typeof window !== 'undefined') {
          localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(realUsers));
        }
        return realUsers;
      }
    } catch (err) {
      console.warn('Failed to fetch customers from backend:', err);
    }

    // Secondary fallback: derive customers from store orders if offline or backend unavailable
    try {
      const orders = orderService.getOrders();
      if (orders && orders.length > 0) {
        const byEmail = new Map<string, AdminCustomer>();
        for (const o of orders) {
          const email = (o.email || '').toLowerCase().trim();
          if (!email || isDemoCustomer({ email, name: o.customerName })) continue;
          if (!byEmail.has(email)) {
            byEmail.set(email, {
              id: `cust-${email.replace(/[^a-z0-9]/g, '')}`,
              name: o.customerName || email.split('@')[0],
              email: email,
              phone: o.phone || o.shippingAddress?.phone || '',
              city: o.shippingAddress?.city || 'India',
              state: o.shippingAddress?.state || '',
              country: o.shippingAddress?.country || 'India',
              ordersCount: 0,
              totalSpent: 0,
              joinedDate: o.date || new Date().toISOString().split('T')[0],
              status: 'Active',
              isBanned: false,
              banReason: '',
            });
          }
          const c = byEmail.get(email)!;
          c.ordersCount += 1;
          c.totalSpent += (o.totalAmount || 0);
          if (!c.phone && (o.phone || o.shippingAddress?.phone)) {
            c.phone = o.phone || o.shippingAddress?.phone || '';
          }
          if (c.city === 'India' && o.shippingAddress?.city) {
            c.city = o.shippingAddress.city;
            c.state = o.shippingAddress.state || '';
          }
        }
        const derived = Array.from(byEmail.values());
        if (derived.length > 0) {
          if (typeof window !== 'undefined') {
            localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(derived));
          }
          return derived;
        }
      }
    } catch {
      // ignore
    }

    return local;
  },

  getCustomerById: async (id: string): Promise<AdminCustomer | undefined> => {
    const customers = await customerService.getCustomers();
    return customers.find(c => c.id === id || (c as any)._id === id);
  },

  banCustomer: async (id: string, isBanned: boolean, reason?: string, customer?: AdminCustomer): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await apiClient.put(`/auth/users/${id}/ban`, {
        isBanned,
        reason,
        email: customer?.email,
        name: customer?.name,
      });
      if (res.success) {
        if (typeof window !== 'undefined') {
          const local = getLocalCustomers().map(c => 
            (c.id === id || (c as any)._id === id)
              ? { ...c, isBanned, status: (isBanned ? 'Banned' : 'Active') as any, banReason: reason || '' }
              : c
          );
          localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(local));
        }
        return { success: true, message: res.message };
      }
      return { success: false, message: res.error || 'Failed to update ban status' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error updating ban status' };
    }
  },

  adminResetPassword: async (id: string, newPassword: string, email?: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await apiClient.put(`/auth/users/${id}/reset-password`, { newPassword, email });
      if (res.success) {
        return { success: true, message: res.message || 'Password reset successfully' };
      }
      return { success: false, message: res.error || 'Failed to reset password' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error resetting password' };
    }
  },

  resetPasswordCustomer: async (email: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await apiClient.post('/auth/reset-password', { email, newPassword });
      if (res.success) {
        return { success: true, message: res.message || 'Password reset successfully' };
      }
      return { success: false, message: res.error || 'Failed to reset password' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error resetting password' };
    }
  }
};

