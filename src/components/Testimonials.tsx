import React from 'react'
import { StarIcon } from 'lucide-react'
import { SectionHeading } from './SectionHeading'
import { Reveal } from './Reveal'
import { testimonials } from '../data/site'

export function Testimonials() {
  return (
    <section id="reviews" className="relative bg-ink-950 py-20 sm:py-28">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <SectionHeading
          index="04"
          eyebrow="Buyer feedback"
          title="What repeat buyers"
          accent="say about us"
          body="Real reviews from shopkeepers, corporate organizers, and family buyers who restock with us every season."
        />

        <div className="mt-16 grid border-t border-paper-50/10 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <Reveal
              key={item.id}
              delay={index * 0.08}
              className="group relative border-b border-paper-50/10 py-8 lg:border-l lg:px-7 lg:py-9 lg:first:border-l-0 lg:first:pl-0 flex flex-col justify-between"
            >
              <span
                className="absolute left-0 top-0 h-px w-0 bg-gold-400 transition-all duration-500 group-hover:w-full"
                aria-hidden="true"
              />
              <div>
                <div className="flex items-center gap-1 text-gold-400">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <StarIcon key={i} className="h-4 w-4 fill-gold-400" aria-hidden="true" />
                  ))}
                </div>
                <blockquote className="mt-6 font-display text-lg leading-relaxed text-paper-100 italic">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-paper-50/10 pt-4">
                <div>
                  <h4 className="font-display font-semibold text-paper-50 text-sm">{item.name}</h4>
                  <p className="text-[11px] text-paper-500">{item.location}</p>
                </div>
                <span className="rounded-full border border-paper-50/15 bg-paper-50/5 px-3 py-1 text-[10.5px] uppercase tracking-wider text-gold-400 font-semibold">
                  {item.orderSize}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
