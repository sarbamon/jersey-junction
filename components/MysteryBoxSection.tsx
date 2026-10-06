'use client';

import React, { useState } from 'react';
import { Gift, Sparkles, Check, Flame, Trophy, ShieldAlert, ArrowRight } from 'lucide-react';
import { Currency, JerseyProduct, VersionType, PatchOption } from '../types';

interface MysteryBoxSectionProps {
  activeCurrency: Currency;
  onAddToCart: (
    product: JerseyProduct,
    size: string,
    version: VersionType,
    customName: string,
    customNumber: string,
    patches: PatchOption[]
  ) => void;
}

export const MysteryBoxSection: React.FC<MysteryBoxSectionProps> = ({
  activeCurrency,
  onAddToCart
}) => {
  const [selectedTier, setSelectedTier] = useState<'standard' | 'vip' | 'retro'>('standard');
  const [selectedSize, setSelectedSize] = useState('L');
  const [excludedTeams, setExcludedTeams] = useState('');
  const [isOpening, setIsOpening] = useState(false);

  const tiers = [
    {
      id: 'standard',
      name: 'Standard Mystery Kit',
      price: 49.99,
      origPrice: 85.00,
      badge: 'POPULAR CHOICE',
      description: '1x Authentic 2024/25 League Jersey + Match Day Sticker Pack',
      color: 'from-purple-900 to-indigo-950 border-purple-500/50'
    },
    {
      id: 'vip',
      name: 'VIP Match Issue Box',
      price: 69.99,
      origPrice: 110.00,
      badge: 'HIGH VALUE',
      description: '1x Player Edition Match Kit + Official Team Scarf + Custom Name Badge',
      color: 'from-amber-900/60 to-zinc-950 border-amber-500/50'
    },
    {
      id: 'retro',
      name: 'Retro Classic Mystery Box',
      price: 89.99,
      origPrice: 140.00,
      badge: 'RARE COLLECTOR',
      description: '1x Vintage Retro Legend Kit (1980s - 2000s era) + Collector Postcard',
      color: 'from-emerald-900/60 to-zinc-950 border-emerald-500/50'
    }
  ];

  const currentTier = tiers.find((t) => t.id === selectedTier)!;
  const convertedPrice = (currentTier.price * activeCurrency.rate).toFixed(2);

  const handleBuyMystery = () => {
    setIsOpening(true);

    setTimeout(() => {
      setIsOpening(false);
      const mysteryProduct: JerseyProduct = {
        id: `mystery-box-${selectedTier}-${Date.now()}`,
        name: `Jersey Junction ${currentTier.name}`,
        slug: `mystery-box-${selectedTier}`,
        team: 'Surprise Team',
        league: 'Global Leagues',
        sport: 'mystery',
        season: 'Current & Classic',
        price: currentTier.price,
        originalPrice: currentTier.origPrice,
        rating: 5.0,
        reviewCount: 940,
        colors: {
          primary: selectedTier === 'retro' ? '#009c3b' : '#7c3aed',
          secondary: '#000000',
          accent: '#f59e0b',
          text: '#ffffff'
        },
        pattern: 'retro-wave',
        sponsorText: 'MYSTERY SPOT',
        crestIcon: 'gift',
        availableSizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
        defaultName: 'MYSTERY',
        defaultNumber: '7',
        description: `Surprise Mystery Box (${currentTier.name}). Excluded Teams: ${excludedTeams || 'None'}`,
        details: [
          'Guaranteed authentic jersey worth more than the box price',
          'Excluded teams strictly respected',
          'Includes bonus collectibles'
        ],
        availablePatches: [],
        tags: ['Mystery Box']
      };

      onAddToCart(
        mysteryProduct,
        selectedSize,
        'Fan Version (Standard Fit)',
        'MYSTERY',
        '7',
        []
      );
    }, 1200);
  };

  return (
    <section className="py-16 bg-gradient-to-b from-zinc-950 via-purple-950/20 to-zinc-950 border-b border-zinc-800 relative overflow-hidden">
      <div className="container mx-auto px-4">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold uppercase tracking-widest">
            <Gift className="w-4 h-4" />
            <span>THE ULTIMATE FAN UNBOXING</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white font-mono uppercase tracking-tight">
            JERSEY JUNCTION <span className="text-purple-400">MYSTERY BOX</span>
          </h2>
          <p className="text-sm text-zinc-400">
            Choose your size, list rival teams to exclude, and unbox a high-tier official football or retro jersey worth up to $140!
          </p>
        </div>

        {/* 3 Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-8">
          {tiers.map((t) => {
            const isSelected = selectedTier === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setSelectedTier(t.id as any)}
                className={`p-6 rounded-3xl border bg-gradient-to-b ${t.color} cursor-pointer transition-all duration-300 relative flex flex-col justify-between ${
                  isSelected ? 'ring-2 ring-purple-400 scale-105 shadow-2xl' : 'opacity-80 hover:opacity-100'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-purple-400 text-zinc-950 uppercase">
                      {t.badge}
                    </span>
                    {isSelected && <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1">{t.name}</h3>
                  <p className="text-xs text-zinc-300 mb-4">{t.description}</p>
                </div>

                <div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-black text-white font-mono">
                      {activeCurrency.symbol}{(t.price * activeCurrency.rate).toFixed(2)}
                    </span>
                    <span className="text-xs text-zinc-400 line-through">
                      {activeCurrency.symbol}{(t.origPrice * activeCurrency.rate).toFixed(2)}
                    </span>
                  </div>

                  <div className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase text-center transition-colors ${
                    isSelected ? 'bg-purple-400 text-zinc-950' : 'bg-zinc-800 text-zinc-300'
                  }`}>
                    {isSelected ? 'SELECTED TIER' : 'SELECT TIER'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Customization Options Bar */}
        <div className="max-w-3xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase block mb-1">
                Choose Size
              </label>
              <div className="flex gap-1.5">
                {['S', 'M', 'L', 'XL', '2XL', '3XL'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`flex-1 py-2 text-xs font-extrabold rounded-lg border transition-all ${
                      selectedSize === size
                        ? 'bg-purple-500 text-white border-purple-400'
                        : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-750'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase block mb-1">
                Teams to Exclude (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. No Real Madrid, No Chelsea"
                value={excludedTeams}
                onChange={(e) => setExcludedTeams(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          <button
            onClick={handleBuyMystery}
            disabled={isOpening}
            className="w-full py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-xl flex items-center justify-center gap-2 hover:scale-[1.01] transition-all disabled:opacity-50"
          >
            {isOpening ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin text-amber-400" />
                <span>PACKING YOUR MYSTERY KIT...</span>
              </>
            ) : (
              <>
                <Gift className="w-5 h-5" />
                <span>ADD {currentTier.name.toUpperCase()} TO CART ({activeCurrency.symbol}{convertedPrice})</span>
              </>
            )}
          </button>
        </div>

      </div>
    </section>
  );
};
