"use client";

import { useEffect, useRef } from "react";
import SplitType from "split-type";
import { gsap, cinematicEase } from "./gsap";

interface SplitOpts {
  type?: "lines" | "words" | "chars" | "lines,words" | "lines,words,chars";
  duration?: number;
  delay?: number;
  stagger?: number;
  y?: string | number;
  blur?: number;
  trigger?: "mount" | "scroll";
  start?: string;
}

/**
 * Cinematic line/word reveal driven by SplitType. Stays SSR-safe and respects
 * prefers-reduced-motion. Returns a ref you attach to a heading element.
 */
export function useSplitReveal<T extends HTMLElement = HTMLHeadingElement>(opts: SplitOpts = {}) {
  const ref = useRef<T>(null);
  const {
    type = "lines",
    duration = 1.1,
    delay = 0,
    stagger = 0.08,
    y = "110%",
    blur = 0,
    trigger = "mount",
    start = "top 85%",
  } = opts;

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const split = new SplitType(el, { types: type, lineClass: "split-line", wordClass: "split-word", charClass: "split-char" });

    const targets = type.includes("chars") ? split.chars
      : type.includes("words") ? split.words
      : split.lines;

    if (!targets || !targets.length) return;

    if (reducedMotion) {
      gsap.set(targets, { y: 0, opacity: 1, filter: "blur(0px)" });
      return;
    }

    gsap.set(el, { perspective: 1200 });
    targets.forEach((line) => {
      const parent = line.parentElement;
      if (parent && type === "lines") parent.style.overflow = "hidden";
      line.style.willChange = "transform, opacity, filter";
    });

    gsap.set(targets, { yPercent: typeof y === "string" ? parseFloat(y) : undefined, y: typeof y === "number" ? y : undefined, opacity: blur ? 0 : 1, filter: blur ? `blur(${blur}px)` : "blur(0px)" });

    const animation = gsap.to(targets, {
      yPercent: 0,
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      duration,
      delay,
      ease: cinematicEase,
      stagger,
      scrollTrigger: trigger === "scroll" ? { trigger: el, start, once: true } : undefined,
      paused: trigger === "scroll" ? false : false,
    });

    return () => {
      animation.kill();
      split.revert();
    };
  }, [type, duration, delay, stagger, y, blur, trigger, start]);

  return ref;
}
