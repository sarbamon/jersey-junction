'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { categoryService } from '../lib/services/categoryService';
import { AdminCategory } from '../lib/types/admin';
import { INITIAL_CATEGORIES } from '../lib/mock/categories';

interface CategoryGridProps {
  onSelectCategory?: (catId: string) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ onSelectCategory }) => {
  const [categories, setCategories] = useState<AdminCategory[]>(INITIAL_CATEGORIES);

  useEffect(() => {
    let isMounted = true;
    const syncCats = categoryService.getCategoriesSync().filter((c) => c.status === 'Active');
    if (syncCats.length > 0) setCategories(syncCats);
    categoryService.getActiveCategories().then((cats) => {
      if (isMounted && cats && cats.length > 0) setCategories(cats);
    });
    return () => { isMounted = false; };
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:py-16 sm:px-6 lg:px-8 border-b border-[#242424] dark:border-[#242424] light:border-slate-200">
      <div className="mb-6 sm:mb-10 text-left">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[hsl(16.9deg_39.66%_64.9%)]">Explore</p>
        <h2 className="mt-1 text-2xl sm:text-3xl font-black text-white dark:text-white light:text-black font-serif uppercase">Shop by Category</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {categories.map((cat) => {
          const catKey = cat.slug || cat.id;
          return (
            <Link
              key={cat.id || cat.slug}
              href={`/shop?category=${catKey}`}
              onClick={() => {
                if (onSelectCategory) onSelectCategory(catKey);
              }}
              className="group relative flex aspect-[16/10] sm:aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 p-3 sm:p-4 shadow-md cursor-pointer hover:border-[hsl(16.9deg_39.66%_64.9%)] transition-all hover:scale-[1.02]"
            >
              {/* Crisp, 100% bright, full-color category image - no dark black filter */}
              <img
                src={cat.image || '/placeholder-category.svg'}
                alt={cat.name}
                className="absolute inset-0 h-full w-full object-cover object-center brightness-100 transition duration-500 group-hover:scale-105"
              />

              {/* Minimal bottom-only gradient for clean contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-[5]"></div>

              {/* Guaranteed Pure White Category Title in high-contrast frosted badge */}
              <div className="relative z-10 text-center px-3.5 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 shadow-xl">
                <h3 className="category-card-title text-xs sm:text-sm lg:text-base font-black tracking-wider uppercase leading-tight !text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  {cat.name}
                </h3>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
