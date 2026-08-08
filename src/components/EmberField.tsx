import React, { useEffect, useRef } from 'react'

type Ember = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  maxLife: number
  warm: boolean
}

/**
 * A very restrained ambient layer: a handful of embers drifting upward.
 * Pauses when the tab is hidden and near-freezes for reduced motion.
 */
export function EmberField({ className = '', density = 26 }: { className?: string; density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let width = 0
    let height = 0
    let raf = 0
    const embers: Ember[] = []

    const spawn = (initial = false): Ember => ({
      x: Math.random() * width,
      y: initial ? Math.random() * height : height + 8,
      vx: (Math.random() - 0.5) * 0.16,
      vy: -(0.14 + Math.random() * 0.34) * (reduced ? 0.35 : 1),
      size: 0.6 + Math.random() * 1.3,
      life: 0,
      maxLife: 420 + Math.random() * 460,
      warm: Math.random() > 0.4,
    })

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const tick = () => {
      ctx.clearRect(0, 0, width, height)
      for (let i = 0; i < embers.length; i++) {
        const e = embers[i]
        e.life += 1
        e.x += e.vx
        e.y += e.vy
        const progress = e.life / e.maxLife
        const alpha = Math.sin(Math.PI * progress) * 0.55
        ctx.globalAlpha = Math.max(alpha, 0)
        ctx.fillStyle = e.warm ? '#e2503f' : '#f2c230'
        ctx.beginPath()
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2)
        ctx.fill()
        if (e.life >= e.maxLife || e.y < -10) {
          embers[i] = spawn()
        }
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(tick)
    }

    resize()
    for (let i = 0; i < density; i++) embers.push(spawn(true))
    raf = requestAnimationFrame(tick)

    const onVisibility = () => {
      cancelAnimationFrame(raf)
      if (!document.hidden) raf = requestAnimationFrame(tick)
    }

    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [density])

  return <canvas ref={canvasRef} aria-hidden="true" className={`pointer-events-none ${className}`} />
}
