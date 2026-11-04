'use client';

import React from 'react';
import { X, ShoppingBag, Tag } from 'lucide-react';
import { AdminOrder } from '../../lib/types/admin';
import { OrderProductImage } from '../OrderProductImage';

interface OrderProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: AdminOrder | null;
}

export const OrderProductsModal: React.FC<OrderProductsModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  if (!isOpen || !order) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden text-slate-900 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif uppercase tracking-tight text-slate-900">
                Ordered Products ({order.items.length})
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Order <span className="text-amber-600 font-bold">#{order.id.replace('#', '')}</span> &bull; {order.customerName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Products List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5 divide-y divide-slate-100">
          {order.items.map((item, idx) => {
            const lineTotal = (item.unitPrice || 0) * (item.quantity || 1);
            return (
              <div key={idx} className="pt-3.5 first:pt-0 flex items-start gap-3.5">
                {/* Product Thumbnail */}
                <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                  <OrderProductImage
                    src={item.image}
                    name={item.name}
                    productId={item.productId}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    {item.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-500">
                    <span>Size: <strong className="text-slate-800 font-bold">{item.size}</strong></span>
                    <span>&bull;</span>
                    <span>Qty: <strong className="text-slate-800 font-bold">{item.quantity}</strong></span>
                    <span>&bull;</span>
                    <span className="text-slate-600">₹{item.unitPrice} each</span>
                  </div>

                  {item.version && (
                    <div className="text-[10px] text-slate-500 font-mono">
                      Edition: <span className="text-slate-800 font-medium">{item.version}</span>
                    </div>
                  )}

                  {/* Customization Printing Tag */}
                  {(item.customName || item.customNumber) && (
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-mono font-bold uppercase tracking-wider mt-1">
                      <span>★ PRINT:</span>
                      <span className="text-slate-900">{item.customName || 'NAME'}</span>
                      <span>#{item.customNumber || '00'}</span>
                    </div>
                  )}
                </div>

                {/* Line Total */}
                <div className="text-right shrink-0 font-mono font-extrabold text-slate-900 text-xs sm:text-sm">
                  ₹{lineTotal.toLocaleString('en-IN')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Financial Summary Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/80 text-xs font-mono space-y-1.5 shrink-0">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span className="text-slate-900 font-semibold">₹{order.subtotal?.toLocaleString('en-IN') || order.totalAmount?.toLocaleString('en-IN')}</span>
          </div>

          {(order.discountAmount > 0 || order.couponCode) && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                <span>Coupon ({order.couponCode || 'APPLIED'}):</span>
              </span>
              <span>-₹{order.discountAmount}</span>
            </div>
          )}

          {order.shippingFee !== undefined && (
            <div className="flex justify-between text-slate-600">
              <span>Shipping:</span>
              <span className="text-slate-900 font-semibold">{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span>
            </div>
          )}

          <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
            <span className="font-serif uppercase tracking-wider text-amber-600">Total Order Amount:</span>
            <span className="font-mono text-slate-900 font-extrabold text-base">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
