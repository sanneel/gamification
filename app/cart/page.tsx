"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Minus, Plus, Trash2, X } from "lucide-react";

import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/primitives/Reveal";
import { SplitHeading } from "@/components/primitives/SplitHeading";
import { useCartStore } from "@/lib/stores/cart";
import { formatGELSimple } from "@/lib/types";

const ease = [0.16, 1, 0.3, 1] as const;

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const subtotal = items.reduce((s, i) => s + i.product.normalPrice * i.quantity, 0);
  const shipping = subtotal > 0 ? 500 : 0;
  const total    = subtotal + shipping;
  const count    = items.reduce((n, i) => n + i.quantity, 0);

  return (
    <main className="surface-bone min-h-dvh">
      <Navbar />

      <section className="container-edge container-wide pt-40 pb-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <Reveal>
              <p className="eyebrow text-[var(--storm-55)]">The reading list</p>
            </Reveal>
            <SplitHeading
              as="h1"
              className="font-display mt-6 text-display-xl leading-[0.9] text-[var(--ink)]"
            >
              Your cart.
            </SplitHeading>
          </div>
          <Reveal delay={0.2} className="md:col-span-4">
            <p className="text-body text-[var(--storm-55)]">
              A staging shelf for your pieces. Adjust quantities or remove anything before checkout.
            </p>
            {count > 0 && (
              <p className="eyebrow mt-4 text-[var(--storm-55)] tabular">
                {count} {count === 1 ? "piece" : "pieces"} in the cart
              </p>
            )}
          </Reveal>
        </div>
      </section>

      <section className="container-edge container-wide pb-32">
        {items.length === 0 ? <EmptyCart /> : (
          <div className="grid grid-cols-1 gap-16 md:grid-cols-12">
            <div className="md:col-span-7">
              <div className="border-t border-[var(--hair-warm)]">
                <AnimatePresence mode="popLayout" initial={false}>
                  {items.map((item) => (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.45, ease }}
                      className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-6 border-b border-[var(--hair-warm)] py-6"
                    >
                      <div className="relative h-24 w-20 overflow-clip surface-bone-2">
                        <Image src={item.product.images[0]} alt={item.product.title} fill sizes="80px" className="object-cover" />
                      </div>
                      <div>
                        <p className="eyebrow text-[var(--storm-55)]">{item.product.category.replace("_", " ")}</p>
                        <p className="font-display text-xl text-[var(--ink)] mt-1">{item.product.title}</p>
                        <p className="text-xs tabular text-[var(--storm-55)] mt-1">{formatGELSimple(item.product.normalPrice)} each</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          aria-label="Decrease"
                          className="flex h-8 w-8 items-center justify-center border border-[var(--hair-warm)] text-[var(--ink)] transition-colors hover:bg-[var(--ink)] hover:text-[var(--bone)]"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="tabular w-6 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          aria-label="Increase"
                          className="flex h-8 w-8 items-center justify-center border border-[var(--hair-warm)] text-[var(--ink)] transition-colors hover:bg-[var(--ink)] hover:text-[var(--bone)]"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="font-display text-lg tabular text-[var(--ink)]">
                        {formatGELSimple(item.product.normalPrice * item.quantity)}
                      </p>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        aria-label="Remove"
                        className="text-[var(--storm-35)] transition-colors hover:text-[var(--ink)]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <button
                onClick={clearCart}
                className="eyebrow mt-8 flex items-center gap-2 text-[var(--storm-35)] transition-colors hover:text-[var(--ink)]"
              >
                <Trash2 className="h-3 w-3" /> Empty the cart
              </button>
            </div>

            <div className="md:col-span-5">
              <div className="sticky top-32 space-y-6">
                <div className="border border-[var(--hair-warm)] p-8">
                  <p className="eyebrow text-[var(--storm-55)]">Summary</p>
                  <div className="mt-6 space-y-3">
                    <Row label="Subtotal" value={formatGELSimple(subtotal)} />
                    <Row label="Delivery" value={formatGELSimple(shipping)} />
                  </div>
                  <div className="mt-6 flex items-baseline justify-between border-t border-[var(--hair-warm)] pt-4">
                    <span className="eyebrow text-[var(--ink)]">Total · GEL</span>
                    <span className="font-display text-display-sm tabular text-[var(--ink)]">{formatGELSimple(total)}</span>
                  </div>

                  <Link href="/checkout" className="btn-cinematic btn-cinematic--primary mt-8 w-full justify-center">
                    <span className="btn-cinematic__label flex items-center gap-3">Checkout <ArrowRight className="h-3 w-3" /></span>
                  </Link>

                  <Link
                    href="/build-a-box"
                    className="btn-cinematic btn-cinematic--outline mt-3 block text-center"
                  >
                    <span className="btn-cinematic__label">Build a mystery box</span>
                  </Link>
                </div>

                <p className="eyebrow text-center text-[var(--storm-55)]">
                  Secure · Stripe · GEL · Tbilisi atelier
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-[var(--storm-55)]">{label}</span>
      <span className="text-[var(--ink)] tabular">{value}</span>
    </div>
  );
}

function EmptyCart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.85, ease }}
      className="py-24 text-center"
    >
      <p className="eyebrow text-[var(--storm-55)]">The shelf is empty</p>
      <p className="mt-4 font-display text-display-md text-[var(--ink)]">Nothing chosen yet.</p>
      <p className="mx-auto mt-4 max-w-md text-body-lg text-[var(--storm-55)]">
        Browse the collection or compose a mystery box — the cart will fill itself.
      </p>
      <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <Link href="/shop" className="btn-cinematic btn-cinematic--primary">
          <span className="btn-cinematic__label">Browse the shop</span>
        </Link>
        <Link href="/build-a-box" className="btn-cinematic btn-cinematic--outline">
          <span className="btn-cinematic__label">Build a box</span>
        </Link>
      </div>
    </motion.div>
  );
}
