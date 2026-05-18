"use client";

import { useMagnetic } from "@/lib/animation/use-magnetic";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  strength?: number;
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost";
}

export const MagneticButton = forwardRef<HTMLButtonElement, Props>(function MagneticButton(
  { strength = 0.3, children, className, variant = "primary", ...rest },
  forwarded,
) {
  const magnetic = useMagnetic<HTMLButtonElement>(strength);

  const setRefs = (node: HTMLButtonElement | null) => {
    (magnetic as { current: HTMLButtonElement | null }).current = node;
    if (typeof forwarded === "function") forwarded(node);
    else if (forwarded) (forwarded as { current: HTMLButtonElement | null }).current = node;
  };

  return (
    <button
      ref={setRefs}
      className={clsx(
        "btn-cinematic inline-flex items-center justify-center gap-3 px-9 py-4 text-[10px] tracking-[0.32em] uppercase",
        variant === "primary" && "btn-cinematic--primary",
        variant === "outline" && "btn-cinematic--outline",
        variant === "ghost" && "btn-cinematic--ghost",
        className,
      )}
      {...rest}
    >
      <span className="btn-cinematic__label">{children}</span>
    </button>
  );
});
