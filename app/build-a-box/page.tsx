"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useAnimate } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, ChevronRight, Gift, Lock, MessageSquare, Sparkles, Zap } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import LuckySpinWheel from "@/components/LuckySpinWheel";
import { type Product, type ProductCategory, type SpinReward, BOX_SLOTS, formatGELSimple } from "@/lib/types";
import { springs, ease, fadeUp } from "@/lib/motion";

// ─── Demo products ────────────────────────────────────────────────────────────

const DEMO: Record<ProductCategory, Product[]> = {
  main_surprise: [
    { id: "p1", title: "Preserved Rose Box", description: "Velvet-toned roses for a breathtaking reveal.", normalPrice: 4900, boxPrice: 3900, images: ["https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=600&q=80"], stock: 12, active: true, category: "main_surprise", audience: "for_her", vibes: ["romantic", "luxury"], tags: [] },
    { id: "p2", title: "Gold Initial Necklace", description: "A personal keepsake chosen just for them.", normalPrice: 5900, boxPrice: 4800, images: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"], stock: 8, active: true, category: "main_surprise", audience: "for_her", vibes: ["luxury", "aesthetic"], tags: [] },
    { id: "p3", title: "Crystal Perfume", description: "A luxury fragrance in a sculpted bottle.", normalPrice: 6500, boxPrice: 5200, images: ["https://images.unsplash.com/photo-1541643600914-78b084683702?auto=format&fit=crop&w=600&q=80"], stock: 6, active: true, category: "main_surprise", audience: "for_her", vibes: ["luxury"], tags: [] },
  ],
  sweet_pick: [
    { id: "p4", title: "Signature Soy Candle", description: "Warm amber — an evening-in feeling.", normalPrice: 2800, boxPrice: 2200, images: ["https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80"], stock: 25, active: true, category: "sweet_pick", audience: "neutral", vibes: ["cozy", "romantic"], tags: [] },
    { id: "p5", title: "Rose Quartz Roller", description: "Cooling, soothing and visually stunning.", normalPrice: 3100, boxPrice: 2500, images: ["https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=600&q=80"], stock: 18, active: true, category: "sweet_pick", audience: "for_her", vibes: ["cozy", "soft"], tags: [] },
    { id: "p6", title: "Cashmere Eye Mask", description: "The luxury sleep essential they always wanted.", normalPrice: 2600, boxPrice: 2100, images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80"], stock: 14, active: true, category: "sweet_pick", audience: "for_her", vibes: ["cozy", "luxury"], tags: [] },
  ],
  tiny_extra: [
    { id: "p7", title: "Artisan Chocolate Box", description: "Hand-crafted truffles tucked inside tissue.", normalPrice: 1800, boxPrice: 1400, images: ["https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80"], stock: 30, active: true, category: "tiny_extra", audience: "neutral", vibes: ["cute", "cozy"], tags: [] },
    { id: "p8", title: "Plush Teddy Bear", description: "Soft, huggable and impossibly cute.", normalPrice: 2200, boxPrice: 1800, images: ["https://images.unsplash.com/photo-1563901935883-cb61f5d49be4?auto=format&fit=crop&w=600&q=80"], stock: 20, active: true, category: "tiny_extra", audience: "for_her", vibes: ["cute", "soft"], tags: [] },
    { id: "p11", title: "Gold Foil Card", description: "A luxurious finishing touch.", normalPrice: 600, boxPrice: 400, images: ["https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=600&q=80"], stock: 50, active: true, category: "tiny_extra", audience: "neutral", vibes: ["romantic"], tags: [] },
  ],
  lucky_bonus: [],
};

type Step = "main_surprise" | "sweet_pick" | "tiny_extra" | "message" | "spin" | "review";
const STEPS: Step[] = ["main_surprise", "sweet_pick", "tiny_extra", "message", "spin", "review"];

// ─── Box slot preview card ────────────────────────────────────────────────────

function BoxSlotCard({
  slot, selection, isCurrent,
}: {
  slot: { id: string; category: string; label: string; emoji: string };
  selection?: Product;
  isCurrent: boolean;
}) {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    if (selection && scope.current) {
      animate(scope.current, { scale: [1.15, 0.95, 1.02, 1] }, { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] });
    }
  }, [selection?.id, animate, scope]);

  return (
    <motion.div
      ref={scope}
      className="relative aspect-square rounded-2xl overflow-hidden border-2 transition-colors duration-300"
      style={{
        borderColor: isCurrent ? "#FF2D78" : selection ? "#10B981" : "rgba(255,255,255,0.08)",
        boxShadow: isCurrent ? "0 0 28px rgba(255,45,120,0.35)" : selection ? "0 0 16px rgba(16,185,129,0.2)" : "none",
      }}
    >
      <AnimatePresence mode="wait">
        {selection ? (
          <motion.div
            key="filled"
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.25 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: ease.expo }}
          >
            <Image src={selection.images[0]} alt={selection.title} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
            <div className="absolute bottom-2 left-2 right-2">
              <p className="text-white text-xs font-bold truncate leading-tight">{selection.title}</p>
              <p className="text-accent text-xs font-black">{formatGELSimple(selection.boxPrice)}</p>
            </div>
            <motion.div
              className="absolute top-2 right-2 w-6 h-6 bg-emerald rounded-full flex items-center justify-center"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={springs.bouncy}
            >
              <Check className="w-3.5 h-3.5 text-white" />
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{ background: isCurrent ? "rgba(255,45,120,0.06)" : "rgba(26,26,26,1)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="text-3xl"
              animate={isCurrent ? { y: [0, -4, 0], scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              {isCurrent ? slot.emoji : <Lock className="w-5 h-5 text-white/15" />}
            </motion.div>
            <p className={`text-[10px] font-black uppercase tracking-wider ${isCurrent ? "text-white/60" : "text-white/15"}`}>
              {isCurrent ? slot.label : ""}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Gift message step ────────────────────────────────────────────────────────

function GiftMessageStep({
  message, setMessage, recipientName, setRecipientName,
}: {
  message: string;
  setMessage: (v: string) => void;
  recipientName: string;
  setRecipientName: (v: string) => void;
}) {
  const SUGGESTIONS = [
    "You make every day brighter 💛",
    "Just because you deserve it 🌸",
    "My favourite person gets my favourite box 🎁",
    "No reason needed — you're simply the best ✨",
    "Hope this makes you smile as much as you make me 💕",
  ];

  return (
    <motion.div
      className="max-w-lg mx-auto space-y-7"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.5, ease: ease.expo }}
    >
      <div>
        <motion.h2
          className="font-display text-4xl font-bold text-white mb-2"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.08 }}
        >
          Write something{" "}
          <span style={{ background: "linear-gradient(135deg,#FF2D78,#7C3AED)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            personal
          </span>
        </motion.h2>
        <p className="text-white/45 text-base">They&apos;ll open this with the box. Make it count.</p>
      </div>

      {/* Recipient name */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
        <label className="text-white/30 text-xs font-black uppercase tracking-[0.2em] mb-2 block">For</label>
        <input
          type="text"
          placeholder="Their name (optional)"
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
          maxLength={40}
          className="w-full bg-white/5 border border-white/10 text-white placeholder-white/25 rounded-2xl px-4 py-3.5 text-sm font-medium outline-none focus:border-accent/50 focus:shadow-[0_0_0_2px_rgba(255,45,120,0.15)] transition-all"
        />
      </motion.div>

      {/* Message */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <label className="text-white/30 text-xs font-black uppercase tracking-[0.2em] mb-2 block">Your message</label>
        <div className="relative">
          <textarea
            placeholder="Write your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={240}
            rows={4}
            className="w-full bg-white/5 border border-white/10 text-white placeholder-white/25 rounded-2xl px-4 py-4 text-sm font-medium outline-none focus:border-accent/50 focus:shadow-[0_0_0_2px_rgba(255,45,120,0.15)] transition-all resize-none"
          />
          <span className="absolute bottom-3 right-4 text-white/20 text-xs">{message.length}/240</span>
        </div>
      </motion.div>

      {/* Suggestion pills */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
        <p className="text-white/25 text-xs font-bold uppercase tracking-widest mb-3">Inspiration</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <motion.button
              key={s}
              onClick={() => setMessage(s)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="text-xs px-3 py-2 rounded-xl border border-white/10 text-white/45 hover:text-white hover:border-accent/40 hover:bg-accent/8 transition-all text-left"
            >
              {s}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Live preview card */}
      <AnimatePresence>
        {(message || recipientName) && (
          <motion.div
            className="relative rounded-3xl p-6 overflow-hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ background: "linear-gradient(135deg, rgba(255,45,120,0.1) 0%, rgba(124,58,237,0.1) 100%)", border: "1px solid rgba(255,45,120,0.2)" }}
          >
            <div className="absolute top-4 right-4 text-xl opacity-40">💌</div>
            {recipientName && (
              <p className="text-white/40 text-sm mb-2">To: <span className="text-white font-bold">{recipientName}</span></p>
            )}
            {message && (
              <p className="text-white/80 text-sm leading-relaxed italic">&ldquo;{message}&rdquo;</p>
            )}
            <p className="text-white/30 text-xs mt-3">— with love 💗</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Review panel ─────────────────────────────────────────────────────────────

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
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shipping = spinReward?.type === "free_shipping" ? 0 : 500;
  const discountRate = spinReward?.type === "discount_code" && spinReward.value
    ? parseFloat(String(spinReward.value)) / 100 : 0;
  const discount = spinReward?.type === "free_tiny_gift"
    ? (selections.tiny_extra?.boxPrice ?? 0)
    : Math.round(subtotal * discountRate);
  const total = subtotal - discount + shipping;

  async function checkout() {
    setLoadingCheckout(true);
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
    } catch { setError("Something went wrong."); }
    finally { setLoadingCheckout(false); }
  }

  return (
    <motion.div
      className="max-w-lg mx-auto space-y-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: ease.expo }}
    >
      <div className="text-center mb-8">
        <motion.div
          className="text-5xl mb-3"
          animate={{ rotate: [0, -5, 5, -3, 3, 0] }}
          transition={{ duration: 1.2, delay: 0.3 }}
        >
          🎁
        </motion.div>
        <h2 className="font-display text-4xl font-bold text-white mb-1">Your Gift Box</h2>
        <p className="text-white/40 text-sm">Ready to make someone&apos;s day</p>
      </div>

      {/* Selections */}
      <div className="space-y-3">
        {BOX_SLOTS.map((slot) => {
          const product = selections[slot.category as ProductCategory];
          return (
            <motion.div
              key={slot.id}
              className="glass border border-white/8 rounded-2xl p-4 flex items-center gap-4"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: BOX_SLOTS.indexOf(slot) * 0.07 }}
            >
              {product ? (
                <>
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white/10">
                    <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">{slot.label}</p>
                    <p className="text-white font-bold text-sm truncate">{product.title}</p>
                  </div>
                  <p className="text-accent font-black text-sm shrink-0">{formatGELSimple(product.boxPrice)}</p>
                </>
              ) : (
                <div className="flex items-center gap-3 text-white/25 w-full">
                  <span>{slot.emoji}</span>
                  <p className="text-sm">{slot.label} — not selected</p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Gift message preview */}
      {(giftMessage || recipientName) && (
        <motion.div
          className="rounded-2xl p-4 flex items-start gap-3"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ background: "rgba(255,45,120,0.07)", border: "1px solid rgba(255,45,120,0.18)" }}
        >
          <span className="text-xl mt-0.5">💌</span>
          <div>
            {recipientName && <p className="text-white/45 text-xs mb-1">To: <span className="text-white font-bold">{recipientName}</span></p>}
            {giftMessage && <p className="text-white/70 text-sm italic">&ldquo;{giftMessage}&rdquo;</p>}
          </div>
        </motion.div>
      )}

      {/* Spin reward */}
      {spinReward && (
        <motion.div
          className="rounded-2xl p-4 flex items-center gap-3"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          style={{ background: "rgba(255,215,0,0.07)", border: "1px solid rgba(255,215,0,0.25)" }}
        >
          <span className="text-2xl">🎡</span>
          <div className="flex-1">
            <p className="text-gold font-black text-sm">{spinReward.label}</p>
            <p className="text-white/35 text-xs">Spin reward applied</p>
          </div>
          {discount > 0 && <p className="text-gold font-black text-sm">-{formatGELSimple(discount)}</p>}
          {spinReward.type === "free_shipping" && <p className="text-emerald font-black text-sm">Free shipping!</p>}
        </motion.div>
      )}

      {/* Price breakdown */}
      <div className="glass border border-white/8 rounded-2xl p-5 space-y-3">
        <div className="flex justify-between text-sm text-white/50">
          <span>Box subtotal</span><span>{formatGELSimple(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm text-emerald">
            <span>Reward discount</span><span>-{formatGELSimple(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm text-white/50">
          <span>Shipping</span>
          <span className={spinReward?.type === "free_shipping" ? "text-emerald font-bold" : ""}>
            {spinReward?.type === "free_shipping" ? "Free 🎉" : formatGELSimple(shipping)}
          </span>
        </div>
        <div className="flex justify-between font-black text-white text-xl border-t border-white/10 pt-3">
          <span>Total</span><span>{formatGELSimple(total)}</span>
        </div>
      </div>

      {error && (
        <motion.p className="text-red-400 text-sm font-bold text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {error}
        </motion.p>
      )}

      <motion.button
        onClick={checkout}
        disabled={loadingCheckout}
        className="btn-dopamine w-full py-5 rounded-2xl text-base font-black uppercase tracking-wider flex items-center justify-center gap-3"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
      >
        {loadingCheckout
          ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <><Zap className="w-5 h-5" /> Checkout — {formatGELSimple(total)}</>}
      </motion.button>

      <p className="text-center text-white/25 text-xs">🔒 Secure checkout · GEL · Gift-wrapped</p>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function BuildABoxPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const [selections, setSelections] = useState<Partial<Record<ProductCategory, Product>>>({});
  const [products, setProducts] = useState<Record<ProductCategory, Product[]>>(DEMO);
  const [loading, setLoading] = useState(true);
  const [sessionToken, setSessionToken] = useState("");
  const [spinReward, setSpinReward] = useState<SpinReward | null>(null);
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const prevStepRef = useRef(stepIndex);

  const currentStep = STEPS[stepIndex];
  const direction = stepIndex > prevStepRef.current ? 1 : -1;

  useEffect(() => {
    prevStepRef.current = stepIndex;
  }, [stepIndex]);

  useEffect(() => {
    const savedToken = localStorage.getItem("box_session_token");
    if (savedToken) setSessionToken(savedToken);

    fetch("/api/products")
      .then((r) => (r.ok ? r.json() : { products: [] }))
      .then((data: { products?: Product[] }) => {
        if (data.products?.length) {
          const grouped: Record<ProductCategory, Product[]> = { main_surprise: [], sweet_pick: [], tiny_extra: [], lucky_bonus: [] };
          for (const p of data.products) grouped[p.category as ProductCategory]?.push(p);
          setProducts(grouped);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function ensureSession() {
    if (sessionToken) return sessionToken;
    try {
      const res = await fetch("/api/boxes", { method: "POST" });
      const data = await res.json();
      const token = data.sessionToken ?? `local-${Date.now()}`;
      localStorage.setItem("box_session_token", token);
      setSessionToken(token);
      return token;
    } catch {
      const token = `local-${Date.now()}`;
      localStorage.setItem("box_session_token", token);
      setSessionToken(token);
      return token;
    }
  }

  async function selectProduct(product: Product) {
    const token = await ensureSession();
    const slotKeyMap: Record<string, string> = { main_surprise: "mainSurpriseId", sweet_pick: "sweetPickId", tiny_extra: "tinyExtraId" };
    try {
      await fetch(`/api/boxes/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [slotKeyMap[product.category]]: product.id }),
      });
    } catch {}
    setSelections((prev) => ({ ...prev, [product.category]: product }));
  }

  function canAdvance() {
    if (currentStep === "main_surprise") return !!selections.main_surprise;
    if (currentStep === "sweet_pick") return !!selections.sweet_pick;
    if (currentStep === "tiny_extra") return !!selections.tiny_extra;
    if (currentStep === "message") return true; // message is optional
    if (currentStep === "spin") return !!spinReward;
    return true;
  }

  function advance() {
    if (currentStep === "message" || currentStep === "tiny_extra") {
      if (currentStep === "message") {
        setShowSpinWheel(true);
        return;
      }
      // tiny_extra → message
    }
    if (stepIndex < STEPS.length - 1) setStepIndex((i) => i + 1);
  }

  function handleRewardReceived(reward: SpinReward) {
    setSpinReward(reward);
    setShowSpinWheel(false);
    setStepIndex(STEPS.indexOf("spin"));
  }

  const subtotal = useMemo(() => Object.values(selections).reduce((s, p) => s + (p?.boxPrice ?? 0), 0), [selections]);
  const filledCount = Object.values(selections).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#0D0D0D] pb-36">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass-strong border-b border-white/5 px-5 py-4 flex items-center justify-between">
        <Link href="/shop" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Shop</span>
        </Link>
        <Link href="/" className="font-display text-xl font-bold text-white">gamif<span className="text-accent">.</span></Link>
        {subtotal > 0 && (
          <span className="text-accent font-black text-sm">{formatGELSimple(subtotal)}</span>
        )}
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: ease.expo }}
        >
          <motion.span
            className="text-accent text-xs font-black uppercase tracking-[0.3em] mb-3 block"
            variants={fadeUp}
          >
            Build Your Box
          </motion.span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-3 leading-tight">
            Compose the perfect gift.
          </h1>
          <p className="text-white/40 text-base max-w-xl mx-auto">
            Pick 3 items at exclusive box prices, add a message, then spin for a reward.
          </p>
        </motion.div>

        {/* Step breadcrumbs */}
        <div className="flex items-center justify-center gap-1.5 mb-10 flex-wrap">
          {BOX_SLOTS.map((slot, i) => {
            const isDone = stepIndex > i || !!selections[slot.category as ProductCategory];
            const isActive = stepIndex === i;
            return (
              <div key={slot.id} className="flex items-center gap-1.5 shrink-0">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-wider transition-all ${
                  isActive ? "bg-accent/20 border-accent/50 text-accent" :
                  isDone   ? "bg-emerald/15 border-emerald/35 text-emerald" :
                             "glass border-white/8 text-white/25"
                }`}>
                  {isDone ? <Check className="w-2.5 h-2.5" /> : isActive ? <span>{slot.emoji}</span> : <Lock className="w-2.5 h-2.5" />}
                  <span className="hidden sm:inline">{slot.label}</span>
                </div>
                {i < BOX_SLOTS.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-white/15 shrink-0" />}
              </div>
            );
          })}
          <ChevronRight className="w-3.5 h-3.5 text-white/15 shrink-0" />
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-wider shrink-0 ${
            currentStep === "message" ? "bg-violet/20 border-violet/50 text-violet-2" : stepIndex > 3 ? "bg-emerald/15 border-emerald/35 text-emerald" : "glass border-white/8 text-white/25"
          }`}>
            {stepIndex > 3 ? <Check className="w-2.5 h-2.5" /> : <MessageSquare className="w-2.5 h-2.5" />}
            <span className="hidden sm:inline">Message</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-white/15 shrink-0" />
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-wider shrink-0 ${
            currentStep === "spin" ? "bg-gold/20 border-gold/50 text-gold" : spinReward ? "bg-emerald/15 border-emerald/35 text-emerald" : "glass border-white/8 text-white/25"
          }`}>
            {spinReward ? <Check className="w-2.5 h-2.5" /> : <span>🎡</span>}
            <span className="hidden sm:inline">Lucky Spin</span>
          </div>
        </div>

        {/* Box preview */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-10 max-w-sm sm:max-w-md mx-auto">
          {BOX_SLOTS.map((slot, i) => (
            <BoxSlotCard
              key={slot.id}
              slot={slot}
              selection={selections[slot.category as ProductCategory]}
              isCurrent={currentStep === slot.category}
            />
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait" custom={direction}>
          {(currentStep === "main_surprise" || currentStep === "sweet_pick" || currentStep === "tiny_extra") && (
            <motion.div
              key={currentStep}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -direction * 40, filter: "blur(4px)" }}
              transition={{ duration: 0.4, ease: ease.expo }}
            >
              {BOX_SLOTS.filter((s) => s.category === currentStep).map((slot) => (
                <motion.div key={slot.id} className="flex items-center gap-3 mb-8">
                  <motion.span
                    className="text-4xl"
                    animate={{ y: [0, -6, 0], rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {slot.emoji}
                  </motion.span>
                  <div>
                    <h2 className="font-display text-3xl font-bold text-white">{slot.label}</h2>
                    <p className="text-white/45 text-sm">{slot.description}</p>
                  </div>
                </motion.div>
              ))}
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-[3/4] rounded-2xl bg-card" style={{ animation: "pulse 2s ease-in-out infinite" }} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {(products[currentStep as ProductCategory] ?? []).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToBox={selectProduct}
                      isInBox={selections[currentStep as ProductCategory]?.id === product.id}
                      showBoxAction
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {currentStep === "message" && (
            <GiftMessageStep
              key="message"
              message={giftMessage}
              setMessage={setGiftMessage}
              recipientName={recipientName}
              setRecipientName={setRecipientName}
            />
          )}

          {currentStep === "spin" && (
            <motion.div
              key="spin"
              className="text-center py-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: ease.expo }}
            >
              {spinReward ? (
                <div className="space-y-4">
                  <motion.div className="text-6xl" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                    🎉
                  </motion.div>
                  <h2 className="font-display text-4xl font-bold text-white">Reward Applied!</h2>
                  <p className="text-accent text-2xl font-black">{spinReward.label}</p>
                  <p className="text-white/35 text-sm">Applied automatically at checkout.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <motion.div
                    className="text-7xl"
                    animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🎡
                  </motion.div>
                  <h2 className="font-display text-4xl font-bold text-white">Your box is complete!</h2>
                  <p className="text-white/45 text-lg max-w-sm mx-auto">Spin the wheel for an exclusive reward before checkout.</p>
                  <motion.button
                    onClick={() => setShowSpinWheel(true)}
                    className="btn-dopamine px-10 py-4 rounded-2xl text-base font-black inline-flex items-center gap-3"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <Zap className="w-5 h-5" /> Spin the Wheel ✨
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}

          {currentStep === "review" && (
            <ReviewPanel
              key="review"
              selections={selections}
              spinReward={spinReward}
              subtotal={subtotal}
              sessionToken={sessionToken}
              giftMessage={giftMessage}
              recipientName={recipientName}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Bottom action bar */}
      {currentStep !== "review" && (
        <div className="fixed bottom-0 left-0 right-0 z-30 p-4">
          <motion.div
            className="max-w-6xl mx-auto glass-strong border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-4"
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            transition={springs.gentle}
          >
            <div className="flex-1 min-w-0">
              {subtotal > 0 && (
                <p className="text-white font-bold text-sm mb-0.5">
                  Box: <span className="text-accent">{formatGELSimple(subtotal)}</span>
                </p>
              )}
              <p className="text-white/35 text-xs truncate">
                {filledCount === 3
                  ? spinReward ? "Ready to checkout ✨" : currentStep === "message" ? "Add a message or skip" : "Spin for your reward!"
                  : `${3 - filledCount} more item${3 - filledCount !== 1 ? "s" : ""} to go`}
              </p>
            </div>

            <motion.button
              onClick={advance}
              disabled={!canAdvance()}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-wider shrink-0 transition-all ${
                canAdvance() ? "btn-dopamine" : "glass border border-white/8 text-white/25 cursor-not-allowed"
              }`}
              whileHover={canAdvance() ? { scale: 1.04 } : {}}
              whileTap={canAdvance() ? { scale: 0.96 } : {}}
            >
              {currentStep === "message"
                ? <><Sparkles className="w-4 h-4" /> Spin!</>
                : currentStep === "spin" && spinReward
                  ? <><ArrowRight className="w-4 h-4" /> Review</>
                  : <><ArrowRight className="w-4 h-4" /> Next</>}
            </motion.button>
          </motion.div>
        </div>
      )}

      {showSpinWheel && (
        <LuckySpinWheel
          sessionToken={sessionToken || `local-${Date.now()}`}
          onRewardReceived={handleRewardReceived}
          onClose={() => {
            setShowSpinWheel(false);
            if (spinReward) setStepIndex(STEPS.indexOf("spin"));
          }}
        />
      )}
    </div>
  );
}
