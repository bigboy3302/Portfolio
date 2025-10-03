import React, { useRef } from 'react'
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion.js'

export default function ThreeCard({ title, children, footer, as:Tag='div' }){
  const wrapRef = useRef(null)
  const reduced = usePrefersReducedMotion()

  function handle(e){
    if (reduced) return
    const rect = wrapRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const rx = ((y / rect.height) - .5) * -10
    const ry = ((x / rect.width) - .5) * 10
    wrapRef.current.style.setProperty('--mx', `${x}px`)
    wrapRef.current.style.setProperty('--my', `${y}px`)
    wrapRef.current.querySelector('.tile').style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(10px)`
  }
  function reset(){
    if (reduced) return
    const tile = wrapRef.current.querySelector('.tile')
    tile.style.transform = 'rotateX(0) rotateY(0) translateZ(0)'
  }

  return (
    <Tag className="tilt" ref={wrapRef} onMouseMove={handle} onMouseLeave={reset} tabIndex={0} aria-label={title}>
      <div className="card tile" style={{position:'relative'}}>
        <div className="shine" aria-hidden="true"></div>
        <h3 style={{marginTop:0}}>{title}</h3>
        <div>{children}</div>
        {footer && <div style={{marginTop:'1rem'}}>{footer}</div>}
      </div>
    </Tag>
  )
}
