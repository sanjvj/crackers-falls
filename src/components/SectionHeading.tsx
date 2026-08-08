import React from 'react'
import { Reveal } from './Reveal'

type SectionHeadingProps = {
  index?: string
  eyebrow: string
  title: string
  accent?: string
  highlight?: string
  body?: string
  className?: string
}

export function SectionHeading({ index, eyebrow, title, accent, highlight, body, className = '' }: SectionHeadingProps) {
  const displayAccent = accent || highlight

  return (
    <div className={`max-w-3xl ${className}`}>
      <Reveal>
        <p className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-paper-500 font-bold">
          {index && <span className="tnum text-crimson-400 font-bold">{index}</span>}
          <span className="h-px w-8 bg-gold-400/50" aria-hidden="true" />
          {eyebrow}
        </p>
      </Reveal>
      <Reveal delay={0.07}>
        <h2 className="mt-5 font-display text-[2.1rem] font-bold leading-[1.05] tracking-tight text-paper-50 sm:text-5xl lg:text-[3.4rem]">
          {title}
          {displayAccent ? (
            <>
              {' '}
              <span className="italic text-gold-400 glow-gold">{displayAccent}</span>
            </>
          ) : null}
        </h2>
      </Reveal>
      {body ? (
        <Reveal delay={0.12}>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-paper-300/80 font-sans">{body}</p>
        </Reveal>
      ) : null}
    </div>
  )
}
