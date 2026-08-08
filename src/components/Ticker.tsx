import React from 'react'
import { tickerItems } from '../data/site'

export function Ticker() {
  const items = [...tickerItems, ...tickerItems]
  return (
    <div className="border-y border-gold-400/15 bg-teal-900/30 py-3">
      <div className="mask-fade-x flex overflow-hidden">
        <ul className="flex shrink-0 animate-ticker items-center gap-9 pr-9" aria-label="What buyers get">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="flex shrink-0 items-center gap-9 text-[11px] font-bold uppercase tracking-[0.26em] text-paper-300/70"
            >
              <span>{item}</span>
              <span
                className={`sparkle h-2.5 w-2.5 ${index % 2 === 0 ? 'bg-gold-400' : 'bg-crimson-500'}`}
                aria-hidden="true"
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
