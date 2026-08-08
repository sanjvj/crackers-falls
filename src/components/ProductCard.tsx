import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PlusIcon, MinusIcon, FlameIcon } from 'lucide-react'
import type { Product } from '../types'
import { SparkBurst } from './SparkBurst'
import { useEnquiry } from '../context/EnquiryContext'

export function ProductCard({ product, index }: { product: Product; index: number }) {
  const { quantities, handleQuantityChange } = useEnquiry()
  const [burst, setBurst] = useState(0)
  const qty = quantities[product.id] || 0

  const mrp = product.original_price || Math.round(product.price / 0.45)
  const discount = Math.max(10, Math.round(((mrp - product.price) / mrp) * 100))
  const inStock = product.in_stock !== false
  const isBestseller = index % 3 === 0 || product.sortOrder <= 2

  const handleAdd = () => {
    handleQuantityChange(product.id, 1)
    setBurst((value) => value + 1)
  }

  const handleDecrement = () => {
    handleQuantityChange(product.id, -1)
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.25), ease: [0.16, 1, 0.3, 1] }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-paper-50/10 bg-ink-900 transition-colors duration-300 hover:border-gold-400/45 shadow-sm"
    >
      <div className="relative aspect-[5/4] overflow-hidden bg-ink-850">
        <img
          src={product.image_url || '/crackers falls logo.webp'}
          alt={product.name}
          loading="lazy"
          className={`h-full w-full transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07] ${
            product.image_url?.includes('logo') ? 'object-contain p-3' : 'object-cover'
          }`}
          onError={(e) => { (e.target as HTMLImageElement).src = '/crackers falls logo.webp'; }}
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink-900 to-transparent" aria-hidden="true" />
        
        {/* spinning chakkar spark ring on hover */}
        <span
          className="pointer-events-none absolute right-3 bottom-3 h-8 w-8 rounded-full border border-dashed border-gold-400/0 opacity-0 transition-opacity duration-500 group-hover:animate-spark-spin group-hover:border-gold-400/60 group-hover:opacity-100"
          aria-hidden="true"
        />

        {/* Discount Badge */}
        <span className="tnum absolute left-3 top-3 rounded-full bg-crimson-500 px-2.5 py-1 text-[10.5px] font-semibold text-paper-50 shadow-md">
          −{discount}%
        </span>

        {/* Bestseller Badge */}
        {isBestseller && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-gold-400/45 bg-ink-950/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-gold-300 backdrop-blur font-semibold">
            <FlameIcon className="h-3 w-3" aria-hidden="true" />
            Bestseller
          </span>
        )}

        {/* Unit Badge */}
        <span className="absolute bottom-3 left-3 text-[10.5px] uppercase tracking-[0.2em] text-paper-300/85 font-semibold">
          {product.unit || 'Box'}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-[17px] font-semibold leading-snug text-paper-50 line-clamp-1">{product.name}</h3>
          <span className="shrink-0 text-[12px] font-normal text-gold-300/70 font-display">{product.category}</span>
        </div>
        <p className="mt-2.5 flex-1 text-[13px] leading-relaxed text-paper-500 font-sans font-normal line-clamp-2">{product.description || 'Authentic Sivakasi direct fireworks.'}</p>

        <div className="mt-5 text-[10.5px] uppercase tracking-[0.16em]">
          <span className={`font-bold ${inStock ? 'text-leaf-400' : 'text-paper-500'}`}>
            {inStock ? '● In stock' : '○ Restocking soon'}
          </span>
        </div>

        <div className="mt-4 flex items-end justify-between border-t border-paper-50/10 pt-4">
          <div>
            <p className="tnum text-[11.5px] text-paper-500 line-through font-normal">₹{mrp.toLocaleString('en-IN')}</p>
            <p className="tnum font-display text-2xl font-semibold text-gold-400">
              ₹{product.price.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="relative">
            {burst > 0 ? <SparkBurst key={burst} /> : null}
            <AnimatePresence mode="wait" initial={false}>
              {qty > 0 ? (
                <motion.div
                  key="stepper"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-1 rounded-full border border-gold-400/30 p-1 bg-ink-850"
                >
                  <button
                    type="button"
                    onClick={handleDecrement}
                    aria-label={`Reduce ${product.name}`}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-paper-300 transition-colors hover:bg-paper-50/10 hover:text-paper-50 cursor-pointer"
                  >
                    <MinusIcon className="h-3.5 w-3.5" />
                  </button>
                  <span className="tnum w-6 text-center text-[13px] font-bold text-gold-300">{qty}</span>
                  <button
                    type="button"
                    onClick={handleAdd}
                    aria-label={`Add another ${product.name}`}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-400 text-ink-950 transition-colors hover:bg-gold-300 cursor-pointer font-bold"
                  >
                    <PlusIcon className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  key="add"
                  type="button"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  onClick={handleAdd}
                  disabled={!inStock}
                  aria-label={`Add ${product.name} to enquiry`}
                  className="rounded-full border border-paper-50/20 px-4 py-2.5 text-[13px] font-medium text-paper-50 transition-colors hover:border-gold-400 hover:bg-gold-400 hover:text-ink-950 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-paper-50/20 disabled:hover:bg-transparent disabled:hover:text-paper-50 cursor-pointer"
                >
                  {inStock ? 'Add to list' : 'Unavailable'}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
