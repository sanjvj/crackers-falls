import React, { useEffect, useRef } from 'react'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

type Shell = {
  x: number
  y: number
  vy: number
  targetY: number
  color: string
}

const COLORS = ['#f7c53a', '#f95a0c', '#ff5db1', '#3ddbd0', '#fdeaa8', '#ff7c34']

/**
 * Lightweight canvas fireworks. Shells launch from the bottom and burst
 * into a ring of fading embers. Pauses when the tab is hidden and
 * respects prefers-reduced-motion.
 */
export function FireworksCanvas({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let width = 0
    let height = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let frame = 0
    let raf = 0
    let lastLaunch = 0

    const particles: Particle[] = []
    const shells: Shell[] = []

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const launch = () => {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]
      shells.push({
        x: width * (0.12 + Math.random() * 0.76),
        y: height,
        vy: -(height / 90) * (0.9 + Math.random() * 0.4),
        targetY: height * (0.12 + Math.random() * 0.35),
        color,
      })
    }

    const burst = (x: number, y: number, color: string) => {
      const count = reduced ? 18 : 46
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2
        const speed = 1.2 + Math.random() * 2.8
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 60 + Math.random() * 45,
          color: Math.random() > 0.75 ? '#ffffff' : color,
          size: 1 + Math.random() * 1.8,
        })
      }
    }

    const tick = (time: number) => {
      frame += 1
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = 'rgba(0,0,0,0.16)'
      ctx.fillRect(0, 0, width, height)
      ctx.globalCompositeOperation = 'lighter'

      const interval = reduced ? 3200 : 1150
      if (time - lastLaunch > interval && shells.length < 4) {
        lastLaunch = time
        launch()
      }

      for (let i = shells.length - 1; i >= 0; i--) {
        const shell = shells[i]
        shell.y += shell.vy
        ctx.beginPath()
        ctx.fillStyle = shell.color
        ctx.globalAlpha = 0.9
        ctx.arc(shell.x, shell.y, 1.8, 0, Math.PI * 2)
        ctx.fill()
        // trailing spark
        ctx.globalAlpha = 0.25
        ctx.fillRect(shell.x - 0.5, shell.y, 1, 14)
        if (shell.y <= shell.targetY) {
          burst(shell.x, shell.y, shell.color)
          shells.splice(i, 1)
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.life += 1
        p.vy += 0.022
        p.vx *= 0.985
        p.vy *= 0.985
        p.x += p.vx
        p.y += p.vy
        const alpha = Math.max(0, 1 - p.life / p.maxLife)
        ctx.globalAlpha = alpha * (0.85 + Math.sin(frame * 0.3 + i) * 0.15)
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        if (p.life >= p.maxLife) particles.splice(i, 1)
      }

      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
      raf = requestAnimationFrame(tick)
    }

    resize()
    window.addEventListener('resize', resize)
    raf = requestAnimationFrame(tick)

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf)
      } else {
        raf = requestAnimationFrame(tick)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden="true" className={`pointer-events-none ${className}`} />
}
