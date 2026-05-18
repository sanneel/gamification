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
}

const LenisContext = createContext<LenisContextValue>({ lenis: null, scrollTo: () => {} });

export function useLenis() {
  return useContext(LenisContext);
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const [instance, setInstance] = useState<Lenis | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !reducedMotion,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
      lerp: reducedMotion ? 1 : 0.085,
      orientation: "vertical",
      gestureOrientation: "vertical",
    });

    lenisRef.current = lenis;
    setInstance(lenis);

    const raf = (time: number) => {
      lenis.raf(time);
      ScrollTrigger.update();
    };

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
      setInstance(null);
    };
  }, []);

  const scrollTo: LenisContextValue["scrollTo"] = (target, options) => {
    lenisRef.current?.scrollTo(target, options);
  };

  return (
    <LenisContext.Provider value={{ lenis: instance, scrollTo }}>
      {children}
    </LenisContext.Provider>
  );
}
