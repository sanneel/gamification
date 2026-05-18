"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap, ScrollTrigger } from "@/lib/animation/gsap";
import { useCinematicText } from "@/lib/animation/use-cinematic-text";

const PIECES = [
  { name: "Signature candle №07", price: "₾ 49", img: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1400&q=88", offset: { top: "6%",  left: "4%"  }, depth: 1.1,  rotate: -3, w: "32vw" },
  { name: "Crystal atomiser",     price: "₾ 59", img: "https://images.unsplash.com/photo-1541643600914-78b084683702?auto=format&fit=crop&w=1400&q=88", offset: { top: "32%", left: "44%" }, depth: 0.55, rotate:  4, w: "26vw" },
  { name: "Solid gold letter",    price: "₾ 68", img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1400&q=88", offset: { top: "58%", left: "16%" }, depth: 0.85, rotate: -2, w: "30vw" },
  { name: "Folded silk ribbon",   price: "₾ 14", img: "https://images.unsplash.com/photo-1605664041954-e23c5f7d5499?auto=format&fit=crop&w=1400&q=88", offset: { top: "68%", left: "62%" }, depth: 0.7,  rotate:  6, w: "22vw" },
];

/**
 * Depth gallery.  Four pieces drift past at different vertical speeds,
 * giving the impression of a parallax stack rather than a flat grid.  Each
 * piece's image has its own internal scale-up on scroll for additional
 * depth.  The header line scrubs in character-by-character.
 */
export function DepthGallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useCinematicText(titleRef, { split: "lines", trigger: "scroll", from: { y: 1.1 }, stagger: 0.1, duration: 1.05 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const section = sectionRef.current;
    if (!section || reduced) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".depth-piece");

      cards.forEach((card) => {
        const depth = parseFloat(card.dataset.depth ?? "0.6");
        gsap.fromTo(
          card,
          { y: 220 * depth, opacity: 0, rotate: parseFloat(card.dataset.rotate ?? "0") - 4 },
          {
            y: -220 * depth,
            opacity: 1,
            rotate: parseFloat(card.dataset.rotate ?? "0"),
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end:   "bottom top",
              scrub: 0.8,
            },
          },
        );

        const inner = card.querySelector<HTMLElement>("img");
        if (inner) {
          gsap.fromTo(
            inner,
            { scale: 1.18 },
            {
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.8,
              },
            },
          );
        }
      });
    }, section);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="surface-paper relative min-h-[140vh] overflow-clip"
      data-scene="gallery"
    >
      <div className="container-edge container-wide pt-32">
        <p className="eyebrow text-[var(--storm-55)]">An archive of small ceremonies</p>
        <h2 ref={titleRef} className="font-display mt-8 max-w-5xl text-display-lg leading-[0.95] text-[var(--ink)]">
          Each piece chosen<br /><em className="italic-serif text-[var(--accent)]">with intention.</em>
        </h2>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {PIECES.map((piece, i) => (
          <article
            key={piece.name}
            className="depth-piece pointer-events-auto absolute"
            data-depth={piece.depth}
            data-rotate={piece.rotate}
            style={{ top: piece.offset.top, left: piece.offset.left, width: piece.w, willChange: "transform" }}
          >
            <Link href="/shop" className="block">
              <div
                className="relative overflow-clip shadow-deep"
                style={{ aspectRatio: "3/4" }}
              >
                <Image
                  src={piece.img}
                  alt={piece.name}
                  fill
                  sizes="30vw"
                  className="object-cover"
                />
              </div>
              <div className="mt-4 flex items-baseline justify-between border-b border-[var(--hair-warm)] pb-3">
                <p className="font-display text-xl text-[var(--ink)]">{piece.name}</p>
                <p className="eyebrow tabular text-[var(--storm-55)]">№{String(i+1).padStart(2,"0")}</p>
              </div>
              <p className="mt-2 tabular text-sm text-[var(--ink)]">{piece.price}</p>
            </Link>
          </article>
        ))}
      </div>

      <div className="absolute bottom-12 right-0 left-0 container-edge text-right">
        <Link
          href="/shop"
          className="link-reveal inline-flex items-center gap-3 text-[12px] uppercase tracking-[0.32em] text-[var(--ink)]"
        >
          See every piece →
        </Link>
      </div>
    </section>
  );
}
