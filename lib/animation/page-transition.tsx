"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Cinematic page transition. A storm-coloured curtain wipes over the screen
 * each time the route changes, while the new page fades up underneath.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [phase, setPhase] = useState<"enter" | "ready">("enter");

  useEffect(() => {
    setPhase("enter");
    const t = setTimeout(() => setPhase("ready"), 50);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -16, filter: "blur(4px)" }}
          transition={{ duration: 0.7, ease }}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {phase === "enter" && (
          <motion.div
            key={`curtain-${pathname}`}
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            exit={{ scaleY: 0 }}
            transition={{ duration: 1.05, ease }}
            style={{ transformOrigin: "top" }}
            className="pointer-events-none fixed inset-0 z-[120]"
          >
            <div className="absolute inset-0 bg-[var(--ink)]" />
            <div className="absolute inset-0 grain-overlay opacity-25" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
