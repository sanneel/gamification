"use client";

import { useSplitReveal } from "@/lib/animation/use-split-text";
import type { ReactNode } from "react";

interface Props {
  as?: "h1" | "h2" | "h3" | "h4" | "p";
  className?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
  type?: "lines" | "words" | "chars" | "lines,words" | "lines,words,chars";
  trigger?: "mount" | "scroll";
  children: ReactNode;
}

/**
 * Heading that animates line-by-line on mount or scroll using SplitType + GSAP.
 * SSR-safe: render falls back to a plain element while the split layer attaches.
 */
export function SplitHeading({
  as: Tag = "h2",
  className,
  delay = 0,
  duration = 1.05,
  stagger = 0.08,
  type = "lines",
  trigger = "mount",
  children,
}: Props) {
  const ref = useSplitReveal<HTMLHeadingElement>({ delay, duration, stagger, type, trigger });

  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  );
}
