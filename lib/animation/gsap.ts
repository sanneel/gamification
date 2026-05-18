"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };

export const cinematicEase = "expo.out";
export const silkEase = "power3.out";
export const editorialEase = "power4.inOut";

export function killTriggers(scope?: Element | null) {
  if (!scope) return ScrollTrigger.getAll().forEach((t) => t.kill());
  ScrollTrigger.getAll().forEach((t) => {
    const trigger = t.vars.trigger;
    if (trigger instanceof Element && scope.contains(trigger)) t.kill();
  });
}
