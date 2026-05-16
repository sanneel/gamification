"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Menu, ShoppingCart, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/lib/stores/cart";
import { useUIStore } from "@/lib/stores/ui";
import { springs } from "@/lib/motion";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/quiz", label: "Gift Quiz" },
  { href: "/build-a-box", label: "Build a Box", highlight: true },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = useCartStore((s) => s.items);
  const itemCount = items.reduce((n, i) => n + i.quantity, 0);
  const openMiniCart = useUIStore((s) => s.openMiniCart);

  return (
    <nav className="sticky top-0 z-50 glass-strong border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="font-display text-xl font-bold text-white shrink-0 hover:opacity-80 transition-opacity">
          gamif<span className="text-accent">.</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                  active
                    ? "bg-white/8 text-white"
                    : link.highlight
                    ? "text-accent hover:bg-accent/8"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.highlight && <Sparkles className="inline w-3 h-3 mr-1 mb-0.5 opacity-70" />}
                {link.label}
                {active && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute inset-0 rounded-xl bg-white/5"
                    transition={springs.snappy}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right: cart + mobile menu */}
        <div className="flex items-center gap-2">
          <motion.button
            onClick={openMiniCart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            className="relative w-10 h-10 glass border border-white/10 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:border-white/20 transition-colors"
            aria-label="Open cart"
          >
            <ShoppingCart className="w-4 h-4" />
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={springs.bouncy}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-accent text-white text-[10px] font-black rounded-full flex items-center justify-center"
                >
                  {itemCount > 9 ? "9+" : itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden w-10 h-10 glass border border-white/10 rounded-xl flex items-center justify-center text-white/60 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {mobileOpen
                ? <motion.span key="x" initial={{ rotate: -45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 45, opacity: 0 }} transition={{ duration: 0.15 }}><X className="w-4 h-4" /></motion.span>
                : <motion.span key="menu" initial={{ rotate: 45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -45, opacity: 0 }} transition={{ duration: 0.15 }}><Menu className="w-4 h-4" /></motion.span>}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden md:hidden border-t border-white/5"
          >
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      active ? "bg-white/8 text-white" : link.highlight ? "text-accent" : "text-white/60 hover:text-white"
                    }`}
                  >
                    {link.highlight && <Gift className="w-4 h-4" />}
                    {link.label}
                  </Link>
                );
              })}
              <button
                onClick={() => { setMobileOpen(false); openMiniCart(); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-white/60 hover:text-white transition-all w-full"
              >
                <ShoppingCart className="w-4 h-4" />
                Cart {itemCount > 0 && <span className="ml-auto text-accent text-xs font-black">{itemCount}</span>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
