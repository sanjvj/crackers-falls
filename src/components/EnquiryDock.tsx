import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBagIcon, ChevronUpIcon, ChevronDownIcon, TrashIcon, ArrowRightIcon } from 'lucide-react'
import { useEnquiry } from '../context/EnquiryContext'
import type { Product } from '../types'

export function EnquiryDock() {
  const { quantities, handleQuantityChange, clearCart, count, total, products } = useEnquiry()
  const [expanded, setExpanded] = useState(false)

  const cartItems = Object.entries(quantities)
    .map(([prodId, qty]) => {
      const p = products.find(item => item.id === prodId)
      if (!p || qty <= 0) return null
      return { product: p, qty }
    })
    .filter(Boolean) as { product: Product; qty: number }[]

  if (count === 0) return null

  return (
    <div className="fixed bottom-4 inset-x-4 z-50 max-w-xl mx-auto">
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="rounded-2xl border border-gold-400/40 bg-ink-950/95 backdrop-blur-xl shadow-ember overflow-hidden text-xs text-paper-50 font-sans"
      >
        {/* Expanded Drawer Items */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-4 border-b border-paper-50/10 space-y-3 max-h-56 overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between font-bold text-paper-300">
                <span>Selected Items ({count})</span>
                <button onClick={clearCart} className="text-crimson-400 hover:underline cursor-pointer">
                  Clear All
                </button>
              </div>

              <div className="space-y-2">
                {cartItems.map(({ product, qty }) => (
                  <div key={product.id} className="flex items-center justify-between py-1 border-b border-paper-50/5">
                    <div>
                      <p className="font-bold text-white">{product.name}</p>
                      <p className="text-[10px] text-paper-500">{qty} x ₹{product.price}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gold-400">₹{(qty * product.price).toLocaleString('en-IN')}</span>
                      <button onClick={() => handleQuantityChange(product.id, -qty)} className="text-crimson-400 p-1 cursor-pointer">
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Dock Header */}
        <div className="p-3.5 flex items-center justify-between gap-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-3 cursor-pointer text-left focus:outline-none"
          >
            <span className="tnum flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400 font-extrabold text-ink-950 text-sm shadow-md">
              {count}
            </span>
            <div>
              <div className="font-bold text-white text-xs flex items-center gap-1">
                <span>Approx. Total:</span>
                <span className="tnum text-gold-400 font-bold text-sm">₹{total.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-[10px] text-paper-500 flex items-center gap-1 font-semibold">
                <span>{expanded ? 'Hide order summary' : 'Tap to view item list'}</span>
                {expanded ? <ChevronDownIcon className="h-3 w-3" /> : <ChevronUpIcon className="h-3 w-3" />}
              </p>
            </div>
          </button>

          <a
            href="/quick-enquiry"
            className="px-5 py-3 rounded-xl bg-gold-400 hover:bg-gold-300 text-ink-950 font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-transform hover:scale-105 cursor-pointer"
          >
            <ShoppingBagIcon className="h-4 w-4" />
            <span>Checkout Page</span>
            <ArrowRightIcon className="h-4 w-4" />
          </a>
        </div>
      </motion.div>
    </div>
  )
}
