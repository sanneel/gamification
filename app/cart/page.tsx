"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Minus, Package, Plus, Sparkles, Trash2, X } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart";
import { formatGELSimple } from "@/lib/types";
import { springs, ease } from "@/lib/motion";
import Navbar from "@/components/Navbar";

const CATEGORY_LABELS: Record<string, string> = {
  main_surprise: "Main Surprise",
  sweet_pick: "Sweet Pick",
  tiny_extra: "Tiny Extra",
  lucky_bonus: "Lucky Bonus",
};

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();

  const subtotal = items.reduce((s, i) => s + i.product.normalPrice * i.quantity, 0);
  const shipping = subtotal > 0 ? 500 : 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: ease.expo }}
        >
          {/* Title */}
          <div className="flex items-center gap-3 mb-8">
            <h1 className="font-display text-3xl font-bold text-white">Your Cart</h1>
            {items.length > 0 && (
              <span className="text-xs font-black text-white/30 bg-white/5 px-2.5 py-1 rounded-full">
                {items.reduce((n, i) => n + i.quantity, 0)} {items.reduce((n, i) => n + i.quantity, 0) === 1 ? "item" : "items"}
              </span>
            )}
          </div>

          {items.length === 0 ? (
            <EmptyCart />
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Items */}
              <div className="lg:col-span-2 space-y-3">
                <AnimatePresence mode="popLayout" initial={false}>
                  {items.map((item) => (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30, height: 0, marginBottom: 0 }}
                      transition={springs.gentle}
                      className="rounded-2xl p-4 flex gap-4"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                    >
                      {/* Image */}
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-white/8">
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-1">
                          {CATEGORY_LABELS[item.product.category] ?? item.product.category}
                        </p>
                        <h3 className="text-white font-bold text-sm leading-snug mb-0.5 truncate">
                          {item.product.title}
                        </h3>
                        <p className="text-white/35 text-xs truncate mb-3">{item.product.description}</p>

                        <div className="flex items-center justify-between flex-wrap gap-2">
                          {/* Qty controls */}
                          <div className="flex items-center gap-2 rounded-xl px-2 py-1.5 w-fit"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              aria-label="Decrease quantity"
                              className="w-6 h-6 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-white font-bold text-sm w-5 text-center tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              aria-label="Increase quantity"
                              className="w-6 h-6 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Price */}
                          <p className="text-white font-black text-sm tabular-nums">
                            {formatGELSimple(item.product.normalPrice * item.quantity)}
                          </p>
                        </div>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.product.id)}
                        aria-label="Remove item"
                        className="w-8 h-8 flex items-center justify-center text-white/20 hover:text-red-400 transition-colors shrink-0 mt-0.5"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <button
                  onClick={clearCart}
                  className="flex items-center gap-1.5 text-white/25 hover:text-red-400 transition-colors text-xs font-bold mt-2"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear cart
                </button>
              </div>

              {/* Summary */}
              <div className="space-y-4">
                <div
                  className="rounded-2xl p-5 sticky top-24 space-y-4"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <h2 className="font-display text-xl font-bold text-white">Order Summary</h2>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-white/50">
                      <span>Subtotal</span>
                      <span className="tabular-nums">{formatGELSimple(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-white/50">
                      <span>Shipping</span>
                      <span className="tabular-nums">{formatGELSimple(shipping)}</span>
                    </div>
                    <div className="border-t border-white/8 pt-3 flex justify-between font-black text-white">
                      <span>Total</span>
                      <span className="tabular-nums">{formatGELSimple(total)}</span>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    className="btn-dopamine w-full py-4 rounded-2xl text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    Checkout <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/build-a-box"
                    className="w-full py-3 rounded-2xl border border-white/10 text-white/45 hover:text-white hover:border-white/25 transition-all text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Build a Mystery Box Instead
                  </Link>

                  <p className="text-center text-white/20 text-[10px]">🔒 Secure · Gift-wrapped · GEL</p>
                </div>

                {/* Box upsell */}
                <motion.div
                  className="rounded-2xl p-4 text-center"
                  style={{ background: "rgba(255,45,120,0.06)", border: "1px solid rgba(255,45,120,0.14)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                >
                  <p className="text-2xl mb-2">🎁</p>
                  <p className="text-white/70 text-sm font-bold mb-1">Save more with a box</p>
                  <p className="text-white/30 text-xs mb-3 leading-relaxed">
                    Box prices are 15–25% cheaper. Bundle these into a mystery box for the best deal.
                  </p>
                  <Link href="/build-a-box" className="text-accent text-xs font-black hover:underline">
                    Build a Box →
                  </Link>
                </motion.div>
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
    <motion.div
      className="text-center py-28"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={springs.bouncy}
    >
      <motion.div
        className="text-7xl mb-6"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        🛒
      </motion.div>
      <h2 className="font-display text-3xl font-bold text-white mb-3">Your cart is empty</h2>
      <p className="text-white/40 text-base mb-8 max-w-xs mx-auto leading-relaxed">
        Add products from the shop, or build a curated mystery gift box.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/shop"
          className="btn-dopamine px-8 py-3.5 rounded-2xl text-sm font-black inline-flex items-center gap-2"
        >
          <Package className="w-4 h-4" /> Browse Shop
        </Link>
        <Link
          href="/build-a-box"
          className="px-8 py-3.5 rounded-2xl border border-white/10 text-white/60 hover:text-white hover:border-white/25 transition-all text-sm font-bold inline-flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" /> Build a Box
        </Link>
      </div>
    </motion.div>
  );
}
