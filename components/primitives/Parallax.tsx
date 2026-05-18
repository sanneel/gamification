"use client";

import { useParallax } from "@/lib/animation/use-parallax";
import type { ReactNode } from "react";

interface Props {
  strength?: number;
  className?: string;
  children: ReactNode;
}

/**
 * Wraps content with smooth GSAP parallax. Place it inside a parent that
 * defines the visible window (with overflow-hidden if needed).
 */
export function Parallax({ strength = 0.18, className, children }: Props) {
  const ref = useParallax<HTMLDivElement>(strength);
  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
