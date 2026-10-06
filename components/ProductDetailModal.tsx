'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, 
  Star, 
  Check, 
  ShieldCheck, 
  Truck, 
  RotateCw, 
  Ruler, 
  ShoppingBag, 
  Sparkles, 
  Heart,
  MessageSquare,
  ThumbsUp
} from 'lucide-react';
import { JerseyViewerSVG } from './JerseyViewerSVG';
import { JerseyProduct, Currency, VersionType, PatchOption } from '../types';
import { AVAILABLE_PATCHES, REVIEWS } from '../data/jerseys';

interface ProductDetailModalProps {
  product: JerseyProduct | null;
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
  onOpenSizeGuide: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  activeCurrency,
  onAddToCart,
  onOpenSizeGuide
}) => {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState('L');
  const [selectedVersion, setSelectedVersion] = useState<VersionType>('Player Edition (Slim Fit)');
  const [printOption, setPrintOption] = useState<'blank' | 'preset' | 'custom'>('preset');
  const [customName, setCustomName] = useState(product?.defaultName || '');
  const [customNumber, setCustomNumber] = useState(product?.defaultNumber || '');
  const [selectedPatches, setSelectedPatches] = useState<PatchOption[]>([]);
  const [view, setView] = useState<'back' | 'front'>('back');
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  if (!isOpen || !product) return null;

  const versionExtra = selectedVersion.includes('Player') ? 15 : 0;
  const patchesExtra = selectedPatches.reduce((acc, p) => acc + p.price, 0);
  const printExtra = printOption === 'blank' ? 0 : 5;

  const finalUnitPriceUSD = product.price + versionExtra + patchesExtra + printExtra;
  const finalUnitPriceConverted = (finalUnitPriceUSD * activeCurrency.rate).toFixed(2);

  const handleTogglePatch = (patch: PatchOption) => {
    if (selectedPatches.some((p) => p.id === patch.id)) {
      setSelectedPatches(selectedPatches.filter((p) => p.id !== patch.id));
    } else {
      setSelectedPatches([...selectedPatches, patch]);
    }
  };

  const handleAddToCart = () => {
    onAddToCart(
      product,
      selectedSize,
      selectedVersion,
      '',
      '',
      []
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl my-8 flex flex-col max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="bg-amber-400 text-zinc-950 text-xs font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
              {product.league}
            </span>
            <h2 className="text-lg font-bold text-white truncate max-w-md">
              {product.name} ({product.season})
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900 hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
          
          {/* Left Visualizer Canvas */}
          <div className="lg:col-span-5 bg-gradient-to-b from-zinc-950 to-zinc-900 p-6 flex flex-col justify-between items-center border-r border-zinc-800">
            <div className="w-full flex justify-between items-center">
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{product.rating} ({product.reviewCount} Reviews)</span>
              </div>
            </div>

            <div className="py-6 my-auto flex justify-center items-center w-full">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-64 sm:h-80 w-full object-contain drop-shadow-2xl rounded-xl"
                />
              ) : (
                <JerseyViewerSVG
                  primaryColor={product.colors.primary}
                  secondaryColor={product.colors.secondary}
                  accentColor={product.colors.accent}
                  textColor={product.colors.text}
                  pattern={product.pattern}
                  sponsorText={product.sponsorText}
                  name={product.defaultName || ''}
                  number={product.defaultNumber || ''}
                  view={view}
                  patchNames={[]}
                  height={330}
                />
              )}
            </div>

            {/* Description note */}
            <div className="w-full bg-zinc-950/80 p-3 rounded-xl border border-zinc-800 text-center text-xs text-zinc-400">
              {product.description}
            </div>
          </div>

          {/* Right Selection Panel */}
          <div className="lg:col-span-7 p-6 space-y-6 overflow-y-auto">
            
            {/* Price Header */}
            <div className="flex justify-between items-end border-b border-zinc-800/80 pb-4">
              <div>
                <span className="text-xs text-zinc-400 font-semibold uppercase block">Official Kit Price</span>
                <div className="text-3xl font-black text-amber-400 font-mono">
                  {activeCurrency.symbol}{Math.round(product.price * activeCurrency.rate)}
                </div>
              </div>
            </div>

            {/* Size Selector */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Select Size
                </label>
                <button
                  onClick={onOpenSizeGuide}
                  className="flex items-center gap-1 text-xs text-amber-400 hover:underline font-semibold"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size Guide & Chart</span>
                </button>
              </div>

              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                {product.availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2.5 text-xs font-black rounded-xl border transition-all ${
                      selectedSize === size
                        ? 'bg-amber-400 text-zinc-950 border-amber-400 shadow-md scale-105'
                        : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-750'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Specs & Reviews Tabs */}
            <div>
              <div className="flex border-b border-zinc-800 gap-4 mb-3">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`pb-2 text-xs font-bold transition-all border-b-2 ${
                    activeTab === 'details'
                      ? 'border-amber-400 text-amber-400'
                      : 'border-transparent text-zinc-400 hover:text-white'
                  }`}
                >
                  Kit Specifications
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-2 text-xs font-bold transition-all border-b-2 ${
                    activeTab === 'reviews'
                      ? 'border-amber-400 text-amber-400'
                      : 'border-transparent text-zinc-400 hover:text-white'
                  }`}
                >
                  Verified Reviews ({REVIEWS.length})
                </button>
              </div>

              {activeTab === 'details' ? (
                <ul className="space-y-1.5 text-xs text-zinc-300">
                  {product.details.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                  {REVIEWS.map((rev) => (
                    <div key={rev.id} className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800 text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">{rev.userName}</span>
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-zinc-300">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Footer Add To Cart Action */}
        <div className="px-6 py-4 bg-zinc-950 border-t border-zinc-800 flex justify-between items-center">
          <div>
            <span className="text-xs text-zinc-400">Subtotal</span>
            <div className="text-2xl font-black text-amber-400 font-mono">
              {activeCurrency.symbol}{finalUnitPriceConverted}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black px-8 py-3.5 rounded-xl text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:scale-105 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add To Cart</span>
          </button>
        </div>

      </div>
    </div>
  );
};
