"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, X } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

export default function RewardPopup() {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const key = "gamif_welcome_v3";
    if (typeof window !== "undefined" && !localStorage.getItem(key)) {
      const t = setTimeout(() => setVisible(true), 5500);
      return () => clearTimeout(t);
    }
  }, []);

  function dismiss() {
    setVisible(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("gamif_welcome_v3", "1");
    }
  }

  function copyCode() {
    navigator.clipboard.writeText("ATELIER15").catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="reward-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[120] flex items-end justify-center p-0 sm:items-center sm:p-6"
          onClick={dismiss}
        >
          <div className="absolute inset-0 bg-[var(--ink)]/65 backdrop-blur-md" />

          <motion.div
            key="reward-card"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.95, ease }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-md overflow-hidden border border-[var(--hair-warm)] bg-[var(--bone)] sm:max-w-lg"
          >
            <div className="grain-overlay pointer-events-none absolute inset-0 opacity-25" />

            <button
              onClick={dismiss}
              aria-label="Dismiss"
              className="absolute right-5 top-5 z-10 text-[var(--storm-55)] transition-colors hover:text-[var(--ink)]"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative grid grid-cols-1 md:grid-cols-[1fr_1fr]">
              <div className="hidden bg-[var(--ink)] p-10 md:flex md:flex-col md:justify-between">
                <div>
                  <p className="eyebrow text-[var(--bone)]">A welcome offering</p>
                  <p className="font-display mt-4 text-display-sm leading-[0.95] text-[var(--bone)]">
                    First-time<br /><em>guest?</em>
                  </p>
                </div>
                <div>
                  <div className="h-px w-12 bg-[var(--bone)] opacity-40" />
                  <p className="mt-3 text-sm text-[var(--bone)]/65">
                    A small gesture — fifteen percent off your first curation, on us.
                  </p>
                </div>
              </div>

              <div className="p-8 md:p-10">
                <p className="eyebrow text-[var(--storm-55)] md:hidden">Welcome offering</p>
                <p className="font-display text-display-sm leading-[0.95] text-[var(--ink)] md:hidden">
                  First-time<br /><em>guest?</em>
                </p>

                <div className="mt-6 border border-[var(--hair-warm)] p-6">
                  <p className="eyebrow text-[var(--storm-55)]">Your code</p>
                  <p className="mt-3 font-display text-display-sm tabular text-[var(--ink)]">ATELIER15</p>
                  <p className="mt-2 text-xs text-[var(--storm-55)]">15% off your first order, valid for 30 days.</p>
                </div>

                <button
                  onClick={copyCode}
                  className="btn-cinematic btn-cinematic--primary mt-6 w-full justify-center"
                >
                  {copied ? "Copied to clipboard" : (
                    <span className="flex items-center gap-3">
                      <Copy className="h-3 w-3" /> Copy the code
                    </span>
                  )}
                </button>

                <button
                  onClick={dismiss}
                  className="link-reveal mt-4 block text-center text-[11px] uppercase tracking-[0.32em] text-[var(--storm-55)]"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
