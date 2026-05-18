"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/animation/gsap";

/**
 * Refined custom cursor — a small dot that follows the pointer with light
 * lag, and a halo that grows over interactive elements. Falls back to the
 * system cursor on touch devices or when reduced motion is requested.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: none)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      gsap.to(dot, { x: mouseX, y: mouseY, duration: 0.18, ease: "power2.out" });
      gsap.to(ring, { x: mouseX, y: mouseY, duration: 0.55, ease: "power3.out" });
    };

    const onEnter = () => gsap.to(ring, { scale: 1.85, opacity: 0.4, duration: 0.4 });
    const onLeave = () => gsap.to(ring, { scale: 1, opacity: 1, duration: 0.4 });

    window.addEventListener("mousemove", onMove);
    document.querySelectorAll<HTMLElement>("a, button, [data-cursor='hover']").forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    document.documentElement.classList.add("has-custom-cursor");

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="custom-cursor-ring" aria-hidden />
      <div ref={dotRef} className="custom-cursor-dot" aria-hidden />
    </>
  );
}
