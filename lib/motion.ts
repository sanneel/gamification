import type { Variants, Transition } from "framer-motion";

// ─── Spring Configs ────────────────────────────────────────────────────────────

export const springs = {
  gentle:   { type: "spring", stiffness: 120, damping: 20 } as Transition,
  snappy:   { type: "spring", stiffness: 300, damping: 28 } as Transition,
  bouncy:   { type: "spring", stiffness: 420, damping: 18 } as Transition,
  molasses: { type: "spring", stiffness:  60, damping: 18 } as Transition,
  magnetic: { type: "spring", stiffness: 500, damping: 30 } as Transition,
  reveal:   { type: "spring", stiffness: 200, damping: 24, mass: 0.8 } as Transition,
  float:    { type: "spring", stiffness:  80, damping: 12 } as Transition,
  cinematic:{ type: "spring", stiffness: 100, damping: 22, mass: 1.2 } as Transition,
  sluggish: { type: "spring", stiffness:  50, damping: 20, mass: 1.5 } as Transition,
};

// ─── Easing Curves ─────────────────────────────────────────────────────────────

export const ease = {
  expo:      [0.16, 1, 0.3, 1]        as [number,number,number,number],
  back:      [0.34, 1.56, 0.64, 1]    as [number,number,number,number],
  smooth:    [0.4, 0, 0.2, 1]         as [number,number,number,number],
  silk:      [0.25, 0.46, 0.45, 0.94] as [number,number,number,number],
  cinematic: [0.12, 0, 0.39, 0]       as [number,number,number,number],
  out:       [0.0, 0.0, 0.2, 1.0]     as [number,number,number,number],
};

// ─── Motion Variants ──────────────────────────────────────────────────────────

export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 24, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0,  filter: "blur(0px)",
    transition: { duration: 0.55, ease: ease.expo } },
};

export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: ease.smooth } },
};

export const blurUp: Variants = {
  hidden:  { opacity: 0, y: 32, filter: "blur(12px)", scale: 0.97 },
  visible: { opacity: 1, y: 0,  filter: "blur(0px)",  scale: 1,
    transition: { duration: 0.65, ease: ease.expo } },
};

export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.88 },
  visible: { opacity: 1, scale: 1, transition: springs.bouncy },
};

export const slideLeft: Variants = {
  hidden:  { opacity: 0, x: 40,  filter: "blur(6px)" },
  visible: { opacity: 1, x: 0,   filter: "blur(0px)",
    transition: { duration: 0.5, ease: ease.expo } },
};

export const slideRight: Variants = {
  hidden:  { opacity: 0, x: -40, filter: "blur(6px)" },
  visible: { opacity: 1, x: 0,   filter: "blur(0px)",
    transition: { duration: 0.5, ease: ease.expo } },
};

export const popIn: Variants = {
  hidden:  { opacity: 0, scale: 0.6 },
  visible: { opacity: 1, scale: 1, transition: springs.bouncy },
};

export const cinematic: Variants = {
  hidden:  { opacity: 0, scale: 1.08, filter: "blur(16px)" },
  visible: { opacity: 1, scale: 1,    filter: "blur(0px)",
    transition: { duration: 0.9, ease: ease.cinematic } },
};

export const heroReveal: Variants = {
  hidden:  { opacity: 0, y: 48, filter: "blur(16px)", scale: 0.96 },
  visible: { opacity: 1, y: 0,  filter: "blur(0px)",  scale: 1,
    transition: { duration: 0.8, ease: ease.expo } },
};

export const glow: Variants = {
  hidden:  { opacity: 0.4, scale: 1 },
  visible: {
    opacity: [0.4, 1, 0.4], scale: [1, 1.05, 1],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
};

// ─── Stagger Containers ────────────────────────────────────────────────────────

export function stagger(delay = 0.07, staggerChildren = 0.07): Variants {
  return {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { delayChildren: delay, staggerChildren } },
  };
}

export const staggerFast: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

export const staggerSlow: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

// ─── Viewport ─────────────────────────────────────────────────────────────────

export const viewport = { once: true, margin: "-80px" };
export const viewportEarly = { once: true, margin: "-30px" };
