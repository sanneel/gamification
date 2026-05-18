"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import clsx from "clsx";

import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/primitives/Reveal";
import { SplitHeading } from "@/components/primitives/SplitHeading";
import LuckySpinWheel from "@/components/LuckySpinWheel";
import {
  type Product,
  type ProductCategory,
  type SpinReward,
  BOX_SLOTS,
  formatGELSimple,
} from "@/lib/types";

const ease = [0.16, 1, 0.3, 1] as const;

// ── Demo content (used only when backend is offline) ─────────────────────────

const DEMO: Record<ProductCategory, Product[]> = {
  main_surprise: [
    { id: "p1", title: "Preserved Rose Box",    description: "Velvet-toned roses for a breathtaking reveal.",   normalPrice: 4900, boxPrice: 3900, images: ["https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=85"], stock: 12, active: true, category: "main_surprise", audience: "for_her", vibes: ["romantic","luxury"],    tags: [] },
    { id: "p2", title: "Gold Initial Necklace", description: "A personal keepsake chosen just for them.",        normalPrice: 5900, boxPrice: 4800, images: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=85"], stock:  8, active: true, category: "main_surprise", audience: "for_her", vibes: ["luxury","aesthetic"], tags: [] },
    { id: "p3", title: "Crystal Perfume",       description: "A luxury fragrance in a hand-crafted bottle.",     normalPrice: 6500, boxPrice: 5200, images: ["https://images.unsplash.com/photo-1541643600914-78b084683702?auto=format&fit=crop&w=1200&q=85"], stock:  6, active: true, category: "main_surprise", audience: "for_her", vibes: ["luxury"],           tags: [] },
  ],
  sweet_pick: [
    { id: "p4", title: "Signature Soy Candle",  description: "Warm amber — an evening-in feeling.",              normalPrice: 2800, boxPrice: 2200, images: ["https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1200&q=85"], stock: 25, active: true, category: "sweet_pick", audience: "neutral", vibes: ["cozy","romantic"], tags: [] },
    { id: "p5", title: "Rose Quartz Roller",    description: "Cooling, soothing and visually stunning.",          normalPrice: 3100, boxPrice: 2500, images: ["https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=1200&q=85"], stock: 18, active: true, category: "sweet_pick", audience: "for_her", vibes: ["cozy","soft"],   tags: [] },
    { id: "p6", title: "Cashmere Eye Mask",     description: "The luxury sleep essential they always wanted.",    normalPrice: 2600, boxPrice: 2100, images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1200&q=85"], stock: 14, active: true, category: "sweet_pick", audience: "for_her", vibes: ["cozy","luxury"], tags: [] },
  ],
  tiny_extra: [
    { id: "p7",  title: "Artisan Chocolate Box", description: "Hand-crafted truffles inside tissue paper.",       normalPrice: 1800, boxPrice: 1400, images: ["https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=1200&q=85"], stock: 30, active: true, category: "tiny_extra", audience: "neutral", vibes: ["cute","cozy"], tags: [] },
    { id: "p8",  title: "Plush Teddy Bear",      description: "Soft, huggable and impossibly cute.",              normalPrice: 2200, boxPrice: 1800, images: ["https://images.unsplash.com/photo-1563901935883-cb61f5d49be4?auto=format&fit=crop&w=1200&q=85"], stock: 20, active: true, category: "tiny_extra", audience: "for_her", vibes: ["cute","soft"], tags: [] },
    { id: "p11", title: "Gold Foil Card",        description: "A luxurious finishing touch.",                     normalPrice:  600, boxPrice:  400, images: ["https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=1200&q=85"], stock: 50, active: true, category: "tiny_extra", audience: "neutral", vibes: ["romantic"],   tags: [] },
  ],
  lucky_bonus: [],
};

type Step = "main_surprise" | "spin" | "sweet_pick" | "tiny_extra" | "message" | "review";
const STEPS: Step[] = ["main_surprise", "spin", "sweet_pick", "tiny_extra", "message", "review"];

const STEP_COPY: Record<Step, { roman: string; act: string; title: string; sub: string }> = {
  main_surprise: { roman: "I",   act: "Act one",   title: "The centrepiece.",     sub: "Choose the hero piece — the one their eye lands on first." },
  spin:          { roman: "II",  act: "Interval",  title: "Spin for a reward.",   sub: "Every box receives a reward: a free piece, a discount, a small surprise." },
  sweet_pick:    { roman: "III", act: "Act two",   title: "The softer note.",     sub: "Add a piece that softens the moment. A counterpoint to the hero." },
  tiny_extra:    { roman: "IV",  act: "Act three", title: "The closing whisper.", sub: "A small bonus tucked into the corner of the box. The smallest, kindest detail." },
  message:       { roman: "V",   act: "Coda",      title: "Write the letter.",    sub: "Printed on archival paper, sealed inside the box. They find it first." },
  review:        { roman: "VI",  act: "Curtain",   title: "Final composition.",   sub: "Review the box, then we wrap and dispatch within 48 hours." },
};

// ─── Editorial picker card ────────────────────────────────────────────────────

function PickerCard({ product, selected, onSelect, index }: { product: Product; selected: boolean; onSelect: () => void; index: number }) {
  return (
    <motion.button
      onClick={onSelect}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease, delay: Math.min(index, 6) * 0.06 }}
      className={clsx(
        "group relative block w-full overflow-clip text-left transition-transform",
        selected && "outline outline-1 outline-[var(--ink)]",
      )}
      data-cursor="hover"
    >
      <div className="relative aspect-portrait overflow-clip surface-bone-2">
        <Image
          src={product.images[0]}
          alt={product.title}
          fill
          sizes="(min-width:1024px) 30vw, 50vw"
          className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"
        />
        <div className="absolute left-4 top-4">
          <span className="eyebrow text-[var(--bone)]">№{String(index+1).padStart(2,"0")}</span>
        </div>
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex items-center justify-center bg-[var(--ink)]/55"
            >
              <motion.span
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease }}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--bone)] text-[var(--ink)]"
              >
                <Check className="h-5 w-5" />
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-5 flex items-baseline justify-between border-b border-[var(--hair-warm)] pb-3">
        <h3 className="font-display text-xl text-[var(--ink)]">{product.title}</h3>
        <span className="tabular text-sm text-[var(--ink)]">{formatGELSimple(product.boxPrice)}</span>
      </div>
      <p className="mt-3 text-body-sm text-[var(--storm-55)]">{product.description}</p>
      {selected && <p className="eyebrow mt-3 text-[var(--accent)]">Chosen</p>}
    </motion.button>
  );
}

// ─── Sidebar composition summary ─────────────────────────────────────────────

function BoxSummary({ selections, spinReward, subtotal, currentStep }: {
  selections: Partial<Record<ProductCategory, Product>>;
  spinReward: SpinReward | null;
  subtotal: number;
  currentStep: Step;
}) {
  const slots: { key: ProductCategory; label: string; roman: string }[] = [
    { key: "main_surprise", label: "Centrepiece",       roman: "I"   },
    { key: "sweet_pick",    label: "Softer note",       roman: "III" },
    { key: "tiny_extra",    label: "Closing whisper",   roman: "IV"  },
  ];

  return (
    <aside className="surface-paper border border-[var(--hair-warm)] p-8">
      <div className="flex items-baseline justify-between">
        <p className="eyebrow text-[var(--storm-55)]">The composition</p>
        <p className="eyebrow text-[var(--storm-55)] tabular">№{new Date().getFullYear()}</p>
      </div>

      <div className="mt-8 space-y-5">
        {slots.map((slot) => {
          const product = selections[slot.key];
          const active = currentStep === slot.key;
          return (
            <div key={slot.key} className="flex items-center gap-4 border-b border-[var(--hair-warm)] pb-4">
              {product ? (
                <>
                  <div className="relative h-16 w-14 shrink-0 overflow-clip surface-bone-2">
                    <Image src={product.images[0]} alt={product.title} fill className="object-cover" sizes="56px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="eyebrow text-[var(--storm-55)]">Act {slot.roman}</p>
                    <p className="font-display text-base text-[var(--ink)] truncate">{product.title}</p>
                  </div>
                  <p className="tabular text-sm text-[var(--ink)]">{formatGELSimple(product.boxPrice)}</p>
                </>
              ) : (
                <>
                  <div className={clsx(
                    "flex h-16 w-14 shrink-0 items-center justify-center border",
                    active ? "border-[var(--ink)]" : "border-dashed border-[var(--hair-warm)]",
                  )}>
                    <span className="font-display text-sm text-[var(--storm-55)]">{slot.roman}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="eyebrow text-[var(--storm-55)]">Act {slot.roman}</p>
                    <p className={clsx("font-display text-base", active ? "text-[var(--ink)]" : "text-[var(--storm-35)]")}>
                      {active ? "Choosing now" : slot.label}
                    </p>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {spinReward && (
        <div className="mt-5 border border-[var(--accent)] p-4">
          <p className="eyebrow text-[var(--accent)]">Lucky reward</p>
          <p className="font-display text-base text-[var(--ink)] mt-1">{spinReward.label}</p>
        </div>
      )}

      <div className="mt-8 flex items-baseline justify-between">
        <p className="eyebrow text-[var(--storm-55)]">Subtotal</p>
        <p className="font-display text-3xl tabular text-[var(--ink)]">{formatGELSimple(subtotal)}</p>
      </div>
    </aside>
  );
}

// ─── Message step ────────────────────────────────────────────────────────────

function MessageStep({
  message, setMessage, recipientName, setRecipientName,
}: {
  message: string; setMessage: (v: string) => void;
  recipientName: string; setRecipientName: (v: string) => void;
}) {
  const PROMPTS = [
    "You make the ordinary feel cinematic.",
    "Just because — and because I wanted to.",
    "A small ceremony to mark the day.",
    "For you, in your favourite light.",
  ];

  return (
    <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
      <div className="space-y-10">
        <div>
          <label className="eyebrow mb-3 block text-[var(--storm-55)]">For (optional)</label>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="Their name"
            maxLength={40}
            className="canvas-input w-full text-lg"
          />
        </div>
        <div>
          <label className="eyebrow mb-3 block text-[var(--storm-55)]">Your letter</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write something they will keep…"
            maxLength={240}
            rows={6}
            className="canvas-input w-full resize-none text-lg"
          />
          <p className="eyebrow mt-2 tabular text-[var(--storm-55)]">{message.length}/240</p>
        </div>
        <div>
          <p className="eyebrow mb-4 text-[var(--storm-55)]">Suggestions from the atelier</p>
          <div className="space-y-3">
            {PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => setMessage(p)}
                className="block w-full border-b border-[var(--hair-warm)] py-3 text-left font-display text-lg text-[var(--storm-55)] transition-colors hover:text-[var(--ink)]"
              >
                &ldquo;{p}&rdquo;
              </button>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        layout
        className="surface-paper border border-[var(--hair-warm)] p-10"
      >
        <p className="eyebrow text-[var(--storm-55)]">As it will appear inside the box</p>
        <div className="mt-8 aspect-card overflow-clip border border-[var(--hair-warm)] bg-[var(--bone)] p-10">
          {recipientName && <p className="eyebrow text-[var(--storm-55)] mb-4">To {recipientName},</p>}
          <p className="font-display text-quote leading-[1.1] text-[var(--ink)]">
            <em className="italic-serif text-[var(--accent)]">&ldquo;</em>{message || "…your letter will print here, in our archival serif."}<em className="italic-serif text-[var(--accent)]">&rdquo;</em>
          </p>
          <div className="mt-10 flex items-center gap-4 text-[var(--storm-55)]">
            <span className="block h-px w-12 bg-[var(--ink)]" />
            <p className="eyebrow">gamif · printed in tbilisi</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Review panel ────────────────────────────────────────────────────────────

function ReviewPanel({
  selections, spinReward, subtotal, sessionToken, giftMessage, recipientName,
}: {
  selections: Partial<Record<ProductCategory, Product>>;
  spinReward: SpinReward | null;
  subtotal: number;
  sessionToken: string;
  giftMessage: string;
  recipientName: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const shipping     = spinReward?.type === "free_shipping" ? 0 : 500;
  const discountRate = spinReward?.type === "discount_code" && spinReward.value ? parseFloat(String(spinReward.value)) / 100 : 0;
  const discount     = spinReward?.type === "free_tiny_gift" ? (selections.tiny_extra?.boxPrice ?? 0) : Math.round(subtotal * discountRate);
  const total        = subtotal - discount + shipping;

  async function checkout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken, giftMessage, recipientName }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError(data.error ?? "Checkout unavailable.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-16 md:grid-cols-12">
      <div className="md:col-span-7 space-y-2">
        {BOX_SLOTS.map((slot, i) => {
          const product = selections[slot.category as ProductCategory];
          return (
            <Reveal key={slot.id} delay={i * 0.05}>
              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-6 border-b border-[var(--hair-warm)] py-5">
                {product ? (
                  <>
                    <div className="relative h-24 w-20 overflow-clip surface-bone-2">
                      <Image src={product.images[0]} alt={product.title} fill className="object-cover" sizes="80px" />
                    </div>
                    <div>
                      <p className="eyebrow text-[var(--storm-55)]">{slot.label}</p>
                      <p className="font-display text-2xl text-[var(--ink)] mt-1">{product.title}</p>
                    </div>
                    <p className="font-display text-lg tabular text-[var(--ink)]">{formatGELSimple(product.boxPrice)}</p>
                  </>
                ) : (
                  <>
                    <div className="h-24 w-20 border border-dashed border-[var(--hair-warm)]" />
                    <div>
                      <p className="eyebrow text-[var(--storm-55)]">{slot.label}</p>
                      <p className="font-display text-2xl text-[var(--storm-35)] mt-1">Empty</p>
                    </div>
                    <p />
                  </>
                )}
              </div>
            </Reveal>
          );
        })}

        {spinReward && (
          <Reveal>
            <div className="mt-6 flex items-center justify-between border border-[var(--accent)] p-5">
              <div>
                <p className="eyebrow text-[var(--accent)]">Lucky reward</p>
                <p className="font-display text-xl text-[var(--ink)] mt-1">{spinReward.label}</p>
              </div>
              <p className="eyebrow tabular text-[var(--storm-55)]">Applied at checkout</p>
            </div>
          </Reveal>
        )}

        {(giftMessage || recipientName) && (
          <Reveal>
            <div className="mt-6 surface-paper border border-[var(--hair-warm)] p-8">
              <p className="eyebrow text-[var(--storm-55)]">The letter</p>
              {recipientName && <p className="eyebrow text-[var(--storm-55)] mt-3">To {recipientName},</p>}
              {giftMessage && (
                <p className="mt-4 font-display text-quote text-[var(--ink)]">
                  <em className="italic-serif text-[var(--accent)]">&ldquo;</em>{giftMessage}<em className="italic-serif text-[var(--accent)]">&rdquo;</em>
                </p>
              )}
            </div>
          </Reveal>
        )}
      </div>

      <div className="md:col-span-5">
        <div className="sticky top-32 space-y-6">
          <div className="border border-[var(--hair-warm)] p-8 space-y-4">
            <p className="eyebrow text-[var(--storm-55)]">Total</p>
            <div className="flex justify-between text-sm text-[var(--storm-55)]">
              <span>Subtotal</span>
              <span className="tabular">{formatGELSimple(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-[var(--accent)]">
                <span>Reward applied</span>
                <span className="tabular">−{formatGELSimple(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-[var(--storm-55)]">
              <span>Delivery</span>
              <span className="tabular">{spinReward?.type === "free_shipping" ? "Free" : formatGELSimple(shipping)}</span>
            </div>
            <div className="flex items-baseline justify-between border-t border-[var(--hair-warm)] pt-4">
              <span className="eyebrow text-[var(--ink)]">Total · GEL</span>
              <span className="font-display text-display-sm tabular text-[var(--ink)]">{formatGELSimple(total)}</span>
            </div>
          </div>

          {error && <p className="text-sm text-[var(--accent)]">{error}</p>}

          <button
            onClick={checkout}
            disabled={loading}
            className="btn-cinematic btn-cinematic--primary w-full justify-center"
          >
            <span className="btn-cinematic__label flex items-center gap-3">
              {loading ? "Wrapping the box…" : (
                <>
                  Send to checkout
                  <ArrowRight className="h-3 w-3" />
                </>
              )}
            </span>
          </button>

          <p className="eyebrow text-center text-[var(--storm-55)]">
            Secure · Stripe · GEL · Delivered worldwide
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function BuildABoxPage() {
  const [stepIndex, setStepIndex]         = useState(0);
  const [selections, setSelections]       = useState<Partial<Record<ProductCategory, Product>>>({});
  const [products, setProducts]           = useState<Record<ProductCategory, Product[]>>(DEMO);
  const [loading, setLoading]             = useState(true);
  const [sessionToken, setSessionToken]   = useState("");
  const [spinReward, setSpinReward]       = useState<SpinReward | null>(null);
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [giftMessage, setGiftMessage]     = useState("");
  const [recipientName, setRecipientName] = useState("");
  const prevStepRef = useRef(stepIndex);

  const currentStep = STEPS[stepIndex];
  const direction   = stepIndex > prevStepRef.current ? 1 : -1;

  useEffect(() => {
    prevStepRef.current = stepIndex;
  }, [stepIndex]);

  useEffect(() => {
    const saved = localStorage.getItem("box_session_token");
    if (saved) setSessionToken(saved);
    fetch("/api/products")
      .then((r) => (r.ok ? r.json() : { products: [] }))
      .then((data: { products?: Product[] }) => {
        if (data.products?.length) {
          const g: Record<ProductCategory, Product[]> = { main_surprise: [], sweet_pick: [], tiny_extra: [], lucky_bonus: [] };
          for (const p of data.products) g[p.category as ProductCategory]?.push(p);
          setProducts(g);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const ensureSession = useCallback(async () => {
    if (sessionToken) return sessionToken;
    try {
      const res = await fetch("/api/boxes", { method: "POST" });
      const d   = await res.json();
      const tok = d.sessionToken ?? `local-${Date.now()}`;
      localStorage.setItem("box_session_token", tok);
      setSessionToken(tok);
      return tok;
    } catch {
      const tok = `local-${Date.now()}`;
      localStorage.setItem("box_session_token", tok);
      setSessionToken(tok);
      return tok;
    }
  }, [sessionToken]);

  const selectProduct = useCallback(async (product: Product) => {
    const token  = await ensureSession();
    const keyMap: Record<string, string> = { main_surprise: "mainSurpriseId", sweet_pick: "sweetPickId", tiny_extra: "tinyExtraId" };
    try {
      await fetch(`/api/boxes/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [keyMap[product.category]]: product.id }),
      });
    } catch { /* ignore – local fallback */ }
    setSelections((prev) => ({ ...prev, [product.category]: product }));
  }, [ensureSession]);

  function canAdvance(): boolean {
    if (currentStep === "main_surprise") return !!selections.main_surprise;
    if (currentStep === "spin")          return !!spinReward;
    if (currentStep === "sweet_pick")    return !!selections.sweet_pick;
    if (currentStep === "tiny_extra")    return !!selections.tiny_extra;
    return true;
  }

  function advance() {
    if (currentStep === "spin" && !spinReward) {
      setShowSpinWheel(true);
      return;
    }
    if (stepIndex < STEPS.length - 1) setStepIndex((i) => i + 1);
  }

  function handleRewardReceived(reward: SpinReward) {
    setSpinReward(reward);
    setShowSpinWheel(false);
    const spinIdx = STEPS.indexOf("spin");
    setStepIndex(spinIdx + 1);
  }

  function handleSpinClose() {
    setShowSpinWheel(false);
  }

  const subtotal    = useMemo(() => Object.values(selections).reduce((s, p) => s + (p?.boxPrice ?? 0), 0), [selections]);
  const filledCount = Object.values(selections).filter(Boolean).length;

  const productSteps  = ["main_surprise", "sweet_pick", "tiny_extra"] as const;
  const isProductStep = productSteps.includes(currentStep as typeof productSteps[number]);

  const stepCopy = STEP_COPY[currentStep];

  return (
    <main className="surface-bone min-h-dvh">
      <Navbar />

      {/* Progress rail */}
      <section className="border-y border-[var(--hair-warm)] pt-32">
        <div className="container-edge container-wide flex items-center gap-6 overflow-x-auto no-scrollbar py-4">
          <Link href="/shop" className="eyebrow flex shrink-0 items-center gap-2 text-[var(--storm-55)]">
            <ArrowLeft className="h-3 w-3" /> Back to shop
          </Link>
          <span className="block h-3 w-px bg-[var(--hair-warm)]" />
          {STEPS.filter((s) => s !== "spin").map((s) => {
            const done = stepIndex > STEPS.indexOf(s);
            const active = currentStep === s;
            return (
              <div key={s} className="flex shrink-0 items-center gap-2">
                <span className={clsx(
                  "h-1.5 w-1.5 rounded-full transition-all",
                  done || active ? "bg-[var(--ink)]" : "bg-[var(--storm-18)]",
                )} />
                <span className={clsx(
                  "eyebrow transition-colors",
                  active ? "text-[var(--ink)]" : done ? "text-[var(--storm-55)]" : "text-[var(--storm-18)]",
                )}>
                  {s.replace("_", " ")}
                </span>
              </div>
            );
          })}
          {spinReward && (
            <span className="eyebrow ml-auto shrink-0 text-[var(--accent)]">{spinReward.label}</span>
          )}
        </div>
      </section>

      {/* Header */}
      <section className="container-edge container-wide pt-16 pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep + "-hdr"}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.7, ease }}
            className="grid grid-cols-1 gap-12 md:grid-cols-12 md:items-end"
          >
            <div className="md:col-span-8">
              <p className="eyebrow text-[var(--storm-55)]">{stepCopy.act} · {stepCopy.roman}</p>
              <SplitHeading
                as="h1"
                className="font-display mt-6 text-display-lg leading-[0.92] text-[var(--ink)]"
              >
                {stepCopy.title}
              </SplitHeading>
            </div>
            <p className="md:col-span-4 max-w-sm text-body-lg text-[var(--storm-55)]">{stepCopy.sub}</p>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Workspace */}
      <section className="container-edge container-wide pb-44">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-12">
          <div className="md:col-span-8">
            <AnimatePresence mode="wait" custom={direction}>
              {isProductStep && (
                <motion.div
                  key={currentStep}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 40, filter: "blur(8px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -direction * 40, filter: "blur(8px)" }}
                  transition={{ duration: 0.65, ease }}
                >
                  {loading ? (
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                      {[1,2,3].map((i) => (
                        <div key={i} className="shimmer aspect-portrait" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                      {(products[currentStep as ProductCategory] ?? []).map((product, i) => (
                        <PickerCard
                          key={product.id}
                          product={product}
                          index={i}
                          selected={selections[currentStep as ProductCategory]?.id === product.id}
                          onSelect={() => selectProduct(product)}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {currentStep === "spin" && (
                <motion.div
                  key="spin"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.55, ease }}
                  className="surface-paper border border-[var(--hair-warm)] p-10"
                >
                  {spinReward ? (
                    <>
                      <p className="eyebrow text-[var(--accent)]">Reward sealed in the envelope</p>
                      <p className="font-display text-display-md mt-6 text-[var(--ink)]">{spinReward.label}</p>
                      <p className="mt-4 max-w-sm text-body text-[var(--storm-55)]">
                        Applied automatically at checkout. Continue composing the box.
                      </p>
                      <button
                        onClick={() => setStepIndex(STEPS.indexOf("sweet_pick"))}
                        className="btn-cinematic btn-cinematic--primary mt-10"
                      >
                        <span className="btn-cinematic__label flex items-center gap-3">
                          Continue <ArrowRight className="h-3 w-3" />
                        </span>
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="eyebrow text-[var(--storm-55)]">An interval</p>
                      <p className="font-display text-display-md mt-6 text-[var(--ink)]">
                        Spin the<br /><em>fortune wheel.</em>
                      </p>
                      <p className="mt-4 max-w-md text-body text-[var(--storm-55)]">
                        Every Gamif box earns one reward, drawn by our server. A free piece. A discount. A small surprise tucked behind the wax seal.
                      </p>
                      <button
                        onClick={() => setShowSpinWheel(true)}
                        className="btn-cinematic btn-cinematic--primary mt-10"
                      >
                        <span className="btn-cinematic__label">Spin the wheel</span>
                      </button>
                    </>
                  )}
                </motion.div>
              )}

              {currentStep === "message" && (
                <motion.div
                  key="message"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.55, ease }}
                >
                  <MessageStep
                    message={giftMessage}
                    setMessage={setGiftMessage}
                    recipientName={recipientName}
                    setRecipientName={setRecipientName}
                  />
                </motion.div>
              )}

              {currentStep === "review" && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.55, ease }}
                >
                  <ReviewPanel
                    selections={selections}
                    spinReward={spinReward}
                    subtotal={subtotal}
                    sessionToken={sessionToken}
                    giftMessage={giftMessage}
                    recipientName={recipientName}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="md:col-span-4">
            <div className="sticky top-32">
              <BoxSummary
                selections={selections}
                spinReward={spinReward}
                subtotal={subtotal}
                currentStep={currentStep}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Bottom action bar */}
      {currentStep !== "review" && (
        <div className="fixed bottom-0 left-0 right-0 z-[80] safe-bottom border-t border-[var(--hair-warm)] bg-[var(--bone)]/95 backdrop-blur-md">
          <div className="container-edge container-wide flex h-20 items-center justify-between">
            <div>
              <p className="eyebrow text-[var(--storm-55)]">
                {filledCount}/3 pieces selected
              </p>
              <p className="eyebrow text-[var(--storm-35)] mt-1">
                {currentStep === "spin" && !spinReward ? "Spin the wheel to continue" :
                 currentStep === "message" ? "The letter is optional" :
                 !canAdvance() ? "Choose a piece to continue" :
                 "Ready for the next act"}
              </p>
            </div>
            <button
              onClick={advance}
              disabled={!canAdvance() && !(currentStep === "spin" && !spinReward)}
              className={clsx(
                "btn-cinematic",
                canAdvance() || (currentStep === "spin" && !spinReward)
                  ? "btn-cinematic--primary"
                  : "border border-[var(--hair-warm)] text-[var(--storm-35)] cursor-not-allowed",
              )}
            >
              <span className="btn-cinematic__label flex items-center gap-3">
                {currentStep === "spin" && !spinReward ? "Spin to continue" : "Next act"}
                <ArrowRight className="h-3 w-3" />
              </span>
            </button>
          </div>
        </div>
      )}

      {showSpinWheel && (
        <LuckySpinWheel
          sessionToken={sessionToken || `local-${Date.now()}`}
          onRewardReceived={handleRewardReceived}
          onClose={handleSpinClose}
        />
      )}

      {currentStep === "review" && <Footer />}
    </main>
  );
}
