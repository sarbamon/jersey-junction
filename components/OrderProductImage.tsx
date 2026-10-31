'use client';

import React, { useState, useEffect } from 'react';
import { productService, sanitizeValidImageUrl } from '../lib/services/productService';

interface OrderProductImageProps {
  src?: string;
  name?: string;
  productId?: string;
  className?: string;
  alt?: string;
}

/**
 * Bulletproof Product Thumbnail for Order History, Order Details, Wishlist & Checkout.
 * - Prevents broken image icons and alt-text overflowing.
 * - Filters out dead ephemeral Hostinger container /uploads/ URLs.
 * - Automatically falls back to current catalog product image if available.
 * - Gracefully falls back to Jersey Junction official kit SVG placeholder on any image load error.
 */
export function OrderProductImage({
  src,
  name = '',
  productId,
  className = 'w-full h-full object-cover',
  alt,
}: OrderProductImageProps) {
  const resolveInitialSrc = (): string => {
    const clean = sanitizeValidImageUrl(src);
    if (clean) return clean;

    // Check catalog cache for an active product image
    try {
      const cached = productService.getCachedProductsSync();
      if (Array.isArray(cached) && cached.length > 0) {
        const found = cached.find((p) => {
          if (productId && (p.id === productId || (p as any)._id === productId)) return true;
          if (name && p.name && p.name.trim().toLowerCase() === name.trim().toLowerCase()) return true;
          return false;
        });
        if (found?.image) {
          const cleanFound = sanitizeValidImageUrl(found.image);
          if (cleanFound) return cleanFound;
        }
      }
    } catch {
      // safe fallback
    }

    return '/placeholder-jersey.svg';
  };

  const [imgSrc, setImgSrc] = useState<string>(resolveInitialSrc);
  const [hasError, setHasError] = useState<boolean>(false);

  // If props change, re-evaluate
  useEffect(() => {
    setImgSrc(resolveInitialSrc());
    setHasError(false);
  }, [src, productId, name]);

  const handleError = () => {
    if (hasError) return;
    setHasError(true);

    // If initial source failed, try catalog image before final SVG placeholder
    try {
      const cached = productService.getCachedProductsSync();
      const found = cached?.find((p) => {
        if (productId && (p.id === productId || (p as any)._id === productId)) return true;
        if (name && p.name && p.name.trim().toLowerCase() === name.trim().toLowerCase()) return true;
        return false;
      });
      const catalogImg = sanitizeValidImageUrl(found?.image);
      if (catalogImg && catalogImg !== imgSrc) {
        setImgSrc(catalogImg);
        return;
      }
    } catch {
      // safe fallback
    }

    setImgSrc('/placeholder-jersey.svg');
  };

  return (
    <img
      src={imgSrc}
      alt={alt || name || 'Jersey Product'}
      className={className}
      loading="lazy"
      decoding="async"
      onError={handleError}
    />
  );
}

export default OrderProductImage;
