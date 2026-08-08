import React from 'react'
import { motion } from 'framer-motion'

type RevealProps = {
  children: React.ReactNode
  delay?: number
  y?: number
  className?: string
  as?: 'div' | 'li' | 'article' | 'section'
}

/**
 * Shared scroll-reveal wrapper so every section rises with the same
 * easing curve and distance. Keeps motion consistent and restrained.
 */
export function Reveal({ children, delay = 0, y = 18, className, as = 'div' }: RevealProps) {
  const Component = motion[as]
  return (
    <Component
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </Component>
  )
}
