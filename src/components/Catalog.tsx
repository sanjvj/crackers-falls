import React, { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRightIcon } from 'lucide-react'
import { SectionHeading } from './SectionHeading'
import { ProductCard } from './ProductCard'
import { site } from '../data/site'
import { useFirestoreCollection } from '../hooks/useFirestore'
import { DEFAULT_PRODUCTS, DEFAULT_CATEGORIES } from '../lib/firestore'
import type { Product, CategoryItem } from '../types'

export function Catalog() {
  const { data: products } = useFirestoreCollection<Product>('products', DEFAULT_PRODUCTS);
  const { data: categories } = useFirestoreCollection<CategoryItem>('categories', DEFAULT_CATEGORIES);

  const [activeCat, setActiveCat] = useState('all');

  const activeProducts = (products && products.length > 0 ? products : DEFAULT_PRODUCTS)
    .filter(p => p.active !== false && p.in_stock !== false);

  const activeCategories = (categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES)
    .filter(c => c.active !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const visibleProducts = useMemo(() => {
    if (activeCat === 'all') return activeProducts;
    return activeProducts.filter(p => p.category?.toLowerCase() === activeCat.toLowerCase());
  }, [activeCat, activeProducts]);

  // Limit to at most 12 products on the Home page catalog
  const displayedProducts = useMemo(() => visibleProducts.slice(0, 12), [visibleProducts]);

  return (
    <section id="catalog" className="relative overflow-hidden bg-ink-950 py-20 sm:py-28">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <SectionHeading
          index="02"
          eyebrow="Sivakasi wholesale catalog"
          title="Our premium"
          accent="crackers collection"
          body="Every category and unit size at genuine factory-direct rates. Add items to your enquiry and send a confirmed order list on WhatsApp."
        />

        {/* Category Pills Slider */}
        <div className="no-scrollbar mt-10 flex gap-2.5 overflow-x-auto pb-2 sm:justify-start" role="tablist" aria-label="Product categories">
          <button
            type="button"
            role="tab"
            aria-selected={activeCat === 'all'}
            onClick={() => setActiveCat('all')}
            className={`rounded-full px-5 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.14em] transition-all cursor-pointer border ${
              activeCat === 'all'
                ? 'border-gold-400 bg-gold-400 text-ink-950 shadow-[0_0_16px_rgba(242,194,48,0.35)]'
                : 'border-paper-50/20 bg-ink-900/60 text-paper-300 hover:border-gold-400/50 hover:text-gold-300'
            }`}
          >
            All Products ({activeProducts.length})
          </button>

          {activeCategories.map((category) => {
            const count = activeProducts.filter((p) => p.category?.toLowerCase() === category.name.toLowerCase()).length;
            if (count === 0) return null;
            const isActive = activeCat.toLowerCase() === category.name.toLowerCase();

            return (
              <button
                key={category.id || category.name}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCat(category.name)}
                className={`rounded-full px-5 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.14em] transition-all cursor-pointer border ${
                  isActive
                    ? 'border-gold-400 bg-gold-400 text-ink-950 shadow-[0_0_16px_rgba(242,194,48,0.35)]'
                    : 'border-paper-50/20 bg-ink-900/60 text-paper-300 hover:border-gold-400/50 hover:text-gold-300'
                }`}
              >
                <span>{category.name}</span>
                <span className={isActive ? 'ml-1.5 opacity-80' : 'ml-1.5 opacity-50'}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* Product Cards Grid (Limited to 12 items) */}
        <motion.div layout className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {displayedProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </AnimatePresence>
        </motion.div>

        {displayedProducts.length === 0 && (
          <p className="mt-16 text-center text-sm text-paper-500 font-sans">
            No items listed in this category yet — message us for availability.
          </p>
        )}

        <div className="mt-14 flex flex-col items-center gap-5">
          <p className="text-center text-[11px] uppercase tracking-[0.24em] text-paper-500 font-semibold">
            Minimum order {site.minOrder} · Rates valid across India
          </p>
          <a
            href="/quick-enquiry"
            className="group flex items-center gap-2 rounded-full bg-gold-400 px-7 py-4 font-extrabold text-ink-950 shadow-ember transition-transform hover:scale-[1.03] active:scale-95 cursor-pointer"
          >
            Explore Full Wholesale Catalog ({activeProducts.length} Products)
            <ArrowUpRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  )
}
