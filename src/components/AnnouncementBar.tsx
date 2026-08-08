import React from 'react'
import { PhoneIcon, MessageCircleIcon } from 'lucide-react'
import { site } from '../data/site'

export function AnnouncementBar() {
  return (
    <div className="relative z-40 border-b border-gold-400/20 bg-teal-900/40">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-1.5 px-5 py-2 text-[10.5px] font-bold uppercase tracking-[0.22em] text-paper-300/80 sm:flex-row sm:justify-between sm:px-8">
        <p className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-blink rounded-full bg-crimson-500" aria-hidden="true" />
          {site.season} wholesale desk is open · min order {site.minOrder}
        </p>
        <div className="flex items-center gap-5">
          <a
            href={`tel:${site.phone.replace(/\s/g, '')}`}
            className="flex items-center gap-1.5 transition-colors hover:text-gold-300"
          >
            <PhoneIcon className="h-3 w-3" aria-hidden="true" />
            {site.phone}
          </a>
          <a
            href={site.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-1.5 transition-colors hover:text-gold-300 sm:flex"
          >
            <MessageCircleIcon className="h-3 w-3" aria-hidden="true" />
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
