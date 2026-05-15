"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ArrowRight, Gift, Heart, Sparkles, Star, ChevronRight, ChevronLeft } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { springs, ease } from "@/lib/motion";

// ─── Data ────────────────────────────────────────────────────────────────────

const OCCASIONS = [
  { label: "Anniversary", emoji: "💍" },
  { label: "Birthday", emoji: "🎂" },
  { label: "Just Because", emoji: "💌" },
  { label: "Valentine's", emoji: "🌹" },
  { label: "Long Distance", emoji: "✈️" },
  { label: "Apology", emoji: "🤍" },
];

const FEATURED_BOXES = [
  {
    id: "romantic-box",
    name: "Romantic Evening Box",
    tagline: "For a night she won't forget",
    price: "89 ₾",
    originalPrice: "120 ₾",
    image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=600&q=80",
    tags: ["For Her", "Anniversary"],
    badge: "Best Seller",
  },
  {
    id: "cozy-night",
    name: "Cozy Night In Box",
    tagline: "Candles, chocolates & warmth",
    price: "65 ₾",
    originalPrice: "90 ₾",
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80",
    tags: ["For Her", "Birthday"],
    badge: "New",
  },
  {
    id: "adventure-box",
    name: "His Adventure Kit",
    tagline: "For the guy who has everything",
    price: "75 ₾",
    originalPrice: "105 ₾",
    image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80",
    tags: ["For Him", "Birthday"],
    badge: null,
  },
  {
    id: "memory-box",
    name: "Memory Lane Box",
    tagline: "A love letter you can open",
    price: "95 ₾",
    originalPrice: "130 ₾",
    image: "https://images.unsplash.com/photo-1549388604-817d15aa0110?auto=format&fit=crop&w=600&q=80",
    tags: ["For Both", "Anniversary"],
    badge: "Fan Favourite",
  },
];

const TESTIMONIALS = [
  {
    text: "My girlfriend cried happy tears. The note I wrote was printed beautifully inside. Easiest gift I've ever given.",
    name: "Giorgi T.",
    city: "Tbilisi",
    emoji: "💌",
  },
  {
    text: "I had no idea what to get for our anniversary. Gamif helped me pick the perfect box in 5 minutes. She loved it.",
    name: "Luka M.",
    city: "Batumi",
    emoji: "💍",
  },
  {
    text: "I live in Germany and wanted to send something real to my boyfriend in Tbilisi. This was perfect.",
    name: "Mariam D.",
    city: "Berlin → Tbilisi",
    emoji: "✈️",
  },
];

const FOR_WHO = [
  {
    label: "For Her",
    description: "Romantic, beautiful, and thoughtful",
    emoji: "🌸",
    href: "/shop?audience=for_her",
    bg: "from-rose-50 to-pink-50",
    border: "border-rose-200",
  },
  {
    label: "For Him",
    description: "Cool, useful, and he'll actually use it",
    emoji: "⚡",
    href: "/shop?audience=for_him",
    bg: "from-amber-50 to-orange-50",
    border: "border-amber-200",
  },
  {
    label: "For Both of You",
    description: "Share the experience together",
    emoji: "🫶",
    href: "/shop?audience=neutral",
    bg: "from-purple-50 to-violet-50",
    border: "border-purple-200",
  },
];

// ─── Sub-components ────────────────────────────────────────────────────────

function SiteNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(251,248,244,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid #EDE6DC" : "1px solid transparent",
      }}
    >
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link href="/" className="font-display text-2xl font-bold text-[#1C1410]">
          gamif<span style={{ color: "#C8445C" }}>.</span>
        </Link>

        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-[#5C4038]">
          <Link href="/shop" className="hover:text-[#C8445C] transition-colors">Shop</Link>
          <Link href="/build-a-box" className="hover:text-[#C8445C] transition-colors">Build a Box</Link>
          <Link href="/quiz" className="hover:text-[#C8445C] transition-colors">Vibe Quiz</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/build-a-box"
            className="btn-rose px-5 py-2 rounded-xl text-sm font-bold inline-flex items-center gap-1.5"
          >
            <Gift className="w-3.5 h-3.5" /> Build a Box
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: ease.expo, delay }}
    >
      {children}
    </motion.div>
  );
}

function BoxCard({ box, index }: { box: typeof FEATURED_BOXES[0]; index: number }) {
  const [liked, setLiked] = useState(false);

  return (
    <FadeUp delay={index * 0.08}>
      <div className="warm-card overflow-hidden group relative">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={box.image}
            alt={box.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {box.badge && (
            <div
              className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-bold text-white"
              style={{ background: "#C8445C" }}
            >
              {box.badge}
            </div>
          )}
          <button
            onClick={() => setLiked(!liked)}
            aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all"
            style={{ background: "rgba(255,255,255,0.9)" }}
          >
            <Heart
              className="w-4 h-4 transition-colors"
              style={{ color: liked ? "#C8445C" : "#9C8278", fill: liked ? "#C8445C" : "none" }}
            />
          </button>
        </div>

        <div className="p-4">
          <div className="flex gap-1.5 mb-2">
            {box.tags.map((t) => (
              <span
                key={t}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "#FBDDE2", color: "#C8445C" }}
              >
                {t}
              </span>
            ))}
          </div>
          <h3 className="font-display text-lg font-bold text-[#1C1410] leading-snug mb-0.5">{box.name}</h3>
          <p className="text-sm text-[#9C8278] mb-3">{box.tagline}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-[#1C1410]">{box.price}</span>
              <span className="text-xs text-[#9C8278] line-through">{box.originalPrice}</span>
            </div>
            <Link
              href={`/shop/${box.id}`}
              className="btn-rose px-4 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-1"
            >
              View Box <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </FadeUp>
  );
}

function TestimonialsSection() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((p) => (p + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const prev = () => setActive((p) => (p - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const next = () => setActive((p) => (p + 1) % TESTIMONIALS.length);

  return (
    <section className="warm-section-alt py-20 px-5">
      <div className="max-w-2xl mx-auto text-center">
        <FadeUp>
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-[#9C8278] mb-2">Real Stories</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[#1C1410] mb-10">
            People who got it right
          </h2>
        </FadeUp>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.38, ease: ease.expo }}
              className="warm-card p-8 mx-auto"
            >
              <div className="text-4xl mb-4">{TESTIMONIALS[active].emoji}</div>
              <p className="text-[#3A241D] text-lg leading-relaxed font-medium mb-6 italic">
                &ldquo;{TESTIMONIALS[active].text}&rdquo;
              </p>
              <div className="flex items-center justify-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#C8445C] text-[#C8445C]" />
                ))}
              </div>
              <p className="text-sm font-bold text-[#1C1410]">{TESTIMONIALS[active].name}</p>
              <p className="text-xs text-[#9C8278]">{TESTIMONIALS[active].city}</p>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={prev}
              aria-label="Previous testimonial"
              className="w-9 h-9 rounded-full border border-[#EDE6DC] flex items-center justify-center text-[#9C8278] hover:border-[#C8445C] hover:text-[#C8445C] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{ background: i === active ? "#C8445C" : "#EDE6DC" }}
                />
              ))}
            </div>
            <button
              onClick={next}
              aria-label="Next testimonial"
              className="w-9 h-9 rounded-full border border-[#EDE6DC] flex items-center justify-center text-[#9C8278] hover:border-[#C8445C] hover:text-[#C8445C] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [activeOccasion, setActiveOccasion] = useState<string | null>(null);

  return (
    <div className="page-warm min-h-screen" style={{ fontFamily: "var(--font-sans)" }}>
      <SiteNav />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pt-24 pb-16 px-5 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Left — copy */}
          <div>
            <motion.p
              className="text-xs uppercase tracking-[0.25em] font-bold mb-4"
              style={{ color: "#C8445C" }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: ease.expo }}
            >
              Partner gifting, made easy
            </motion.p>

            <motion.h1
              className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-5"
              style={{ color: "#1C1410" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.07, ease: ease.expo }}
            >
              A gift they&apos;ll actually{" "}
              <span style={{ color: "#C8445C" }}>love</span>.
            </motion.h1>

            <motion.p
              className="text-base md:text-lg leading-relaxed mb-8"
              style={{ color: "#5C4038" }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.14, ease: ease.expo }}
            >
              Curated mystery boxes for your girlfriend, boyfriend, wife, or husband.
              Pick a vibe, add a note, and we&apos;ll take care of the rest.
            </motion.p>

            {/* Occasion pills */}
            <motion.div
              className="flex flex-wrap gap-2 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.22 }}
            >
              {OCCASIONS.map((o) => (
                <button
                  key={o.label}
                  onClick={() => setActiveOccasion(activeOccasion === o.label ? null : o.label)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium border transition-all"
                  style={{
                    background: activeOccasion === o.label ? "#C8445C" : "#FDFAF7",
                    color: activeOccasion === o.label ? "#fff" : "#5C4038",
                    borderColor: activeOccasion === o.label ? "#C8445C" : "#EDE6DC",
                  }}
                >
                  {o.emoji} {o.label}
                </button>
              ))}
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.5, ease: ease.expo }}
            >
              <Link
                href={activeOccasion ? `/shop?occasion=${encodeURIComponent(activeOccasion)}` : "/shop"}
                className="btn-rose px-7 py-3.5 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {activeOccasion ? `Shop ${activeOccasion} Gifts` : "Shop All Gifts"}
              </Link>
              <Link
                href="/build-a-box"
                className="px-7 py-3.5 rounded-xl text-sm font-bold border border-[#EDE6DC] text-[#5C4038] hover:border-[#C8445C] hover:text-[#C8445C] transition-all inline-flex items-center justify-center gap-2"
              >
                <Gift className="w-4 h-4" />
                Build Your Own Box
              </Link>
            </motion.div>
          </div>

          {/* Right — image collage */}
          <motion.div
            className="relative h-[420px] md:h-[480px]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: ease.expo }}
          >
            {/* Main image */}
            <div
              className="absolute inset-0 rounded-3xl overflow-hidden"
              style={{ border: "1px solid #EDE6DC" }}
            >
              <Image
                src="https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80"
                alt="Gift box"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(28,20,16,0.35) 0%, transparent 60%)" }} />
            </div>

            {/* Floating review badge */}
            <motion.div
              className="absolute bottom-6 left-5 warm-card px-4 py-3 flex items-center gap-3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, ...springs.bouncy }}
              style={{ maxWidth: 220 }}
            >
              <div className="text-2xl">💌</div>
              <div>
                <div className="flex gap-0.5 mb-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-[#C8445C] text-[#C8445C]" />)}
                </div>
                <p className="text-xs font-bold text-[#1C1410]">She cried happy tears</p>
                <p className="text-[10px] text-[#9C8278]">Giorgi T., Tbilisi</p>
              </div>
            </motion.div>

            {/* Floating stats badge */}
            <motion.div
              className="absolute top-5 right-5 warm-card px-4 py-3 text-center"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, ...springs.bouncy }}
            >
              <p className="text-2xl font-black text-[#1C1410]">2,400+</p>
              <p className="text-xs text-[#9C8278]">happy couples</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Shopping for... ──────────────────────────────────────────────── */}
      <section className="warm-section-alt py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-2" style={{ color: "#1C1410" }}>
              Who are you shopping for?
            </h2>
            <p className="text-center text-sm mb-10" style={{ color: "#9C8278" }}>
              Every box is chosen for a specific person, not just a price tag.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {FOR_WHO.map((w, i) => (
              <FadeUp key={w.label} delay={i * 0.09}>
                <Link href={w.href}>
                  <div
                    className={`rounded-2xl border p-6 text-center hover:shadow-md transition-all duration-300 cursor-pointer group bg-gradient-to-br ${w.bg} ${w.border}`}
                  >
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                      {w.emoji}
                    </div>
                    <h3 className="font-display text-xl font-bold mb-1" style={{ color: "#1C1410" }}>
                      {w.label}
                    </h3>
                    <p className="text-sm" style={{ color: "#9C8278" }}>{w.description}</p>
                    <div
                      className="mt-4 text-xs font-bold inline-flex items-center gap-1 group-hover:gap-2 transition-all"
                      style={{ color: "#C8445C" }}
                    >
                      Browse gifts <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured boxes ───────────────────────────────────────────────── */}
      <section className="warm-section py-16 px-5">
        <div className="max-w-6xl mx-auto">
          <FadeUp>
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] font-bold mb-1" style={{ color: "#C8445C" }}>
                  Curated for partners
                </p>
                <h2 className="font-display text-3xl md:text-4xl font-bold" style={{ color: "#1C1410" }}>
                  Ready to gift
                </h2>
              </div>
              <Link
                href="/shop"
                className="text-sm font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all"
                style={{ color: "#C8445C" }}
              >
                See all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURED_BOXES.map((box, i) => (
              <BoxCard key={box.id} box={box} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section className="warm-section-alt py-16 px-5">
        <div className="max-w-4xl mx-auto">
          <FadeUp>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-2" style={{ color: "#1C1410" }}>
              Gifting in 3 minutes
            </h2>
            <p className="text-center text-sm mb-12" style={{ color: "#9C8278" }}>
              No overthinking. We make it easy.
            </p>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Pick a vibe",
                body: "Romantic, cozy, adventurous — tell us the mood and we'll curate the right items.",
                emoji: "🌸",
              },
              {
                step: "2",
                title: "Write a note",
                body: "Add a personal message and we'll include it beautifully inside the box.",
                emoji: "💌",
              },
              {
                step: "3",
                title: "We deliver",
                body: "Your box arrives gift-wrapped and ready to make them smile.",
                emoji: "🎁",
              },
            ].map((s, i) => (
              <FadeUp key={s.step} delay={i * 0.1}>
                <div className="warm-card p-6 text-center">
                  <div className="text-4xl mb-4">{s.emoji}</div>
                  <div
                    className="w-7 h-7 rounded-full text-white text-xs font-black flex items-center justify-center mx-auto mb-3"
                    style={{ background: "#C8445C" }}
                  >
                    {s.step}
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2" style={{ color: "#1C1410" }}>
                    {s.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#9C8278" }}>{s.body}</p>
                </div>
              </FadeUp>
            ))}
          </div>

          <FadeUp delay={0.3}>
            <div className="text-center mt-10">
              <Link
                href="/build-a-box"
                className="btn-rose px-8 py-4 rounded-xl font-bold inline-flex items-center gap-2"
              >
                <Gift className="w-4 h-4" />
                Start Building a Box
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Vibe quiz strip ──────────────────────────────────────────────── */}
      <section className="warm-section py-14 px-5">
        <div className="max-w-3xl mx-auto">
          <FadeUp>
            <div
              className="rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-7 text-center md:text-left"
              style={{ background: "#FBDDE2", border: "1px solid #F3C0C8" }}
            >
              <div className="text-5xl shrink-0">✨</div>
              <div className="flex-1">
                <h3 className="font-display text-2xl font-bold mb-2" style={{ color: "#1C1410" }}>
                  Not sure where to start?
                </h3>
                <p className="text-sm mb-5" style={{ color: "#7A4050" }}>
                  Answer 5 quick questions and we&apos;ll match you with the perfect gift based on your partner&apos;s personality.
                </p>
                <Link
                  href="/quiz"
                  className="btn-rose px-6 py-3 rounded-xl text-sm font-bold inline-flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Take the Vibe Quiz
                </Link>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <TestimonialsSection />

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer
        className="py-12 px-5 border-t"
        style={{ background: "#F5EFE8", borderColor: "#EDE6DC" }}
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="font-display text-2xl font-bold" style={{ color: "#1C1410" }}>
              gamif<span style={{ color: "#C8445C" }}>.</span>
            </Link>
            <p className="text-sm mt-2" style={{ color: "#9C8278" }}>
              The easiest way to gift your partner something they&apos;ll actually love.
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest font-bold mb-3" style={{ color: "#9C8278" }}>Shop</p>
            <div className="flex flex-col gap-2 text-sm" style={{ color: "#5C4038" }}>
              <Link href="/shop?audience=for_her" className="hover:text-[#C8445C] transition-colors">For Her</Link>
              <Link href="/shop?audience=for_him" className="hover:text-[#C8445C] transition-colors">For Him</Link>
              <Link href="/shop?audience=neutral" className="hover:text-[#C8445C] transition-colors">For Both</Link>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest font-bold mb-3" style={{ color: "#9C8278" }}>Build</p>
            <div className="flex flex-col gap-2 text-sm" style={{ color: "#5C4038" }}>
              <Link href="/build-a-box" className="hover:text-[#C8445C] transition-colors">Build a Box</Link>
              <Link href="/quiz" className="hover:text-[#C8445C] transition-colors">Vibe Quiz</Link>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest font-bold mb-3" style={{ color: "#9C8278" }}>Help</p>
            <div className="flex flex-col gap-2 text-sm" style={{ color: "#5C4038" }}>
              <Link href="#" className="hover:text-[#C8445C] transition-colors">How It Works</Link>
              <Link href="#" className="hover:text-[#C8445C] transition-colors">Delivery Info</Link>
              <Link href="#" className="hover:text-[#C8445C] transition-colors">Contact Us</Link>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-2" style={{ borderColor: "#EDE6DC" }}>
          <p className="text-xs" style={{ color: "#9C8278" }}>© 2025 Gamif. Made with love in Georgia 🇬🇪</p>
          <div className="flex items-center gap-1 text-xs" style={{ color: "#9C8278" }}>
            <Heart className="w-3 h-3 fill-[#C8445C] text-[#C8445C]" /> gifting that actually works
          </div>
        </div>
      </footer>
    </div>
  );
}
