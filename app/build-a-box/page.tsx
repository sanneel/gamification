"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Check, ChevronRight, Gift, Lock, Sparkles, Zap,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import LuckySpinWheel from "@/components/LuckySpinWheel";
import {
  type Product,
  type ProductCategory,
  type SpinReward,
  BOX_SLOTS,
  formatGELSimple,
} from "@/lib/types";

// ── Demo fallback products ─────────────────────────────────────────────────────

const DEMO: Record<ProductCategory, Product[]> = {
  main_surprise: [
    { id: "p1", title: "Preserved Rose Box", description: "Velvet-toned roses for a breathtaking reveal.", normalPrice: 4900, boxPrice: 3900, images: ["https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=600&q=80"], stock: 12, active: true, category: "main_surprise", audience: "for_her", vibes: ["romantic", "luxury"], tags: [] },
    { id: "p2", title: "Gold Initial Necklace", description: "A personal keepsake chosen just for them.", normalPrice: 5900, boxPrice: 4800, images: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"], stock: 8, active: true, category: "main_surprise", audience: "for_her", vibes: ["luxury", "aesthetic"], tags: [] },
    { id: "p3", title: "Crystal Perfume", description: "A luxury fragrance in a sculpted bottle.", normalPrice: 6500, boxPrice: 5200, images: ["https://images.unsplash.com/photo-1541643600914-78b084683702?auto=format&fit=crop&w=600&q=80"], stock: 6, active: true, category: "main_surprise", audience: "for_her", vibes: ["luxury"], tags: [] },
  ],
  sweet_pick: [
    { id: "p4", title: "Signature Soy Candle", description: "Warm amber, soft wax — an evening-in feeling.", normalPrice: 2800, boxPrice: 2200, images: ["https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80"], stock: 25, active: true, category: "sweet_pick", audience: "neutral", vibes: ["cozy", "romantic"], tags: [] },
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

type Step = "main_surprise" | "sweet_pick" | "tiny_extra" | "spin" | "review";
const STEPS: Step[] = ["main_surprise", "sweet_pick", "tiny_extra", "spin", "review"];

export default function BuildABoxPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const [selections, setSelections] = useState<Partial<Record<ProductCategory, Product>>>({});
  const [products, setProducts] = useState<Record<ProductCategory, Product[]>>(DEMO);
  const [loading, setLoading] = useState(true);
  const [sessionToken, setSessionToken] = useState<string>("");
  const [spinReward, setSpinReward] = useState<SpinReward | null>(null);
  const [showSpinWheel, setShowSpinWheel] = useState(false);

  const currentStep = STEPS[stepIndex];

  useEffect(() => {
    const savedToken = localStorage.getItem("box_session_token");
    if (savedToken) setSessionToken(savedToken);

    fetch("/api/products")
      .then((r) => (r.ok ? r.json() : { products: [] }))
      .then((data: { products?: Product[] }) => {
        if (data.products?.length) {
          const grouped: Record<ProductCategory, Product[]> = {
            main_surprise: [], sweet_pick: [], tiny_extra: [], lucky_bonus: [],
          };
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
    const slotKeyMap: Record<string, string> = {
      main_surprise: "mainSurpriseId",
      sweet_pick: "sweetPickId",
      tiny_extra: "tinyExtraId",
    };
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
    if (currentStep === "sweet_pick")    return !!selections.sweet_pick;
    if (currentStep === "tiny_extra")    return !!selections.tiny_extra;
    if (currentStep === "spin")          return !!spinReward;
    return true;
  }

  function advance() {
    if (currentStep === "tiny_extra") { setShowSpinWheel(true); return; }
    if (currentStep === "spin" && spinReward) { setStepIndex(STEPS.indexOf("review")); return; }
    if (stepIndex < STEPS.length - 1) setStepIndex((i) => i + 1);
  }

  function handleRewardReceived(reward: SpinReward) {
    setSpinReward(reward);
    setShowSpinWheel(false);
    setStepIndex(STEPS.indexOf("spin"));
  }

  const subtotal = useMemo(
    () => Object.values(selections).reduce((s, p) => s + (p?.boxPrice ?? 0), 0),
    [selections],
  );

  return (
    <div className="min-h-screen bg-[#0D0D0D] pb-32">
      {/* Nav */}
      <nav className="sticky top-0 z-40 glass border-b border-white/5 px-4 py-4 flex items-center justify-between">
        <Link href="/shop" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-bold">
          <ArrowLeft className="w-4 h-4" /> Shop
        </Link>
        <Link href="/" className="font-display text-lg font-bold text-white">
          gamif<span className="text-accent">.</span>
        </Link>
        {subtotal > 0 && (
          <span className="text-white/60 text-sm font-bold">{formatGELSimple(subtotal)}</span>
        )}
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-accent text-xs font-black uppercase tracking-[0.3em] mb-3 block">
            Build Your Box
          </span>
          <h1 className="font-display text-5xl lg:text-6xl font-bold text-white mb-3">
            Compose the perfect gift.
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Pick 3 items at exclusive box prices, then spin for a surprise reward.
          </p>
        </motion.div>

        {/* Step breadcrumbs */}
        <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
          {BOX_SLOTS.map((slot, i) => {
            const stepPos = i;
            const isActive = stepIndex === stepPos;
            const isDone = stepIndex > stepPos || !!selections[slot.category as ProductCategory];
            const isLocked = stepIndex < stepPos && !selections[slot.category as ProductCategory];
            return (
              <div key={slot.id} className="flex items-center gap-2 shrink-0">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                  isActive ? "bg-accent/20 border-accent/50 text-accent" :
                  isDone   ? "bg-emerald/20 border-emerald/40 text-emerald" :
                             "glass border-white/10 text-white/30"
                }`}>
                  {isDone ? <Check className="w-3 h-3" /> : isLocked ? <Lock className="w-3 h-3" /> : <span>{slot.emoji}</span>}
                  <span>{slot.label}</span>
                </div>
                {i < BOX_SLOTS.length - 1 && <ChevronRight className="w-4 h-4 text-white/20 shrink-0" />}
              </div>
            );
          })}
          <ChevronRight className="w-4 h-4 text-white/20 shrink-0" />
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border transition-all shrink-0 ${
            currentStep === "spin" ? "bg-gold/20 border-gold/50 text-gold" :
            spinReward ? "bg-emerald/20 border-emerald/40 text-emerald" :
            "glass border-white/10 text-white/30"
          }`}>
            {spinReward ? <Check className="w-3 h-3" /> : <span>🎡</span>}
            <span>Lucky Spin</span>
          </div>
        </div>

        {/* Box visual preview */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {BOX_SLOTS.map((slot, i) => {
            const selected = selections[slot.category as ProductCategory];
            const isCurrentSlot = currentStep === slot.category;
            return (
              <motion.div
                key={slot.id}
                className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                  isCurrentSlot ? "border-accent" :
                  selected      ? "border-emerald/50" :
                                  "border-white/10"
                }`}
                style={isCurrentSlot ? { boxShadow: "0 0 30px rgba(255,45,120,0.3)" } : {}}
                whileHover={{ scale: isCurrentSlot ? 1.02 : 1 }}
              >
                <AnimatePresence mode="wait">
                  {selected ? (
                    <motion.div
                      key="filled"
                      className="absolute inset-0"
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", damping: 15 }}
                    >
                      <Image src={selected.images[0]} alt={selected.title} fill className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white font-bold text-xs truncate">{selected.title}</p>
                        <p className="text-accent text-xs font-black">{formatGELSimple(selected.boxPrice)}</p>
                      </div>
                      <div className="absolute top-2 right-2 w-6 h-6 bg-emerald rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-card"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className={`text-3xl ${isCurrentSlot ? "animate-float" : ""}`}>
                        {isCurrentSlot ? slot.emoji : <Lock className="w-6 h-6 text-white/20" />}
                      </div>
                      <p className={`text-xs font-bold ${isCurrentSlot ? "text-white/70" : "text-white/20"}`}>
                        {isCurrentSlot ? slot.label : "Locked"}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          {(currentStep === "main_surprise" || currentStep === "sweet_pick" || currentStep === "tiny_extra") && (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {BOX_SLOTS.filter((s) => s.category === currentStep).map((slot) => (
                <div key={slot.id} className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">{slot.emoji}</span>
                  <div>
                    <h2 className="font-display text-3xl font-bold text-white">{slot.label}</h2>
                    <p className="text-white/50 text-sm">{slot.description}</p>
                  </div>
                </div>
              ))}
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => <div key={i} className="aspect-[3/4] rounded-2xl bg-card animate-pulse" />)}
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

          {currentStep === "spin" && (
            <motion.div
              key="spin"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              {spinReward ? (
                <div className="space-y-4">
                  <div className="text-6xl">🎉</div>
                  <h2 className="font-display text-4xl font-bold text-white">Reward Applied!</h2>
                  <p className="text-accent text-2xl font-black">{spinReward.label}</p>
                  <p className="text-white/40">Applied at checkout.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-6xl animate-bounce">🎡</div>
                  <h2 className="font-display text-4xl font-bold text-white">Your box is ready!</h2>
                  <p className="text-white/50 text-lg">Spin for a surprise reward before checkout.</p>
                  <button
                    onClick={() => setShowSpinWheel(true)}
                    className="btn-dopamine px-12 py-5 rounded-2xl text-lg font-black inline-flex items-center gap-3"
                  >
                    <Zap className="w-6 h-6" /> Spin the Wheel
                  </button>
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
            />
          )}
        </AnimatePresence>
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-4">
        <div className="max-w-6xl mx-auto glass-strong border border-white/10 rounded-2xl p-4 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            {subtotal > 0 && (
              <p className="text-white font-bold text-sm">
                Box: <span className="text-accent">{formatGELSimple(subtotal)}</span>
              </p>
            )}
            <p className="text-white/40 text-xs truncate">
              {Object.values(selections).filter(Boolean).length === 3
                ? spinReward ? "Ready to checkout ✨" : "Spin for your reward!"
                : `${3 - Object.values(selections).filter(Boolean).length} more item${Object.values(selections).filter(Boolean).length < 2 ? "s" : ""} to go`}
            </p>
          </div>
          {currentStep !== "review" && (
            <motion.button
              onClick={advance}
              disabled={!canAdvance()}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-wider shrink-0 transition-all ${
                canAdvance() ? "btn-dopamine" : "glass border border-white/10 text-white/30 cursor-not-allowed"
              }`}
              whileHover={canAdvance() ? { scale: 1.03 } : {}}
              whileTap={canAdvance() ? { scale: 0.97 } : {}}
            >
              {currentStep === "tiny_extra"
                ? <><Sparkles className="w-4 h-4" /> Spin!</>
                : currentStep === "spin" && spinReward
                  ? <><ArrowRight className="w-4 h-4" /> Review</>
                  : <><ArrowRight className="w-4 h-4" /> Next</>}
            </motion.button>
          )}
        </div>
      </div>

      {showSpinWheel && sessionToken && (
        <LuckySpinWheel
          sessionToken={sessionToken || `local-${Date.now()}`}
          onRewardReceived={handleRewardReceived}
          onClose={() => { setShowSpinWheel(false); if (spinReward) setStepIndex(STEPS.indexOf("spin")); }}
        />
      )}
    </div>
  );
}

// ── Review panel ──────────────────────────────────────────────────────────────

function ReviewPanel({
  selections, spinReward, subtotal, sessionToken,
}: {
  selections: Partial<Record<ProductCategory, Product>>;
  spinReward: SpinReward | null;
  subtotal: number;
  sessionToken: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shipping = spinReward?.type === "free_shipping" ? 0 : 500;
  const discount = spinReward?.type === "discount_code" && spinReward.value
    ? Math.round(subtotal * (parseFloat(spinReward.value) / 100))
    : spinReward?.type === "free_tiny_gift" ? (selections.tiny_extra?.boxPrice ?? 0) : 0;
  const total = subtotal - discount + shipping;

  async function checkout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError(data.error ?? "Checkout unavailable.");
    } catch { setError("Something went wrong."); }
    finally { setLoading(false); }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto space-y-5"
    >
      <h2 className="font-display text-4xl font-bold text-white text-center">Your Gift Box</h2>

      <div className="space-y-3">
        {BOX_SLOTS.map((slot) => {
          const product = selections[slot.category as ProductCategory];
          return (
            <div key={slot.id} className="glass border border-white/10 rounded-2xl p-4 flex items-center gap-4">
              {product ? (
                <>
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0">
                    <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">{slot.label}</p>
                    <p className="text-white font-bold text-sm truncate">{product.title}</p>
                  </div>
                  <p className="text-accent font-black shrink-0">{formatGELSimple(product.boxPrice)}</p>
                </>
              ) : (
                <div className="flex items-center gap-3 text-white/30">
                  <span>{slot.emoji}</span>
                  <p className="text-sm">{slot.label} — not selected</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {spinReward && (
        <div className="glass border border-gold/30 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">🎡</span>
          <div className="flex-1">
            <p className="text-gold font-black text-sm">{spinReward.label}</p>
            <p className="text-white/40 text-xs">Spin reward — applied at checkout</p>
          </div>
          {discount > 0 && <p className="text-gold font-black">-{formatGELSimple(discount)}</p>}
          {spinReward.type === "free_shipping" && <p className="text-emerald font-black text-sm">Free!</p>}
        </div>
      )}

      <div className="glass border border-white/10 rounded-2xl p-5 space-y-3">
        <div className="flex justify-between text-sm text-white/60">
          <span>Box subtotal</span><span>{formatGELSimple(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm text-emerald">
            <span>Reward discount</span><span>-{formatGELSimple(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm text-white/60">
          <span>Shipping</span>
          <span className={spinReward?.type === "free_shipping" ? "text-emerald" : ""}>
            {spinReward?.type === "free_shipping" ? "Free 🎉" : formatGELSimple(shipping)}
          </span>
        </div>
        <div className="flex justify-between font-black text-white text-lg border-t border-white/10 pt-3">
          <span>Total</span><span>{formatGELSimple(total)}</span>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm font-bold text-center">{error}</p>}

      <motion.button
        onClick={checkout}
        disabled={loading}
        className="btn-dopamine w-full py-5 rounded-2xl text-base font-black uppercase tracking-wider flex items-center justify-center gap-3"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {loading
          ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <><Zap className="w-5 h-5" /> Checkout — {formatGELSimple(total)}</>}
      </motion.button>
    </motion.div>
  );
}
