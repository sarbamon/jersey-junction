import { apiClient } from '../apiClient';

export interface Employee {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  role: 'employee';
  employeeTitle: string;
  permissions: string[];
  status: 'Active' | 'Suspended';
  createdAt?: string;
}

export interface SectionDefinition {
  id: string;
  label: string;
  description: string;
  href: string;
  category: 'catalog' | 'sales' | 'marketing' | 'system';
}

export const ADMIN_SECTIONS: SectionDefinition[] = [
  {
    id: 'products',
    label: 'Products Catalog',
    description: 'Create, edit, pricing, and stock inventory management',
    href: '/admin/products',
    category: 'catalog',
  },
  {
    id: 'orders',
    label: 'Orders & Shipping',
    description: 'Process customer orders, update delivery status, and iCarry courier dispatch',
    href: '/admin/orders',
    category: 'sales',
  },
  {
    id: 'categories',
    label: 'Categories Management',
    description: 'Create and organize sport collection categories',
    href: '/admin/categories',
    category: 'catalog',
  },
  {
    id: 'customers',
    label: 'Customers Directory',
    description: 'View customer accounts, registration info, and order histories',
    href: '/admin/customers',
    category: 'sales',
  },
  {
    id: 'coupons',
    label: 'Coupons & Discounts',
    description: 'Create discount codes, flash sale coupons, and percentage deals',
    href: '/admin/coupons',
    category: 'marketing',
  },
  {
    id: 'reviews',
    label: 'Customer Reviews',
    description: 'Moderate customer ratings, product feedback, and testimonials',
    href: '/admin/reviews',
    category: 'marketing',
  },
  {
    id: 'banners',
    label: 'Hero Banners CMS',
    description: 'Update storefront hero carousel slides and featured banners',
    href: '/admin/banners',
    category: 'marketing',
  },
  {
    id: 'settings',
    label: 'Store & Courier Settings',
    description: 'Configure warehouse dispatch hubs, iCarry API credentials, and store info',
    href: '/admin/settings',
    category: 'system',
  },
  {
    id: 'dashboard',
    label: 'Dashboard & Analytics',
    description: 'Access high-level sales revenue analytics and performance graphs',
    href: '/admin',
    category: 'system',
  },
];

export const employeeService = {
  getEmployees: async (): Promise<Employee[]> => {
    const res = await apiClient.get('/employees');
    if (res.success && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  },

  createEmployee: async (data: {
    name: string;
    email: string;
    password: string;
    employeeTitle: string;
    permissions: string[];
    phone?: string;
  }): Promise<Employee> => {
    const res = await apiClient.post('/employees', data);
    if (!res.success || !res.data) {
      throw new Error(res.error || 'Failed to create employee account');
    }
    return res.data;
  },

  updateEmployee: async (
    id: string,
    data: {
      name?: string;
      email?: string;
      password?: string;
      employeeTitle?: string;
      permissions?: string[];
      status?: 'Active' | 'Suspended';
      phone?: string;
    }
  ): Promise<Employee> => {
    const res = await apiClient.put(`/employees/${id}`, data);
    if (!res.success || !res.data) {
      throw new Error(res.error || 'Failed to update employee account');
    }
    return res.data;
  },

  deleteEmployee: async (id: string): Promise<void> => {
    const res = await apiClient.delete(`/employees/${id}`);
    if (!res.success) {
      throw new Error(res.error || 'Failed to delete employee account');
    }
  },
};
