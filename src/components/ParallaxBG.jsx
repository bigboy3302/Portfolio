import React, { useEffect, useRef } from "react";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion.js";

export default function ParallaxBG() {
  const reduced = usePrefersReducedMotion();
  const wrapRef = useRef(null);

  useEffect(() => {
    if (reduced) return;
    const el = wrapRef.current;
    let rx = 0, ry = 0, tx = 0, ty = 0;
    const damp = 0.06;

    function onMove(e) {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      tx = (e.clientX - cx) / cx; // -1..1
      ty = (e.clientY - cy) / cy;
    }
    const onScroll = () => {
      const y = window.scrollY;
      el.style.setProperty("--scroll", Math.min(1, y / 800));
    };
    const raf = () => {
      rx += (tx - rx) * damp;
      ry += (ty - ry) * damp;
      el.style.setProperty("--rx", rx.toFixed(3));
      el.style.setProperty("--ry", ry.toFixed(3));
      requestAnimationFrame(raf);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); requestAnimationFrame(raf);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [reduced]);

  return (
    <div ref={wrapRef} className="bg-orbs" aria-hidden="true">
      <div className="orb orb-a" />
      <div className="orb orb-b" />
      <div className="orb orb-c" />
    </div>
  );
}
