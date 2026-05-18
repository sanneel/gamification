"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface LenisContextValue {
  lenis: Lenis | null;
  scrollTo: (target: number | string | HTMLElement, options?: Parameters<Lenis["scrollTo"]>[1]) => void;
  velocityRef: React.MutableRefObject<number>;
  smoothVelocityRef: React.MutableRefObject<number>;
  start: () => void;
  stop: () => void;
}

const noop = () => {};

const LenisContext = createContext<LenisContextValue>({
  lenis: null,
  scrollTo: noop,
  velocityRef: { current: 0 } as React.MutableRefObject<number>,
  smoothVelocityRef: { current: 0 } as React.MutableRefObject<number>,
  start: noop,
  stop: noop,
});

export function useLenis() {
  return useContext(LenisContext);
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Cinematic Lenis provider.  Drives smooth scrolling, broadcasts both raw and
 * eased velocity through refs so downstream hooks can react without re-renders,
 * and synchronises GSAP ScrollTrigger to its own RAF.
 *
 * Defaults are tuned for a snappy editorial feel — short duration, moderate
 * lerp, slightly amplified wheel/touch multipliers.
 */
export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const velocityRef = useRef(0);
  const smoothVelocityRef = useRef(0);
  const [instance, setInstance] = useState<Lenis | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !reducedMotion,
      wheelMultiplier: 1.15,
      touchMultiplier: 1.5,
      lerp: reducedMotion ? 1 : 0.11,
      orientation: "vertical",
      gestureOrientation: "vertical",
      syncTouch: true,
    });

    lenisRef.current = lenis;
    setInstance(lenis);

    lenis.on("scroll", (e: { velocity: number }) => {
      velocityRef.current = e.velocity;
    });

    const raf = (time: number) => {
      lenis.raf(time);
      // Smooth the velocity so downstream effects feel natural even when
      // the wheel emits high-frequency bursts.
      smoothVelocityRef.current += (velocityRef.current - smoothVelocityRef.current) * 0.12;
      ScrollTrigger.update();
    };

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    document.documentElement.classList.add("lenis");

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      document.documentElement.classList.remove("lenis");
      lenisRef.current = null;
      setInstance(null);
    };
  }, []);

  const scrollTo: LenisContextValue["scrollTo"] = (target, options) => {
    lenisRef.current?.scrollTo(target, options);
  };
  const start = () => lenisRef.current?.start();
  const stop  = () => lenisRef.current?.stop();

  return (
    <LenisContext.Provider value={{ lenis: instance, scrollTo, velocityRef, smoothVelocityRef, start, stop }}>
      {children}
    </LenisContext.Provider>
  );
}
