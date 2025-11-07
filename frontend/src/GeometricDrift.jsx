import React, { useEffect, useRef } from 'react'

// Minimal geometric drift: outlined shapes, ultra subtle, left/right halves
export default function GeometricDrift({ side = 'left', count = 8, bottomBand = false }){
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if(!el) return
    const shapes = Array.from(el.querySelectorAll('[data-shape]'))
    // Augment with random drift parameters
    shapes.forEach((s, i) => {
      s.dataset.dx = (Math.random()*0.06 + 0.015).toString()
      s.dataset.dy = (Math.random()*0.06 + 0.015).toString()
      s.dataset.ampx = (8 + Math.random()*10).toString()
      s.dataset.ampy = (8 + Math.random()*10).toString()
      s.dataset.rotSpeed = (0.002 + Math.random()*0.004).toString()
      s.dataset.alphaBase = (0.22 + Math.random()*0.12).toString()
      s.dataset.alphaAmp = (0.08 + Math.random()*0.06).toString()
      s.style.willChange = 'transform, opacity'
    })
    let raf
    function tick(t){
      shapes.forEach((s, i) => {
        const baseY = parseFloat(s.dataset.baseY)
        const baseX = parseFloat(s.dataset.baseX)
        const dx = parseFloat(s.dataset.dx)
        const dy = parseFloat(s.dataset.dy)
        const ampx = parseFloat(s.dataset.ampx)
        const ampy = parseFloat(s.dataset.ampy)
        const rotSpeed = parseFloat(s.dataset.rotSpeed)
        const aBase = parseFloat(s.dataset.alphaBase)
        const aAmp = parseFloat(s.dataset.alphaAmp)
        const x = baseX + Math.sin(t*0.0007*dx + i) * ampx + Math.cos(t*0.0005 + i*1.3)* (ampx*0.3)
        const y = baseY + Math.cos(t*0.0006*dy + i*0.7) * ampy + Math.sin(t*0.0004 + i)* (ampy*0.25)
        const alpha = Math.min(0.6, Math.max(0.05, aBase + aAmp * Math.sin(t*0.001 + i)))
        s.style.transform = `translate(${x}px, ${y}px) rotate(${(t*rotSpeed + i*27)%360}deg)`
        s.style.opacity = alpha.toFixed(3)
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const common = { stroke:'#1e4fff', opacity:.26, fill:'none', strokeWidth:3, strokeLinecap:'round', strokeLinejoin:'round' }
  const purple = { stroke:'#a78bfa', opacity:.32, fill:'none', strokeWidth:3, strokeLinecap:'round', strokeLinejoin:'round' }
  // Generate additional shapes distributed with minimum spacing to avoid overlap
  function extraShapes(offsetX, colorStroke){
    const extras = []
    const pts = []
    const minDist = 26 // pixels in SVG/CSS space
    const maxAttempts = 200
    let attempts = 0
    while(extras.length < count && attempts < maxAttempts){
      attempts++
      const size = 12 + Math.random()*18
      const bx = (Math.random()*180 - 90) + offsetX
      const by = Math.random()*260 - 130
      // enforce spacing from previous points
      let ok = true
      for(const p of pts){
        const dx = bx - p.x
        const dy = by - p.y
        if(Math.hypot(dx, dy) < minDist){ ok = false; break }
      }
      if(!ok) continue
      pts.push({ x: bx, y: by })
      const shapeType = extras.length % 3
      if(shapeType===0){
        extras.push(<circle key={'c'+extras.length+offsetX} data-shape data-base-x={bx} data-base-y={by} cx={0} cy={0} r={size/2} style={{...purple, stroke: colorStroke}} />)
      } else if(shapeType===1){
        const half = size/2
        extras.push(<rect key={'r'+extras.length+offsetX} data-shape data-base-x={bx} data-base-y={by} x={-half} y={-half} width={size} height={size} rx={size*0.25} style={{...common, stroke: colorStroke}} />)
      } else {
        const h = size
        extras.push(<polygon key={'p'+extras.length+offsetX} data-shape data-base-x={bx} data-base-y={by} points={`0,${-h/2} ${h/2},${h/2} ${-h/2},${h/2}`} style={{...common, stroke: colorStroke}} />)
      }
    }
    return extras
  }

  const shapesLeft = (
    <svg width="200" height="300" viewBox="-100 -150 200 300">
      <g>
        <circle data-shape data-base-x="-8" data-base-y="-18" cx="0" cy="0" r="26" style={purple} />
        <polygon data-shape data-base-x="-14" data-base-y="60" points="0,0 30,50 -30,50" style={common} />
        <rect data-shape data-base-x="-4" data-base-y="140" x="-21" y="-21" width="42" height="42" rx="8" style={purple} />
        {extraShapes(-10, '#a78bfa')}
      </g>
    </svg>
  )
  const shapesRight = (
    <svg width="240" height="320" viewBox="-120 -160 240 320">
      <g>
        <polygon data-shape data-base-x="18" data-base-y="-40" points="0,-20 30,20 -30,20" style={common} />
        <circle data-shape data-base-x="-24" data-base-y="40" cx="0" cy="0" r="22" style={purple} />
        <path data-shape data-base-x="12" data-base-y="120" d="M-15 -15 h30 v30 h-30 z" style={common} />
        {extraShapes(0, '#1e4fff')}
      </g>
    </svg>
  )

  // Optional bottom illustration band: minimal cluster of shapes with subtle parallax
  const bottomBandEl = bottomBand ? (
    <svg width="1200" height="160" viewBox="0 0 1200 160" style={{ position:'absolute', left:'50%', bottom:0, transform:'translateX(-50%)', opacity:.35 }}>
      <g>
        {/* Soft wave underline */}
        <path d="M0 120 C 300 80, 600 150, 900 100 C 1050 70, 1200 110, 1200 110" fill="none" stroke="#1e4fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="12 18" />
        {/* Scattered minimal circles & diamonds */}
        {Array.from({ length: 22}).map((_,i)=>{
          const x = 40 + Math.random()*1120
          const y = 40 + Math.random()*90
          const isDiamond = i % 5 === 0
          const size = 10 + Math.random()*18
          if(isDiamond){
            return <rect key={i} x={x} y={y} width={size} height={size} transform={`rotate(45 ${x+size/2} ${y+size/2})`} rx={3} fill="none" stroke="#a78bfa" strokeWidth="3" opacity={0.45} />
          }
          return <circle key={i} cx={x} cy={y} r={size/2} fill="none" stroke="#1e4fff" strokeWidth="3" opacity={0.40} />
        })}
      </g>
    </svg>
  ) : null

  return (
    <div ref={ref} style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:2 }} aria-hidden>
      <div style={{ position:'absolute', top:'15vh', left:'max(12px, calc(50% - 550px + 24px))', width:200 }}>
        {side !== 'right' && shapesLeft}
      </div>
      <div style={{ position:'absolute', top:'17vh', right:'max(12px, calc(50% - 550px + 24px))', width:240 }}>
        {side !== 'left' && shapesRight}
      </div>
      {bottomBandEl}
    </div>
  )
}
