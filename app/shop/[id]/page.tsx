"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, ShoppingCart } from "lucide-react";
import { type Product, formatGELSimple, savingsPct, savings } from "@/lib/types";
import { springs, ease } from "@/lib/motion";
import { useCartStore } from "@/lib/stores/cart";
import { useUIStore } from "@/lib/stores/ui";

const DEMO: Record<string, Product> = {
  p1: {
    id: "p1", title: "Preserved Rose Box",
    description: "Velvet-toned preserved roses arranged for a breathtaking opening moment. Each petal is hand-selected and treated to last for months. The perfect centrepiece for any romantic gift box.",
    normalPrice: 4900, boxPrice: 3900,
    images: [
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=90",
      "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1200&q=90",
    ],
    stock: 4, active: true, category: "main_surprise", audience: "for_her", vibes: ["romantic","luxury"], tags: [],
  },
};

export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct]     = useState<Product | null>(null);
  const [loading, setLoading]     = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [addedBox, setAddedBox]   = useState(false);
  const [addedCart, setAddedCart] = useState(false);

  const addToCart    = useCartStore((s) => s.addItem);
  const cartItems    = useCartStore((s) => s.items);
  const cartCount    = cartItems.reduce((n, i) => n + i.quantity, 0);
  const openMiniCart = useUIStore((s) => s.openMiniCart);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => setProduct(d?.product ?? DEMO[params.id] ?? null))
      .catch(() => setProduct(DEMO[params.id] ?? null))
      .finally(() => setLoading(false));
  }, [params.id]);

  function handleAddToBox() {
    if (!product) return;
    const stored = JSON.parse(localStorage.getItem("box_items") ?? "[]") as Product[];
    const next   = stored.filter(p => p.category !== product.category).concat(product).slice(0, 3);
    localStorage.setItem("box_items", JSON.stringify(next));
    setAddedBox(true);
    setTimeout(() => setAddedBox(false), 2800);
  }

  function handleAddToCart() {
    if (!product) return;
    addToCart(product);
    setAddedCart(true);
    setTimeout(() => setAddedCart(false), 2000);
    setTimeout(() => openMiniCart(), 300);
  }

  if (loading) {
    return (
      <div style={{ background: "var(--butter)", minHeight: "100dvh" }} className="flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border border-storm/20 border-t-storm animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ background: "var(--butter)", minHeight: "100dvh" }} className="flex flex-col items-center justify-center gap-4">
        <p className="font-display text-2xl text-storm">Product not found.</p>
        <Link href="/shop" className="eyebrow underline underline-offset-4" style={{ color: "var(--storm-55)" }}>Back to shop</Link>
      </div>
    );
  }

  const pct   = savingsPct(product);
  const saved = savings(product);

  return (
    <div style={{ background: "var(--butter)", minHeight: "100dvh" }}>

      {/* Nav */}
      <nav className="sticky top-0 z-50 px-8 sm:px-12 h-16 flex items-center gap-4"
        style={{ background: "rgba(245,230,163,0.95)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--storm-12)" }}>
        <Link href="/shop" className="flex items-center gap-2 text-sm transition-opacity hover:opacity-60"
          style={{ color: "var(--storm-55)" }}>
          <ArrowLeft className="w-4 h-4" /> Shop
        </Link>
        <span className="text-sm truncate flex-1 text-center" style={{ color: "var(--storm-35)" }}>{product.title}</span>
        <button onClick={openMiniCart} className="relative" aria-label="Cart" style={{ color: "var(--storm-55)" }}>
          <ShoppingCart className="w-4 h-4" />
          <AnimatePresence>
            {cartCount > 0 && (
              <motion.span key={cartCount} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                transition={springs.bouncy}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 text-[8px] font-bold rounded-full flex items-center justify-center"
                style={{ background: "var(--storm)", color: "var(--butter)" }}>
                {cartCount}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </nav>

      {/* Hero — full-bleed image with text below */}
      <div ref={heroRef} className="relative overflow-hidden" style={{ height: "70vh" }}>
        <motion.div className="absolute inset-0" style={{ y: imgY }}>
          <AnimatePresence mode="wait">
            <motion.div key={activeImg} className="absolute inset-0"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}>
              <Image src={product.images[activeImg] ?? product.images[0]} alt={product.title}
                fill className="object-cover" priority sizes="100vw" />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Image dots */}
        {product.images.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {product.images.map((_, i) => (
              <button key={i} onClick={() => setActiveImg(i)} aria-label={`Image ${i+1}`}
                className="w-8 h-px transition-all"
                style={{ background: i === activeImg ? "rgba(245,230,163,0.9)" : "rgba(245,230,163,0.35)" }} />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-8 sm:px-12 py-16 grid lg:grid-cols-2 gap-16 lg:gap-24">

        {/* Left — product info */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: ease.expo }}>

          <p className="eyebrow mb-4">{product.vibes.join(" · ")}</p>
          <h1 className="font-display font-light text-storm leading-tight mb-6"
            style={{ fontSize: "clamp(2.2rem, 5vw, 4.5rem)" }}>
            {product.title}
          </h1>
          <p className="leading-relaxed mb-10" style={{ color: "var(--storm-55)", fontSize: "1rem", maxWidth: "42ch" }}>
            {product.description}
          </p>

          {/* Audience */}
          <div className="flex items-center gap-4 mb-12">
            <span className="eyebrow">Perfect for</span>
            <span className="eyebrow" style={{ color: "var(--storm)" }}>
              {product.audience === "for_her" ? "Her"
                : product.audience === "for_him" ? "Him"
                : product.audience === "couple" ? "Couples"
                : "Anyone"}
            </span>
            {product.stock > 0 && product.stock <= 5 && (
              <>
                <div className="w-px h-3" style={{ background: "var(--storm-18)" }} />
                <span className="eyebrow" style={{ color: "var(--storm)" }}>Only {product.stock} left</span>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 mb-12">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className="relative w-16 h-20 overflow-hidden transition-opacity"
                  style={{ opacity: i === activeImg ? 1 : 0.45, outline: i === activeImg ? "1.5px solid var(--storm)" : "none" }}>
                  <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right — pricing + actions */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: ease.expo, delay: 0.1 }}
          className="lg:pt-12">

          {/* Box price section */}
          <div className="p-8 mb-6" style={{ background: "var(--butter-2)", border: "1px solid var(--storm-18)" }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="eyebrow mb-2">Box price</p>
                <p className="font-display text-4xl font-semibold text-storm">{formatGELSimple(product.boxPrice)}</p>
              </div>
              {pct >= 5 && (
                <div className="text-right">
                  <p className="eyebrow mb-1">You save</p>
                  <p className="font-display text-2xl text-storm">{formatGELSimple(saved)}</p>
                  <p className="eyebrow mt-1">{pct}% off retail</p>
                </div>
              )}
            </div>
            <motion.button onClick={handleAddToBox}
              whileHover={{ opacity: 0.85 }} whileTap={{ scale: 0.97 }}
              className="btn-primary w-full py-4 text-xs tracking-widest">
              {addedBox ? "✓ Added to Box" : "Add to Box"}
            </motion.button>
          </div>

          {/* Normal price */}
          <div className="p-6 flex items-center justify-between mb-6"
            style={{ border: "1px solid var(--storm-12)" }}>
            <div>
              <p className="eyebrow mb-1">Normal price</p>
              <p className="font-display text-2xl text-storm" style={{ opacity: 0.45, textDecoration: "line-through" }}>
                {formatGELSimple(product.normalPrice)}
              </p>
            </div>
            <motion.button onClick={handleAddToCart}
              whileHover={{ opacity: 0.7 }} whileTap={{ scale: 0.97 }}
              className="btn-outline px-6 py-3 text-xs tracking-widest">
              {addedCart ? <><Check className="inline w-3 h-3 mr-1" /> Added</> : "Buy Normally"}
            </motion.button>
          </div>

          {/* Trust */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Gift-wrapped" },
              { label: "Fast delivery" },
              { label: "Secure checkout" },
            ].map(b => (
              <div key={b.label} className="text-center py-4"
                style={{ border: "1px solid var(--storm-12)" }}>
                <p className="eyebrow">{b.label}</p>
              </div>
            ))}
          </div>

          {/* Box builder CTA */}
          <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--storm-12)" }}>
            <p className="text-sm mb-3" style={{ color: "var(--storm-55)" }}>
              Box prices are 15–25% cheaper than retail. Bundle this with two more items and spin for a reward.
            </p>
            <Link href="/build-a-box" className="eyebrow underline underline-offset-4 hover:opacity-75 transition-opacity"
              style={{ color: "var(--storm)" }}>
              Open the gift box builder →
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Editorial story section */}
      <section className="px-8 sm:px-12 py-20" style={{ background: "var(--butter-2)", borderTop: "1px solid var(--storm-12)" }}>
        <div className="max-w-4xl mx-auto">
          <p className="eyebrow mb-8">Why this item</p>
          <p className="font-display font-light text-storm leading-relaxed"
            style={{ fontSize: "clamp(1.4rem, 3vw, 2.5rem)" }}>
            &ldquo;The best gifts aren&apos;t the most expensive — they&apos;re the ones that make the person feel truly seen.&rdquo;
          </p>
        </div>
      </section>
    </div>
  );
}
