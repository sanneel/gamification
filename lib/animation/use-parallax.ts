"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "./gsap";

/**
 * Smooth parallax driven by GSAP + Lenis-pumped ScrollTrigger.
 * Pass the strength as a fraction of the trigger's height (default 0.18 → 18% drift).
 */
export function useParallax<T extends HTMLElement = HTMLElement>(strength = 0.18) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { yPercent: -strength * 50 },
        {
          yPercent: strength * 50,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement ?? el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    });

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, [strength]);

  return ref;
}
