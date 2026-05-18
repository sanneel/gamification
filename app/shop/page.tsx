"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import clsx from "clsx";

import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/primitives/Reveal";
import { SplitHeading } from "@/components/primitives/SplitHeading";
import {
  type Product,
  type Audience,
  type Vibe,
  formatGELSimple,
} from "@/lib/types";

const ease = [0.16, 1, 0.3, 1] as const;

const DEMO: Product[] = [
  { id: "p1",  title: "Preserved Rose Box",      description: "Velvet-toned roses. A breathtaking reveal.",           normalPrice: 4900, boxPrice: 3900, images: ["https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=900&q=85"], stock: 12, active: true, category: "main_surprise", audience: "for_her", vibes: ["romantic","luxury"],    tags: [] },
  { id: "p2",  title: "Gold Initial Necklace",   description: "A personal keepsake chosen just for them.",            normalPrice: 5900, boxPrice: 4800, images: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85"], stock:  8, active: true, category: "main_surprise", audience: "for_her", vibes: ["luxury","aesthetic"], tags: [] },
  { id: "p3",  title: "Vintage Leather Wallet",  description: "Slim, premium, and instantly stylish.",                normalPrice: 4500, boxPrice: 3600, images: ["https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=85"], stock: 15, active: true, category: "main_surprise", audience: "for_him", vibes: ["luxury","aesthetic"], tags: [] },
  { id: "p4",  title: "Signature Soy Candle",    description: "Warm amber, soft wax — an evening-in feeling.",        normalPrice: 2800, boxPrice: 2200, images: ["https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=85"], stock: 25, active: true, category: "sweet_pick",    audience: "neutral",  vibes: ["cozy","romantic"],  tags: [] },
  { id: "p5",  title: "Crystal Perfume Bottle",  description: "A luxury fragrance in a sculpted bottle.",             normalPrice: 6500, boxPrice: 5200, images: ["https://images.unsplash.com/photo-1541643600914-78b084683702?auto=format&fit=crop&w=900&q=85"], stock:  6, active: true, category: "main_surprise", audience: "for_her", vibes: ["luxury","aesthetic"], tags: [] },
  { id: "p6",  title: "Couple's Polaroid Set",   description: "Capture the best moments together.",                   normalPrice: 3200, boxPrice: 2600, images: ["https://images.unsplash.com/photo-1525909002-1b05e0c869d8?auto=format&fit=crop&w=900&q=85"], stock: 10, active: true, category: "sweet_pick",    audience: "couple",   vibes: ["cute","romantic"],  tags: [] },
  { id: "p7",  title: "Artisan Chocolate Box",   description: "Hand-crafted truffles tucked inside tissue.",          normalPrice: 1800, boxPrice: 1400, images: ["https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=900&q=85"], stock: 30, active: true, category: "tiny_extra",    audience: "neutral",  vibes: ["cute","cozy"],      tags: [] },
  { id: "p8",  title: "Plush Teddy Bear",        description: "Soft, huggable, and impossibly cute.",                 normalPrice: 2200, boxPrice: 1800, images: ["https://images.unsplash.com/photo-1563901935883-cb61f5d49be4?auto=format&fit=crop&w=900&q=85"], stock: 20, active: true, category: "tiny_extra",    audience: "for_her",  vibes: ["cute","soft"],      tags: [] },
  { id: "p9",  title: "Mechanical Keyboard Set", description: "RGB backlit, clicky, and satisfyingly loud.",          normalPrice: 8900, boxPrice: 7200, images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=85"], stock:  5, active: true, category: "main_surprise", audience: "for_him",  vibes: ["gamer","aesthetic"],tags: [] },
  { id: "p10", title: "Rose Quartz Face Roller", description: "Cooling, soothing, and visually stunning.",            normalPrice: 3100, boxPrice: 2500, images: ["https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=900&q=85"], stock: 18, active: true, category: "sweet_pick",    audience: "for_her",  vibes: ["cozy","soft","aesthetic"], tags: [] },
  { id: "p11", title: "Gold Foil Greeting Card", description: "A quiet, luxurious finishing touch.",                  normalPrice:  600, boxPrice:  400, images: ["https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=900&q=85"], stock: 50, active: true, category: "tiny_extra",    audience: "neutral",  vibes: ["romantic","cute"],  tags: [] },
  { id: "p12", title: "Cashmere Eye Mask",       description: "The luxurious sleep essential they always wanted.",    normalPrice: 2600, boxPrice: 2100, images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=85"], stock: 14, active: true, category: "sweet_pick",    audience: "for_her",  vibes: ["cozy","luxury","soft"], tags: [] },
];

const FILTERS: { id: string; label: string; audience?: Audience; vibes?: Vibe[] }[] = [
  { id: "all",       label: "Everything" },
  { id: "for_her",   label: "For Her",    audience: "for_her" },
  { id: "for_him",   label: "For Him",    audience: "for_him" },
  { id: "couple",    label: "For Both",   audience: "couple" },
  { id: "romantic",  label: "Romantic",   vibes: ["romantic"] },
  { id: "luxury",    label: "Luxury",     vibes: ["luxury"] },
  { id: "cozy",      label: "Cozy",       vibes: ["cozy"] },
  { id: "aesthetic", label: "Aesthetic",  vibes: ["aesthetic"] },
  { id: "cute",      label: "Cute",       vibes: ["cute"] },
];

// ─── Editorial product tile ──────────────────────────────────────────────────

function EditorialTile({ product, index, tall = false }: { product: Product; index: number; tall?: boolean }) {
  const [hovered, setHovered] = useState(false);
  const primary = product.images[0] ?? "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800";

  return (
    <Link href={`/shop/${product.id}`} className="group block" data-cursor="hover">
      <motion.article
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.9, ease, delay: Math.min(index, 8) * 0.04 }}
        className="relative flex flex-col"
      >
        <div className={clsx("relative overflow-clip surface-bone-2", tall ? "aspect-[3/5]" : "aspect-portrait")}>
          <Image
            src={primary}
            alt={product.title}
            fill
            sizes="(min-width:1280px) 25vw, (min-width:768px) 33vw, 50vw"
            className="object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.05]"
          />
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
            <span className="eyebrow text-[var(--bone)]">№{String(index+1).padStart(2,"0")}</span>
            <span className="font-display text-[var(--bone)] text-base mix-blend-difference tabular">
              {formatGELSimple(product.boxPrice)}
            </span>
          </div>
          <motion.div
            initial={false}
            animate={{ y: hovered ? 0 : 8, opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.45, ease }}
            className="absolute inset-x-4 bottom-4 flex items-center justify-between bg-[var(--ink)] px-4 py-2.5 text-[10px] uppercase tracking-[0.28em] text-[var(--bone)]"
          >
            <span>View piece</span>
            <span>→</span>
          </motion.div>
        </div>
        <div className="mt-5 flex items-baseline justify-between border-b border-[var(--hair-warm)] pb-3">
          <h3 className="font-display text-xl text-[var(--ink)]">{product.title}</h3>
          {product.normalPrice !== product.boxPrice && (
            <span className="text-xs tabular text-[var(--storm-55)] line-through">{formatGELSimple(product.normalPrice)}</span>
          )}
        </div>
        <p className="mt-3 text-body-sm text-[var(--storm-55)] line-clamp-2">{product.description}</p>
      </motion.article>
    </Link>
  );
}

// ─── Wrapper ────────────────────────────────────────────────────────────────

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="surface-bone min-h-dvh" />}>
      <ShopContent />
    </Suspense>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    const audience = searchParams.get("audience");
    const vibe     = searchParams.get("vibe");
    if (audience) setActiveFilter(audience);
    else if (vibe) setActiveFilter(vibe);
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => (r.ok ? r.json() : { products: [] }))
      .then((d) => setProducts(d.products?.length ? d.products : DEMO))
      .catch(() => setProducts(DEMO))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = products;
    if (search) list = list.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));
    const f = FILTERS.find((x) => x.id === activeFilter);
    if (f?.audience) list = list.filter((p) => p.audience === f.audience || p.audience === "neutral");
    if (f?.vibes?.length) list = list.filter((p) => f.vibes!.some((v) => p.vibes.includes(v)));
    return list;
  }, [products, search, activeFilter]);

  const activeLabel = FILTERS.find((f) => f.id === activeFilter)?.label ?? "Everything";

  return (
    <main className="surface-bone min-h-dvh">
      <Navbar />

      {/* Hero band */}
      <section className="container-edge container-wide pt-44 pb-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Reveal>
              <p className="eyebrow text-[var(--storm-55)]">The collection · Vol. 04</p>
            </Reveal>
            <SplitHeading
              as="h1"
              className="font-display mt-6 text-display-xl leading-[0.9] text-[var(--ink)]"
            >
              <em className="italic-serif">{activeLabel}</em>
            </SplitHeading>
          </div>

          <Reveal delay={0.2} className="md:col-span-5">
            <p className="max-w-md text-body-lg text-[var(--storm-55)]">
              Each piece is studied, sampled, sometimes returned to the maker for one more pass. Browse openly or use the filters as a chapter index.
            </p>
            <div className="mt-8 flex items-center gap-2 border-b border-[var(--hair-warm)] pb-2">
              <Search className="h-4 w-4 text-[var(--storm-55)]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search the archive…"
                className="canvas-input w-full text-sm border-0"
              />
              {search && (
                <button onClick={() => setSearch("")} aria-label="Clear" className="text-[var(--storm-55)] hover:text-[var(--ink)]">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Filter rail */}
      <section className="border-y border-[var(--hair-warm)]">
        <div className="container-edge container-wide flex items-center justify-between gap-6 py-5">
          <p className="eyebrow text-[var(--storm-55)] hidden md:block">Filter</p>
          <div className="flex w-full items-center gap-8 overflow-x-auto no-scrollbar md:justify-center">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className="group relative shrink-0 text-[12px] uppercase tracking-[0.28em] text-[var(--storm-55)] transition-colors hover:text-[var(--ink)]"
              >
                <span className={clsx("relative", activeFilter === f.id && "text-[var(--ink)]")}>
                  {f.label}
                  {activeFilter === f.id && (
                    <motion.span
                      layoutId="filter-line"
                      className="absolute -bottom-[6px] left-0 right-0 h-px bg-[var(--ink)]"
                    />
                  )}
                </span>
              </button>
            ))}
          </div>
          <p className="eyebrow text-[var(--storm-55)] hidden md:block tabular">
            {loading ? "—" : filtered.length} pieces
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="container-edge container-wide pb-32 pt-20">
        {loading ? (
          <div className="grid grid-cols-2 gap-x-8 gap-y-16 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <div className="shimmer aspect-portrait" />
                <div className="shimmer mt-5 h-4 w-3/4" />
                <div className="shimmer mt-2 h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-32 text-center">
            <p className="font-display text-display-md text-[var(--ink)]">Nothing in this chapter.</p>
            <button
              onClick={() => { setActiveFilter("all"); setSearch(""); }}
              className="link-reveal mt-6 text-[12px] uppercase tracking-[0.28em] text-[var(--storm-55)]"
            >
              Reset the filters
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter + search}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease }}
              className="grid grid-cols-2 gap-x-8 gap-y-16 md:grid-cols-3 lg:grid-cols-4"
            >
              {filtered.map((product, i) => (
                <EditorialTile key={product.id} product={product} index={i} tall={i % 7 === 3} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </section>

      <Footer />
    </main>
  );
}
