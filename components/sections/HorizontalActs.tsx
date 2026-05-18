"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/animation/gsap";

const ACTS = [
  {
    roman: "I",
    label: "Atelier",
    title: "We assemble a selection of pieces, weighed in the hand.",
    body:  "Each piece is studied, sampled, sometimes returned to the maker for another pass — a curator's eye on objects that earn their place in the box.",
    img:   "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=2000&q=88",
  },
  {
    roman: "II",
    label: "Ritual",
    title: "You compose three objects — a centrepiece, a softer note, a whisper.",
    body:  "Layered like notes on a score. Hand-wrapped in archival paper, tied with cotton ribbon, sealed with our wax mark.",
    img:   "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=2000&q=88",
  },
  {
    roman: "III",
    label: "Reveal",
    title: "The recipient finds an envelope, your letter, and a quiet act of love.",
    body:  "Printed on archival paper. A wax seal lifted. A small card inside with the lucky reward — a chapter that ends in a held breath.",
    img:   "https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&w=2000&q=88",
  },
];

/**
 * Pinned horizontal cinema.  As the viewer scrolls, the section locks and
 * the camera dollies sideways through three full-bleed frames.  An overlay
 * "chapter index" updates with the dominant frame.  Each frame parallaxes
 * its own image slightly faster than its content.
 */
export function HorizontalActs() {
  const wrapRef  = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const numRef   = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const wrap  = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>(".cinema-panel");

      const tween = gsap.to(track, {
        xPercent: -100 * (panels.length - 1),
        ease: "none",
        scrollTrigger: {
          trigger: wrap,
          start: "top top",
          end:   () => `+=${wrap.offsetHeight * 1.6}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const idx = Math.min(panels.length - 1, Math.floor(self.progress * panels.length));
            if (numRef.current) numRef.current.textContent = String(idx + 1).padStart(2, "0");
          },
        },
      });

      // Inner image drift per panel (slow horizontal slide opposite to the
      // outer track for a depth-illusion).
      panels.forEach((panel) => {
        const inner = panel.querySelector<HTMLElement>(".cinema-img");
        if (!inner) return;
        gsap.fromTo(
          inner,
          { xPercent: -8, scale: 1.08 },
          {
            xPercent: 8,
            scale: 1.04,
            ease: "none",
            scrollTrigger: {
              trigger: panel,
              containerAnimation: tween,
              start: "left right",
              end: "right left",
              scrub: 0.6,
            },
          },
        );
        const copy = panel.querySelector<HTMLElement>(".cinema-copy");
        if (copy) {
          gsap.fromTo(
            copy,
            { yPercent: 18, opacity: 0.3 },
            {
              yPercent: 0,
              opacity: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: panel,
                containerAnimation: tween,
                start: "left center",
                end: "center center",
                scrub: 0.4,
              },
            },
          );
        }
      });
    }, wrap);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <section ref={wrapRef} className="relative h-screen w-full overflow-clip surface-ink text-[var(--bone)]" data-scene="acts">
      <div aria-hidden className="grain-overlay pointer-events-none absolute inset-0 opacity-25 z-30" />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 container-edge flex items-center justify-between pt-8 text-[11px] uppercase tracking-[0.32em] text-[var(--bone)]/70">
        <span>The unboxing · in three acts</span>
        <span className="tabular">
          <span ref={numRef}>01</span> / 03
        </span>
      </div>

      <div ref={trackRef} className="flex h-full w-[300%]">
        {ACTS.map((act) => (
          <article key={act.roman} className="cinema-panel relative flex h-full w-1/3 shrink-0 overflow-clip">
            <div className="cinema-img absolute inset-0">
              <Image src={act.img} alt={act.label} fill priority sizes="100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--ink)]/70 via-[var(--ink)]/20 to-[var(--ink)]/65" />
            </div>

            <div className="cinema-copy relative z-10 mt-auto p-12 md:p-20 max-w-3xl">
              <div className="flex items-center gap-6">
                <span className="font-display text-[10rem] leading-none text-[var(--bone)]/60 mix-blend-difference">
                  {act.roman}
                </span>
                <span className="eyebrow">Act · {act.label}</span>
              </div>
              <h2 className="font-display mt-10 text-display-md leading-[0.95] text-[var(--bone)]">
                {act.title}
              </h2>
              <p className="mt-6 max-w-md text-body-lg text-[var(--bone)]/75">{act.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
