import React, { useEffect } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { ToastProvider } from './components/Toast.jsx'
import usePrefersReducedMotion from './hooks/usePrefersReducedMotion.js'
import CursorFX from './components/CursorFX.jsx'
import ParallaxBG from './components/ParallaxBG.jsx'   // <-- note the "./"
import RouteTransition from './components/RouteTransition.jsx' // <-- add this

export default function App(){
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    document.body.classList.toggle('reduced-motion', prefersReduced)
  }, [prefersReduced])

  return (
    <ToastProvider>
      {/* global background + cursor */}
      <ParallaxBG />
      <CursorFX />

      <nav className="nav" aria-label="Primary">
        <div className="container nav-inner">
          <div className="brand" aria-label="Site logo">Portfolio</div>
          <div role="menubar">
            <NavLink to="/" role="menuitem" className={({isActive}) => isActive ? 'active' : ''}>Home</NavLink>
            <NavLink to="/skills" role="menuitem" className={({isActive}) => isActive ? 'active' : ''}>Skills</NavLink>
            <NavLink to="/projects" role="menuitem" className={({isActive}) => isActive ? 'active' : ''}>Projects</NavLink>
            <NavLink to="/contact" role="menuitem" className={({isActive}) => isActive ? 'active' : ''}>Contact</NavLink>
          </div>
        </div>
      </nav>

      <main>
        <RouteTransition>
          <Outlet />
        </RouteTransition>
      </main>
    </ToastProvider>
  )
}
