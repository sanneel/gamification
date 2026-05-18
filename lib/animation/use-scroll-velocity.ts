"use client";

import { useEffect } from "react";
import { gsap } from "./gsap";
import { useLenis } from "./lenis-provider";

interface VelocityOpts {
  /** Property to drive — `skewY`, `scaleY`, `rotate`, etc. */
  property?: "skewY" | "skewX" | "scaleY" | "scaleX" | "rotate";
  /** How much of the velocity to apply.  Higher = more dramatic. */
  amount?: number;
  /** Clamp the effect so it never explodes off-screen. */
  max?: number;
  /** Smooths the change between frames.  Smaller = snappier. */
  ease?: number;
}

/**
 * Drives a CSS transform on the given element from live Lenis scroll velocity.
 * Designed for cinematic typography — heading skews while scrolling fast,
 * relaxes when scroll calms.  Runs entirely off the GSAP ticker so React
 * never re-renders.
 */
export function useScrollVelocity<T extends HTMLElement>(
  ref: React.RefObject<T>,
  opts: VelocityOpts = {},
) {
  const { smoothVelocityRef } = useLenis();
  const { property = "skewY", amount = 0.012, max = 6, ease = 0.12 } = opts;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;

    let current = 0;

    const ticker = () => {
      const target = Math.max(-max, Math.min(max, smoothVelocityRef.current * amount));
      current += (target - current) * ease;
      gsap.set(el, { [property]: current });
    };

    gsap.ticker.add(ticker);
    return () => { gsap.ticker.remove(ticker); };
  }, [amount, ease, max, property, ref, smoothVelocityRef]);
}
