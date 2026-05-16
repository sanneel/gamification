"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, ShoppingCart } from "lucide-react";
import LuckySpinWheel from "@/components/LuckySpinWheel";
import { type Product, type ProductCategory, type SpinReward, BOX_SLOTS, formatGELSimple } from "@/lib/types";
import { springs, ease } from "@/lib/motion";
import { useCartStore } from "@/lib/stores/cart";
import { useUIStore } from "@/lib/stores/ui";

// ─── Demo products ────────────────────────────────────────────────────────────

const DEMO: Record<ProductCategory, Product[]> = {
  main_surprise: [
    { id: "p1",  title: "Preserved Rose Box",    description: "Velvet-toned roses for a breathtaking reveal.",      normalPrice: 4900, boxPrice: 3900, images: ["https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=900&q=85"], stock: 12, active: true, category: "main_surprise", audience: "for_her", vibes: ["romantic","luxury"],    tags: [] },
    { id: "p2",  title: "Gold Initial Necklace",  description: "A personal keepsake chosen just for them.",          normalPrice: 5900, boxPrice: 4800, images: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85"], stock:  8, active: true, category: "main_surprise", audience: "for_her", vibes: ["luxury","aesthetic"], tags: [] },
    { id: "p3",  title: "Crystal Perfume",        description: "A luxury fragrance in a hand-crafted bottle.",       normalPrice: 6500, boxPrice: 5200, images: ["https://images.unsplash.com/photo-1541643600914-78b084683702?auto=format&fit=crop&w=900&q=85"], stock:  6, active: true, category: "main_surprise", audience: "for_her", vibes: ["luxury"],           tags: [] },
  ],
  sweet_pick: [
    { id: "p4",  title: "Signature Soy Candle",   description: "Warm amber — an evening-in feeling.",               normalPrice: 2800, boxPrice: 2200, images: ["https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=85"], stock: 25, active: true, category: "sweet_pick",    audience: "neutral",  vibes: ["cozy","romantic"],  tags: [] },
    { id: "p5",  title: "Rose Quartz Roller",     description: "Cooling, soothing and visually stunning.",           normalPrice: 3100, boxPrice: 2500, images: ["https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=900&q=85"], stock: 18, active: true, category: "sweet_pick",    audience: "for_her",  vibes: ["cozy","soft"],      tags: [] },
    { id: "p6",  title: "Cashmere Eye Mask",      description: "The luxury sleep essential they always wanted.",     normalPrice: 2600, boxPrice: 2100, images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=85"], stock: 14, active: true, category: "sweet_pick",    audience: "for_her",  vibes: ["cozy","luxury"],    tags: [] },
  ],
  tiny_extra: [
    { id: "p7",  title: "Artisan Chocolate Box",  description: "Hand-crafted truffles inside tissue paper.",         normalPrice: 1800, boxPrice: 1400, images: ["https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=900&q=85"], stock: 30, active: true, category: "tiny_extra",    audience: "neutral",  vibes: ["cute","cozy"],      tags: [] },
    { id: "p8",  title: "Plush Teddy Bear",       description: "Soft, huggable and impossibly cute.",                normalPrice: 2200, boxPrice: 1800, images: ["https://images.unsplash.com/photo-1563901935883-cb61f5d49be4?auto=format&fit=crop&w=900&q=85"], stock: 20, active: true, category: "tiny_extra",    audience: "for_her",  vibes: ["cute","soft"],      tags: [] },
    { id: "p11", title: "Gold Foil Card",         description: "A luxurious finishing touch.",                       normalPrice:  600, boxPrice:  400, images: ["https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=900&q=85"], stock: 50, active: true, category: "tiny_extra",    audience: "neutral",  vibes: ["romantic"],         tags: [] },
  ],
  lucky_bonus: [],
};

// ── Steps: spin is NOW between main_surprise and sweet_pick ──────────────────

type Step = "main_surprise" | "spin" | "sweet_pick" | "tiny_extra" | "message" | "review";
const STEPS: Step[] = ["main_surprise", "spin", "sweet_pick", "tiny_extra", "message", "review"];

const STEP_LABEL: Record<Step, string> = {
  main_surprise: "The Centrepiece",
  spin:          "Your Reward",
  sweet_pick:    "Something Sweet",
  tiny_extra:    "The Finishing Touch",
  message:       "Your Message",
  review:        "Review",
};

const STEP_COPY: Record<Step, { eyebrow: string; title: string; sub: string }> = {
  main_surprise: {
    eyebrow: "Step one",
    title:   "The centrepiece.",
    sub:     "Choose the hero item that will make their breath catch.",
  },
  spin: {
    eyebrow: "Bonus reward",
    title:   "Spin for a reward.",
    sub:     "You chose your hero gift. Now spin — every order wins something.",
  },
  sweet_pick: {
    eyebrow: "Step two",
    title:   "Something sweet.",
    sub:     "Add a piece that softens the moment.",
  },
  tiny_extra: {
    eyebrow: "Step three",
    title:   "The finishing whisper.",
    sub:     "It's the little things that make them feel truly seen.",
  },
  message: {
    eyebrow: "Almost done",
    title:   "Write from the heart.",
    sub:     "This goes inside the box. They'll find it first.",
  },
  review: {
    eyebrow: "Final step",
    title:   "Your gift is ready.",
    sub:     "Everything is in place. Review, then checkout.",
  },
};

// ─── Product card (gallery style) ─────────────────────────────────────────────

function GalleryCard({ product, selected, onSelect }: {
  product: Product; selected: boolean; onSelect: () => void;
}) {
  return (
    <motion.div
      onClick={onSelect}
      className="cursor-pointer group"
      whileHover="hover"
      style={{ outline: selected ? "1.5px solid var(--storm)" : "1.5px solid transparent" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: ease.expo }}>

      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
        <motion.div className="absolute inset-0"
          variants={{ hover: { scale: 1.04 } }} transition={{ duration: 0.65, ease: ease.expo }}>
          <Image src={product.images[0]} alt={product.title} fill className="object-cover" sizes="(max-width:768px) 50vw, 33vw" />
        </motion.div>

        {/* Selected overlay */}
        <AnimatePresence>
          {selected && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: "rgba(58,74,92,0.35)" }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={springs.bouncy}
                className="w-14 h-14 flex items-center justify-center rounded-full"
                style={{ background: "var(--storm)", color: "var(--butter)" }}>
                <Check className="w-6 h-6" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hover select hint */}
        <AnimatePresence>
          {!selected && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }}
              className="absolute inset-x-0 bottom-0 p-4"
              style={{ background: "linear-gradient(to top, rgba(58,74,92,0.7), transparent)" }}
              variants={{ hover: { opacity: 1, y: 0 } }}>
              <p className="eyebrow" style={{ color: "rgba(245,230,163,0.8)" }}>Select this item</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info */}
      <div className="pt-4 pb-2">
        <div className="flex items-baseline justify-between mb-1">
          <h3 className="font-display text-lg font-medium text-storm leading-tight">{product.title}</h3>
          <span className="font-semibold text-storm text-sm ml-4 shrink-0">{formatGELSimple(product.boxPrice)}</span>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: "var(--storm-55)" }}>{product.description}</p>
        {selected && <p className="eyebrow mt-2" style={{ color: "var(--storm)" }}>✓ Selected</p>}
      </div>
    </motion.div>
  );
}

// ─── Box summary sidebar ──────────────────────────────────────────────────────

function BoxSummary({ selections, spinReward, subtotal, currentStep }: {
  selections: Partial<Record<ProductCategory, Product>>;
  spinReward: SpinReward | null;
  subtotal: number;
  currentStep: Step;
}) {
  const slots = [
    { key: "main_surprise" as ProductCategory, label: "Centrepiece" },
    { key: "sweet_pick"    as ProductCategory, label: "Sweet Pick" },
    { key: "tiny_extra"    as ProductCategory, label: "Finishing Touch" },
  ];

  return (
    <div className="space-y-6">
      <p className="eyebrow">Your box</p>

      <div className="space-y-3">
        {slots.map(slot => {
          const product = selections[slot.key];
          const isActive = currentStep === slot.key;
          return (
            <div key={slot.key} className="flex items-center gap-3 py-3"
              style={{ borderBottom: "1px solid var(--storm-12)" }}>
              {product ? (
                <>
                  <div className="relative w-12 h-12 shrink-0 overflow-hidden" style={{ outline: "1px solid var(--storm-12)" }}>
                    <Image src={product.images[0]} alt={product.title} fill className="object-cover" sizes="48px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-storm truncate">{product.title}</p>
                    <p className="eyebrow mt-0.5">{formatGELSimple(product.boxPrice)}</p>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3 w-full">
                  <div className="w-12 h-12 shrink-0 flex items-center justify-center"
                    style={{ border: `1px ${isActive ? "solid" : "dashed"} var(--storm-${isActive ? "35" : "18"})` }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: isActive ? "var(--storm-55)" : "var(--storm-18)" }} />
                  </div>
                  <p className="text-sm" style={{ color: isActive ? "var(--storm-55)" : "var(--storm-18)" }}>
                    {isActive ? "Choose now..." : slot.label}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {spinReward && (
        <div className="py-3" style={{ borderBottom: "1px solid var(--storm-12)" }}>
          <p className="eyebrow mb-1">Spin reward</p>
          <p className="text-sm font-medium text-storm">{spinReward.label}</p>
        </div>
      )}

      {subtotal > 0 && (
        <div className="flex justify-between items-baseline">
          <p className="eyebrow">Box subtotal</p>
          <p className="font-display text-2xl text-storm">{formatGELSimple(subtotal)}</p>
        </div>
      )}
    </div>
  );
}

// ─── Message step ─────────────────────────────────────────────────────────────

function MessageStep({ message, setMessage, recipientName, setRecipientName }: {
  message: string; setMessage: (v: string) => void;
  recipientName: string; setRecipientName: (v: string) => void;
}) {
  const PROMPTS = [
    "You make every day brighter.",
    "Just because you deserve it.",
    "No reason needed — you're simply the best.",
    "Hope this makes you smile as much as you make me.",
  ];

  return (
    <div className="max-w-lg space-y-10">
      <div>
        <label className="eyebrow block mb-3">For</label>
        <input type="text" value={recipientName} onChange={e => setRecipientName(e.target.value)}
          placeholder="Their name (optional)" maxLength={40}
          className="canvas-input w-full pb-3 text-base" />
      </div>
      <div>
        <label className="eyebrow block mb-3">Your message</label>
        <div className="relative">
          <textarea value={message} onChange={e => setMessage(e.target.value)}
            placeholder="Write something they'll feel..."
            maxLength={240} rows={5}
            className="canvas-input w-full pb-3 text-base resize-none" />
          <span className="absolute bottom-2 right-0 eyebrow tabular-nums">{message.length}/240</span>
        </div>
      </div>
      <div>
        <p className="eyebrow mb-4">Suggestions</p>
        <div className="space-y-2">
          {PROMPTS.map(p => (
            <button key={p} onClick={() => setMessage(p)}
              className="block w-full text-left text-sm py-2 border-b transition-colors hover:border-storm"
              style={{ color: "var(--storm-55)", borderColor: "var(--storm-12)" }}>
              {p}
            </button>
          ))}
        </div>
      </div>
      {(message || recipientName) && (
        <motion.div className="p-6" style={{ background: "var(--butter-2)", border: "1px solid var(--storm-18)" }}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          {recipientName && <p className="eyebrow mb-2">To: {recipientName}</p>}
          {message && <p className="font-display text-xl italic text-storm leading-snug">&ldquo;{message}&rdquo;</p>}
        </motion.div>
      )}
    </div>
  );
}

// ─── Review panel ─────────────────────────────────────────────────────────────

function ReviewPanel({ selections, spinReward, subtotal, sessionToken, giftMessage, recipientName }: {
  selections: Partial<Record<ProductCategory, Product>>;
  spinReward: SpinReward | null; subtotal: number;
  sessionToken: string; giftMessage: string; recipientName: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const shipping     = spinReward?.type === "free_shipping" ? 0 : 500;
  const discountRate = spinReward?.type === "discount_code" && spinReward.value ? parseFloat(String(spinReward.value)) / 100 : 0;
  const discount     = spinReward?.type === "free_tiny_gift" ? (selections.tiny_extra?.boxPrice ?? 0) : Math.round(subtotal * discountRate);
  const total        = subtotal - discount + shipping;

  async function checkout() {
    setLoading(true); setError(null);
    try {
      const res  = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken, giftMessage, recipientName }) });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError(data.error ?? "Checkout unavailable.");
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  }

  return (
    <div className="max-w-lg space-y-8">
      {/* Slot items */}
      <div className="space-y-0" style={{ borderTop: "1px solid var(--storm-12)" }}>
        {BOX_SLOTS.map(slot => {
          const product = selections[slot.category as ProductCategory];
          return (
            <div key={slot.id} className="py-5 flex items-center gap-5"
              style={{ borderBottom: "1px solid var(--storm-12)" }}>
              {product ? (
                <>
                  <div className="relative w-16 h-16 shrink-0 overflow-hidden">
                    <Image src={product.images[0]} alt={product.title} fill className="object-cover" sizes="64px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="eyebrow mb-1">{slot.label}</p>
                    <p className="font-display text-lg font-medium text-storm">{product.title}</p>
                  </div>
                  <p className="text-storm font-semibold shrink-0">{formatGELSimple(product.boxPrice)}</p>
                </>
              ) : (
                <p style={{ color: "var(--storm-35)" }}>{slot.label} — not selected</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Reward */}
      {spinReward && (
        <div className="py-4" style={{ borderBottom: "1px solid var(--storm-12)" }}>
          <p className="eyebrow mb-1">Spin reward applied</p>
          <p className="font-display text-lg text-storm">{spinReward.label}</p>
        </div>
      )}

      {/* Message */}
      {(giftMessage || recipientName) && (
        <div className="p-5" style={{ background: "var(--butter-2)", border: "1px solid var(--storm-18)" }}>
          {recipientName && <p className="eyebrow mb-1">To: {recipientName}</p>}
          {giftMessage && <p className="font-display text-lg italic text-storm">&ldquo;{giftMessage}&rdquo;</p>}
        </div>
      )}

      {/* Pricing */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm" style={{ color: "var(--storm-55)" }}>
          <span>Subtotal</span><span>{formatGELSimple(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm" style={{ color: "var(--storm-55)" }}>
            <span>Reward discount</span><span>−{formatGELSimple(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm" style={{ color: "var(--storm-55)" }}>
          <span>Shipping</span>
          <span>{spinReward?.type === "free_shipping" ? "Free" : formatGELSimple(shipping)}</span>
        </div>
        <div className="flex justify-between font-display text-3xl pt-4"
          style={{ borderTop: "1px solid var(--storm-18)" }}>
          <span>Total</span>
          <span>{formatGELSimple(total)}</span>
        </div>
      </div>

      {error && (
        <p className="text-sm" style={{ color: "#C0392B" }}>{error}</p>
      )}

      <motion.button onClick={checkout} disabled={loading} whileHover={{ opacity: 0.85 }} whileTap={{ scale: 0.98 }}
        className="btn-primary w-full py-5 text-xs tracking-widest">
        {loading ? "Processing..." : `Checkout — ${formatGELSimple(total)}`}
      </motion.button>
      <p className="text-center eyebrow" style={{ color: "var(--storm-35)" }}>
        Secure · Gift-wrapped · Delivered in Georgia
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

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

  const cartItems = useCartStore((s) => s.items);
  const cartCount = cartItems.reduce((n, i) => n + i.quantity, 0);
  const openMiniCart = useUIStore((s) => s.openMiniCart);

  const currentStep = STEPS[stepIndex];
  const direction   = stepIndex > prevStepRef.current ? 1 : -1;

  useEffect(() => { prevStepRef.current = stepIndex; }, [stepIndex]);

  useEffect(() => {
    const saved = localStorage.getItem("box_session_token");
    if (saved) setSessionToken(saved);
    fetch("/api/products")
      .then(r => r.ok ? r.json() : { products: [] })
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
    const token = await ensureSession();
    const keyMap: Record<string, string> = { main_surprise: "mainSurpriseId", sweet_pick: "sweetPickId", tiny_extra: "tinyExtraId" };
    try {
      await fetch(`/api/boxes/${token}`, { method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [keyMap[product.category]]: product.id }) });
    } catch {}
    setSelections(prev => ({ ...prev, [product.category]: product }));
  }, [ensureSession]);

  function canAdvance(): boolean {
    if (currentStep === "main_surprise") return !!selections.main_surprise;
    if (currentStep === "spin")          return !!spinReward; // must spin before continuing
    if (currentStep === "sweet_pick")    return !!selections.sweet_pick;
    if (currentStep === "tiny_extra")    return !!selections.tiny_extra;
    return true; // message is optional, review always ok
  }

  function advance() {
    if (currentStep === "spin" && !spinReward) {
      // Trigger spin wheel
      setShowSpinWheel(true);
      return;
    }
    if (stepIndex < STEPS.length - 1) setStepIndex(i => i + 1);
  }

  // ── Fixed spin wheel handlers (no double-fire) ────────────────────────────

  function handleRewardReceived(reward: SpinReward) {
    setSpinReward(reward);
    setShowSpinWheel(false);
    // Advance to sweet_pick (next step after spin)
    const spinIdx = STEPS.indexOf("spin");
    setStepIndex(spinIdx + 1);
  }

  function handleSpinClose() {
    setShowSpinWheel(false);
    // If they already have a reward (closed after winning), advance
    // spinReward state may not have updated yet, so we check after tick
    // Actually we do nothing here — the advance button will handle it
  }

  const subtotal    = useMemo(() => Object.values(selections).reduce((s, p) => s + (p?.boxPrice ?? 0), 0), [selections]);
  const filledCount = Object.values(selections).filter(Boolean).length;

  const productSteps = ["main_surprise", "sweet_pick", "tiny_extra"] as const;
  const isProductStep = productSteps.includes(currentStep as typeof productSteps[number]);

  return (
    <div style={{ background: "var(--butter)", minHeight: "100dvh" }}>

      {/* Nav */}
      <nav className="sticky top-0 z-40 px-8 sm:px-12 h-16 flex items-center justify-between"
        style={{ background: "rgba(245,230,163,0.95)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--storm-12)" }}>
        <Link href="/shop"
          className="flex items-center gap-2 text-sm transition-opacity hover:opacity-60"
          style={{ color: "var(--storm-55)" }}>
          <ArrowLeft className="w-4 h-4" /> Shop
        </Link>
        <Link href="/" className="font-display text-xl font-bold text-storm">
          gamif<span style={{ opacity: 0.35 }}>.</span>
        </Link>
        <div className="flex items-center gap-4">
          {subtotal > 0 && (
            <span className="font-display text-base text-storm hidden sm:block">{formatGELSimple(subtotal)}</span>
          )}
          <button onClick={openMiniCart} className="relative" aria-label="Cart"
            style={{ color: "var(--storm-55)" }}>
            <ShoppingCart className="w-4 h-4" />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span key={cartCount} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 text-[8px] font-bold rounded-full flex items-center justify-center"
                  style={{ background: "var(--storm)", color: "var(--butter)" }}>
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </nav>

      {/* Progress */}
      <div className="px-8 sm:px-12 py-4 flex items-center gap-3 overflow-x-auto"
        style={{ borderBottom: "1px solid var(--storm-08)" }}>
        {STEPS.filter(s => s !== "spin").map((s, i) => {
          const stepDone = stepIndex > STEPS.indexOf(s);
          const stepActive = currentStep === s;
          return (
            <div key={s} className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{ background: stepDone || stepActive ? "var(--storm)" : "var(--storm-18)" }} />
                <span className="eyebrow transition-colors"
                  style={{ color: stepActive ? "var(--storm)" : stepDone ? "var(--storm-55)" : "var(--storm-18)" }}>
                  {STEP_LABEL[s]}
                </span>
              </div>
              {i < STEPS.filter(s2 => s2 !== "spin").length - 1 && (
                <div className="w-6 h-px" style={{ background: "var(--storm-18)" }} />
              )}
            </div>
          );
        })}
        {spinReward && (
          <span className="eyebrow ml-2" style={{ color: "var(--storm-55)" }}>
            · {spinReward.label}
          </span>
        )}
      </div>

      {/* Main layout */}
      <div className="max-w-8xl mx-auto px-8 sm:px-12 py-12 lg:grid lg:grid-cols-[1fr_320px] lg:gap-16">

        {/* Content */}
        <div>
          {/* Step header */}
          <AnimatePresence mode="wait">
            <motion.div key={currentStep + "-hdr"} className="mb-12"
              initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: ease.expo }}>
              <p className="eyebrow mb-4">{STEP_COPY[currentStep].eyebrow}</p>
              <h1 className="font-display font-light text-storm leading-tight mb-3"
                style={{ fontSize: "clamp(2.5rem, 6vw, 6rem)" }}>
                {STEP_COPY[currentStep].title}
              </h1>
              <p style={{ color: "var(--storm-55)", fontSize: "0.95rem", maxWidth: "36ch" }}>
                {STEP_COPY[currentStep].sub}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Step content */}
          <AnimatePresence mode="wait" custom={direction}>
            {isProductStep && (
              <motion.div key={currentStep}
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -direction * 40 }}
                transition={{ duration: 0.45, ease: ease.expo }}>
                {loading ? (
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
                    {[1,2,3].map(i => (
                      <div key={i} className="shimmer" style={{ aspectRatio: "3/4" }} />
                    ))}
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
                    {(products[currentStep as ProductCategory] ?? []).map(product => (
                      <GalleryCard key={product.id} product={product}
                        selected={selections[currentStep as ProductCategory]?.id === product.id}
                        onSelect={() => selectProduct(product)} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {currentStep === "spin" && (
              <motion.div key="spin" className="py-8"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
                {spinReward ? (
                  <div className="max-w-sm space-y-6">
                    <div className="p-8" style={{ background: "var(--butter-2)", border: "1px solid var(--storm-18)" }}>
                      <p className="eyebrow mb-3">Reward earned</p>
                      <p className="font-display text-3xl font-medium text-storm mb-2">{spinReward.label}</p>
                      <p style={{ color: "var(--storm-55)", fontSize: "0.875rem" }}>Applied at checkout automatically.</p>
                    </div>
                    <motion.button onClick={() => setStepIndex(STEPS.indexOf("sweet_pick"))}
                      className="btn-primary px-8 py-4 text-xs tracking-widest flex items-center gap-2"
                      whileHover={{ opacity: 0.85 }}>
                      Continue <ArrowRight className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                ) : (
                  <div className="max-w-sm space-y-6">
                    <p style={{ color: "var(--storm-55)", fontSize: "0.95rem", lineHeight: 1.7 }}>
                      You chose your centrepiece. Every order at Gamif earns a spin reward — free gifts, discounts, or a surprise upgrade.
                    </p>
                    <motion.button onClick={() => setShowSpinWheel(true)}
                      className="btn-primary px-8 py-4 text-xs tracking-widest"
                      whileHover={{ opacity: 0.85 }} whileTap={{ scale: 0.97 }}>
                      Spin the Wheel
                    </motion.button>
                  </div>
                )}
              </motion.div>
            )}

            {currentStep === "message" && (
              <motion.div key="message"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
                <MessageStep message={giftMessage} setMessage={setGiftMessage}
                  recipientName={recipientName} setRecipientName={setRecipientName} />
              </motion.div>
            )}

            {currentStep === "review" && (
              <motion.div key="review"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
                <ReviewPanel selections={selections} spinReward={spinReward} subtotal={subtotal}
                  sessionToken={sessionToken} giftMessage={giftMessage} recipientName={recipientName} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <BoxSummary selections={selections} spinReward={spinReward} subtotal={subtotal} currentStep={currentStep} />
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      {currentStep !== "review" && (
        <div className="fixed bottom-0 left-0 right-0 z-40 safe-bottom"
          style={{ background: "rgba(245,230,163,0.97)", backdropFilter: "blur(16px)", borderTop: "1px solid var(--storm-12)" }}>
          <div className="max-w-8xl mx-auto px-8 sm:px-12 h-16 flex items-center justify-between">
            <div>
              {filledCount > 0 && (
                <p className="text-sm font-medium text-storm">{filledCount}/3 items chosen</p>
              )}
              <p className="eyebrow" style={{ color: "var(--storm-35)" }}>
                {currentStep === "spin" && !spinReward ? "Spin to continue" :
                 currentStep === "message" ? "Message is optional — you can skip" :
                 !canAdvance() ? "Choose an item to continue" : ""}
              </p>
            </div>
            <motion.button
              onClick={advance}
              disabled={!canAdvance() && !(currentStep === "spin" && !spinReward)}
              className="flex items-center gap-2 px-8 py-3 text-xs tracking-widest transition-all"
              style={
                canAdvance() || (currentStep === "spin" && !spinReward)
                  ? { background: "var(--storm)", color: "var(--butter)" }
                  : { background: "var(--storm-12)", color: "var(--storm-35)", cursor: "not-allowed" }
              }
              whileHover={canAdvance() || (currentStep === "spin" && !spinReward) ? { opacity: 0.85 } : {}}
              whileTap={canAdvance() || (currentStep === "spin" && !spinReward) ? { scale: 0.97 } : {}}>
              {currentStep === "spin" && !spinReward ? "Spin the Wheel" :
               currentStep === "message" ? "Continue →" :
               currentStep === "tiny_extra" ? "Next →" : "Next →"}
            </motion.button>
          </div>
        </div>
      )}

      {/* Spin wheel overlay — keeps its own dark aesthetic as a dramatic contrast moment */}
      {showSpinWheel && (
        <LuckySpinWheel
          sessionToken={sessionToken || `local-${Date.now()}`}
          onRewardReceived={handleRewardReceived}
          onClose={handleSpinClose}
        />
      )}
    </div>
  );
}
