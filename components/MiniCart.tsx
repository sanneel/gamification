"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Minus, Plus, X } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart";
import { useUIStore } from "@/lib/stores/ui";
import { formatGELSimple } from "@/lib/types";
import { springs, ease } from "@/lib/motion";

export default function MiniCart() {
  const { items, removeItem, updateQuantity } = useCartStore();
  const { miniCartOpen, closeMiniCart } = useUIStore();

  const subtotal = items.reduce((s, i) => s + i.product.normalPrice * i.quantity, 0);
  const shipping  = subtotal > 0 ? 500 : 0;
  const total     = subtotal + shipping;

  return (
    <AnimatePresence>
      {miniCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeMiniCart}
            className="fixed inset-0 z-[60]"
            style={{ background: "rgba(58,74,92,0.35)", backdropFilter: "blur(4px)" }} />

          {/* Drawer */}
          <motion.aside key="drawer"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ ...springs.gentle, duration: 0.38 }}
            className="fixed right-0 top-0 bottom-0 z-[70] w-full max-w-sm flex flex-col"
            style={{ background: "var(--butter)", borderLeft: "1px solid var(--storm-12)" }}>

            {/* Header */}
            <div className="flex items-center justify-between px-8 py-5"
              style={{ borderBottom: "1px solid var(--storm-12)" }}>
              <p className="font-display text-lg font-medium text-storm">Cart</p>
              <button onClick={closeMiniCart} aria-label="Close"
                className="transition-opacity hover:opacity-50" style={{ color: "var(--storm)" }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
              {items.length === 0 ? (
                <motion.div className="flex flex-col items-center justify-center h-full text-center py-16"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <p className="font-display text-2xl font-light text-storm mb-3">Empty.</p>
                  <p className="text-sm mb-8" style={{ color: "var(--storm-55)" }}>Add products or build a mystery box.</p>
                  <Link href="/shop" onClick={closeMiniCart}
                    className="btn-primary px-8 py-3 text-xs tracking-widest">
                    Browse Shop
                  </Link>
                </motion.div>
              ) : (
                <AnimatePresence mode="popLayout" initial={false}>
                  {items.map(item => (
                    <motion.div key={item.product.id} layout
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      transition={springs.gentle}
                      className="flex gap-4">
                      <div className="relative w-16 h-20 shrink-0 overflow-hidden">
                        <Image src={item.product.images[0]} alt={item.product.title} fill className="object-cover" sizes="64px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-storm truncate mb-0.5">{item.product.title}</p>
                        <p className="eyebrow mb-3">{formatGELSimple(item.product.normalPrice)}</p>
                        <div className="flex items-center gap-3">
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="transition-opacity hover:opacity-50" style={{ color: "var(--storm-55)" }}>
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium text-storm tabular-nums w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="transition-opacity hover:opacity-50" style={{ color: "var(--storm-55)" }}>
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col justify-between items-end shrink-0">
                        <button onClick={() => removeItem(item.product.id)} aria-label="Remove"
                          className="transition-opacity hover:opacity-50" style={{ color: "var(--storm-35)" }}>
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <p className="text-sm font-semibold text-storm tabular-nums">
                          {formatGELSimple(item.product.normalPrice * item.quantity)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            <AnimatePresence>
              {items.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="px-8 py-6 space-y-4"
                  style={{ borderTop: "1px solid var(--storm-12)", background: "var(--butter-2)" }}>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm" style={{ color: "var(--storm-55)" }}>
                      <span>Subtotal</span><span>{formatGELSimple(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm" style={{ color: "var(--storm-55)" }}>
                      <span>Shipping</span><span>{formatGELSimple(shipping)}</span>
                    </div>
                    <div className="flex justify-between font-display text-xl text-storm pt-2"
                      style={{ borderTop: "1px solid var(--storm-18)" }}>
                      <span>Total</span><span>{formatGELSimple(total)}</span>
                    </div>
                  </div>
                  <Link href="/checkout" onClick={closeMiniCart}
                    className="btn-primary w-full py-4 text-xs tracking-widest flex items-center justify-center gap-2">
                    Checkout <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link href="/build-a-box" onClick={closeMiniCart}
                    className="btn-outline w-full py-3 text-xs tracking-widest flex items-center justify-center">
                    Build a Mystery Box
                  </Link>
                  <p className="text-center eyebrow" style={{ color: "var(--storm-35)" }}>
                    Secure · Gift-wrapped · GEL
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
