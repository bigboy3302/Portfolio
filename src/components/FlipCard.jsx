import React, { useState } from "react";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion.js";

/**
 * FlipCard
 * Props:
 *  - front: ReactNode
 *  - back: ReactNode
 *  - className?: string
 *  - gradient?: "violet" | "cyan" | "pink" | "amber" | [custom css string]
 */
export default function FlipCard({
  front,
  back,
  className = "",
  gradient = "violet",
}) {
  const [flipped, setFlipped] = useState(false);
  const reduced = usePrefersReducedMotion();

  const onToggle = () => setFlipped(v => !v);
  const onKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle();
    }
  };

  const gradStyles = {
    violet: "linear-gradient(-135deg, #5b21b6, #06b6d4)",
    cyan:   "linear-gradient(-135deg, #06b6d4, #22d3ee)",
    pink:   "linear-gradient(-135deg, #ec4899, #8b5cf6)",
    amber:  "linear-gradient(-135deg, #f59e0b, #f97316)"
  };

  const bg = gradStyles[gradient] || gradient;

  return (
    <div className={`flip-container ${className}`} aria-live="polite">
      <div
        className={`flip-card${flipped ? " flipped" : ""}${reduced ? " reduced" : ""}`}
        onClick={onToggle}
        onKeyDown={onKey}
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        aria-label={flipped ? "Show front" : "Show back"}
        style={{ "--flip-gradient": bg }}
      >
        <div className="flip-face flip-front">
          {front}
        </div>
        <div className="flip-face flip-back">
          {back}
        </div>
      </div>
    </div>
  );
}
