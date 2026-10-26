'use client';

import React, { useEffect, useRef, useState } from 'react';
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  WheelEvent as ReactWheelEvent,
} from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

interface ProductImageZoomProps {
  images: string[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  productName: string;
}

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const ProductImageZoom: React.FC<ProductImageZoomProps> = ({
  images,
  selectedIndex,
  onSelectIndex,
  productName,
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [mousePos, setMousePos] = useState<Position>({ x: 0, y: 0 });
  const [containerRect, setContainerRect] = useState<Size>({
    width: 450,
    height: 420,
  });

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [lightboxPan, setLightboxPan] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const lightboxStageRef = useRef<HTMLDivElement>(null);

  const safeSelectedIndex = clamp(selectedIndex, 0, Math.max(images.length - 1, 0));
  const currentImage = images[safeSelectedIndex] || '';

  const LENS_SIZE = 140;
  const ZOOM_WINDOW_SIZE = 500;
  const FLYOUT_ZOOM = 3;
  const MAX_ZOOM = 4;
  const MIN_ZOOM = 1;
  const ZOOM_STEP = 0.5;

  const lensX = clamp(
    mousePos.x - LENS_SIZE / 2,
    0,
    Math.max(0, containerRect.width - LENS_SIZE),
  );

  const lensY = clamp(
    mousePos.y - LENS_SIZE / 2,
    0,
    Math.max(0, containerRect.height - LENS_SIZE),
  );

  const xPercent =
    containerRect.width > 0
      ? clamp((mousePos.x / containerRect.width) * 100, 0, 100)
      : 50;

  const yPercent =
    containerRect.height > 0
      ? clamp((mousePos.y / containerRect.height) * 100, 0, 100)
      : 50;

  const resetLightboxView = () => {
    setLightboxZoom(1);
    setLightboxPan({ x: 0, y: 0 });
    setIsDragging(false);
  };

  const openLightbox = () => {
    resetLightboxView();
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    resetLightboxView();
  };

  const selectLightboxImage = (index: number) => {
    onSelectIndex(index);
    resetLightboxView();
  };

  const goToPreviousImage = () => {
    if (images.length <= 1) return;

    const previousIndex =
      safeSelectedIndex === 0 ? images.length - 1 : safeSelectedIndex - 1;

    selectLightboxImage(previousIndex);
  };

  const goToNextImage = () => {
    if (images.length <= 1) return;

    const nextIndex =
      safeSelectedIndex === images.length - 1 ? 0 : safeSelectedIndex + 1;

    selectLightboxImage(nextIndex);
  };

  const updateContainerRect = () => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    setContainerRect({
      width: rect.width,
      height: rect.height,
    });
  };

  const handleMouseEnter = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    setContainerRect({
      width: rect.width,
      height: rect.height,
    });

    setMousePos({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });

    setIsHovering(true);
  };

  const handleMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    setMousePos({
      x: clamp(event.clientX - rect.left, 0, rect.width),
      y: clamp(event.clientY - rect.top, 0, rect.height),
    });
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const handleZoomIn = (event?: ReactMouseEvent<HTMLButtonElement>) => {
    event?.stopPropagation();

    setLightboxZoom((previous) => clamp(previous + ZOOM_STEP, MIN_ZOOM, MAX_ZOOM));
  };

  const handleZoomOut = (event?: ReactMouseEvent<HTMLButtonElement>) => {
    event?.stopPropagation();

    setLightboxZoom((previous) => {
      const nextZoom = clamp(previous - ZOOM_STEP, MIN_ZOOM, MAX_ZOOM);

      if (nextZoom === MIN_ZOOM) {
        setLightboxPan({ x: 0, y: 0 });
      }

      return nextZoom;
    });
  };

  const handleResetZoom = (event?: ReactMouseEvent<HTMLButtonElement>) => {
    event?.stopPropagation();
    resetLightboxView();
  };

  const getPanLimit = () => {
    if (!lightboxStageRef.current || lightboxZoom <= 1) {
      return { x: 0, y: 0 };
    }

    const rect = lightboxStageRef.current.getBoundingClientRect();

    return {
      x: Math.max(0, (rect.width * (lightboxZoom - 1)) / 2),
      y: Math.max(0, (rect.height * (lightboxZoom - 1)) / 2),
    };
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (lightboxZoom <= 1) return;

    event.currentTarget.setPointerCapture(event.pointerId);

    setIsDragging(true);
    setDragStart({
      x: event.clientX - lightboxPan.x,
      y: event.clientY - lightboxPan.y,
    });
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging || lightboxZoom <= 1) return;

    const panLimit = getPanLimit();
    const nextX = event.clientX - dragStart.x;
    const nextY = event.clientY - dragStart.y;

    setLightboxPan({
      x: clamp(nextX, -panLimit.x, panLimit.x),
      y: clamp(nextY, -panLimit.y, panLimit.y),
    });
  };

  const stopDragging = () => {
    setIsDragging(false);
  };

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (event.deltaY < 0) {
      setLightboxZoom((previous) =>
        clamp(previous + ZOOM_STEP, MIN_ZOOM, MAX_ZOOM),
      );
    } else {
      setLightboxZoom((previous) => {
        const nextZoom = clamp(previous - ZOOM_STEP, MIN_ZOOM, MAX_ZOOM);

        if (nextZoom === MIN_ZOOM) {
          setLightboxPan({ x: 0, y: 0 });
        }

        return nextZoom;
      });
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isLightboxOpen) return;

      if (event.key === 'Escape') {
        closeLightbox();
      }

      if (event.key === 'ArrowLeft' && images.length > 1) {
        goToPreviousImage();
      }

      if (event.key === 'ArrowRight' && images.length > 1) {
        goToNextImage();
      }

      if (event.key === '+' || event.key === '=') {
        setLightboxZoom((previous) =>
          clamp(previous + ZOOM_STEP, MIN_ZOOM, MAX_ZOOM),
        );
      }

      if (event.key === '-') {
        setLightboxZoom((previous) => {
          const nextZoom = clamp(previous - ZOOM_STEP, MIN_ZOOM, MAX_ZOOM);

          if (nextZoom === MIN_ZOOM) {
            setLightboxPan({ x: 0, y: 0 });
          }

          return nextZoom;
        });
      }
    };

    if (isLightboxOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen, images.length, safeSelectedIndex]);

  useEffect(() => {
    if (!containerRef.current) return;

    updateContainerRect();

    const resizeObserver = new ResizeObserver(() => {
      updateContainerRect();
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  if (images.length === 0) {
    return (
      <div className="flex h-72 w-full items-center justify-center rounded-2xl border border-[#282828] bg-[#121212] text-sm text-gray-400 sm:h-[420px]">
        No product image available
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onClick={openLightbox}
        className="group relative flex h-72 w-full cursor-crosshair select-none items-center justify-center overflow-hidden rounded-2xl bg-transparent sm:h-[420px]"
      >
        {currentImage && (
          <img
            src={currentImage}
            alt={`${productName} view ${safeSelectedIndex + 1}`}
            className="pointer-events-none h-full w-full object-contain drop-shadow-2xl"
            draggable={false}
          />
        )}

        {isHovering && currentImage && (
          <div
            style={{
              left: `${lensX}px`,
              top: `${lensY}px`,
              width: `${LENS_SIZE}px`,
              height: `${LENS_SIZE}px`,
            }}
            className="pointer-events-none absolute z-20 hidden rounded-xl border-2 border-[#f4c84a] bg-[#f4c84a]/20 shadow-[0_0_20px_rgba(244,200,74,0.4)] backdrop-brightness-110 lg:block"
          />
        )}

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            openLightbox();
          }}
          className="absolute right-3 top-3 z-20 cursor-pointer rounded-full border border-[#333] bg-black/75 p-2 text-gray-300 opacity-80 shadow-md transition-all hover:border-[#f4c84a] hover:bg-black hover:text-white group-hover:opacity-100"
          aria-label="Expand image"
          title="Fullscreen inspector"
        >
          <Maximize2 className="h-4 w-4 text-[#f4c84a]" />
        </button>
      </div>

      {isHovering && currentImage && (
        <div
          style={{
            width: `${ZOOM_WINDOW_SIZE}px`,
            height: `${ZOOM_WINDOW_SIZE}px`,
          }}
          className="pointer-events-none absolute left-[calc(100%+24px)] top-0 z-[60] hidden overflow-hidden rounded-2xl border-2 border-[#2f2f2f] bg-[#0c0c0c] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.98)] lg:block"
          aria-hidden="true"
        >
          <div
            className="absolute inset-0 bg-no-repeat"
            style={{
              backgroundImage: `url("${currentImage}")`,
              backgroundSize: `${FLYOUT_ZOOM * 100}%`,
              backgroundPosition: `${xPercent}% ${yPercent}%`,
            }}
          />
        </div>
      )}

      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${productName} image gallery`}
          className="fixed inset-0 z-[9999] flex select-none flex-col justify-between bg-black/95 p-4 backdrop-blur-lg sm:p-6"
        >
          <div className="z-20 flex items-center justify-between gap-3 pb-2">
            <div className="min-w-0 space-y-0.5">
              <h3 className="truncate font-serif text-sm font-bold uppercase tracking-wider text-white sm:text-base">
                {productName}
              </h3>
              <p className="text-xs text-gray-400">
                Photo {safeSelectedIndex + 1} of {images.length} • Fabric &amp; Detail
                Zoom
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1 rounded-2xl border border-[#282828] bg-[#121212] p-1.5 shadow-xl sm:gap-2">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={lightboxZoom <= MIN_ZOOM}
                className="cursor-pointer rounded-xl p-2 text-gray-300 transition-colors hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                aria-label="Zoom out"
                title="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>

              <span className="min-w-[50px] px-2 text-center font-mono text-xs font-bold text-[#f4c84a]">
                {Math.round(lightboxZoom * 100)}%
              </span>

              <button
                type="button"
                onClick={handleZoomIn}
                disabled={lightboxZoom >= MAX_ZOOM}
                className="cursor-pointer rounded-xl p-2 text-gray-300 transition-colors hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                aria-label="Zoom in"
                title="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={handleResetZoom}
                className="cursor-pointer rounded-xl p-2 text-gray-400 transition-colors hover:bg-zinc-800 hover:text-white"
                aria-label="Reset zoom"
                title="Reset zoom"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              <div className="mx-1 h-6 w-px bg-[#333]" />

              <button
                type="button"
                onClick={closeLightbox}
                className="cursor-pointer rounded-xl border border-red-500/30 bg-red-500/10 p-2 text-red-400 transition-colors hover:bg-red-500/20"
                aria-label="Close image gallery"
                title="Close (Escape)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div
            ref={lightboxStageRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={stopDragging}
            onPointerCancel={stopDragging}
            onPointerLeave={stopDragging}
            onWheel={handleWheel}
            onClick={() => {
              if (lightboxZoom === 1) {
                setLightboxZoom(1.5);
              }
            }}
            className={`relative my-2 flex flex-1 items-center justify-center overflow-hidden ${lightboxZoom > 1
              ? isDragging
                ? 'cursor-grabbing'
                : 'cursor-grab'
              : 'cursor-zoom-in'
              }`}
          >
            {images.length > 1 && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  goToPreviousImage();
                }}
                className="absolute left-2 z-20 cursor-pointer rounded-full border border-[#333] bg-black/80 p-3 text-[#f4c84a] shadow-2xl transition-all hover:scale-110 hover:border-[#f4c84a] hover:bg-black sm:left-6"
                aria-label="Previous image"
                title="Previous photo"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {images.length > 1 && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  goToNextImage();
                }}
                className="absolute right-2 z-20 cursor-pointer rounded-full border border-[#333] bg-black/80 p-3 text-[#f4c84a] shadow-2xl transition-all hover:scale-110 hover:border-[#f4c84a] hover:bg-black sm:right-6"
                aria-label="Next image"
                title="Next photo"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}

            <div
              style={{
                transform: `translate(${lightboxPan.x}px, ${lightboxPan.y}px) scale(${lightboxZoom})`,
                transition: isDragging ? 'none' : 'transform 0.2s ease-out',
              }}
              className="pointer-events-none flex max-h-[75vh] max-w-[90vw] select-none items-center justify-center"
            >
              <img
                src={currentImage}
                alt={`${productName} view ${safeSelectedIndex + 1}`}
                className="max-h-[72vh] max-w-[85vw] object-contain drop-shadow-2xl"
                draggable={false}
              />
            </div>
          </div>

          {images.length > 1 && (
            <div className="z-20 flex items-center justify-center gap-3 overflow-x-auto py-2">
              {images.map((imageUrl, index) => (
                <button
                  key={`${imageUrl}-${index}`}
                  type="button"
                  onClick={() => selectLightboxImage(index)}
                  className={`flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center rounded-xl border bg-[#121212] p-1 transition-all sm:h-20 sm:w-20 ${safeSelectedIndex === index
                    ? 'scale-105 border-[#f4c84a] ring-2 ring-[#f4c84a]/50'
                    : 'border-[#282828] opacity-60 hover:border-gray-500 hover:opacity-100'
                    }`}
                  aria-label={`View image ${index + 1}`}
                  aria-current={safeSelectedIndex === index ? 'true' : undefined}
                  title={`View angle ${index + 1}`}
                >
                  <img
                    src={imageUrl}
                    alt={`${productName} thumbnail ${index + 1}`}
                    className="h-full w-full rounded-lg object-contain"
                    draggable={false}
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
