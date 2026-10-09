'use client';

import React from 'react';
import { Check, Clock, PackageCheck, Truck, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { OrderStatus, TimelineEvent } from '../../lib/types/admin';

interface OrderTimelineProps {
  currentStatus: OrderStatus;
  timeline: TimelineEvent[];
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ currentStatus, timeline }) => {
  const steps: { status: OrderStatus; label: string; icon: any }[] = [
    { status: 'Pending', label: 'Order Placed', icon: Clock },
    { status: 'Confirmed', label: 'Confirmed', icon: Check },
    { status: 'Processing', label: 'Processing', icon: PackageCheck },
    { status: 'Packed', label: 'Packed', icon: PackageCheck },
    { status: 'Shipped', label: 'Shipped', icon: Truck },
    { status: 'Out for Delivery', label: 'Out for Delivery', icon: MapPin },
    { status: 'Delivered', label: 'Delivered', icon: CheckCircle2 }
  ];

  if (currentStatus === 'Cancelled' || currentStatus === 'Returned') {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-bold">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span>This order was {currentStatus.toLowerCase()}. No further shipping milestones available.</span>
      </div>
    );
  }

  const currentIndex = steps.findIndex(s => s.status === currentStatus);

  return (
    <div className="py-4 font-sans">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isDone = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const matchedEvent = timeline.find(t => t.status === step.status);

          return (
            <div 
              key={step.status}
              className={`p-3 rounded-2xl border transition-all text-center space-y-1.5 ${
                isCurrent 
                  ? 'bg-amber-400/10 border-amber-400/50 text-amber-400 ring-2 ring-amber-400/20' 
                  : (isDone 
                      ? 'bg-zinc-900 border-zinc-700 text-zinc-200' 
                      : 'bg-zinc-950 border-zinc-800 text-zinc-600 opacity-60')
              }`}
            >
              <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-xs ${
                isCurrent
                  ? 'bg-amber-400 text-black shadow-md'
                  : (isDone ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-500')
              }`}>
                <Icon className="w-4 h-4" />
              </div>

              <div className="font-bold text-xs uppercase tracking-tight leading-tight">
                {step.label}
              </div>

              {matchedEvent ? (
                <div className="text-[10px] text-zinc-400 font-mono">
                  {matchedEvent.timestamp.split(' ')[1] || matchedEvent.timestamp}
                </div>
              ) : (
                <div className="text-[10px] text-zinc-600">Pending</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
