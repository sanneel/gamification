"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { gsap, ScrollTrigger } from "@/lib/animation/gsap";
import { useCinematicText } from "@/lib/animation/use-cinematic-text";

const AUDIENCES = [
  { href: "/shop?audience=for_her", roman: "I",   label: "For her.",   sub: "Roses, perfume, the warmth of brass.",      img: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1800&q=88" },
  { href: "/shop?audience=for_him", roman: "II",  label: "For him.",   sub: "Leather, cologne, a quiet object he uses.", img: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=1800&q=88" },
  { href: "/shop?audience=couple",  roman: "III", label: "For both.",  sub: "Linen, evening light, a story you share.",  img: "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=2000&q=88" },
];

/**
 * Audience scene.  Three "chapters" each rendered as a full-bleed strip,
 * with the image clipped behind a vertical bar that grows on scroll — a
 * theatrical curtain reveal.  Hover swaps the bar accent and lifts the
 * chapter's metadata.
 */
export function AudiencesScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef    = useRef<HTMLHeadingElement>(null);

  useCinematicText(headRef, { split: "lines", trigger: "scroll", from: { y: 1.1 }, stagger: 0.08, duration: 1.1 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = sectionRef.current;
    if (!root || reduced) return;

    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>(".aud-row");
      items.forEach((row) => {
        const reveal = row.querySelector<HTMLElement>(".aud-reveal");
        const img    = row.querySelector<HTMLElement>(".aud-img");

        if (reveal) {
          gsap.fromTo(
            reveal,
            { scaleX: 0 },
            {
              scaleX: 1,
              ease: "expo.out",
              duration: 1.2,
              scrollTrigger: { trigger: row, start: "top 75%", once: true },
            },
          );
        }
        if (img) {
          gsap.fromTo(
            img,
            { scale: 1.18 },
            {
              scale: 1.02,
              ease: "none",
              scrollTrigger: { trigger: row, start: "top bottom", end: "bottom top", scrub: 0.6 },
            },
          );
        }
      });
    }, root);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <section ref={sectionRef} className="surface-bone section container-edge container-wide" data-scene="audiences">
      <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
        <div>
          <p className="eyebrow text-[var(--storm-55)]">Three chapters</p>
          <h2 ref={headRef} className="font-display mt-6 text-display-md text-[var(--ink)] leading-[0.95]">
            Who is the<br /><em className="italic-serif text-[var(--accent)]">story</em> for?
          </h2>
        </div>
        <p className="max-w-sm text-body text-[var(--storm-55)]">
          Three sketches of recipients. Step into one, or compose your own from the full shop.
        </p>
      </div>

      <div className="mt-24 space-y-px border-t border-[var(--hair-warm)]">
        {AUDIENCES.map((aud, i) => (
          <Link key={aud.href} href={aud.href} className="aud-row group grid grid-cols-12 items-center gap-6 border-b border-[var(--hair-warm)] py-12 transition-colors">
            <div className="col-span-2 md:col-span-1">
              <span className="font-display text-3xl text-[var(--storm-35)] tabular">{aud.roman}</span>
            </div>
            <div className="col-span-10 md:col-span-4">
              <h3 className="font-display text-display-sm text-[var(--ink)] leading-[1] transition-transform duration-700 group-hover:-translate-y-1">
                {aud.label}
              </h3>
              <p className="mt-3 text-body-sm text-[var(--storm-55)]">{aud.sub}</p>
            </div>

            <div className="relative col-span-12 md:col-span-6 overflow-clip aspect-[16/7] order-3">
              <div className="aud-img absolute inset-0">
                <Image src={aud.img} alt={aud.label} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
              </div>
              <div aria-hidden className="aud-reveal absolute inset-0 origin-right scale-x-0 bg-[var(--bone)]" />
            </div>

            <div className="col-span-12 md:col-span-1 order-4 flex md:justify-end">
              <ArrowRight className="h-4 w-4 text-[var(--ink)] -translate-x-2 opacity-0 transition-all duration-700 group-hover:translate-x-0 group-hover:opacity-100" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
