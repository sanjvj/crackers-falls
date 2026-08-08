import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShoppingBag, ArrowRight, Flame } from 'lucide-react';
import type { Product, CategoryItem } from '../../types';
import { staggerContainer, fadeInUp } from '../../lib/motionVariants';

interface ProductShowcaseProps {
  products: Product[];
  categories: CategoryItem[];
  onSelectCategory?: (catName: string) => void;
}

export const ProductShowcase: React.FC<ProductShowcaseProps> = ({
  products,
  categories,
  onSelectCategory
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const activeCategories = categories.filter(c => c.active !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const activeProducts = products.filter(p => p.active !== false);

  const filteredProducts = activeCategory === 'All'
    ? activeProducts.slice(0, 12)
    : activeProducts.filter(p => p.category?.toLowerCase() === activeCategory.toLowerCase());

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <section className="py-20 bg-[#0d1117] relative z-20 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#161b22] border border-amber-400/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
              <Sparkles size={13} />
              <span>SIVAKASI DIRECT WHOLESALE CATALOG</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
              Featured <span className="gold-gradient-text">Wholesale Fireworks</span>
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Direct factory pricing with up to 60% discount off MRP. Browse top Sivakasi fireworks categories.
            </p>
          </div>

          <a
            href="/quick-enquiry"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#161b22] hover:bg-white/10 text-amber-400 font-bold text-xs uppercase tracking-wider transition-all border border-amber-400/30"
          >
            <span>Full Wholesale Order Form</span>
            <ArrowRight size={15} />
          </a>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-3 custom-scrollbar">
          <button
            onClick={() => setActiveCategory('All')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'All'
                ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                : 'bg-[#161b22] border border-white/10 text-slate-300 hover:text-white'
            }`}
          >
            All Products ({activeProducts.length})
          </button>
          {activeCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.name);
                if (onSelectCategory) onSelectCategory(cat.name);
              }}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeCategory === cat.name
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                  : 'bg-[#161b22] border border-white/10 text-slate-300 hover:text-white'
              }`}
            >
              <span>{cat.icon || '🎆'}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {filteredProducts.map((product) => {
            const mrp = product.original_price || Math.round(product.price / 0.45);
            const discountPct = Math.round(((mrp - product.price) / mrp) * 100);
            const savings = mrp - product.price;

            return (
              <motion.div key={product.id} variants={fadeInUp}>
                <div className="bg-[#161b22] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-4 relative hover:border-amber-400/50 transition-all duration-200 group h-full">
                  {/* Discount Badge */}
                  {discountPct > 0 && (
                    <div className="absolute top-4 left-4 z-10 bg-red-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md shadow">
                      {discountPct}% OFF
                    </div>
                  )}

                  {/* Image Frame */}
                  <div className="w-full h-44 rounded-xl overflow-hidden bg-[#0d1117] relative border border-white/5 flex items-center justify-center p-3">
                    <img
                      src={product.image_url || '/crackers falls logo.webp'}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain transform group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/crackers falls logo.webp';
                      }}
                    />
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      <span>{product.category}</span>
                      <span className="text-slate-400">{product.unit || 'Box'}</span>
                    </div>

                    <h3 className="text-sm font-bold font-display text-white line-clamp-1 group-hover:text-amber-400 transition-colors">
                      {product.name}
                    </h3>
                  </div>

                  {/* Pricing Footer */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 line-through">
                        MRP: {formatCurrency(mrp)}
                      </div>
                      <div className="text-lg font-black font-display text-amber-400">
                        {formatCurrency(product.price)}
                      </div>
                    </div>

                    <a
                      href="/quick-enquiry"
                      className="p-3 bg-amber-400/10 hover:bg-amber-400 text-amber-400 hover:text-slate-950 rounded-xl border border-amber-400/30 transition-all cursor-pointer"
                      title="Add to enquiry cart"
                    >
                      <ShoppingBag size={18} />
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* View All Order CTA */}
        <div className="text-center pt-4">
          <a
            href="/quick-enquiry"
            className="inline-flex items-center gap-2.5 px-8 py-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-xl transition-all cursor-pointer"
          >
            <Flame size={18} />
            <span>Open Wholesale Order Form</span>
            <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </section>
  );
};
