"use client";

import { motion, type Variants } from "framer-motion";
import { ReactNode } from "react";

const ease = [0.16, 1, 0.3, 1] as const;

const variants: Variants = {
  hidden: { opacity: 0, y: 32, filter: "blur(6px)" },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.95, ease, delay },
  }),
};

interface Props {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "article" | "header" | "footer" | "li";
  once?: boolean;
}

export function Reveal({ children, delay = 0, className, as = "div", once = true }: Props) {
  const MotionTag = motion[as] as typeof motion.div;

  return (
    <MotionTag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-80px" }}
      custom={delay}
    >
      {children}
    </MotionTag>
  );
}
