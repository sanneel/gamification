"use client";

import { useEffect, useRef } from "react";
import SplitType from "split-type";
import { gsap, ScrollTrigger } from "@/lib/animation/gsap";

/**
 * A scrubbed manifesto.  We pin the section, split the headline into chars,
 * and tween their colour + skew based on scroll progress.  Each character
 * lifts from a quiet bone tone to full contrast and then settles — the
 * effect of a sentence being slowly written on a darkroom enlargement.
 *
 * The accent fragment is split separately so it can resolve in the warm
 * ember tone for emphasis.
 */
export function MaskedManifesto() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const lead    = useRef<HTMLParagraphElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const accRef  = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const splitHead = headRef.current ? new SplitType(headRef.current, { types: "chars", charClass: "manifesto-char" }) : null;
      const splitAcc  = accRef.current  ? new SplitType(accRef.current,  { types: "chars", charClass: "manifesto-char" }) : null;

      const chars    = splitHead?.chars ?? [];
      const accChars = splitAcc?.chars  ?? [];

      if (reduced) {
        gsap.set([...chars, ...accChars], { opacity: 1, color: "var(--ink)" });
        gsap.set(lead.current, { opacity: 1, y: 0 });
        return;
      }

      gsap.set(chars,    { opacity: 0.12, skewY: 6, color: "var(--storm-35)" });
      gsap.set(accChars, { opacity: 0.12, skewY: 6, color: "var(--accent)" });
      gsap.set(lead.current, { opacity: 0, y: 30 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top top",
          end:   "+=180%",
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
        },
      });

      tl.to(lead.current, { opacity: 1, y: 0, duration: 0.4 }, 0);
      tl.to(chars, {
        opacity: 1,
        skewY: 0,
        color: "var(--ink)",
        stagger: { each: 0.012, from: "start" },
        ease: "none",
        duration: 1.6,
      }, 0.1);
      tl.to(accChars, {
        opacity: 1,
        skewY: 0,
        color: "var(--accent)",
        stagger: { each: 0.02, from: "start" },
        ease: "none",
        duration: 1,
      }, 0.6);
      tl.to({}, { duration: 0.4 });

      return () => {
        splitHead?.revert();
        splitAcc?.revert();
      };
    }, wrapRef);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <section ref={wrapRef} className="surface-bone relative overflow-clip" data-scene="manifesto">
      <div className="container-edge container-wide min-h-screen flex flex-col justify-center py-32">
        <p ref={lead} className="eyebrow text-[var(--storm-55)]">A note from the atelier</p>

        <h2
          ref={headRef}
          className="font-display mt-10 max-w-6xl text-display-xl leading-[0.92] text-[var(--ink)]"
        >
          We don&apos;t sell gifts. We compose moments — three objects at a time, wrapped to be opened slowly,{" "}
          <span ref={accRef} className="italic-serif text-[var(--accent)]">written as a small private film.</span>
        </h2>

        <div className="mt-16 flex items-center gap-6 text-[11px] uppercase tracking-[0.32em] text-[var(--storm-55)]">
          <span className="block h-px w-16 bg-[var(--ink)]" />
          <span>Sandro Siradze · founder</span>
        </div>
      </div>
    </section>
  );
}
