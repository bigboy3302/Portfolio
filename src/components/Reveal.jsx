// src/components/Reveal.jsx
import React from "react";
import { motion } from "framer-motion";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion.js";

export default function Reveal({ children, side = "left", delay = 0 }) {
  const reduced = usePrefersReducedMotion();
  const dir = side === "left" ? -1 : 1;

  const variants = reduced ? {
    hidden: { opacity: 0 },
    show:   { opacity: 1, transition: { duration: 0.001 } }
  } : {
    hidden: { opacity: 0, x: 40 * dir, scale: 0.995 },
    show: {
      opacity: 1, x: 0, scale: 1,
      transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.35, margin: "-10% 0% -10% 0%" }}
      style={{ willChange: "transform, opacity", transform: "translateZ(0)" }}
    >
      {children}
    </motion.div>
  );
}
