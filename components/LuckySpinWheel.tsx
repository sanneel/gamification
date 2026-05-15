"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Zap } from "lucide-react";
import type { RewardType, SpinReward, WheelSegment } from "@/lib/types";
import { WHEEL_SEGMENTS } from "@/lib/types";

interface LuckySpinWheelProps {
  sessionToken: string;
  onRewardReceived: (reward: SpinReward) => void;
  onClose: () => void;
}

type Phase = "idle" | "countdown" | "spinning" | "slowing" | "done";

const SPIN_DURATION_MS = 4200;
const SEGMENT_COUNT = WHEEL_SEGMENTS.length;
const FULL_ROTATION = 360;

export default function LuckySpinWheel({
  sessionToken,
  onRewardReceived,
  onClose,
}: LuckySpinWheelProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [rotation, setRotation] = useState(0);
  const [reward, setReward] = useState<SpinReward | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const targetRotationRef = useRef<number>(0);

  // Easing: fast then decelerate
  function easeOut(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  const animateSpin = useCallback(
    (startRot: number, targetRot: number, durationMs: number, onDone: () => void) => {
      startTimeRef.current = null;

      function frame(timestamp: number) {
        if (!startTimeRef.current) startTimeRef.current = timestamp;
        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / durationMs, 1);
        const easedProgress = easeOut(progress);
        setRotation(startRot + (targetRot - startRot) * easedProgress);

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(frame);
        } else {
          setRotation(targetRot);
          onDone();
        }
      }
      rafRef.current = requestAnimationFrame(frame);
    },
    [],
  );

  async function handleSpin() {
    if (phase !== "idle") return;
    setPhase("countdown");
    setError(null);

    // Countdown 3-2-1
    for (let i = 3; i >= 1; i--) {
      setCountdown(i);
      await delay(700);
    }

    setPhase("spinning");

    // Start visual spin immediately (fast, many full rotations)
    const fastSpins = 1440 + Math.random() * 720; // 4-6 full spins
    const currentRot = rotation;
    const fastTarget = currentRot + fastSpins;

    // Animate the fast spin
    animateSpin(currentRot, fastTarget, SPIN_DURATION_MS / 2, () => {});

    // Hit the server while spinning
    let serverReward: SpinReward | null = null;
    try {
      const res = await fetch("/api/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken }),
      });
      const data = await res.json();
      serverReward = data.reward ?? null;
    } catch {
      // fallback reward for offline/demo
      serverReward = {
        id: "demo",
        type: "free_shipping" as RewardType,
        label: "🚚 Free Shipping!",
        value: null,
        createdAt: new Date().toISOString(),
      };
    }

    // Cancel any ongoing animation
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    // Map reward to wheel segment index
    const segIndex = WHEEL_SEGMENTS.findIndex((s) => s.type === serverReward!.type);
    const finalSegIndex = segIndex === -1 ? 0 : segIndex;

    // Calculate final rotation so pointer lands on the reward segment
    const segAngle = FULL_ROTATION / SEGMENT_COUNT;
    const segCenter = finalSegIndex * segAngle + segAngle / 2;
    // We want the TOP of the wheel (pointer at 0°) to land on segCenter
    // Add extra full spins to create drama
    const extraSpins = 3 * FULL_ROTATION;
    const finalRot = fastTarget + extraSpins + (FULL_ROTATION - ((fastTarget + extraSpins) % FULL_ROTATION)) + segCenter;

    setPhase("slowing");
    animateSpin(fastTarget, finalRot, SPIN_DURATION_MS / 2, () => {
      setReward(serverReward!);
      setPhase("done");
      onRewardReceived(serverReward!);
    });
  }

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={phase === "done" ? onClose : undefined}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Modal */}
        <motion.div
          className="relative z-10 w-full max-w-md mx-4"
          initial={{ scale: 0.8, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 40 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          <div className="glass-strong border border-white/10 rounded-3xl p-8 text-center overflow-hidden relative">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-radial from-accent/10 via-violet/5 to-transparent pointer-events-none" />

            {/* Close (only when done) */}
            {phase === "done" && (
              <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 glass rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors z-10">
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Chosen text */}
            <AnimatePresence mode="wait">
              {phase === "idle" && (
                <motion.div key="idle" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="text-5xl mb-3 animate-bounce">🎉</div>
                  <h2 className="font-display text-4xl font-bold text-white mb-2">WAIT...</h2>
                  <p className="text-white/70 text-lg mb-1">You've been chosen.</p>
                  <p className="text-white/40 text-sm">Spin the lucky wheel for a surprise reward!</p>
                </motion.div>
              )}
              {phase === "countdown" && (
                <motion.div key="countdown" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <motion.div
                    key={countdown}
                    className="text-9xl font-black text-white"
                    initial={{ scale: 2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    {countdown}
                  </motion.div>
                  <p className="text-white/50 text-sm mt-2">Get ready...</p>
                </motion.div>
              )}
              {phase === "done" && reward && (
                <motion.div
                  key="done"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                >
                  <div className="text-6xl mb-3">
                    {WHEEL_SEGMENTS.find((s) => s.type === reward.type)?.emoji ?? "🎁"}
                  </div>
                  <h2 className="font-display text-5xl font-bold text-white mb-2">You Won!</h2>
                  <p className="text-accent text-2xl font-black mb-4">{reward.label}</p>
                  <p className="text-white/40 text-sm">Applied to your box at checkout.</p>
                </motion.div>
              )}
              {(phase === "spinning" || phase === "slowing") && (
                <motion.div key="spinning" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <p className="text-white/60 text-sm font-bold uppercase tracking-widest mb-4">Spinning...</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Wheel ──────────────────────────────────────────────── */}
            <div className="relative my-6 flex items-center justify-center">
              {/* Outer glow ring */}
              <div className="absolute w-72 h-72 rounded-full"
                style={{ background: `conic-gradient(${WHEEL_SEGMENTS.map((s, i) => `${s.color} ${(i / SEGMENT_COUNT) * 100}% ${((i + 1) / SEGMENT_COUNT) * 100}%`).join(", ")})`, filter: "blur(8px)", opacity: 0.4 }}
              />

              {/* Pointer */}
              <div className="absolute -top-1 z-20 flex flex-col items-center">
                <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[20px] border-l-transparent border-r-transparent border-b-white drop-shadow-lg" />
              </div>

              {/* Wheel SVG */}
              <motion.div
                className="wheel-container"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <svg width="260" height="260" viewBox="0 0 260 260">
                  {WHEEL_SEGMENTS.map((seg, i) => {
                    const startAngle = (i / SEGMENT_COUNT) * 2 * Math.PI - Math.PI / 2;
                    const endAngle = ((i + 1) / SEGMENT_COUNT) * 2 * Math.PI - Math.PI / 2;
                    const cx = 130, cy = 130, r = 120;
                    const x1 = cx + r * Math.cos(startAngle);
                    const y1 = cy + r * Math.sin(startAngle);
                    const x2 = cx + r * Math.cos(endAngle);
                    const y2 = cy + r * Math.sin(endAngle);
                    const midAngle = (startAngle + endAngle) / 2;
                    const tx = cx + (r * 0.65) * Math.cos(midAngle);
                    const ty = cy + (r * 0.65) * Math.sin(midAngle);
                    const labelRot = (midAngle * 180) / Math.PI + 90;

                    return (
                      <g key={i}>
                        <path
                          d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                          fill={seg.color}
                          stroke="rgba(0,0,0,0.3)"
                          strokeWidth="1.5"
                        />
                        <text
                          x={tx}
                          y={ty}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          transform={`rotate(${labelRot}, ${tx}, ${ty})`}
                          fontSize="14"
                          fill="white"
                          fontWeight="bold"
                        >
                          {seg.emoji}
                        </text>
                      </g>
                    );
                  })}
                  {/* Center circle */}
                  <circle cx="130" cy="130" r="22" fill="#0D0D0D" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
                  <text x="130" y="130" textAnchor="middle" dominantBaseline="middle" fontSize="16">✨</text>
                </svg>
              </motion.div>
            </div>

            {/* CTA */}
            <AnimatePresence mode="wait">
              {phase === "idle" && (
                <motion.button
                  key="spin-btn"
                  onClick={handleSpin}
                  className="btn-dopamine w-full py-4 rounded-2xl text-base font-black uppercase tracking-widest flex items-center justify-center gap-3 mt-2"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <Zap className="w-5 h-5" />
                  Spin Now!
                </motion.button>
              )}
              {phase === "done" && (
                <motion.button
                  key="continue-btn"
                  onClick={onClose}
                  className="btn-gold w-full py-4 rounded-2xl text-base font-black uppercase tracking-widest flex items-center justify-center gap-3 mt-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Sparkles className="w-5 h-5" />
                  Claim Reward & Continue
                </motion.button>
              )}
            </AnimatePresence>

            {error && (
              <p className="mt-3 text-red-400 text-xs font-bold">{error}</p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
