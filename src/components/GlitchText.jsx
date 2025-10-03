import React, { useEffect, useRef, useState } from "react";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion.js";

/**
 * <GlitchText text="React — since 2023" locked={false} />
 * - Scrambles to decode when visible/focused.
 * - If locked=true, shows clean text and disables glitch layers/animation.
 */
export default function GlitchText({ text, duration = 900, delay = 0, className = "", as:Tag = "div", locked = false }) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef(null);
  const [display, setDisplay] = useState(text);
  const [isDone, setDone] = useState(false);
  const animRef = useRef(0);
  const scramble = "█▓▒░<>/\\|!?@#$%^&*+=-_~;:[]{}()ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  function run() {
    if (locked || reduced) { setDisplay(text); setDone(true); return; }
    const target = text;
    const length = target.length;
    const start = performance.now();
    setDone(false);

    function frame(now) {
      const t = Math.min(1, (now - start - delay) / duration);
      if (t <= 0) { animRef.current = requestAnimationFrame(frame); return; }

      const reveal = Math.floor(t * length);
      let out = "";
      for (let i = 0; i < length; i++) {
        if (i < reveal) out += target[i];
        else out += target[i] === " " ? " " : scramble[Math.floor(Math.random() * scramble.length)];
      }
      setDisplay(out);
      if (t < 1) animRef.current = requestAnimationFrame(frame);
      else setDone(true);
    }
    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(frame);
  }

  useEffect(() => {
    if (locked) { setDisplay(text); setDone(true); return; }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) run(); }, { threshold: 0.35 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(animRef.current); };
  }, [text, locked, reduced, duration, delay]);

  // Re-run on focus if not locked
  function onFocus() { if (!locked) run(); }

  return (
    <Tag ref={ref} tabIndex={0} onFocus={onFocus} className={`glitch-wrap ${className}`} aria-live="polite">
      <span className={`glitch-text ${isDone ? "done" : ""}`} aria-label={text}>{display}</span>
      {!locked && (
        <>
          <span className="glitch-layer red" aria-hidden="true">{display}</span>
          <span className="glitch-layer blue" aria-hidden="true">{display}</span>
        </>
      )}
    </Tag>
  );
}
