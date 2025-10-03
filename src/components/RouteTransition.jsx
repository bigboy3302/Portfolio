import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

const variants = {
  initial: { opacity: 0, y: 12, filter: "blur(6px)" },
  enter:   { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.45, ease: [0.22,1,0.36,1] } },
  exit:    { opacity: 0, y: -12, filter: "blur(6px)", transition: { duration: 0.35, ease: [0.22,1,0.36,1] } },
};

export default function RouteTransition({ children }) {
  const { pathname } = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div key={pathname} variants={variants} initial="initial" animate="enter" exit="exit">
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
