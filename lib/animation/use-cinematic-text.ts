"use client";

import { useEffect } from "react";
import SplitType from "split-type";
import { gsap, ScrollTrigger } from "./gsap";

interface CinematicTextOpts {
  /** Split granularity for the reveal. */
  split?: "chars" | "words" | "lines" | "lines,words" | "lines,chars" | "lines,words,chars";
  /** Translate distance (em) for the targets before reveal. */
  from?: { y?: number; x?: number; rotate?: number; skewY?: number };
  /** Stagger between targets. */
  stagger?: number;
  /** Total duration per target. */
  duration?: number;
  /** Easing.  Defaults to a punched expo. */
  ease?: string;
  /** Delay before reveal begins. */
  delay?: number;
  /** Mount = reveal immediately; scroll = scrub or pin to scroll trigger. */
  trigger?: "mount" | "scroll" | "scrub";
  /** Start position for ScrollTrigger. */
  start?: string;
  /** End position (scrub only). */
  end?: string;
  /** Optional masking parent overflow. */
  mask?: boolean;
}

/**
 * Cinematic text engine.  Splits a heading and animates each unit from a
 * configurable starting transform with masking, optionally driven by
 * ScrollTrigger scrub for letter-by-letter reveals as the user scrolls.
 *
 * The hook is idempotent across remounts — SplitType DOM is reverted, GSAP
 * timeline is killed, all listeners released.
 */
export function useCinematicText<T extends HTMLElement>(
  ref: React.RefObject<T>,
  opts: CinematicTextOpts = {},
) {
  const {
    split = "lines,words",
    from = { y: 1.1 },
    stagger = 0.06,
    duration = 1.05,
    ease = "expo.out",
    delay = 0,
    trigger = "mount",
    start = "top 80%",
    end = "bottom 30%",
    mask = true,
  } = opts;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = ref.current;
    if (!el) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const splitInstance = new SplitType(el, {
      types: split,
      lineClass: "cinematic-line",
      wordClass: "cinematic-word",
      charClass: "cinematic-char",
    });

    const targets = split.includes("chars") ? splitInstance.chars
                  : split.includes("words") ? splitInstance.words
                  : splitInstance.lines;

    if (!targets || !targets.length) {
      return () => splitInstance.revert();
    }

    if (mask) {
      const lines = splitInstance.lines ?? [el];
      lines.forEach((line) => { line.style.overflow = "hidden"; line.style.willChange = "transform"; });
    }

    if (reducedMotion) {
      gsap.set(targets, { yPercent: 0, xPercent: 0, opacity: 1, rotate: 0, skewY: 0 });
      return () => splitInstance.revert();
    }

    gsap.set(targets, {
      yPercent: from.y != null ? from.y * 100 : 0,
      xPercent: from.x != null ? from.x * 100 : 0,
      rotate: from.rotate ?? 0,
      skewY: from.skewY ?? 0,
      opacity: from.y != null || from.x != null ? 1 : 0.001,
    });

    let scrollTrigger: ScrollTrigger | undefined;

    const animation = gsap.to(targets, {
      yPercent: 0,
      xPercent: 0,
      rotate: 0,
      skewY: 0,
      opacity: 1,
      duration,
      delay,
      ease,
      stagger,
      paused: trigger !== "mount",
    });

    if (trigger === "scroll") {
      scrollTrigger = ScrollTrigger.create({
        trigger: el,
        start,
        once: true,
        onEnter: () => animation.play(),
      });
    } else if (trigger === "scrub") {
      animation.kill();
      scrollTrigger = ScrollTrigger.create({
        trigger: el,
        start,
        end,
        scrub: 0.6,
        animation: gsap.to(targets, {
          yPercent: 0,
          xPercent: 0,
          opacity: 1,
          rotate: 0,
          skewY: 0,
          ease: "none",
          stagger: { each: stagger, from: "start" },
        }),
      });
    }

    return () => {
      animation.kill();
      scrollTrigger?.kill();
      splitInstance.revert();
    };
  }, [delay, duration, ease, end, from.rotate, from.skewY, from.x, from.y, mask, ref, split, stagger, start, trigger]);
}
