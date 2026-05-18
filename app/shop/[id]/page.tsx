"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/primitives/Reveal";
import { SplitHeading } from "@/components/primitives/SplitHeading";
import { type Product, formatGELSimple, savingsPct, savings } from "@/lib/types";
import { useCartStore } from "@/lib/stores/cart";
import { useUIStore } from "@/lib/stores/ui";

const ease = [0.16, 1, 0.3, 1] as const;

const DEMO: Record<string, Product> = {
  p1: {
    id: "p1", title: "Preserved Rose Box",
    description: "Velvet-toned preserved roses arranged for a breathtaking opening moment. Each petal is hand-selected and treated to last for months — a centrepiece for any romantic box.",
    normalPrice: 4900, boxPrice: 3900,
    images: [
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1600&q=90",
      "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1600&q=90",
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
  const openMiniCart = useUIStore((s) => s.openMiniCart);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setProduct(d?.product ?? DEMO[params.id] ?? null))
      .catch(() => setProduct(DEMO[params.id] ?? null))
      .finally(() => setLoading(false));
  }, [params.id]);

  function handleAddToBox() {
    if (!product) return;
    const stored = JSON.parse(localStorage.getItem("box_items") ?? "[]") as Product[];
    const next = stored.filter((p) => p.category !== product.category).concat(product).slice(0, 3);
    localStorage.setItem("box_items", JSON.stringify(next));
    setAddedBox(true);
    setTimeout(() => setAddedBox(false), 2500);
  }

  function handleAddToCart() {
    if (!product) return;
    addToCart(product);
    setAddedCart(true);
    setTimeout(() => setAddedCart(false), 2200);
    setTimeout(() => openMiniCart(), 350);
  }

  if (loading) {
    return (
      <div className="surface-bone flex min-h-dvh items-center justify-center">
        <span className="eyebrow text-[var(--storm-55)] animate-blink-soft">Loading…</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="surface-bone flex min-h-dvh flex-col items-center justify-center gap-4">
        <p className="font-display text-display-sm text-[var(--ink)]">Piece not found.</p>
        <Link href="/shop" className="link-reveal eyebrow">Back to the shop</Link>
      </div>
    );
  }

  const pct   = savingsPct(product);
  const saved = savings(product);

  return (
    <main className="surface-bone min-h-dvh">
      <Navbar />

      {/* Hero */}
      <section ref={heroRef} className="relative h-[78vh] min-h-[600px] overflow-clip">
        <motion.div style={{ y: imgY }} className="absolute inset-x-0 -top-[10%] -bottom-[10%]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeImg}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.8, ease }}
              className="absolute inset-0"
            >
              <Image
                src={product.images[activeImg] ?? product.images[0]}
                alt={product.title}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>
        <div className="grain-overlay absolute inset-0 opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/55 via-transparent to-[var(--ink)]/35" />

        <div className="container-edge container-wide absolute inset-0 flex flex-col justify-between pt-32 pb-10 text-[var(--bone)]">
          <Link href="/shop" className="link-reveal flex w-fit items-center gap-3 text-[11px] uppercase tracking-[0.32em]">
            <ArrowLeft className="h-3 w-3" /> The Collection
          </Link>
          <div className="grid grid-cols-1 md:grid-cols-12 md:items-end gap-8">
            <div className="md:col-span-8">
              <p className="eyebrow opacity-80">№ {params.id.toUpperCase()} · {product.vibes.join(" · ")}</p>
              <SplitHeading
                as="h1"
                className="font-display mt-6 text-display-xl leading-[0.9]"
              >
                {product.title}
              </SplitHeading>
            </div>
            {product.images.length > 1 && (
              <div className="md:col-span-4 flex items-end justify-start gap-3 md:justify-end">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`relative h-24 w-20 overflow-clip border transition-all ${i === activeImg ? "border-[var(--bone)]" : "border-transparent opacity-60"}`}
                  >
                    <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Detail */}
      <section className="section container-edge container-wide">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-12">
          <Reveal className="md:col-span-7">
            <p className="eyebrow text-[var(--storm-55)]">About the piece</p>
            <p className="mt-6 font-display text-quote text-[var(--ink)]">{product.description}</p>

            <div className="mt-12 grid grid-cols-2 gap-x-10 gap-y-8 max-w-xl">
              <Spec label="Audience"   value={audienceLabel(product.audience)} />
              <Spec label="Category"   value={categoryLabel(product.category)} />
              <Spec label="Vibes"      value={product.vibes.join(", ")} />
              <Spec label="Stock"      value={product.stock <= 5 ? `${product.stock} pieces left` : "In stock"} />
            </div>
          </Reveal>

          <Reveal delay={0.15} className="md:col-span-5">
            <div className="sticky top-32 space-y-6">
              <div className="border border-[var(--hair-warm)] p-8">
                <p className="eyebrow text-[var(--storm-55)]">Box price</p>
                <div className="mt-3 flex items-baseline justify-between">
                  <p className="font-display text-display-md text-[var(--ink)] tabular">{formatGELSimple(product.boxPrice)}</p>
                  {pct > 0 && (
                    <span className="box-badge--accent box-badge tabular">−{pct}%</span>
                  )}
                </div>
                <p className="mt-2 text-sm text-[var(--storm-55)]">
                  When this piece joins a box you save {formatGELSimple(saved)}.
                </p>
                <button
                  onClick={handleAddToBox}
                  className="btn-cinematic btn-cinematic--primary mt-8 w-full justify-center"
                >
                  <span className="btn-cinematic__label">{addedBox ? "Added to box" : "Add to a box"}</span>
                </button>
              </div>

              <div className="border border-[var(--hair-warm)] p-8">
                <div className="flex items-baseline justify-between">
                  <p className="eyebrow text-[var(--storm-55)]">Retail price</p>
                  <p className="text-sm text-[var(--storm-35)] line-through tabular">{formatGELSimple(product.normalPrice)}</p>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="btn-cinematic btn-cinematic--outline mt-6 w-full justify-center"
                >
                  <span className="btn-cinematic__label flex items-center gap-3">
                    {addedCart ? <><Check className="h-3 w-3" /> Added to cart</> : <>Buy as standalone <ArrowRight className="h-3 w-3" /></>}
                  </span>
                </button>
              </div>

              <Link
                href="/build-a-box"
                className="link-reveal block text-center text-[11px] uppercase tracking-[0.32em] text-[var(--storm-55)]"
              >
                Or compose a full box
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Editorial pull-quote */}
      <section className="surface-ink relative overflow-clip section text-[var(--bone)]">
        <div aria-hidden className="grain-overlay pointer-events-none absolute inset-0 opacity-25" />
        <div className="container-edge container-tight relative">
          <p className="eyebrow text-[var(--bone)]/55">Why this piece</p>
          <SplitHeading
            as="p"
            trigger="scroll"
            className="font-display mt-8 text-quote text-[var(--bone)]"
          >
            <em className="italic-serif text-[var(--accent-2)]">&ldquo;</em>The best gifts are not the loudest. They are the ones whose presence is felt long after the paper has been folded away.<em className="italic-serif text-[var(--accent-2)]">&rdquo;</em>
          </SplitHeading>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="eyebrow text-[var(--storm-55)]">{label}</p>
      <p className="mt-2 font-display text-xl text-[var(--ink)]">{value}</p>
    </div>
  );
}

function audienceLabel(a: Product["audience"]) {
  return a === "for_her" ? "For her"
    : a === "for_him"   ? "For him"
    : a === "couple"    ? "For couples"
    : "Neutral";
}

function categoryLabel(c: Product["category"]) {
  return c === "main_surprise" ? "Centrepiece"
    : c === "sweet_pick" ? "Soft counterpoint"
    : c === "tiny_extra" ? "Closing whisper"
    : "Lucky bonus";
}
