import React, { useEffect, useRef, useState } from 'react'

/**
 * Accessible semicircle progress using SVG.
 * Props: label (string), value (0-100 number)
 * Animates from 0 to value when scrolled into view.
 */
export default function SemiCircleProgress({ label, value }){
  const clamped = Math.max(0, Math.min(100, value ?? 0))
  const [pct, setPct] = useState(0)
  const ref = useRef(null)
  const radius = 60
  const circumference = Math.PI * radius

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting){
        // Animate from 0 to clamped
        const start = performance.now()
        const duration = 1200
        const target = clamped
        function tick(now){
          const t = Math.min(1, (now - start)/duration)
          const eased = 1 - Math.pow(1 - t, 3)
          setPct(Math.round(eased * target))
          if (t < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        io.disconnect()
      }
    }, { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [clamped])

  const dash = (pct/100) * circumference

  return (
    <div ref={ref} className="card" style={{textAlign:'center'}} tabIndex={0} aria-label={`${label} ${pct}%`}>
      <svg width="160" height="90" role="img" aria-labelledby={`title-${label}`}>
        <title id={`title-${label}`}>{label}: {pct}%</title>
        <g transform="translate(80,80)">
          <path d="M -60 0 A 60 60 0 0 1 60 0" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="14" />
          <path d="M -60 0 A 60 60 0 0 1 60 0" fill="none"
            stroke="url(#grad)" strokeWidth="14" strokeLinecap="round"
            strokeDasharray="{circumference}" strokeDashoffset="{circumference - dash}">
          </path>
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#06b6d4"/>
              <stop offset="100%" stopColor="#8b5cf6"/>
            </linearGradient>
          </defs>
        </g>
      </svg>
      <div style={{fontWeight:700, marginTop:-8}}>{label}</div>
      <div style={{color:'var(--muted)'}} aria-hidden="true">{pct}%</div>
    </div>
  )
}
