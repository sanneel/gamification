import type { Variants, Transition } from "framer-motion";

// ─── Spring Configs ────────────────────────────────────────────────────────────

export const springs = {
  gentle: { type: "spring", stiffness: 120, damping: 20 } as Transition,
  snappy: { type: "spring", stiffness: 300, damping: 28 } as Transition,
  bouncy: { type: "spring", stiffness: 400, damping: 18 } as Transition,
  molasses: { type: "spring", stiffness: 60, damping: 18 } as Transition,
  magnetic: { type: "spring", stiffness: 500, damping: 30 } as Transition,
  reveal: { type: "spring", stiffness: 200, damping: 24, mass: 0.8 } as Transition,
  float: { type: "spring", stiffness: 80, damping: 12 } as Transition,
};

// ─── Premium Easings ──────────────────────────────────────────────────────────

export const ease = {
  expo: [0.16, 1, 0.3, 1] as [number, number, number, number],
  back: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
  smooth: [0.4, 0, 0.2, 1] as [number, number, number, number],
  silk: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
  cinematic: [0.12, 0, 0.39, 0] as [number, number, number, number],
};

// ─── Shared Variants ──────────────────────────────────────────────────────────

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: ease.expo } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: ease.smooth } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: springs.reveal },
};

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: 40, filter: "blur(4px)" },
  visible: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: ease.expo } },
  exit: { opacity: 0, x: -40, filter: "blur(4px)", transition: { duration: 0.35, ease: ease.smooth } },
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: -40, filter: "blur(4px)" },
  visible: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: ease.expo } },
  exit: { opacity: 0, x: 40, filter: "blur(4px)", transition: { duration: 0.35, ease: ease.smooth } },
};

export const stagger = (staggerChildren = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren, delayChildren } },
});

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.5, y: 20 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: "spring", stiffness: 500, damping: 22 },
  },
};

export const cinematic: Variants = {
  hidden: { opacity: 0, scale: 1.08, filter: "blur(20px)" },
  visible: {
    opacity: 1, scale: 1, filter: "blur(0px)",
    transition: { duration: 1.1, ease: ease.expo },
  },
};

export const glow: Variants = {
  dim: { opacity: 0.3, scale: 1 },
  bright: {
    opacity: [0.3, 0.8, 0.3],
    scale: [1, 1.05, 1],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
};

// ─── Viewport Trigger Helpers ─────────────────────────────────────────────────

export const viewport = { once: true, margin: "-80px" };
export const viewportEager = { once: true, margin: "0px" };
