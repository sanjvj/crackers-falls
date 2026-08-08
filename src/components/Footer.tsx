import React from 'react'
import { PhoneIcon, MessageCircleIcon, MapPinIcon, ClockIcon, ShieldCheckIcon } from 'lucide-react'
import { site } from '../data/site'

export function Footer() {
  return (
    <footer className="border-t border-paper-50/10 bg-ink-950 text-paper-300 text-xs font-sans">
      <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-gold-400/40 bg-teal-900">
                <img
                  src="https://cdn.magicpatterns.com/uploads/aecqRUdxkvo1WGGYnaiUPC/image.png"
                  alt=""
                  className="h-full w-full scale-[1.6] object-cover object-[50%_38%]"
                />
              </span>
              <div>
                <span className="block font-display text-lg font-bold text-gold-400">{site.name}</span>
                <span className="block text-[10px] tracking-[0.24em] text-paper-500 font-bold uppercase">{site.tamilName}</span>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-paper-500">
              Direct factory outlet supplying Sivakasi fireworks at factory-floor wholesale rates to shops, event planners, and families across India.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-gold-400">Quick Navigation</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><a href="/" className="hover:text-gold-300 transition-colors">Home Page</a></li>
              <li><a href="/quick-enquiry" className="hover:text-gold-300 transition-colors text-gold-400 font-bold">Quick Wholesale Enquiry</a></li>
              <li><a href="/safety-tips" className="hover:text-gold-300 transition-colors">PESO Safety Tips</a></li>
              <li><a href="/about" className="hover:text-gold-300 transition-colors">About Sivakasi Godown</a></li>
              <li><a href="/contact" className="hover:text-gold-300 transition-colors">Contact Godown Desk</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-gold-400">Sivakasi Contact Desk</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPinIcon className="h-4 w-4 text-gold-400 shrink-0 mt-0.5" />
                <span>{site.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <PhoneIcon className="h-4 w-4 text-emerald-400 shrink-0" />
                <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="hover:text-gold-300">{site.phone}</a>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageCircleIcon className="h-4 w-4 text-emerald-400 shrink-0" />
                <a href={site.whatsapp} target="_blank" rel="noreferrer" className="hover:text-gold-300">WhatsApp Desk ({site.phone})</a>
              </li>
              <li className="flex items-center gap-2.5">
                <ClockIcon className="h-4 w-4 text-gold-400 shrink-0" />
                <span>{site.hours}</span>
              </li>
            </ul>
          </div>

          {/* Safety & Compliance */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-gold-400">Safety &amp; Compliance</h4>
            <div className="p-4 rounded-xl border border-paper-50/10 bg-teal-900/30 space-y-2">
              <div className="flex items-center gap-2 text-leaf-400 font-bold text-xs">
                <ShieldCheckIcon className="h-4 w-4" />
                <span>100% PESO Licensed</span>
              </div>
              <p className="text-[11px] leading-relaxed text-paper-500">
                All items packaged in moisture-proof heavy export boxes. Transported via approved licensed carriers with insurance coverage across India.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-paper-50/10 pt-6 text-center text-[11px] text-paper-500 font-semibold">
          © 2026 {site.name} ({site.tamilName}) · Sivakasi Direct Wholesale Fireworks. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
