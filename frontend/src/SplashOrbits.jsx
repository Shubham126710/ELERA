import React, { useEffect, useRef } from 'react'

// Distinct splash animation: soft translucent orbs + thin rings orbiting around center
// Differentiates from GeometricDrift (hero) by using radial/orbital motion & layered blurs.
export default function SplashOrbits({ count = 12 }) {
  const ref = useRef(null)
  useEffect(()=>{
    const el = ref.current
    if(!el) return
    const items = Array.from(el.querySelectorAll('[data-orbit]'))
    const params = items.map((n,i)=>({
      r: parseFloat(n.dataset.r),
      speed: parseFloat(n.dataset.speed),
      phase: Math.random()*Math.PI*2,
      wobble: 4 + Math.random()*6, // slightly calmer wobble
      wobSpeed: 0.5 + Math.random()*0.6,
      z: i
    }))
    let raf
    function tick(t){
      items.forEach((n,i)=>{
        const p = params[i]
        const angle = p.phase + t*0.00025*p.speed
        const wob = Math.sin(t*0.001*p.wobSpeed + p.phase) * p.wobble
        const x = Math.cos(angle) * (p.r + wob)
        const y = Math.sin(angle) * (p.r + wob) * 0.55 // slight vertical squash
        n.style.transform = `translate(${x}px, ${y}px)`
        if(n.dataset.type === 'ring') {
          n.style.transform += ` rotate(${(angle*57.3)%360}deg)`
        }
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const rings = []
  const blobs = []
  for(let i=0;i<count;i++){
    const isRing = i % 3 === 0
    const r = 60 + i*34 // more separation between rings
    const speed = 0.55 + i*0.06 + Math.random()*0.18
    if(isRing){
      rings.push(
        <div key={'ring'+i} data-orbit data-type="ring" data-r={r} data-speed={speed}
             style={{ position:'absolute', left:0, top:0, width: r*2, height:r*2, marginLeft:-r, marginTop:-r, border:`1.5px solid ${i%2===0 ? '#1e4fff' : '#a78bfa'}` , borderRadius:'50%', opacity:.12 }} />
      )
    } else {
      const size = 22 + Math.random()*34
      blobs.push(
        <div key={'blob'+i} data-orbit data-type="blob" data-r={r} data-speed={speed}
             style={{ position:'absolute', left:0, top:0, width:size, height:size, marginLeft:-size/2, marginTop:-size/2, background:'radial-gradient(circle at 30% 30%, rgba(167,139,250,0.45), rgba(167,139,250,0) 70%)', borderRadius:'50%', filter:'blur(1.2px)', opacity:.4 }} />
      )
    }
  }

  return (
    <div ref={ref} aria-hidden style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none', zIndex:1 }}>
      <div style={{ position:'relative', width:520, height:360 }}>
        {rings}
        {blobs}
      </div>
    </div>
  )
}
