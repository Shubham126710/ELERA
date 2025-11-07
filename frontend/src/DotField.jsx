import React, { useEffect, useRef } from 'react'

// Subtle purple particle field
// variant "page" mimics cozy page speckles via grid-with-jitter dots
export default function DotField({ density = 40, variant = 'page', spacing = 56, jitter = 14, fullPage = false }) {
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)
  const animRef = useRef(0)
  const dotsRef = useRef([])
  const lastTimeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    function resize() {
      const dpr = window.devicePixelRatio || 1
      // reset any previous scale first
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      const w = fullPage ? window.innerWidth : canvas.offsetWidth
      const h = fullPage ? Math.max(document.documentElement.scrollHeight, window.innerHeight) : canvas.offsetHeight
      if (wrap && fullPage) wrap.style.height = `${h}px`
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)
    if (fullPage) window.addEventListener('scroll', resize, { passive: true })

    function initDots() {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      if (variant === 'page') {
        const arr = []
        const step = Math.max(28, spacing)
        for (let y = step * 0.5; y < h; y += step) {
          for (let x = step * 0.5; x < w; x += step) {
            const jx = (Math.random() * 2 - 1) * jitter
            const jy = (Math.random() * 2 - 1) * jitter
            arr.push({
              x: x + jx,
              y: y + jy,
              r: 0.9 + Math.random() * 1.4,
              vx: (Math.random() - 0.5) * 0.02,
              vy: (Math.random() - 0.5) * 0.02,
              base: 0.035 + Math.random() * 0.035,
              amp: 0.02 + Math.random() * 0.025,
              phase: Math.random() * Math.PI * 2,
            })
          }
        }
        dotsRef.current = arr
      } else {
        // random drift variant
        dotsRef.current = Array.from({ length: density }).map(() => ({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 2 + Math.random() * 3,
          vx: (Math.random() - 0.5) * 0.06,
          vy: (Math.random() - 0.5) * 0.06,
          base: 0.07 + Math.random() * 0.08,
          amp: 0,
          phase: 0,
        }))
      }
    }
    initDots()

    function step(ts) {
      const elapsed = ts - lastTimeRef.current
      lastTimeRef.current = ts
      // Clear with transparent background (no trails)
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      for (const d of dotsRef.current) {
        // Update position (wrap edges for continuous field)
        d.x += d.vx * (elapsed * 0.06)
        d.y += d.vy * (elapsed * 0.06)
        if (d.x < 0) d.x += w; else if (d.x > w) d.x -= w
        if (d.y < 0) d.y += h; else if (d.y > h) d.y -= h
        ctx.beginPath()
        const alpha = Math.min(0.18, Math.max(0, d.base + (d.amp ? d.amp * (0.5 + 0.5 * Math.sin(d.phase + ts * 0.0012)) : 0)))
        ctx.fillStyle = `rgba(167,139,250,${alpha.toFixed(3)})` // #a78bfa subtle
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
        ctx.fill()
      }
      animRef.current = requestAnimationFrame(step)
    }
    animRef.current = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
      if (fullPage) window.removeEventListener('scroll', resize)
    }
  }, [density, fullPage])

  return (
    <div ref={wrapRef} style={{ position: fullPage ? 'fixed' : 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }} aria-hidden="true">
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
