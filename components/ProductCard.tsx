"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useState } from "react";
import { Check, Plus } from "lucide-react";
import clsx from "clsx";
import { type Product, formatGELSimple, savingsPct } from "@/lib/types";
import { useCartStore } from "@/lib/stores/cart";
import { useUIStore } from "@/lib/stores/ui";

const ease = [0.16, 1, 0.3, 1] as const;

interface Props {
  product: Product;
  onAddToBox?: (product: Product) => void;
  isInBox?: boolean;
  showBoxAction?: boolean;
  inBuilder?: boolean;
  index?: number;
  aspect?: "portrait" | "editorial" | "square" | "card";
}

/**
 * Editorial product card.  Image first, restrained typography below, single
 * accent moment on hover.  Works in three modes:
 *  – Shop link (default)
 *  – Builder picker (inBuilder)
 *  – Cart action when no builder is provided
 */
export default function ProductCard({
  product,
  onAddToBox,
  isInBox = false,
  showBoxAction = true,
  inBuilder = false,
  index = 0,
  aspect = "card",
}: Props) {
  const [hovered, setHovered]   = useState(false);
  const [justAdded, setAdded]   = useState(false);
  const [cartAdded, setCart]    = useState(false);
  const addToCart   = useCartStore((s) => s.addItem);
  const openCart    = useUIStore((s) => s.openMiniCart);

  const pct      = savingsPct(product);
  const primary  = product.images[0] ?? "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80";
  const second   = product.images[1] ?? primary;
  const aspectCls = aspect === "portrait" ? "aspect-portrait"
                   : aspect === "editorial" ? "aspect-editorial"
                   : aspect === "square" ? "aspect-square"
                   : "aspect-card";

  const handleAddToBox = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInBox || !onAddToBox) return;
    onAddToBox(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }, [isInBox, onAddToBox, product]);

  function handleBuilderTap() {
    if (!inBuilder || !onAddToBox || isInBox || !product.active) return;
    onAddToBox(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setCart(true);
    setTimeout(() => setCart(false), 1600);
    setTimeout(() => openCart(), 220);
  }

  const body = (
    <motion.article
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, ease, delay: Math.min(index, 8) * 0.05 }}
      className={clsx(
        "group relative flex h-full flex-col",
        inBuilder && "select-none",
      )}
      data-cursor="hover"
    >
      {/* Image */}
      <div className={clsx("relative w-full overflow-hidden surface-bone-2", aspectCls)}>
        <Image
          src={primary}
          alt={product.title}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
          className={clsx(
            "object-cover transition-all duration-[900ms] ease-out",
            hovered ? "opacity-0 scale-105" : "opacity-100 scale-100",
          )}
        />
        <Image
          src={second}
          alt=""
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
          className={clsx(
            "object-cover transition-all duration-[900ms] ease-out",
            hovered ? "opacity-100 scale-105" : "opacity-0 scale-100",
          )}
        />

        {pct >= 8 && (
          <div className="absolute left-4 top-4">
            <span className="box-badge--outline box-badge">−{pct}%</span>
          </div>
        )}

        {inBuilder && isInBox && (
          <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--ink)] text-[var(--bone)] shadow-deep">
            <Check className="h-4 w-4" />
          </div>
        )}

        {/* Bottom hover action */}
        {!inBuilder && (
          <motion.div
            className="absolute inset-x-4 bottom-4"
            initial={false}
            animate={{ y: hovered ? 0 : 16, opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.4, ease }}
          >
            <button
              onClick={showBoxAction ? handleAddToBox : handleCart}
              disabled={!product.active || product.stock < 1}
              className="flex w-full items-center justify-between bg-[var(--ink)] px-4 py-3 text-[10px] tracking-[0.28em] uppercase text-[var(--bone)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--ink)]"
            >
              <AnimatePresence mode="wait" initial={false}>
                {justAdded || isInBox ? (
                  <motion.span
                    key="added"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center gap-2"
                  >
                    <Check className="h-3 w-3" /> Added
                  </motion.span>
                ) : cartAdded ? (
                  <motion.span key="cart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                    <Check className="h-3 w-3" /> In cart
                  </motion.span>
                ) : (
                  <motion.span key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-between w-full">
                    <span>{showBoxAction ? "Add to box" : "Add to cart"}</span>
                    <span className="tabular">{formatGELSimple(showBoxAction ? product.boxPrice : product.normalPrice)}</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </motion.div>
        )}

        {/* Builder hint */}
        {inBuilder && !isInBox && (
          <motion.div
            className="absolute inset-x-4 bottom-4"
            initial={false}
            animate={{ y: hovered ? 0 : 12, opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.4, ease }}
          >
            <div className="flex items-center justify-between border border-[var(--bone)] bg-[var(--ink)]/85 px-4 py-3 text-[10px] tracking-[0.28em] uppercase text-[var(--bone)] backdrop-blur-md">
              <span className="flex items-center gap-2"><Plus className="h-3 w-3" /> Select piece</span>
              <span className="tabular">{formatGELSimple(product.boxPrice)}</span>
            </div>
          </motion.div>
        )}

        {/* Stock state */}
        {(!product.active || product.stock < 1) && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--ink)]/70 text-[var(--bone)]">
            <span className="eyebrow">Out of stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 pt-5">
        {product.vibes.length > 0 && (
          <p className="eyebrow text-[var(--storm-55)]">{product.vibes.slice(0, 2).join(" / ")}</p>
        )}
        <h3 className="font-display text-headline text-[var(--ink)]">{product.title}</h3>
        {product.description && (
          <p className="mt-1 text-body-sm text-[var(--storm-55)] line-clamp-2">{product.description}</p>
        )}
        <div className="mt-3 flex items-baseline gap-3">
          <span className="font-display text-xl text-[var(--ink)] tabular">
            {formatGELSimple(product.boxPrice)}
          </span>
          {product.normalPrice !== product.boxPrice && (
            <span className="text-[var(--storm-35)] line-through text-sm tabular">
              {formatGELSimple(product.normalPrice)}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );

  if (inBuilder) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={handleBuilderTap}
        onKeyDown={(e) => e.key === "Enter" && handleBuilderTap()}
        className={clsx("cursor-pointer outline-none", isInBox && "cursor-default")}
        style={{ outline: isInBox ? "1.5px solid var(--ink)" : "none" }}
      >
        {body}
      </div>
    );
  }

  return (
    <Link href={`/shop/${product.id}`} className="block">
      {body}
    </Link>
  );
}
