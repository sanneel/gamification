"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Share2 } from "lucide-react";

import ConfettiParticles from "@/components/ConfettiParticles";
import { SplitHeading } from "@/components/primitives/SplitHeading";
import { type Product, type SpinReward, formatGELSimple } from "@/lib/types";

const ease = [0.16, 1, 0.3, 1] as const;

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

const DEMO_BOX: BoxData = {
  sessionToken: "demo",
  giftMessage: "Whatever happens this week, this is mine to you.",
  recipientName: "Nino",
  spinReward: { id: "s1", type: "free_shipping", label: "Free delivery", value: null, createdAt: new Date().toISOString() },
  mainSurprise: {
    id: "p1", title: "Preserved Rose Box", description: "Velvet-toned preserved roses",
    normalPrice: 4900, boxPrice: 3900,
    images: ["https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=85"],
    stock: 12, active: true, category: "main_surprise", audience: "for_her", vibes: ["romantic"], tags: [],
  },
  sweetPick: {
    id: "p4", title: "Signature Soy Candle", description: "Warm amber",
    normalPrice: 2800, boxPrice: 2200,
    images: ["https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1200&q=85"],
    stock: 25, active: true, category: "sweet_pick", audience: "neutral", vibes: ["cozy"], tags: [],
  },
  tinyExtra: {
    id: "p7", title: "Artisan Chocolate Box", description: "Hand-crafted truffles",
    normalPrice: 1800, boxPrice: 1400,
    images: ["https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=1200&q=85"],
    stock: 30, active: true, category: "tiny_extra", audience: "neutral", vibes: ["cute"], tags: [],
  },
  total: 7500,
};

type Phase = "loading" | "envelope" | "opening" | "reveal";

export default function RevealPage({ params }: { params: { token: string } }) {
  const [phase, setPhase]     = useState<Phase>("loading");
  const [boxData, setBoxData] = useState<BoxData | null>(null);
  const [confetti, setConfetti] = useState(false);
  const [shared, setShared]   = useState(false);

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

  function open() {
    setPhase("opening");
    setTimeout(() => {
      setPhase("reveal");
      setTimeout(() => setConfetti(true), 700);
    }, 1100);
  }

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title: "Someone sent you a Gamif box", text: "An archived ceremony, hand-wrapped.", url });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2400);
    }
  }

  const pieces = boxData ? [
    boxData.mainSurprise && { product: boxData.mainSurprise, label: "Centrepiece",     roman: "I"  },
    boxData.sweetPick    && { product: boxData.sweetPick,    label: "Softer note",     roman: "II" },
    boxData.tinyExtra    && { product: boxData.tinyExtra,    label: "Closing whisper", roman: "III"},
  ].filter(Boolean) as { product: Product; label: string; roman: string }[] : [];

  return (
    <main className="surface-ink relative min-h-dvh overflow-clip text-[var(--bone)]">
      <div aria-hidden className="grain-overlay pointer-events-none absolute inset-0 opacity-30" />
      <ConfettiParticles trigger={confetti} count={140} spread={360} />

      <AnimatePresence mode="wait">
        {phase === "loading" && (
          <motion.div
            key="loading"
            exit={{ opacity: 0 }}
            className="flex min-h-dvh flex-col items-center justify-center"
          >
            <span className="eyebrow text-[var(--bone)]/55 animate-blink-soft">Opening the envelope…</span>
          </motion.div>
        )}

        {phase === "envelope" && (
          <motion.section
            key="envelope"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9, filter: "blur(12px)" }}
            transition={{ duration: 0.85, ease }}
            className="relative flex min-h-dvh flex-col items-center justify-center container-edge"
          >
            <p className="eyebrow opacity-60">Atelier №{params.token.slice(0, 6).toUpperCase()}</p>
            <SplitHeading
              as="h1"
              className="font-display mt-6 text-display-xl leading-[0.88] text-[var(--bone)] text-center max-w-3xl"
            >
              Someone has<br /><em className="italic-serif text-[var(--accent-2)]">sent you a box.</em>
            </SplitHeading>

            <motion.button
              onClick={open}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.95, ease }}
              className="btn-cinematic btn-cinematic--outline border-[var(--bone)]/60 text-[var(--bone)] mt-16"
            >
              <span className="btn-cinematic__label">Open the envelope</span>
            </motion.button>

            <p className="eyebrow mt-8 opacity-40">Tap to lift the seal</p>
          </motion.section>
        )}

        {phase === "opening" && (
          <motion.section
            key="opening"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-dvh items-center justify-center"
          >
            <motion.div
              initial={{ scaleY: 1 }}
              animate={{ scaleY: 0 }}
              transition={{ duration: 1, ease }}
              style={{ transformOrigin: "top" }}
              className="absolute inset-0 bg-[var(--ink)]"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="eyebrow text-[var(--bone)] z-10 animate-blink-soft"
            >
              Lifting the seal…
            </motion.p>
          </motion.section>
        )}

        {phase === "reveal" && boxData && (
          <motion.section
            key="reveal"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease }}
            className="relative min-h-dvh container-edge container-wide pb-24 pt-32"
          >
            <div className="grid grid-cols-1 gap-16 md:grid-cols-12 md:items-start">
              <div className="md:col-span-7">
                <p className="eyebrow opacity-60">
                  {boxData.recipientName ? `For ${boxData.recipientName}` : "For you"}
                </p>
                <SplitHeading
                  as="h2"
                  className="font-display mt-6 text-display-xl leading-[0.88] text-[var(--bone)]"
                >
                  <em className="italic-serif text-[var(--accent-2)]">A small</em> ceremony, opened.
                </SplitHeading>

                {boxData.giftMessage && (
                  <motion.blockquote
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.95, ease }}
                    className="mt-16 max-w-xl border-l border-[var(--bone)]/40 pl-8 font-display text-quote text-[var(--bone)]/85"
                  >
                    <em className="italic-serif text-[var(--accent-2)]">&ldquo;</em>{boxData.giftMessage}<em className="italic-serif text-[var(--accent-2)]">&rdquo;</em>
                  </motion.blockquote>
                )}

                {boxData.spinReward && boxData.spinReward.type !== "no_reward" && (
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.95, ease }}
                    className="mt-12 inline-flex items-center gap-4 border border-[var(--accent)] px-5 py-3"
                  >
                    <p className="eyebrow text-[var(--accent-2)]">Lucky reward</p>
                    <span className="font-display text-lg text-[var(--bone)]">{boxData.spinReward.label}</span>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mt-16 flex flex-wrap items-center gap-6"
                >
                  <button onClick={share} className="btn-cinematic btn-cinematic--outline border-[var(--bone)]/60 text-[var(--bone)]">
                    <span className="btn-cinematic__label flex items-center gap-3">
                      <Share2 className="h-3 w-3" /> {shared ? "Link copied" : "Share this reveal"}
                    </span>
                  </button>
                  <Link
                    href="/"
                    className="link-reveal text-[12px] tracking-[0.32em] uppercase text-[var(--bone)]/80"
                  >
                    Compose your own box
                  </Link>
                </motion.div>
              </div>

              <div className="md:col-span-5 space-y-10">
                {pieces.map(({ product, label, roman }, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 40, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.18, duration: 1, ease }}
                    className="group"
                  >
                    <div className="relative aspect-portrait overflow-clip">
                      <Image src={product.images[0]} alt={product.title} fill className="object-cover" sizes="(min-width:768px) 30vw, 100vw" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/55 via-transparent to-transparent" />
                      <div className="absolute left-4 top-4 font-display text-3xl text-[var(--bone)]/80">{roman}</div>
                    </div>
                    <div className="mt-5 flex items-baseline justify-between border-b border-[var(--hair)] pb-3">
                      <p className="font-display text-xl text-[var(--bone)]">{product.title}</p>
                      <p className="eyebrow text-[var(--bone)]/55">{label}</p>
                    </div>
                  </motion.div>
                ))}

                {boxData.total && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                    className="flex items-baseline justify-between border-t border-[var(--hair)] pt-5"
                  >
                    <p className="eyebrow text-[var(--bone)]/55">Box composition · value</p>
                    <p className="font-display text-display-sm tabular text-[var(--bone)]">{formatGELSimple(boxData.total)}</p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
