import React from 'react';
import { motion } from 'framer-motion';
import { Factory, ShieldCheck, Sparkles, Truck, Award, Percent, CheckCircle2 } from 'lucide-react';
import type { WhyChooseUsCard } from '../../types';
import { staggerContainer, fadeInUp } from '../../lib/motionVariants';

interface WhyChooseUsProps {
  cards: WhyChooseUsCard[];
}

export const WhyChooseUs: React.FC<WhyChooseUsProps> = ({ cards }) => {
  const activeCards = cards.filter(c => c.active !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const displayCards = activeCards.length > 0 ? activeCards : [
    {
      id: '1',
      title: 'Direct Sivakasi Wholesale',
      description: 'Direct factory pricing with zero middleman commission markups.',
      icon: 'Factory',
      stat: '100%',
      statLabel: 'Factory Direct Rate',
      order: 0,
      active: true
    },
    {
      id: '2',
      title: 'Safe Packed Transport',
      description: 'Custom heavy-duty moisture barrier packaging for safe transport across India.',
      icon: 'ShieldCheck',
      stat: '100%',
      statLabel: 'Safe Delivery Guaranteed',
      order: 1,
      active: true
    },
    {
      id: '3',
      title: 'Quality Assured Fireworks',
      description: '100% tested colorful fountains, aerial sky shots, and traditional sound crackers.',
      icon: 'Sparkles',
      stat: 'A+ Grade',
      statLabel: 'Strict Quality Checks',
      order: 2,
      active: true
    },
    {
      id: '4',
      title: 'Fast Nationwide Dispatch',
      description: 'Direct Sivakasi dispatch hub connection with transport tracking updates.',
      icon: 'Truck',
      stat: '24-48h',
      statLabel: 'Fast Dispatch Time',
      order: 3,
      active: true
    }
  ];

  const getIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case 'factory': return <Factory size={24} className="text-amber-400" />;
      case 'shieldcheck':
      case 'shield': return <ShieldCheck size={24} className="text-emerald-400" />;
      case 'truck': return <Truck size={24} className="text-amber-400" />;
      case 'award': return <Award size={24} className="text-amber-400" />;
      case 'percent': return <Percent size={24} className="text-rose-400" />;
      default: return <Sparkles size={24} className="text-amber-400" />;
    }
  };

  return (
    <section id="why-choose-us" className="py-20 bg-[#0d1117] relative z-20 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#161b22] border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest">
            <CheckCircle2 size={13} />
            <span>THE CRACKERS FALLS ADVANTAGE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
            Why Choose <span className="gold-gradient-text">Crackers Falls</span>?
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Trusted Sivakasi wholesale brand delivering authentic high-grade fireworks across Tamil Nadu & India.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {displayCards.map((card) => (
            <motion.div key={card.id} variants={fadeInUp}>
              <div className="bg-[#161b22] border border-white/10 p-6 rounded-2xl flex flex-col justify-between space-y-5 hover:border-amber-400/40 transition-all h-full">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-[#0d1117] border border-white/10 flex items-center justify-center">
                    {getIcon(card.icon)}
                  </div>
                  <h3 className="text-lg font-bold font-display text-white">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    {card.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-baseline justify-between">
                  <div>
                    <span className="text-xl font-extrabold font-display text-amber-400">
                      {card.stat}
                    </span>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      {card.statLabel}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
