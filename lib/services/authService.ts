import { apiClient } from '../apiClient';

export interface AuthUser {
  id?: string;
  email: string;
  name: string;
  role: 'admin' | 'employee' | 'user';
  token: string;
  phone?: string;
  permissions?: string[];
  employeeTitle?: string;
}

const ADMIN_AUTH_KEY = 'jj_admin_auth_user';
const ADMIN_TOKEN_KEY = 'jj_admin_token';
const CUSTOMER_AUTH_KEY = 'jj_customer_user';
const CUSTOMER_TOKEN_KEY = 'jj_customer_token';

export const authService = {
  // Admin & Staff Login
  login: async (email: string, pass: string): Promise<AuthUser> => {
    const res = await apiClient.post('/auth/login', { email, password: pass });

    if (!res.success || !res.token) {
      throw new Error(res.error || 'Invalid email or password');
    }

    if (res.user && res.user.role !== 'admin' && res.user.role !== 'employee') {
      throw new Error('Access denied: Staff / Administrator privileges required.');
    }

    const user: AuthUser = {
      id: res.user?.id || res.user?._id,
      email: res.user?.email || email,
      name: res.user?.name || (res.user?.role === 'admin' ? 'Administrator' : 'Employee'),
      role: res.user?.role || 'admin',
      token: res.token,
      phone: res.user?.phone || '',
      permissions: Array.isArray(res.user?.permissions) ? res.user.permissions : [],
      employeeTitle: res.user?.employeeTitle || (res.user?.role === 'admin' ? 'Administrator' : 'Employee'),
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(user));
      localStorage.setItem(ADMIN_TOKEN_KEY, res.token);
    }

    return user;
  },

  // Customer Login (Real MongoDB connection)
  loginCustomer: async (email: string, pass: string): Promise<AuthUser> => {
    const res = await apiClient.post('/auth/login', { email, password: pass });

    if (!res.success || !res.token) {
      throw new Error(res.error || 'Invalid email or password');
    }

    const user: AuthUser = {
      id: res.user?.id || res.user?._id,
      email: res.user?.email || email,
      name: res.user?.name || email.split('@')[0],
      role: res.user?.role || 'user',
      phone: res.user?.phone || '',
      token: res.token,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(CUSTOMER_AUTH_KEY, JSON.stringify(user));
      localStorage.setItem(CUSTOMER_TOKEN_KEY, res.token);
      localStorage.setItem('jj_user', JSON.stringify({
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || ''
      }));
    }

    return user;
  },

  // Customer Register (Real MongoDB Database creation)
  registerCustomer: async (name: string, email: string, pass: string, phone?: string): Promise<AuthUser> => {
    const res = await apiClient.post('/auth/register', { name, email, password: pass, phone });

    if (!res.success || !res.token) {
      throw new Error(res.error || 'Registration failed');
    }

    const user: AuthUser = {
      id: res.user?.id || res.user?._id,
      email: res.user?.email || email,
      name: res.user?.name || name,
      role: res.user?.role || 'user',
      phone: res.user?.phone || phone || '',
      token: res.token,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(CUSTOMER_AUTH_KEY, JSON.stringify(user));
      localStorage.setItem(CUSTOMER_TOKEN_KEY, res.token);
      localStorage.setItem('jj_user', JSON.stringify({
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || ''
      }));
    }

    return user;
  },

  // Google OAuth Login / Register in MongoDB
  googleAuth: async (params: { email?: string; name?: string; credential?: string; accessToken?: string } | string, legacyName?: string): Promise<AuthUser> => {
    let payload: { email?: string; name?: string; credential?: string; accessToken?: string } = {};
    if (typeof params === 'string') {
      payload = { email: params, name: legacyName };
    } else {
      payload = params;
    }

    const res = await apiClient.post('/auth/google', payload);

    if (!res.success || !res.token) {
      throw new Error(res.error || 'Google authentication failed');
    }

    const user: AuthUser = {
      id: res.user?.id || res.user?._id,
      email: res.user?.email || payload.email || '',
      name: res.user?.name || payload.name || 'Google User',
      role: res.user?.role || 'user',
      phone: res.user?.phone || '',
      token: res.token,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(CUSTOMER_AUTH_KEY, JSON.stringify(user));
      localStorage.setItem(CUSTOMER_TOKEN_KEY, res.token);
      localStorage.setItem('jj_user', JSON.stringify({
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || ''
      }));
    }

    return user;
  },

  // Customer Logout
  logoutCustomer: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CUSTOMER_AUTH_KEY);
      localStorage.removeItem(CUSTOMER_TOKEN_KEY);
      localStorage.removeItem('jj_user');
    }
  },

  // Admin Logout
  logoutAdmin: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ADMIN_AUTH_KEY);
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  },

  // Generic logout
  logout: (): void => {
    authService.logoutCustomer();
    authService.logoutAdmin();
    apiClient.get('/auth/logout').catch(() => {});
  },

  getCustomerUser: (): AuthUser | null => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(CUSTOMER_AUTH_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  getAdminUser: (): AuthUser | null => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(ADMIN_AUTH_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  getCurrentUser: (): AuthUser | null => {
    return authService.getAdminUser() || authService.getCustomerUser();
  },

  isAdminAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    const user = authService.getAdminUser();
    return Boolean(token && user && (user.role === 'admin' || user.role === 'employee'));
  },

  isAuthenticated: (): boolean => {
    return authService.isAdminAuthenticated();
  },

  isBoss: (): boolean => {
    const user = authService.getAdminUser();
    return user?.role === 'admin';
  },

  hasPermission: (permissionKey: string): boolean => {
    const user = authService.getAdminUser();
    if (!user) return false;
    // Boss / Admin can see and access ALL sections
    if (user.role === 'admin') return true;
    if (user.role === 'employee') {
      const perms = Array.isArray(user.permissions) ? user.permissions : [];
      return perms.includes(permissionKey) || perms.includes('*');
    }
    return false;
  },

  getFirstAllowedRoute: (): string => {
    const user = authService.getAdminUser();
    if (!user || user.role === 'admin') return '/admin';
    
    // Check permission priority order for employee
    if (authService.hasPermission('dashboard')) return '/admin';
    if (authService.hasPermission('products')) return '/admin/products';
    if (authService.hasPermission('orders')) return '/admin/orders';
    if (authService.hasPermission('categories')) return '/admin/categories';
    if (authService.hasPermission('customers')) return '/admin/customers';
    if (authService.hasPermission('coupons')) return '/admin/coupons';
    if (authService.hasPermission('reviews')) return '/admin/reviews';
    if (authService.hasPermission('banners')) return '/admin/banners';
    if (authService.hasPermission('settings')) return '/admin/settings';

    return '/admin';
  },

  fetchMe: async (): Promise<AuthUser | null> => {
    if (typeof window === 'undefined') return null;
    const isDashboard = window.location.pathname.startsWith('/admin');
    const token = isDashboard 
      ? localStorage.getItem(ADMIN_TOKEN_KEY) 
      : (localStorage.getItem(CUSTOMER_TOKEN_KEY) || localStorage.getItem(ADMIN_TOKEN_KEY));
    if (!token) return null;

    try {
      const res = await apiClient.get('/auth/me');
      const userData = res.user || res.data;
      if (res.success && userData) {
        const user: AuthUser = {
          id: userData._id || userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          phone: userData.phone || '',
          permissions: Array.isArray(userData.permissions) ? userData.permissions : [],
          employeeTitle: userData.employeeTitle || (userData.role === 'admin' ? 'Administrator' : 'Employee'),
          token,
        };
        if (user.role === 'admin' || user.role === 'employee') {
          localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(user));
        } else {
          localStorage.setItem(CUSTOMER_AUTH_KEY, JSON.stringify(user));
        }
        return user;
      }
    } catch (err) {
      console.warn('Failed to refresh /auth/me profile:', err);
    }
    return null;
  }
};
