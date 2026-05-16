"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useInView, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Gift, Heart, ShoppingCart, Sparkles, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { springs, ease, fadeUp, blurUp, stagger, viewport, viewportEarly } from "@/lib/motion";
import { useCartStore } from "@/lib/stores/cart";
import { useUIStore } from "@/lib/stores/ui";
import AmbientBg from "@/components/AmbientBg";

// ─── Data ─────────────────────────────────────────────────────────────────────

const OCCASIONS = [
  { label: "Anniversary", emoji: "💍" },
  { label: "Birthday", emoji: "🎂" },
  { label: "Just Because", emoji: "💌" },
  { label: "Valentine's", emoji: "🌹" },
  { label: "Long Distance", emoji: "✈️" },
  { label: "Apology", emoji: "🤍" },
];

const FEATURED_BOXES = [
  { id: "romantic-box", name: "Romantic Evening", tagline: "A night she'll never forget", price: "89 ₾", original: "120 ₾", image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=600&q=80", badge: "Best Seller", accent: "#FF2D78" },
  { id: "cozy-night",   name: "Cozy Night In",    tagline: "Candles, warmth & softness",    price: "65 ₾", original: "90 ₾",  image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80", badge: "New",         accent: "#7C3AED" },
  { id: "adventure",    name: "His Adventure Kit", tagline: "Bold, practical, unforgettable", price: "75 ₾", original: "105 ₾", image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80", badge: null,          accent: "#F5A623" },
  { id: "memory-lane",  name: "Memory Lane",       tagline: "A love letter you can open",   price: "95 ₾", original: "130 ₾", image: "https://images.unsplash.com/photo-1549388604-817d15aa0110?auto=format&fit=crop&w=600&q=80", badge: "Fan Favourite",accent: "#10B981" },
];

const TESTIMONIALS = [
  { text: "My girlfriend cried happy tears. The note I wrote was printed beautifully inside. Easiest gift I've ever given.", name: "Giorgi T.", city: "Tbilisi", emoji: "💌", stars: 5 },
  { text: "I had no idea what to get for our anniversary. Gamif helped me pick the perfect box in 5 minutes. She loved it.", name: "Luka M.", city: "Batumi", emoji: "💍", stars: 5 },
  { text: "I live in Germany and wanted to send something real to my boyfriend in Tbilisi. This was perfect.", name: "Mariam D.", city: "Berlin → Tbilisi", emoji: "✈️", stars: 5 },
];

const FOR_WHO = [
  { label: "For Her", description: "Romantic, beautiful, and deeply thoughtful", emoji: "🌸", href: "/shop?audience=for_her", gradient: "from-pink-500/20 to-rose-600/10", border: "border-pink-500/20", glow: "rgba(255,45,120,0.15)" },
  { label: "For Him", description: "Cool, bold, and he'll actually use it",       emoji: "⚡", href: "/shop?audience=for_him", gradient: "from-amber-500/20 to-orange-600/10", border: "border-amber-500/20", glow: "rgba(245,166,35,0.12)" },
  { label: "For Both", description: "A shared experience you'll both remember",   emoji: "🫶", href: "/shop?audience=neutral", gradient: "from-violet-500/20 to-purple-600/10", border: "border-violet-500/20", glow: "rgba(124,58,237,0.12)" },
];

const STATS = [
  { value: "1,200+", label: "Boxes gifted" },
  { value: "4.9★",   label: "Average rating" },
  { value: "3 min",  label: "To build a box" },
  { value: "20%",    label: "Average savings" },
];

// ─── Nav ──────────────────────────────────────────────────────────────────────

function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const cartItems = useCartStore((s) => s.items);
  const cartCount = cartItems.reduce((n, i) => n + i.quantity, 0);
  const openMiniCart = useUIStore((s) => s.openMiniCart);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? "rgba(8,8,16,0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(24px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent",
      }}
    >
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="font-display text-2xl font-bold text-white shrink-0 hover:opacity-80 transition-opacity">
          gamif<span className="text-accent">.</span>
        </Link>

        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-white/50">
          <Link href="/shop" className="hover:text-white transition-colors">Shop</Link>
          <Link href="/build-a-box" className="hover:text-white transition-colors">Build a Box</Link>
          <Link href="/quiz" className="hover:text-white transition-colors">Vibe Quiz</Link>
        </div>

        <div className="flex items-center gap-2.5">
          <motion.button
            onClick={openMiniCart}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            className="relative w-9 h-9 glass border border-white/10 rounded-xl flex items-center justify-center text-white/50 hover:text-white transition-colors"
            aria-label="Open cart"
          >
            <ShoppingCart className="w-4 h-4" />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={springs.bouncy}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-accent text-white text-[9px] font-black rounded-full flex items-center justify-center"
                >{cartCount}</motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <Link
            href="/build-a-box"
            className="hidden md:flex btn-dopamine items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs"
          >
            <Gift className="w-3.5 h-3.5" /> Build a Box
          </Link>

          <button
            onClick={() => setMobileOpen(o => !o)}
            className="md:hidden w-9 h-9 glass border border-white/10 rounded-xl flex items-center justify-center text-white/50"
          >
            <div className="flex flex-col gap-1">
              <span className={`block w-4 h-0.5 bg-current transition-all ${mobileOpen ? "rotate-45 translate-y-1.5" : ""}`} />
              <span className={`block w-4 h-0.5 bg-current transition-all ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`block w-4 h-0.5 bg-current transition-all ${mobileOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden md:hidden border-t border-white/6"
            style={{ background: "rgba(8,8,16,0.97)" }}
          >
            <div className="px-5 py-4 space-y-1">
              {[{ href: "/shop", label: "Shop" }, { href: "/build-a-box", label: "Build a Box" }, { href: "/quiz", label: "Vibe Quiz" }].map(l => (
                <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                  className="flex items-center px-4 py-3 rounded-xl text-sm font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all">
                  {l.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-accent/60"
          style={{ left: `${15 + i * 14}%`, top: `${20 + (i % 3) * 25}%` }}
          animate={{ y: [-8, 8, -8], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 3 + i * 0.7, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
        />
      ))}

      <div className="relative z-10 text-center max-w-5xl mx-auto px-5 py-16 sm:py-24">
        {/* Eyebrow pill */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: ease.expo }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 mb-8"
        >
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-accent"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-[10px] font-black uppercase tracking-[0.22em] text-white/55">
            Premium Mystery Gifting · Georgia
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40, filter: "blur(16px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.85, ease: ease.expo, delay: 0.1 }}
          className="font-display font-bold text-white leading-[0.9] mb-7"
          style={{ fontSize: "clamp(3rem, 9vw, 7.5rem)" }}
        >
          The art of the<br />
          <span className="text-gradient-pink italic">perfect gift.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: ease.expo, delay: 0.25 }}
          className="text-white/45 text-lg sm:text-xl max-w-lg mx-auto mb-10 leading-relaxed"
        >
          Curated mystery boxes at exclusive prices. Spin for a reward. Surprise someone forever.
        </motion.p>

        {/* Occasion pills */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: ease.expo, delay: 0.35 }}
          className="flex gap-2 flex-wrap justify-center mb-10"
        >
          {OCCASIONS.map((o) => (
            <motion.div
              key={o.label}
              whileHover={{ scale: 1.06, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full glass border border-white/8 text-xs font-bold text-white/55 hover:text-white hover:border-white/18 transition-colors cursor-default"
            >
              <span>{o.emoji}</span>
              <span>{o.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: ease.expo, delay: 0.45 }}
          className="flex gap-4 justify-center flex-wrap"
        >
          <Link href="/build-a-box">
            <motion.div
              className="btn-dopamine flex items-center gap-2 px-8 py-4 rounded-2xl text-sm"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <Gift className="w-4 h-4" /> Build a Box
            </motion.div>
          </Link>
          <Link href="/shop">
            <motion.div
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold text-white/65 hover:text-white transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.04)" }}
              whileHover={{ scale: 1.04, borderColor: "rgba(255,255,255,0.20)" }}
              whileTap={{ scale: 0.96 }}
            >
              Browse Shop <ArrowRight className="w-4 h-4" />
            </motion.div>
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <motion.div
          className="w-px h-10 bg-gradient-to-b from-transparent via-white/25 to-transparent"
          animate={{ scaleY: [0, 1, 0], opacity: [0, 0.6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/25">Scroll</span>
      </motion.div>
    </section>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div ref={ref} className="relative border-y border-white/6 py-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-violet/5 pointer-events-none" />
      <div className="max-w-5xl mx-auto px-5 grid grid-cols-2 sm:grid-cols-4 gap-6">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            className="text-center"
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: ease.expo, delay: i * 0.08 }}
          >
            <p className="font-display text-2xl sm:text-3xl font-bold text-white mb-0.5">{s.value}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/30">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-12">
      <motion.p variants={fadeUp} className="eyebrow mb-3">{eyebrow}</motion.p>
      <motion.h2 variants={fadeUp} className="font-display font-bold text-white leading-tight mb-3"
        style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}>
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p variants={fadeUp} className="text-white/40 text-base max-w-md mx-auto leading-relaxed">
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

// ─── For Who ──────────────────────────────────────────────────────────────────

function ForWho() {
  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-5 py-24">
      <motion.div
        initial="hidden" whileInView="visible" viewport={viewport}
        variants={stagger(0.05)}
      >
        <SectionHeader eyebrow="Who are you gifting?" title="Find the perfect match" />
        <motion.div className="grid md:grid-cols-3 gap-4" variants={stagger(0.08)}>
          {FOR_WHO.map((w) => (
            <motion.div key={w.label} variants={blurUp}>
              <Link href={w.href}>
                <motion.div
                  className={`relative rounded-3xl p-8 sm:p-10 overflow-hidden border ${w.border} cursor-pointer`}
                  style={{ background: `linear-gradient(135deg, ${w.glow.replace("0.15", "0.08")} 0%, rgba(255,255,255,0.02) 100%)` }}
                  whileHover={{ scale: 1.03, y: -6, boxShadow: `0 24px 64px ${w.glow}, 0 0 0 1px ${w.border.replace("border-", "").replace("/20", "/30")}` }}
                  whileTap={{ scale: 0.98 }}
                  transition={springs.bouncy}
                >
                  {/* Background glow */}
                  <div className="absolute inset-0 pointer-events-none opacity-60"
                    style={{ background: `radial-gradient(circle at 30% 30%, ${w.glow} 0%, transparent 70%)` }} />

                  <motion.div
                    className="text-5xl mb-5"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {w.emoji}
                  </motion.div>
                  <h3 className="font-display text-2xl font-bold text-white mb-2">{w.label}</h3>
                  <p className="text-white/45 text-sm leading-relaxed mb-6">{w.description}</p>
                  <div className="flex items-center gap-2 text-xs font-bold text-white/40 group-hover:text-white/70 transition-colors">
                    <span>Shop gifts</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Featured Boxes ───────────────────────────────────────────────────────────

function FeaturedBoxes() {
  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-5 py-16">
      <div className="absolute inset-x-0 top-0 h-px glow-line" />
      <motion.div
        initial="hidden" whileInView="visible" viewport={viewport}
        variants={stagger(0.05)}
      >
        <SectionHeader
          eyebrow="Signature Collection"
          title="Our most loved boxes"
          subtitle="Every box is hand-curated and gift-wrapped. Exclusive prices only available inside a box."
        />

        <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4" variants={stagger(0.06)}>
          {FEATURED_BOXES.map((box) => (
            <motion.div key={box.id} variants={blurUp}>
              <Link href={`/build-a-box`}>
                <motion.div
                  className="group relative rounded-2xl overflow-hidden cursor-pointer"
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={springs.bouncy}
                  style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
                >
                  {/* Image */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image src={box.image} alt={box.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" sizes="(max-width:768px) 50vw, 25vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                    {/* Badge */}
                    {box.badge && (
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider text-white"
                        style={{ background: box.accent }}>
                        {box.badge}
                      </div>
                    )}

                    {/* Info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white/50 text-[9px] font-black uppercase tracking-widest mb-1">{box.tagline}</p>
                      <h3 className="font-display text-lg font-bold text-white leading-tight mb-2">{box.name}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="text-white font-black text-lg">{box.price}</span>
                          <span className="text-white/30 text-xs line-through">{box.original}</span>
                        </div>
                        <motion.div
                          className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: box.accent }}
                          whileHover={{ scale: 1.15 }}
                        >
                          <ArrowRight className="w-3.5 h-3.5 text-white" />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} className="text-center mt-10">
          <Link href="/build-a-box">
            <motion.div
              className="btn-dopamine inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <Sparkles className="w-4 h-4" /> Build Your Custom Box
            </motion.div>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    { num: "01", icon: "✦", title: "Pick your items", desc: "Browse curated products and choose 3 at exclusive box prices — 15–25% off retail.", accent: "#FF2D78" },
    { num: "02", icon: "💌", title: "Write a message", desc: "Add a personal note. We print it beautifully inside the box for them to find.", accent: "#7C3AED" },
    { num: "03", icon: "🎡", title: "Spin for a reward", desc: "Every order earns a lucky spin — free gifts, discounts, or a surprise upgrade.", accent: "#FFD700" },
  ];

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-5 py-24">
      <div className="absolute inset-x-0 top-0 h-px glow-line" />
      <motion.div
        initial="hidden" whileInView="visible" viewport={viewport}
        variants={stagger(0.05)}
      >
        <SectionHeader
          eyebrow="How it works"
          title="Gifting in 3 minutes"
          subtitle="No overwhelm. No guessing. Just a beautiful gift, built by you."
        />

        <motion.div className="grid md:grid-cols-3 gap-6 relative" variants={stagger(0.09)}>
          {/* Connector line (desktop) */}
          <div className="absolute top-10 left-[calc(16.7%+2rem)] right-[calc(16.7%+2rem)] h-px bg-gradient-to-r from-accent/40 via-violet/40 to-gold/40 hidden md:block" />

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              variants={blurUp}
              className="relative rounded-3xl p-8 text-center"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              whileHover={{ y: -4, borderColor: `${step.accent}30` }}
              transition={springs.gentle}
            >
              <motion.div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-5"
                style={{ background: `${step.accent}18`, border: `1px solid ${step.accent}30` }}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
              >
                {step.icon}
              </motion.div>
              <p className="font-display text-5xl font-bold mb-3" style={{ color: `${step.accent}25` }}>{step.num}</p>
              <h3 className="font-display text-xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

function Testimonials() {
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const next = () => setIdx((i) => (i + 1) % TESTIMONIALS.length);

  useEffect(() => {
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, []);

  const t = TESTIMONIALS[idx];

  return (
    <section className="relative max-w-4xl mx-auto px-4 sm:px-5 py-24 text-center">
      <div className="absolute inset-x-0 top-0 h-px glow-line" />
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={viewport}
        className="eyebrow mb-4"
      >
        What people say
      </motion.p>

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
          transition={{ duration: 0.45, ease: ease.expo }}
          className="mb-10"
        >
          <div className="flex justify-center mb-6">
            {Array.from({ length: t.stars }).map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-gold text-gold" />
            ))}
          </div>
          <p className="font-display text-2xl sm:text-3xl lg:text-4xl italic font-medium text-white leading-relaxed mb-8 max-w-2xl mx-auto">
            &ldquo;{t.text}&rdquo;
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">{t.emoji}</span>
            <p className="text-white font-bold text-sm">{t.name}</p>
            <span className="text-white/20">·</span>
            <p className="text-white/40 text-sm">{t.city}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-center gap-4">
        <motion.button onClick={prev} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          className="w-10 h-10 glass border border-white/10 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </motion.button>
        <div className="flex gap-2">
          {TESTIMONIALS.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`rounded-full transition-all duration-300 ${i === idx ? "w-6 h-2 bg-accent" : "w-2 h-2 bg-white/20"}`}
            />
          ))}
        </div>
        <motion.button onClick={next} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          className="w-10 h-10 glass border border-white/10 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors">
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </section>
  );
}

// ─── Quiz CTA ─────────────────────────────────────────────────────────────────

function QuizCTA() {
  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-5 py-16 mb-16">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewport}
        transition={{ duration: 0.7, ease: ease.expo }}
        className="relative rounded-4xl overflow-hidden text-center px-8 py-16"
        style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(255,45,120,0.12) 50%, rgba(124,58,237,0.08) 100%)", border: "1px solid rgba(255,45,120,0.2)" }}
      >
        {/* Background orbs */}
        <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,45,120,0.2) 0%, transparent 70%)" }} />
        <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)" }} />

        <div className="relative">
          <motion.div
            className="text-5xl mb-5"
            animate={{ y: [0, -8, 0], rotate: [0, -3, 3, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            🔮
          </motion.div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            Not sure where to start?<br />
            <span className="text-gradient-pink italic">Find your vibe.</span>
          </h2>
          <p className="text-white/45 text-base sm:text-lg mb-8 max-w-md mx-auto leading-relaxed">
            Take the 60-second quiz and we&apos;ll show you exactly what to gift.
          </p>
          <Link href="/quiz">
            <motion.div
              className="btn-dopamine inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
            >
              <Sparkles className="w-4 h-4" /> Start the Quiz
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-white/6 py-12 px-5">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <Link href="/" className="font-display text-2xl font-bold text-white">
            gamif<span className="text-accent">.</span>
          </Link>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-white/35 font-medium">
            {[{ href: "/shop", label: "Shop" }, { href: "/build-a-box", label: "Build a Box" }, { href: "/quiz", label: "Vibe Quiz" }, { href: "/cart", label: "Cart" }].map(l => (
              <Link key={l.href} href={l.href} className="hover:text-white/70 transition-colors">{l.label}</Link>
            ))}
          </div>
        </div>
        <div className="h-px bg-white/5 mb-8" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/20">
          <p>© {new Date().getFullYear()} Gamif. All rights reserved. Georgia 🇬🇪</p>
          <p className="flex items-center gap-1">Made with <Heart className="w-3 h-3 text-accent fill-accent" /> for gift-givers everywhere</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-ink overflow-x-hidden">
      <AmbientBg variant="default" />
      <div className="relative z-10">
        <SiteNav />
        <Hero />
        <StatsBar />
        <ForWho />
        <FeaturedBoxes />
        <HowItWorks />
        <Testimonials />
        <QuizCTA />
        <Footer />
      </div>
    </div>
  );
}
