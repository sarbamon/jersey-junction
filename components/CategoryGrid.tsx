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
    setCategories(categoryService.getCategoriesSync().filter((c) => c.status === 'Active'));
    categoryService.getActiveCategories().then((cats) => {
      if (isMounted) setCategories(cats);
    });
    return () => { isMounted = false; };
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:py-16 sm:px-6 lg:px-8 border-b border-[#242424] dark:border-[#242424] light:border-slate-200">
      <div className="mb-6 sm:mb-10 text-left">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#f4c84a] dark:text-[#f4c84a] light:text-amber-600">Explore</p>
        <h2 className="mt-1 text-2xl sm:text-3xl font-black text-white dark:text-white light:text-slate-900 font-serif uppercase">Shop by Category</h2>
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
              className="group relative flex aspect-[16/10] sm:aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-xl bg-[#09090b] border border-[#242424] dark:border-[#242424] light:border-slate-300 p-3 sm:p-4 text-white shadow-md cursor-pointer hover:border-[#f4c84a] transition-all hover:scale-[1.02]"
            >
              {/* Background thumbnail image */}
              <img
                src={cat.image || 'https://res.cloudinary.com/mcsohx4p/image/upload/v1792689801/jerseyjunction_uploads/q6fb9r25vwafcwkfhdca.jpg'}
                alt={cat.name}
                className="absolute inset-0 h-full w-full object-cover object-center opacity-40 transition duration-500 group-hover:scale-110 group-hover:opacity-60"
              />
              {/* Dark contrast gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30 z-[5]"></div>

              <div className="relative z-10 text-center px-1">
                <h3 className="text-xs sm:text-sm lg:text-base font-black tracking-wider drop-shadow-md text-white font-serif uppercase leading-tight" style={{ color: '#ffffff' }}>
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
