"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useAnimate } from "framer-motion";
import { ArrowRight, Check, Gift, Lock, MessageSquare, ShoppingCart, Sparkles, Zap } from "lucide-react";
import LuckySpinWheel from "@/components/LuckySpinWheel";
import AmbientBg from "@/components/AmbientBg";
import { type Product, type ProductCategory, type SpinReward, BOX_SLOTS, formatGELSimple } from "@/lib/types";
import { springs, ease } from "@/lib/motion";
import { useCartStore } from "@/lib/stores/cart";
import { useUIStore } from "@/lib/stores/ui";

// ─── Demo products ────────────────────────────────────────────────────────────

const DEMO: Record<ProductCategory, Product[]> = {
  main_surprise: [
    { id: "p1", title: "Preserved Rose Box",   description: "Velvet-toned roses for a breathtaking reveal.",        normalPrice: 4900, boxPrice: 3900, images: ["https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=600&q=80"], stock: 12, active: true, category: "main_surprise", audience: "for_her", vibes: ["romantic","luxury"],    tags: [] },
    { id: "p2", title: "Gold Initial Necklace", description: "A personal keepsake chosen just for them.",            normalPrice: 5900, boxPrice: 4800, images: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"], stock:  8, active: true, category: "main_surprise", audience: "for_her", vibes: ["luxury","aesthetic"], tags: [] },
    { id: "p3", title: "Crystal Perfume",       description: "A luxury fragrance in a hand-crafted bottle.",         normalPrice: 6500, boxPrice: 5200, images: ["https://images.unsplash.com/photo-1541643600914-78b084683702?auto=format&fit=crop&w=600&q=80"], stock:  6, active: true, category: "main_surprise", audience: "for_her", vibes: ["luxury"],           tags: [] },
  ],
  sweet_pick: [
    { id: "p4", title: "Signature Soy Candle",  description: "Warm amber — an evening-in feeling.",                  normalPrice: 2800, boxPrice: 2200, images: ["https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80"], stock: 25, active: true, category: "sweet_pick",    audience: "neutral",  vibes: ["cozy","romantic"],  tags: [] },
    { id: "p5", title: "Rose Quartz Roller",    description: "Cooling, soothing and visually stunning.",             normalPrice: 3100, boxPrice: 2500, images: ["https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=600&q=80"], stock: 18, active: true, category: "sweet_pick",    audience: "for_her",  vibes: ["cozy","soft"],      tags: [] },
    { id: "p6", title: "Cashmere Eye Mask",     description: "The luxury sleep essential they always wanted.",        normalPrice: 2600, boxPrice: 2100, images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80"], stock: 14, active: true, category: "sweet_pick",    audience: "for_her",  vibes: ["cozy","luxury"],    tags: [] },
  ],
  tiny_extra: [
    { id: "p7", title: "Artisan Chocolate Box", description: "Hand-crafted truffles tucked inside tissue paper.",    normalPrice: 1800, boxPrice: 1400, images: ["https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80"], stock: 30, active: true, category: "tiny_extra",    audience: "neutral",  vibes: ["cute","cozy"],      tags: [] },
    { id: "p8", title: "Plush Teddy Bear",      description: "Soft, huggable and impossibly cute.",                  normalPrice: 2200, boxPrice: 1800, images: ["https://images.unsplash.com/photo-1563901935883-cb61f5d49be4?auto=format&fit=crop&w=600&q=80"], stock: 20, active: true, category: "tiny_extra",    audience: "for_her",  vibes: ["cute","soft"],      tags: [] },
    { id: "p11", title: "Gold Foil Card",       description: "A luxurious finishing touch to complete the story.",   normalPrice:  600, boxPrice:  400, images: ["https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=600&q=80"], stock: 50, active: true, category: "tiny_extra",    audience: "neutral",  vibes: ["romantic"],         tags: [] },
  ],
  lucky_bonus: [],
};

type Step = "main_surprise" | "sweet_pick" | "tiny_extra" | "message" | "spin" | "review";
const STEPS: Step[] = ["main_surprise", "sweet_pick", "tiny_extra", "message", "spin", "review"];

const STEP_META: Record<string, { emoji: string; title: string; subtitle: string; ambient: "rose" | "violet" | "gold" | "default" }> = {
  main_surprise: { emoji: "🎁", title: "The Star of the Show", subtitle: "Every unforgettable gift begins with one hero piece.", ambient: "rose" },
  sweet_pick:    { emoji: "🍬", title: "Something Sweet",      subtitle: "Add something warm that makes them smile.",            ambient: "violet" },
  tiny_extra:    { emoji: "✨", title: "The Finishing Touch",   subtitle: "It's the little things that make them feel seen.",     ambient: "gold" },
  message:       { emoji: "💌", title: "Write from the Heart", subtitle: "They'll open this with the box. Make it count.",       ambient: "rose" },
  spin:          { emoji: "🎡", title: "Your Reward Awaits",   subtitle: "Spin the wheel for an exclusive gift or discount.",    ambient: "gold" },
  review:        { emoji: "🎀", title: "Your Gift is Ready",   subtitle: "Review everything before we wrap it beautifully.",    ambient: "default" },
};

// ─── Builder Product Card ─────────────────────────────────────────────────────

function BuilderCard({
  product, isSelected, onSelect,
}: {
  product: Product;
  isSelected: boolean;
  onSelect: (p: Product) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [justSelected, setJustSelected] = useState(false);

  function handleSelect() {
    if (isSelected || !product.active) return;
    onSelect(product);
    setJustSelected(true);
    setTimeout(() => setJustSelected(false), 1800);
  }

  const selected = isSelected || justSelected;

  return (
    <motion.div
      className="group relative rounded-3xl overflow-hidden cursor-pointer"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={handleSelect}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={selected ? {} : { y: -6, scale: 1.02 }}
      whileTap={selected ? {} : { scale: 0.97 }}
      transition={springs.bouncy}
      style={{
        border: selected
          ? "2px solid rgba(16,185,129,0.6)"
          : hovered
          ? "2px solid rgba(255,45,120,0.4)"
          : "2px solid rgba(255,255,255,0.07)",
        boxShadow: selected
          ? "0 0 40px rgba(16,185,129,0.25), 0 16px 48px rgba(0,0,0,0.5)"
          : hovered
          ? "0 0 40px rgba(255,45,120,0.2), 0 20px 56px rgba(0,0,0,0.5)"
          : "0 8px 32px rgba(0,0,0,0.4)",
        background: selected ? "rgba(16,185,129,0.05)" : "rgba(255,255,255,0.03)",
      }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={product.images[0]}
          alt={product.title}
          fill
          className={`object-cover transition-all duration-700 ${hovered && !selected ? "scale-110" : "scale-100"}`}
          sizes="(max-width:768px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Selected overlay */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: "rgba(16,185,129,0.18)" }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={springs.bouncy}
                className="w-14 h-14 bg-emerald rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.6)]"
              >
                <Check className="w-7 h-7 text-white" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vibe tags */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          {product.vibes.slice(0, 1).map(v => (
            <span key={v} className="text-[9px] font-black uppercase tracking-wider text-violet-2 px-2 py-0.5 rounded-full"
              style={{ background: "rgba(124,58,237,0.25)", backdropFilter: "blur(8px)" }}>
              {v}
            </span>
          ))}
        </div>

        {/* Select CTA */}
        <AnimatePresence>
          {hovered && !selected && (
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-0 left-0 right-0 p-3"
            >
              <div className="btn-dopamine w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
                <Sparkles className="w-3.5 h-3.5" /> Select — {formatGELSimple(product.boxPrice)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className={`font-bold text-sm leading-snug mb-1 transition-colors ${selected ? "text-emerald" : "text-white"}`}>
          {product.title}
        </h3>
        <p className="text-white/35 text-xs line-clamp-1 mb-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-white font-black text-sm">{formatGELSimple(product.boxPrice)}</span>
            <span className="box-price-badge text-[8px] px-1.5 py-0.5"><Sparkles className="w-2 h-2" /></span>
          </div>
          <span className="text-white/25 text-xs line-through">{formatGELSimple(product.normalPrice)}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Box Slot Preview ─────────────────────────────────────────────────────────

function BoxSlotCard({
  slot, selection, isCurrent,
}: {
  slot: { id: string; category: string; label: string; emoji: string };
  selection?: Product;
  isCurrent: boolean;
}) {
  const [scope, animate] = useAnimate();
  const selId = selection?.id;

  useEffect(() => {
    if (selId && scope.current) {
      animate(scope.current, { scale: [1.15, 0.95, 1.04, 1] }, { duration: 0.55, ease: [0.34, 1.56, 0.64, 1] });
    }
  }, [selId, animate, scope]);

  return (
    <motion.div
      ref={scope}
      className="relative aspect-square rounded-2xl overflow-hidden"
      style={{
        border: isCurrent ? "2px solid rgba(255,45,120,0.7)" : selection ? "2px solid rgba(16,185,129,0.5)" : "2px solid rgba(255,255,255,0.07)",
        boxShadow: isCurrent ? "0 0 24px rgba(255,45,120,0.35), inset 0 0 24px rgba(255,45,120,0.05)" : selection ? "0 0 16px rgba(16,185,129,0.2)" : "none",
      }}
    >
      <AnimatePresence mode="wait">
        {selection ? (
          <motion.div key="filled" className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.2 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: ease.expo }}>
            <Image src={selection.images[0]} alt={selection.title} fill className="object-cover" sizes="120px" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-2 left-2 right-2">
              <p className="text-white text-[9px] font-bold truncate leading-tight">{selection.title}</p>
              <p className="text-accent text-[9px] font-black">{formatGELSimple(selection.boxPrice)}</p>
            </div>
            <motion.div
              className="absolute top-1.5 right-1.5 w-5 h-5 bg-emerald rounded-full flex items-center justify-center"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={springs.bouncy}
            >
              <Check className="w-3 h-3 text-white" />
            </motion.div>
          </motion.div>
        ) : (
          <motion.div key="empty" className="absolute inset-0 flex flex-col items-center justify-center gap-1.5"
            style={{ background: isCurrent ? "rgba(255,45,120,0.07)" : "rgba(14,14,26,0.8)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div
              className="text-2xl"
              animate={isCurrent ? { y: [0, -4, 0], scale: [1, 1.12, 1] } : {}}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              {isCurrent ? slot.emoji : <Lock className="w-4 h-4 text-white/15" />}
            </motion.div>
            {isCurrent && (
              <p className="text-[8px] font-black uppercase tracking-wider text-white/50">{slot.label}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Gift Message Step ────────────────────────────────────────────────────────

function GiftMessageStep({ message, setMessage, recipientName, setRecipientName }: {
  message: string; setMessage: (v: string) => void;
  recipientName: string; setRecipientName: (v: string) => void;
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
      className="max-w-xl mx-auto space-y-6"
      initial={{ opacity: 0, y: 32, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.55, ease: ease.expo }}
    >
      {/* Recipient name */}
      <div>
        <label className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35 mb-2 block">For</label>
        <input
          type="text" placeholder="Their name (optional)" value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)} maxLength={40}
          className="w-full rounded-2xl px-4 py-3.5 text-sm font-medium outline-none text-white placeholder-white/25 transition-all"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
          onFocus={e => { e.target.style.borderColor = "rgba(255,45,120,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(255,45,120,0.10)"; }}
          onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.10)"; e.target.style.boxShadow = "none"; }}
        />
      </div>

      {/* Message */}
      <div>
        <label className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35 mb-2 block">Your message</label>
        <div className="relative">
          <textarea
            placeholder="Write your message here..." value={message}
            onChange={(e) => setMessage(e.target.value)} maxLength={240} rows={4}
            className="w-full rounded-2xl px-4 py-4 text-sm font-medium outline-none text-white placeholder-white/25 resize-none transition-all"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
            onFocus={e => { e.target.style.borderColor = "rgba(255,45,120,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(255,45,120,0.10)"; }}
            onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.10)"; e.target.style.boxShadow = "none"; }}
          />
          <span className="absolute bottom-3 right-4 text-white/20 text-xs tabular-nums">{message.length}/240</span>
        </div>
      </div>

      {/* Suggestions */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25 mb-3">Inspiration</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <motion.button key={s} onClick={() => setMessage(s)}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="text-xs px-3 py-2 rounded-xl text-white/40 hover:text-white transition-all text-left"
              style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
              {s}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Live preview */}
      <AnimatePresence>
        {(message || recipientName) && (
          <motion.div
            className="relative rounded-3xl p-6 overflow-hidden"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            style={{ background: "linear-gradient(135deg, rgba(255,45,120,0.09) 0%, rgba(124,58,237,0.09) 100%)", border: "1px solid rgba(255,45,120,0.18)" }}
          >
            <div className="absolute top-4 right-4 text-xl opacity-30">💌</div>
            {recipientName && <p className="text-white/40 text-sm mb-2">To: <span className="text-white font-bold">{recipientName}</span></p>}
            {message && <p className="text-white/75 text-sm leading-relaxed italic">&ldquo;{message}&rdquo;</p>}
            <p className="text-white/25 text-xs mt-3">— with love 💗</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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
    setError(null);
    try {
      const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken, giftMessage, recipientName }) });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError(data.error ?? "Checkout unavailable. Please try again.");
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  }

  return (
    <motion.div
      className="max-w-lg mx-auto space-y-4"
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: ease.expo }}
    >
      {/* Selections */}
      <div className="space-y-3">
        {BOX_SLOTS.map((slot, i) => {
          const product = selections[slot.category as ProductCategory];
          return (
            <motion.div
              key={slot.id}
              className="flex items-center gap-4 rounded-2xl p-4"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              {product ? (
                <>
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white/10">
                    <Image src={product.images[0]} alt={product.title} fill className="object-cover" sizes="56px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/30 text-[9px] font-black uppercase tracking-widest">{slot.label}</p>
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

      {/* Gift message */}
      {(giftMessage || recipientName) && (
        <motion.div className="rounded-2xl p-4 flex items-start gap-3"
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          style={{ background: "rgba(255,45,120,0.07)", border: "1px solid rgba(255,45,120,0.18)" }}>
          <span className="text-xl mt-0.5">💌</span>
          <div>
            {recipientName && <p className="text-white/45 text-xs mb-1">To: <span className="text-white font-bold">{recipientName}</span></p>}
            {giftMessage && <p className="text-white/70 text-sm italic">&ldquo;{giftMessage}&rdquo;</p>}
          </div>
        </motion.div>
      )}

      {/* Spin reward */}
      {spinReward && (
        <motion.div className="rounded-2xl p-4 flex items-center gap-3"
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
          style={{ background: "rgba(255,215,0,0.07)", border: "1px solid rgba(255,215,0,0.25)" }}>
          <span className="text-2xl">🎡</span>
          <div className="flex-1">
            <p className="text-gold font-black text-sm">{spinReward.label}</p>
            <p className="text-white/35 text-xs">Reward applied at checkout</p>
          </div>
          {discount > 0 && <p className="text-gold font-black text-sm">-{formatGELSimple(discount)}</p>}
          {spinReward.type === "free_shipping" && <p className="text-emerald font-black text-sm">Free!</p>}
        </motion.div>
      )}

      {/* Price breakdown */}
      <div className="rounded-2xl p-5 space-y-3"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex justify-between text-sm text-white/50"><span>Box subtotal</span><span className="tabular-nums">{formatGELSimple(subtotal)}</span></div>
        {discount > 0 && <div className="flex justify-between text-sm text-emerald"><span>Reward discount</span><span className="tabular-nums">-{formatGELSimple(discount)}</span></div>}
        <div className="flex justify-between text-sm text-white/50">
          <span>Shipping</span>
          <span className={spinReward?.type === "free_shipping" ? "text-emerald font-bold" : "tabular-nums"}>
            {spinReward?.type === "free_shipping" ? "Free 🎉" : formatGELSimple(shipping)}
          </span>
        </div>
        <div className="flex justify-between font-black text-white text-xl border-t border-white/8 pt-3">
          <span>Total</span><span className="tabular-nums">{formatGELSimple(total)}</span>
        </div>
      </div>

      {error && (
        <motion.p className="text-red-400 text-sm font-bold text-center px-4 py-3 rounded-xl"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {error}
        </motion.p>
      )}

      <motion.button onClick={checkout} disabled={loading}
        className="btn-dopamine w-full py-5 rounded-2xl text-base font-black uppercase tracking-wider flex items-center justify-center gap-3"
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
        {loading
          ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <><Zap className="w-5 h-5" /> Checkout — {formatGELSimple(total)}</>}
      </motion.button>
      <p className="text-center text-white/25 text-xs">🔒 Secure checkout · GEL · Gift-wrapped</p>
    </motion.div>
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
  const direction   = stepIndex > prevStepRef.current ? 1 : -1;
  const meta        = STEP_META[currentStep];

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

  const selectProduct = useCallback(async (product: Product) => {
    const token = await ensureSession();
    const keyMap: Record<string, string> = { main_surprise: "mainSurpriseId", sweet_pick: "sweetPickId", tiny_extra: "tinyExtraId" };
    try {
      await fetch(`/api/boxes/${token}`, { method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [keyMap[product.category]]: product.id }) });
    } catch {}
    setSelections(prev => ({ ...prev, [product.category]: product }));
  }, [sessionToken]);

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

  const subtotal   = useMemo(() => Object.values(selections).reduce((s, p) => s + (p?.boxPrice ?? 0), 0), [selections]);
  const filledCount = Object.values(selections).filter(Boolean).length;
  const isProductStep = currentStep === "main_surprise" || currentStep === "sweet_pick" || currentStep === "tiny_extra";

  return (
    <div className="relative min-h-screen bg-ink pb-40">
      <AmbientBg variant={meta.ambient} />

      {/* Nav */}
      <nav className="sticky top-0 z-50 glass-dark border-b border-white/6 px-5 py-4 flex items-center justify-between">
        <Link href="/shop" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm">
          ← <span className="hidden sm:inline">Shop</span>
        </Link>
        <Link href="/" className="font-display text-xl font-bold text-white">gamif<span className="text-accent">.</span></Link>
        <div className="flex items-center gap-3">
          {subtotal > 0 && <span className="text-accent font-black text-sm hidden sm:block">{formatGELSimple(subtotal)}</span>}
          <motion.button onClick={openMiniCart} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
            className="relative w-9 h-9 glass border border-white/10 rounded-xl flex items-center justify-center text-white/50 hover:text-white transition-colors"
            aria-label="Open cart">
            <ShoppingCart className="w-4 h-4" />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span key={cartCount} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-accent text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10">

        {/* Progress bar */}
        <div className="flex items-center gap-1 mb-10 max-w-sm mx-auto">
          {BOX_SLOTS.map((slot, i) => {
            const done = !!selections[slot.category as ProductCategory];
            const active = currentStep === slot.category;
            return (
              <div key={slot.id} className="flex-1 flex items-center gap-1">
                <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${done || active ? "bg-accent" : "bg-white/10"}`} />
                {i < BOX_SLOTS.length - 1 && <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${done ? "bg-emerald" : active ? "bg-accent" : "bg-white/10"}`} />}
              </div>
            );
          })}
          <div className={`flex-1 h-1 rounded-full ml-1 transition-all duration-500 ${stepIndex >= 3 ? "bg-violet" : "bg-white/10"}`} />
          <div className={`flex-1 h-1 rounded-full ml-1 transition-all duration-500 ${spinReward ? "bg-gold" : "bg-white/10"}`} />
        </div>

        {/* Step header */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep + "-header"}
            className="text-center mb-10 sm:mb-14"
            initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -16, filter: "blur(4px)" }}
            transition={{ duration: 0.5, ease: ease.expo }}
          >
            <motion.div
              className="text-5xl mb-4"
              animate={{ y: [0, -8, 0], rotate: [0, -4, 4, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            >
              {meta.emoji}
            </motion.div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-3 leading-tight">
              {meta.title}
            </h1>
            <p className="text-white/40 text-base sm:text-lg max-w-sm mx-auto leading-relaxed">{meta.subtitle}</p>
          </motion.div>
        </AnimatePresence>

        {/* Box slot preview */}
        {isProductStep && (
          <motion.div
            className="grid grid-cols-3 gap-3 sm:gap-4 mb-10 max-w-xs sm:max-w-sm mx-auto"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            {BOX_SLOTS.map(slot => (
              <BoxSlotCard key={slot.id} slot={slot}
                selection={selections[slot.category as ProductCategory]}
                isCurrent={currentStep === slot.category} />
            ))}
          </motion.div>
        )}

        {/* Step content */}
        <AnimatePresence mode="wait" custom={direction}>
          {isProductStep && (
            <motion.div
              key={currentStep}
              custom={direction}
              initial={{ opacity: 0, x: direction * 48, filter: "blur(8px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -direction * 48, filter: "blur(8px)" }}
              transition={{ duration: 0.45, ease: ease.expo }}
            >
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="aspect-[4/3] rounded-3xl bg-white/4 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {(products[currentStep as ProductCategory] ?? []).map(product => (
                    <BuilderCard
                      key={product.id}
                      product={product}
                      isSelected={selections[currentStep as ProductCategory]?.id === product.id}
                      onSelect={selectProduct}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {currentStep === "message" && (
            <GiftMessageStep key="message"
              message={giftMessage} setMessage={setGiftMessage}
              recipientName={recipientName} setRecipientName={setRecipientName} />
          )}

          {currentStep === "spin" && (
            <motion.div key="spin" className="text-center py-12 max-w-md mx-auto"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: ease.expo }}>
              {spinReward ? (
                <div className="space-y-5">
                  <motion.div className="text-7xl" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>🎉</motion.div>
                  <h2 className="font-display text-4xl font-bold text-white">Reward Applied!</h2>
                  <p className="text-accent text-2xl font-black">{spinReward.label}</p>
                  <p className="text-white/35 text-sm">Applied automatically at checkout.</p>
                  <motion.button onClick={() => setStepIndex(STEPS.indexOf("review"))}
                    className="btn-dopamine px-8 py-4 rounded-2xl text-sm font-black inline-flex items-center gap-2"
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                    <ArrowRight className="w-4 h-4" /> Review Order
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-6">
                  <motion.div className="text-8xl" animate={{ y: [0, -14, 0], rotate: [0, 6, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>🎡</motion.div>
                  <h2 className="font-display text-4xl font-bold text-white">Your box is complete!</h2>
                  <p className="text-white/45 text-lg max-w-xs mx-auto leading-relaxed">Spin the wheel for an exclusive reward before checkout.</p>
                  <motion.button onClick={() => setShowSpinWheel(true)}
                    className="btn-dopamine px-10 py-4 rounded-2xl text-base font-black inline-flex items-center gap-3"
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
                    <Zap className="w-5 h-5" /> Spin the Wheel ✨
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}

          {currentStep === "review" && (
            <ReviewPanel key="review" selections={selections} spinReward={spinReward}
              subtotal={subtotal} sessionToken={sessionToken}
              giftMessage={giftMessage} recipientName={recipientName} />
          )}
        </AnimatePresence>
      </div>

      {/* Bottom action bar */}
      {currentStep !== "review" && (
        <div className="fixed bottom-0 left-0 right-0 z-30 p-4 safe-bottom">
          <motion.div
            className="max-w-6xl mx-auto glass-dark border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-4"
            initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={springs.gentle}
            style={{ boxShadow: "0 -8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)" }}
          >
            <div className="flex-1 min-w-0">
              {subtotal > 0 && (
                <p className="text-white font-bold text-sm mb-0.5">
                  Box: <span className="text-accent">{formatGELSimple(subtotal)}</span>
                </p>
              )}
              <p className="text-white/35 text-xs truncate">
                {filledCount === 3
                  ? spinReward ? "Ready to checkout ✨" : currentStep === "message" ? "Add a message or skip to spin" : "Spin for your reward!"
                  : `${3 - filledCount} more item${3 - filledCount !== 1 ? "s" : ""} to go`}
              </p>
            </div>
            <motion.button onClick={advance} disabled={!canAdvance()}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-wider shrink-0 transition-all ${canAdvance() ? "btn-dopamine" : "text-white/25 cursor-not-allowed"}`}
              style={!canAdvance() ? { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" } : {}}
              whileHover={canAdvance() ? { scale: 1.04 } : {}} whileTap={canAdvance() ? { scale: 0.96 } : {}}>
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
            if (spinReward) setStepIndex(STEPS.indexOf("review"));
          }}
        />
      )}
    </div>
  );
}
