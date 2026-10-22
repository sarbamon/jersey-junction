import { apiClient } from '../apiClient';
import { AdminCustomer } from '../types/admin';

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
            id: u._id || u.id || `cust-${idx + 1}`,
            name: u.name || 'Registered User',
            email: u.email || '',
            phone: u.phone || '',
            city: u.city || 'India',
            state: u.state || '',
            country: u.country || 'India',
            ordersCount: u.ordersCount || 0,
            totalSpent: u.totalSpent || 0,
            joinedDate: u.createdAt ? u.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
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
    return local;
  },

  getCustomerById: async (id: string): Promise<AdminCustomer | undefined> => {
    const customers = await customerService.getCustomers();
    return customers.find(c => c.id === id || (c as any)._id === id);
  },

  banCustomer: async (id: string, isBanned: boolean, reason?: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await apiClient.put(`/auth/users/${id}/ban`, { isBanned, reason });
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

  adminResetPassword: async (id: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await apiClient.put(`/auth/users/${id}/reset-password`, { newPassword });
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

