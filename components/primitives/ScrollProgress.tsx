"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Hair-thin progress bar fixed to the very top of the viewport — a quiet
 * indicator of how far the reader has scrolled.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.6 });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed left-0 top-0 z-[110] h-px w-full origin-left bg-[var(--accent)]"
      aria-hidden
    />
  );
}
