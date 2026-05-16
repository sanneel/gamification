"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Minus, Plus, Trash2, X } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart";
import { formatGELSimple } from "@/lib/types";
import { springs, ease } from "@/lib/motion";
import Navbar from "@/components/Navbar";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();

  const subtotal = items.reduce((s, i) => s + i.product.normalPrice * i.quantity, 0);
  const shipping  = subtotal > 0 ? 500 : 0;
  const total     = subtotal + shipping;

  return (
    <div style={{ background: "var(--butter)", minHeight: "100dvh" }}>
      <Navbar />

      <div className="max-w-5xl mx-auto px-8 sm:px-12 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: ease.expo }}>

          <div className="flex items-baseline gap-4 mb-16">
            <h1 className="font-display font-light text-storm" style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}>Cart.</h1>
            {items.length > 0 && (
              <span className="eyebrow">{items.reduce((n, i) => n + i.quantity, 0)} items</span>
            )}
          </div>

          {items.length === 0 ? (
            <EmptyCart />
          ) : (
            <div className="grid lg:grid-cols-3 gap-16">
              <div className="lg:col-span-2">
                <div className="space-y-0" style={{ borderTop: "1px solid var(--storm-12)" }}>
                  <AnimatePresence mode="popLayout" initial={false}>
                    {items.map(item => (
                      <motion.div key={item.product.id} layout
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={springs.gentle}
                        className="flex items-center gap-6 py-6"
                        style={{ borderBottom: "1px solid var(--storm-12)" }}>

                        <div className="relative w-20 h-24 shrink-0 overflow-hidden">
                          <Image src={item.product.images[0]} alt={item.product.title} fill className="object-cover" sizes="80px" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="eyebrow mb-1">{item.product.category.replace("_", " ")}</p>
                          <p className="font-display text-lg font-medium text-storm mb-1">{item.product.title}</p>
                          <p className="text-sm" style={{ color: "var(--storm-55)" }}>{formatGELSimple(item.product.normalPrice)} each</p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} aria-label="Decrease"
                            className="w-7 h-7 flex items-center justify-center transition-opacity hover:opacity-50"
                            style={{ border: "1px solid var(--storm-18)", color: "var(--storm)" }}>
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium text-storm w-4 text-center tabular-nums">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} aria-label="Increase"
                            className="w-7 h-7 flex items-center justify-center transition-opacity hover:opacity-50"
                            style={{ border: "1px solid var(--storm-18)", color: "var(--storm)" }}>
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <p className="font-semibold text-storm shrink-0 tabular-nums w-16 text-right">
                          {formatGELSimple(item.product.normalPrice * item.quantity)}
                        </p>

                        <button onClick={() => removeItem(item.product.id)} aria-label="Remove"
                          className="shrink-0 transition-opacity hover:opacity-50" style={{ color: "var(--storm-35)" }}>
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <button onClick={clearCart}
                  className="flex items-center gap-2 mt-6 eyebrow hover:opacity-100 transition-opacity"
                  style={{ color: "var(--storm-35)" }}>
                  <Trash2 className="w-3 h-3" /> Clear cart
                </button>
              </div>

              {/* Summary */}
              <div>
                <div className="sticky top-24 p-8" style={{ background: "var(--butter-2)", border: "1px solid var(--storm-12)" }}>
                  <p className="font-display text-xl font-medium text-storm mb-8">Summary</p>
                  <div className="space-y-3 mb-8">
                    <div className="flex justify-between text-sm" style={{ color: "var(--storm-55)" }}>
                      <span>Subtotal</span><span className="tabular-nums">{formatGELSimple(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm" style={{ color: "var(--storm-55)" }}>
                      <span>Shipping</span><span className="tabular-nums">{formatGELSimple(shipping)}</span>
                    </div>
                    <div className="flex justify-between font-display text-2xl text-storm pt-4"
                      style={{ borderTop: "1px solid var(--storm-18)" }}>
                      <span>Total</span><span className="tabular-nums">{formatGELSimple(total)}</span>
                    </div>
                  </div>
                  <Link href="/checkout">
                    <motion.div whileHover={{ opacity: 0.85 }} whileTap={{ scale: 0.97 }}
                      className="btn-primary w-full py-4 text-xs tracking-widest text-center flex items-center justify-center gap-2 mb-3">
                      Checkout <ArrowRight className="w-3.5 h-3.5" />
                    </motion.div>
                  </Link>
                  <Link href="/build-a-box">
                    <motion.div whileHover={{ opacity: 0.7 }}
                      className="btn-outline w-full py-3 text-xs tracking-widest text-center">
                      Build a Mystery Box
                    </motion.div>
                  </Link>
                  <p className="text-center eyebrow mt-4" style={{ color: "var(--storm-35)" }}>
                    Secure · Gift-wrapped · GEL
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function EmptyCart() {
  return (
    <motion.div className="py-24 text-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
      <p className="font-display font-light text-storm mb-4" style={{ fontSize: "clamp(1.5rem, 4vw, 3rem)" }}>
        Your cart is empty.
      </p>
      <p className="mb-10 text-sm" style={{ color: "var(--storm-55)" }}>
        Add products from the shop, or build a curated mystery box.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/shop">
          <motion.div whileHover={{ opacity: 0.85 }} className="btn-primary px-8 py-4 text-xs tracking-widest">
            Browse Shop
          </motion.div>
        </Link>
        <Link href="/build-a-box">
          <motion.div whileHover={{ opacity: 0.75 }} className="btn-outline px-8 py-4 text-xs tracking-widest">
            Build a Box
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
}
