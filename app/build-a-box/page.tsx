"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Gift, MessageSquare, ShoppingCart, Sparkles, X, Zap } from "lucide-react";
import LuckySpinWheel from "@/components/LuckySpinWheel";
import { type Product, type ProductCategory, type SpinReward, BOX_SLOTS, formatGELSimple } from "@/lib/types";
import { springs, ease } from "@/lib/motion";
import { useCartStore } from "@/lib/stores/cart";
import { useUIStore } from "@/lib/stores/ui";

// ─── Demo products ────────────────────────────────────────────────────────────

const DEMO: Record<ProductCategory, Product[]> = {
  main_surprise: [
    { id: "p1", title: "Preserved Rose Box",   description: "Velvet-toned roses for a breathtaking reveal.",               normalPrice: 4900, boxPrice: 3900, images: ["https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80"], stock: 12, active: true, category: "main_surprise", audience: "for_her", vibes: ["romantic","luxury"], tags: [] },
    { id: "p2", title: "Gold Initial Necklace", description: "A personal keepsake chosen just for them.",                   normalPrice: 5900, boxPrice: 4800, images: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"], stock:  8, active: true, category: "main_surprise", audience: "for_her", vibes: ["luxury","aesthetic"], tags: [] },
    { id: "p3", title: "Crystal Perfume",       description: "A luxury fragrance in a hand-crafted bottle.",                normalPrice: 6500, boxPrice: 5200, images: ["https://images.unsplash.com/photo-1541643600914-78b084683702?auto=format&fit=crop&w=800&q=80"], stock:  6, active: true, category: "main_surprise", audience: "for_her", vibes: ["luxury"],           tags: [] },
  ],
  sweet_pick: [
    { id: "p4", title: "Signature Soy Candle",  description: "Warm amber — an evening-in feeling.",                         normalPrice: 2800, boxPrice: 2200, images: ["https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80"], stock: 25, active: true, category: "sweet_pick",    audience: "neutral",  vibes: ["cozy","romantic"],  tags: [] },
    { id: "p5", title: "Rose Quartz Roller",    description: "Cooling, soothing and visually stunning.",                    normalPrice: 3100, boxPrice: 2500, images: ["https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80"], stock: 18, active: true, category: "sweet_pick",    audience: "for_her",  vibes: ["cozy","soft"],      tags: [] },
    { id: "p6", title: "Cashmere Eye Mask",     description: "The luxury sleep essential they always wanted.",               normalPrice: 2600, boxPrice: 2100, images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80"], stock: 14, active: true, category: "sweet_pick",    audience: "for_her",  vibes: ["cozy","luxury"],    tags: [] },
  ],
  tiny_extra: [
    { id: "p7", title: "Artisan Chocolate Box", description: "Hand-crafted truffles tucked inside tissue paper.",           normalPrice: 1800, boxPrice: 1400, images: ["https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80"], stock: 30, active: true, category: "tiny_extra",    audience: "neutral",  vibes: ["cute","cozy"],      tags: [] },
    { id: "p8", title: "Plush Teddy Bear",      description: "Soft, huggable and impossibly cute.",                         normalPrice: 2200, boxPrice: 1800, images: ["https://images.unsplash.com/photo-1563901935883-cb61f5d49be4?auto=format&fit=crop&w=800&q=80"], stock: 20, active: true, category: "tiny_extra",    audience: "for_her",  vibes: ["cute","soft"],      tags: [] },
    { id: "p11", title: "Gold Foil Card",       description: "A luxurious finishing touch to complete the story.",          normalPrice:  600, boxPrice:  400, images: ["https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=800&q=80"], stock: 50, active: true, category: "tiny_extra",    audience: "neutral",  vibes: ["romantic"],         tags: [] },
  ],
  lucky_bonus: [],
};

type Step = "main_surprise" | "sweet_pick" | "tiny_extra" | "message" | "spin" | "review";
const STEPS: Step[] = ["main_surprise", "sweet_pick", "tiny_extra", "message", "spin", "review"];

const STEP_CONFIG: Record<Step, { label: string; eyebrow: string; title: string; subtitle: string; accent: string; bg: string }> = {
  main_surprise: {
    label: "Main Surprise", eyebrow: "Step 1 of 3",
    title: "The centerpiece.",
    subtitle: "Choose the hero item that will make their breath catch.",
    accent: "#FF2D78",
    bg: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,45,120,0.12) 0%, transparent 70%)",
  },
  sweet_pick: {
    label: "Sweet Pick", eyebrow: "Step 2 of 3",
    title: "Something sweet.",
    subtitle: "Add warmth. The piece that softens everything.",
    accent: "#7C3AED",
    bg: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 70%)",
  },
  tiny_extra: {
    label: "Tiny Extra", eyebrow: "Step 3 of 3",
    title: "The finishing whisper.",
    subtitle: "It's the tiny things that make someone feel truly seen.",
    accent: "#F5A623",
    bg: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(245,166,35,0.12) 0%, transparent 70%)",
  },
  message: {
    label: "Gift Message", eyebrow: "Almost done",
    title: "Write from the heart.",
    subtitle: "They'll find this inside the box. Make it count.",
    accent: "#FF2D78",
    bg: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,45,120,0.08) 0%, transparent 70%)",
  },
  spin: {
    label: "Lucky Spin", eyebrow: "Your reward",
    title: "Spin the wheel.",
    subtitle: "Every order wins. Spin for your exclusive reward.",
    accent: "#FFD700",
    bg: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,215,0,0.12) 0%, transparent 70%)",
  },
  review: {
    label: "Review", eyebrow: "Final step",
    title: "Your gift is ready.",
    subtitle: "Everything's in place. Review and checkout.",
    accent: "#10B981",
    bg: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16,185,129,0.10) 0%, transparent 70%)",
  },
};

// ─── Left Panel — Gift Composition Preview ────────────────────────────────────

function GiftPreviewPanel({
  selections, giftMessage, recipientName, spinReward, subtotal, currentStep,
}: {
  selections: Partial<Record<ProductCategory, Product>>;
  giftMessage: string;
  recipientName: string;
  spinReward: SpinReward | null;
  subtotal: number;
  currentStep: Step;
}) {
  const config = STEP_CONFIG[currentStep];
  const slots = [
    { key: "main_surprise" as ProductCategory, label: "Main Surprise", emoji: "🎁" },
    { key: "sweet_pick" as ProductCategory,    label: "Sweet Pick",    emoji: "🍬" },
    { key: "tiny_extra" as ProductCategory,    label: "Tiny Extra",    emoji: "✨" },
  ];

  return (
    <div className="relative h-full flex flex-col justify-between p-8 overflow-hidden">
      {/* Dynamic background glow */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          style={{ background: config.bg }}
        />
      </AnimatePresence>

      {/* Header */}
      <div className="relative z-10">
        <Link href="/" className="font-display text-xl font-bold text-white block mb-10">
          gamif<span style={{ color: config.accent }}>.</span>
        </Link>

        <AnimatePresence mode="wait">
          <motion.div key={currentStep + "-info"}
            initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: ease.expo }}>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] mb-2" style={{ color: config.accent }}>
              {config.eyebrow}
            </p>
            <h2 className="font-display text-4xl font-bold text-white leading-tight mb-1">{config.title}</h2>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slot composition */}
      <div className="relative z-10 flex-1 flex flex-col justify-center gap-3 my-6">
        {slots.map((slot, i) => {
          const product = selections[slot.key];
          const isActive = currentStep === slot.key;
          return (
            <motion.div
              key={slot.key}
              className="relative flex items-center gap-4 rounded-2xl p-3 transition-all"
              style={{
                background: product ? "rgba(255,255,255,0.05)" : isActive ? `${config.accent}12` : "rgba(255,255,255,0.02)",
                border: product ? "1px solid rgba(255,255,255,0.1)" : isActive ? `1px solid ${config.accent}40` : "1px solid rgba(255,255,255,0.05)",
                boxShadow: product ? "0 8px 24px rgba(0,0,0,0.3)" : isActive ? `0 0 24px ${config.accent}20` : "none",
              }}
              animate={isActive && !product ? {
                boxShadow: [`0 0 16px ${config.accent}10`, `0 0 28px ${config.accent}25`, `0 0 16px ${config.accent}10`],
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}>

              <AnimatePresence mode="wait">
                {product ? (
                  <motion.div key="filled" className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0"
                    initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={springs.bouncy}>
                    <Image src={product.images[0]} alt={product.title} fill className="object-cover" sizes="56px" />
                    <div className="absolute inset-0 flex items-center justify-center"
                      style={{ background: "rgba(16,185,129,0.3)" }}>
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="empty"
                    className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 text-xl"
                    style={{ background: isActive ? `${config.accent}15` : "rgba(255,255,255,0.03)", border: `1px solid ${isActive ? config.accent + "30" : "rgba(255,255,255,0.06)"}` }}
                    animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}>
                    {slot.emoji}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex-1 min-w-0">
                <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.18em]">{slot.label}</p>
                {product ? (
                  <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    className="text-white font-bold text-sm truncate">{product.title}</motion.p>
                ) : (
                  <p className="text-white/20 text-xs">{isActive ? "Selecting..." : "Not chosen yet"}</p>
                )}
              </div>

              {product && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-white font-black text-sm shrink-0">
                  {formatGELSimple(product.boxPrice)}
                </motion.p>
              )}
            </motion.div>
          );
        })}

        {/* Message preview */}
        <AnimatePresence>
          {(giftMessage || recipientName) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-start gap-3 rounded-2xl p-3 overflow-hidden"
              style={{ background: "rgba(255,45,120,0.07)", border: "1px solid rgba(255,45,120,0.15)" }}>
              <span className="text-lg shrink-0 mt-0.5">💌</span>
              <div className="min-w-0">
                {recipientName && <p className="text-white/40 text-xs">To: <span className="text-white font-bold">{recipientName}</span></p>}
                {giftMessage && <p className="text-white/60 text-xs italic truncate">&ldquo;{giftMessage}&rdquo;</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Spin reward */}
        <AnimatePresence>
          {spinReward && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 rounded-2xl p-3 overflow-hidden"
              style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.2)" }}>
              <span className="text-lg">🎡</span>
              <div className="flex-1">
                <p className="text-yellow-400 font-black text-xs">{spinReward.label}</p>
                <p className="text-white/30 text-[9px]">Reward applied</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pricing */}
      <div className="relative z-10">
        {subtotal > 0 && (
          <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex justify-between text-sm text-white/30 mb-1">
              <span>Box total</span>
              <span>{formatGELSimple(subtotal)}</span>
            </div>
            <div className="flex justify-between font-black text-white text-lg">
              <span>Est. with shipping</span>
              <span>{formatGELSimple(subtotal + 500)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Product Spotlight Card ───────────────────────────────────────────────────

function SpotlightCard({
  product, isSelected, onSelect, accent,
}: {
  product: Product;
  isSelected: boolean;
  onSelect: () => void;
  accent: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="group relative overflow-hidden rounded-2xl cursor-pointer"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onSelect}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={springs.bouncy}
      style={{
        border: isSelected ? `1.5px solid ${accent}` : "1.5px solid rgba(255,255,255,0.07)",
        boxShadow: isSelected ? `0 0 40px ${accent}30, 0 20px 60px rgba(0,0,0,0.5)` : "0 8px 32px rgba(0,0,0,0.4)",
        background: isSelected ? `${accent}08` : "rgba(255,255,255,0.025)",
      }}>

      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image src={product.images[0]} alt={product.title} fill
          className={`object-cover transition-transform duration-700 ${hovered ? "scale-108" : "scale-100"}`}
          sizes="(max-width:768px) 100vw, 50vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Selected overlay */}
        <AnimatePresence>
          {isSelected && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: `${accent}18` }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={springs.bouncy}
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: accent, boxShadow: `0 0 40px ${accent}60` }}>
                <Check className="w-8 h-8 text-white" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hover CTA */}
        <AnimatePresence>
          {hovered && !isSelected && (
            <motion.div
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-x-0 bottom-0 p-4">
              <div className="w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white text-center"
                style={{ background: `linear-gradient(135deg, ${accent}, ${accent}99)` }}>
                Select this item
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info */}
      <div className="p-5">
        <div className="flex gap-1.5 mb-2.5">
          {product.vibes.slice(0, 2).map(v => (
            <span key={v} className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ color: accent, background: `${accent}15` }}>{v}</span>
          ))}
        </div>
        <h3 className="font-bold text-base text-white mb-0.5 leading-snug">{product.title}</h3>
        <p className="text-white/35 text-xs mb-3 line-clamp-1">{product.description}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-white font-black text-lg">{formatGELSimple(product.boxPrice)}</span>
          <span className="text-white/25 text-xs line-through">{formatGELSimple(product.normalPrice)}</span>
          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full text-white ml-auto"
            style={{ background: "linear-gradient(135deg, #FF2D78, #7C3AED)" }}>Box</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Message Step ─────────────────────────────────────────────────────────────

function MessageStep({ message, setMessage, recipientName, setRecipientName, accent }: {
  message: string; setMessage: (v: string) => void;
  recipientName: string; setRecipientName: (v: string) => void;
  accent: string;
}) {
  const SUGGESTIONS = [
    "You make every day brighter 💛",
    "Just because you deserve it 🌸",
    "No reason needed — you're simply the best ✨",
    "Hope this makes you smile as much as you make me 💕",
  ];

  const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.09)",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <label className="block text-[10px] font-black uppercase tracking-[0.22em] text-white/30 mb-2">For</label>
        <input type="text" value={recipientName} onChange={e => setRecipientName(e.target.value)}
          placeholder="Their name (optional)" maxLength={40}
          className="w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/20"
          style={inputStyle}
          onFocus={e => { e.target.style.borderColor = accent; e.target.style.boxShadow = `0 0 0 3px ${accent}18`; }}
          onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.09)"; e.target.style.boxShadow = "none"; }}
        />
      </div>

      <div>
        <label className="block text-[10px] font-black uppercase tracking-[0.22em] text-white/30 mb-2">Message</label>
        <div className="relative">
          <textarea value={message} onChange={e => setMessage(e.target.value)}
            placeholder="What do you want them to feel when they open this?" maxLength={240} rows={5}
            className="w-full rounded-xl px-4 py-4 text-sm text-white placeholder-white/20 resize-none"
            style={inputStyle}
            onFocus={e => { e.target.style.borderColor = accent; e.target.style.boxShadow = `0 0 0 3px ${accent}18`; }}
            onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.09)"; e.target.style.boxShadow = "none"; }}
          />
          <span className="absolute bottom-3 right-4 text-white/20 text-[10px] tabular-nums">{message.length}/240</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map(s => (
          <button key={s} onClick={() => setMessage(s)}
            className="text-xs px-3 py-2 rounded-lg text-white/35 hover:text-white transition-all text-left"
            style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.025)" }}>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Review Panel ─────────────────────────────────────────────────────────────

function ReviewPanel({ selections, spinReward, subtotal, sessionToken, giftMessage, recipientName }: {
  selections: Partial<Record<ProductCategory, Product>>;
  spinReward: SpinReward | null;
  subtotal: number;
  sessionToken: string;
  giftMessage: string;
  recipientName: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shipping = spinReward?.type === "free_shipping" ? 0 : 500;
  const discountRate = spinReward?.type === "discount_code" && spinReward.value ? parseFloat(String(spinReward.value)) / 100 : 0;
  const discount = spinReward?.type === "free_tiny_gift" ? (selections.tiny_extra?.boxPrice ?? 0) : Math.round(subtotal * discountRate);
  const total = subtotal - discount + shipping;

  async function checkout() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken, giftMessage, recipientName }) });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError(data.error ?? "Checkout unavailable.");
    } catch { setError("Something went wrong."); }
    finally { setLoading(false); }
  }

  return (
    <div className="max-w-xl space-y-4">
      {BOX_SLOTS.map(slot => {
        const product = selections[slot.category as ProductCategory];
        return (
          <div key={slot.id} className="flex items-center gap-4 rounded-2xl p-4"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            {product ? (
              <>
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10">
                  <Image src={product.images[0]} alt={product.title} fill className="object-cover" sizes="64px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-0.5">{slot.label}</p>
                  <p className="text-white font-bold text-sm truncate">{product.title}</p>
                </div>
                <p className="text-white font-black text-sm shrink-0">{formatGELSimple(product.boxPrice)}</p>
              </>
            ) : (
              <p className="text-white/25 text-sm">{slot.label} — not chosen</p>
            )}
          </div>
        );
      })}

      {spinReward && (
        <div className="flex items-center gap-3 rounded-2xl p-4"
          style={{ background: "rgba(255,215,0,0.07)", border: "1px solid rgba(255,215,0,0.2)" }}>
          <span>🎡</span>
          <p className="text-yellow-400 font-black text-sm flex-1">{spinReward.label}</p>
          {discount > 0 && <p className="text-yellow-400 font-black text-sm">-{formatGELSimple(discount)}</p>}
          {spinReward.type === "free_shipping" && <p className="text-emerald-400 font-black text-sm">Free!</p>}
        </div>
      )}

      <div className="rounded-2xl p-5 space-y-3"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex justify-between text-sm text-white/40"><span>Subtotal</span><span>{formatGELSimple(subtotal)}</span></div>
        {discount > 0 && <div className="flex justify-between text-sm text-emerald-400"><span>Discount</span><span>-{formatGELSimple(discount)}</span></div>}
        <div className="flex justify-between text-sm text-white/40">
          <span>Shipping</span>
          <span>{spinReward?.type === "free_shipping" ? "Free 🎉" : formatGELSimple(shipping)}</span>
        </div>
        <div className="flex justify-between font-black text-white text-2xl border-t border-white/8 pt-3">
          <span>Total</span><span>{formatGELSimple(total)}</span>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm font-bold text-center">{error}</p>}

      <motion.button onClick={checkout} disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        className="w-full py-5 rounded-2xl text-base font-black uppercase tracking-wider text-white flex items-center justify-center gap-3"
        style={{ background: "linear-gradient(135deg, #10B981, #059669)", boxShadow: "0 0 40px rgba(16,185,129,0.3)" }}>
        {loading
          ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <><Zap className="w-5 h-5" /> Checkout — {formatGELSimple(total)}</>}
      </motion.button>

      <p className="text-center text-white/20 text-xs">🔒 Secure · Gift-wrapped · Delivered in Georgia</p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BuildABoxPage() {
  const [stepIndex, setStepIndex]       = useState(0);
  const [selections, setSelections]     = useState<Partial<Record<ProductCategory, Product>>>({});
  const [products, setProducts]         = useState<Record<ProductCategory, Product[]>>(DEMO);
  const [loading, setLoading]           = useState(true);
  const [sessionToken, setSessionToken] = useState("");
  const [spinReward, setSpinReward]     = useState<SpinReward | null>(null);
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [giftMessage, setGiftMessage]   = useState("");
  const [recipientName, setRecipientName] = useState("");
  const prevStepRef = useRef(stepIndex);

  const cartItems = useCartStore((s) => s.items);
  const cartCount = cartItems.reduce((n, i) => n + i.quantity, 0);
  const openMiniCart = useUIStore((s) => s.openMiniCart);

  const currentStep = STEPS[stepIndex];
  const config      = STEP_CONFIG[currentStep];
  const direction   = stepIndex > prevStepRef.current ? 1 : -1;

  useEffect(() => { prevStepRef.current = stepIndex; }, [stepIndex]);

  useEffect(() => {
    const saved = localStorage.getItem("box_session_token");
    if (saved) setSessionToken(saved);
    fetch("/api/products")
      .then(r => r.ok ? r.json() : { products: [] })
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

  const ensureSession = useCallback(async () => {
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

  function canAdvance() {
    if (currentStep === "main_surprise") return !!selections.main_surprise;
    if (currentStep === "sweet_pick")    return !!selections.sweet_pick;
    if (currentStep === "tiny_extra")    return !!selections.tiny_extra;
    if (currentStep === "spin")          return !!spinReward;
    return true;
  }

  function advance() {
    if (currentStep === "message") { setShowSpinWheel(true); return; }
    if (stepIndex < STEPS.length - 1) setStepIndex(i => i + 1);
  }

  function handleRewardReceived(reward: SpinReward) {
    setSpinReward(reward);
    setShowSpinWheel(false);
    setStepIndex(STEPS.indexOf("review"));
  }

  const subtotal    = useMemo(() => Object.values(selections).reduce((s, p) => s + (p?.boxPrice ?? 0), 0), [selections]);
  const filledCount = Object.values(selections).filter(Boolean).length;
  const isProductStep = currentStep === "main_surprise" || currentStep === "sweet_pick" || currentStep === "tiny_extra";

  return (
    <div className="relative min-h-screen" style={{ background: "#050508" }}>
      {/* Full-bleed ambient */}
      <AnimatePresence mode="wait">
        <motion.div key={currentStep} className="fixed inset-0 pointer-events-none"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          style={{ background: config.bg, zIndex: 0 }} />
      </AnimatePresence>

      {/* Mobile nav */}
      <nav className="relative z-50 flex items-center justify-between px-5 py-4 border-b border-white/6 lg:hidden"
        style={{ background: "rgba(5,5,8,0.9)", backdropFilter: "blur(20px)" }}>
        <Link href="/shop" className="text-white/40 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Link href="/" className="font-display text-xl font-bold text-white">
          gamif<span style={{ color: config.accent }}>.</span>
        </Link>
        <button onClick={openMiniCart} className="relative text-white/40 hover:text-white transition-colors">
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 text-[9px] font-black rounded-full flex items-center justify-center text-white"
              style={{ background: config.accent }}>{cartCount}</span>
          )}
        </button>
      </nav>

      {/* Desktop: split layout */}
      <div className="relative z-10 lg:grid lg:grid-cols-[420px_1fr] lg:min-h-screen">

        {/* LEFT PANEL — sticky */}
        <div className="hidden lg:block">
          <div className="sticky top-0 h-screen border-r border-white/6"
            style={{ background: "rgba(5,5,8,0.6)", backdropFilter: "blur(24px)" }}>
            <GiftPreviewPanel
              selections={selections}
              giftMessage={giftMessage}
              recipientName={recipientName}
              spinReward={spinReward}
              subtotal={subtotal}
              currentStep={currentStep}
            />
          </div>
        </div>

        {/* RIGHT PANEL — scrollable content */}
        <div className="min-h-screen flex flex-col">
          {/* Step header */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep + "-hdr"}
              className="px-6 sm:px-10 pt-16 pb-8"
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.55, ease: ease.expo }}>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] mb-3" style={{ color: config.accent }}>
                {config.eyebrow}
              </p>
              <h1 className="font-display font-bold text-white leading-[0.9] mb-3"
                style={{ fontSize: "clamp(3rem, 7vw, 6rem)" }}>
                {config.title}
              </h1>
              <p className="text-white/40 text-base leading-relaxed max-w-sm">{config.subtitle}</p>
            </motion.div>
          </AnimatePresence>

          {/* Step content */}
          <div className="flex-1 px-6 sm:px-10 pb-40">
            <AnimatePresence mode="wait" custom={direction}>
              {isProductStep && (
                <motion.div
                  key={currentStep}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 60, filter: "blur(8px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -direction * 60, filter: "blur(8px)" }}
                  transition={{ duration: 0.5, ease: ease.expo }}>
                  {loading ? (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[1,2,3].map(i => <div key={i} className="aspect-[4/3] rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />)}
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {(products[currentStep as ProductCategory] ?? []).map(product => (
                        <SpotlightCard
                          key={product.id}
                          product={product}
                          isSelected={selections[currentStep as ProductCategory]?.id === product.id}
                          onSelect={() => selectProduct(product)}
                          accent={config.accent}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {currentStep === "message" && (
                <motion.div key="message"
                  initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: ease.expo }}>
                  <MessageStep
                    message={giftMessage} setMessage={setGiftMessage}
                    recipientName={recipientName} setRecipientName={setRecipientName}
                    accent={config.accent}
                  />
                </motion.div>
              )}

              {currentStep === "spin" && (
                <motion.div key="spin" className="text-center py-16"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: ease.expo }}>
                  {spinReward ? (
                    <div className="space-y-5">
                      <div className="text-7xl mb-4">🎉</div>
                      <h2 className="font-display text-4xl font-bold text-white">{spinReward.label}</h2>
                      <p className="text-white/40">Applied to your order automatically.</p>
                      <button onClick={() => setStepIndex(STEPS.indexOf("review"))}
                        className="px-8 py-4 rounded-full text-sm font-black uppercase tracking-wider text-white mt-6 inline-flex items-center gap-2"
                        style={{ background: "linear-gradient(135deg, #FF2D78, #7C3AED)" }}>
                        Review Order <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6 max-w-sm mx-auto">
                      <motion.div className="text-8xl" animate={{ rotate: [0, 360] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }}>🎡</motion.div>
                      <h2 className="font-display text-4xl font-bold text-white">Your box is complete.</h2>
                      <p className="text-white/40 text-lg leading-relaxed">Spin for a reward — free gifts, discounts, or a surprise upgrade.</p>
                      <button onClick={() => setShowSpinWheel(true)}
                        className="px-10 py-5 rounded-full text-base font-black uppercase tracking-wider text-white inline-flex items-center gap-3"
                        style={{ background: "linear-gradient(135deg, #FFD700, #F5A623)", color: "#0A0A12", boxShadow: "0 0 40px rgba(255,215,0,0.4)" }}>
                        <Zap className="w-5 h-5" /> Spin the Wheel
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {currentStep === "review" && (
                <motion.div key="review"
                  initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: ease.expo }}>
                  <ReviewPanel selections={selections} spinReward={spinReward} subtotal={subtotal}
                    sessionToken={sessionToken} giftMessage={giftMessage} recipientName={recipientName} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      {currentStep !== "review" && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 safe-bottom">
          <motion.div
            className="max-w-5xl mx-auto lg:ml-[420px] rounded-2xl px-5 py-4 flex items-center gap-4"
            style={{ background: "rgba(5,5,8,0.95)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 -8px 48px rgba(0,0,0,0.6)" }}
            initial={{ y: 80 }} animate={{ y: 0 }} transition={springs.gentle}>
            <div className="flex-1 min-w-0">
              {subtotal > 0 && (
                <p className="text-white font-bold text-sm">
                  Box: <span style={{ color: config.accent }}>{formatGELSimple(subtotal)}</span>
                </p>
              )}
              <p className="text-white/30 text-xs">
                {filledCount === 3
                  ? currentStep === "message" ? "Add a message or skip" : "Almost there"
                  : `${3 - filledCount} item${3 - filledCount !== 1 ? "s" : ""} left to choose`}
              </p>
            </div>

            <motion.button onClick={advance} disabled={!canAdvance()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-wider shrink-0 text-white transition-all"
              style={canAdvance()
                ? { background: `linear-gradient(135deg, ${config.accent}, ${config.accent}99)`, boxShadow: `0 0 24px ${config.accent}40` }
                : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.2)", cursor: "not-allowed" }}
              whileHover={canAdvance() ? { scale: 1.04 } : {}}
              whileTap={canAdvance() ? { scale: 0.96 } : {}}>
              {currentStep === "message" ? <><Sparkles className="w-4 h-4" /> Spin!</>
                : currentStep === "spin" && spinReward ? <><ArrowRight className="w-4 h-4" /> Review</>
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
            if (spinReward) setStepIndex(STEPS.indexOf("review"));
          }}
        />
      )}
    </div>
  );
}
