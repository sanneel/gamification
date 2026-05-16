"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Sparkles, X } from "lucide-react";
import { springs } from "@/lib/motion";

export default function RewardPopup() {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const key = "gamif_welcome_v2";
    if (typeof window !== "undefined" && !localStorage.getItem(key)) {
      const t = setTimeout(() => setVisible(true), 5000);
      return () => clearTimeout(t);
    }
  }, []);

  function dismiss() {
    setVisible(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("gamif_welcome_v2", "1");
    }
  }

  function copyCode() {
    navigator.clipboard.writeText("WELCOME15").catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="reward-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4 sm:p-6"
          onClick={dismiss}
        >
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />

          <motion.div
            key="reward-card"
            initial={{ y: 60, opacity: 0, scale: 0.93 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.95 }}
            transition={springs.bouncy}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-sm rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(155deg, #1a0a22 0%, #100818 50%, #0d0d0d 100%)",
              border: "1px solid rgba(255,45,120,0.18)",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 30px 80px rgba(0,0,0,0.7), 0 0 80px rgba(255,45,120,0.2)",
            }}
          >
            {/* Ambient glows */}
            <div className="absolute top-0 left-0 w-56 h-56 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(255,45,120,0.22) 0%, transparent 70%)", transform: "translate(-40%, -50%)" }} />
            <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)", transform: "translate(30%, 40%)" }} />

            {/* Close */}
            <button
              onClick={dismiss}
              aria-label="Dismiss"
              className="absolute top-4 right-4 z-20 w-7 h-7 flex items-center justify-center rounded-full text-white/30 hover:text-white hover:bg-white/8 transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="relative p-6 pt-7">
              {/* Icon */}
              <motion.div
                className="text-5xl mb-4"
                animate={{ y: [0, -6, 0], rotate: [0, -3, 3, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                🎁
              </motion.div>

              <h3 className="font-display text-2xl font-bold text-white mb-1 leading-tight">
                Welcome gift,<br />
                <span style={{ background: "linear-gradient(135deg,#FF2D78,#A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  just for you.
                </span>
              </h3>
              <p className="text-white/45 text-sm mb-5 leading-relaxed">
                First-time visitor? Take 15% off your first order — no strings attached.
              </p>

              {/* Code block */}
              <motion.div
                className="rounded-2xl p-4 mb-5 text-center relative overflow-hidden"
                style={{ background: "rgba(255,215,0,0.07)", border: "1px solid rgba(255,215,0,0.2)" }}
                whileHover={{ borderColor: "rgba(255,215,0,0.4)" }}
              >
                <div className="absolute inset-0 shimmer opacity-30 pointer-events-none" />
                <p className="text-gold/70 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Your Promo Code</p>
                <p className="font-mono font-black text-white text-2xl tracking-[0.18em] mb-1">WELCOME15</p>
                <p className="text-white/35 text-xs">15% off your first order</p>
              </motion.div>

              {/* Actions */}
              <div className="space-y-2.5">
                <motion.button
                  onClick={copyCode}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-dopamine w-full py-3.5 rounded-2xl text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <><span>✓</span> Copied!</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" /> Copy Code</>
                  )}
                </motion.button>

                <button
                  onClick={dismiss}
                  className="w-full text-white/25 text-xs py-2 hover:text-white/50 transition-colors"
                >
                  No thanks, I&apos;ll pay full price
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
