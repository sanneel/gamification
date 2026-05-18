"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";

import { useCursorParallax } from "@/lib/animation/use-cursor-parallax";
import { useCinematicText } from "@/lib/animation/use-cinematic-text";
import { useScrollVelocity } from "@/lib/animation/use-scroll-velocity";

const STAGE_BG  = "https://images.unsplash.com/photo-1511376777868-611b54f68947?auto=format&fit=crop&w=2600&q=92";
const STAGE_MID = "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1800&q=92";
const STAGE_FORE= "https://images.unsplash.com/photo-1505740106531-4243f3831c78?auto=format&fit=crop&w=1400&q=92";

/**
 * The cinematic opening scene.  Three depth layers (background, mid, foreground)
 * drift independently with the cursor and with scroll.  The headline splits
 * into masked lines that rise on mount, and the whole title skews subtly
 * with live scroll velocity.  A vertical "scroll" rail breathes at the right.
 */
export function HeroCinema() {
  const stageRef    = useRef<HTMLElement>(null);
  const layersRef   = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const overTitleRef= useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: stageRef, offset: ["start start", "end start"] });
  const heroY      = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);
  const heroBlur   = useTransform(scrollYProgress, [0, 1], ["0px", "10px"]);
  const heroOpac   = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const bgY        = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const midY       = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const foreY      = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);

  useCursorParallax(layersRef, { strength: 36, ease: 0.06, max: 80, rotate: false });
  useCinematicText(headlineRef, { split: "lines", from: { y: 1.1 }, stagger: 0.12, duration: 1.3, delay: 0.4, ease: "expo.out" });
  useScrollVelocity(overTitleRef, { property: "skewY", amount: 0.015, max: 7, ease: 0.1 });

  return (
    <section
      ref={stageRef}
      className="relative h-[120vh] min-h-[820px] overflow-clip surface-ink text-[var(--bone)]"
      data-scene="hero"
    >
      <motion.div
        ref={layersRef}
        style={{ y: heroY, opacity: heroOpac, filter: useTransformAsFilter(heroBlur) }}
        className="absolute inset-0"
      >
        <motion.div data-depth="0.18" style={{ y: bgY }} className="absolute inset-0">
          <Image src={STAGE_BG} alt="" fill priority sizes="100vw" className="object-cover scale-[1.05]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--ink)]/55 via-transparent to-[var(--ink)]/75" />
        </motion.div>

        <motion.div data-depth="0.35" style={{ y: midY }} className="absolute inset-[-6%] mix-blend-luminosity opacity-[0.55]">
          <Image src={STAGE_MID} alt="" fill sizes="100vw" className="object-cover" />
        </motion.div>

        <motion.div
          data-depth="0.55"
          style={{ y: foreY }}
          className="absolute -bottom-12 -right-12 hidden h-[55%] w-[45%] overflow-clip border border-[var(--bone)]/20 md:block"
        >
          <Image src={STAGE_FORE} alt="" fill sizes="45vw" className="object-cover scale-[1.04]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/55 to-transparent" />
        </motion.div>

        <div className="grain-overlay absolute inset-0 opacity-30" />
      </motion.div>

      {/* Side rails */}
      <div className="absolute left-0 right-0 top-0 z-10 container-edge pt-32 hidden md:flex justify-between text-[11px] uppercase tracking-[0.32em] text-[var(--bone)]/70">
        <span>Vol. 04 · Spring archive</span>
        <span className="tabular">{new Date().getFullYear()} · TBL 41.71° N</span>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 2 }}
        className="absolute right-6 top-1/2 hidden -translate-y-1/2 z-10 md:flex flex-col items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-[var(--bone)]/55"
      >
        <span className="block h-12 w-px bg-[var(--bone)]/40 animate-blink-soft" />
        <span className="writing-vertical">scroll · the unboxing</span>
        <span className="block h-12 w-px bg-[var(--bone)]/40" />
      </motion.div>

      {/* Title stack */}
      <div className="absolute inset-0 z-10 container-edge flex flex-col justify-end pb-[14vh]">
        <div ref={overTitleRef} style={{ willChange: "transform" }}>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16,1,0.3,1], delay: 1.8 }}
            className="eyebrow text-[var(--bone)]/65"
          >
            A cinematic mystery gifting house
          </motion.p>

          <h1
            ref={headlineRef}
            className="font-display font-light leading-[0.84] mt-6 text-display-xl"
            style={{ letterSpacing: "-0.04em" }}
          >
            <span className="block">The gift</span>
            <span className="block italic-serif text-[var(--accent-2)]">that remembers</span>
            <span className="block">itself.</span>
          </h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.16,1,0.3,1], delay: 2.3 }}
          className="mt-12 grid grid-cols-1 items-end gap-10 md:grid-cols-[1.4fr_auto_1fr]"
        >
          <p className="max-w-md text-body-lg text-[var(--bone)]/80">
            Three hand-chosen objects. A printed letter sealed in wax. A lucky reward, every box. Wrapped in archival paper and sent anywhere on earth.
          </p>
          <span aria-hidden className="hidden h-px w-24 bg-[var(--bone)]/40 md:block" />
          <div className="flex flex-wrap items-center gap-8">
            <Link href="/build-a-box" className="btn-cinematic btn-cinematic--outline border-[var(--bone)]/55 text-[var(--bone)]">
              <span className="btn-cinematic__label">Begin a box</span>
            </Link>
            <Link href="/shop" className="link-reveal flex items-center gap-3 text-[12px] uppercase tracking-[0.22em] text-[var(--bone)]/80">
              The collection <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

import type { MotionValue } from "framer-motion";

/** Tiny helper: turn a numeric `blur` MotionValue into a CSS filter string. */
function useTransformAsFilter(blur: MotionValue<string>): MotionValue<string> {
  return useTransform(blur, (v) => `blur(${v})`);
}
