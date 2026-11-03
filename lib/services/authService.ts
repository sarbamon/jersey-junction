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
  isBanned?: boolean;
  status?: string;
  banReason?: string;
}

const ADMIN_AUTH_KEY = 'jj_admin_auth_user';
const ADMIN_TOKEN_KEY = 'jj_admin_token';
const CUSTOMER_AUTH_KEY = 'jj_customer_user';
const CUSTOMER_TOKEN_KEY = 'jj_customer_token';

export const authService = {
  // Admin & Staff Login
  login: async (email: string, pass: string): Promise<AuthUser> => {
    const res = await apiClient.post('/auth/login', {
      email: (email || '').trim().toLowerCase(),
      password: (pass || '').trim(),
    });

    if (!res.success || !res.token) {
      throw new Error(res.error || 'Invalid email or password');
    }

    if (res.user && res.user.role !== 'admin' && res.user.role !== 'employee') {
      throw new Error('Access denied: Staff / Administrator privileges required.');
    }

    const user: AuthUser = {
      id: res.user?.id || res.user?._id,
      email: res.user?.email || email.trim(),
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
    const res = await apiClient.post('/auth/login', {
      email: (email || '').trim().toLowerCase(),
      password: (pass || '').trim(),
    });

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

  // Send 6-digit verification code to customer email for signup
  sendSignupOtp: async (data: { name: string; email: string; password: string; phone?: string }): Promise<{ success: boolean; message?: string }> => {
    const res = await apiClient.post('/auth/register-send-otp', data);
    if (!res.success) {
      throw new Error(res.error || res.message || 'Failed to send verification code. Please try again.');
    }
    return { success: true, message: res.message };
  },

  // Verify 6-digit code and create customer account
  verifySignupOtp: async (email: string, otp: string): Promise<AuthUser> => {
    const res = await apiClient.post('/auth/register-verify-otp', {
      email: (email || '').trim().toLowerCase(),
      otp: (otp || '').trim(),
    });

    if (!res.success || !res.token) {
      throw new Error(res.error || 'Verification failed. Please check the code.');
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

  // Resend fresh 6-digit verification code
  resendSignupOtp: async (email: string): Promise<{ success: boolean; message?: string }> => {
    const res = await apiClient.post('/auth/register-resend-otp', {
      email: (email || '').trim().toLowerCase(),
    });

    if (!res.success) {
      throw new Error(res.error || res.message || 'Failed to resend code');
    }

    return { success: true, message: res.message };
  },

  // Customer Register (Direct / legacy creation)
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

  // Change Password for currently authenticated user/admin/employee
  changePassword: async (currentOrNewPassword: string, optionalNewPassword?: string): Promise<{ success: boolean; message?: string }> => {
    let currentPassword = '';
    let newPassword = '';
    if (optionalNewPassword !== undefined) {
      currentPassword = currentOrNewPassword;
      newPassword = optionalNewPassword;
    } else {
      newPassword = currentOrNewPassword;
    }
    const res = await apiClient.put('/auth/change-password', {
      newPassword: (newPassword || '').trim(),
      ...(currentPassword ? { currentPassword: currentPassword.trim() } : {}),
    });
    if (!res.success) {
      throw new Error(res.error || 'Failed to update password');
    }
    return { success: true, message: res.message || 'Password updated successfully!' };
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
    if (authService.hasPermission('employees')) return '/admin/employees';

    return '/admin';
  },

  updateProfile: async (data: { name?: string; phone?: string }): Promise<AuthUser> => {
    const res = await apiClient.put<{ user: any; message: string }>('/auth/profile', data);
    if (!res.success) {
      throw new Error(res.error || res.message || 'Failed to update profile');
    }
    const userData = res.user || res.data?.user;
    if (typeof window !== 'undefined' && userData) {
      const stored = localStorage.getItem('jj_user');
      const prev = stored ? JSON.parse(stored) : {};
      const updated = {
        ...prev,
        name: userData.name || prev.name,
        phone: userData.phone !== undefined ? userData.phone : prev.phone,
      };
      localStorage.setItem('jj_user', JSON.stringify(updated));
    }
    return userData;
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
          isBanned: Boolean(userData.isBanned || userData.status === 'Banned'),
          status: userData.status,
          banReason: userData.banReason || '',
        };

        if (user.role === 'user' && user.isBanned) {
          localStorage.removeItem(CUSTOMER_TOKEN_KEY);
          localStorage.removeItem(CUSTOMER_AUTH_KEY);
          localStorage.removeItem('jj_user');
          if (typeof window !== 'undefined') {
            const reason = user.banReason || 'Violation of Store Terms & Conditions';
            window.dispatchEvent(new CustomEvent('jj_customer_banned', { detail: { reason } }));
          }
          return null;
        }
        if (user.role === 'admin' || user.role === 'employee') {
          localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(user));
        } else {
          localStorage.setItem(CUSTOMER_AUTH_KEY, JSON.stringify(user));
        }
        return user;
      }

      if (!res.success && (res.error?.includes('Suspended') || res.error?.includes('suspended') || res.error?.includes('Banned') || (res as any).isBanned)) {
        localStorage.removeItem(CUSTOMER_TOKEN_KEY);
        localStorage.removeItem(CUSTOMER_AUTH_KEY);
        localStorage.removeItem('jj_user');
        if (typeof window !== 'undefined') {
          const reason = res.error || 'Violation of Store Terms & Conditions';
          window.dispatchEvent(new CustomEvent('jj_customer_banned', { detail: { reason } }));
        }
        return null;
      }
    } catch (err) {
      console.warn('Failed to refresh /auth/me profile:', err);
    }
    return null;
  }
};
