"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart";
import { useUIStore } from "@/lib/stores/ui";
import { springs, ease } from "@/lib/motion";

// ─── Art imagery ──────────────────────────────────────────────────────────────

const ART = {
  hero:      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1200&q=90",
  fullBleed: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=2000&q=90",
  her:       "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=85",
  him:       "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=85",
  both:      "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=1200&q=85",
  p1:        "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=85",
  p2:        "https://images.unsplash.com/photo-1541643600914-78b084683702?auto=format&fit=crop&w=900&q=85",
  p3:        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85",
};

const TESTIMONIALS = [
  { quote: "My girlfriend cried happy tears. The note I wrote was printed beautifully inside the box.", author: "Giorgi T.", city: "Tbilisi" },
  { quote: "I had no idea what to gift. Gamif helped me build the perfect box in minutes.", author: "Luka M.", city: "Batumi" },
  { quote: "I live abroad. This made it feel like I was there, handing it to him myself.", author: "Mariam D.", city: "Berlin" },
];

// ─── Fade in on scroll ─────────────────────────────────────────────────────────

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.85, ease: ease.expo, delay }}>
      {children}
    </motion.div>
  );
}

// ─── Navigation ───────────────────────────────────────────────────────────────

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const items = useCartStore((s) => s.items);
  const count = items.reduce((n, i) => n + i.quantity, 0);
  const open  = useUIStore((s) => s.openMiniCart);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 px-8 sm:px-12 flex items-center justify-between"
      animate={{ height: scrolled ? 56 : 72, backgroundColor: scrolled ? "rgba(245,230,163,0.95)" : "rgba(245,230,163,0)" }}
      style={{ backdropFilter: scrolled ? "blur(16px)" : "none", borderBottom: scrolled ? "1px solid rgba(58,74,92,0.12)" : "none" }}
      transition={{ duration: 0.4 }}>

      <Link href="/" className="font-display text-xl font-bold text-storm leading-none">
        gamif<span className="text-storm opacity-40">.</span>
      </Link>

      <nav className="hidden md:flex items-center gap-10">
        {[{ href: "/shop", label: "Shop" }, { href: "/build-a-box", label: "Build a Box" }, { href: "/quiz", label: "Quiz" }].map(l => (
          <Link key={l.href} href={l.href}
            className="eyebrow hover:opacity-100 transition-opacity"
            style={{ color: "var(--storm-55)" }}>
            {l.label}
          </Link>
        ))}
      </nav>

      <button onClick={open} aria-label="Cart"
        className="relative flex items-center justify-center w-9 h-9"
        style={{ color: "var(--storm-55)" }}>
        <ShoppingCart className="w-4 h-4" />
        <AnimatePresence>
          {count > 0 && (
            <motion.span key={count} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              transition={springs.bouncy}
              className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[8px] font-bold rounded-full flex items-center justify-center"
              style={{ background: "var(--storm)", color: "var(--butter)" }}>
              {count}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </motion.header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <section ref={ref} className="relative min-h-screen grid lg:grid-cols-2 overflow-hidden" style={{ background: "var(--butter)" }}>
      {/* Left — text */}
      <div className="relative z-10 flex flex-col justify-end px-8 sm:px-12 pb-16 sm:pb-20 pt-28 lg:pt-0 lg:justify-center">
        <motion.p className="eyebrow mb-8"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.8 }}>
          Gamif · Premium gifting · Georgia
        </motion.p>

        <div className="overflow-hidden mb-3">
          <motion.h1
            className="font-display font-light text-storm leading-[0.88]"
            style={{ fontSize: "clamp(3.5rem, 8vw, 8rem)" }}
            initial={{ y: "110%" }} animate={{ y: 0 }}
            transition={{ delay: 0.3, duration: 1, ease: ease.expo }}>
            The art of
          </motion.h1>
        </div>
        <div className="overflow-hidden mb-10">
          <motion.h1
            className="font-display font-semibold italic text-storm leading-[0.88]"
            style={{ fontSize: "clamp(3.5rem, 8vw, 8rem)" }}
            initial={{ y: "110%" }} animate={{ y: 0 }}
            transition={{ delay: 0.45, duration: 1, ease: ease.expo }}>
            the perfect gift.
          </motion.h1>
        </div>

        <motion.p
          className="max-w-xs leading-relaxed mb-10"
          style={{ color: "var(--storm-55)", fontSize: "0.95rem" }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}>
          Mystery boxes built by you. Exclusive prices, a personal message, a lucky spin reward.
        </motion.p>

        <motion.div className="flex items-center gap-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.7 }}>
          <Link href="/build-a-box">
            <motion.div whileHover={{ opacity: 0.85 }} whileTap={{ scale: 0.97 }}
              className="btn-primary px-8 py-4 rounded-none text-xs tracking-widest">
              Build a Box
            </motion.div>
          </Link>
          <Link href="/shop"
            className="eyebrow hover:opacity-100 transition-opacity flex items-center gap-2"
            style={{ color: "var(--storm-55)" }}>
            Browse shop <span className="text-base font-light">→</span>
          </Link>
        </motion.div>
      </div>

      {/* Right — artwork */}
      <motion.div
        className="relative hidden lg:block overflow-hidden"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 1.2 }}>
        <motion.div className="absolute inset-0" style={{ y: imgY }}>
          <Image src={ART.hero} alt="Artwork" fill className="object-cover" priority sizes="50vw" />
        </motion.div>
      </motion.div>

      {/* Mobile: small art strip below text */}
      <div className="lg:hidden relative h-64 overflow-hidden mt-8">
        <Image src={ART.hero} alt="" fill className="object-cover object-top" sizes="100vw" />
      </div>
    </section>
  );
}

// ─── Rule divider ─────────────────────────────────────────────────────────────

function Rule() {
  return (
    <Reveal>
      <div className="mx-8 sm:mx-12 rule" />
    </Reveal>
  );
}

// ─── Full-bleed art moment ────────────────────────────────────────────────────

function ArtMoment({ src, caption }: { src: string; caption?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-40, 40]);

  return (
    <div ref={ref} className="relative overflow-hidden" style={{ height: "70vh" }}>
      <motion.div className="absolute inset-[-10%]" style={{ y }}>
        <Image src={src} alt="" fill className="object-cover" sizes="100vw" />
      </motion.div>
      {caption && (
        <div className="absolute bottom-6 right-8">
          <p className="eyebrow" style={{ color: "rgba(245,230,163,0.5)" }}>{caption}</p>
        </div>
      )}
    </div>
  );
}

// ─── The Offering ─────────────────────────────────────────────────────────────

function TheOffering() {
  const steps = [
    { n: "I",   text: "Choose three objects at exclusive box prices — 15–25% off retail." },
    { n: "II",  text: "Spin the lucky wheel for a reward: free gifts, discounts, surprises." },
    { n: "III", text: "Write a message. We print it inside the box. They open it and feel it." },
  ];

  return (
    <section className="px-8 sm:px-12 py-28 sm:py-36" style={{ background: "var(--butter)" }}>
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-20 lg:gap-32">
        <div>
          <Reveal>
            <p className="eyebrow mb-8">The experience</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="font-display font-light text-storm leading-tight"
              style={{ fontSize: "clamp(2.2rem, 5vw, 4.5rem)" }}>
              Three objects.<br />
              <em>One feeling.</em>
            </h2>
          </Reveal>
        </div>

        <div className="space-y-0 self-end">
          {steps.map((step, i) => (
            <Reveal key={step.n} delay={i * 0.1}>
              <div className="border-b py-7 flex items-start gap-8 group"
                style={{ borderColor: "var(--storm-18)" }}>
                <span className="font-display text-sm font-light shrink-0 mt-0.5"
                  style={{ color: "var(--storm-35)" }}>{step.n}</span>
                <p className="text-storm leading-relaxed" style={{ fontSize: "0.95rem" }}>{step.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── For Who ──────────────────────────────────────────────────────────────────

function ForWho() {
  return (
    <section style={{ background: "var(--butter)" }}>
      <div className="px-8 sm:px-12 pb-6">
        <Reveal>
          <p className="eyebrow mb-16">Who is the gift for?</p>
        </Reveal>
      </div>

      {/* For Her */}
      <Reveal>
        <Link href="/shop?audience=for_her">
          <motion.div
            className="grid lg:grid-cols-2 cursor-pointer group"
            whileHover="hover">
            <div className="px-8 sm:px-12 py-16 lg:py-24 flex flex-col justify-center">
              <p className="eyebrow mb-4" style={{ color: "var(--storm-35)" }}>For Her</p>
              <h3 className="font-display font-light text-storm mb-4 leading-tight"
                style={{ fontSize: "clamp(2rem, 5vw, 5rem)" }}>
                Romantic.<br />
                <em className="font-medium">Deeply thoughtful.</em>
              </h3>
              <p style={{ color: "var(--storm-55)", fontSize: "0.875rem" }}>
                Roses, perfume, luxe skincare — she deserves this.
              </p>
            </div>
            <div className="relative overflow-hidden" style={{ minHeight: "360px" }}>
              <motion.div className="absolute inset-0" variants={{ hover: { scale: 1.04 } }} transition={{ duration: 0.7, ease: ease.expo }}>
                <Image src={ART.her} alt="For Her" fill className="object-cover" sizes="50vw" />
              </motion.div>
            </div>
          </motion.div>
        </Link>
      </Reveal>

      <div className="rule mx-8 sm:mx-12" />

      {/* For Him */}
      <Reveal>
        <Link href="/shop?audience=for_him">
          <motion.div className="grid lg:grid-cols-2 cursor-pointer group" whileHover="hover">
            <div className="relative overflow-hidden order-2 lg:order-1" style={{ minHeight: "360px" }}>
              <motion.div className="absolute inset-0" variants={{ hover: { scale: 1.04 } }} transition={{ duration: 0.7, ease: ease.expo }}>
                <Image src={ART.him} alt="For Him" fill className="object-cover" sizes="50vw" />
              </motion.div>
            </div>
            <div className="px-8 sm:px-12 py-16 lg:py-24 flex flex-col justify-center order-1 lg:order-2">
              <p className="eyebrow mb-4" style={{ color: "var(--storm-35)" }}>For Him</p>
              <h3 className="font-display font-light text-storm mb-4 leading-tight"
                style={{ fontSize: "clamp(2rem, 5vw, 5rem)" }}>
                Bold.<br />
                <em className="font-medium">Intentional.</em>
              </h3>
              <p style={{ color: "var(--storm-55)", fontSize: "0.875rem" }}>
                Cool, useful, premium — something he&apos;ll actually love.
              </p>
            </div>
          </motion.div>
        </Link>
      </Reveal>

      <div className="rule mx-8 sm:mx-12" />

      {/* For Both */}
      <Reveal>
        <Link href="/shop?audience=neutral">
          <motion.div className="relative cursor-pointer group overflow-hidden" style={{ height: "50vh" }} whileHover="hover">
            <motion.div className="absolute inset-0" variants={{ hover: { scale: 1.03 } }} transition={{ duration: 0.7, ease: ease.expo }}>
              <Image src={ART.both} alt="For Both" fill className="object-cover" sizes="100vw" />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 px-8 sm:px-12 py-10">
              <p className="eyebrow mb-3" style={{ color: "rgba(245,230,163,0.55)" }}>For Both of You</p>
              <h3 className="font-display font-light leading-tight"
                style={{ fontSize: "clamp(1.8rem, 4vw, 4rem)", color: "var(--butter)" }}>
                A shared experience <em className="font-medium">you&apos;ll always remember.</em>
              </h3>
            </div>
          </motion.div>
        </Link>
      </Reveal>
    </section>
  );
}

// ─── Product editorial ────────────────────────────────────────────────────────

function ProductEditorial() {
  const products = [
    { title: "Signature Soy Candle",  sub: "Warm amber. An evening-in feeling.",           price: "22 ₾", box: true, img: ART.p1 },
    { title: "Crystal Perfume Bottle",sub: "Luxury fragrance in a hand-sculpted vessel.",  price: "52 ₾", box: true, img: ART.p2 },
    { title: "Gold Initial Necklace", sub: "A personal keepsake chosen just for them.",    price: "48 ₾", box: true, img: ART.p3 },
  ];

  return (
    <section className="py-28 sm:py-36" style={{ background: "var(--butter-2)" }}>
      <div className="px-8 sm:px-12 mb-16">
        <Reveal><p className="eyebrow mb-5">Inside the box</p></Reveal>
        <Reveal delay={0.08}>
          <h2 className="font-display font-light text-storm leading-tight"
            style={{ fontSize: "clamp(1.8rem, 4vw, 4rem)" }}>
            Each item chosen with intention.
          </h2>
        </Reveal>
      </div>

      <div className="grid md:grid-cols-3 gap-px" style={{ borderTop: "1px solid var(--storm-18)", borderBottom: "1px solid var(--storm-18)" }}>
        {products.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.1}>
            <Link href="/shop">
              <motion.div className="group cursor-pointer" whileHover="hover">
                <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
                  <motion.div className="absolute inset-0"
                    variants={{ hover: { scale: 1.04 } }} transition={{ duration: 0.7, ease: ease.expo }}>
                    <Image src={p.img} alt={p.title} fill className="object-cover" sizes="33vw" />
                  </motion.div>
                </div>
                <div className="px-6 py-6" style={{ borderLeft: i > 0 ? "1px solid var(--storm-18)" : "none" }}>
                  <h3 className="font-display text-lg font-medium text-storm mb-1">{p.title}</h3>
                  <p className="mb-3" style={{ color: "var(--storm-55)", fontSize: "0.8rem" }}>{p.sub}</p>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-storm text-base">{p.price}</span>
                    {p.box && <span className="box-badge">Box price</span>}
                  </div>
                </div>
              </motion.div>
            </Link>
          </Reveal>
        ))}
      </div>

      <div className="px-8 sm:px-12 mt-12 text-center">
        <Reveal>
          <Link href="/shop">
            <motion.div whileHover={{ opacity: 0.75 }} className="btn-outline inline-block px-10 py-4 text-xs tracking-widest">
              View All Products
            </motion.div>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Testimonial ──────────────────────────────────────────────────────────────

function Testimonial() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % TESTIMONIALS.length), 6000);
    return () => clearInterval(t);
  }, []);
  const t = TESTIMONIALS[idx];

  return (
    <section className="px-8 sm:px-12 py-28 sm:py-36" style={{ background: "var(--butter)" }}>
      <div className="max-w-4xl mx-auto">
        <Reveal><p className="eyebrow mb-12">People say</p></Reveal>

        <AnimatePresence mode="wait">
          <motion.div key={idx}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.6, ease: ease.expo }}>
            <blockquote className="font-display font-light text-storm mb-8 leading-snug"
              style={{ fontSize: "clamp(1.6rem, 4vw, 3.5rem)" }}>
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="w-7 h-px" style={{ background: "var(--storm-35)" }} />
              <p className="eyebrow">{t.author} · {t.city}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-2 mt-10">
          {TESTIMONIALS.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className="h-px w-8 transition-all duration-300"
              style={{ background: i === idx ? "var(--storm)" : "var(--storm-18)" }} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Inverted CTA ─────────────────────────────────────────────────────────────

function InvertedCTA() {
  return (
    <section className="px-8 sm:px-12 py-28 sm:py-36 canvas-storm">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 items-end gap-16">
        <Reveal>
          <h2 className="font-display font-light leading-tight"
            style={{ fontSize: "clamp(2.5rem, 7vw, 7rem)", color: "var(--butter)" }}>
            Build your<br />
            <em className="font-semibold">first box.</em>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="space-y-6">
            <p style={{ color: "rgba(245,230,163,0.55)", fontSize: "0.9rem", lineHeight: 1.7 }}>
              Three items. A message. A lucky spin.<br />
              Everything gift-wrapped and delivered in Georgia.
            </p>
            <Link href="/build-a-box">
              <motion.div whileHover={{ opacity: 0.82 }} whileTap={{ scale: 0.97 }}
                className="inline-block px-10 py-5 text-xs font-bold uppercase tracking-widest"
                style={{ border: "1px solid rgba(245,230,163,0.35)", color: "var(--butter)" }}>
                Start Building
              </motion.div>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="px-8 sm:px-12 py-10 flex flex-col sm:flex-row items-center justify-between gap-4"
      style={{ borderTop: "1px solid var(--storm-12)", background: "var(--butter)" }}>
      <Link href="/" className="font-display text-base font-bold text-storm">gamif<span style={{ opacity: 0.35 }}>.</span></Link>
      <div className="flex gap-8">
        {["/shop", "/build-a-box", "/quiz", "/cart"].map(h => (
          <Link key={h} href={h} className="eyebrow hover:opacity-100 transition-opacity"
            style={{ color: "var(--storm-35)" }}>
            {h.replace("/", "") || "home"}
          </Link>
        ))}
      </div>
      <p className="eyebrow" style={{ color: "var(--storm-35)" }}>© {new Date().getFullYear()} · Georgia 🇬🇪</p>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div style={{ background: "var(--butter)" }}>
      <Nav />
      <Hero />
      <ArtMoment src={ART.fullBleed} caption="Curated with intention" />
      <TheOffering />
      <ForWho />
      <ArtMoment src={ART.p2} caption="Each piece chosen by you" />
      <ProductEditorial />
      <Testimonial />
      <InvertedCTA />
      <Footer />
    </div>
  );
}
