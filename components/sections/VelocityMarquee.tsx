"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/animation/gsap";
import { useLenis } from "@/lib/animation/lenis-provider";

const PHRASES = [
  "curated mystery gifting",
  "·",
  "hand-wrapped in paper & wax",
  "·",
  "printed note inside",
  "·",
  "a lucky reward, every box",
  "·",
  "atelier · tbilisi · 2025",
  "·",
];

/**
 * A two-strip marquee whose speed and direction respond to the live scroll
 * velocity.  Scrolling down accelerates the bottom strip, decelerates the
 * top; scrolling up reverses both.  At rest, the strips drift at a slow
 * editorial cadence.
 */
export function VelocityMarquee() {
  const wrap = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const botRef = useRef<HTMLDivElement>(null);
  const { smoothVelocityRef } = useLenis();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const top = topRef.current;
    const bot = botRef.current;
    if (!top || !bot) return;

    let topX = 0;
    let botX = 0;

    const ticker = () => {
      const v = smoothVelocityRef.current;
      // Base drift (px per frame): top to the left, bottom to the right.
      topX -= 0.6 + v * 0.04;
      botX += 0.6 + v * 0.04;
      // Wrap around — strip width is 50% (track is doubled).
      const topRect = top.getBoundingClientRect();
      const botRect = bot.getBoundingClientRect();
      const halfTop = topRect.width / 2;
      const halfBot = botRect.width / 2;
      if (topX < -halfTop) topX += halfTop;
      if (topX > 0)        topX -= halfTop;
      if (botX < -halfBot) botX += halfBot;
      if (botX > 0)        botX -= halfBot;
      gsap.set(top, { x: topX });
      gsap.set(bot, { x: botX });
    };

    gsap.ticker.add(ticker);
    return () => { gsap.ticker.remove(ticker); };
  }, [smoothVelocityRef]);

  return (
    <div ref={wrap} className="surface-ink relative overflow-clip py-8 text-[var(--bone)] border-t border-b border-[var(--hair)]" data-scene="marquee">
      <div className="relative space-y-4">
        <div ref={topRef} className="flex w-max items-center gap-12 whitespace-nowrap will-change-transform">
          {[...PHRASES, ...PHRASES].map((phrase, i) => (
            <span key={`top-${i}`} className="font-display text-[6vw] leading-none tracking-tight">
              {phrase === "·" ? <span className="text-[var(--accent-2)]">·</span> : phrase}
            </span>
          ))}
        </div>
        <div ref={botRef} className="flex w-max items-center gap-12 whitespace-nowrap will-change-transform">
          {[...PHRASES, ...PHRASES].map((phrase, i) => (
            <span key={`bot-${i}`} className="font-display italic-serif text-[6vw] leading-none tracking-tight opacity-60">
              {phrase === "·" ? <span className="text-[var(--accent-2)] opacity-100">·</span> : phrase}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
