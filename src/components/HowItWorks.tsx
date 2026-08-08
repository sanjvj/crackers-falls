import React from 'react'
import { SectionHeading } from './SectionHeading'
import { Reveal } from './Reveal'
import { steps } from '../data/site'

export function HowItWorks() {
  return (
    <section id="process" className="relative bg-ink-950 py-20 sm:py-28">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <SectionHeading
          index="03"
          eyebrow="The process"
          title="From price list to"
          accent="your doorstep"
          body="A wholesale flow built for speed — most orders are confirmed the same day they land in our WhatsApp inbox."
        />

        <ol className="mt-16 grid border-t border-paper-50/10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Reveal
              key={step.number}
              as="li"
              delay={index * 0.08}
              className="group relative border-b border-paper-50/10 py-8 lg:border-l lg:px-7 lg:py-9 lg:first:border-l-0 lg:first:pl-0"
            >
              <span
                className="absolute left-0 top-0 h-px w-0 bg-gold-400 transition-all duration-500 group-hover:w-full"
                aria-hidden="true"
              />
              <span className="tnum font-display text-4xl font-semibold leading-none text-crimson-400">
                {step.number}
              </span>
              <h3 className="mt-7 font-display text-[17px] font-semibold leading-snug text-paper-100">
                {step.title}
              </h3>
              <p className="mt-2.5 max-w-xs text-[13.5px] leading-relaxed text-paper-500 font-sans">{step.description}</p>
              <p className="mt-6 flex items-center gap-2 text-[10.5px] uppercase tracking-[0.2em] text-gold-400/80 font-bold">
                <span className="h-1 w-1 rounded-full bg-gold-400" aria-hidden="true" />
                {step.detail}
              </p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
