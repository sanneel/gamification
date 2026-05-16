"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import { Check, Eye, Heart, ShoppingCart, Sparkles, Star, X } from "lucide-react";
import { type Product, formatGELSimple, savingsPct, savings } from "@/lib/types";
import { useCartStore } from "@/lib/stores/cart";
import { springs, ease } from "@/lib/motion";

interface ProductCardProps {
  product: Product;
  onAddToBox?: (product: Product) => void;
  isInBox?: boolean;
  showBoxAction?: boolean;
  /** Builder mode: clicking the card body selects it — no Link navigation */
  inBuilder?: boolean;
}

// ─── Quick Preview Modal ──────────────────────────────────────────────────────

function QuickPreviewModal({
  product, onClose, onAddToBox, isInBox,
}: {
  product: Product;
  onClose: () => void;
  onAddToBox?: (p: Product) => void;
  isInBox: boolean;
}) {
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);
  const addToCart = useCartStore((s) => s.addItem);
  const [cartAdded, setCartAdded] = useState(false);
  const pct = savingsPct(product);
  const saved = savings(product);

  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation();
    if (isInBox || !onAddToBox) return;
    onAddToBox(product);
    setAdded(true);
    setTimeout(() => { setAdded(false); onClose(); }, 1400);
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.stopPropagation();
    addToCart(product);
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 2000);
  }

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <motion.div
        className="relative z-10 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden"
        style={{ background: "linear-gradient(160deg, #1a1a2e 0%, #0d0d0d 100%)", border: "1px solid rgba(255,255,255,0.08)" }}
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ ...springs.gentle, duration: 0.4 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-1" />

        <button
          onClick={onClose}
          aria-label="Close preview"
          className="absolute top-4 right-4 z-20 w-8 h-8 glass rounded-full border border-white/10 flex items-center justify-center hover:bg-white/15 transition-all"
        >
          <X className="w-4 h-4 text-white" />
        </button>

        <div className="flex flex-col sm:flex-row">
          <div className="relative w-full sm:w-52 aspect-square sm:aspect-auto shrink-0">
            <AnimatePresence mode="wait">
              <motion.div key={activeImg} className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: ease.expo }}>
                <Image src={product.images[activeImg] ?? product.images[0]} alt={product.title} fill className="object-cover" />
              </motion.div>
            </AnimatePresence>
            {product.images.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
                {product.images.map((_, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} aria-label={`Image ${i + 1}`}
                    className={`rounded-full transition-all ${i === activeImg ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40"}`} />
                ))}
              </div>
            )}
            {pct >= 5 && (
              <div className="absolute top-3 left-3 text-white text-[10px] font-black px-2.5 py-1 rounded-full"
                style={{ background: "linear-gradient(135deg, #FF2D78, #7C3AED)" }}>
                -{pct}%
              </div>
            )}
          </div>

          <div className="flex-1 p-5 flex flex-col gap-3">
            <div className="flex gap-1.5 flex-wrap">
              {product.vibes.slice(0, 2).map((v) => (
                <span key={v} className="text-[10px] font-bold uppercase tracking-wider text-violet-2 bg-violet/10 px-2 py-0.5 rounded-full">{v}</span>
              ))}
            </div>

            <h3 className="font-display text-xl font-bold text-white leading-tight">{product.title}</h3>
            <p className="text-white/45 text-sm leading-relaxed line-clamp-3">{product.description}</p>

            <div className="flex items-center gap-2">
              <div className="flex">{[1,2,3,4,5].map((s) => <Star key={s} className="w-3 h-3 fill-gold text-gold" />)}</div>
              <span className="text-white/35 text-xs">4.9 · {Math.floor(Math.random() * 300 + 100)} reviews</span>
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,45,120,0.15)" }}>
              <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between">
                <span className="text-white/25 text-xs">Normal</span>
                <span className="text-white/35 text-sm line-through font-bold">{formatGELSimple(product.normalPrice)}</span>
              </div>
              <div className="px-4 py-3 flex items-center justify-between" style={{ background: "rgba(255,45,120,0.07)" }}>
                <div>
                  <span className="box-price-badge text-[10px] flex items-center gap-1 mb-1"><Sparkles className="w-2 h-2" /> Box Price</span>
                  <span className="text-white font-black text-lg">{formatGELSimple(product.boxPrice)}</span>
                </div>
                <span className="text-accent text-xs font-bold">Save {formatGELSimple(saved)}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-auto pt-1">
              {onAddToBox && (
                <motion.button
                  onClick={handleAdd}
                  disabled={isInBox}
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    added || isInBox ? "bg-emerald/15 border border-emerald/40 text-emerald" : "btn-dopamine"
                  }`}
                  whileHover={{ scale: isInBox ? 1 : 1.03 }}
                  whileTap={{ scale: isInBox ? 1 : 0.96 }}
                >
                  <AnimatePresence mode="wait">
                    {added || isInBox
                      ? <motion.span key="added" className="flex items-center gap-2" initial={{ scale: 0.7 }} animate={{ scale: 1 }} transition={springs.bouncy}>
                          <Check className="w-3.5 h-3.5" /> Added!
                        </motion.span>
                      : <motion.span key="add" className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <Sparkles className="w-3.5 h-3.5" /> Add to Box
                        </motion.span>}
                  </AnimatePresence>
                </motion.button>
              )}

              <motion.button
                onClick={handleAddToCart}
                className={`px-4 py-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  cartAdded ? "border-emerald/40 text-emerald" : "border-white/10 text-white/50 hover:border-white/30 hover:text-white"
                }`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
              >
                {cartAdded ? <><Check className="w-3 h-3" /> Added</> : <><ShoppingCart className="w-3 h-3" /> Cart</>}
              </motion.button>

              <Link href={`/shop/${product.id}`}
                className="px-4 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/25 transition-all text-xs font-bold flex items-center justify-center">
                View →
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export default function ProductCard({
  product, onAddToBox, isInBox = false, showBoxAction = true, inBuilder = false,
}: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);
  const addToCart = useCartStore((s) => s.addItem);

  const pct = savingsPct(product);
  const primaryImage = product.images[0] ?? "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80";
  const secondImage = product.images[1] ?? primaryImage;

  const handleAddToBox = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInBox || !onAddToBox) return;
    onAddToBox(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2200);
  }, [isInBox, onAddToBox, product]);

  function handleBuilderClick() {
    if (!inBuilder || !onAddToBox || isInBox || !product.active) return;
    onAddToBox(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2200);
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 2000);
  }

  // The card body — identical in both modes, just wrapped differently
  const cardBody = (
    <>
      {/* Image container */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-card mb-3.5">
        <Image src={primaryImage} alt={product.title} fill
          className={`object-cover transition-all duration-700 ${hovered ? "opacity-0 scale-105" : "opacity-100 scale-100"}`}
          sizes="(min-width: 1280px) 300px, (min-width: 768px) 50vw, 100vw"
        />
        <Image src={secondImage} alt={product.title} fill
          className={`object-cover transition-all duration-700 ${hovered ? "opacity-100 scale-110" : "opacity-0 scale-100"}`}
          sizes="(min-width: 1280px) 300px, (min-width: 768px) 50vw, 100vw"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Savings badge */}
        {pct >= 5 && (
          <motion.div className="absolute top-3 left-3" initial={{ scale: 0, rotate: -12 }} animate={{ scale: 1, rotate: 0 }} transition={springs.bouncy}>
            <span className="text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-full"
              style={{ background: "linear-gradient(135deg, #FF2D78, #C026D3)" }}>
              -{pct}%
            </span>
          </motion.div>
        )}

        {/* In-box badge (builder mode) */}
        {inBuilder && isInBox && (
          <div className="absolute top-3 right-3 w-7 h-7 bg-emerald rounded-full flex items-center justify-center shadow-lg">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}

        {/* Hover action buttons (shop mode) */}
        {!inBuilder && (
          <>
            <motion.div
              className="absolute top-3 right-3 flex flex-col gap-2"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : 8 }}
              transition={{ duration: 0.2 }}
            >
              <motion.button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked((v) => !v); }}
                aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
                className="w-8 h-8 glass rounded-full border border-white/10 flex items-center justify-center hover:border-accent/50 transition-all"
                whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.88 }}
              >
                <Heart className={`w-3.5 h-3.5 transition-colors ${liked ? "fill-accent text-accent" : "text-white/50"}`} />
              </motion.button>
              <motion.button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowPreview(true); }}
                aria-label="Quick preview"
                className="w-8 h-8 glass rounded-full border border-white/10 flex items-center justify-center hover:border-white/30 transition-all"
                whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.88 }}
              >
                <Eye className="w-3.5 h-3.5 text-white/50" />
              </motion.button>
            </motion.div>

            {/* Add to Box CTA (hover) */}
            {showBoxAction && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 p-3"
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: hovered ? 0 : 16, opacity: hovered ? 1 : 0 }}
                transition={{ duration: 0.22 }}
              >
                <button
                  onClick={handleAddToBox}
                  disabled={isInBox || !product.active || product.stock < 1}
                  className={`w-full py-3 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                    isInBox ? "bg-emerald/20 text-emerald border border-emerald/30 cursor-default" : "btn-dopamine"
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {justAdded || isInBox
                      ? <motion.span key="added" className="flex items-center gap-2"
                          initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }} transition={springs.bouncy}>
                          <Check className="w-3.5 h-3.5" /> Added to Box
                        </motion.span>
                      : <motion.span key="add" className="flex items-center gap-2"
                          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                          <Sparkles className="w-3.5 h-3.5" />
                          Add to Box — {formatGELSimple(product.boxPrice)}
                        </motion.span>}
                  </AnimatePresence>
                </button>
              </motion.div>
            )}

            {/* Add to Cart (hover, no box action) */}
            {!showBoxAction && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 p-3"
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: hovered ? 0 : 16, opacity: hovered ? 1 : 0 }}
                transition={{ duration: 0.22 }}
              >
                <button
                  onClick={handleAddToCart}
                  disabled={!product.active || product.stock < 1}
                  className={`w-full py-3 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 btn-dopamine`}
                >
                  {cartAdded
                    ? <><Check className="w-3.5 h-3.5" /> Added!</>
                    : <><ShoppingCart className="w-3.5 h-3.5" /> Add to Cart — {formatGELSimple(product.normalPrice)}</>}
                </button>
              </motion.div>
            )}
          </>
        )}

        {/* Builder mode: tap anywhere overlay hint */}
        {inBuilder && !isInBox && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 p-3"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: hovered ? 0 : 16, opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.22 }}
          >
            <div className="w-full py-2.5 rounded-xl btn-dopamine text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> Select — {formatGELSimple(product.boxPrice)}
            </div>
          </motion.div>
        )}

        {/* Stock warning */}
        {product.active && product.stock > 0 && product.stock <= 4 && (
          <div className="absolute bottom-14 left-3 flex items-center gap-1.5">
            <motion.div className="w-1.5 h-1.5 rounded-full bg-gold" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
            <span className="text-gold text-[10px] font-bold">Only {product.stock} left</span>
          </div>
        )}

        {/* Out of stock */}
        {(!product.active || product.stock < 1) && (
          <div className="absolute inset-0 bg-black/65 flex items-center justify-center rounded-2xl">
            <span className="glass text-white/60 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-1.5 px-0.5">
        {product.vibes.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {product.vibes.slice(0, 2).map((v) => (
              <span key={v} className="text-[10px] font-bold uppercase tracking-wider text-violet-2 bg-violet/10 px-2 py-0.5 rounded-full">{v}</span>
            ))}
          </div>
        )}
        <h3 className={`font-bold text-sm leading-tight transition-colors duration-200 ${
          inBuilder && isInBox ? "text-emerald" : "text-white group-hover:text-accent"
        }`}>
          {product.title}
        </h3>
        <div className="flex items-center gap-2 pt-0.5">
          <span className="text-white/25 text-xs line-through">{formatGELSimple(product.normalPrice)}</span>
          <span className="text-white font-black text-base">{formatGELSimple(product.boxPrice)}</span>
          <span className="box-price-badge text-[9px] px-2 py-0.5"><Sparkles className="w-2 h-2" /> Box</span>
        </div>
      </div>
    </>
  );

  return (
    <>
      <AnimatePresence>
        {showPreview && (
          <QuickPreviewModal
            product={product}
            onClose={() => setShowPreview(false)}
            onAddToBox={onAddToBox ? (p) => { onAddToBox(p); setJustAdded(true); setTimeout(() => setJustAdded(false), 2200); } : undefined}
            isInBox={isInBox}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="group relative"
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.45, ease: ease.expo }}
      >
        {inBuilder ? (
          <div
            role="button"
            tabIndex={0}
            onClick={handleBuilderClick}
            onKeyDown={(e) => e.key === "Enter" && handleBuilderClick()}
            style={{ cursor: isInBox ? "default" : "pointer" }}
          >
            {cardBody}
          </div>
        ) : (
          <Link href={`/shop/${product.id}`} className="block">{cardBody}</Link>
        )}
      </motion.div>
    </>
  );
}

function categoryLabel(cat: Product["category"]): string {
  const labels: Record<Product["category"], string> = {
    main_surprise: "Main", sweet_pick: "Sweet", tiny_extra: "Tiny", lucky_bonus: "Lucky",
  };
  return labels[cat] ?? cat;
}
