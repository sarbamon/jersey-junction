'use client';

import React, { useState, useRef, useEffect, MouseEvent } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw 
} from 'lucide-react';

interface ProductImageZoomProps {
  images: string[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  productName: string;
}

export const ProductImageZoom: React.FC<ProductImageZoomProps> = ({
  images,
  selectedIndex,
  onSelectIndex,
  productName,
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [containerRect, setContainerRect] = useState({ width: 450, height: 420 });

  // Lightbox modal state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [lightboxPan, setLightboxPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const currentImage = images[selectedIndex] || '';

  // Amazon Zoom Lens & Flyout Math
  const LENS_SIZE = 140; // Size of cursor lens in px
  const ZOOM_WINDOW_SIZE = 500; // Size of floating side zoom window in px
  const ZOOM_SCALE = ZOOM_WINDOW_SIZE / LENS_SIZE; // ~3.57x magnification

  const lensX = Math.max(0, Math.min(containerRect.width - LENS_SIZE, mousePos.x - LENS_SIZE / 2));
  const lensY = Math.max(0, Math.min(containerRect.height - LENS_SIZE, mousePos.y - LENS_SIZE / 2));

  const handleMouseEnter = (e: MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setContainerRect({ width: rect.width, height: rect.height });
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
    setIsHovering(true);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setContainerRect({ width: rect.width, height: rect.height });
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
        setLightboxZoom(1);
        setLightboxPan({ x: 0, y: 0 });
      } else if (e.key === 'ArrowLeft' && images.length > 1 && isLightboxOpen) {
        onSelectIndex((selectedIndex === 0 ? images.length - 1 : selectedIndex - 1));
      } else if (e.key === 'ArrowRight' && images.length > 1 && isLightboxOpen) {
        onSelectIndex((selectedIndex === images.length - 1 ? 0 : selectedIndex + 1));
      }
    };

    if (isLightboxOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen, selectedIndex, images.length, onSelectIndex]);

  // Lightbox Pan Handlers
  const handleLightboxMouseDown = (e: MouseEvent) => {
    if (lightboxZoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - lightboxPan.x, y: e.clientY - lightboxPan.y });
  };

  const handleLightboxMouseMove = (e: MouseEvent) => {
    if (!isDragging || lightboxZoom <= 1) return;
    setLightboxPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleLightboxMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLightboxZoom((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLightboxZoom((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setLightboxPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLightboxZoom(1);
    setLightboxPan({ x: 0, y: 0 });
  };

  return (
    <div className="relative w-full">
      {/* Main Image Container */}
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onClick={() => {
          setIsLightboxOpen(true);
          setLightboxZoom(1);
          setLightboxPan({ x: 0, y: 0 });
        }}
        className="relative w-full h-72 sm:h-[420px] flex items-center justify-center overflow-hidden rounded-2xl cursor-crosshair select-none bg-transparent group"
      >
        {currentImage && (
          <img
            src={currentImage}
            alt={`${productName} view ${selectedIndex + 1}`}
            className="h-full w-full object-contain pointer-events-none drop-shadow-2xl"
          />
        )}

        {/* Amazon-style Magnifier Lens (visible on desktop hover) */}
        {isHovering && currentImage && (
          <div
            style={{
              left: `${lensX}px`,
              top: `${lensY}px`,
              width: `${LENS_SIZE}px`,
              height: `${LENS_SIZE}px`,
            }}
            className="hidden lg:block absolute pointer-events-none border-2 border-[#f4c84a] bg-[#f4c84a]/20 shadow-[0_0_20px_rgba(244,200,74,0.4)] rounded-xl backdrop-brightness-110 z-20"
          />
        )}

        {/* Maximize Icon on Top Right */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsLightboxOpen(true);
            setLightboxZoom(1);
            setLightboxPan({ x: 0, y: 0 });
          }}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/75 hover:bg-black text-gray-300 hover:text-white border border-[#333] hover:border-[#f4c84a] transition-all opacity-80 group-hover:opacity-100 shadow-md cursor-pointer"
          aria-label="Expand image"
          title="Fullscreen Inspector"
        >
          <Maximize2 className="w-4 h-4 text-[#f4c84a]" />
        </button>
      </div>

      {/* Amazon-Style Floating Side Zoom Window (Desktop Only) */}
      {isHovering && currentImage && (
        <div
          style={{
            width: `${ZOOM_WINDOW_SIZE}px`,
            height: `${ZOOM_WINDOW_SIZE}px`,
          }}
          className="hidden lg:block absolute left-[calc(100%+24px)] top-0 z-[60] bg-[#0c0c0c] border-2 border-[#2f2f2f] rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.98)] overflow-hidden pointer-events-none animate-in fade-in duration-150"
        >
          {/* Magnified High-Resolution Image Canvas */}
          <div
            style={{
              position: 'absolute',
              left: `-${lensX * ZOOM_SCALE}px`,
              top: `-${lensY * ZOOM_SCALE}px`,
              width: `${containerRect.width * ZOOM_SCALE}px`,
              height: `${containerRect.height * ZOOM_SCALE}px`,
            }}
            className="flex items-center justify-center pointer-events-none"
          >
            <img
              src={currentImage}
              alt={`${productName} magnified detail`}
              className="w-full h-full object-contain pointer-events-none drop-shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Modal (Click to open) */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-lg flex flex-col justify-between p-4 sm:p-6 select-none animate-in fade-in duration-200"
          onMouseMove={handleLightboxMouseMove}
          onMouseUp={handleLightboxMouseUp}
        >
          {/* Top Bar: Title & Controls */}
          <div className="flex items-center justify-between z-20 pb-2">
            <div className="space-y-0.5">
              <h3 className="text-white font-serif font-bold text-sm sm:text-base uppercase tracking-wider">
                {productName}
              </h3>
              <p className="text-gray-400 text-xs">
                Photo {selectedIndex + 1} of {images.length} • Fabric &amp; Detail Zoom
              </p>
            </div>

            {/* Controls Bar */}
            <div className="flex items-center gap-2 bg-[#121212] border border-[#282828] rounded-2xl p-1.5 shadow-xl">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={lightboxZoom <= 1}
                className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <span className="font-mono text-xs font-bold text-[#f4c84a] px-2 min-w-[50px] text-center">
                {Math.round(lightboxZoom * 100)}%
              </span>

              <button
                type="button"
                onClick={handleZoomIn}
                disabled={lightboxZoom >= 4}
                className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleResetZoom}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <div className="w-[1px] h-6 bg-[#333] mx-1" />

              <button
                type="button"
                onClick={() => {
                  setIsLightboxOpen(false);
                  setLightboxZoom(1);
                  setLightboxPan({ x: 0, y: 0 });
                }}
                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Center Stage: Interactive Zoomable Image Canvas */}
          <div 
            className={`relative flex-1 flex items-center justify-center overflow-hidden my-2 ${
              lightboxZoom > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
            }`}
            onMouseDown={handleLightboxMouseDown}
            onWheel={(e) => {
              if (e.deltaY < 0) {
                handleZoomIn();
              } else {
                handleZoomOut();
              }
            }}
            onClick={() => {
              if (lightboxZoom === 1) handleZoomIn();
            }}
          >
            {/* Previous Image Arrow */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1);
                  setLightboxPan({ x: 0, y: 0 });
                }}
                className="absolute left-2 sm:left-6 z-20 p-3 rounded-full bg-black/80 hover:bg-black text-[#f4c84a] border border-[#333] hover:border-[#f4c84a] transition-all hover:scale-110 shadow-2xl cursor-pointer"
                title="Previous photo"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Next Image Arrow */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1);
                  setLightboxPan({ x: 0, y: 0 });
                }}
                className="absolute right-2 sm:right-6 z-20 p-3 rounded-full bg-black/80 hover:bg-black text-[#f4c84a] border border-[#333] hover:border-[#f4c84a] transition-all hover:scale-110 shadow-2xl cursor-pointer"
                title="Next photo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Zoomed / Panned Image */}
            <div
              style={{
                transform: `translate(${lightboxPan.x}px, ${lightboxPan.y}px) scale(${lightboxZoom})`,
                transition: isDragging ? 'none' : 'transform 0.2s ease-out',
              }}
              className="max-w-[90vw] max-h-[75vh] flex items-center justify-center pointer-events-none select-none"
            >
              <img
                src={currentImage}
                alt={productName}
                className="max-h-[72vh] max-w-[85vw] object-contain drop-shadow-2xl"
                draggable={false}
              />
            </div>
          </div>

          {/* Bottom Bar: Thumbnails Strip */}
          {images.length > 1 && (
            <div className="flex items-center justify-center gap-3 overflow-x-auto py-2 z-20">
              {images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onSelectIndex(idx);
                    setLightboxPan({ x: 0, y: 0 });
                  }}
                  className={`h-16 w-16 sm:h-20 sm:w-20 rounded-xl border p-1 bg-[#121212] transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                    selectedIndex === idx
                      ? 'border-[#f4c84a] scale-105 ring-2 ring-[#f4c84a]/50'
                      : 'border-[#282828] opacity-60 hover:opacity-100 hover:border-gray-500'
                  }`}
                  title={`View angle ${idx + 1}`}
                >
                  <img
                    src={imgUrl}
                    alt={`Thumb ${idx + 1}`}
                    className="w-full h-full object-contain rounded-lg"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
