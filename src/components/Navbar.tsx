import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import { MenuIcon, XIcon, ArrowUpRightIcon } from 'lucide-react'
import { site } from '../data/site'
import { useEnquiry } from '../context/EnquiryContext'

const links = [
  { label: 'Why us', href: '/#why' },
  { label: 'Catalog', href: '/quick-enquiry' },
  { label: 'Safety Tips', href: '/safety-tips' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { count } = useEnquiry()
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors duration-500 ${
        scrolled ? 'border-gold-400/20 bg-ink-950/85 backdrop-blur-xl' : 'border-transparent bg-transparent'
      }`}
    >
      {/* Scroll progress reads like a burning fuse */}
      <motion.div
        style={{ scaleX: progress }}
        className="absolute inset-x-0 bottom-0 h-px origin-left bg-gold-400"
        aria-hidden="true"
      />
      <nav aria-label="Main" className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-5 py-4 sm:px-8">
        <a href="/" className="group flex items-center gap-3">
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-gold-400/40 bg-teal-900">
            <img
              src="https://cdn.magicpatterns.com/uploads/aecqRUdxkvo1WGGYnaiUPC/image.png"
              alt=""
              className="h-full w-full scale-[1.6] object-cover object-[50%_38%]"
            />
            <span
              className="absolute inset-y-0 -left-full w-1/2 bg-paper-50/35 blur-[3px] transition-transform duration-700 group-hover:translate-x-[300%]"
              aria-hidden="true"
            />
          </span>
          <span className="leading-none">
            <span className="block font-display text-[17px] font-bold tracking-tight text-gold-400">
              {site.name}
            </span>
            <span className="mt-1 block text-[9.5px] uppercase tracking-[0.3em] text-paper-500 font-bold">
              Sivakasi · {site.since}
            </span>
          </span>
        </a>

        <ul className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="group relative block py-1 text-[13.5px] text-paper-300 font-semibold transition-colors hover:text-gold-300"
              >
                {link.label}
                <span
                  className="absolute -bottom-0.5 left-0 h-px w-0 bg-gold-400 transition-all duration-300 group-hover:w-full"
                  aria-hidden="true"
                />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2.5">
          <a
            href="/quick-enquiry"
            className="group flex items-center gap-2 rounded-full bg-gold-400 px-4 py-2.5 text-[13px] font-bold text-ink-950 transition-colors hover:bg-gold-300 shadow-ember cursor-pointer"
          >
            Enquiry list
            <span className="tnum flex h-5 min-w-5 items-center justify-center rounded-full bg-ink-950 px-1 text-[11px] font-extrabold text-gold-300">
              {count}
            </span>
          </a>

          <a
            href={site.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-1.5 rounded-full border border-crimson-500/50 px-4 py-2.5 text-[13px] font-bold text-paper-100 transition-colors hover:border-crimson-400 hover:bg-crimson-500/10 md:flex cursor-pointer"
          >
            Get price list
            <ArrowUpRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </a>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-paper-50/15 text-paper-100 lg:hidden cursor-pointer"
          >
            {open ? <XIcon className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-gold-400/15 bg-ink-950/95 backdrop-blur-xl lg:hidden"
          >
            <ul className="flex flex-col px-5 py-2">
              {links.map((link, index) => (
                <motion.li
                  key={link.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + index * 0.05 }}
                >
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between border-b border-paper-50/10 py-3.5 font-display text-lg font-bold text-paper-100"
                  >
                    {link.label}
                    <ArrowUpRightIcon className="h-4 w-4 text-gold-400/70" aria-hidden="true" />
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
