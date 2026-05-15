"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Gift, Package, Sparkles, Star, Zap } from "lucide-react";
import { useRef } from "react";

// ── Animation variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

// ── Data ─────────────────────────────────────────────────────────────────────

const stats = [
  { label: "Gift Boxes Sent",   value: "12,400+" },
  { label: "Happy Recipients",  value: "9,800+"  },
  { label: "Spin Rewards Given",value: "7,200+"  },
  { label: "Average Savings",   value: "22%"     },
];

const vibeCards = [
  {
    vibe: "romantic",
    label: "Romantic",
    emoji: "🌹",
    color: "from-rose-600 to-pink-800",
    glow: "rgba(244,63,94,0.4)",
    img: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=600&q=80",
  },
  {
    vibe: "luxury",
    label: "Luxury",
    emoji: "💎",
    color: "from-amber-600 to-yellow-800",
    glow: "rgba(217,119,6,0.4)",
    img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
  },
  {
    vibe: "cozy",
    label: "Cozy",
    emoji: "🕯️",
    color: "from-orange-700 to-amber-900",
    glow: "rgba(234,88,12,0.4)",
    img: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80",
  },
  {
    vibe: "aesthetic",
    label: "Aesthetic",
    emoji: "🎨",
    color: "from-violet-700 to-purple-900",
    glow: "rgba(124,58,237,0.4)",
    img: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80",
  },
];

const howItWorks = [
  {
    step: "01",
    icon: "🎯",
    title: "Pick your vibe",
    desc: "Choose for her, him, or them. Filter by mood — romantic, cozy, luxury, and more.",
  },
  {
    step: "02",
    icon: "📦",
    title: "Build the box",
    desc: "Select your Main Surprise, Sweet Pick, and Tiny Extra at exclusive box prices.",
  },
  {
    step: "03",
    icon: "🎡",
    title: "Spin for a reward",
    desc: "Complete your box and spin the lucky wheel. Free shipping, upgrades, or secret items.",
  },
  {
    step: "04",
    icon: "✨",
    title: "They open it live",
    desc: "Wrapped, sealed, and delivered. The unboxing is the experience.",
  },
];

// ── Component ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white overflow-x-hidden">
      <SiteNav />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Parallax background */}
        <motion.div className="absolute inset-0" style={{ y: heroY }}>
          <Image
            src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=2000&q=85"
            alt="Premium mystery gift box"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0D0D0D]/40 via-transparent to-[#0D0D0D]" />
        </motion.div>

        {/* Ambient glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-violet/20 rounded-full blur-[100px]" />
        </div>

        <motion.div
          className="relative z-10 text-center px-6 max-w-5xl mx-auto"
          style={{ opacity: heroOpacity }}
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div variants={fadeUp} custom={0}>
            <span className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-xs font-bold tracking-widest uppercase text-accent mb-8">
              <Sparkles className="w-3 h-3" />
              Premium Mystery Gift Platform
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="font-display text-6xl sm:text-7xl lg:text-[96px] font-bold leading-[1.0] tracking-tight mb-8"
          >
            The gift they{" "}
            <span className="bg-dopamine-gradient bg-clip-text text-transparent">
              never saw coming.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed mb-12"
          >
            Build a curated mystery box with suspense, surprise rewards, and cinematic unboxing.
            Products at exclusive{" "}
            <span className="text-accent font-bold">box prices</span> — cheaper than buying normally.
          </motion.p>

          <motion.div
            variants={fadeUp}
            custom={3}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              href="/build-a-box"
              className="btn-dopamine px-10 py-5 rounded-2xl text-base inline-flex items-center gap-3"
            >
              <Gift className="w-5 h-5" />
              Build Your Box
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/shop"
              className="px-10 py-5 rounded-2xl glass text-base font-bold uppercase tracking-widest inline-flex items-center gap-3 hover:bg-white/10 transition-all"
            >
              Browse Products
            </Link>
          </motion.div>

          {/* Price teaser */}
          <motion.div variants={fadeUp} custom={4} className="mt-16 inline-flex items-center gap-6 glass rounded-2xl px-8 py-4">
            <div className="text-center">
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Normal Price</p>
              <p className="text-white/50 text-2xl font-bold line-through">49 ₾</p>
            </div>
            <div className="text-white/20 text-3xl font-thin">→</div>
            <div className="text-center">
              <p className="text-accent text-xs font-bold uppercase tracking-widest mb-1">✨ Box Price</p>
              <p className="text-white text-3xl font-black">40 ₾</p>
            </div>
            <div className="ml-2">
              <span className="box-price-badge">Save 18%</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/40 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────────────────── */}
      <section className="bg-[#111111] border-y border-white/5 py-10">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            {stats.map((s) => (
              <motion.div key={s.label} variants={fadeUp} className="text-center">
                <p className="text-3xl font-black text-white mb-1">{s.value}</p>
                <p className="text-white/40 text-xs font-bold uppercase tracking-wider">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Dual pricing callout ────────────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp} custom={0}>
              <span className="text-accent text-xs font-black uppercase tracking-[0.3em] mb-4 block">
                The Box Advantage
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="font-display text-5xl lg:text-6xl font-bold text-white mb-6">
              Two prices. One is way better.
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-white/60 text-xl max-w-2xl mx-auto">
              Every product on our platform has a standard retail price — and a special
              <span className="text-white font-bold"> Add to Box</span> price. Box prices are
              always lower, creating an exclusive, reward-like feeling.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="glass rounded-3xl p-8 md:p-12 border border-white/10"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left p-6 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-white/40 text-xs font-black uppercase tracking-widest mb-3">Buy Normally</p>
                <p className="text-5xl font-black text-white/60 mb-4 line-through">49 ₾</p>
                <p className="text-white/40 text-sm">Standard retail price. Available anytime.</p>
                <button className="mt-6 px-8 py-3 border border-white/20 rounded-xl text-sm font-bold text-white/60 uppercase tracking-wider w-full hover:border-white/40 transition-colors">
                  Buy Normally
                </button>
              </div>

              <div className="text-4xl font-thin text-white/20 hidden md:block">VS</div>

              <div className="flex-1 text-center md:text-left p-6 rounded-2xl bg-gradient-to-br from-accent/10 to-violet/10 border border-accent/30 relative overflow-hidden">
                <div className="absolute top-3 right-3">
                  <span className="box-price-badge">Exclusive</span>
                </div>
                <p className="text-accent text-xs font-black uppercase tracking-widest mb-3">✨ Add To Box</p>
                <p className="text-5xl font-black text-white mb-1">40 ₾</p>
                <p className="text-accent/80 text-sm font-bold mb-4">You save 9 ₾ (18% off)</p>
                <p className="text-white/60 text-sm">Box price applied at checkout. Part of your mystery experience.</p>
                <button className="btn-dopamine mt-6 px-8 py-3 rounded-xl text-sm w-full">
                  ✨ Add To Box — 40 ₾
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Vibe browsing ───────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#111111]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.span variants={fadeUp} className="text-violet-2 text-xs font-black uppercase tracking-[0.3em] mb-4 block">
              Shop by Mood
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="font-display text-5xl lg:text-6xl font-bold mb-4">
              What's the vibe?
            </motion.h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
          >
            {vibeCards.map((v, i) => (
              <motion.div key={v.vibe} variants={fadeUp} custom={i}>
                <Link
                  href={`/shop?vibe=${v.vibe}`}
                  className="group relative overflow-hidden rounded-3xl aspect-[3/4] flex flex-col justify-end p-6 block"
                  style={{ boxShadow: `0 0 0 0 ${v.glow}` }}
                >
                  <Image
                    src={v.img}
                    alt={v.label}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${v.color} opacity-70 group-hover:opacity-85 transition-opacity duration-300`} />
                  <div className="relative z-10">
                    <span className="text-4xl mb-2 block">{v.emoji}</span>
                    <h3 className="font-display text-3xl font-bold text-white">{v.label}</h3>
                    <p className="text-white/70 text-sm mt-1 flex items-center gap-2">
                      Shop gifts
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-2 transition-transform" />
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-20"
          >
            <motion.span variants={fadeUp} className="text-gold text-xs font-black uppercase tracking-[0.3em] mb-4 block">
              The Experience
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="font-display text-5xl lg:text-6xl font-bold">
              How it works
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {howItWorks.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 glass rounded-2xl text-3xl mb-4 border border-white/10">
                  {step.icon}
                </div>
                <p className="text-white/20 text-xs font-black uppercase tracking-[0.2em] mb-2">{step.step}</p>
                <h3 className="font-bold text-lg text-white mb-2">{step.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Lucky Spin teaser ───────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-gradient-radial from-violet/10 via-[#111111] to-[#111111] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet/10 rounded-full blur-[150px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} custom={0} className="text-6xl mb-6 inline-block animate-float">
              🎡
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="font-display text-5xl lg:text-7xl font-bold mb-6">
              <span className="bg-dopamine-gradient bg-clip-text text-transparent">Spin to win</span>
              <br />a surprise reward.
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-white/60 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Complete your box and get chosen for a Lucky Wheel spin.
              Free shipping, gift upgrades, discount codes, and secret items — all server-generated, zero cheats.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex flex-wrap justify-center gap-3">
              {["🚚 Free Shipping", "💸 10% Off", "🎁 Free Gift", "✨ Secret Item", "⬆️ Upgrade"].map((r) => (
                <span key={r} className="px-4 py-2 glass rounded-full text-sm font-bold border border-white/10">
                  {r}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Testimonial ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="flex justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-gold fill-gold" />
              ))}
            </motion.div>
            <motion.blockquote variants={fadeUp} custom={1} className="font-display text-3xl md:text-4xl font-medium text-white/90 leading-snug mb-8">
              "She literally screamed when she saw the box. The lucky spin gave free shipping AND an upgrade. Total dopamine hit."
            </motion.blockquote>
            <motion.p variants={fadeUp} custom={2} className="text-white/40 text-xs font-bold uppercase tracking-widest">
              Giorgi M. — Tbilisi — Anniversary Surprise
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────────── */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet/20 rounded-full blur-[150px]" />
        </div>
        <motion.div
          className="relative z-10 max-w-3xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
        >
          <motion.h2 variants={fadeUp} custom={0} className="font-display text-6xl md:text-8xl font-bold leading-none mb-6">
            Make it a{" "}
            <span className="bg-dopamine-gradient bg-clip-text text-transparent">moment.</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-white/60 text-xl mb-12 max-w-lg mx-auto">
            Build an unforgettable gift box — with exclusive box prices and a lucky spin reward.
          </motion.p>
          <motion.div variants={fadeUp} custom={2}>
            <Link
              href="/build-a-box"
              className="btn-dopamine px-14 py-6 rounded-2xl text-lg inline-flex items-center gap-4"
            >
              <Zap className="w-6 h-6" />
              Start Building Now
              <ArrowRight className="w-6 h-6" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}

// ── Nav ───────────────────────────────────────────────────────────────────────

function SiteNav() {
  return (
    <header className="fixed top-0 w-full z-50 px-6 py-5 flex items-center justify-between glass border-b border-white/5">
      <Link href="/" className="font-display text-2xl font-bold tracking-tight text-white">
        gamif<span className="text-accent">.</span>
      </Link>
      <nav className="hidden md:flex items-center gap-8 text-xs font-bold tracking-widest uppercase text-white/60">
        <Link href="/shop" className="hover:text-white transition-colors">Shop</Link>
        <Link href="/build-a-box" className="hover:text-white transition-colors">Build a Box</Link>
        <Link href="/shop?audience=for_her" className="hover:text-white transition-colors">For Her</Link>
        <Link href="/shop?audience=for_him" className="hover:text-white transition-colors">For Him</Link>
      </nav>
      <div className="flex items-center gap-4">
        <Link
          href="/build-a-box"
          className="hidden md:flex btn-dopamine items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
        >
          <Gift className="w-4 h-4" />
          Build a Box
        </Link>
      </div>
    </header>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-white/5 py-16 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-4">
          <Link href="/" className="font-display text-3xl font-bold text-white mb-4 block">
            gamif<span className="text-accent">.</span>
          </Link>
          <p className="text-white/40 text-sm leading-relaxed max-w-xs">
            Premium mystery gifting platform. Curated boxes, exclusive prices, and dopamine-driven surprise mechanics.
          </p>
        </div>
        <div className="md:col-span-2">
          <h4 className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-5">Shop</h4>
          <ul className="space-y-3 text-sm text-white/60">
            <li><Link href="/shop" className="hover:text-white transition-colors">All Products</Link></li>
            <li><Link href="/shop?audience=for_her" className="hover:text-white transition-colors">For Her</Link></li>
            <li><Link href="/shop?audience=for_him" className="hover:text-white transition-colors">For Him</Link></li>
            <li><Link href="/shop?audience=couple" className="hover:text-white transition-colors">For Couples</Link></li>
          </ul>
        </div>
        <div className="md:col-span-2">
          <h4 className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-5">Experience</h4>
          <ul className="space-y-3 text-sm text-white/60">
            <li><Link href="/build-a-box" className="hover:text-white transition-colors">Build a Box</Link></li>
            <li><Link href="/build-a-box#spin" className="hover:text-white transition-colors">Lucky Spin</Link></li>
            <li><Link href="/shop" className="hover:text-white transition-colors">Browse Vibes</Link></li>
          </ul>
        </div>
        <div className="md:col-span-2">
          <h4 className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-5">Support</h4>
          <ul className="space-y-3 text-sm text-white/60">
            <li><Link href="#" className="hover:text-white transition-colors">FAQ</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Shipping</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-white/30 text-xs">
        <p>© {new Date().getFullYear()} Gamif. All rights reserved.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-white transition-colors">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
