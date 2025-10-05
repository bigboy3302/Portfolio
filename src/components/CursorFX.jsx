// src/components/CursorFX.jsx
import React, { useEffect, useRef } from "react";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion.js";

export default function CursorFX() {
  const reduced = usePrefersReducedMotion();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });

    // size
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      // also clamp to new bounds
      mx = clamp(mx, margin, w - margin);
      my = clamp(my, margin, h - margin);
    };
    window.addEventListener("resize", onResize);

    // helpers
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const margin = 80;            // keep glow away from the edges
    const ease = reduced ? 0.25 : 0.18;

    // spotlight state
    let hue = 265;
    let lightRadius = 160;
    let alpha = 1;                // will be animated on enter/leave
    let fadeTarget = 1;

    // pointer state
    let mx = clamp(w / 2, margin, w - margin);
    let my = clamp(h / 2, margin, h - margin);
    let x = mx, y = my;

    // particles (desktop only)
    const particles = [];
    const maxParticles = reduced ? 60 : 180;

    const spawnParticles = (px, py, h) => {
      if (reduced) return;
      const count = 6;
      for (let i = 0; i < count; i++) {
        if (particles.length >= maxParticles) particles.shift();
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.6 + Math.random() * 1.6;
        particles.push({
          x: px + (Math.random() - 0.5) * 6,
          y: py + (Math.random() - 0.5) * 6,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          size: 2 + Math.random() * 2.5,
          hue: h + (Math.random() * 40 - 20),
        });
      }
    };

    // color cycling when hovering interactive things
    const palette = [265, 190, 340, 45, 140, 210];
    const setHueFromTarget = (target) => {
      const t = target?.closest("[data-cursor-color],button,a,[role='button'],.button");
      if (!t) return;
      const data = t.getAttribute("data-cursor-color");
      if (data) {
        // try parsing CSS color → hue
        const tmp = document.createElement("div");
        tmp.style.color = data;
        document.body.appendChild(tmp);
        const m = getComputedStyle(tmp).color.match(/\d+/g);
        document.body.removeChild(tmp);
        if (m) {
          const [r,g,b] = m.map(Number).map(v => v/255);
          const max = Math.max(r,g,b), min = Math.min(r,g,b);
          let hh = 0;
          if (max !== min) {
            const d = max - min;
            switch (max) {
              case r: hh = (g - b) / d + (g < b ? 6 : 0); break;
              case g: hh = (b - r) / d + 2; break;
              case b: hh = (r - g) / d + 4; break;
            }
            hh *= 60;
          }
          hue = Math.round(hh);
          return;
        }
      }
      // fallback: cycle palette
      const i = palette.findIndex(p => Math.abs(p - hue) < 1);
      hue = palette[(i + 1 + palette.length) % palette.length];
    };

    // events
    const onMove = (e) => {
      // clamp to keep spotlight inside bounds
      mx = clamp(e.clientX, margin, w - margin);
      my = clamp(e.clientY, margin, h - margin);
      spawnParticles(mx, my, hue);
    };
    const onOver = (e) => setHueFromTarget(e.target);
    const onKeyDown = (e) => { if (e.key === "Tab") document.body.classList.add("using-keyboard"); };
    const onMouseDown = () => document.body.classList.remove("using-keyboard");

    // fade handling when leaving/entering the window
    const fadeOut = () => { fadeTarget = 0; };
    const fadeIn  = () => { fadeTarget = 1; };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseleave", fadeOut);
    window.addEventListener("blur", fadeOut);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") fadeOut();
      else fadeIn();
    });
    window.addEventListener("mouseenter", fadeIn);
    window.addEventListener("focus", fadeIn);

    document.body.classList.add("cursor-active");

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);

      // ease spotlight position & alpha
      x += (mx - x) * ease;
      y += (my - y) * ease;
      alpha += (fadeTarget - alpha) * 0.12;

      ctx.clearRect(0, 0, w, h);

      // particles
      if (!reduced && alpha > 0.02) {
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.016;
          if (p.life <= 0) { particles.splice(i, 1); continue; }
          ctx.globalCompositeOperation = "lighter";
          ctx.globalAlpha = Math.max(0, p.life) * 0.7 * alpha;
          ctx.beginPath();
          ctx.fillStyle = `hsl(${p.hue}, 90%, 60%)`;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // spotlight (kept inside the canvas; no edge burn)
      if (alpha > 0.02) {
        ctx.globalCompositeOperation = "source-over"; // normal mix inside its own canvas
        const grad = ctx.createRadialGradient(x, y, 0, x, y, lightRadius);
        grad.addColorStop(0, `hsla(${hue}, 95%, 65%, ${0.85 * alpha})`);
        grad.addColorStop(0.35, `hsla(${hue}, 90%, 55%, ${0.35 * alpha})`);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, lightRadius, 0, Math.PI * 2);
        ctx.fill();

        // soft outer bloom
        ctx.globalAlpha = 0.22 * alpha;
        ctx.beginPath();
        ctx.arc(x, y, lightRadius * 1.35, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 90%, 60%, ${0.18 * alpha})`;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseleave", fadeOut);
      window.removeEventListener("blur", fadeOut);
      window.removeEventListener("mouseenter", fadeIn);
      window.removeEventListener("focus", fadeIn);
      document.removeEventListener("visibilitychange", fadeOut);
      document.body.classList.remove("cursor-active");
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      className="cursor-fx"
      aria-hidden="true"
    />
  );
}
