"use client";

import { useEffect, useRef } from "react";
import { gsap } from "./gsap";

/**
 * Magnetic hover — pulls the element gently toward the cursor.
 * Designed for buttons and small interactive surfaces.
 */
export function useMagnetic<T extends HTMLElement = HTMLElement>(strength = 0.35) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;

    const move = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(el, { x: x * strength, y: y * strength, duration: 0.6, ease: "power3.out" });
    };

    const reset = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.5)" });
    };

    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", reset);

    return () => {
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", reset);
    };
  }, [strength]);

  return ref;
}
