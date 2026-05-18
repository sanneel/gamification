"use client";

import { gsap, ScrollTrigger } from "./gsap";

/**
 * Scene helpers.  A "scene" is a self-contained GSAP context bound to a
 * scroll trigger — used by interactive sections to express directed motion
 * timelines without leaking listeners across mounts.
 */

export interface SceneCtx {
  ctx: gsap.Context;
  cleanup(): void;
}

/**
 * Build a self-cleaning scene.  Pass the root element and a callback that
 * receives a GSAP context — any tweens or scroll triggers created inside
 * the callback are reverted on cleanup.
 */
export function createScene(root: Element | null, build: (ctx: gsap.Context) => void): SceneCtx {
  if (!root) {
    const ctx = gsap.context(() => {});
    return { ctx, cleanup: () => ctx.revert() };
  }
  const ctx = gsap.context((self) => build(self), root);
  return {
    ctx,
    cleanup: () => {
      ctx.revert();
      ScrollTrigger.refresh();
    },
  };
}

/**
 * Convenience helper for pinning a section while scrubbing a timeline.
 * Returns the created ScrollTrigger so callers can refresh / kill it.
 */
export function pinScrub(target: Element, build: (timeline: gsap.core.Timeline) => void, opts: { end?: string; anticipatePin?: number; pinSpacing?: boolean } = {}) {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: target,
      start: "top top",
      end: opts.end ?? "+=120%",
      pin: true,
      scrub: 0.8,
      anticipatePin: opts.anticipatePin ?? 1,
      pinSpacing: opts.pinSpacing ?? true,
    },
  });
  build(tl);
  return tl;
}
