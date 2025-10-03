import React, { useEffect, useRef } from "react";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion.js";

/**
 * CursorFX: big spotlight + color-changing hover + particle trail.
 * - Global canvas overlay (no layout thrash)
 * - Hover any element with [data-cursor-color] or .button to recolor the light
 * - Respects prefers-reduced-motion (disables particles + dampens motion)
 */
export default function CursorFX() {
  const reduced = usePrefersReducedMotion();
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: true });
    ctxRef.current = ctx;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    function onResize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", onResize);

    // state
    let mx = w / 2, my = h / 2;      // mouse target
    let x = mx, y = my;              // eased position
    let hue = 265;                   // start purple
    let lightRadius = 160;           // spotlight radius
    const ease = reduced ? 0.25 : 0.18;
    const particles = [];
    const maxParticles = reduced ? 60 : 180;

    const palette = [
      265,   // violet
      190,   // cyan
      340,   // pink
      45,    // amber
      140,   // green
      210,   // blue
    ];

    function setHueFromTarget(target) {
      if (!target) return;
      // Check data-cursor-color (CSS color or hsl/hsv keyword)
      const data = target.closest("[data-cursor-color]");
      if (data) {
        try {
          // allow CSS color keywords; convert via a temp element
          const tmp = document.createElement("div");
          tmp.style.color = data.getAttribute("data-cursor-color");
          document.body.appendChild(tmp);
          const rgb = getComputedStyle(tmp).color.match(/\d+/g).map(Number);
          document.body.removeChild(tmp);
          // quick-n-dirty rgb->hsl hue (approx)
          const [r,g,b] = rgb.map(v=>v/255);
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
        } catch {}
      }
      // Otherwise cycle the palette
      const currentIndex = palette.findIndex(p => Math.abs(p - hue) < 1);
      hue = palette[(currentIndex + 1 + palette.length) % palette.length];
    }

    function onMove(e) {
      mx = e.clientX;
      my = e.clientY;
      // Add particles at mouse for motion
      if (!reduced) spawnParticles(mx, my, hue);
    }
    window.addEventListener("mousemove", onMove, { passive: true });

    function onOver(e) {
      // If hovering a button-like element, shift color
      const target = e.target.closest("button, a, [role='button'], .button, [data-cursor-color]");
      if (target) setHueFromTarget(target);
    }
    window.addEventListener("mouseover", onOver);

    function onKeyDown(e) {
      if (e.key === "Tab") document.body.classList.add("using-keyboard");
    }
    function onMouseDown() { document.body.classList.remove("using-keyboard"); }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onMouseDown);

    document.body.classList.add("cursor-active");

    function spawnParticles(px, py, h) {
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
    }

    function drawSpotlight() {
      // eased follow
      x += (mx - x) * ease;
      y += (my - y) * ease;

      // clear
      ctx.clearRect(0, 0, w, h);

      // particle trail
      if (!reduced) {
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.016; // ~60fps
          if (p.life <= 0) { particles.splice(i, 1); continue; }

          ctx.globalCompositeOperation = "lighter";
          ctx.globalAlpha = Math.max(0, p.life) * 0.7;
          ctx.beginPath();
          ctx.fillStyle = `hsl(${p.hue}, 90%, 60%)`;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      // glow spotlight (big soft radial)
      const grad = ctx.createRadialGradient(x, y, 0, x, y, lightRadius);
      // inner bright color from hue
      grad.addColorStop(0, `hsla(${hue}, 95%, 65%, .85)`);
      // mid soft ring
      grad.addColorStop(0.35, `hsla(${hue}, 90%, 55%, .35)`);
      // outer fade
      grad.addColorStop(1, "rgba(0,0,0,0)");

      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, lightRadius, 0, Math.PI * 2);
      ctx.fill();

      // subtle outer bloom
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      ctx.arc(x, y, lightRadius * 1.4, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, 90%, 60%, .2)`;
      ctx.fill();
      ctx.globalAlpha = 1;

      requestAnimationFrame(drawSpotlight);
    }
    const raf = requestAnimationFrame(drawSpotlight);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onMouseDown);
      document.body.classList.remove("cursor-active");
    };
  }, [reduced]);

  // If reduced motion, still render the spotlight (no particles) for visibility.
  return (
    <canvas
      ref={canvasRef}
      className="cursor-fx"
      aria-hidden="true"
    />
  );
}
