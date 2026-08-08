import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Award, Truck, Users, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { AnnouncementBar } from '../components/AnnouncementBar';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { BrandLoader } from '../components/BrandLoader';
import { fetchPageContent, DEFAULT_ABOUT_PAGE } from '../lib/firestore';
import type { AboutPageContent } from '../types';

export function AboutPage() {
  const [content, setContent] = useState<AboutPageContent>(DEFAULT_ABOUT_PAGE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPageContent<AboutPageContent>('about', DEFAULT_ABOUT_PAGE)
      .then((data) => setContent(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <BrandLoader variant="fullscreen" message="Loading About Crackers Falls..." />;
  }

  return (
    <div className="min-h-screen bg-ink-950 text-paper-50 font-sans antialiased selection:bg-gold-400 selection:text-ink-950">
      <AnnouncementBar />
      <Navbar />

      <main className="py-12 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto space-y-14">
        {/* Header Section */}
        <div className="max-w-3xl space-y-4">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-paper-300/80 hover:text-gold-300 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </a>
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.28em] text-paper-500">
            <span className="h-2 w-2 rounded-full bg-gold-400 animate-pulse" />
            {content.eyebrow}
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold font-display uppercase tracking-tight text-paper-50">
            {content.title}
          </h1>
          <p className="text-sm sm:text-lg leading-relaxed text-gold-400 font-display font-semibold">
            {content.subtitle}
          </p>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-ink-900 border border-gold-400/30 text-center space-y-2 shadow-ember">
            <span className="block font-display text-4xl font-extrabold text-gold-400">{content.years_experience}</span>
            <span className="block text-xs uppercase tracking-wider text-paper-500 font-bold">Years of Pyrotechnic Heritage</span>
          </div>
          <div className="p-6 rounded-3xl bg-ink-900 border border-gold-400/30 text-center space-y-2 shadow-ember">
            <span className="block font-display text-4xl font-extrabold text-gold-400">{content.orders_delivered}</span>
            <span className="block text-xs uppercase tracking-wider text-paper-500 font-bold">Festive Orders Delivered</span>
          </div>
          <div className="p-6 rounded-3xl bg-ink-900 border border-gold-400/30 text-center space-y-2 shadow-ember">
            <span className="block font-display text-4xl font-extrabold text-gold-400">{content.states_covered}</span>
            <span className="block text-xs uppercase tracking-wider text-paper-500 font-bold">Indian States Served</span>
          </div>
        </div>

        {/* Heritage Story Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6 bg-ink-900 p-8 rounded-3xl border border-paper-50/10 shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-gold-400">
              {content.story_title}
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-paper-300/80 font-sans">
              {content.story_body}
            </p>
            <div className="pt-4 border-t border-paper-50/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              <div className="p-4 rounded-2xl bg-ink-850 border border-paper-50/10">
                <h4 className="font-bold font-display text-gold-400 mb-1">Our Mission</h4>
                <p className="text-paper-500 leading-relaxed">{content.mission}</p>
              </div>
              <div className="p-4 rounded-2xl bg-ink-850 border border-paper-50/10">
                <h4 className="font-bold font-display text-gold-400 mb-1">Our Vision</h4>
                <p className="text-paper-500 leading-relaxed">{content.vision}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative overflow-hidden rounded-3xl border border-gold-400/30 bg-ink-900 min-h-[360px] shadow-2xl">
            <img
              src="/hero_main_fireworks.jpg"
              alt="Crackers Falls Sivakasi Celebration"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="block font-display text-xl font-bold text-gold-400">Direct Godown Dispatch</span>
              <span className="block text-xs text-paper-300 font-sans">Moisture-proof packing with live transport tracking.</span>
            </div>
          </div>
        </div>

        {/* CTA Strip */}
        <div className="p-8 rounded-3xl bg-teal-900/40 border border-gold-400/30 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold font-display text-paper-50">Ready to place your festive wholesale enquiry?</h3>
            <p className="text-xs text-paper-500 mt-1 font-sans">Minimum order ₹2,000. Transparent slab rates apply automatically.</p>
          </div>
          <a
            href="/quick-enquiry"
            className="px-7 py-4 rounded-full bg-gold-400 hover:bg-gold-300 text-ink-950 font-extrabold text-xs uppercase tracking-wider shrink-0 flex items-center gap-2 shadow-ember cursor-pointer"
          >
            <span>Explore Wholesale Catalog</span>
            <ArrowUpRight size={16} />
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default AboutPage;
