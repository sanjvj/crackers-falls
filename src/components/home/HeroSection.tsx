import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, MessageCircle, ChevronLeft, ChevronRight, Sparkles, ShieldCheck, Flame, Award, Truck, CheckCircle2 } from 'lucide-react';
import { WaterfallScene } from '../3d/WaterfallScene';
import type { HeroSlide } from '../../types';
import { fadeInUp } from '../../lib/motionVariants';

interface HeroSectionProps {
  slides: HeroSlide[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({ slides }) => {
  const activeSlides = slides.filter(s => s.active !== false);
  const displaySlides = activeSlides.length > 0 ? activeSlides : [
    {
      id: 'default_1',
      tag: 'SIVAKASI DIRECT FACTORY WHOLESALE 2026',
      title: 'CRACKERS FALLS',
      subtitle: 'Authentic Sivakasi Wholesale Fireworks at Factory Direct Rates',
      description: 'Experience direct factory pricing with up to 60% discount off MRP. Custom moisture-proof packed transport across India.',
      bgClass: 'from-emerald-950 via-teal-950 to-slate-950',
      image: '/crackers falls logo.webp',
      primaryCtaText: 'Quick Wholesale Order',
      primaryCtaLink: '/quick-enquiry',
      secondaryCtaText: 'WhatsApp Order Direct',
      secondaryCtaLink: 'https://wa.me/919159038240',
      active: true,
      order: 0
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (displaySlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displaySlides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [displaySlides.length]);

  const currentSlide = displaySlides[currentIndex] || displaySlides[0];

  return (
    <section className="relative min-h-[85vh] flex flex-col justify-center overflow-hidden bg-[#0d1117] pt-8 pb-16 border-b border-white/10">
      {/* Background Three.js Waterfall Particle Scene (Strictly on background Z-0) */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <WaterfallScene />
      </div>

      {/* Hero Content Grid (Foreground Z-10 with Crystal Clear Legibility) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines, Tamil Tagline, CTAs & Stats (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.id || currentIndex}
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={fadeInUp}
                className="space-y-5"
              >
                {/* Pill Tag Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#161b22] border border-amber-400/30 text-amber-400 text-xs font-black uppercase tracking-widest shadow-sm">
                  <Sparkles size={14} className="text-amber-400" />
                  <span>{currentSlide.tag || 'SIVAKASI DIRECT WHOLESALE 2026'}</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-display tracking-tight text-white leading-none">
                  <span className="gold-gradient-text">
                    {currentSlide.title || 'CRACKERS FALLS'}
                  </span>
                </h1>

                {/* Tamil Slogan */}
                <div className="font-tamil text-amber-400 font-extrabold text-2xl sm:text-3xl tracking-wide">
                  பட்டாசு அருவி — Sivakasi Direct Wholesale
                </div>

                {/* Subheadline & Description */}
                <p className="text-base sm:text-xl font-display font-semibold text-slate-200 leading-snug">
                  {currentSlide.subtitle}
                </p>
                <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed max-w-xl">
                  {currentSlide.description}
                </p>

                {/* Action CTAs */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                  <a
                    href={currentSlide.primaryCtaLink || '/quick-enquiry'}
                    className="px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
                  >
                    <Flame size={16} />
                    <span>{currentSlide.primaryCtaText || 'Quick Wholesale Order'}</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </a>

                  <a
                    href={currentSlide.secondaryCtaLink || 'https://wa.me/919159038240'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-3.5 bg-[#161b22] hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-emerald-500/40 transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-md"
                  >
                    <MessageCircle size={16} className="text-emerald-400" />
                    <span>{currentSlide.secondaryCtaText || 'WhatsApp Order Direct'}</span>
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slide Navigation Controls */}
            {displaySlides.length > 1 && (
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setCurrentIndex((prev) => (prev === 0 ? displaySlides.length - 1 : prev - 1))}
                  className="p-2 rounded-full bg-[#161b22] border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                {displaySlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentIndex ? 'w-6 bg-amber-400' : 'w-2 bg-slate-600'
                    }`}
                  />
                ))}
                <button
                  onClick={() => setCurrentIndex((prev) => (prev + 1) % displaySlides.length)}
                  className="p-2 rounded-full bg-[#161b22] border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Clean Brand Showcase Card (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="bg-[#161b22] border border-white/10 p-8 rounded-3xl space-y-6 shadow-2xl relative">
              {/* Brand Logo Display */}
              <div className="flex justify-center">
                <img
                  src="/crackers falls logo.webp"
                  alt="Crackers Falls"
                  className="h-32 sm:h-40 object-contain drop-shadow-xl"
                />
              </div>

              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 size={14} />
                  <span>2026 Festive Season Wholesale Booking</span>
                </div>
                <h3 className="text-xl font-bold font-display text-white">Direct Factory Dispatch</h3>
                <p className="text-xs text-slate-400 font-sans">
                  Sivakasi, Tamil Nadu • Sealed Moisture-Proof Packing
                </p>
              </div>

              {/* Quick Feature Pills */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 bg-[#0d1117] rounded-xl border border-white/10 text-center">
                  <span className="text-amber-400 font-black text-lg block">60% OFF</span>
                  <span className="text-[10px] text-slate-400 font-semibold">Direct Wholesale Rate</span>
                </div>
                <div className="p-3 bg-[#0d1117] rounded-xl border border-white/10 text-center">
                  <span className="text-emerald-400 font-black text-lg block">₹2,000</span>
                  <span className="text-[10px] text-slate-400 font-semibold">Minimum Wholesale Target</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Stats Row */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
          <div className="bg-[#161b22] p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center">
            <ShieldCheck size={20} className="text-amber-400 mb-1" />
            <div className="text-sm font-bold font-display text-white">100% Genuine</div>
            <div className="text-[11px] text-slate-400">Direct Sivakasi Factory</div>
          </div>
          <div className="bg-[#161b22] p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center">
            <Award size={20} className="text-amber-400 mb-1" />
            <div className="text-sm font-bold font-display text-white">Up to 60% OFF</div>
            <div className="text-[11px] text-slate-400">Direct Wholesale Discount</div>
          </div>
          <div className="bg-[#161b22] p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center">
            <Truck size={20} className="text-amber-400 mb-1" />
            <div className="text-sm font-bold font-display text-white">Safe Transport</div>
            <div className="text-[11px] text-slate-400">Sealed Heavy Packing</div>
          </div>
          <div className="bg-[#161b22] p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center">
            <Sparkles size={20} className="text-amber-400 mb-1" />
            <div className="text-sm font-bold font-display text-white">50,000+ Buyers</div>
            <div className="text-[11px] text-slate-400">Trusted Across South India</div>
          </div>
        </div>
      </div>
    </section>
  );
};
