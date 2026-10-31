'use client';

import React, { useState, useEffect } from 'react';
import { X, Ruler } from 'lucide-react';
import { settingsService } from '../lib/services/settingsService';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  sizeChartImage?: string;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose, sizeChartImage: propImage }) => {
  const [sizeChartImage, setSizeChartImage] = useState<string>(propImage || '');

  useEffect(() => {
    if (propImage) {
      setSizeChartImage(propImage);
      return;
    }
    const current = settingsService.getSettings();
    if (current?.sizeChartImage) {
      setSizeChartImage(current.sizeChartImage);
    }
    settingsService.fetchSettingsAsync().then((latest) => {
      if (latest?.sizeChartImage) {
        setSizeChartImage(latest.sizeChartImage);
      }
    });

    const handleUpdate = (e: any) => {
      const updated = e.detail || settingsService.getSettings();
      if (updated?.sizeChartImage) {
        setSizeChartImage(updated.sizeChartImage);
      }
    };

    window.addEventListener('jj_store_settings_updated', handleUpdate);
    return () => window.removeEventListener('jj_store_settings_updated', handleUpdate);
  }, [propImage]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/85 backdrop-blur-md">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-5 sm:p-7 space-y-6">
        
        <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white font-mono uppercase tracking-wide">
              SIZE CHART
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Admin Size Chart Picture */}
        {sizeChartImage ? (
          <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-black p-2 shadow-inner flex items-center justify-center">
            <img
              src={sizeChartImage}
              alt="Jersey Size Chart"
              className="w-full h-auto max-h-[65vh] object-contain rounded-xl"
            />
          </div>
        ) : (
          /* Fallback table if no image uploaded yet */
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
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
              <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/40">
                <tr className="hover:bg-zinc-800/40">
                  <td className="py-2.5 px-3 font-bold text-white">S</td>
                  <td className="py-2.5 px-3">35 - 37.5&quot;</td>
                  <td className="py-2.5 px-3">28&quot;</td>
                  <td className="py-2.5 px-3">5&apos;5&quot; - 5&apos;7&quot;</td>
                  <td className="py-2.5 px-3">120 - 140 lbs</td>
                </tr>
                <tr className="hover:bg-zinc-800/40">
                  <td className="py-2.5 px-3 font-bold text-white">M</td>
                  <td className="py-2.5 px-3">37.5 - 41&quot;</td>
                  <td className="py-2.5 px-3">29&quot;</td>
                  <td className="py-2.5 px-3">5&apos;8&quot; - 5&apos;10&quot;</td>
                  <td className="py-2.5 px-3">140 - 165 lbs</td>
                </tr>
                <tr className="hover:bg-zinc-800/40 bg-amber-400/5">
                  <td className="py-2.5 px-3 font-bold text-amber-400">L (Most Popular)</td>
                  <td className="py-2.5 px-3">41 - 44&quot;</td>
                  <td className="py-2.5 px-3">30&quot;</td>
                  <td className="py-2.5 px-3">5&apos;10&quot; - 6&apos;0&quot;</td>
                  <td className="py-2.5 px-3">165 - 190 lbs</td>
                </tr>
                <tr className="hover:bg-zinc-800/40">
                  <td className="py-2.5 px-3 font-bold text-white">XL</td>
                  <td className="py-2.5 px-3">44 - 48.5&quot;</td>
                  <td className="py-2.5 px-3">31&quot;</td>
                  <td className="py-2.5 px-3">6&apos;0&quot; - 6&apos;2&quot;</td>
                  <td className="py-2.5 px-3">190 - 215 lbs</td>
                </tr>
                <tr className="hover:bg-zinc-800/40">
                  <td className="py-2.5 px-3 font-bold text-white">2XL</td>
                  <td className="py-2.5 px-3">48.5 - 53.5&quot;</td>
                  <td className="py-2.5 px-3">32&quot;</td>
                  <td className="py-2.5 px-3">6&apos;2&quot;+</td>
                  <td className="py-2.5 px-3">215 - 240 lbs</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Note at bottom */}
        <div className="pt-2 border-t border-zinc-800/60 text-center">
          <p className="text-xs text-zinc-400 font-medium leading-relaxed">
            We recommend sizing UP if you prefer a looser casual fit for player version.
          </p>
        </div>

      </div>
    </div>
  );
};
