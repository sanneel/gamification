"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { useCartStore } from "@/lib/stores/cart";
import { useUIStore } from "@/lib/stores/ui";

const NAV_LINKS = [
  { href: "/", label: "Home", index: "01" },
  { href: "/shop", label: "Shop", index: "02" },
  { href: "/build-a-box", label: "Build a Box", index: "03" },
  { href: "/quiz", label: "Gift Quiz", index: "04" },
] as const;

const ease = [0.16, 1, 0.3, 1] as const;

export default function Navbar({ tone = "auto" }: { tone?: "light" | "dark" | "auto" }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const items = useCartStore((s) => s.items);
  const count = items.reduce((n, i) => n + i.quantity, 0);
  const openMiniCart = useUIStore((s) => s.openMiniCart);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    return () => { document.documentElement.style.overflow = ""; };
  }, [open]);

  const resolvedTone = tone === "auto" ? (scrolled ? "light" : "light") : tone;
  const isLight = resolvedTone === "light";

  return (
    <>
      <motion.header
        className="fixed left-0 right-0 top-0 z-[90] container-edge flex items-center justify-between"
        initial={{ y: -32, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.1, ease, delay: 0.25 }}
        style={{
          height: scrolled ? 64 : 88,
          transition: "height 0.6s var(--ease-silk)",
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0 -z-10 transition-all duration-500"
          style={{
            background: scrolled ? "rgba(242,239,233,0.82)" : "transparent",
            backdropFilter: scrolled ? "blur(14px) saturate(120%)" : "none",
            borderBottom: scrolled ? "1px solid var(--hair-warm)" : "1px solid transparent",
          }}
        />

        {/* Brand */}
        <Link
          href="/"
          className={clsx(
            "group flex items-baseline gap-3 leading-none transition-opacity",
            isLight ? "text-[var(--ink)]" : "text-[var(--bone)]",
          )}
        >
          <span className="font-display text-2xl tracking-tight">gamif</span>
          <span className="eyebrow hidden sm:inline" style={{ letterSpacing: "0.5em" }}>
            ATELIER · GE
          </span>
        </Link>

        {/* Center nav */}
        <nav className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.slice(1).map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "group relative flex items-baseline gap-2 transition-colors",
                  isLight ? "text-[var(--ink)]" : "text-[var(--bone)]",
                )}
              >
                <span className="font-display text-[10px] opacity-50 tabular">{link.index}</span>
                <span className="link-reveal text-[13px] font-medium tracking-[0.18em] uppercase">
                  {link.label}
                </span>
                {active && (
                  <motion.span
                    layoutId="nav-active-dot"
                    className="absolute -right-3 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-[var(--accent)]"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right cluster */}
        <div className={clsx("flex items-center gap-6", isLight ? "text-[var(--ink)]" : "text-[var(--bone)]")}>
          <button
            onClick={openMiniCart}
            aria-label="Cart"
            className="group flex items-center gap-2"
          >
            <span className="eyebrow hidden sm:inline">Cart</span>
            <span className="font-display text-base tabular">
              {String(count).padStart(2, "0")}
            </span>
          </button>

          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={open}
            className="group flex items-center gap-2"
          >
            <span className="eyebrow hidden sm:inline">Menu</span>
            <span className="relative flex h-3 w-6 flex-col justify-between">
              <span
                className={clsx(
                  "block h-px w-full bg-current transition-transform duration-500",
                  open && "translate-y-[5px] rotate-45",
                )}
              />
              <span
                className={clsx(
                  "block h-px w-full bg-current transition-transform duration-500",
                  open && "-translate-y-[5px] -rotate-45",
                )}
              />
            </span>
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && <FullscreenMenu key="menu" onClose={() => setOpen(false)} pathname={pathname} />}
      </AnimatePresence>
    </>
  );
}

// ─── Fullscreen overlay menu ─────────────────────────────────────────────────

function FullscreenMenu({ onClose, pathname }: { onClose: () => void; pathname: string }) {
  return (
    <motion.div
      initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
      animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
      exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
      transition={{ duration: 1, ease }}
      className="fixed inset-0 z-[95] surface-ink flex flex-col"
    >
      <div aria-hidden className="grain-overlay pointer-events-none absolute inset-0 opacity-30" />

      <div className="container-edge flex h-[88px] items-center justify-between border-b border-[var(--hair)] text-[var(--bone)]">
        <span className="font-display text-2xl tracking-tight">gamif</span>
        <button onClick={onClose} className="eyebrow flex items-center gap-3">
          Close <span className="block h-px w-8 bg-[var(--bone)]" />
        </button>
      </div>

      <div className="container-edge container-wide grid flex-1 grid-cols-1 gap-12 py-16 md:grid-cols-[1.4fr_1fr]">
        <nav className="flex flex-col justify-center gap-2">
          {NAV_LINKS.map((link, idx) => {
            const active = pathname === link.href;
            return (
              <motion.div
                key={link.href}
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.95, ease, delay: 0.2 + idx * 0.08 }}
              >
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="group flex items-baseline gap-6 border-b border-[var(--hair)] py-4 text-[var(--bone)] transition-colors hover:text-[var(--accent-2)]"
                >
                  <span className="font-display text-sm opacity-50 tabular">{link.index}</span>
                  <span className="text-display-md font-display font-light">
                    {link.label}
                    {active && <em className="ml-3 text-[var(--accent-2)] italic">·</em>}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease, delay: 0.5 }}
          className="flex flex-col justify-end gap-12 text-[var(--bone)]"
        >
          <div>
            <p className="eyebrow mb-3">Atelier hours</p>
            <p className="text-body opacity-70">Tue – Sat · 11:00 — 19:00<br />By appointment · 7 Marjanishvili St., Tbilisi</p>
          </div>
          <div>
            <p className="eyebrow mb-3">Reach us</p>
            <p className="text-body opacity-70">hello@gamif.ge<br />+995 32 234 12 04</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[12px] tracking-[0.18em] uppercase opacity-60">
            <span>Instagram</span><span>TikTok</span><span>Pinterest</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
