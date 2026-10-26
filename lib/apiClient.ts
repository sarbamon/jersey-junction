import { serverStatusService } from './services/serverStatusService';

const getNormalizedApiUrl = (): string => {
  const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const cleanUrl = rawUrl.trim().replace(/\/+$/, '');
  if (cleanUrl.endsWith('/api')) {
    return cleanUrl;
  }
  return `${cleanUrl}/api`;
};

const API_BASE_URL = getNormalizedApiUrl();

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  count?: number;
  total?: number;
  error?: string;
  message?: string;
  token?: string;
  user?: any;
}

const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  const isDashboardRoute = window.location.pathname.startsWith('/admin');
  if (isDashboardRoute) {
    const adminToken = localStorage.getItem('jj_admin_token');
    if (adminToken) return adminToken;
  }
  const customerToken = localStorage.getItem('jj_customer_token');
  if (customerToken) return customerToken;
  const adminToken = localStorage.getItem('jj_admin_token');
  if (adminToken) return adminToken;
  return null;
};

async function request<T = any>(endpoint: string, options: RequestInit = {}, retries = 2): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const token = getAuthToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutMs = endpoint.includes('/admin/all') ? 20000 : 15000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const signal = options.signal || controller.signal;

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      ...options,
      signal,
      headers,
      credentials: 'omit',
    });
    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status >= 500) {
        serverStatusService.reportError(null, response.status);
      }
      const errorMessage = data.error || data.message || `API error with status ${response.status}`;
      return {
        success: false,
        error: errorMessage,
      };
    }

    serverStatusService.reportSuccess();

    return {
      success: true,
      ...data,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);

    // Auto-retry if network drop/error and retries remain
    if (retries > 0 && error.name !== 'AbortError') {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return request<T>(endpoint, options, retries - 1);
    }

    serverStatusService.reportError(error);

    return {
      success: false,
      error: error.name === 'AbortError' ? '' : (error.message || 'Network error'),
    };
  }
}

export const apiClient = {
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { method: 'GET', ...options }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }),

  put: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body), ...options }),

  patch: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body), ...options }),

  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { method: 'DELETE', ...options }),
};
