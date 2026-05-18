"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/animation/gsap";
import SplitType from "split-type";

const REVIEWS = [
  { quote: "She cried before she even opened it. The note was printed in our handwriting. It felt like the whole evening had been authored.", author: "Giorgi T.", role: "Tbilisi" , chapter: "Couples · Box 03" },
  { quote: "I had no idea what to send. Twenty minutes later I had a box that felt curated by someone who knew her better than I do.",          author: "Luka M.",   role: "Batumi" , chapter: "Hers · Box 01" },
  { quote: "I live in Berlin. My mother received it on her birthday morning. She told me it made her feel like I was in the room.",           author: "Mariam D.", role: "Berlin → Tbilisi", chapter: "Mother's box" },
];

/**
 * Testimonial reel — auto-advances through curated quotes with a hard
 * cinematic transition: each quote is split into chars, masked out, then
 * the next splits in.  Tightly chosen numbers below run as a tabular
 * counter for editorial weight.
 */
export function TestimonialReel() {
  const sectionRef = useRef<HTMLElement>(null);
  const quoteRef   = useRef<HTMLQuoteElement>(null);
  const metaRef    = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % REVIEWS.length), 8000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const quote = quoteRef.current;
    if (!quote) return;

    const split = new SplitType(quote, { types: "lines,words", lineClass: "rev-line", wordClass: "rev-word" });
    quote.querySelectorAll<HTMLElement>(".rev-line").forEach((line) => { line.style.overflow = "hidden"; });
    const targets = split.words ?? [];

    if (reduced) {
      gsap.set(targets, { yPercent: 0, opacity: 1 });
      gsap.fromTo(metaRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0 });
      return () => split.revert();
    }

    gsap.set(targets, { yPercent: 110, opacity: 0 });
    const tl = gsap.timeline();
    tl.to(targets, {
      yPercent: 0,
      opacity: 1,
      duration: 1,
      ease: "expo.out",
      stagger: 0.025,
    });
    tl.fromTo(metaRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.5");

    return () => {
      tl.kill();
      split.revert();
    };
  }, [idx]);

  return (
    <section ref={sectionRef} className="surface-paper section container-edge container-wide" data-scene="reviews">
      <div className="grid grid-cols-12 gap-12">
        <div className="col-span-12 md:col-span-3">
          <p className="eyebrow text-[var(--storm-55)]">From the recipients</p>
          <p className="font-display mt-6 text-display-sm tabular text-[var(--ink)]">
            {String(idx + 1).padStart(2, "0")} <span className="text-[var(--storm-35)]">/ {String(REVIEWS.length).padStart(2, "0")}</span>
          </p>
          <div className="mt-10 flex flex-col gap-3">
            {REVIEWS.map((r, i) => (
              <button
                key={r.author}
                onClick={() => setIdx(i)}
                className={`group flex items-baseline justify-between gap-4 border-b border-[var(--hair-warm)] py-3 text-left transition-colors ${i === idx ? "text-[var(--ink)]" : "text-[var(--storm-55)] hover:text-[var(--ink)]"}`}
              >
                <span className="font-display text-xl">{r.author.split(" ")[0]}</span>
                <span className="eyebrow tabular">{r.role}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-12 md:col-span-9 md:pl-12">
          <blockquote ref={quoteRef} className="font-display text-quote text-[var(--ink)] leading-[1.1]">
            <span className="italic-serif text-[var(--accent)] mr-1">&ldquo;</span>
            {REVIEWS[idx].quote}
            <span className="italic-serif text-[var(--accent)] ml-1">&rdquo;</span>
          </blockquote>

          <div ref={metaRef} className="mt-12 flex items-center gap-6">
            <span className="block h-px w-12 bg-[var(--ink)]" />
            <div>
              <p className="font-display text-xl text-[var(--ink)]">{REVIEWS[idx].author}</p>
              <p className="eyebrow text-[var(--storm-55)]">{REVIEWS[idx].chapter}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
