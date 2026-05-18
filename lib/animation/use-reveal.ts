"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, cinematicEase } from "./gsap";

interface RevealOpts {
  y?: number;
  blur?: number;
  delay?: number;
  duration?: number;
  start?: string;
  stagger?: number;
  selector?: string;
  once?: boolean;
}

/**
 * Scroll-triggered reveal. Each element is faded/translated when it crosses
 * the configured viewport boundary. Safe under SSR — only attaches in the browser.
 */
export function useReveal<T extends HTMLElement = HTMLElement>(opts: RevealOpts = {}) {
  const ref = useRef<T>(null);
  const {
    y = 32,
    blur = 6,
    delay = 0,
    duration = 1.05,
    start = "top 85%",
    stagger = 0.08,
    selector = "[data-reveal]",
    once = true,
  } = opts;

  useEffect(() => {
    const root = ref.current;
    if (!root || typeof window === "undefined") return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = selector ? root.querySelectorAll<HTMLElement>(selector) : [root];

    if (!targets.length) return;

    if (reducedMotion) {
      gsap.set(targets, { opacity: 1, y: 0, filter: "blur(0px)" });
      return;
    }

    gsap.set(targets, { opacity: 0, y, filter: `blur(${blur}px)` });

    const ctx = gsap.context(() => {
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration,
        delay,
        ease: cinematicEase,
        stagger,
        scrollTrigger: {
          trigger: root,
          start,
          toggleActions: once ? "play none none none" : "play reverse play reverse",
          once,
        },
      });
    }, root);

    return () => ctx.revert();
  }, [y, blur, delay, duration, start, stagger, selector, once]);

  return ref;
}
