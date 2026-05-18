"use client";

/**
 * Full-viewport film grain. Renders an SVG noise texture in a fixed layer
 * with multiply blending — adds a tactile, cinematic patina to every page.
 */
export function GrainOverlay() {
  return <div aria-hidden className="grain-overlay pointer-events-none fixed inset-0 z-[80]" />;
}
