"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useAnimate } from "framer-motion";
import { SpinReward, WHEEL_SEGMENTS } from "@/lib/types";
import ConfettiParticles from "./ConfettiParticles";
import { springs, ease } from "@/lib/motion";

interface Props {
  sessionToken: string;
  onRewardReceived: (reward: SpinReward) => void;
  onClose: () => void;
}

type Phase =
  | "chosen"
  | "countdown"
  | "spinning"
  | "landing"
  | "reveal"
  | "done";

const SEGMENT_COUNT = WHEEL_SEGMENTS.length;
const SEGMENT_ANGLE = 360 / SEGMENT_COUNT;

function Orb({ delay, size, color }: { delay: number; size: number; color: string }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, background: color, filter: "blur(50px)", opacity: 0.2 }}
      animate={{ x: ["-30%", "30%", "-10%", "25%", "-30%"], y: ["-20%", "25%", "-30%", "10%", "-20%"] }}
      transition={{ duration: 12 + delay * 3, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

function SpinRing({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="absolute inset-[-20px] rounded-full pointer-events-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0.5, 0.15, 0.5], scale: [1, 1.12, 1] }}
          exit={{ opacity: 0, scale: 1.3 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          style={{ boxShadow: "0 0 60px 20px #FF2D78, 0 0 120px 40px #7C3AED" }}
        />
      )}
    </AnimatePresence>
  );
}

export default function LuckySpinWheel({ sessionToken, onRewardReceived, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>("chosen");
  const [countdown, setCountdown] = useState(3);
  const [rotation, setRotation] = useState(0);
  const [reward, setReward] = useState<SpinReward | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [screenFlash, setScreenFlash] = useState(false);

  const rotationRef = useRef(0);
  const animRef = useRef<number>(0);
  const [pointerScope, animatePointer] = useAnimate();

  const fetchReward = useCallback(async (): Promise<SpinReward> => {
    try {
      const res = await fetch("/api/spin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionToken }),
      });
      if (res.ok) return await res.json();
    } catch {}
    return { id: "local", type: "free_shipping", label: "Free Shipping", value: null, createdAt: new Date().toISOString() };
  }, [sessionToken]);

  const bouncePointer = useCallback(() => {
    if (!pointerScope.current) return;
    animatePointer(pointerScope.current, { rotate: [0, -14, 5, -8, 2, 0] }, { duration: 0.28 });
  }, [animatePointer, pointerScope]);

  // Phase: chosen → countdown
  useEffect(() => {
    if (phase !== "chosen") return;
    const t = setTimeout(() => setPhase("countdown"), 2800);
    return () => clearTimeout(t);
  }, [phase]);

  // Phase: countdown 3→2→1→spin
  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) { setPhase("spinning"); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 880);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  // Phase: spinning → fetch reward → landing
  useEffect(() => {
    if (phase !== "spinning") return;

    let fetchedReward: SpinReward | null = null;
    let fetchDone = false;
    const spinStartTime = Date.now();
    const FAST_DURATION = 2000;

    fetchReward().then((r) => { fetchedReward = r; fetchDone = true; });

    const SPEED = 13;
    let lastBounce = 0;

    function spinLoop() {
      rotationRef.current += SPEED;
      setRotation(rotationRef.current);

      if (rotationRef.current - lastBounce > 38) {
        lastBounce = rotationRef.current;
        bouncePointer();
      }

      const elapsed = Date.now() - spinStartTime;
      if (fetchDone && elapsed > FAST_DURATION) {
        cancelAnimationFrame(animRef.current);
        landOnReward(fetchedReward!);
      } else {
        animRef.current = requestAnimationFrame(spinLoop);
      }
    }

    animRef.current = requestAnimationFrame(spinLoop);
    return () => cancelAnimationFrame(animRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function landOnReward(r: SpinReward) {
    setPhase("landing");

    const segmentIndex = WHEEL_SEGMENTS.findIndex((s) => s.type === r.type);
    const targetIndex = segmentIndex === -1 ? 0 : segmentIndex;
    const targetDegInWheel = targetIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
    const extra = 4 * 360;
    const current = rotationRef.current % 360;
    const needed = (360 - targetDegInWheel + 360) % 360;
    const delta = (needed - current + 360) % 360;
    const finalRotation = rotationRef.current + delta + extra;
    const startRotation = rotationRef.current;
    const startTime = performance.now();
    const DURATION = 2600;

    function easeOut(t: number) { return 1 - Math.pow(1 - t, 4); }

    function decelerate(now: number) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / DURATION, 1);
      const cur = startRotation + (finalRotation - startRotation) * easeOut(t);
      rotationRef.current = cur;
      setRotation(cur);

      if (t < 1) {
        animRef.current = requestAnimationFrame(decelerate);
      } else {
        bouncePointer();
        setScreenFlash(true);
        setTimeout(() => setScreenFlash(false), 350);
        setTimeout(() => {
          setReward(r);
          setPhase("reveal");
          if (r.type !== "no_reward") setTimeout(() => setShowConfetti(true), 300);
        }, 480);
      }
    }

    animRef.current = requestAnimationFrame(decelerate);
  }

  function handleDone() {
    if (reward) onRewardReceived(reward);
    onClose();
  }

  const isWin = reward && reward.type !== "no_reward";

  function buildWheelPath(index: number) {
    const startAngle = (index * SEGMENT_ANGLE * Math.PI) / 180;
    const endAngle = ((index + 1) * SEGMENT_ANGLE * Math.PI) / 180;
    const R = 130;
    const cx = 140; const cy = 140;
    const x1 = cx + R * Math.cos(startAngle - Math.PI / 2);
    const y1 = cy + R * Math.sin(startAngle - Math.PI / 2);
    const x2 = cx + R * Math.cos(endAngle - Math.PI / 2);
    const y2 = cy + R * Math.sin(endAngle - Math.PI / 2);
    return `M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} Z`;
  }

  function getTextTransform(index: number) {
    const midAngle = (index + 0.5) * SEGMENT_ANGLE - 90;
    const R = 92;
    const cx = 140; const cy = 140;
    const x = cx + R * Math.cos((midAngle * Math.PI) / 180);
    const y = cy + R * Math.sin((midAngle * Math.PI) / 180);
    return { x, y, rotate: midAngle + 90 };
  }

  return (
    <>
      <ConfettiParticles trigger={showConfetti} count={180} spread={260} />

      <AnimatePresence>
        {screenFlash && (
          <motion.div
            className="fixed inset-0 z-[160] pointer-events-none"
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{ background: "radial-gradient(ellipse at center, rgba(255,255,255,0.3) 0%, transparent 70%)" }}
          />
        )}
      </AnimatePresence>

      {/* Main overlay */}
      <motion.div
        className="fixed inset-0 z-[140] flex items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        style={{ background: "radial-gradient(ellipse at 50% 35%, #1e0535 0%, #0a0015 45%, #0D0D0D 100%)" }}
      >
        {/* Ambient orbs */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <Orb delay={0} size={600} color="#FF2D78" />
          <Orb delay={2.5} size={450} color="#7C3AED" />
          <Orb delay={5} size={380} color="#FFD700" />
        </div>

        {/* Stars */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 rounded-full bg-white"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{ opacity: [0, 0.8, 0] }}
              transition={{ duration: 2 + Math.random() * 3, delay: Math.random() * 4, repeat: Infinity }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── CHOSEN ─────────────────────────────────────────────────────── */}
          {phase === "chosen" && (
            <motion.div
              key="chosen"
              className="relative z-10 text-center px-8 max-w-sm"
              initial={{ opacity: 0, scale: 0.75, filter: "blur(24px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.2, filter: "blur(16px)" }}
              transition={{ duration: 0.8, ease: ease.expo }}
            >
              <motion.div
                className="text-7xl mb-6"
                animate={{ rotate: [0, -10, 10, -6, 6, 0], scale: [1, 1.25, 0.95, 1.1, 1] }}
                transition={{ duration: 1.4, delay: 0.5 }}
              >
                ✨
              </motion.div>
              <motion.p
                className="text-white/40 uppercase tracking-[0.3em] text-xs font-medium mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.6 }}
              >
                Wait...
              </motion.p>
              <motion.h2
                className="text-4xl md:text-5xl font-display font-bold text-white leading-tight"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.7, ease: ease.expo }}
              >
                You&apos;ve been{" "}
                <span
                  className="font-black"
                  style={{
                    background: "linear-gradient(135deg, #FF2D78 0%, #7C3AED 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: "drop-shadow(0 0 20px #FF2D7860)",
                  }}
                >
                  chosen
                </span>
              </motion.h2>
              <motion.p
                className="text-white/50 mt-4 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.95 }}
              >
                Spin the wheel for your exclusive reward
              </motion.p>
              <motion.div
                className="mt-8 flex justify-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-[#FF2D78]"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.3, 0.8] }}
                    transition={{ duration: 1.2, delay: i * 0.22, repeat: Infinity }}
                  />
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* ── COUNTDOWN ──────────────────────────────────────────────────── */}
          {phase === "countdown" && (
            <motion.div
              key="countdown"
              className="relative z-10 flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-white/30 uppercase tracking-[0.3em] text-xs mb-10">Get ready</p>
              <AnimatePresence mode="wait">
                <motion.div
                  key={countdown}
                  className="text-[9rem] md:text-[11rem] font-display font-black leading-none select-none"
                  style={{
                    background: "linear-gradient(135deg, #FF2D78 0%, #C026D3 50%, #7C3AED 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: "drop-shadow(0 0 50px #FF2D7870)",
                  }}
                  initial={{ opacity: 0, scale: 1.8, filter: "blur(24px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.35, filter: "blur(16px)" }}
                  transition={{ duration: 0.42, ease: ease.expo }}
                >
                  {countdown === 0 ? "GO!" : countdown}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── SPINNING + LANDING ─────────────────────────────────────────── */}
          {(phase === "spinning" || phase === "landing") && (
            <motion.div
              key="wheel"
              className="relative z-10 flex flex-col items-center select-none"
              initial={{ opacity: 0, scale: 0.6, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={springs.bouncy}
            >
              {/* Pointer */}
              <div ref={pointerScope} className="relative z-20 mb-[-14px]">
                <svg width="30" height="38" viewBox="0 0 30 38" style={{ filter: "drop-shadow(0 0 12px #FF2D78)" }}>
                  <defs>
                    <linearGradient id="ptr-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF6B9D" />
                      <stop offset="100%" stopColor="#FF2D78" />
                    </linearGradient>
                  </defs>
                  <polygon points="15,38 1,0 29,0" fill="url(#ptr-grad)" />
                  <polygon points="15,30 7,6 23,6" fill="rgba(255,255,255,0.2)" />
                </svg>
              </div>

              {/* Wheel */}
              <div className="relative" style={{ width: 300, height: 300 }}>
                <SpinRing active={phase === "spinning"} />
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{ boxShadow: "0 0 0 3px #FF2D7850, 0 0 30px 5px #7C3AED30" }}
                />

                <motion.div style={{ width: 300, height: 300, rotate: rotation }}>
                  <svg viewBox="0 0 280 280" width="300" height="300">
                    <defs>
                      {WHEEL_SEGMENTS.map((seg, i) => (
                        <radialGradient key={i} id={`sg-${i}`} cx="65%" cy="50%">
                          <stop offset="0%" stopColor={seg.color} stopOpacity="1" />
                          <stop offset="100%" stopColor={seg.color} stopOpacity="0.72" />
                        </radialGradient>
                      ))}
                    </defs>
                    {WHEEL_SEGMENTS.map((seg, i) => {
                      const txt = getTextTransform(i);
                      return (
                        <g key={i}>
                          <path d={buildWheelPath(i)} fill={`url(#sg-${i})`} stroke="#0D0D0D" strokeWidth="2" />
                          <text
                            x={txt.x} y={txt.y}
                            textAnchor="middle" dominantBaseline="middle"
                            transform={`rotate(${txt.rotate}, ${txt.x}, ${txt.y})`}
                            fontSize="15" fill="rgba(255,255,255,0.9)"
                            style={{ pointerEvents: "none", userSelect: "none" }}
                          >
                            {seg.emoji}
                          </text>
                        </g>
                      );
                    })}
                    <circle cx="140" cy="140" r="30" fill="#0D0D0D" stroke="#FF2D78" strokeWidth="3" />
                    <circle cx="140" cy="140" r="20" fill="#141414" />
                    <circle cx="140" cy="140" r="9" fill="#FF2D78" />
                  </svg>
                </motion.div>
              </div>

              <motion.p
                className="mt-8 text-white/35 text-xs tracking-[0.25em] uppercase"
                animate={{ opacity: [0.35, 0.7, 0.35] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              >
                {phase === "spinning" ? "Spinning..." : "Almost there..."}
              </motion.p>
            </motion.div>
          )}

          {/* ── REVEAL ─────────────────────────────────────────────────────── */}
          {(phase === "reveal" || phase === "done") && reward && (
            <motion.div
              key="reveal"
              className="relative z-10 flex flex-col items-center text-center px-6 max-w-xs w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Card */}
              <motion.div
                className="relative w-full rounded-3xl overflow-hidden mb-8"
                initial={{ opacity: 0, scale: 0.45, y: 80, rotateX: 25 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                transition={{ ...springs.bouncy, delay: 0.08 }}
                style={{
                  background: isWin
                    ? "linear-gradient(145deg, #1e0535 0%, #0d1230 100%)"
                    : "linear-gradient(145deg, #1a1a1a 0%, #111 100%)",
                  border: `1px solid ${isWin ? "#FF2D7840" : "#2a2a2a"}`,
                  boxShadow: isWin ? "0 0 100px 12px #FF2D7835, 0 0 200px 30px #7C3AED18" : "none",
                }}
              >
                {/* Shimmer */}
                {isWin && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "linear-gradient(105deg, transparent 25%, rgba(255,255,255,0.07) 50%, transparent 75%)" }}
                    animate={{ x: ["-120%", "220%"] }}
                    transition={{ duration: 1.6, delay: 0.9, repeat: 3 }}
                  />
                )}
                <div className="p-8">
                  <motion.div
                    className="text-6xl mb-4"
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ ...springs.bouncy, delay: 0.32 }}
                  >
                    {WHEEL_SEGMENTS.find((s) => s.type === reward.type)?.emoji ?? "🎁"}
                  </motion.div>
                  <motion.p
                    className="text-xs uppercase tracking-[0.3em] mb-2 font-medium"
                    style={{ color: isWin ? "#FF2D78" : "#555" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.48 }}
                  >
                    {isWin ? "You unlocked" : "Better luck next time"}
                  </motion.p>
                  <motion.h3
                    className="text-2xl font-display font-bold text-white mb-2"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.54, duration: 0.55, ease: ease.expo }}
                  >
                    {reward.label}
                  </motion.h3>
                  {reward.value && (
                    <motion.p className="text-white/45 text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.68 }}>
                      {typeof reward.value === "number" ? `${reward.value}% off your order` : String(reward.value)}
                    </motion.p>
                  )}
                  {isWin && (
                    <motion.div className="mt-4" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.88, ...springs.snappy }}>
                      <span className="text-xs bg-white/8 text-white/60 px-3 py-1.5 rounded-full border border-white/10">
                        ✓ Applied at checkout automatically
                      </span>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              <motion.div className="flex flex-col w-full gap-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.95 }}>
                <button className="btn-dopamine w-full py-3.5 rounded-2xl text-sm font-semibold" onClick={handleDone}>
                  {isWin ? "Claim Reward & Review Box ✨" : "Continue to review →"}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
