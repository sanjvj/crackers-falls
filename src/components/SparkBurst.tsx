import React from 'react'
import { motion } from 'framer-motion'

export function SparkBurst() {
  const particles = Array.from({ length: 8 })

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
      {particles.map((_, i) => {
        const angle = (i * 360) / particles.length
        const rad = (angle * Math.PI) / 180
        const distance = 28 + Math.random() * 12
        const tx = Math.cos(rad) * distance
        const ty = Math.sin(rad) * distance

        return (
          <motion.span
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: tx, y: ty, opacity: 0, scale: 0.2 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute h-1.5 w-1.5 rounded-full bg-gold-400 shadow-[0_0_8px_#f2c230]"
          />
        )
      })}
    </div>
  )
}
