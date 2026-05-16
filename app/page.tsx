"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight, Gift, ShoppingCart, Sparkles, Star } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import { springs, ease } from "@/lib/motion";
import { useCartStore } from "@/lib/stores/cart";
import { useUIStore } from "@/lib/stores/ui";

// ─── Data ─────────────────────────────────────────────────────────────────────

const MARQUEE_ITEMS = [
  "Exclusive Box Prices",
  "Lucky Spin Rewards",
  "Gift-Wrapped with Love",
  "Surprise Unboxing",
  "Personal Message Inside",
  "Delivered in Georgia",
];

const TESTIMONIALS = [
  { quote: "My girlfriend cried happy tears. The note I wrote was printed beautifully inside.", name: "Giorgi T.", city: "Tbilisi" },
  { quote: "I had no idea what to get. Gamif helped me build the perfect box in 5 minutes.", name: "Luka M.", city: "Batumi" },
  { quote: "I live abroad and wanted to send something real. This was exactly that.", name: "Mariam D.", city: "Berlin" },
];

// ─── Cursor Glow ──────────────────────────────────────────────────────────────

function CursorGlow() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 120, damping: 20 });
  const springY = useSpring(y, { stiffness: 120, damping: 20 });

  useEffect(() => {
    const fn = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, [x, y]);

  return (
    <motion.div
      className="fixed pointer-events-none z-[200] hidden lg:block"
      style={{ left: springX, top: springY, x: "-50%", y: "-50%",
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,45,120,0.06) 0%, transparent 70%)",
      }}
    />
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const items = useCartStore((s) => s.items);
  const count = items.reduce((n, i) => n + i.quantity, 0);
  const open = useUIStore((s) => s.openMiniCart);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 px-6 sm:px-10"
      animate={{ paddingTop: scrolled ? 12 : 24, paddingBottom: scrolled ? 12 : 24 }}
      style={{ background: scrolled ? "rgba(5,5,8,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none" }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between max-w-[1600px] mx-auto">
        <Link href="/" className="font-display text-2xl font-bold text-white tracking-tight">
          gamif<span style={{ color: "#FF2D78" }}>.</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/40">
          <Link href="/shop" className="hover:text-white transition-colors duration-200">Shop</Link>
          <Link href="/build-a-box" className="hover:text-white transition-colors duration-200">Build a Box</Link>
          <Link href="/quiz" className="hover:text-white transition-colors duration-200">Gift Quiz</Link>
        </nav>

        <div className="flex items-center gap-3">
          <button onClick={open} className="relative w-9 h-9 flex items-center justify-center text-white/40 hover:text-white transition-colors" aria-label="Cart">
            <ShoppingCart className="w-4 h-4" />
            <AnimatePresence>
              {count > 0 && (
                <motion.span key={count} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  transition={springs.bouncy}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#FF2D78] text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <Link href="/build-a-box">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider text-white"
              style={{ background: "linear-gradient(135deg, #FF2D78, #7C3AED)", boxShadow: "0 0 24px rgba(255,45,120,0.3)" }}>
              <Gift className="w-3.5 h-3.5" /> Build
            </motion.div>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex flex-col justify-end pb-16 sm:pb-24 overflow-hidden">
      {/* Deep background */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 120% 80% at 70% 40%, rgba(255,45,120,0.07) 0%, transparent 60%), radial-gradient(ellipse 80% 60% at 20% 80%, rgba(124,58,237,0.06) 0%, transparent 60%), #050508"
      }} />

      {/* Floating product images — right side */}
      <motion.div style={{ y: y1, opacity }} className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none hidden lg:block">
        <motion.div
          className="absolute top-[10%] right-[8%] w-64 aspect-[3/4] rounded-3xl overflow-hidden"
          style={{ boxShadow: "0 40px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)" }}
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1, ease: ease.expo }}>
          <Image src="https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=400&q=90" alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </motion.div>

        <motion.div
          className="absolute top-[32%] right-[34%] w-48 aspect-square rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)" }}
          initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1, ease: ease.expo }}>
          <Image src="https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=300&q=90" alt="" fill className="object-cover" />
        </motion.div>

        <motion.div
          className="absolute bottom-[15%] right-[12%] w-52 aspect-[3/4] rounded-3xl overflow-hidden"
          style={{ boxShadow: "0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)" }}
          initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1, ease: ease.expo }}>
          <Image src="https://images.unsplash.com/photo-1541643600914-78b084683702?auto=format&fit=crop&w=300&q=90" alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </motion.div>

        {/* Floating price tag */}
        <motion.div
          className="absolute top-[52%] right-[6%] px-4 py-2.5 rounded-2xl"
          style={{ background: "rgba(255,215,0,0.12)", border: "1px solid rgba(255,215,0,0.25)", backdropFilter: "blur(16px)" }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0, y: [0, -6, 0] }}
          transition={{ opacity: { delay: 1.1, duration: 0.5 }, y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.2 } }}>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400/70">Box price</p>
          <p className="text-white font-black text-lg leading-none">39 ₾</p>
          <p className="text-white/30 text-xs line-through">49 ₾</p>
        </motion.div>
      </motion.div>

      {/* Headline — oversized, left-aligned */}
      <motion.div style={{ y: y2, opacity }} className="relative z-10 px-6 sm:px-10 lg:px-16 max-w-[1600px] mx-auto w-full">
        <motion.p
          className="text-white/30 text-xs sm:text-sm font-black uppercase tracking-[0.3em] mb-6"
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: ease.expo }}>
          ✦ Premium mystery gifting
        </motion.p>

        <div className="overflow-hidden">
          <motion.h1
            className="font-display font-bold text-white leading-[0.88] mb-0"
            initial={{ y: "100%" }} animate={{ y: 0 }}
            transition={{ delay: 0.15, duration: 0.9, ease: ease.expo }}
            style={{ fontSize: "clamp(4.5rem, 13vw, 15rem)" }}>
            Give
          </motion.h1>
        </div>
        <div className="overflow-hidden">
          <motion.h1
            className="font-display font-bold italic leading-[0.88] ml-[8%] sm:ml-[12%]"
            initial={{ y: "100%" }} animate={{ y: 0 }}
            transition={{ delay: 0.25, duration: 0.9, ease: ease.expo }}
            style={{
              fontSize: "clamp(4.5rem, 13vw, 15rem)",
              background: "linear-gradient(135deg, #FF2D78 0%, #C026D3 50%, #A78BFA 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
            better.
          </motion.h1>
        </div>

        {/* Subtitle + CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row items-start sm:items-end gap-6 sm:gap-10 mt-10"
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.7, ease: ease.expo }}>
          <p className="text-white/40 text-base sm:text-lg leading-relaxed max-w-sm">
            Mystery boxes built by you. Exclusive prices, personal message, lucky spin reward.
          </p>

          <div className="flex items-center gap-4 shrink-0">
            <Link href="/build-a-box">
              <motion.div whileHover={{ scale: 1.04, boxShadow: "0 0 60px rgba(255,45,120,0.5)" }} whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 px-7 py-4 rounded-full text-sm font-black uppercase tracking-wider text-white transition-shadow"
                style={{ background: "linear-gradient(135deg, #FF2D78, #7C3AED)" }}>
                <Gift className="w-4 h-4" /> Build a Box
              </motion.div>
            </Link>
            <Link href="/shop" className="text-white/35 text-sm font-bold hover:text-white transition-colors flex items-center gap-1">
              Explore <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>
        <motion.div className="w-px h-12 origin-top"
          style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)" }}
          animate={{ scaleY: [0, 1, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} />
      </motion.div>
    </section>
  );
}

// ─── Marquee ──────────────────────────────────────────────────────────────────

function Marquee() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="relative overflow-hidden border-y border-white/6 py-4" style={{ background: "rgba(255,45,120,0.04)" }}>
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: [0, "-50%"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}>
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-white/30 shrink-0">
            <span className="text-[#FF2D78] text-lg">✦</span>
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── The Concept ──────────────────────────────────────────────────────────────

function TheConcept() {
  return (
    <section className="relative px-6 sm:px-10 lg:px-16 py-28 sm:py-36 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(124,58,237,0.07) 0%, transparent 70%)" }} />

      <div className="max-w-[1600px] mx-auto">
        {/* Large typographic statement */}
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}>
          <p className="text-white/20 text-xs font-black uppercase tracking-[0.3em] mb-10">The experience</p>

          <div className="grid lg:grid-cols-2 gap-0 lg:gap-0 items-start">
            <div>
              {[
                { num: "01", text: "Pick 3 items at exclusive box prices." },
                { num: "02", text: "Write a message. We print it inside." },
                { num: "03", text: "Spin the wheel. Win a reward." },
              ].map((step, i) => (
                <motion.div
                  key={step.num}
                  className="border-b border-white/6 py-8 flex items-start gap-6 group cursor-default"
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.7, ease: ease.expo }}
                  whileHover={{ x: 8 }}>
                  <span className="text-white/15 font-black text-sm tracking-wider shrink-0 mt-1">{step.num}</span>
                  <p className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight group-hover:text-white/90 transition-colors">
                    {step.text}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="hidden lg:flex items-center justify-center pl-20">
              <motion.div
                className="relative w-64 h-80 rounded-3xl overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.8, ease: ease.expo }}
                style={{ boxShadow: "0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)" }}>
                <Image src="https://images.unsplash.com/photo-1549388604-817d15aa0110?auto=format&fit=crop&w=500&q=80" alt="" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="text-white/50 text-[9px] font-black uppercase tracking-widest mb-1">Box Price</p>
                  <p className="text-white font-black text-2xl">89 ₾</p>
                  <p className="text-white/30 text-xs line-through">130 ₾</p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── For Who — Asymmetric ────────────────────────────────────────────────────

function ForWho() {
  const cards = [
    { label: "For Her", sub: "Romantic. Beautiful. Deeply thoughtful.", href: "/shop?audience=for_her",
      img: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80",
      accent: "#FF2D78", col: "lg:col-span-7" },
    { label: "For Him", sub: "Bold, cool, and he'll actually love it.", href: "/shop?audience=for_him",
      img: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80",
      accent: "#F5A623", col: "lg:col-span-5" },
    { label: "For Both of You", sub: "A shared experience you'll always remember.", href: "/shop?audience=neutral",
      img: "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=1200&q=80",
      accent: "#7C3AED", col: "lg:col-span-12" },
  ];

  return (
    <section className="px-4 sm:px-6 lg:px-10 pb-24 sm:pb-32">
      <div className="max-w-[1600px] mx-auto">
        <motion.p
          className="text-white/20 text-xs font-black uppercase tracking-[0.3em] mb-8 px-2"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          Who is the gift for?
        </motion.p>

        <div className="grid lg:grid-cols-12 gap-3">
          {cards.map((card, i) => (
            <motion.div
              key={card.label}
              className={card.col}
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.7, ease: ease.expo }}>
              <Link href={card.href}>
                <motion.div
                  className="group relative overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer"
                  style={{ aspectRatio: i === 2 ? "16/7" : "3/4", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
                  whileHover={{ scale: 1.01, boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px ${card.accent}30` }}
                  transition={springs.gentle}>
                  <Image src={card.img} alt={card.label} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width:768px) 100vw, 50vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${card.accent}18, transparent 60%)` }} />

                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                    <motion.div initial={{ y: 8, opacity: 0.8 }} whileHover={{ y: 0, opacity: 1 }}>
                      <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-1">{card.label}</h3>
                      <p className="text-white/50 text-sm">{card.sub}</p>
                    </motion.div>
                  </div>

                  {/* Arrow */}
                  <motion.div
                    className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: card.accent }}>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </motion.div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Featured Products — Editorial Two-Up ────────────────────────────────────

function EditorialShowcase() {
  const products = [
    { title: "Preserved Rose Box", sub: "The centrepiece they'll remember forever.", price: "39 ₾", normal: "49 ₾", img: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=900&q=80", tag: "Main Surprise · Romantic" },
    { title: "Gold Initial Necklace", sub: "Personal. Elegant. Chosen just for them.", price: "48 ₾", normal: "59 ₾", img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80", tag: "Main Surprise · Luxury" },
    { title: "Signature Soy Candle", sub: "Warm amber evenings, bottled.", price: "22 ₾", normal: "28 ₾", img: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=80", tag: "Sweet Pick · Cozy" },
  ];

  return (
    <section className="px-4 sm:px-6 lg:px-10 pb-24 sm:pb-32">
      <div className="max-w-[1600px] mx-auto">
        <motion.p className="text-white/20 text-xs font-black uppercase tracking-[0.3em] mb-14 px-2"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          Inside the box
        </motion.p>

        <div className="space-y-4">
          {products.map((p, i) => (
            <motion.div
              key={p.title}
              className={`grid lg:grid-cols-2 gap-0 overflow-hidden rounded-2xl sm:rounded-3xl group cursor-pointer`}
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.7, ease: ease.expo }}
              whileHover={{ borderColor: "rgba(255,45,120,0.2)", boxShadow: "0 0 60px rgba(255,45,120,0.08)" }}>

              {/* Image — alternates sides */}
              <div className={`relative aspect-[16/9] lg:aspect-auto lg:min-h-[280px] overflow-hidden ${i % 2 !== 0 ? "lg:order-2" : ""}`}>
                <Image src={p.img} alt={p.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width:1024px) 100vw, 50vw" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/40" />
              </div>

              {/* Text */}
              <div className={`flex flex-col justify-center p-8 lg:p-12 ${i % 2 !== 0 ? "lg:order-1" : ""}`}>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/25 mb-4">{p.tag}</p>
                <h3 className="font-display text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight">{p.title}</h3>
                <p className="text-white/40 text-base leading-relaxed mb-6">{p.sub}</p>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-white font-black text-2xl">{p.price}</p>
                    <p className="text-white/25 text-xs line-through">{p.normal} retail</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider text-white"
                    style={{ background: "linear-gradient(135deg, #FF2D78, #7C3AED)" }}>
                    Box price
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div className="text-center mt-12"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <Link href="/shop">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-black uppercase tracking-wider text-white"
              style={{ border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)" }}>
              View All Products <ArrowRight className="w-4 h-4" />
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Spin Teaser ──────────────────────────────────────────────────────────────

function SpinTeaser() {
  return (
    <section className="relative overflow-hidden py-28 sm:py-40">
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,215,0,0.07) 0%, transparent 70%), #050508"
      }} />

      <div className="relative z-10 max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, filter: "blur(20px)" }}
          whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          viewport={{ once: true }} transition={{ duration: 0.9, ease: ease.expo }}>

          <motion.div className="text-7xl sm:text-8xl mb-8 inline-block"
            animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
            🎡
          </motion.div>

          <h2 className="font-display font-bold text-white mb-5" style={{ fontSize: "clamp(2.5rem, 7vw, 7rem)", lineHeight: 0.9 }}>
            Every order wins<br />
            <span style={{ background: "linear-gradient(135deg, #FFD700, #F5A623)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              a reward.
            </span>
          </h2>

          <p className="text-white/40 text-lg sm:text-xl max-w-md mx-auto mb-10 leading-relaxed">
            Spin the lucky wheel after you build your box. Win free gifts, discounts, or surprise upgrades.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {["Free Tiny Gift", "Free Shipping", "10% Off", "Gift Upgrade", "Mystery Bonus"].map((r) => (
              <span key={r} className="px-4 py-2 rounded-full text-xs font-bold text-white/50"
                style={{ border: "1px solid rgba(255,215,0,0.2)", background: "rgba(255,215,0,0.05)" }}>
                {r}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Testimonials — Full-Width Brutalist ─────────────────────────────────────

function Testimonials() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % TESTIMONIALS.length), 5500);
    return () => clearInterval(t);
  }, []);

  const t = TESTIMONIALS[idx];

  return (
    <section className="relative px-6 sm:px-10 lg:px-16 py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />
      <div className="max-w-[1600px] mx-auto">
        <div className="grid lg:grid-cols-2 items-center gap-12 lg:gap-20">
          <div>
            <div className="flex mb-6">
              {Array(5).fill(0).map((_, i) => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
            </div>

            <AnimatePresence mode="wait">
              <motion.blockquote
                key={idx}
                initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
                transition={{ duration: 0.5, ease: ease.expo }}
                className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.1] mb-8">
                &ldquo;{t.quote}&rdquo;
              </motion.blockquote>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white"
                  style={{ background: "linear-gradient(135deg, #FF2D78, #7C3AED)" }}>
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{t.name}</p>
                  <p className="text-white/35 text-xs">{t.city}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex gap-2 mt-8">
              {TESTIMONIALS.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)}
                  className={`h-1 rounded-full transition-all duration-300 ${i === idx ? "w-8 bg-[#FF2D78]" : "w-4 bg-white/15"}`} />
              ))}
            </div>
          </div>

          {/* Right: stat block */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { val: "1,200+", label: "Boxes sent" },
              { val: "4.9 ★", label: "Average rating" },
              { val: "< 3 min", label: "To build a box" },
              { val: "15–25%", label: "You save per item" },
            ].map((s, i) => (
              <motion.div
                key={s.val}
                className="rounded-2xl p-6"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ borderColor: "rgba(255,45,120,0.2)", background: "rgba(255,255,255,0.05)" }}>
                <p className="font-display text-3xl sm:text-4xl font-bold text-white mb-1">{s.val}</p>
                <p className="text-white/30 text-xs font-bold uppercase tracking-wider">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-28 sm:py-40">
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 100% 80% at 50% 100%, rgba(255,45,120,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 20%, rgba(124,58,237,0.08) 0%, transparent 60%), #050508"
      }} />

      <div className="relative z-10 text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 60, filter: "blur(20px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }} transition={{ duration: 1, ease: ease.expo }}>

          <h2 className="font-display font-bold text-white leading-[0.88] mb-8"
            style={{ fontSize: "clamp(4rem, 12vw, 12rem)" }}>
            Ready to gift?
          </h2>

          <Link href="/build-a-box">
            <motion.div
              whileHover={{ scale: 1.06, boxShadow: "0 0 80px rgba(255,45,120,0.5)" }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-3 px-10 py-5 rounded-full text-base font-black uppercase tracking-wider text-white"
              style={{ background: "linear-gradient(135deg, #FF2D78, #7C3AED)" }}>
              <Sparkles className="w-5 h-5" /> Build Your Box
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="px-6 sm:px-10 lg:px-16 py-12 border-t border-white/5">
      <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <Link href="/" className="font-display text-xl font-bold text-white">
          gamif<span style={{ color: "#FF2D78" }}>.</span>
        </Link>
        <div className="flex gap-8 text-xs font-medium text-white/25">
          {["/shop", "/build-a-box", "/quiz", "/cart"].map((h) => (
            <Link key={h} href={h} className="hover:text-white/60 transition-colors capitalize">
              {h.replace("/", "").replace("-", " ") || "Home"}
            </Link>
          ))}
        </div>
        <p className="text-white/15 text-xs">© {new Date().getFullYear()} Gamif · Georgia 🇬🇪</p>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="bg-[#050508] min-h-screen overflow-x-hidden">
      <CursorGlow />
      <Nav />
      <Hero />
      <Marquee />
      <TheConcept />
      <ForWho />
      <EditorialShowcase />
      <SpinTeaser />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </div>
  );
}
