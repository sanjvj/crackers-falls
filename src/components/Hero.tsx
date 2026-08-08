import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import { ArrowDownRightIcon, MessageCircleIcon, ShieldCheckIcon } from 'lucide-react'
import { EmberField } from './EmberField'
import { FireworksCanvas } from './FireworksCanvas'
import { heroLines, heroStats, site } from '../data/site'
import { useEnquiry } from '../context/EnquiryContext'

const words = ['Factory', 'gate', 'rates', 'for', 'Sivakasi', 'crackers.']

export function Hero() {
  const [line, setLine] = useState(0)
  const { whatsappHref } = useEnquiry()
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const posterY = useTransform(scrollYProgress, [0, 1], [0, -40])
  const stackY = useTransform(scrollYProgress, [0, 1], [0, -20])

  useEffect(() => {
    const timer = window.setInterval(() => setLine((value) => (value + 1) % heroLines.length), 3800)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative isolate overflow-hidden bg-ink-950 pb-16 pt-14 sm:pb-24 sm:pt-20"
    >
      <FireworksCanvas className="absolute inset-0 -z-10 h-full w-full opacity-70" />
      <EmberField className="absolute inset-0 -z-10 h-full w-full" density={26} />
      <div className="grain absolute inset-0 -z-10 opacity-50" aria-hidden="true" />
      <div className="absolute -left-40 top-1/3 -z-10 h-[440px] w-[440px] rounded-full bg-teal-700/20 blur-[140px]" aria-hidden="true" />
      <div className="absolute -right-32 top-10 -z-10 h-[360px] w-[360px] rounded-full bg-crimson-600/12 blur-[130px]" aria-hidden="true" />

      <div className="mx-auto grid max-w-[1400px] items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-paper-500 font-bold"
          >
            <span className="sparkle h-2.5 w-2.5 bg-gold-400" aria-hidden="true" />
            Wholesale · {site.season}
          </motion.p>

          <h1 className="mt-7 font-display text-[3.1rem] font-semibold leading-[0.94] tracking-tight text-paper-50 sm:text-[4.6rem] lg:text-[5.4rem]">
            {words.map((word, index) => (
              <span key={word + index} className="mr-[0.24em] inline-block overflow-hidden align-bottom">
                <motion.span
                  initial={{ y: '105%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.85, delay: 0.1 + index * 0.07, ease: [0.16, 1, 0.3, 1] }}
                  className={`inline-block ${index === 5 ? 'italic text-gold-400 glow-gold' : ''}`}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h1>

          {/* A wick that burns in under the headline */}
          <div className="mt-5 flex max-w-sm items-center">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.6, delay: 0.7, ease: 'linear' }}
              className="relative h-px bg-gold-400/70"
            >
              <span className="absolute -right-1 top-1/2 h-2 w-2 -translate-y-1/2 animate-wick-glow rounded-full bg-crimson-400 shadow-[0_0_12px_4px_rgba(226,80,63,0.5)]" />
            </motion.div>
          </div>

          <p className="mt-5 font-display text-lg tracking-[0.18em] text-gold-300/80 font-extrabold">{site.tamilName}</p>

          <div className="mt-6 flex h-7 items-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={line}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="text-[15px] text-paper-300/85 sm:text-base font-semibold"
              >
                {heroLines[line]}
              </motion.p>
            </AnimatePresence>
          </div>

          <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-paper-500 font-sans">
            Wholesale fireworks shipped straight from our Sivakasi godown to shops, event planners and families across
            India — at up to 55% off the printed price list.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href="#catalog"
              className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gold-400 px-7 py-4 text-[14.5px] font-extrabold text-ink-950 transition-colors hover:bg-gold-300 shadow-ember cursor-pointer"
            >
              <span className="relative z-10">Browse catalog &amp; rates</span>
              <ArrowDownRightIcon
                className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5"
                aria-hidden="true"
              />
              <span
                className="absolute inset-y-0 -left-full w-1/3 bg-paper-50/40 blur-md transition-transform duration-700 group-hover:translate-x-[420%]"
                aria-hidden="true"
              />
            </a>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-full border border-crimson-500/50 px-7 py-4 text-[14.5px] font-bold text-paper-100 transition-colors hover:border-crimson-400 hover:bg-crimson-500/10 cursor-pointer"
            >
              <MessageCircleIcon className="h-4 w-4 text-emerald-400" aria-hidden="true" />
              Ask on WhatsApp
            </a>
          </div>

          <dl className="mt-12 grid max-w-lg grid-cols-3 border-t border-paper-50/10 pt-6">
            {heroStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 + index * 0.1, duration: 0.6 }}
                className={index === 0 ? '' : 'border-l border-paper-50/10 pl-4'}
              >
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="tnum block font-display text-3xl font-bold text-gold-400">{stat.value}</span>
                  <span className="mt-1.5 block max-w-[9rem] text-[11px] uppercase leading-snug tracking-[0.16em] text-paper-500 font-semibold">
                    {stat.label}
                  </span>
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>

        {/* Right Side Grid with Square AI Generated Fireworks Images */}
        <div className="relative">
          <div className="grid grid-cols-5 gap-3 sm:gap-4 items-stretch">
            {/* Main Poster Card: AI Waterfall Fireworks Celebration (3/5 width) */}
            <motion.figure
              style={{ y: posterY }}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative col-span-3 overflow-hidden rounded-2xl border border-gold-400/25 bg-ink-900 shadow-2xl flex items-center justify-center min-h-[380px]"
            >
              <img
                src="/hero_main_fireworks.jpg"
                alt="Sivakasi Diwali Waterfall Fireworks Celebration"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="block font-display text-lg font-extrabold text-gold-400 drop-shadow-md">Crackers Falls</span>
                <span className="block text-[10px] tracking-[0.24em] text-paper-200 font-bold uppercase drop-shadow-sm">{site.tamilName}</span>
              </div>
            </motion.figure>

            {/* Right Column (2/5 width): 2 Perfect Square AI Images + Slab Box */}
            <motion.div style={{ y: stackY }} className="col-span-2 flex flex-col gap-3 sm:gap-4 justify-between">
              {/* Square Image 1: Golden Sparklers */}
              <motion.figure
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="aspect-square overflow-hidden rounded-2xl border border-paper-50/15 bg-ink-900 shadow-md"
              >
                <img
                  src="/hero_sparklers.jpg"
                  alt="Golden Sparklers - Diwali Fireworks"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </motion.figure>

              {/* Square Image 2: Sivakasi Sky Rockets */}
              <motion.figure
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="aspect-square overflow-hidden rounded-2xl border border-paper-50/15 bg-ink-900 shadow-md"
              >
                <img
                  src="/hero_rockets.jpg"
                  alt="Sivakasi Sky Rockets Bundle"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </motion.figure>

              {/* Today's Slab Rate Box */}
              <div className="rounded-2xl border border-gold-400/25 bg-teal-900/40 p-3.5 sm:p-4 backdrop-blur">
                <p className="text-[10px] uppercase tracking-[0.24em] text-paper-500 font-bold">Today&apos;s slab</p>
                <p className="mt-1 font-display text-lg sm:text-xl font-bold leading-tight text-paper-50">
                  From <span className="text-gold-400">₹144</span>
                  <span className="text-xs font-normal text-paper-500"> / box</span>
                </p>
              </div>
            </motion.div>
          </div>

          {/* Meaningful Verified Badge at Bottom */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="absolute -bottom-6 left-2 flex items-center gap-2.5 rounded-full border border-gold-400/30 bg-ink-950/95 px-4 py-2.5 backdrop-blur sm:-left-6 shadow-2xl z-20"
          >
            <ShieldCheckIcon className="h-4 w-4 text-leaf-400 shrink-0" />
            <span className="text-[12px] text-paper-100 font-bold">
              100% PESO Licensed · <span className="text-gold-400 font-extrabold">Direct Sivakasi Godown</span>
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
