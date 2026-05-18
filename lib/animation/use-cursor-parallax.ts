"use client";

import { useEffect } from "react";
import { gsap } from "./gsap";

interface CursorParallaxOpts {
  /** -1 → moves opposite direction, 1 → with the cursor. */
  strength?: number;
  /** Lerp factor for follow.  Smaller = floatier. */
  ease?: number;
  /** Limit travel in pixels. */
  max?: number;
  /** Optional rotate amount. */
  rotate?: boolean;
}

/**
 * Cursor-reactive parallax.  Each child registered with `data-depth` shifts
 * by `depth * strength` of the cursor offset relative to the container.
 *
 * Reading `data-depth` on the children means individual elements set their
 * own intensity declaratively — perfect for depth illusions.
 */
export function useCursorParallax<T extends HTMLElement>(
  ref: React.RefObject<T>,
  opts: CursorParallaxOpts = {},
) {
  const { strength = 30, ease = 0.08, max = 60, rotate = false } = opts;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: none)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const container = ref.current;
    if (!container) return;

    const children = Array.from(container.querySelectorAll<HTMLElement>("[data-depth]"));
    if (!children.length) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const dx = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const dy = (e.clientY - rect.top - rect.height / 2) / rect.height;
      targetX = Math.max(-1, Math.min(1, dx));
      targetY = Math.max(-1, Math.min(1, dy));
    };

    const onLeave = () => { targetX = 0; targetY = 0; };

    container.addEventListener("mousemove", onMove);
    container.addEventListener("mouseleave", onLeave);

    const ticker = () => {
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;
      children.forEach((child) => {
        const depth = parseFloat(child.dataset.depth ?? "0.3");
        const tx = Math.max(-max, Math.min(max, currentX * strength * depth));
        const ty = Math.max(-max, Math.min(max, currentY * strength * depth));
        gsap.set(child, {
          x: tx,
          y: ty,
          rotate: rotate ? currentX * depth * 4 : 0,
        });
      });
    };

    gsap.ticker.add(ticker);

    return () => {
      gsap.ticker.remove(ticker);
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseleave", onLeave);
    };
  }, [ease, max, ref, rotate, strength]);
}
