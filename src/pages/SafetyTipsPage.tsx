import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle2, XCircle, ArrowLeft, PhoneCall } from 'lucide-react';
import { AnnouncementBar } from '../components/AnnouncementBar';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { BrandLoader } from '../components/BrandLoader';
import { fetchPageContent, DEFAULT_SAFETY_TIPS_PAGE } from '../lib/firestore';
import type { SafetyTipsContent } from '../types';
import { site } from '../data/site';

export function SafetyTipsPage() {
  const [content, setContent] = useState<SafetyTipsContent>(DEFAULT_SAFETY_TIPS_PAGE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPageContent<SafetyTipsContent>('safety_tips', DEFAULT_SAFETY_TIPS_PAGE)
      .then((data) => setContent(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <BrandLoader variant="fullscreen" message="Loading Safety Guidelines..." />;
  }

  const dos = (content.tips || []).filter(t => t.type === 'do');
  const donts = (content.tips || []).filter(t => t.type === 'dont');

  return (
    <div className="min-h-screen bg-ink-950 text-paper-50 font-sans antialiased selection:bg-gold-400 selection:text-ink-950">
      <AnnouncementBar />
      <Navbar />

      <main className="py-12 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto space-y-12">
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
          <p className="text-sm sm:text-base leading-relaxed text-paper-300/80 font-sans">
            {content.description}
          </p>
        </div>

        {/* PESO Compliance Banner */}
        <div className="p-6 rounded-3xl bg-teal-900/30 border border-gold-400/30 flex flex-col sm:flex-row items-center justify-between gap-6 backdrop-blur shadow-ember">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gold-400 text-ink-950 flex items-center justify-center font-bold shrink-0">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-gold-400">100% Statutory PESO License Compliant</h3>
              <p className="text-xs text-paper-500 font-sans">All fireworks manufactured and supplied by Crackers Falls strictly adhere to Indian Explosives Rules.</p>
            </div>
          </div>
          <a
            href={`tel:${site.phone.replace(/\s/g, '')}`}
            className="px-6 py-3 rounded-full bg-gold-400 hover:bg-gold-300 text-ink-950 font-extrabold text-xs uppercase tracking-wider shrink-0 flex items-center gap-2 shadow-md cursor-pointer"
          >
            <PhoneCall size={14} />
            <span>Safety Desk: {site.phone}</span>
          </a>
        </div>

        {/* Do's & Don'ts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* DO's */}
          <div className="space-y-6 bg-ink-900 p-6 sm:p-8 rounded-3xl border border-leaf-400/30 shadow-xl">
            <div className="flex items-center gap-3 border-b border-paper-50/10 pb-4">
              <CheckCircle2 className="text-leaf-400" size={24} />
              <h2 className="text-xl font-bold font-display text-paper-50 uppercase tracking-wider">
                Mandatory Safety Do&apos;s
              </h2>
            </div>
            <div className="space-y-4">
              {dos.map((tip) => (
                <div key={tip.id} className="p-4 rounded-2xl bg-ink-850 border border-paper-50/10 flex items-start gap-3">
                  <span className="text-2xl shrink-0">{tip.icon || '✅'}</span>
                  <div>
                    <h4 className="text-sm font-bold font-display text-gold-400">{tip.title}</h4>
                    <p className="text-xs leading-relaxed text-paper-300/80 mt-1 font-sans">{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DONT's */}
          <div className="space-y-6 bg-ink-900 p-6 sm:p-8 rounded-3xl border border-crimson-500/30 shadow-xl">
            <div className="flex items-center gap-3 border-b border-paper-50/10 pb-4">
              <XCircle className="text-crimson-400" size={24} />
              <h2 className="text-xl font-bold font-display text-paper-50 uppercase tracking-wider">
                Strict Safety Don&apos;ts
              </h2>
            </div>
            <div className="space-y-4">
              {donts.map((tip) => (
                <div key={tip.id} className="p-4 rounded-2xl bg-ink-850 border border-paper-50/10 flex items-start gap-3">
                  <span className="text-2xl shrink-0">{tip.icon || '❌'}</span>
                  <div>
                    <h4 className="text-sm font-bold font-display text-crimson-400">{tip.title}</h4>
                    <p className="text-xs leading-relaxed text-paper-300/80 mt-1 font-sans">{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default SafetyTipsPage;
