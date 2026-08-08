import React from 'react'

export function FuseDivider({ label }: { label?: string }) {
  return (
    <div className="relative border-y border-gold-400/15 bg-ink-900/40 py-6 text-center">
      <div className="mx-auto flex max-w-xl items-center justify-center gap-4 px-5">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-400/30 to-gold-400/60" />
        <span className="sparkle h-3 w-3 shrink-0 bg-gold-400" aria-hidden="true" />
        {label ? (
          <span className="text-[11px] font-medium uppercase tracking-[0.28em] text-paper-500">{label}</span>
        ) : null}
        <span className="sparkle h-3 w-3 shrink-0 bg-gold-400" aria-hidden="true" />
        <span className="h-px flex-1 bg-gradient-to-l from-transparent via-gold-400/30 to-gold-400/60" />
      </div>
    </div>
  )
}
