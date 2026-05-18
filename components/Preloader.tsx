"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/animation/gsap";
import { useLenis } from "@/lib/animation/lenis-provider";

const ease = "expo.inOut";

/**
 * A cinematic intro that plays once per session.  A counter ticks 00 → 100
 * against a brand mark, the entire panel splits and lifts off the screen,
 * revealing the hero.  While it's playing, Lenis is paused so the page
 * doesn't scroll under the curtain.
 */
export function Preloader({ onComplete }: { onComplete?: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(true);
  const numberRef = useRef<HTMLSpanElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const { stop, start } = useLenis();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;

    if (sessionStorage.getItem("gamif_preloader_played") === "1") {
      setShow(false);
      onComplete?.();
      return;
    }

    stop();
    document.body.style.overflow = "hidden";

    const counter = { val: 0 };
    const tl = gsap.timeline({
      defaults: { ease },
      onComplete: () => {
        sessionStorage.setItem("gamif_preloader_played", "1");
        setShow(false);
        document.body.style.overflow = "";
        start();
        onComplete?.();
      },
    });

    // 1. Counter race
    tl.to(counter, {
      val: 100,
      duration: 2.6,
      ease: "power2.inOut",
      onUpdate: () => {
        if (numberRef.current) numberRef.current.textContent = String(Math.round(counter.val)).padStart(3, "0");
      },
    }, 0);

    // Brand fades up while counter runs
    tl.from(brandRef.current, { yPercent: 100, duration: 1.4, ease: "expo.out" }, 0.05);
    tl.from(labelRef.current, { opacity: 0, y: 14, duration: 1, ease: "power3.out" }, 0.2);
    tl.from(ruleRef.current, { scaleX: 0, transformOrigin: "left", duration: 2.6, ease: "power2.inOut" }, 0);

    // 2. Hold for a breath
    tl.to({}, { duration: 0.15 });

    // 3. Hide UI, then split the curtain
    tl.to([brandRef.current, labelRef.current, numberRef.current, ruleRef.current], {
      opacity: 0,
      y: -20,
      duration: 0.55,
      ease: "power2.in",
      stagger: 0.04,
    });
    tl.to(topRef.current,    { yPercent: -100, duration: 1.2, ease }, "<");
    tl.to(bottomRef.current, { yPercent:  100, duration: 1.2, ease }, "<");

    return () => {
      tl.kill();
      document.body.style.overflow = "";
      start();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  if (!show) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[200] overflow-clip"
      style={{ visibility: mounted ? "visible" : "hidden" }}
    >
      <div ref={topRef}    className="absolute inset-x-0 top-0 h-[50%] bg-[var(--ink)]" />
      <div ref={bottomRef} className="absolute inset-x-0 bottom-0 h-[50%] bg-[var(--ink)]" />

      <div className="grain-overlay absolute inset-0 opacity-30 z-10" />

      <div className="absolute inset-0 z-20 container-edge flex flex-col justify-between py-12 text-[var(--bone)]">
        <div ref={labelRef} className="flex items-center justify-between text-[11px] uppercase tracking-[0.32em] opacity-80">
          <span>Atelier · Tbilisi</span>
          <span className="tabular">Loading the archive</span>
        </div>

        <div className="relative flex items-center justify-center overflow-hidden h-[18vw]">
          <div ref={brandRef} className="font-display text-[18vw] leading-none tracking-tight">
            gamif
            <span className="text-[var(--accent-2)] italic-serif">.</span>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div ref={ruleRef} className="h-px flex-1 max-w-md bg-[var(--bone)] origin-left" />
          <span
            ref={numberRef}
            className="font-display text-[6vw] leading-none tabular ml-8 text-[var(--bone)]"
          >
            000
          </span>
        </div>
      </div>
    </div>
  );
}
