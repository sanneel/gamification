"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Search, ShoppingCart, X } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart";
import { useUIStore } from "@/lib/stores/ui";
import { springs, ease } from "@/lib/motion";
import { type Product, type Audience, type Vibe, formatGELSimple, savingsPct } from "@/lib/types";

const DEMO: Product[] = [
  { id: "p1",  title: "Preserved Rose Box",      description: "Velvet-toned roses. A breathtaking reveal.",           normalPrice: 4900, boxPrice: 3900, images: ["https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=700&q=85"], stock: 12, active: true, category: "main_surprise", audience: "for_her", vibes: ["romantic","luxury"],    tags: [] },
  { id: "p2",  title: "Gold Initial Necklace",   description: "A personal keepsake chosen just for them.",            normalPrice: 5900, boxPrice: 4800, images: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=700&q=85"], stock:  8, active: true, category: "main_surprise", audience: "for_her", vibes: ["luxury","aesthetic"], tags: [] },
  { id: "p3",  title: "Vintage Leather Wallet",  description: "Slim, premium, and instantly stylish.",                normalPrice: 4500, boxPrice: 3600, images: ["https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=700&q=85"], stock: 15, active: true, category: "main_surprise", audience: "for_him", vibes: ["luxury","aesthetic"], tags: [] },
  { id: "p4",  title: "Signature Soy Candle",    description: "Warm amber, soft wax — an evening-in feeling.",        normalPrice: 2800, boxPrice: 2200, images: ["https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=700&q=85"], stock: 25, active: true, category: "sweet_pick",    audience: "neutral",  vibes: ["cozy","romantic"],  tags: [] },
  { id: "p5",  title: "Crystal Perfume Bottle",  description: "A luxury fragrance in a sculpted bottle.",             normalPrice: 6500, boxPrice: 5200, images: ["https://images.unsplash.com/photo-1541643600914-78b084683702?auto=format&fit=crop&w=700&q=85"], stock:  6, active: true, category: "main_surprise", audience: "for_her", vibes: ["luxury","aesthetic"], tags: [] },
  { id: "p6",  title: "Couple's Polaroid Set",   description: "Capture the best moments together.",                   normalPrice: 3200, boxPrice: 2600, images: ["https://images.unsplash.com/photo-1525909002-1b05e0c869d8?auto=format&fit=crop&w=700&q=85"], stock: 10, active: true, category: "sweet_pick",    audience: "couple",   vibes: ["cute","romantic"],  tags: [] },
  { id: "p7",  title: "Artisan Chocolate Box",   description: "Hand-crafted truffles tucked inside tissue.",          normalPrice: 1800, boxPrice: 1400, images: ["https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=700&q=85"], stock: 30, active: true, category: "tiny_extra",    audience: "neutral",  vibes: ["cute","cozy"],      tags: [] },
  { id: "p8",  title: "Plush Teddy Bear",        description: "Soft, huggable, and impossibly cute.",                 normalPrice: 2200, boxPrice: 1800, images: ["https://images.unsplash.com/photo-1563901935883-cb61f5d49be4?auto=format&fit=crop&w=700&q=85"], stock: 20, active: true, category: "tiny_extra",    audience: "for_her",  vibes: ["cute","soft"],      tags: [] },
  { id: "p9",  title: "Mechanical Keyboard Set", description: "RGB backlit, clicky, and satisfyingly loud.",          normalPrice: 8900, boxPrice: 7200, images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=700&q=85"], stock:  5, active: true, category: "main_surprise", audience: "for_him",  vibes: ["gamer","aesthetic"],tags: [] },
  { id: "p10", title: "Rose Quartz Face Roller", description: "Cooling, soothing, and visually stunning.",            normalPrice: 3100, boxPrice: 2500, images: ["https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=700&q=85"], stock: 18, active: true, category: "sweet_pick",    audience: "for_her",  vibes: ["cozy","soft","aesthetic"], tags: [] },
  { id: "p11", title: "Gold Foil Greeting Card", description: "A quiet, luxurious finishing touch.",                  normalPrice:  600, boxPrice:  400, images: ["https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=700&q=85"], stock: 50, active: true, category: "tiny_extra",    audience: "neutral",  vibes: ["romantic","cute"],  tags: [] },
  { id: "p12", title: "Cashmere Eye Mask",       description: "The luxurious sleep essential they always wanted.",    normalPrice: 2600, boxPrice: 2100, images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=700&q=85"], stock: 14, active: true, category: "sweet_pick",    audience: "for_her",  vibes: ["cozy","luxury","soft"], tags: [] },
];

const FILTERS: { id: string; label: string; audience?: Audience; vibes?: Vibe[] }[] = [
  { id: "all",       label: "All" },
  { id: "for_her",   label: "For Her",   audience: "for_her" },
  { id: "for_him",   label: "For Him",   audience: "for_him" },
  { id: "romantic",  label: "Romantic",  vibes: ["romantic"] },
  { id: "luxury",    label: "Luxury",    vibes: ["luxury"] },
  { id: "cozy",      label: "Cozy",      vibes: ["cozy"] },
  { id: "aesthetic", label: "Aesthetic", vibes: ["aesthetic"] },
  { id: "cute",      label: "Cute",      vibes: ["cute"] },
];

// ─── Canvas product card ──────────────────────────────────────────────────────

function CanvasCard({ product, tall = false }: { product: Product; tall?: boolean }) {
  const addToCart = useCartStore((s) => s.addItem);
  const openMiniCart = useUIStore((s) => s.openMiniCart);
  const [cartAdded, setCartAdded] = useState(false);
  const pct = savingsPct(product);

  function handleCart(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    addToCart(product);
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 2000);
    setTimeout(() => openMiniCart(), 250);
  }

  return (
    <Link href={`/shop/${product.id}`}>
      <motion.article
        className="group cursor-pointer"
        whileHover="hover"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

        {/* Image */}
        <div className="relative overflow-hidden mb-4"
          style={{ aspectRatio: tall ? "2/3" : "3/4" }}>
          <motion.div className="absolute inset-0"
            variants={{ hover: { scale: 1.04 } }} transition={{ duration: 0.7, ease: ease.expo }}>
            <Image src={product.images[0]} alt={product.title} fill className="object-cover" sizes="(max-width:768px) 50vw, 25vw" />
          </motion.div>

          {/* Savings */}
          {pct >= 12 && (
            <div className="absolute top-3 left-3 box-badge">{pct}% off</div>
          )}

          {/* Add to cart hover */}
          <motion.button
            onClick={handleCart}
            initial={{ opacity: 0, y: 8 }}
            variants={{ hover: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.22 }}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-xs font-bold"
            style={{
              background: cartAdded ? "var(--storm)" : "rgba(245,230,163,0.9)",
              color: cartAdded ? "var(--butter)" : "var(--storm)",
              backdropFilter: "blur(8px)",
            }}>
            {cartAdded ? "✓" : "+"}
          </motion.button>
        </div>

        {/* Info */}
        <div>
          <div className="flex items-baseline justify-between mb-1">
            <h3 className="font-display text-base font-medium text-storm leading-tight">{product.title}</h3>
          </div>
          <p className="text-xs mb-2 leading-relaxed" style={{ color: "var(--storm-55)" }}>{product.description}</p>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-storm text-sm">{formatGELSimple(product.boxPrice)}</span>
            <span className="text-xs line-through" style={{ color: "var(--storm-35)" }}>{formatGELSimple(product.normalPrice)}</span>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}

// ─── Page wrapper ─────────────────────────────────────────────────────────────

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div style={{ background: "var(--butter)", minHeight: "100dvh" }} className="flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border border-storm/20 border-t-storm animate-spin" />
      </div>
    }>
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

  const cartItems = useCartStore((s) => s.items);
  const cartCount = cartItems.reduce((n, i) => n + i.quantity, 0);
  const openMiniCart = useUIStore((s) => s.openMiniCart);

  useEffect(() => {
    const audience = searchParams.get("audience");
    const vibe     = searchParams.get("vibe");
    if (audience) setActiveFilter(audience);
    else if (vibe) setActiveFilter(vibe);
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/products")
      .then(r => r.ok ? r.json() : { products: [] })
      .then(d => setProducts(d.products?.length ? d.products : DEMO))
      .catch(() => setProducts(DEMO))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = products;
    if (search) list = list.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
    const f = FILTERS.find(x => x.id === activeFilter);
    if (f?.audience) list = list.filter(p => p.audience === f.audience || p.audience === "neutral");
    if (f?.vibes?.length) list = list.filter(p => f.vibes!.some(v => p.vibes.includes(v)));
    return list;
  }, [products, search, activeFilter]);

  return (
    <div style={{ background: "var(--butter)", minHeight: "100dvh" }}>

      {/* Nav */}
      <nav className="sticky top-0 z-40 px-8 sm:px-12 h-16 flex items-center gap-6"
        style={{ background: "rgba(245,230,163,0.95)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--storm-12)" }}>
        <Link href="/" className="font-display text-xl font-bold text-storm shrink-0">
          gamif<span style={{ opacity: 0.35 }}>.</span>
        </Link>

        {/* Search */}
        <div className="flex-1 relative max-w-sm">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "var(--storm-35)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-6 pb-1 text-sm bg-transparent outline-none text-storm"
            style={{ borderBottom: "1px solid var(--storm-18)" }}
            onFocus={e => e.target.style.borderBottomColor = "var(--storm)"}
            onBlur={e => e.target.style.borderBottomColor = "var(--storm-18)"} />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-0 top-1/2 -translate-y-1/2"
              style={{ color: "var(--storm-35)" }}>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="ml-auto flex items-center gap-5 shrink-0">
          <Link href="/build-a-box" className="btn-primary hidden sm:block px-6 py-2.5 text-xs tracking-widest">
            Build a Box
          </Link>
          <button onClick={openMiniCart} className="relative" aria-label="Cart"
            style={{ color: "var(--storm-55)" }}>
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
        </div>
      </nav>

      {/* Filter bar */}
      <div className="px-8 sm:px-12 py-4 flex items-center gap-6 overflow-x-auto"
        style={{ borderBottom: "1px solid var(--storm-08)" }}>
        {FILTERS.map(f => (
          <button key={f.id} onClick={() => setActiveFilter(f.id)}
            className="eyebrow shrink-0 transition-colors hover:opacity-100"
            style={{
              color: activeFilter === f.id ? "var(--storm)" : "var(--storm-35)",
              textDecoration: activeFilter === f.id ? "underline" : "none",
              textUnderlineOffset: "4px",
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Page header */}
      <div className="px-8 sm:px-12 pt-12 pb-8">
        <motion.h1 className="font-display font-light text-storm leading-tight"
          style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: ease.expo }}>
          {FILTERS.find(f => f.id === activeFilter)?.label === "All"
            ? "All gifts."
            : `${FILTERS.find(f => f.id === activeFilter)?.label}.`}
        </motion.h1>
        {!loading && (
          <p className="eyebrow mt-2" style={{ color: "var(--storm-35)" }}>{filtered.length} items</p>
        )}
      </div>

      {/* Grid */}
      <div className="px-8 sm:px-12 pb-24">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <div className="shimmer mb-3" style={{ aspectRatio: "3/4" }} />
                <div className="shimmer h-4 mb-2 w-3/4" />
                <div className="shimmer h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-32 text-center">
            <p className="font-display text-2xl font-light text-storm mb-4">Nothing found.</p>
            <button onClick={() => { setActiveFilter("all"); setSearch(""); }}
              className="eyebrow hover:underline" style={{ color: "var(--storm-55)", textUnderlineOffset: "4px" }}>
              Clear filters
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={activeFilter + search}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-14">
              {filtered.map((product, i) => (
                <motion.div key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.5, ease: ease.expo }}>
                  <CanvasCard product={product} tall={i % 5 === 0} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
