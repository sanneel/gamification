"use client";

import { motion } from "framer-motion";

type Variant = "default" | "rose" | "gold" | "violet" | "emerald" | "dark";

const ORBS: Record<Variant, { a: string; b: string; c?: string }> = {
  default: { a: "rgba(255,45,120,0.10)", b: "rgba(124,58,237,0.07)" },
  rose:    { a: "rgba(255,45,120,0.16)", b: "rgba(255,100,130,0.08)", c: "rgba(124,58,237,0.05)" },
  gold:    { a: "rgba(255,200,0,0.11)",  b: "rgba(245,130,35,0.07)", c: "rgba(255,45,120,0.04)" },
  violet:  { a: "rgba(124,58,237,0.15)", b: "rgba(167,139,250,0.08)", c: "rgba(255,45,120,0.05)" },
  emerald: { a: "rgba(16,185,129,0.11)", b: "rgba(5,150,105,0.07)" },
  dark:    { a: "rgba(255,45,120,0.06)", b: "rgba(124,58,237,0.04)" },
};

export default function AmbientBg({ variant = "default" }: { variant?: Variant }) {
  const { a, b, c } = ORBS[variant];
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Top-left orb */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "min(80vw, 900px)", height: "min(80vw, 900px)",
          top: "-20%", left: "-20%",
          background: `radial-gradient(circle, ${a} 0%, transparent 70%)`,
        }}
        animate={{ scale: [1, 1.05, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Bottom-right orb */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "min(70vw, 800px)", height: "min(70vw, 800px)",
          bottom: "-20%", right: "-15%",
          background: `radial-gradient(circle, ${b} 0%, transparent 70%)`,
        }}
        animate={{ scale: [1, 1.07, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
      {/* Center accent orb (optional) */}
      {c && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: "min(50vw, 600px)", height: "min(50vw, 600px)",
            top: "30%", left: "40%",
            background: `radial-gradient(circle, ${c} 0%, transparent 70%)`,
          }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 6 }}
        />
      )}
    </div>
  );
}
