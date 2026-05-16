"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Share2, Sparkles } from "lucide-react";
import ConfettiParticles from "@/components/ConfettiParticles";
import { type Product, type SpinReward, BOX_SLOTS, formatGELSimple } from "@/lib/types";
import { springs, ease } from "@/lib/motion";

interface BoxData {
  sessionToken: string;
  giftMessage?: string;
  recipientName?: string;
  spinReward?: SpinReward;
  mainSurprise?: Product;
  sweetPick?: Product;
  tinyExtra?: Product;
  total?: number;
}

// Fake demo reveal data (used when backend unavailable)
const DEMO_BOX: BoxData = {
  sessionToken: "demo",
  giftMessage: "You make every day brighter 💛",
  recipientName: "Nino",
  spinReward: { id: "s1", type: "free_shipping", label: "Free Shipping", value: null, createdAt: new Date().toISOString() },
  mainSurprise: {
    id: "p1", title: "Preserved Rose Box", description: "Velvet-toned preserved roses",
    normalPrice: 4900, boxPrice: 3900,
    images: ["https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=600&q=80"],
    stock: 12, active: true, category: "main_surprise", audience: "for_her", vibes: ["romantic"], tags: [],
  },
  sweetPick: {
    id: "p4", title: "Signature Soy Candle", description: "Warm amber",
    normalPrice: 2800, boxPrice: 2200,
    images: ["https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80"],
    stock: 25, active: true, category: "sweet_pick", audience: "neutral", vibes: ["cozy"], tags: [],
  },
  tinyExtra: {
    id: "p7", title: "Artisan Chocolate Box", description: "Hand-crafted truffles",
    normalPrice: 1800, boxPrice: 1400,
    images: ["https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80"],
    stock: 30, active: true, category: "tiny_extra", audience: "neutral", vibes: ["cute"], tags: [],
  },
  total: 7500,
};

type RevealPhase = "loading" | "envelope" | "opening" | "reveal" | "done";

function EnvelopeAnimation({ onOpen }: { onOpen: () => void }) {
  return (
    <motion.div
      className="flex flex-col items-center gap-8"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: ease.expo }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="w-80 h-80 rounded-full blur-[100px] opacity-30"
          style={{ background: "radial-gradient(circle, #FF2D78, #7C3AED)" }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </div>

      <motion.div
        className="relative text-8xl cursor-pointer select-none"
        animate={{ y: [0, -8, 0], rotate: [0, -2, 2, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={onOpen}
      >
        🎁
        {/* Sparkle particles around box */}
        {["✨", "⭐", "💫"].map((s, i) => (
          <motion.span
            key={i}
            className="absolute text-2xl pointer-events-none"
            style={{ top: `${-10 + i * 15}%`, left: `${90 + i * 10}%` }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5], y: [0, -12, 0] }}
            transition={{ duration: 2, delay: i * 0.6, repeat: Infinity }}
          >
            {s}
          </motion.span>
        ))}
      </motion.div>

      <div className="text-center z-10">
        <motion.p
          className="text-white/35 text-xs uppercase tracking-[0.3em] mb-3"
          animate={{ opacity: [0.35, 0.7, 0.35] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Someone sent you something
        </motion.p>
        <h1 className="font-display text-4xl font-bold text-white mb-4">
          You have a gift 💌
        </h1>
        <p className="text-white/45 text-base mb-8">Tap the box to reveal what&apos;s inside</p>

        <motion.button
          className="btn-dopamine px-10 py-4 rounded-2xl text-sm font-black inline-flex items-center gap-2"
          onClick={onOpen}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Gift className="w-4 h-4" /> Open Gift
        </motion.button>
      </div>
    </motion.div>
  );
}

function RevealCard({ product, label, emoji, delay = 0 }: { product: Product; label: string; emoji: string; delay?: number }) {
  return (
    <motion.div
      className="relative rounded-3xl overflow-hidden border border-white/10"
      initial={{ opacity: 0, scale: 0.7, y: 40, rotateY: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0, rotateY: 0 }}
      transition={{ ...springs.bouncy, delay }}
      style={{ background: "linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)" }}
    >
      <div className="relative aspect-square">
        <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      </div>
      <div className="p-4">
        <p className="text-white/30 text-[10px] uppercase tracking-wider font-black mb-1">
          {emoji} {label}
        </p>
        <p className="text-white font-bold text-sm leading-snug">{product.title}</p>
      </div>
    </motion.div>
  );
}

export default function RevealPage({ params }: { params: { token: string } }) {
  const [phase, setPhase] = useState<RevealPhase>("loading");
  const [boxData, setBoxData] = useState<BoxData | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
    fetch(`${API_URL}/boxes/${params.token}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setBoxData(data?.box ?? DEMO_BOX);
        setPhase("envelope");
      })
      .catch(() => {
        setBoxData(DEMO_BOX);
        setPhase("envelope");
      });
  }, [params.token]);

  function handleOpen() {
    setPhase("opening");
    setTimeout(() => {
      setPhase("reveal");
      setTimeout(() => {
        setShowConfetti(true);
        setPhase("done");
      }, 800);
    }, 600);
  }

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: "I got a Gamif gift! 🎁", text: "Someone made me a personalized mystery box ✨", url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    }
  }

  const products = boxData ? [
    boxData.mainSurprise && { product: boxData.mainSurprise, label: "Main Surprise", emoji: "🎁" },
    boxData.sweetPick && { product: boxData.sweetPick, label: "Sweet Pick", emoji: "🍬" },
    boxData.tinyExtra && { product: boxData.tinyExtra, label: "Tiny Extra", emoji: "✨" },
  ].filter(Boolean) as { product: Product; label: string; emoji: string }[] : [];

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center px-6 overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 30%, #1a0a2e 0%, #0D0D0D 65%)" }}
    >
      <ConfettiParticles trigger={showConfetti} count={200} spread={360} />

      {/* Stars background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 rounded-full bg-white"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ opacity: [0, 0.7, 0] }}
            transition={{ duration: 2.5 + Math.random() * 3, delay: Math.random() * 5, repeat: Infinity }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Loading */}
        {phase === "loading" && (
          <motion.div key="loading" exit={{ opacity: 0 }} className="flex flex-col items-center gap-6">
            <motion.div
              className="w-16 h-16 rounded-full border-2 border-transparent"
              style={{ borderTopColor: "#FF2D78", borderRightColor: "#7C3AED" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-white/30 text-sm">Opening your gift...</p>
          </motion.div>
        )}

        {/* Envelope */}
        {phase === "envelope" && (
          <motion.div key="envelope" className="relative z-10 w-full max-w-sm" exit={{ opacity: 0, scale: 0.8, filter: "blur(16px)" }} transition={{ duration: 0.4 }}>
            <EnvelopeAnimation onOpen={handleOpen} />
          </motion.div>
        )}

        {/* Opening animation */}
        {phase === "opening" && (
          <motion.div
            key="opening"
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-7xl"
              animate={{ scale: [1, 2.5, 0], rotate: [0, 15, -15, 0], opacity: [1, 1, 0] }}
              transition={{ duration: 0.55, ease: ease.expo }}
            >
              🎁
            </motion.div>
          </motion.div>
        )}

        {/* Reveal */}
        {(phase === "reveal" || phase === "done") && boxData && (
          <motion.div
            key="reveal"
            className="relative z-10 w-full max-w-sm space-y-6 py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Message card */}
            {(boxData.giftMessage || boxData.recipientName) && (
              <motion.div
                className="rounded-3xl p-5 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{ background: "linear-gradient(135deg, rgba(255,45,120,0.1), rgba(124,58,237,0.1))", border: "1px solid rgba(255,45,120,0.2)" }}
              >
                {boxData.recipientName && (
                  <p className="text-white/40 text-xs mb-2">For <span className="text-white font-bold">{boxData.recipientName}</span> 💌</p>
                )}
                {boxData.giftMessage && (
                  <p className="text-white/80 text-base italic leading-relaxed">&ldquo;{boxData.giftMessage}&rdquo;</p>
                )}
              </motion.div>
            )}

            {/* Product cards */}
            {products.length > 0 && (
              <div>
                <motion.p
                  className="text-white/30 text-xs font-black uppercase tracking-[0.2em] mb-4 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  What&apos;s inside ✨
                </motion.p>
                <div className="grid grid-cols-3 gap-3">
                  {products.map(({ product, label, emoji }, i) => (
                    <RevealCard key={product.id} product={product} label={label} emoji={emoji} delay={0.35 + i * 0.12} />
                  ))}
                </div>
              </div>
            )}

            {/* Spin reward */}
            {boxData.spinReward && boxData.spinReward.type !== "no_reward" && (
              <motion.div
                className="rounded-2xl p-4 flex items-center gap-3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, ...springs.bouncy }}
                style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.25)" }}
              >
                <span className="text-2xl">🎡</span>
                <div>
                  <p className="text-gold font-black text-sm">Bonus: {boxData.spinReward.label}</p>
                  <p className="text-white/35 text-xs">Applied to this order</p>
                </div>
              </motion.div>
            )}

            {/* Total */}
            {boxData.total && (
              <motion.div
                className="flex items-center justify-between px-5 py-4 rounded-2xl glass border border-white/8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.85 }}
              >
                <span className="text-white/45 text-sm">Box value</span>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span className="text-white font-black">{formatGELSimple(boxData.total)}</span>
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <motion.div
              className="space-y-3 pt-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <motion.button
                onClick={handleShare}
                className="w-full py-3.5 rounded-2xl border border-white/12 text-sm font-bold text-white/60 hover:text-white hover:border-white/25 transition-all flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <Share2 className="w-4 h-4" />
                {shared ? "Link copied! ✓" : "Share this reveal"}
              </motion.button>

              <Link
                href="/"
                className="block w-full py-3.5 rounded-2xl btn-dopamine text-sm font-black text-center"
              >
                Create Your Own Box →
              </Link>
            </motion.div>

            {/* Brand footer */}
            <motion.div
              className="text-center pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <Link href="/" className="font-display text-lg font-bold text-white/30 hover:text-white transition-colors">
                gamif<span className="text-accent">.</span>
              </Link>
              <p className="text-white/15 text-xs mt-1">Premium mystery gifting</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
