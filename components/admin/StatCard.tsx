'use client';

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  subtitle
}) => {
  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg relative overflow-hidden font-sans group hover:border-amber-400/40 transition-all">
      {/* Subtle background glow */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-400/5 rounded-full blur-2xl group-hover:bg-amber-400/10 transition-all" />

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{title}</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">{value}</div>
        </div>

        <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 shadow-sm shrink-0">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(change || subtitle) && (
        <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
          {change && (
            <div className={`flex items-center gap-1 font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{change}</span>
            </div>
          )}
          {subtitle && (
            <span className="text-zinc-500 font-medium text-[11px] ml-auto">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
};
