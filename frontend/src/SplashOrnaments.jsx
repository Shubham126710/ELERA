import React, { useEffect, useRef } from 'react'

// Expressive minimal ornaments for splash drawing inspiration from Material 3 expressive:
// - Soft squiggle strokes that animate dash offset (draw/reveal then subtle shimmer)
// - A few geometric primitives (circle, rounded rect, triangle) gently drifting & rotating.
// - Ultra low contrast so brand word stays primary.
export default function SplashOrnaments(){
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if(!el) return
    const floaters = Array.from(el.querySelectorAll('[data-float]'))
    const states = floaters.map((f,i) => ({
      x: parseFloat(f.getAttribute('data-x')),
      y: parseFloat(f.getAttribute('data-y')),
      vx: (Math.random()*0.06 - 0.03),
      vy: (Math.random()*0.06 - 0.03),
      r: Math.random()*360,
      vr: (Math.random()*0.12 - 0.06),
      max: 24 + (i%3)*10,
      ox:0, oy:0
    }))
    let last = performance.now()
    let raf
    function tick(now){
      const dt = Math.min(40, now - last)
      last = now
      floaters.forEach((f,i)=>{
        const s = states[i]
        s.vx += (Math.random()-0.5)*0.002
        s.vy += (Math.random()-0.5)*0.002
        s.vx = Math.max(-0.06, Math.min(0.06, s.vx))
        s.vy = Math.max(-0.06, Math.min(0.06, s.vy))
        s.ox += s.vx * (dt*0.5)
        s.oy += s.vy * (dt*0.5)
        if(s.ox > s.max || s.ox < -s.max) s.vx *= -1
        if(s.oy > s.max || s.oy < -s.max) s.vy *= -1
        s.ox = Math.max(-s.max, Math.min(s.max, s.ox))
        s.oy = Math.max(-s.max, Math.min(s.max, s.oy))
        s.r += s.vr * dt
        f.style.transform = `translate(${s.x + s.ox}px, ${s.y + s.oy}px) rotate(${s.r.toFixed(2)}deg)`
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  return (
    <div ref={ref} className="splash-ornaments" aria-hidden>
      <svg className="squiggles" width="100%" height="100%" viewBox="0 0 1000 1000" preserveAspectRatio="none">
        <path className="squiggle" d="M80 180 Q140 120 200 180 T320 180 T440 180" />
        <path className="squiggle" d="M620 760 Q680 700 740 760 T860 760 T980 760" />
        <path className="squiggle" d="M200 560 C260 520 300 600 360 560 S460 520 520 560" />
      </svg>
      {/* floating shapes */}
      <div data-float data-x="160" data-y="260" className="flt shape-circle" />
      <div data-float data-x="780" data-y="320" className="flt shape-rect" />
      <div data-float data-x="520" data-y="640" className="flt shape-tri" />
      <div data-float data-x="340" data-y="420" className="flt shape-diamond" />
    </div>
  )
}
