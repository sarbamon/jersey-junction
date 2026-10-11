import { apiClient } from '../apiClient';

export interface AuthUser {
  id?: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  token: string;
}

const AUTH_STORAGE_KEY = 'jj_admin_auth_user';
const TOKEN_STORAGE_KEY = 'jj_admin_token';
const CUSTOMER_AUTH_KEY = 'jj_customer_user';

export const authService = {
  // Admin Login
  login: async (email: string, pass: string): Promise<AuthUser> => {
    const res = await apiClient.post('/auth/login', { email, password: pass });

    if (!res.success || !res.token) {
      throw new Error(res.error || 'Invalid email or password');
    }

    if (res.user && res.user.role !== 'admin') {
      throw new Error('Access denied: Admin privileges required to access this portal.');
    }

    const user: AuthUser = {
      id: res.user?.id || res.user?._id,
      email: res.user?.email || email,
      name: res.user?.name || 'Admin',
      role: res.user?.role || 'admin',
      token: res.token,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
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
      token: res.token,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(CUSTOMER_AUTH_KEY, JSON.stringify(user));
      localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
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
      token: res.token,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(CUSTOMER_AUTH_KEY, JSON.stringify(user));
      localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
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
      token: res.token,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(CUSTOMER_AUTH_KEY, JSON.stringify(user));
      localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
    }

    return user;
  },

  logout: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(CUSTOMER_AUTH_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    apiClient.get('/auth/logout').catch(() => {});
  },

  getCurrentUser: (): AuthUser | null => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem(CUSTOMER_AUTH_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const user = authService.getCurrentUser();
    return Boolean(token && user && user.role === 'admin');
  },

  fetchMe: async (): Promise<AuthUser | null> => {
    const res = await apiClient.get('/auth/me');
    if (res.success && res.data) {
      const user: AuthUser = {
        id: res.data._id || res.data.id,
        email: res.data.email,
        name: res.data.name,
        role: res.data.role,
        token: localStorage.getItem(TOKEN_STORAGE_KEY) || '',
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      }
      return user;
    }
    return null;
  }
};
