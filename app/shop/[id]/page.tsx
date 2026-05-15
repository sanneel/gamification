"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Gift, ShoppingCart, Sparkles, Star, Zap } from "lucide-react";
import { type Product, formatGELSimple, savingsPct, savings } from "@/lib/types";
import { springs, ease, fadeUp, viewport } from "@/lib/motion";

const DEMO: Record<string, Product> = {
  p1: {
    id: "p1", title: "Preserved Rose Box",
    description: "Velvet-toned preserved roses arranged for a breathtaking opening moment. Each petal is hand-selected and treated to last for months. The perfect centrepiece for any romantic gift box.",
    normalPrice: 4900, boxPrice: 3900,
    images: [
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80",
    ],
    stock: 4, active: true, category: "main_surprise", audience: "for_her", vibes: ["romantic", "luxury"], tags: ["roses", "flowers"],
  },
};

// Flying particle that shoots from button to corner
function FlyParticle({ trigger, origin }: { trigger: boolean; origin: { x: number; y: number } | null }) {
  if (!trigger || !origin) return null;
  return (
    <motion.div
      className="fixed z-[90] pointer-events-none"
      style={{ left: origin.x, top: origin.y, width: 12, height: 12, borderRadius: "50%", background: "#FF2D78" }}
      initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      animate={{ opacity: 0, scale: 0.3, x: 60, y: -80 }}
      transition={{ duration: 0.6, ease: ease.expo }}
    />
  );
}

// Floating sparkle label that appears on "Add to Box"
function FloatLabel({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {["✨", "💖", "⭐", "🌟", "✨"].map((s, i) => (
            <motion.span
              key={i}
              className="absolute text-sm"
              initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
              animate={{
                opacity: 0, scale: 1.5,
                x: (i - 2) * 28 + (Math.random() - 0.5) * 20,
                y: -40 - Math.random() * 30,
              }}
              transition={{ duration: 0.8, delay: i * 0.05, ease: ease.expo }}
            >
              {s}
            </motion.span>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [addedToBox, setAddedToBox] = useState(false);
  const [sparkleActive, setSparkleActive] = useState(false);
  const [flyParticle, setFlyParticle] = useState(false);
  const [flyOrigin, setFlyOrigin] = useState<{ x: number; y: number } | null>(null);
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroScale = useSpring(useTransform(scrollYProgress, [0, 1], [1, 1.06]), { stiffness: 120, damping: 30 });
  const heroBlur = useTransform(scrollYProgress, [0, 0.6], [0, 8]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0.3]);

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setProduct(d?.product ?? DEMO[params.id] ?? null))
      .catch(() => setProduct(DEMO[params.id] ?? null))
      .finally(() => setLoading(false));
  }, [params.id]);

  function handleAddToBox(e: React.MouseEvent) {
    if (!product) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setFlyOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    setFlyParticle(true);
    setTimeout(() => setFlyParticle(false), 700);

    const stored = JSON.parse(localStorage.getItem("box_items") ?? "[]") as Product[];
    const next = stored.filter((p) => p.category !== product.category).concat(product).slice(0, 3);
    localStorage.setItem("box_items", JSON.stringify(next));

    setAddedToBox(true);
    setSparkleActive(true);
    setTimeout(() => setSparkleActive(false), 1000);
    setTimeout(() => setAddedToBox(false), 3200);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <motion.div
          className="w-14 h-14 rounded-full"
          style={{ border: "3px solid transparent", borderTopColor: "#FF2D78" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center gap-4">
        <p className="text-white/50 text-lg">Product not found.</p>
        <Link href="/shop" className="text-accent font-bold hover:underline">Back to Shop</Link>
      </div>
    );
  }

  const pct = savingsPct(product);
  const saved = savings(product);

  return (
    <div className="min-h-screen bg-[#0D0D0D] overflow-x-hidden">
      <FlyParticle trigger={flyParticle} origin={flyOrigin} />

      {/* Nav */}
      <nav className="sticky top-0 z-50 glass-strong border-b border-white/5 px-5 py-4 flex items-center gap-3">
        <Link href="/shop" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Shop</span>
        </Link>
        <span className="text-white/15">/</span>
        <span className="text-white/60 text-sm truncate max-w-[200px]">{product.title}</span>
        <div className="ml-auto">
          <Link href="/" className="font-display text-xl font-bold text-white">gamif<span className="text-accent">.</span></Link>
        </div>
      </nav>

      {/* ── HERO IMAGE (mobile: full-bleed, desktop: left column) ──────────── */}
      <div className="lg:hidden">
        <div ref={heroRef} className="relative w-full aspect-square overflow-hidden">
          <motion.div className="absolute inset-0" style={{ scale: heroScale }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImg}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: ease.expo }}
              >
                <Image src={product.images[activeImg] ?? product.images[0]} alt={product.title} fill className="object-cover" priority />
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Gradient overlay bottom */}
          <div className="absolute bottom-0 inset-x-0 h-2/5 bg-gradient-to-t from-[#0D0D0D] to-transparent pointer-events-none" />

          {/* Savings badge */}
          {pct >= 5 && (
            <motion.div
              className="absolute top-4 left-4 text-white text-xs font-black px-3 py-1.5 rounded-full"
              style={{ background: "linear-gradient(135deg, #FF2D78, #7C3AED)" }}
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ ...springs.bouncy, delay: 0.3 }}
            >
              -{pct}% in Box
            </motion.div>
          )}

          {/* Image nav */}
          {product.images.length > 1 && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
              {product.images.map((_, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`rounded-full transition-all ${i === activeImg ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/30"}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-start">

          {/* ── Desktop Image Column ─────────────────────────────────────── */}
          <div className="hidden lg:block space-y-4">
            <motion.div
              className="relative aspect-square rounded-3xl overflow-hidden bg-card cursor-zoom-in"
              layoutId={`product-img-${product.id}`}
              whileHover={{ scale: 1.01 }}
              transition={springs.gentle}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImg}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: ease.expo }}
                >
                  <Image src={product.images[activeImg] ?? product.images[0]} alt={product.title} fill className="object-cover" priority />
                </motion.div>
              </AnimatePresence>

              {pct >= 5 && (
                <motion.div
                  className="absolute top-5 left-5 text-white text-xs font-black px-4 py-2 rounded-full z-10"
                  style={{ background: "linear-gradient(135deg, #FF2D78, #7C3AED)" }}
                  initial={{ scale: 0, rotate: -12 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ ...springs.bouncy, delay: 0.4 }}
                >
                  -{pct}% in Box
                </motion.div>
              )}

              {product.images.length > 1 && (
                <>
                  <button onClick={() => setActiveImg((i) => (i - 1 + product.images.length) % product.images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 glass rounded-full border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100">
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <button onClick={() => setActiveImg((i) => (i + 1) % product.images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 glass rounded-full border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100">
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>
                </>
              )}
            </motion.div>

            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <motion.button key={i} onClick={() => setActiveImg(i)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${i === activeImg ? "border-accent shadow-[0_0_16px_#FF2D7850]" : "border-white/10 opacity-50 hover:opacity-80"}`}>
                    <Image src={img} alt="" fill className="object-cover" />
                  </motion.button>
                ))}
              </div>
            )}

            {/* Ambient glow behind image */}
            <div className="relative h-8 pointer-events-none">
              <div className="absolute inset-x-8 h-20 -top-6 bg-accent/10 blur-2xl rounded-full" />
            </div>
          </div>

          {/* ── Info Column ──────────────────────────────────────────────── */}
          <motion.div
            className="space-y-7"
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
          >
            {/* Tags */}
            <motion.div className="flex gap-2 flex-wrap" variants={fadeUp}>
              {product.vibes.slice(0, 3).map((v) => (
                <span key={v} className="text-[10px] font-black uppercase tracking-wider text-violet-2 bg-violet/10 px-3 py-1 rounded-full border border-violet/20">
                  {v}
                </span>
              ))}
              <span className="text-[10px] font-black uppercase tracking-wider text-white/25 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                {product.category.replace(/_/g, " ")}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              className="font-display text-4xl lg:text-5xl font-bold text-white leading-tight"
              variants={fadeUp}
            >
              {product.title}
            </motion.h1>

            {/* Social proof */}
            <motion.div className="flex items-center gap-3" variants={fadeUp}>
              <div className="flex">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-gold text-gold" />
                ))}
              </div>
              <span className="text-white/40 text-sm">4.9 · 847 gifted</span>
              <span className="text-white/20">·</span>
              <span className="text-emerald text-sm font-bold">❤️ Top pick this week</span>
            </motion.div>

            {/* Description */}
            <motion.p className="text-white/60 text-lg leading-relaxed" variants={fadeUp}>
              {product.description}
            </motion.p>

            {/* Audience */}
            <motion.div className="flex items-center gap-2" variants={fadeUp}>
              <span className="text-white/25 text-xs font-bold uppercase tracking-widest">Perfect for</span>
              <span className="glass border border-white/10 text-white/65 text-xs font-bold px-3 py-1.5 rounded-full">
                {product.audience === "for_her" ? "💗 Her"
                  : product.audience === "for_him" ? "💙 Him"
                  : product.audience === "couple" ? "💑 Couples"
                  : "🎁 Anyone"}
              </span>
            </motion.div>

            {/* ── Dual Pricing Block ───────────────────────────────────── */}
            <motion.div
              className="rounded-3xl overflow-hidden"
              variants={fadeUp}
              style={{ border: "1px solid rgba(255,45,120,0.15)" }}
            >
              {/* Normal */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/2">
                <div>
                  <p className="text-white/25 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Normal Price</p>
                  <p className="text-2xl font-bold text-white/40 line-through">{formatGELSimple(product.normalPrice)}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03, borderColor: "rgba(255,255,255,0.3)" }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-5 py-2.5 border border-white/12 rounded-xl text-xs font-bold text-white/45 hover:text-white/70 transition-all"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Buy Normally
                </motion.button>
              </div>

              {/* Box price */}
              <div className="relative px-6 py-6" style={{ background: "linear-gradient(135deg, rgba(255,45,120,0.08) 0%, rgba(124,58,237,0.08) 100%)" }}>
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(255,45,120,0.05), transparent)" }}
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                />
                <div className="relative flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="box-price-badge flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        Box Price
                      </span>
                    </div>
                    <p className="text-5xl font-black text-white">
                      {formatGELSimple(product.boxPrice)}
                    </p>
                    <p className="text-accent text-sm font-bold mt-1.5">
                      You save {formatGELSimple(saved)} ({pct}%) ✨
                    </p>
                  </div>
                  <div className="relative flex-shrink-0">
                    <FloatLabel show={sparkleActive} />
                    <motion.button
                      ref={addBtnRef}
                      onClick={handleAddToBox}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.93 }}
                      className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-black uppercase tracking-wider transition-all ${
                        addedToBox
                          ? "bg-emerald/15 border border-emerald/40 text-emerald shadow-[0_0_24px_#10B98130]"
                          : "btn-dopamine"
                      }`}
                    >
                      <AnimatePresence mode="wait">
                        {addedToBox ? (
                          <motion.span key="added" className="flex items-center gap-2"
                            initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={springs.bouncy}>
                            <Check className="w-4 h-4" /> Added!
                          </motion.span>
                        ) : (
                          <motion.span key="add" className="flex items-center gap-2"
                            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                            <Gift className="w-4 h-4" /> Add to Box
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stock warning */}
            <AnimatePresence>
              {product.stock > 0 && product.stock <= 5 && (
                <motion.div
                  initial={{ opacity: 0, y: 8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  className="flex items-center gap-2 text-gold text-sm font-bold"
                >
                  <motion.div
                    className="w-2 h-2 rounded-full bg-gold"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  Only {product.stock} left — selling fast!
                </motion.div>
              )}
            </AnimatePresence>

            {/* Box CTA */}
            <motion.div variants={fadeUp}>
              <Link href="/build-a-box"
                className="flex items-center justify-center gap-2 w-full py-3.5 glass border border-white/8 rounded-2xl text-sm font-bold text-white/50 hover:text-white hover:border-white/20 transition-all">
                <Gift className="w-4 h-4" />
                Open the Gift Box Builder
                <span className="ml-auto text-white/25">→</span>
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div className="grid grid-cols-3 gap-3" variants={fadeUp} viewport={viewport}>
              {[
                { icon: "🔒", label: "Secure Checkout" },
                { icon: "🚚", label: "Fast Delivery" },
                { icon: "🎀", label: "Gift Wrapped" },
              ].map((b) => (
                <motion.div
                  key={b.label}
                  className="glass border border-white/5 rounded-2xl py-4 flex flex-col items-center gap-1.5"
                  whileHover={{ scale: 1.03, borderColor: "rgba(255,255,255,0.12)" }}
                  transition={springs.snappy}
                >
                  <span className="text-2xl">{b.icon}</span>
                  <span className="text-white/35 text-[10px] font-bold uppercase tracking-wider text-center leading-tight">{b.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* ── You might also love (placeholder) ────────────────────────────── */}
        <motion.div
          className="mt-20 pt-12 border-t border-white/5"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
        >
          <motion.h2 className="text-2xl font-display font-bold text-white mb-8" variants={fadeUp}>
            Complete the vibe
          </motion.h2>
          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}>
            {["Sweet Pick", "Tiny Extra", "Main Surprise", "Lucky Bonus"].map((slot) => (
              <motion.div
                key={slot}
                variants={fadeUp}
                className="glass border border-white/5 rounded-2xl p-5 flex flex-col items-center gap-2 text-center"
                whileHover={{ scale: 1.03, borderColor: "rgba(255,45,120,0.2)" }}
                transition={springs.snappy}
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl">
                  {slot === "Sweet Pick" ? "🍬" : slot === "Tiny Extra" ? "✨" : slot === "Main Surprise" ? "🎁" : "🌟"}
                </div>
                <p className="text-white/50 text-xs font-bold uppercase tracking-wider">{slot}</p>
                <Link href={`/shop?category=${slot.toLowerCase().replace(" ", "_")}`}
                  className="text-accent text-xs font-bold hover:underline">
                  Browse →
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
