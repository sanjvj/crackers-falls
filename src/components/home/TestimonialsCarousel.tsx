import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight, MessageSquareQuote, CheckCircle2 } from 'lucide-react';
import type { Testimonial } from '../../types';
import { fadeInUp } from '../../lib/motionVariants';

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
}

export const TestimonialsCarousel: React.FC<TestimonialsCarouselProps> = ({ testimonials }) => {
  const activeTestimonials = testimonials.filter(t => t.active !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const displayTestimonials = activeTestimonials.length > 0 ? activeTestimonials : [
    {
      id: 't1',
      name: 'Ramesh Kumar',
      location: 'Chennai, Tamil Nadu',
      rating: 5,
      review: 'Ordered wholesale crackers for our entire apartment society. Quality of Flower Pots and Aerial Sky Shots was outstanding! Delivered securely in 2 days from Sivakasi.',
      order: 0,
      active: true
    },
    {
      id: 't2',
      name: 'Karthik Subramanian',
      location: 'Coimbatore, Tamil Nadu',
      rating: 5,
      review: 'Genuine Sivakasi factory rate without any broker commission. Every single item burned cleanly and packed safely. Crackers Falls is our permanent supplier now!',
      order: 1,
      active: true
    },
    {
      id: 't3',
      name: 'Venkatesh Prasad',
      location: 'Bengaluru, Karnataka',
      rating: 5,
      review: 'Excellent wholesale packing and super fast transport dispatch. The WhatsApp order flow was seamless and transparent.',
      order: 2,
      active: true
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (displayTestimonials.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % displayTestimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [displayTestimonials.length]);

  const current = displayTestimonials[currentIndex] || displayTestimonials[0];

  return (
    <section id="testimonials" className="py-20 bg-[#0d1117] relative z-20 border-b border-white/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
        {/* Header */}
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#161b22] border border-amber-400/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
            <MessageSquareQuote size={13} />
            <span>WHOLESALE CUSTOMER REVIEWS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
            What Our <span className="gold-gradient-text">Buyers Say</span>
          </h2>
        </div>

        {/* Testimonial Card */}
        <div className="relative min-h-[200px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id || currentIndex}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={fadeInUp}
              className="bg-[#161b22] border border-white/10 p-8 sm:p-10 rounded-2xl space-y-5 max-w-2xl w-full text-center relative shadow-xl"
            >
              <Quote className="absolute top-5 right-5 w-10 h-10 text-white/5 pointer-events-none" />

              {/* Star Rating */}
              <div className="flex items-center justify-center gap-1 text-amber-400">
                {Array.from({ length: current.rating || 5 }).map((_, i) => (
                  <Star key={i} size={18} fill="currentColor" />
                ))}
              </div>

              {/* Review Quote */}
              <p className="text-sm sm:text-lg text-slate-200 font-sans italic leading-relaxed">
                "{current.review}"
              </p>

              {/* Author */}
              <div>
                <h4 className="text-base font-bold font-display text-white flex items-center justify-center gap-1.5">
                  <span>{current.name}</span>
                  <CheckCircle2 size={15} className="text-emerald-400" />
                </h4>
                <p className="text-xs text-amber-400 font-semibold">
                  {current.location} • Verified Buyer
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        {displayTestimonials.length > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setCurrentIndex((prev) => (prev === 0 ? displayTestimonials.length - 1 : prev - 1))}
              className="p-2 rounded-full bg-[#161b22] border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>

            {displayTestimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex ? 'w-6 bg-amber-400' : 'w-2 bg-slate-700'
                }`}
              />
            ))}

            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % displayTestimonials.length)}
              className="p-2 rounded-full bg-[#161b22] border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
