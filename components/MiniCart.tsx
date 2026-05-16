"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Minus, Plus, ShoppingCart, Sparkles, X } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart";
import { useUIStore } from "@/lib/stores/ui";
import { formatGELSimple } from "@/lib/types";
import { springs, ease } from "@/lib/motion";

export default function MiniCart() {
  const { items, removeItem, updateQuantity } = useCartStore();
  const { miniCartOpen, closeMiniCart } = useUIStore();

  const subtotal = items.reduce((s, i) => s + i.product.normalPrice * i.quantity, 0);
  const shipping = subtotal > 0 ? 500 : 0;
  const total = subtotal + shipping;

  return (
    <AnimatePresence>
      {miniCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="mini-cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeMiniCart}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.aside
            key="mini-cart-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ ...springs.gentle, duration: 0.38 }}
            className="fixed right-0 top-0 bottom-0 z-[70] w-full max-w-[360px] flex flex-col"
            style={{
              background: "linear-gradient(180deg, #141414 0%, #0d0d0d 100%)",
              borderLeft: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "-20px 0 60px rgba(0,0,0,0.6)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="w-4 h-4 text-accent" />
                <h2 className="font-display text-lg font-bold text-white">Your Cart</h2>
                {items.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-[10px] font-black text-white/40 bg-white/6 px-2 py-0.5 rounded-full"
                  >
                    {items.reduce((n, i) => n + i.quantity, 0)} items
                  </motion.span>
                )}
              </div>
              <motion.button
                onClick={closeMiniCart}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className="w-8 h-8 glass border border-white/10 rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-colors"
                aria-label="Close cart"
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10">
              {items.length === 0 ? (
                <motion.div
                  className="flex flex-col items-center justify-center h-full text-center py-20"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, ...springs.gentle }}
                >
                  <motion.div
                    className="text-6xl mb-5"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    🛒
                  </motion.div>
                  <p className="text-white/50 font-bold text-sm mb-1.5">Your cart is empty</p>
                  <p className="text-white/25 text-xs mb-7 max-w-[200px]">
                    Add products from the shop, or build a mystery box for exclusive prices.
                  </p>
                  <Link
                    href="/shop"
                    onClick={closeMiniCart}
                    className="btn-dopamine px-7 py-3 rounded-xl text-xs font-black uppercase tracking-wider"
                  >
                    Browse Shop
                  </Link>
                </motion.div>
              ) : (
                <AnimatePresence mode="popLayout" initial={false}>
                  {items.map((item) => (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                      transition={springs.gentle}
                      className="flex gap-3 rounded-2xl p-3"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                    >
                      {/* Image */}
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/8">
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-bold leading-tight truncate mb-0.5">
                          {item.product.title}
                        </p>
                        <p className="text-accent font-black text-xs mb-2.5">
                          {formatGELSimple(item.product.normalPrice)}
                        </p>

                        {/* Quantity */}
                        <div className="flex items-center gap-1.5 w-fit rounded-lg border border-white/8 px-1.5 py-1"
                          style={{ background: "rgba(255,255,255,0.04)" }}>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            aria-label="Decrease"
                            className="w-5 h-5 flex items-center justify-center text-white/35 hover:text-white transition-colors"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="text-white font-bold text-xs w-4 text-center tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            aria-label="Increase"
                            className="w-5 h-5 flex items-center justify-center text-white/35 hover:text-white transition-colors"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>

                      {/* Remove */}
                      <div className="flex flex-col items-end justify-between shrink-0">
                        <button
                          onClick={() => removeItem(item.product.id)}
                          aria-label="Remove"
                          className="text-white/20 hover:text-red-400 transition-colors p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <p className="text-white font-black text-sm tabular-nums">
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
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  className="px-5 py-4 border-t border-white/6 space-y-3 shrink-0"
                  style={{ background: "rgba(0,0,0,0.3)" }}
                >
                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-white/40">
                      <span>Subtotal</span>
                      <span className="tabular-nums">{formatGELSimple(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-white/40">
                      <span>Shipping</span>
                      <span className="tabular-nums">{formatGELSimple(shipping)}</span>
                    </div>
                    <div className="flex justify-between font-black text-white text-base pt-1.5 border-t border-white/6">
                      <span>Total</span>
                      <span className="tabular-nums">{formatGELSimple(total)}</span>
                    </div>
                  </div>

                  {/* CTAs */}
                  <Link
                    href="/checkout"
                    onClick={closeMiniCart}
                    className="btn-dopamine w-full py-4 rounded-2xl text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    Checkout <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/build-a-box"
                    onClick={closeMiniCart}
                    className="w-full py-3 rounded-2xl border border-white/10 text-white/45 hover:text-white hover:border-white/25 transition-all text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-3 h-3" /> Build a Mystery Box Instead
                  </Link>
                  <p className="text-center text-white/20 text-[10px]">🔒 Secure · Gift-wrapped · GEL</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
