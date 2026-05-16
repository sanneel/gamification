"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Check, Gift, Search, ShoppingCart, Sparkles, X } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart";
import { useUIStore } from "@/lib/stores/ui";
import { springs, ease } from "@/lib/motion";
import { type Product, type ProductCategory, type Audience, type Vibe, formatGELSimple, savingsPct } from "@/lib/types";

const DEMO_PRODUCTS: Product[] = [
  { id: "p1",  title: "Preserved Rose Box",       description: "Velvet-toned roses for a breathtaking opening moment.",              normalPrice: 4900, boxPrice: 3900, images: ["https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=600&q=80"], stock: 12, active: true, category: "main_surprise", audience: "for_her", vibes: ["romantic","luxury"],    tags: [] },
  { id: "p2",  title: "Gold Initial Necklace",    description: "A personal keepsake chosen just for them.",                          normalPrice: 5900, boxPrice: 4800, images: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"], stock:  8, active: true, category: "main_surprise", audience: "for_her", vibes: ["luxury","aesthetic"], tags: [] },
  { id: "p3",  title: "Vintage Leather Wallet",   description: "Slim, premium, and instantly stylish.",                              normalPrice: 4500, boxPrice: 3600, images: ["https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80"], stock: 15, active: true, category: "main_surprise", audience: "for_him", vibes: ["luxury","aesthetic"], tags: [] },
  { id: "p4",  title: "Signature Soy Candle",     description: "Warm amber, soft wax — an evening-in feeling.",                     normalPrice: 2800, boxPrice: 2200, images: ["https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80"], stock: 25, active: true, category: "sweet_pick",    audience: "neutral",  vibes: ["cozy","romantic"],  tags: [] },
  { id: "p5",  title: "Crystal Perfume Bottle",   description: "A luxury fragrance experience in a sculpted bottle.",                normalPrice: 6500, boxPrice: 5200, images: ["https://images.unsplash.com/photo-1541643600914-78b084683702?auto=format&fit=crop&w=600&q=80"], stock:  6, active: true, category: "main_surprise", audience: "for_her", vibes: ["luxury","aesthetic"], tags: [] },
  { id: "p6",  title: "Couple's Polaroid Set",    description: "Capture the best moments together.",                                 normalPrice: 3200, boxPrice: 2600, images: ["https://images.unsplash.com/photo-1525909002-1b05e0c869d8?auto=format&fit=crop&w=600&q=80"], stock: 10, active: true, category: "sweet_pick",    audience: "couple",   vibes: ["cute","romantic"],  tags: [] },
  { id: "p7",  title: "Artisan Chocolate Box",    description: "Hand-crafted truffles tucked inside tissue.",                        normalPrice: 1800, boxPrice: 1400, images: ["https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80"], stock: 30, active: true, category: "tiny_extra",    audience: "neutral",  vibes: ["cute","cozy"],      tags: [] },
  { id: "p8",  title: "Plush Teddy Bear",         description: "Soft, huggable, and impossibly cute.",                              normalPrice: 2200, boxPrice: 1800, images: ["https://images.unsplash.com/photo-1563901935883-cb61f5d49be4?auto=format&fit=crop&w=600&q=80"], stock: 20, active: true, category: "tiny_extra",    audience: "for_her",  vibes: ["cute","soft"],      tags: [] },
  { id: "p9",  title: "Mechanical Keyboard Set",  description: "RGB backlit, clicky, and satisfyingly loud.",                        normalPrice: 8900, boxPrice: 7200, images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80"], stock:  5, active: true, category: "main_surprise", audience: "for_him",  vibes: ["gamer","aesthetic"],tags: [] },
  { id: "p10", title: "Rose Quartz Face Roller",  description: "Cooling, soothing, and visually stunning.",                          normalPrice: 3100, boxPrice: 2500, images: ["https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=600&q=80"], stock: 18, active: true, category: "sweet_pick",    audience: "for_her",  vibes: ["cozy","soft","aesthetic"], tags: [] },
  { id: "p11", title: "Gold Foil Greeting Card",  description: "A quiet, luxurious finishing touch.",                               normalPrice:  600, boxPrice:  400, images: ["https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=600&q=80"], stock: 50, active: true, category: "tiny_extra",    audience: "neutral",  vibes: ["romantic","cute"],  tags: [] },
  { id: "p12", title: "Cashmere Eye Mask",        description: "The luxurious sleep essential they always wanted.",                  normalPrice: 2600, boxPrice: 2100, images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80"], stock: 14, active: true, category: "sweet_pick",    audience: "for_her",  vibes: ["cozy","luxury","soft"], tags: [] },
];

const MOODS: { id: string; label: string; emoji: string; audience?: Audience; vibes?: Vibe[] }[] = [
  { id: "all",      label: "Everything",    emoji: "✦" },
  { id: "for_her",  label: "For Her",       emoji: "💗", audience: "for_her" },
  { id: "for_him",  label: "For Him",       emoji: "💙", audience: "for_him" },
  { id: "romantic", label: "Romantic",      emoji: "🌹", vibes: ["romantic"] },
  { id: "luxury",   label: "Luxury",        emoji: "💎", vibes: ["luxury"] },
  { id: "cozy",     label: "Cozy",          emoji: "🕯️", vibes: ["cozy"] },
  { id: "aesthetic",label: "Aesthetic",     emoji: "🎨", vibes: ["aesthetic"] },
];

// ─── Editorial Product Card ────────────────────────────────────────────────────

function ShopCard({ product, large = false }: { product: Product; large?: boolean }) {
  const [hovered, setHovered] = useState(false);
  const addToCart = useCartStore((s) => s.addItem);
  const openMiniCart = useUIStore((s) => s.openMiniCart);
  const [added, setAdded] = useState(false);
  const pct = savingsPct(product);

  function handleCart(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    setTimeout(() => openMiniCart(), 300);
  }

  return (
    <Link href={`/shop/${product.id}`}>
      <motion.article
        className="group relative overflow-hidden rounded-2xl cursor-pointer"
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        style={{
          aspectRatio: large ? "3/4" : "4/5",
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}
        whileHover={{ y: -6, boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,45,120,0.15)" }}
        transition={springs.bouncy}>

        {/* Image */}
        <div className="absolute inset-0 overflow-hidden">
          <Image src={product.images[0]} alt={product.title} fill
            className={`object-cover transition-transform duration-700 ${hovered ? "scale-108" : "scale-100"}`}
            sizes="(max-width:768px) 100vw, 33vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
        </div>

        {/* Savings badge */}
        {pct >= 10 && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider text-white"
            style={{ background: "linear-gradient(135deg, #FF2D78, #7C3AED)" }}>
            -{pct}%
          </div>
        )}

        {/* Vibe tag */}
        {product.vibes[0] && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider text-white/60"
            style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}>
            {product.vibes[0]}
          </div>
        )}

        {/* Add to cart — hover reveal */}
        <AnimatePresence>
          {hovered && (
            <motion.button
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.18 }}
              onClick={handleCart}
              className="absolute top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white transition-all z-10"
              style={{ background: added ? "rgba(16,185,129,0.9)" : "rgba(255,45,120,0.9)", backdropFilter: "blur(12px)" }}>
              {added ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
          <p className="text-white/35 text-[9px] font-black uppercase tracking-widest mb-1">
            {product.category.replace("_", " ")}
          </p>
          <h3 className="font-bold text-white text-sm sm:text-base leading-snug mb-2.5">{product.title}</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-white font-black text-base">{formatGELSimple(product.boxPrice)}</span>
              <span className="text-white/25 text-xs line-through">{formatGELSimple(product.normalPrice)}</span>
            </div>
            <span className="text-[9px] font-black text-white px-2 py-0.5 rounded-full"
              style={{ background: "linear-gradient(135deg, #FF2D78, #7C3AED)" }}>
              <Sparkles className="inline w-2 h-2 mr-0.5" />Box
            </span>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}

// ─── Page Wrapper ─────────────────────────────────────────────────────────────

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-[#FF2D78] animate-spin" />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeMood, setActiveMood] = useState("all");
  const [boxItems, setBoxItems] = useState<Product[]>([]);

  const cartItems = useCartStore((s) => s.items);
  const cartCount = cartItems.reduce((n, i) => n + i.quantity, 0);
  const openMiniCart = useUIStore((s) => s.openMiniCart);

  // Initialise from search params
  useEffect(() => {
    const audience = searchParams.get("audience") as Audience | null;
    const vibe = searchParams.get("vibe") as Vibe | null;
    if (audience) setActiveMood(audience);
    else if (vibe) setActiveMood(vibe);
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/products")
      .then(r => r.ok ? r.json() : { products: [] })
      .then(d => setProducts(d.products?.length ? d.products : DEMO_PRODUCTS))
      .catch(() => setProducts(DEMO_PRODUCTS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = products;
    if (search) list = list.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || (p.description ?? "").toLowerCase().includes(search.toLowerCase()));
    const mood = MOODS.find(m => m.id === activeMood);
    if (mood?.audience) list = list.filter(p => p.audience === mood.audience || p.audience === "neutral");
    if (mood?.vibes?.length) list = list.filter(p => mood.vibes!.some(v => p.vibes.includes(v)));
    return list;
  }, [products, search, activeMood]);

  function addToBox(product: Product) {
    setBoxItems(prev => {
      if (prev.find(p => p.id === product.id)) return prev;
      if (prev.some(p => p.category === product.category)) return prev.map(p => p.category === product.category ? product : p);
      return [...prev.slice(0, 2), product];
    });
  }

  return (
    <div className="min-h-screen" style={{ background: "#050508" }}>
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 50% at 20% 20%, rgba(255,45,120,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(124,58,237,0.05) 0%, transparent 60%)" }} />

      {/* Nav */}
      <nav className="sticky top-0 z-50 px-5 sm:px-10 py-4 flex items-center gap-4"
        style={{ background: "rgba(5,5,8,0.92)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Link href="/" className="font-display text-xl font-bold text-white shrink-0">
          gamif<span style={{ color: "#FF2D78" }}>.</span>
        </Link>

        {/* Search */}
        <div className="flex-1 relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search gifts..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/20 outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            onFocus={e => e.target.style.borderColor = "rgba(255,45,120,0.4)"}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto shrink-0">
          <motion.button onClick={openMiniCart} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
            className="relative w-9 h-9 flex items-center justify-center text-white/40 hover:text-white transition-colors"
            aria-label="Cart">
            <ShoppingCart className="w-4 h-4" />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span key={cartCount} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  transition={springs.bouncy}
                  className="absolute -top-1 -right-1 w-4 h-4 text-[9px] font-black rounded-full flex items-center justify-center text-white"
                  style={{ background: "#FF2D78" }}>
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <Link href="/build-a-box">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider text-white"
              style={{ background: "linear-gradient(135deg, #FF2D78, #7C3AED)" }}>
              <Gift className="w-3.5 h-3.5" /> Build a Box
            </motion.div>
          </Link>
        </div>
      </nav>

      {/* Mood selector */}
      <div className="sticky top-[65px] z-40 px-5 sm:px-10 py-4 overflow-x-auto"
        style={{ background: "rgba(5,5,8,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="flex gap-2 min-w-max">
          {MOODS.map(mood => {
            const active = activeMood === mood.id;
            return (
              <motion.button
                key={mood.id}
                onClick={() => setActiveMood(mood.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0"
                style={active
                  ? { background: "#FF2D78", color: "white", boxShadow: "0 0 20px rgba(255,45,120,0.4)" }
                  : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)" }}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <span>{mood.emoji}</span>
                <span>{mood.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 sm:px-10 py-10 max-w-[1600px] mx-auto">
        {/* Count */}
        <AnimatePresence mode="wait">
          <motion.p key={activeMood + search} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-white/25 text-xs font-bold uppercase tracking-[0.2em] mb-8">
            {!loading && `${filtered.length} gifts available`}
          </motion.p>
        </AnimatePresence>

        {/* Product grid — mixed sizes */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-2xl animate-pulse"
                style={{ background: "rgba(255,255,255,0.04)" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div className="text-center py-32" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-5xl mb-4">🎁</p>
            <p className="font-display text-2xl font-bold text-white mb-2">Nothing here</p>
            <p className="text-white/30 text-sm mb-6">Try a different mood or search term.</p>
            <button onClick={() => { setActiveMood("all"); setSearch(""); }}
              className="text-sm font-bold text-white/50 hover:text-white transition-colors underline underline-offset-4">
              Clear filters
            </button>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMood + search}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-auto"
            >
              {filtered.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.5, ease: ease.expo }}
                  className={i === 0 || (i % 7 === 0) ? "col-span-2 md:col-span-1 lg:col-span-2 row-span-1" : ""}
                >
                  <ShopCard product={product} large={i === 0 || (i % 7 === 0)} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Build-a-box floating bar */}
      <AnimatePresence>
        {boxItems.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4">
            <div className="max-w-lg mx-auto rounded-2xl px-5 py-4 flex items-center gap-4"
              style={{ background: "rgba(5,5,8,0.95)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,45,120,0.2)", boxShadow: "0 -8px 40px rgba(255,45,120,0.15), 0 0 0 1px rgba(255,45,120,0.1)" }}>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm">Your Box ({boxItems.length}/3)</p>
                <p className="text-white/35 text-xs truncate">{boxItems.map(b => b.title).join(" · ")}</p>
              </div>
              <button onClick={() => setBoxItems([])} className="text-white/25 hover:text-white transition-colors p-1">
                <X className="w-4 h-4" />
              </button>
              <Link href="/build-a-box">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black text-white"
                  style={{ background: "linear-gradient(135deg, #FF2D78, #7C3AED)" }}>
                  <Gift className="w-4 h-4" />
                  {boxItems.length >= 3 ? "Complete" : `${3 - boxItems.length} more`}
                </motion.div>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
