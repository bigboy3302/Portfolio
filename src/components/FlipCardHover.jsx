// src/components/FlipCardHover.jsx
import React from "react";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion.js";

/**
 * FlipCardHover (JSX version)
 * - Smooth 3D flip on hover/focus.
 * - Percentage on FRONT only; BACK shows image + text.
 *
 * Props:
 *  - front: ReactNode
 *  - back: ReactNode
 *  - backImg?: string
 *  - gradient?: "violet" | "cyan" | "pink" | "amber" | string
 *  - className?: string
 */
export default function FlipCardHover({
  front,
  back,
  backImg,
  gradient = "violet",
  className = "",
}) {
  const reduced = usePrefersReducedMotion();

  const gradients = {
    violet: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
    cyan:   "linear-gradient(135deg, #06b6d4, #22d3ee)",
    pink:   "linear-gradient(135deg, #ec4899, #8b5cf6)",
    amber:  "linear-gradient(135deg, #f59e0b, #f97316)",
  };

  const bg = gradients[gradient] || gradient;

  // Use a computed key so we can set a CSS variable in plain JS
  const styleVars = { ["--flip-gradient"]: bg };

  return (
    <div className={`flip3d ${className}`}>
      <div
        className={`flip3d-inner${reduced ? " reduced" : ""}`}
        tabIndex={0}
        aria-label="Flip card"
        style={styleVars}
      >
        {/* FRONT (percentage lives here) */}
        <div className="flip3d-face flip3d-front">
          <div className="flip3d-overlay">{front}</div>
        </div>

        {/* BACK (image + text) */}
        <div className="flip3d-face flip3d-back">
          {backImg && <img className="flip3d-img" src={backImg} alt="" />}
          <div className="flip3d-overlay">{back}</div>
        </div>
      </div>
    </div>
  );
}
