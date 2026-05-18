"use client";

import { motion } from "framer-motion";
import clsx from "clsx";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  speed?: number;
  direction?: "left" | "right";
  className?: string;
  pauseOnHover?: boolean;
}

/**
 * Editorial marquee — duplicates content seamlessly and scrolls at constant velocity.
 */
export function Marquee({ children, speed = 50, direction = "left", className, pauseOnHover = true }: Props) {
  const duration = Math.max(8, speed);
  return (
    <div className={clsx("relative w-full overflow-hidden", className)}>
      <motion.div
        className={clsx("flex w-max items-center gap-16 will-change-transform", pauseOnHover && "marquee-track")}
        animate={{ x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"] }}
        transition={{ duration, ease: "linear", repeat: Infinity }}
      >
        <div className="flex shrink-0 items-center gap-16">{children}</div>
        <div className="flex shrink-0 items-center gap-16" aria-hidden>{children}</div>
      </motion.div>
    </div>
  );
}
