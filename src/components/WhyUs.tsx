import React from 'react'
import { FactoryIcon, SparklesIcon, TruckIcon, ShieldCheckIcon } from 'lucide-react'
import { SectionHeading } from './SectionHeading'
import { Reveal } from './Reveal'
import { features } from '../data/site'

const iconMap = {
  factory: FactoryIcon,
  sparkles: SparklesIcon,
  truck: TruckIcon,
  shield: ShieldCheckIcon,
}

export function WhyUs() {
  return (
    <section id="why" className="relative bg-ink-950 py-20 sm:py-28">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <SectionHeading
          index="01"
          eyebrow="The advantage"
          title="Four reasons retailers"
          accent="restock with us"
          body="We are a godown, not a middleman. That single fact shapes the rate you pay, the packing you receive and how fast it reaches you."
        />

        <div className="mt-16 grid border-t border-paper-50/10 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon as keyof typeof iconMap] || SparklesIcon
            return (
              <Reveal
                key={feature.title}
                delay={index * 0.08}
                className="group relative border-b border-paper-50/10 py-8 lg:border-l lg:px-7 lg:py-9 lg:first:border-l-0 lg:first:pl-0"
              >
                <span
                  className="absolute left-0 top-0 h-px w-0 bg-gold-400 transition-all duration-500 group-hover:w-full"
                  aria-hidden="true"
                />
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-paper-50/15 text-gold-400 transition-colors duration-300 group-hover:border-crimson-500 group-hover:text-crimson-400">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <p className="tnum mt-8 font-display text-[2.6rem] font-bold leading-none text-paper-50">
                  {feature.stat}
                </p>
                <p className="mt-2 text-[10.5px] uppercase tracking-[0.2em] text-paper-500 font-bold">{feature.statLabel}</p>
                <h3 className="mt-7 font-display text-[17px] font-bold leading-snug text-paper-100">
                  {feature.title}
                </h3>
                <p className="mt-2.5 max-w-xs text-[13.5px] leading-relaxed text-paper-500 font-sans">{feature.description}</p>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
