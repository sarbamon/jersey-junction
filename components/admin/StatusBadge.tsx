'use client';

import React from 'react';
import { OrderStatus, PaymentStatus, ProductStatus } from '../../lib/types/admin';

interface StatusBadgeProps {
  status: OrderStatus | PaymentStatus | ProductStatus | string;
  type?: 'order' | 'payment' | 'product' | 'general';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'general' }) => {
  let style = 'bg-zinc-800 text-zinc-300 border-zinc-700';

  // Order statuses: Order Received, Order Processed, In Transit, Out for Delivery, Delivered, Cancelled
  if (status === 'Delivered' || status === 'Paid' || status === 'Active' || status === 'Approved') {
    style = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  } else if (status === 'Out for Delivery' || status === 'In Transit' || status === 'Shipped') {
    style = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
  } else if (status === 'Order Processed' || status === 'Order Received' || status === 'Processing' || status === 'Packed' || status === 'Pending' || status === 'Confirmed') {
    style = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  } else if (status === 'Cancelled' || status === 'Failed' || status === 'Out of Stock' || status === 'Rejected') {
    style = 'bg-red-500/10 text-red-400 border-red-500/30';
  } else if (status === 'COD' || status === 'Draft' || status === 'Disabled') {
    style = 'bg-purple-500/10 text-purple-400 border-purple-500/30';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${style} whitespace-nowrap`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      <span>{status}</span>
    </span>
  );
};
