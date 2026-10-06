'use client';

import React, { useState } from 'react';
import { Sparkles, X, RotateCw, Check, ShoppingBag, ShieldAlert, Award } from 'lucide-react';
import { JerseyViewerSVG } from './JerseyViewerSVG';
import { JerseyProduct, Currency, VersionType, PatchOption } from '../types';
import { AVAILABLE_PATCHES } from '../data/jerseys';

interface CustomJerseyStudioProps {
  isOpen: boolean;
  onClose: () => void;
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

export const CustomJerseyStudio: React.FC<CustomJerseyStudioProps> = ({
  isOpen,
  onClose,
  activeCurrency,
  onAddToCart
}) => {
  const [primaryColor, setPrimaryColor] = useState('#09152b');
  const [secondaryColor, setSecondaryColor] = useState('#ffffff');
  const [accentColor, setAccentColor] = useState('#c5a059');
  const [textColor, setTextColor] = useState('#ffffff');
  const [pattern, setPattern] = useState<'stripes' | 'solid' | 'hoops' | 'sash' | 'gradient' | 'retro-wave'>('stripes');
  const [sponsorText, setSponsorText] = useState('JERSEY JUNCTION');
  const [customName, setCustomName] = useState('LEGEND');
  const [customNumber, setCustomNumber] = useState('10');
  const [view, setView] = useState<'front' | 'back'>('back');
  const [selectedSize, setSelectedSize] = useState('L');
  const [selectedVersion, setSelectedVersion] = useState<VersionType>('Player Edition (Slim Fit)');
  const [selectedPatches, setSelectedPatches] = useState<PatchOption[]>([AVAILABLE_PATCHES[0]]);

  if (!isOpen) return null;

  const basePrice = selectedVersion.includes('Player') ? 94.99 : 79.99;
  const patchesPrice = selectedPatches.reduce((acc, p) => acc + p.price, 0);
  const totalPrice = (basePrice + patchesPrice) * activeCurrency.rate;

  const presetColors = [
    { label: 'Real Madrid White/Gold', p: '#ffffff', s: '#09152b', a: '#c5a059', t: '#09152b' },
    { label: 'Barca Blaugrana', p: '#a50044', s: '#004d98', a: '#edbb00', t: '#ffffff' },
    { label: 'Inter Miami Pink', p: '#f7b5cd', s: '#101820', a: '#f7b5cd', t: '#101820' },
    { label: 'Lakers Black Mamba', p: '#1c1917', s: '#fdb927', a: '#552583', t: '#fdb927' },
    { label: 'Bulls Legend Red', p: '#ce1141', s: '#000000', a: '#ffffff', t: '#ffffff' },
    { label: 'Argentina Albiceleste', p: '#75aadb', s: '#ffffff', a: '#f6b40e', t: '#111827' },
  ];

  const handleTogglePatch = (patch: PatchOption) => {
    if (selectedPatches.some((p) => p.id === patch.id)) {
      setSelectedPatches(selectedPatches.filter((p) => p.id !== patch.id));
    } else {
      setSelectedPatches([...selectedPatches, patch]);
    }
  };

  const handleSaveAndAdd = () => {
    const customProduct: JerseyProduct = {
      id: `custom-kit-${Date.now()}`,
      name: `Custom ${pattern.toUpperCase()} Kit (${customName} #${customNumber})`,
      slug: `custom-kit-${customName}`,
      team: 'Custom Created',
      league: 'Personalized Lab',
      sport: 'custom',
      season: '2024/25',
      price: basePrice,
      rating: 5.0,
      reviewCount: 1,
      colors: {
        primary: primaryColor,
        secondary: secondaryColor,
        accent: accentColor,
        text: textColor
      },
      pattern: pattern,
      sponsorText: sponsorText,
      crestIcon: 'shield',
      availableSizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
      defaultName: customName,
      defaultNumber: customNumber,
      description: 'Bespoke custom jersey handcrafted in the Jersey Junction Custom Printing Studio.',
      details: [
        'Custom high-density thermo-flex official number printing',
        'Selected sleeve patch application',
        'Breathable athletic moisture-wicking fabric',
        '100% Quality Inspected before dispatch'
      ],
      availablePatches: AVAILABLE_PATCHES,
      tags: ['Custom', customName]
    };

    onAddToCart(
      customProduct,
      selectedSize,
      selectedVersion,
      customName,
      customNumber,
      selectedPatches
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl my-8 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-zinc-950" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white font-mono uppercase tracking-tight">
                CUSTOM JERSEY STUDIO & PRINTING LAB
              </h2>
              <p className="text-xs text-zinc-400">Design your own kit with live 3D preview & official font printing</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900 hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
          
          {/* Left Canvas Preview Area */}
          <div className="lg:col-span-5 bg-gradient-to-b from-zinc-950 to-zinc-900 p-6 flex flex-col justify-between items-center border-r border-zinc-800 relative">
            <div className="w-full flex justify-between items-center">
              <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                LIVE INTERACTIVE PREVIEW
              </span>
              <button
                onClick={() => setView(view === 'back' ? 'front' : 'back')}
                className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs text-white font-bold px-3 py-1.5 rounded-lg border border-zinc-700"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>FLIP TO {view === 'back' ? 'FRONT' : 'BACK'}</span>
              </button>
            </div>

            <div className="py-6 my-auto">
              <JerseyViewerSVG
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                accentColor={accentColor}
                textColor={textColor}
                pattern={pattern}
                sponsorText={sponsorText}
                name={customName}
                number={customNumber}
                view={view}
                patchNames={selectedPatches.map(p => p.name)}
                height={320}
              />
            </div>

            <div className="w-full bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80 text-center text-xs text-zinc-400">
              ⚡ Live Font rendering with 3D drop shadow simulation
            </div>
          </div>

          {/* Right Controls Area */}
          <div className="lg:col-span-7 p-6 space-y-6 overflow-y-auto">
            
            {/* Presets */}
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                1. Quick Color Themes
              </label>
              <div className="flex flex-wrap gap-2">
                {presetColors.map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setPrimaryColor(preset.p);
                      setSecondaryColor(preset.s);
                      setAccentColor(preset.a);
                      setTextColor(preset.t);
                    }}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 flex items-center gap-1.5"
                  >
                    <span className="w-3 h-3 rounded-full border border-white/20" style={{ background: preset.p }}></span>
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Colors Picker */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Body Base</label>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-full h-9 rounded-lg bg-zinc-800 cursor-pointer border border-zinc-700 p-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Stripes / Collar</label>
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-full h-9 rounded-lg bg-zinc-800 cursor-pointer border border-zinc-700 p-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Trims & Crest</label>
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-full h-9 rounded-lg bg-zinc-800 cursor-pointer border border-zinc-700 p-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Number & Name</label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full h-9 rounded-lg bg-zinc-800 cursor-pointer border border-zinc-700 p-1"
                />
              </div>
            </div>

            {/* Pattern Selection */}
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                2. Jersey Pattern
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {(['stripes', 'solid', 'hoops', 'sash', 'retro-wave', 'gradient'] as const).map((pat) => (
                  <button
                    key={pat}
                    onClick={() => setPattern(pat)}
                    className={`p-2 text-xs font-bold rounded-xl border text-center capitalize transition-all ${
                      pattern === pat
                        ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md'
                        : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-750'
                    }`}
                  >
                    {pat.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Name & Number Input */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Back Name Printing
                </label>
                <input
                  type="text"
                  maxLength={12}
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value.toUpperCase())}
                  placeholder="NAME (e.g. MESSI)"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm font-bold text-white uppercase focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Number
                </label>
                <input
                  type="text"
                  maxLength={3}
                  value={customNumber}
                  onChange={(e) => setCustomNumber(e.target.value)}
                  placeholder="10"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm font-bold text-white uppercase focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Sponsor Text Input */}
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                Chest Sponsor Graphic
              </label>
              <input
                type="text"
                maxLength={20}
                value={sponsorText}
                onChange={(e) => setSponsorText(e.target.value)}
                placeholder="SPONSOR TEXT"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm font-semibold text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Size & Version */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Select Size
                </label>
                <div className="flex gap-1.5">
                  {['S', 'M', 'L', 'XL', '2XL', '3XL'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`flex-1 py-2 text-xs font-extrabold rounded-lg border transition-all ${
                        selectedSize === s
                          ? 'bg-amber-400 text-zinc-950 border-amber-400'
                          : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-750'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Fit Specification
                </label>
                <select
                  value={selectedVersion}
                  onChange={(e) => setSelectedVersion(e.target.value as VersionType)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-amber-400 focus:outline-none"
                >
                  <option value="Player Edition (Slim Fit)">Player Edition (Slim Fit - $94.99)</option>
                  <option value="Fan Version (Standard Fit)">Fan Version (Standard Fit - $79.99)</option>
                </select>
              </div>
            </div>

            {/* Sleeve Patches Option */}
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                Add Sleeve Badges & Patches
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AVAILABLE_PATCHES.slice(0, 4).map((patch) => {
                  const isChecked = selectedPatches.some((p) => p.id === patch.id);
                  return (
                    <div
                      key={patch.id}
                      onClick={() => handleTogglePatch(patch)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                        isChecked
                          ? 'bg-amber-500/10 border-amber-400 text-amber-300'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-750'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded flex items-center justify-center ${isChecked ? 'bg-amber-400 text-zinc-950' : 'border border-zinc-600'}`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span>{patch.name}</span>
                      </div>
                      <span className="font-bold text-amber-400">+${patch.price}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Footer Bar */}
        <div className="px-6 py-4 bg-zinc-950 border-t border-zinc-800 flex justify-between items-center">
          <div>
            <div className="text-xs text-zinc-400">Total Custom Kit Price</div>
            <div className="text-2xl font-black text-amber-400 font-mono">
              {activeCurrency.symbol}{totalPrice.toFixed(2)}
            </div>
          </div>

          <button
            onClick={handleSaveAndAdd}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black px-6 py-3 rounded-xl text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:scale-105 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add Custom Kit To Cart</span>
          </button>
        </div>

      </div>
    </div>
  );
};
