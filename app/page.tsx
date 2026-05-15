"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { ArrowRight, Gift, Sparkles, Star, Zap, Brain } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import ActivityFeed from "@/components/ActivityFeed";
import { fadeUp, stagger, viewport, springs, ease } from "@/lib/motion";

// ── Data ──────────────────────────────────────────────────────────────────────

const stats = [
  { label: "Boxes Sent",     value: "12,400+" },
  { label: "Happy Recipients", value: "9,800+" },
  { label: "Spin Rewards",   value: "7,200+"  },
  { label: "Avg. Savings",   value: "22%"     },
];

const vibeCards = [
  { vibe: "romantic", label: "Romantic", emoji: "🌹", color: "from-rose-700 to-pink-900", glow: "rgba(244,63,94,0.4)", img: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=600&q=80" },
  { vibe: "luxury",   label: "Luxury",   emoji: "💎", color: "from-amber-700 to-yellow-900", glow: "rgba(217,119,6,0.4)", img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80" },
  { vibe: "cozy",     label: "Cozy",     emoji: "🕯️", color: "from-orange-700 to-amber-900", glow: "rgba(234,88,12,0.4)", img: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80" },
  { vibe: "aesthetic",label: "Aesthetic",emoji: "🎨", color: "from-violet-700 to-purple-900", glow: "rgba(124,58,237,0.4)", img: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80" },
];

const howItWorks = [
  { step: "01", icon: "🎯", title: "Find the vibe",    desc: "Answer 5 quick questions. We'll match products to your person's energy." },
  { step: "02", icon: "📦", title: "Build the box",   desc: "Main Surprise, Sweet Pick, Tiny Extra — all at exclusive box prices." },
  { step: "03", icon: "🎡", title: "Spin for a reward", desc: "Free shipping, upgrades, secret items. Server-generated — zero tricks." },
  { step: "04", icon: "✨", title: "They open it live", desc: "Cinematic unboxing moment, made to be shared on TikTok and Instagram." },
];

const testimonials = [
  { quote: "She literally screamed when she saw the box. The lucky spin gave free shipping AND an upgrade. Total dopamine hit.", name: "Giorgi M.", location: "Tbilisi", tag: "Anniversary" },
  { quote: "I've never seen a gift land so perfectly. The vibe quiz was spooky accurate — she cried happy tears.", name: "Ana K.", location: "Kutaisi", tag: "Birthday" },
  { quote: "Used it for our anniversary. The Lucky Spin unlocked a secret item. We still talk about it.", name: "Luka T.", location: "Batumi", tag: "Couples" },
];

// ── Components ────────────────────────────────────────────────────────────────

function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header className={`fixed top-0 w-full z-50 px-5 py-4 flex items-center justify-between transition-all duration-300 ${scrolled ? "glass-strong border-b border-white/5" : ""}`}>
      <Link href="/" className="font-display text-2xl font-bold tracking-tight text-white">
        gamif<span className="text-accent">.</span>
      </Link>
      <nav className="hidden md:flex items-center gap-7 text-[11px] font-black tracking-[0.18em] uppercase text-white/50">
        <Link href="/shop" className="hover:text-white transition-colors">Shop</Link>
        <Link href="/build-a-box" className="hover:text-white transition-colors">Build a Box</Link>
        <Link href="/quiz" className="hover:text-white transition-colors text-violet-2">Find My Vibe ✨</Link>
      </nav>
      <Link href="/build-a-box" className="btn-dopamine items-center gap-2 px-5 py-2.5 rounded-xl text-xs hidden md:flex">
        <Gift className="w-3.5 h-3.5" /> Build a Box
      </Link>
    </header>
  );
}

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = Math.ceil(target / 60);
        const interval = setInterval(() => {
          start = Math.min(start + step, target);
          setCount(start);
          if (start >= target) clearInterval(interval);
        }, 16);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

function Footer() {
  return (
    <footer className="bg-[#080808] border-t border-white/5 py-16 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-4">
          <Link href="/" className="font-display text-3xl font-bold text-white mb-4 block">gamif<span className="text-accent">.</span></Link>
          <p className="text-white/35 text-sm leading-relaxed max-w-xs">
            Premium mystery gifting platform. Curated boxes, exclusive prices, dopamine-driven surprise mechanics.
          </p>
        </div>
        <div className="md:col-span-2">
          <h4 className="text-white/25 text-[10px] font-black uppercase tracking-widest mb-5">Shop</h4>
          <ul className="space-y-3 text-sm text-white/50">
            {[["All Products", "/shop"], ["For Her", "/shop?audience=for_her"], ["For Him", "/shop?audience=for_him"], ["Couples", "/shop?audience=couple"]].map(([l, h]) => (
              <li key={l}><Link href={h} className="hover:text-white transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2">
          <h4 className="text-white/25 text-[10px] font-black uppercase tracking-widest mb-5">Experience</h4>
          <ul className="space-y-3 text-sm text-white/50">
            {[["Build a Box", "/build-a-box"], ["Vibe Quiz", "/quiz"], ["Lucky Spin", "/build-a-box"], ["Browse Vibes", "/shop"]].map(([l, h]) => (
              <li key={l}><Link href={h} className="hover:text-white transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2">
          <h4 className="text-white/25 text-[10px] font-black uppercase tracking-widest mb-5">Support</h4>
          <ul className="space-y-3 text-sm text-white/50">
            {[["FAQ", "#"], ["Shipping", "#"], ["Contact", "#"]].map(([l, h]) => (
              <li key={l}><Link href={h} className="hover:text-white transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-white/25 text-xs">
        <p>© {new Date().getFullYear()} Gamif. All rights reserved.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-white transition-colors">Terms</Link>
        </div>
      </div>
    </footer>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useSpring(useTransform(scrollYProgress, [0, 1], ["0%", "28%"]), { stiffness: 100, damping: 30 });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  const [activeTestimonial, setActiveTestimonial] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial((i) => (i + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white overflow-x-hidden">
      <SiteNav />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Parallax bg */}
        <motion.div className="absolute inset-0" style={{ y: heroY, scale: heroScale }}>
          <Image
            src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=2000&q=85"
            alt="Premium mystery gift"
            fill className="object-cover opacity-15" priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0D0D0D]/60 via-transparent to-[#0D0D0D]" />
        </motion.div>

        {/* Ambient glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full blur-[140px]"
            style={{ background: "rgba(255,45,120,0.15)" }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px]"
            style={{ background: "rgba(124,58,237,0.15)" }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </div>

        {/* Content */}
        <motion.div
          className="relative z-10 text-center px-6 max-w-5xl mx-auto"
          style={{ opacity: heroOpacity }}
          initial="hidden"
          animate="visible"
          variants={stagger(0.1, 0.1)}
        >
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-xs font-black tracking-[0.2em] uppercase text-accent mb-8 border border-accent/20">
              <Sparkles className="w-3 h-3" /> Premium Mystery Gift Platform
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-display text-6xl sm:text-7xl lg:text-[92px] font-bold leading-[1.0] tracking-tight mb-8"
          >
            The gift they{" "}
            <span
              className="font-black"
              style={{ background: "linear-gradient(135deg, #FF2D78 0%, #C026D3 50%, #7C3AED 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              never saw coming.
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-10">
            Build a curated mystery box with suspense, lucky rewards, and cinematic unboxing.
            At exclusive{" "}
            <span className="text-accent font-bold">box prices</span>{" "}
            — always cheaper than buying separately.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/build-a-box" className="btn-dopamine px-10 py-4 rounded-2xl text-sm font-black inline-flex items-center gap-3">
              <Gift className="w-5 h-5" /> Build Your Box <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/quiz"
              className="px-10 py-4 rounded-2xl glass font-bold text-sm uppercase tracking-wider inline-flex items-center gap-2 hover:bg-white/8 transition-all border border-white/10 hover:border-white/20"
            >
              <Brain className="w-4 h-4 text-violet-2" /> Find My Vibe
            </Link>
          </motion.div>

          {/* Price teaser badge */}
          <motion.div variants={fadeUp} className="inline-flex items-center gap-5 glass-strong rounded-2xl px-7 py-4 border border-white/8">
            <div className="text-center">
              <p className="text-white/25 text-[10px] font-black uppercase tracking-widest mb-1">Normal</p>
              <p className="text-white/40 text-2xl font-bold line-through">49 ₾</p>
            </div>
            <div className="text-white/15 text-2xl">→</div>
            <div className="text-center">
              <p className="text-accent text-[10px] font-black uppercase tracking-widest mb-1">✨ Box Price</p>
              <p className="text-white text-3xl font-black">40 ₾</p>
            </div>
            <span className="box-price-badge ml-1 hidden sm:flex">Save 18%</span>
          </motion.div>
        </motion.div>

        {/* Activity feed bottom-left */}
        <div className="absolute bottom-8 left-5 z-20 hidden lg:block">
          <ActivityFeed />
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          <div className="w-5 h-9 border-2 border-white/15 rounded-full flex justify-center pt-1.5">
            <div className="w-0.5 h-1.5 bg-white/30 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────────────────── */}
      <section className="bg-[#0f0f0f] border-y border-white/5 py-10">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={stagger(0.08)}
          >
            {stats.map((s, i) => (
              <motion.div key={s.label} variants={fadeUp} className="text-center">
                <p className="text-3xl font-black text-white mb-1">{s.value}</p>
                <p className="text-white/30 text-[10px] font-black uppercase tracking-wider">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Vibe Quiz CTA ─────────────────────────────────────────────────── */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet/8 blur-[100px] rounded-full" />
        </div>
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="relative rounded-3xl overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: 0.7, ease: ease.expo }}
            style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(255,45,120,0.1) 100%)", border: "1px solid rgba(124,58,237,0.25)" }}
          >
            {/* Shimmer */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.04) 50%, transparent 70%)" }}
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
            />
            <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <motion.span
                  className="text-xs font-black uppercase tracking-[0.25em] text-violet-2 mb-4 block"
                  initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={viewport}
                >
                  Vibe Matchmaking ✨
                </motion.span>
                <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                  Not sure what to get?
                  <br />
                  <span style={{ background: "linear-gradient(135deg, #C084FC, #FF2D78)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    We&apos;ll figure it out.
                  </span>
                </h2>
                <p className="text-white/50 text-base leading-relaxed mb-8 max-w-md">
                  Answer 5 questions about your person. Get a curated box recommendation that feels made for them — not picked for a stranger.
                </p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {["Who is it for?", "What's the vibe?", "What occasion?", "What's the energy?"].map((q) => (
                    <span key={q} className="text-xs px-3 py-1.5 rounded-full bg-white/8 text-white/50 border border-white/10">
                      {q}
                    </span>
                  ))}
                </div>
                <Link
                  href="/quiz"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-black"
                  style={{ background: "linear-gradient(135deg, #7C3AED, #C026D3)", boxShadow: "0 0 30px rgba(124,58,237,0.4)" }}
                >
                  <Brain className="w-4 h-4" />
                  Take the Vibe Quiz
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="relative w-full md:w-64 shrink-0">
                <div className="grid grid-cols-2 gap-3">
                  {["🌹", "💎", "🕯️", "🌸"].map((e, i) => (
                    <motion.div
                      key={i}
                      className="aspect-square rounded-2xl glass border border-white/10 flex items-center justify-center text-4xl"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                    >
                      {e}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Dual pricing ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#0f0f0f]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={viewport}
            variants={stagger(0.1)} className="text-center mb-16"
          >
            <motion.span variants={fadeUp} className="text-accent text-xs font-black uppercase tracking-[0.3em] mb-4 block">The Box Advantage</motion.span>
            <motion.h2 variants={fadeUp} className="font-display text-4xl lg:text-5xl font-bold text-white mb-5">Two prices. One is way better.</motion.h2>
            <motion.p variants={fadeUp} className="text-white/50 text-lg max-w-2xl mx-auto">
              Every product has a retail price — and a lower <span className="text-white font-bold">box price</span> applied when added to a gift box.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={viewport}
            transition={{ duration: 0.7, ease: ease.expo }}
            className="glass rounded-3xl p-6 md:p-10 border border-white/8"
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 w-full p-6 rounded-2xl bg-white/3 border border-white/8 text-center md:text-left">
                <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-3">Normal Purchase</p>
                <p className="text-5xl font-black text-white/40 mb-3 line-through">49 ₾</p>
                <p className="text-white/30 text-sm">Standard retail. Available anytime.</p>
              </div>
              <div className="text-3xl font-thin text-white/15 hidden md:block">→</div>
              <div className="flex-1 w-full p-6 rounded-2xl border text-center md:text-left relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, rgba(255,45,120,0.1), rgba(124,58,237,0.08))", borderColor: "rgba(255,45,120,0.3)" }}>
                <div className="absolute top-3 right-3"><span className="box-price-badge">Exclusive</span></div>
                <p className="text-accent text-[10px] font-black uppercase tracking-widest mb-3">✨ Add To Box</p>
                <p className="text-5xl font-black text-white mb-1">40 ₾</p>
                <p className="text-accent/80 text-sm font-bold">You save 9 ₾ (18% off)</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Vibe browsing ─────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={viewport} variants={stagger(0.1)} className="text-center mb-14">
            <motion.span variants={fadeUp} className="text-violet-2 text-xs font-black uppercase tracking-[0.3em] mb-4 block">Shop by Mood</motion.span>
            <motion.h2 variants={fadeUp} className="font-display text-4xl lg:text-5xl font-bold">What&apos;s the vibe?</motion.h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            initial="hidden" whileInView="visible" viewport={viewport}
            variants={stagger(0.07)}
          >
            {vibeCards.map((v, i) => (
              <motion.div key={v.vibe} variants={fadeUp}>
                <Link href={`/shop?vibe=${v.vibe}`}
                  className="group relative overflow-hidden rounded-3xl aspect-[3/4] flex flex-col justify-end p-5 block"
                >
                  <Image src={v.img} alt={v.label} fill className="object-cover transition-transform duration-700 group-hover:scale-108" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${v.color} opacity-65 group-hover:opacity-80 transition-opacity duration-400`} />
                  <motion.div
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ boxShadow: `inset 0 0 60px ${v.glow}` }}
                  />
                  <div className="relative z-10">
                    <span className="text-4xl mb-2 block">{v.emoji}</span>
                    <h3 className="font-display text-3xl font-bold text-white">{v.label}</h3>
                    <p className="text-white/60 text-sm mt-1 flex items-center gap-2">
                      Shop gifts <ArrowRight className="w-3 h-3 group-hover:translate-x-2 transition-transform" />
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#0f0f0f]">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={viewport} variants={stagger(0.1)} className="text-center mb-18">
            <motion.span variants={fadeUp} className="text-gold text-xs font-black uppercase tracking-[0.3em] mb-4 block">The Experience</motion.span>
            <motion.h2 variants={fadeUp} className="font-display text-4xl lg:text-5xl font-bold">How it works</motion.h2>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-8 mt-14">
            {howItWorks.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewport}
                transition={{ delay: i * 0.12, duration: 0.65, ease: ease.expo }}
                className="text-center"
              >
                <motion.div
                  className="inline-flex items-center justify-center w-16 h-16 glass rounded-2xl text-3xl mb-4 border border-white/10"
                  whileHover={{ scale: 1.08, rotate: 5 }}
                  transition={springs.bouncy}
                >
                  {step.icon}
                </motion.div>
                <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{step.step}</p>
                <h3 className="font-bold text-base text-white mb-2">{step.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Lucky Spin teaser ─────────────────────────────────────────────── */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[180px]"
            style={{ background: "rgba(124,58,237,0.12)" }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={viewport} variants={stagger(0.1)}>
            <motion.div variants={fadeUp} className="text-6xl mb-6 inline-block">
              <motion.span
                className="block"
                animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                🎡
              </motion.span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="font-display text-5xl lg:text-7xl font-bold mb-5">
              <span style={{ background: "linear-gradient(135deg, #FF2D78, #7C3AED)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Spin to win
              </span>
              <br />a surprise reward.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/50 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Complete your box and spin the lucky wheel. Free shipping, gift upgrades, secret items — all server-generated.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3">
              {["🚚 Free Shipping", "💸 10% Off", "🎁 Free Gift", "✨ Secret Item", "⬆️ Upgrade"].map((r) => (
                <motion.span
                  key={r}
                  className="px-4 py-2 glass rounded-full text-sm font-bold border border-white/10"
                  whileHover={{ scale: 1.05, borderColor: "rgba(255,45,120,0.4)" }}
                  transition={springs.snappy}
                >
                  {r}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#0f0f0f]">
        <div className="max-w-3xl mx-auto text-center">
          <motion.span
            className="text-gold text-xs font-black uppercase tracking-[0.3em] mb-10 block"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={viewport}
          >
            Real Stories
          </motion.span>
          <div className="relative min-h-[200px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
                transition={{ duration: 0.55, ease: ease.expo }}
              >
                <div className="flex justify-center gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-5 h-5 text-gold fill-gold" />)}
                </div>
                <blockquote className="font-display text-2xl md:text-3xl font-medium text-white/85 leading-snug mb-6">
                  &ldquo;{testimonials[activeTestimonial].quote}&rdquo;
                </blockquote>
                <p className="text-white/35 text-xs font-bold uppercase tracking-widest">
                  {testimonials[activeTestimonial].name} · {testimonials[activeTestimonial].location} · {testimonials[activeTestimonial].tag}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setActiveTestimonial(i)}
                className={`rounded-full transition-all ${i === activeTestimonial ? "w-5 h-2 bg-accent" : "w-2 h-2 bg-white/20"}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-accent/12 rounded-full blur-[160px]" />
          <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] bg-violet/12 rounded-full blur-[160px]" />
        </div>
        <motion.div
          className="relative z-10 max-w-3xl mx-auto text-center"
          initial="hidden" whileInView="visible" viewport={viewport}
          variants={stagger(0.1)}
        >
          <motion.h2 variants={fadeUp} className="font-display text-5xl md:text-7xl font-bold leading-none mb-6">
            Make it a{" "}
            <span style={{ background: "linear-gradient(135deg, #FF2D78, #7C3AED)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              moment.
            </span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/50 text-xl mb-12 max-w-lg mx-auto">
            Build an unforgettable gift box — with exclusive prices and a lucky spin reward.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/build-a-box" className="btn-dopamine px-12 py-5 rounded-2xl text-sm font-black inline-flex items-center gap-3">
              <Zap className="w-5 h-5" /> Start Building Now <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/quiz"
              className="px-12 py-5 rounded-2xl glass text-sm font-bold inline-flex items-center gap-2 border border-white/10 hover:border-white/25 transition-all"
            >
              <Brain className="w-4 h-4 text-violet-2" /> Take the Quiz First
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}
