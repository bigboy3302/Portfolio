import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { createPortal } from "react-dom";

export default function MobilePaintMenu() {
  const [open, setOpen] = useState(false);

  // ESC to close
  useEffect(() => {
    function onKey(e){ if (e.key === "Escape") setOpen(false); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // lock body scroll when open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = open ? "hidden" : prev || "";
    return () => { document.body.style.overflow = prev || ""; };
  }, [open]);

  // Overlay rendered to body (portal) so it's not clipped by <nav>
  const overlay = open ? createPortal(
    <div className="mpm-overlay" role="dialog" aria-modal="true" aria-label="Navigation">
      {/* Backdrop click closes */}
      <button className="mpm-backdrop" aria-label="Close menu" onClick={() => setOpen(false)} />

      {/* Menu sheet */}
      <nav className="mpm-sheet">
        <header className="mpm-head">
          <div className="mpm-title">Navigate</div>
          <button className="mpm-close" aria-label="Close" onClick={() => setOpen(false)}>✕</button>
        </header>

        <ul className="mpm-list" role="menu">
          {[
            { to: "/", label: "Home" },
            { to: "/skill", label: "Skills" },
            { to: "/projects", label: "Projects" },
            { to: "/contact", label: "Contact" },
          ].map(item => (
            <li key={item.to} role="none">
              <NavLink
                to={item.to}
                role="menuitem"
                className="mpm-link paint"
                onClick={() => setOpen(false)}
              >
                <span className="paint-ink" aria-hidden="true" />
                <span className="paint-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>,
    document.body
  ) : null;

  return (
    <div className="mpm">
      <button
        className={`mpm-burger ${open ? "is-open" : ""}`}
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <span/><span/><span/>
      </button>

      {overlay}
    </div>
  );
}
