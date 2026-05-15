"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Check, ShoppingCart, Sparkles, Zap } from "lucide-react";
import { type Product, formatGELSimple, savingsPct } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  onAddToBox?: (product: Product) => void;
  isInBox?: boolean;
  showBoxAction?: boolean;
}

export default function ProductCard({
  product,
  onAddToBox,
  isInBox = false,
  showBoxAction = true,
}: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const pct = savingsPct(product);
  const primaryImage = product.images[0] ?? "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80";
  const secondImage = product.images[1] ?? primaryImage;

  function handleAddToBox(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isInBox || !onAddToBox) return;
    onAddToBox(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  return (
    <motion.div
      className="group relative product-card"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/shop/${product.id}`} className="block">
        {/* Image container */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-card mb-4">
          {/* Primary image */}
          <Image
            src={primaryImage}
            alt={product.title}
            fill
            className={`object-cover transition-all duration-700 ${hovered ? "opacity-0 scale-105" : "opacity-100 scale-100"}`}
            sizes="(min-width: 1280px) 300px, (min-width: 768px) 50vw, 100vw"
          />
          {/* Secondary image on hover */}
          <Image
            src={secondImage}
            alt={product.title}
            fill
            className={`object-cover transition-all duration-700 ${hovered ? "opacity-100 scale-110" : "opacity-0 scale-100"}`}
            sizes="(min-width: 1280px) 300px, (min-width: 768px) 50vw, 100vw"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Savings badge */}
          {pct >= 5 && (
            <motion.div
              className="absolute top-3 left-3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
            >
              <span className="bg-accent text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full">
                -{pct}%
              </span>
            </motion.div>
          )}

          {/* Category badge */}
          <div className="absolute top-3 right-3">
            <span className="glass text-white/80 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/10">
              {categoryLabel(product.category)}
            </span>
          </div>

          {/* Add to Box CTA — visible on hover */}
          {showBoxAction && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 p-3"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: hovered ? 0 : 16, opacity: hovered ? 1 : 0 }}
              transition={{ duration: 0.25 }}
            >
              <button
                onClick={handleAddToBox}
                disabled={isInBox || !product.active || product.stock < 1}
                className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                  isInBox
                    ? "bg-emerald/20 text-emerald border border-emerald/30 cursor-default"
                    : "btn-dopamine"
                }`}
              >
                <AnimatePresence mode="wait">
                  {justAdded || isInBox ? (
                    <motion.span
                      key="added"
                      className="flex items-center gap-2"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                    >
                      <Check className="w-4 h-4" />
                      Added to Box
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      className="flex items-center gap-2"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                    >
                      <Sparkles className="w-4 h-4" />
                      Add to Box — {formatGELSimple(product.boxPrice)}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          )}

          {/* Out of stock overlay */}
          {(!product.active || product.stock < 1) && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-2xl">
              <span className="glass text-white/70 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-2">
          {/* Tags / vibes */}
          {product.vibes.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {product.vibes.slice(0, 2).map((v) => (
                <span key={v} className="text-[10px] font-bold uppercase tracking-wider text-violet-2 bg-violet/10 px-2 py-0.5 rounded-full">
                  {v}
                </span>
              ))}
            </div>
          )}

          <h3 className="font-bold text-white text-base leading-tight group-hover:text-accent transition-colors duration-200">
            {product.title}
          </h3>

          {product.description && (
            <p className="text-white/40 text-xs leading-relaxed line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Pricing block */}
          <div className="pt-1">
            <div className="flex items-end justify-between">
              <div>
                {/* Normal price — struck through */}
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-white/30 text-xs line-through">
                    {formatGELSimple(product.normalPrice)}
                  </span>
                  <span className="text-white/30 text-[10px]">normal</span>
                </div>
                {/* Box price — highlighted */}
                <div className="flex items-center gap-2">
                  <span className="text-white font-black text-xl">
                    {formatGELSimple(product.boxPrice)}
                  </span>
                  <span className="box-price-badge">
                    <Sparkles className="w-2.5 h-2.5" />
                    Box
                  </span>
                </div>
              </div>

              {/* Quick buy */}
              <motion.button
                onClick={(e) => {
                  e.preventDefault();
                  // Navigate to product page for individual purchase
                  window.location.href = `/shop/${product.id}?buy=normal`;
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 glass rounded-xl flex items-center justify-center border border-white/10 hover:border-white/30 transition-colors"
              >
                <ShoppingCart className="w-4 h-4 text-white/60" />
              </motion.button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function categoryLabel(cat: Product["category"]): string {
  const labels: Record<Product["category"], string> = {
    main_surprise: "Main",
    sweet_pick:    "Sweet",
    tiny_extra:    "Tiny",
    lucky_bonus:   "Lucky",
  };
  return labels[cat] ?? cat;
}
