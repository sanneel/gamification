"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/lib/stores/cart";
import { useUIStore } from "@/lib/stores/ui";
import { springs } from "@/lib/motion";

const LINKS = [
  { href: "/shop",        label: "Shop" },
  { href: "/quiz",        label: "Gift Quiz" },
  { href: "/build-a-box", label: "Build a Box" },
];

export default function Navbar() {
  const pathname     = usePathname();
  const [open, setOpen] = useState(false);
  const items        = useCartStore((s) => s.items);
  const itemCount    = items.reduce((n, i) => n + i.quantity, 0);
  const openMiniCart = useUIStore((s) => s.openMiniCart);

  return (
    <nav className="sticky top-0 z-50 px-8 sm:px-12 h-16 flex items-center justify-between"
      style={{ background: "rgba(245,230,163,0.95)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--storm-12)" }}>

      <Link href="/" className="font-display text-xl font-bold text-storm hover:opacity-75 transition-opacity">
        gamif<span style={{ opacity: 0.35 }}>.</span>
      </Link>

      <div className="hidden md:flex items-center gap-8">
        {LINKS.map(l => (
          <Link key={l.href} href={l.href}
            className="eyebrow transition-colors hover:opacity-100"
            style={{ color: pathname === l.href ? "var(--storm)" : "var(--storm-55)",
              textDecoration: pathname === l.href ? "underline" : "none",
              textUnderlineOffset: "4px" }}>
            {l.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <motion.button onClick={openMiniCart} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
          className="relative" aria-label="Cart" style={{ color: "var(--storm-55)" }}>
          <ShoppingCart className="w-4 h-4" />
          <AnimatePresence>
            {itemCount > 0 && (
              <motion.span key={itemCount} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                transition={springs.bouncy}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 text-[8px] font-bold rounded-full flex items-center justify-center"
                style={{ background: "var(--storm)", color: "var(--butter)" }}>
                {itemCount > 9 ? "9+" : itemCount}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(o => !o)} className="md:hidden" style={{ color: "var(--storm-55)" }}>
          <div className="w-5 flex flex-col gap-1">
            <span className={`block h-px transition-all origin-center ${open ? "rotate-45 translate-y-1.5" : ""}`} style={{ background: "var(--storm)" }} />
            <span className={`block h-px transition-all ${open ? "opacity-0" : ""}`} style={{ background: "var(--storm)" }} />
            <span className={`block h-px transition-all origin-center ${open ? "-rotate-45 -translate-y-1.5" : ""}`} style={{ background: "var(--storm)" }} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="absolute top-16 left-0 right-0 overflow-hidden md:hidden"
            style={{ background: "var(--butter)", borderBottom: "1px solid var(--storm-12)" }}>
            <div className="px-8 py-6 space-y-4">
              {LINKS.map(l => (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="eyebrow block hover:opacity-100 transition-opacity"
                  style={{ color: "var(--storm-55)" }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
