import React from 'react'
import { ArrowUpRightIcon, MessageCircleIcon } from 'lucide-react'
import { site } from '../data/site'
import { Reveal } from './Reveal'
import { useEnquiry } from '../context/EnquiryContext'

export function CtaBanner() {
  const { whatsappHref } = useEnquiry()

  return (
    <section className="relative overflow-hidden bg-ink-950 py-20 sm:py-28">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <Reveal className="relative overflow-hidden rounded-3xl border border-gold-400/30 bg-teal-900/30 p-8 sm:p-14 lg:p-20 text-center backdrop-blur">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold-400/20 blur-3xl" aria-hidden="true" />

          <p className="flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.3em] text-paper-500 font-bold">
            <span className="sparkle h-2.5 w-2.5 bg-gold-400" aria-hidden="true" />
            Direct godown dispatch
          </p>

          <h2 className="mt-6 font-display text-3xl font-semibold leading-tight text-paper-50 sm:text-5xl lg:text-6xl">
            Ready to stock your celebration <span className="italic text-gold-400 glow-gold">direct from Sivakasi?</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-paper-300/80 font-sans">
            Get your instant wholesale quote on WhatsApp or build your order list right now. Minimum order value {site.minOrder}.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/quick-enquiry"
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gold-400 px-8 py-4 text-[14.5px] font-bold text-ink-950 transition-colors hover:bg-gold-300 sm:w-auto shadow-ember cursor-pointer"
            >
              <span className="relative z-10">Build your enquiry list</span>
              <ArrowUpRightIcon className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
              <span
                className="absolute inset-y-0 -left-full w-1/3 bg-paper-50/40 blur-md transition-transform duration-700 group-hover:translate-x-[420%]"
                aria-hidden="true"
              />
            </a>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-full border border-crimson-500/50 px-8 py-4 text-[14.5px] font-medium text-paper-100 transition-colors hover:border-crimson-400 hover:bg-crimson-500/10 sm:w-auto cursor-pointer"
            >
              <MessageCircleIcon className="h-4 w-4 text-emerald-400" aria-hidden="true" />
              Chat on WhatsApp
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
