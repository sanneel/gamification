"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger } from "@/lib/animation/gsap";

const HERO_IMG = "https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&w=2400&q=88";

/**
 * The final cinematic invite.  A tiny "BEGIN" mark grows to fill the entire
 * screen as the user scrolls, then the page reveals a closing image, an
 * eyebrow, and the call to begin a box.  Functions as a curtain into the
 * footer.
 */
export function FinalInvite() {
  const wrap = useRef<HTMLElement>(null);
  const mark = useRef<HTMLDivElement>(null);
  const halo = useRef<HTMLDivElement>(null);
  const reveal = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const w = wrap.current;
    if (!w || reduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: w,
          start: "top top",
          end: "+=180%",
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
        },
      });
      tl.fromTo(
        mark.current,
        { scale: 0.6, opacity: 0.001, letterSpacing: "0.6em" },
        { scale: 12, opacity: 1, letterSpacing: "-0.05em", ease: "power3.in", duration: 1 },
        0,
      );
      tl.to(halo.current, { opacity: 1, duration: 0.4 }, 0.5);
      tl.to(mark.current, { opacity: 0, scale: 14, duration: 0.4 }, 0.9);
      tl.fromTo(
        reveal.current,
        { opacity: 0, y: 80 },
        { opacity: 1, y: 0, duration: 0.6 },
        1.0,
      );
    }, w);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <section
      ref={wrap}
      className="surface-ink relative h-screen overflow-clip text-[var(--bone)]"
      data-scene="final"
    >
      <div aria-hidden className="grain-overlay pointer-events-none absolute inset-0 opacity-25 z-30" />

      <div ref={halo} aria-hidden className="absolute inset-0 opacity-0">
        <Image src={HERO_IMG} alt="" fill priority sizes="100vw" className="object-cover scale-[1.05]" />
        <div className="absolute inset-0 bg-[var(--ink)]/55" />
      </div>

      <div
        ref={mark}
        className="absolute inset-0 z-10 flex items-center justify-center font-display font-light text-[10vw] leading-none text-[var(--bone)]"
        style={{ willChange: "transform, opacity, letter-spacing" }}
      >
        Begin
      </div>

      <div ref={reveal} className="absolute inset-0 z-20 container-edge container-wide flex flex-col justify-between py-20 opacity-0">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.32em] text-[var(--bone)]/70">
          <span>Atelier · Tbilisi</span>
          <span className="tabular">Closing chapter</span>
        </div>

        <div className="max-w-3xl">
          <p className="eyebrow text-[var(--bone)]/55">Begin a box</p>
          <h2 className="font-display mt-6 text-display-xl leading-[0.88]">
            Compose<br /><em className="italic-serif text-[var(--accent-2)]">a small</em> ceremony.
          </h2>
          <p className="mt-8 max-w-xl text-body-lg text-[var(--bone)]/75">
            Three pieces. A printed letter. A lucky reward, wrapped in archival paper and sealed with our wax mark.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Link href="/build-a-box" className="btn-cinematic btn-cinematic--outline border-[var(--bone)]/60 text-[var(--bone)]">
              <span className="btn-cinematic__label">Build a box</span>
            </Link>
            <Link href="/quiz" className="link-reveal text-[12px] uppercase tracking-[0.22em] text-[var(--bone)]/75">
              Or take the gift quiz
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
