import React from 'react'
import { SparklesIcon } from 'lucide-react'
import { marqueeItems } from '../data/site'

export function TrustMarquee() {
  const items = [...marqueeItems, ...marqueeItems]

  return (
    <div className="relative border-y border-white/10 bg-night-900/80 py-3.5">
      <div className="mask-fade-x flex overflow-hidden">
        <ul className="flex shrink-0 animate-marquee items-center gap-10 pr-10" aria-label="Why buyers choose us">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="flex shrink-0 items-center gap-3 text-xs uppercase tracking-[0.22em] text-ember-100/60 font-semibold"
            >
              <SparklesIcon className="h-3.5 w-3.5 text-gold-400" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
