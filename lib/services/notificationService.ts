import { apiClient } from '../apiClient';
import { orderService } from './orderService';
import { productService } from './productService';
import { AdminOrder } from '../types/admin';

export interface AdminNotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  timestamp: number;
  type: 'order' | 'stock' | 'customer';
  link: string;
  iconType: 'order' | 'stock' | 'customer' | 'custom';
  color: string;
  isRead: boolean;
}

const READ_NOTIFS_KEY = 'jj_admin_read_notifs';

function getReadIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(READ_NOTIFS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function formatTimeAgo(dateString?: string): string {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Recently';

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return 'Just now';

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Just now';

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

export const notificationService = {
  getReadIds,

  markAsRead: (id: string): string[] => {
    if (typeof window === 'undefined') return [];
    const current = getReadIds();
    if (!current.includes(id)) {
      const updated = [...current, id];
      localStorage.setItem(READ_NOTIFS_KEY, JSON.stringify(updated));
      return updated;
    }
    return current;
  },

  markAllAsRead: (ids: string[]): string[] => {
    if (typeof window === 'undefined') return [];
    const current = getReadIds();
    const merged = Array.from(new Set([...current, ...ids]));
    localStorage.setItem(READ_NOTIFS_KEY, JSON.stringify(merged));
    return merged;
  },

  clearReadHistory: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(READ_NOTIFS_KEY);
  },

  getRealNotifications: async (): Promise<AdminNotificationItem[]> => {
    const readIds = getReadIds();
    const notifs: AdminNotificationItem[] = [];

    // 1. Fetch Real Orders from Backend
    try {
      const orders = await orderService.fetchOrdersAsync();
      const validOrders = Array.isArray(orders) ? orders : [];

      // Sort newest orders first
      const sortedOrders = [...validOrders].sort((a, b) => {
        const timeA = new Date(a.date || 0).getTime();
        const timeB = new Date(b.date || 0).getTime();
        return timeB - timeA;
      });

      // Take latest 10 orders
      sortedOrders.slice(0, 10).forEach((order) => {
        const orderIdClean = (order.id || '').replace('#', '');
        const hasCustomPrinting = order.items?.some(
          (item: any) => (item.customName && item.customName.trim()) || (item.customNumber && item.customNumber.trim())
        );

        const customItem = order.items?.find((item: any) => item.customName || item.customNumber);
        const orderDateStr = order.date || (order.timeline?.[0]?.timestamp) || undefined;
        const timeLabel = formatTimeAgo(orderDateStr);
        const orderTimestamp = orderDateStr ? new Date(orderDateStr).getTime() : Date.now();

        if (hasCustomPrinting && customItem) {
          notifs.push({
            id: `order-custom-${orderIdClean}`,
            title: `Custom Print Order ${order.id}`,
            desc: `${order.customerName} ordered "${customItem.customName || ''}" #${customItem.customNumber || ''} on ${customItem.name} (₹${(order.totalAmount || 0).toLocaleString('en-IN')})`,
            time: timeLabel,
            timestamp: orderTimestamp,
            type: 'order',
            link: `/admin/orders/${orderIdClean}`,
            iconType: 'custom',
            color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
            isRead: readIds.includes(`order-custom-${orderIdClean}`),
          });
        } else {
          notifs.push({
            id: `order-${orderIdClean}`,
            title: `Order ${order.id} • ${order.orderStatus || 'Confirmed'}`,
            desc: `${order.customerName} placed order for ₹${(order.totalAmount || 0).toLocaleString('en-IN')} via ${order.paymentMethod || 'COD'}`,
            time: timeLabel,
            timestamp: orderTimestamp,
            type: 'order',
            link: `/admin/orders/${orderIdClean}`,
            iconType: 'order',
            color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
            isRead: readIds.includes(`order-${orderIdClean}`),
          });
        }
      });
    } catch (err) {
      console.error('Error compiling order notifications:', err);
    }

    // 2. Fetch Real Inventory Alerts from Backend Products
    try {
      const products = await productService.getAdminProducts();
      const validProducts = Array.isArray(products) ? products : [];

      validProducts.forEach((prod) => {
        const prodStock = Number(prod.stock) || 0;
        const prodId = prod.id || prod.slug;

        if (prodStock <= 0 || prod.status === 'Out of Stock') {
          notifs.push({
            id: `stock-out-${prodId}`,
            title: `Out of Stock: ${prod.name}`,
            desc: `Stock is 0 units across all sizes. Please restock inventory.`,
            time: 'Urgent',
            timestamp: Date.now(),
            type: 'stock',
            link: `/admin/products/${prodId}`,
            iconType: 'stock',
            color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
            isRead: readIds.includes(`stock-out-${prodId}`),
          });
        } else if (prodStock > 0 && prodStock <= 5) {
          notifs.push({
            id: `stock-low-${prodId}`,
            title: `Low Stock Alert`,
            desc: `${prod.name} has only ${prodStock} units left in stock.`,
            time: 'Alert',
            timestamp: Date.now() - 3600000,
            type: 'stock',
            link: `/admin/products/${prodId}`,
            iconType: 'stock',
            color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
            isRead: readIds.includes(`stock-low-${prodId}`),
          });
        }
      });
    } catch (err) {
      console.error('Error compiling product stock notifications:', err);
    }

    // 3. Fetch Real Registered Customers from Backend
    try {
      const res = await apiClient.get('/auth/users');
      if (res.success && Array.isArray(res.data)) {
        res.data.slice(0, 5).forEach((u: any) => {
          const userId = u._id || u.id;
          const userTime = u.createdAt ? formatTimeAgo(u.createdAt) : 'Recent';
          const userTimestamp = u.createdAt ? new Date(u.createdAt).getTime() : Date.now();

          notifs.push({
            id: `user-${userId}`,
            title: `New Customer Registered`,
            desc: `${u.name || 'User'} (${u.email}) joined Jersey Junction.`,
            time: userTime,
            timestamp: userTimestamp,
            type: 'customer',
            link: '/admin/customers',
            iconType: 'customer',
            color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
            isRead: readIds.includes(`user-${userId}`),
          });
        });
      }
    } catch (err) {
      console.error('Error compiling customer notifications:', err);
    }

    // Sort notifications: unread first, then by timestamp descending
    return notifs.sort((a, b) => {
      if (a.isRead !== b.isRead) {
        return a.isRead ? 1 : -1;
      }
      return b.timestamp - a.timestamp;
    });
  },
};
