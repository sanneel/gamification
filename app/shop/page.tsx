"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Filter, Gift, Search, ShoppingCart, SlidersHorizontal, X } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { type Product, type ProductCategory, type Audience, type Vibe } from "@/lib/types";
import { useCartStore } from "@/lib/stores/cart";
import { useUIStore } from "@/lib/stores/ui";

const DEMO_PRODUCTS: Product[] = [
  { id: "p1", title: "Preserved Rose Box", description: "Velvet-toned roses for a breathtaking opening moment.", normalPrice: 4900, boxPrice: 3900, images: ["https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=600&q=80"], stock: 12, active: true, category: "main_surprise", audience: "for_her", vibes: ["romantic", "luxury"], tags: [] },
  { id: "p2", title: "Gold Initial Necklace", description: "A personal keepsake chosen just for them.", normalPrice: 5900, boxPrice: 4800, images: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"], stock: 8, active: true, category: "main_surprise", audience: "for_her", vibes: ["luxury", "aesthetic"], tags: [] },
  { id: "p3", title: "Vintage Leather Wallet", description: "Slim, premium, and instantly stylish.", normalPrice: 4500, boxPrice: 3600, images: ["https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80"], stock: 15, active: true, category: "main_surprise", audience: "for_him", vibes: ["luxury", "aesthetic"], tags: [] },
  { id: "p4", title: "Signature Soy Candle", description: "Warm amber, soft wax — an evening-in feeling.", normalPrice: 2800, boxPrice: 2200, images: ["https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80"], stock: 25, active: true, category: "sweet_pick", audience: "neutral", vibes: ["cozy", "romantic"], tags: [] },
  { id: "p5", title: "Crystal Perfume Bottle", description: "A luxury fragrance experience in a sculpted bottle.", normalPrice: 6500, boxPrice: 5200, images: ["https://images.unsplash.com/photo-1541643600914-78b084683702?auto=format&fit=crop&w=600&q=80"], stock: 6, active: true, category: "main_surprise", audience: "for_her", vibes: ["luxury", "aesthetic"], tags: [] },
  { id: "p6", title: "Couple's Polaroid Set", description: "Capture the best moments together.", normalPrice: 3200, boxPrice: 2600, images: ["https://images.unsplash.com/photo-1525909002-1b05e0c869d8?auto=format&fit=crop&w=600&q=80"], stock: 10, active: true, category: "sweet_pick", audience: "couple", vibes: ["cute", "romantic"], tags: [] },
  { id: "p7", title: "Artisan Chocolate Box", description: "Hand-crafted truffles tucked inside tissue.", normalPrice: 1800, boxPrice: 1400, images: ["https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80"], stock: 30, active: true, category: "tiny_extra", audience: "neutral", vibes: ["cute", "cozy"], tags: [] },
  { id: "p8", title: "Plush Teddy Bear", description: "Soft, huggable, and impossibly cute.", normalPrice: 2200, boxPrice: 1800, images: ["https://images.unsplash.com/photo-1563901935883-cb61f5d49be4?auto=format&fit=crop&w=600&q=80"], stock: 20, active: true, category: "tiny_extra", audience: "for_her", vibes: ["cute", "soft"], tags: [] },
  { id: "p9", title: "Mechanical Keyboard Set", description: "RGB backlit, clicky, and satisfyingly loud.", normalPrice: 8900, boxPrice: 7200, images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80"], stock: 5, active: true, category: "main_surprise", audience: "for_him", vibes: ["gamer", "aesthetic"], tags: [] },
  { id: "p10", title: "Rose Quartz Face Roller", description: "Cooling, soothing, and visually stunning.", normalPrice: 3100, boxPrice: 2500, images: ["https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=600&q=80"], stock: 18, active: true, category: "sweet_pick", audience: "for_her", vibes: ["cozy", "soft", "aesthetic"], tags: [] },
  { id: "p11", title: "Gold Foil Greeting Card", description: "A quiet, luxurious finishing touch.", normalPrice: 600, boxPrice: 400, images: ["https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=600&q=80"], stock: 50, active: true, category: "tiny_extra", audience: "neutral", vibes: ["romantic", "cute"], tags: [] },
  { id: "p12", title: "Cashmere Eye Mask", description: "The luxurious sleep essential they always wanted.", normalPrice: 2600, boxPrice: 2100, images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80"], stock: 14, active: true, category: "sweet_pick", audience: "for_her", vibes: ["cozy", "luxury", "soft"], tags: [] },
];

const AUDIENCES: { id: Audience; label: string; emoji: string }[] = [
  { id: "for_her", label: "For Her", emoji: "💗" },
  { id: "for_him", label: "For Him", emoji: "💙" },
  { id: "couple", label: "For Couples", emoji: "💑" },
  { id: "neutral", label: "Neutral", emoji: "🎁" },
];
const VIBES: { id: Vibe; label: string; emoji: string }[] = [
  { id: "romantic", label: "Romantic", emoji: "🌹" },
  { id: "luxury", label: "Luxury", emoji: "💎" },
  { id: "cozy", label: "Cozy", emoji: "🕯️" },
  { id: "cute", label: "Cute", emoji: "🧸" },
  { id: "aesthetic", label: "Aesthetic", emoji: "🎨" },
  { id: "gamer", label: "Gamer", emoji: "🎮" },
  { id: "funny", label: "Funny", emoji: "😂" },
  { id: "soft", label: "Soft", emoji: "☁️" },
];
const CATEGORIES: { id: ProductCategory; label: string }[] = [
  { id: "main_surprise", label: "Main Surprise" },
  { id: "sweet_pick", label: "Sweet Pick" },
  { id: "tiny_extra", label: "Tiny Extra" },
  { id: "lucky_bonus", label: "Lucky Bonus" },
];

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopSkeleton />}>
      <ShopContent />
    </Suspense>
  );
}

function ShopSkeleton() {
  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <div className="sticky top-0 z-40 bg-[#0D0D0D]/90 backdrop-blur-xl border-b border-white/5 px-4 py-4 h-[65px]" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl bg-card animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [boxItems, setBoxItems] = useState<Product[]>([]);
  const cartItems = useCartStore((s) => s.items);
  const cartCount = cartItems.reduce((n, i) => n + i.quantity, 0);
  const openMiniCart = useUIStore((s) => s.openMiniCart);
  const [selectedAudience, setSelectedAudience] = useState<Audience | null>(
    (searchParams.get("audience") as Audience | null) ?? null,
  );
  const [selectedVibes, setSelectedVibes] = useState<Vibe[]>(
    searchParams.get("vibe") ? [searchParams.get("vibe") as Vibe] : [],
  );
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => (r.ok ? r.json() : { products: [] }))
      .then((d) => setProducts(d.products?.length ? d.products : DEMO_PRODUCTS))
      .catch(() => setProducts(DEMO_PRODUCTS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = products;
    if (search) list = list.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));
    if (selectedAudience) list = list.filter((p) => p.audience === selectedAudience || p.audience === "neutral");
    if (selectedVibes.length) list = list.filter((p) => selectedVibes.some((v) => p.vibes.includes(v)));
    if (selectedCategory) list = list.filter((p) => p.category === selectedCategory);
    return list;
  }, [products, search, selectedAudience, selectedVibes, selectedCategory]);

  function toggleVibe(v: Vibe) {
    setSelectedVibes((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  }

  function addToBox(product: Product) {
    setBoxItems((prev) => {
      if (prev.find((p) => p.id === product.id)) return prev;
      const replaced = prev.some((p) => p.category === product.category);
      if (replaced) return prev.map((p) => (p.category === product.category ? product : p));
      return [...prev.slice(0, 2), product];
    });
  }

  const hasFilters = selectedAudience || selectedVibes.length || selectedCategory;

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-[#0D0D0D]/90 backdrop-blur-xl border-b border-white/5 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Link href="/" className="font-display text-xl font-bold text-white shrink-0">
            gamif<span className="text-accent">.</span>
          </Link>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search gifts..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all shrink-0 ${
              filtersOpen || hasFilters
                ? "bg-accent/10 border-accent/40 text-accent"
                : "glass border-white/10 text-white/60 hover:text-white"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {hasFilters && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full text-[9px] font-black flex items-center justify-center text-white">
                {[selectedAudience, ...selectedVibes, selectedCategory].filter(Boolean).length}
              </span>
            )}
          </button>
          {boxItems.length > 0 && (
            <Link
              href="/build-a-box"
              className="flex items-center gap-2 bg-accent/10 border border-accent/30 text-accent text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-accent/20 transition-all shrink-0"
            >
              <Gift className="w-4 h-4" />
              Box ({boxItems.length}/3)
            </Link>
          )}
          <motion.button
            onClick={openMiniCart}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            className="relative w-10 h-10 glass border border-white/10 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:border-white/25 transition-colors shrink-0"
            aria-label="Open cart"
          >
            <ShoppingCart className="w-4 h-4" />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-accent text-white text-[10px] font-black rounded-full flex items-center justify-center"
                >
                  {cartCount > 9 ? "9+" : cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Filters panel */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="max-w-7xl mx-auto pt-4 pb-2 space-y-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">For</p>
                  <div className="flex gap-2 flex-wrap">
                    {AUDIENCES.map((a) => (
                      <button key={a.id} onClick={() => setSelectedAudience(selectedAudience === a.id ? null : a.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${selectedAudience === a.id ? "bg-accent/20 border-accent/50 text-accent" : "glass border-white/10 text-white/50 hover:text-white"}`}>
                        {a.emoji} {a.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Vibe</p>
                  <div className="flex gap-2 flex-wrap">
                    {VIBES.map((v) => (
                      <button key={v.id} onClick={() => toggleVibe(v.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${selectedVibes.includes(v.id) ? "bg-violet/20 border-violet/50 text-violet-2" : "glass border-white/10 text-white/50 hover:text-white"}`}>
                        {v.emoji} {v.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Category</p>
                  <div className="flex gap-2 flex-wrap">
                    {CATEGORIES.map((c) => (
                      <button key={c.id} onClick={() => setSelectedCategory(selectedCategory === c.id ? null : c.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${selectedCategory === c.id ? "bg-gold/20 border-gold/50 text-gold" : "glass border-white/10 text-white/50 hover:text-white"}`}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
                {hasFilters && (
                  <button onClick={() => { setSelectedAudience(null); setSelectedVibes([]); setSelectedCategory(null); }}
                    className="flex items-center gap-1.5 text-xs text-white/40 hover:text-accent transition-colors">
                    <X className="w-3 h-3" /> Clear all
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold text-white">
              {selectedAudience ? AUDIENCES.find((a) => a.id === selectedAudience)?.label : "All Gifts"}
            </h1>
            {!loading && <p className="text-white/40 text-sm mt-1">{filtered.length} products</p>}
          </div>
          <Link href="/build-a-box" className="btn-dopamine hidden sm:flex items-center gap-2 px-5 py-3 rounded-xl text-sm">
            <Gift className="w-4 h-4" /> Build a Box
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-card animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">🎁</p>
            <p className="text-white/50 font-bold text-lg">No products match your filters.</p>
          </div>
        ) : (
          <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5" layout>
            <AnimatePresence>
              {filtered.map((product) => (
                <motion.div key={product.id} layout exit={{ opacity: 0, scale: 0.9 }}>
                  <ProductCard
                    product={product}
                    onAddToBox={addToBox}
                    isInBox={boxItems.some((b) => b.id === product.id)}
                    showBoxAction
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Floating box bar */}
      <AnimatePresence>
        {boxItems.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4"
          >
            <div className="max-w-lg mx-auto glass-strong border border-accent/20 rounded-2xl p-4 flex items-center gap-4" style={{ boxShadow: "0 0 40px rgba(255,45,120,0.3)" }}>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm">Your Box ({boxItems.length}/3)</p>
                <p className="text-white/50 text-xs mt-0.5 truncate">{boxItems.map((b) => b.title).join(" · ")}</p>
              </div>
              <button onClick={() => setBoxItems([])} className="p-2 glass rounded-xl border border-white/10 text-white/40 hover:text-white transition-colors shrink-0">
                <X className="w-4 h-4" />
              </button>
              <Link href="/build-a-box" className="btn-dopamine px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shrink-0">
                <Gift className="w-4 h-4" />
                {boxItems.length >= 3 ? "Complete Box" : `${3 - boxItems.length} more`}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
