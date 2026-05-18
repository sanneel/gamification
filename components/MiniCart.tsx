"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Minus, Plus, X } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart";
import { useUIStore } from "@/lib/stores/ui";
import { formatGELSimple } from "@/lib/types";

const ease = [0.16, 1, 0.3, 1] as const;

export default function MiniCart() {
  const { items, removeItem, updateQuantity } = useCartStore();
  const { miniCartOpen, closeMiniCart } = useUIStore();

  const subtotal = items.reduce((s, i) => s + i.product.normalPrice * i.quantity, 0);
  const shipping = subtotal > 0 ? 500 : 0;
  const total    = subtotal + shipping;

  return (
    <AnimatePresence>
      {miniCartOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={closeMiniCart}
            className="fixed inset-0 z-[100]"
            style={{ background: "rgba(11,11,12,0.55)", backdropFilter: "blur(8px)" }}
          />

          <motion.aside
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.75, ease }}
            className="fixed right-0 top-0 bottom-0 z-[110] flex w-full max-w-md flex-col surface-bone border-l border-[var(--hair-warm)]"
          >
            <div className="flex items-center justify-between container-edge h-20 border-b border-[var(--hair-warm)]">
              <div>
                <p className="eyebrow mb-1">The atelier</p>
                <p className="font-display text-2xl text-[var(--ink)]">Your selection.</p>
              </div>
              <button
                onClick={closeMiniCart}
                aria-label="Close"
                className="flex items-center gap-2 text-[var(--ink)]"
              >
                <span className="eyebrow">Close</span>
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto container-edge py-8">
              {items.length === 0 ? (
                <motion.div
                  className="flex h-full flex-col items-center justify-center py-24 text-center"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease }}
                >
                  <p className="eyebrow mb-4">Empty</p>
                  <p className="font-display text-display-sm text-[var(--ink)]">Nothing yet.</p>
                  <p className="mt-3 text-body-sm text-[var(--storm-55)] max-w-xs">
                    Build a mystery box or pick a single piece — the curtain rises when you do.
                  </p>
                  <div className="mt-10 flex flex-col gap-3">
                    <Link
                      href="/build-a-box"
                      onClick={closeMiniCart}
                      className="btn-cinematic btn-cinematic--primary"
                    >
                      Build a box
                    </Link>
                    <Link
                      href="/shop"
                      onClick={closeMiniCart}
                      className="link-reveal text-[12px] uppercase tracking-[0.22em] text-[var(--ink)]"
                    >
                      Browse the shop
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <ul className="space-y-8">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.product.id}
                        layout
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 24, height: 0 }}
                        transition={{ duration: 0.45, ease }}
                        className="flex gap-5"
                      >
                        <div className="relative h-28 w-20 shrink-0 overflow-hidden surface-bone-2">
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.title}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <p className="font-display text-lg text-[var(--ink)]">{item.product.title}</p>
                            <p className="eyebrow mt-1">{formatGELSimple(item.product.normalPrice)}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="text-[var(--storm-55)] transition-opacity hover:text-[var(--ink)]"
                              aria-label="Decrease"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="tabular w-4 text-center text-sm text-[var(--ink)]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="text-[var(--storm-55)] transition-opacity hover:text-[var(--ink)]"
                              aria-label="Increase"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-between text-right">
                          <button
                            onClick={() => removeItem(item.product.id)}
                            aria-label="Remove"
                            className="text-[var(--storm-35)] transition-colors hover:text-[var(--ink)]"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                          <p className="font-display text-lg text-[var(--ink)] tabular">
                            {formatGELSimple(item.product.normalPrice * item.quantity)}
                          </p>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            <AnimatePresence>
              {items.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.55, ease }}
                  className="container-edge border-t border-[var(--hair-warm)] py-8 space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-[var(--storm-55)]">
                      <span>Subtotal</span>
                      <span className="tabular">{formatGELSimple(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-[var(--storm-55)]">
                      <span>Delivery (Tbilisi)</span>
                      <span className="tabular">{formatGELSimple(shipping)}</span>
                    </div>
                    <div className="flex items-baseline justify-between border-t border-[var(--hair-warm)] pt-4">
                      <span className="eyebrow">Total · GEL</span>
                      <span className="font-display text-display-sm tabular">
                        {formatGELSimple(total)}
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={closeMiniCart}
                    className="btn-cinematic btn-cinematic--primary flex w-full items-center justify-center"
                  >
                    <span className="btn-cinematic__label flex items-center gap-3">
                      Checkout <ArrowRight className="h-3 w-3" />
                    </span>
                  </Link>
                  <Link
                    href="/build-a-box"
                    onClick={closeMiniCart}
                    className="link-reveal block text-center text-[11px] uppercase tracking-[0.32em] text-[var(--ink)]"
                  >
                    Build a mystery box instead
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
