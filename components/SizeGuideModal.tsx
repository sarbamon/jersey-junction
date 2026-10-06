'use client';

import React from 'react';
import { X, Ruler, Check } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl p-6 space-y-6">
        
        <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white font-mono uppercase">
              OFFICIAL SIZE & FIT GUIDE
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player vs Fan Fit Explainer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800 space-y-1">
            <strong className="text-amber-400 font-bold block text-sm">⚡ Player Edition (Slim Fit)</strong>
            <p className="text-zinc-400">
              Identical to match-worn jerseys. Tailored athletic slim fit. We recommend sizing UP if you prefer a looser casual fit.
            </p>
          </div>

          <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800 space-y-1">
            <strong className="text-white font-bold block text-sm">👕 Fan Replica (Standard Fit)</strong>
            <p className="text-zinc-400">
              Designed for everyday comfortable street wear. True to standard t-shirt sizes.
            </p>
          </div>
        </div>

        {/* Size Chart Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-zinc-300">
            <thead className="bg-zinc-950 text-amber-400 font-bold uppercase text-[11px] border-b border-zinc-800">
              <tr>
                <th className="py-2.5 px-3">Size</th>
                <th className="py-2.5 px-3">Chest (Inches)</th>
                <th className="py-2.5 px-3">Length (Inches)</th>
                <th className="py-2.5 px-3">Height Rec.</th>
                <th className="py-2.5 px-3">Weight Rec.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              <tr className="hover:bg-zinc-800/40">
                <td className="py-2 px-3 font-bold text-white">S</td>
                <td className="py-2 px-3">35 - 37.5&quot;</td>
                <td className="py-2 px-3">28&quot;</td>
                <td className="py-2 px-3">5&apos;5&quot; - 5&apos;7&quot;</td>
                <td className="py-2 px-3">120 - 140 lbs</td>
              </tr>
              <tr className="hover:bg-zinc-800/40">
                <td className="py-2 px-3 font-bold text-white">M</td>
                <td className="py-2 px-3">37.5 - 41&quot;</td>
                <td className="py-2 px-3">29&quot;</td>
                <td className="py-2 px-3">5&apos;8&quot; - 5&apos;10&quot;</td>
                <td className="py-2 px-3">140 - 165 lbs</td>
              </tr>
              <tr className="hover:bg-zinc-800/40 bg-amber-400/5">
                <td className="py-2 px-3 font-bold text-amber-400">L (Most Popular)</td>
                <td className="py-2 px-3">41 - 44&quot;</td>
                <td className="py-2 px-3">30&quot;</td>
                <td className="py-2 px-3">5&apos;10&quot; - 6&apos;0&quot;</td>
                <td className="py-2 px-3">165 - 190 lbs</td>
              </tr>
              <tr className="hover:bg-zinc-800/40">
                <td className="py-2 px-3 font-bold text-white">XL</td>
                <td className="py-2 px-3">44 - 48.5&quot;</td>
                <td className="py-2 px-3">31&quot;</td>
                <td className="py-2 px-3">6&apos;0&quot; - 6&apos;2&quot;</td>
                <td className="py-2 px-3">190 - 215 lbs</td>
              </tr>
              <tr className="hover:bg-zinc-800/40">
                <td className="py-2 px-3 font-bold text-white">2XL</td>
                <td className="py-2 px-3">48.5 - 53.5&quot;</td>
                <td className="py-2 px-3">32&quot;</td>
                <td className="py-2 px-3">6&apos;2&quot;+</td>
                <td className="py-2 px-3">215 - 240 lbs</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};
