"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Gift, ShoppingCart, Sparkles, Star, Zap } from "lucide-react";
import { type Product, formatGELSimple, savingsPct, savings } from "@/lib/types";

const DEMO: Record<string, Product> = {
  p1: { id: "p1", title: "Preserved Rose Box", description: "Velvet-toned preserved roses arranged for a breathtaking opening moment. Each petal is hand-selected and treated to last for months. The perfect centrepiece for any romantic gift box.", normalPrice: 4900, boxPrice: 3900, images: ["https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80"], stock: 12, active: true, category: "main_surprise", audience: "for_her", vibes: ["romantic", "luxury"], tags: ["roses", "flowers"] },
};

export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [addedToBox, setAddedToBox] = useState(false);
  const [boughtNormal, setBoughtNormal] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setProduct(d?.product ?? DEMO[params.id] ?? null))
      .catch(() => setProduct(DEMO[params.id] ?? null))
      .finally(() => setLoading(false));
  }, [params.id]);

  function handleAddToBox() {
    // Save to localStorage for box builder to pick up
    const stored = JSON.parse(localStorage.getItem("box_items") ?? "[]") as Product[];
    const next = stored.filter((p) => p.category !== product!.category).concat(product!).slice(0, 3);
    localStorage.setItem("box_items", JSON.stringify(next));
    setAddedToBox(true);
    setTimeout(() => setAddedToBox(false), 3000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
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
    <div className="min-h-screen bg-[#0D0D0D]">
      {/* Nav */}
      <nav className="sticky top-0 z-40 glass border-b border-white/5 px-4 py-4 flex items-center gap-4">
        <Link href="/shop" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-bold">
          <ArrowLeft className="w-4 h-4" /> Shop
        </Link>
        <span className="text-white/20">/</span>
        <span className="text-white/70 text-sm truncate">{product.title}</span>
        <div className="ml-auto">
          <Link href="/" className="font-display text-lg font-bold text-white">gamif<span className="text-accent">.</span></Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-10 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-start">

          {/* ── Images ─────────────────────────────────────────────────── */}
          <div className="space-y-4">
            <motion.div
              className="relative aspect-square rounded-3xl overflow-hidden bg-card"
              layoutId={`product-img-${product.id}`}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImg}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Image
                    src={product.images[activeImg] ?? product.images[0]}
                    alt={product.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Savings badge */}
              {pct >= 5 && (
                <div className="absolute top-4 left-4 bg-accent text-white text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
                  -{pct}% with Box
                </div>
              )}

              {/* Nav arrows */}
              {product.images.length > 1 && (
                <>
                  <button onClick={() => setActiveImg((i) => (i - 1 + product.images.length) % product.images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 glass rounded-full border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <button onClick={() => setActiveImg((i) => (i + 1) % product.images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 glass rounded-full border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>
                </>
              )}
            </motion.div>

            {/* Thumbs */}
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${i === activeImg ? "border-accent" : "border-white/10 opacity-50 hover:opacity-80"}`}>
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info ───────────────────────────────────────────────────── */}
          <div className="space-y-6">
            {/* Tags */}
            <div className="flex gap-2 flex-wrap">
              {product.vibes.map((v) => (
                <span key={v} className="text-[10px] font-black uppercase tracking-wider text-violet-2 bg-violet/10 px-3 py-1 rounded-full border border-violet/20">
                  {v}
                </span>
              ))}
              <span className="text-[10px] font-black uppercase tracking-wider text-white/30 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                {product.category.replace("_", " ")}
              </span>
            </div>

            <h1 className="font-display text-4xl lg:text-5xl font-bold text-white leading-tight">
              {product.title}
            </h1>

            <p className="text-white/60 text-lg leading-relaxed">{product.description}</p>

            {/* Audience */}
            <div className="flex items-center gap-2">
              <span className="text-white/30 text-xs font-bold uppercase tracking-widest">Perfect for</span>
              <span className="glass border border-white/10 text-white/70 text-xs font-bold px-3 py-1 rounded-full">
                {product.audience === "for_her" ? "💗 Her" : product.audience === "for_him" ? "💙 Him" : product.audience === "couple" ? "💑 Couples" : "🎁 Anyone"}
              </span>
            </div>

            {/* ── Dual pricing block ──────────────────────────────────── */}
            <div className="rounded-2xl border border-white/10 overflow-hidden">
              {/* Normal price row */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <div>
                  <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-1">Normal Price</p>
                  <p className="text-2xl font-bold text-white/50 line-through">{formatGELSimple(product.normalPrice)}</p>
                </div>
                <button
                  onClick={() => setBoughtNormal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 border border-white/15 rounded-xl text-sm font-bold text-white/60 hover:border-white/30 hover:text-white transition-all"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Buy Normally
                </button>
              </div>

              {/* Box price row — featured */}
              <div className="relative bg-gradient-to-br from-accent/8 to-violet/8 px-5 py-5">
                {/* Animated glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-violet/5 to-accent/5 animate-pulse pointer-events-none rounded-b-2xl" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="box-price-badge">
                        <Sparkles className="w-2.5 h-2.5" /> Exclusive
                      </span>
                    </div>
                    <p className="text-4xl font-black text-white">
                      {formatGELSimple(product.boxPrice)}
                    </p>
                    <p className="text-accent text-sm font-bold mt-1">
                      You save {formatGELSimple(saved)} ({pct}%) in a box ✨
                    </p>
                  </div>
                  <motion.button
                    onClick={handleAddToBox}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all ${
                      addedToBox
                        ? "bg-emerald/20 border border-emerald/40 text-emerald"
                        : "btn-dopamine"
                    }`}
                  >
                    <AnimatePresence mode="wait">
                      {addedToBox ? (
                        <motion.span key="added" className="flex items-center gap-2"
                          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
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

            {/* Stock warning */}
            {product.stock > 0 && product.stock <= 5 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-gold text-sm font-bold"
              >
                <Zap className="w-4 h-4" />
                Only {product.stock} left in stock!
              </motion.div>
            )}

            {/* Box CTA */}
            <Link
              href="/build-a-box"
              className="block w-full text-center py-3 glass border border-white/10 rounded-xl text-sm font-bold text-white/60 hover:text-white hover:border-white/30 transition-all"
            >
              🎁 View your gift box builder →
            </Link>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: "🔒", label: "Secure Checkout" },
                { icon: "🚚", label: "Fast Delivery" },
                { icon: "🎀", label: "Gift Wrapped" },
              ].map((b) => (
                <div key={b.label} className="glass border border-white/5 rounded-xl py-3 flex flex-col items-center gap-1">
                  <span className="text-xl">{b.icon}</span>
                  <span className="text-white/40 text-[10px] font-bold uppercase tracking-wider text-center">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
