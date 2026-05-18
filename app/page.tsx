"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/primitives/Reveal";
import { SplitHeading } from "@/components/primitives/SplitHeading";
import { Parallax } from "@/components/primitives/Parallax";
import { Marquee } from "@/components/primitives/Marquee";

const ease = [0.16, 1, 0.3, 1] as const;

const STAGE = {
  hero:        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=2000&q=85",
  full:        "https://images.unsplash.com/photo-1511376777868-611b54f68947?auto=format&fit=crop&w=2400&q=85",
  her:         "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1400&q=85",
  him:         "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=1400&q=85",
  both:        "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=2000&q=85",
  candle:      "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1400&q=85",
  perfume:     "https://images.unsplash.com/photo-1541643600914-78b084683702?auto=format&fit=crop&w=1400&q=85",
  jewel:       "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1400&q=85",
  ritual:      "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=1800&q=85",
  envelope:    "https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&w=1800&q=85",
  detail:      "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=1400&q=85",
};

const TESTIMONIALS = [
  { quote: "She cried before she even opened it. The note was inside, written in our handwriting. It felt like the whole evening had been authored.", author: "Giorgi T.", role: "Tbilisi", piece: "The Couples Box · 03" },
  { quote: "I had no idea what to send. Twenty minutes later I had a box that felt curated by someone who knew her better than I do.", author: "Luka M.", role: "Batumi", piece: "The Hers Box · 01" },
  { quote: "I live in Berlin. My mother received it on her birthday morning. She told me it made her feel like I was in the room.", author: "Mariam D.", role: "Berlin → Tbilisi", piece: "The Mother's Box" },
];

const PROCESS = [
  { roman: "I",   label: "Atelier",  copy: "We assemble a quiet selection of pieces — each one with its own story, weight and silhouette.", img: STAGE.detail },
  { roman: "II",  label: "Ritual",   copy: "You compose three objects. We hand-wrap them in archival paper, tied with cotton ribbon and a wax seal.", img: STAGE.ritual },
  { roman: "III", label: "Reveal",   copy: "An envelope, a printed note in your own words, a small card with the lucky reward inside.", img: STAGE.envelope },
];

const PIECES = [
  { name: "Signature Candle №07", sub: "Bergamot, smoked oak, sea air", price: 4900, img: STAGE.candle },
  { name: "Crystal Atomiser",      sub: "Sculpted lead-crystal, lavender extrait", price: 5900, img: STAGE.perfume },
  { name: "Solid Gold Letter",     sub: "Engraved monogram, vermeil chain", price: 6800, img: STAGE.jewel },
];

const NUMBERS = [
  { value: "12K+", label: "Boxes sent" },
  { value: "97%",  label: "Repeat gifters" },
  { value: "48h",  label: "Average dispatch" },
  { value: "5★",   label: "Average rating" },
];

export default function HomePage() {
  return (
    <main className="surface-bone relative">
      <Navbar />
      <Hero />
      <MarqueeStrip />
      <Manifesto />
      <ProcessSection />
      <FullBleed />
      <Audiences />
      <Pieces />
      <NumbersStrip />
      <Testimonials />
      <ClosingInvite />
      <Footer />
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero
// ─────────────────────────────────────────────────────────────────────────────

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY  = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const titleY  = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative h-[110vh] min-h-[760px] overflow-clip">
      <motion.div style={{ y: imageY }} className="absolute inset-x-0 -top-[10%] -bottom-[10%]">
        <Image
          src={STAGE.hero}
          alt="An assembled mystery box opened on linen"
          fill
          priority
          quality={92}
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--ink)]/35 via-transparent to-[var(--ink)]/55" />
        <div className="grain-overlay absolute inset-0 opacity-20" />
      </motion.div>

      <motion.div
        style={{ y: titleY, opacity }}
        className="relative z-10 flex h-full flex-col justify-between container-edge pt-32 pb-12 text-[var(--bone)]"
      >
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.32em] opacity-80">
          <span className="eyebrow--dot">Vol. 04 · Spring</span>
          <span className="hidden md:inline">Tbilisi 41.71° N · 44.78° E</span>
          <span className="tabular">{new Date().getFullYear()}</span>
        </div>

        <div className="flex-1 flex flex-col justify-end">
          <p className="eyebrow text-[var(--bone)] opacity-80">A cinematic gifting house</p>

          <div className="mt-6 overflow-hidden">
            <motion.h1
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1.4, ease, delay: 0.4 }}
              className="text-display-xl font-display font-light leading-[0.86]"
            >
              The gift
            </motion.h1>
          </div>
          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1.4, ease, delay: 0.55 }}
              className="text-display-xl font-display font-light leading-[0.86]"
            >
              that <em className="italic-serif font-light text-[var(--accent-2)]">remembers itself.</em>
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease, delay: 1.1 }}
            className="mt-12 grid grid-cols-1 items-end gap-10 md:grid-cols-[1.2fr_auto_1fr]"
          >
            <p className="max-w-md text-body-lg text-[var(--bone)]/80">
              Three objects, hand-curated. A printed note. A lucky spin. Wrapped in archival paper and sent anywhere.
            </p>

            <span aria-hidden className="hidden md:block h-px w-24 bg-[var(--bone)]/40" />

            <div className="flex flex-wrap items-center gap-8">
              <Link href="/build-a-box" className="btn-cinematic btn-cinematic--outline border-[var(--bone)]/65 text-[var(--bone)]">
                <span className="btn-cinematic__label">Begin a box</span>
              </Link>
              <Link href="/shop" className="link-reveal text-[12px] tracking-[0.22em] uppercase text-[var(--bone)]/80 flex items-center gap-3">
                The Collection <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, ease, delay: 1.6 }}
        className="absolute bottom-6 right-6 z-10 hidden text-[11px] uppercase tracking-[0.32em] text-[var(--bone)]/70 md:flex md:items-center md:gap-3"
      >
        <span className="block h-px w-12 bg-[var(--bone)]/50" />
        scroll · the unboxing
      </motion.div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Marquee strip
// ─────────────────────────────────────────────────────────────────────────────

function MarqueeStrip() {
  return (
    <div className="surface-ink border-t border-b border-[var(--hair)] py-6 text-[var(--bone)]">
      <Marquee speed={50}>
        <span className="font-display text-3xl tracking-tight px-6">curated mystery boxes</span>
        <span className="divider-dot" />
        <span className="font-display text-3xl italic tracking-tight px-6">hand-wrapped in paper & wax</span>
        <span className="divider-dot" />
        <span className="font-display text-3xl tracking-tight px-6">printed note inside</span>
        <span className="divider-dot" />
        <span className="font-display text-3xl italic tracking-tight px-6">a lucky reward, every box</span>
        <span className="divider-dot" />
      </Marquee>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Manifesto — large editorial type with a side detail
// ─────────────────────────────────────────────────────────────────────────────

function Manifesto() {
  return (
    <section className="section container-edge container-wide">
      <div className="grid grid-cols-1 gap-16 md:grid-cols-12">
        <div className="md:col-span-7 md:col-start-2">
          <Reveal>
            <p className="eyebrow text-[var(--storm-55)]">A note from the atelier</p>
          </Reveal>

          <SplitHeading
            as="h2"
            trigger="scroll"
            className="font-display mt-8 text-display-lg text-[var(--ink)]"
          >
            We don&apos;t sell gifts. We compose moments — three objects at a time, wrapped to be opened slowly.
          </SplitHeading>

          <Reveal delay={0.2} className="mt-10 max-w-xl text-body-lg text-[var(--storm-55)]">
            Every Gamif box is a quiet performance: a centrepiece, a softer note, a closing whisper. A printed letter, a wax seal, a lucky spin written by an algorithm but felt as fate.
          </Reveal>
        </div>

        <Reveal delay={0.35} className="md:col-span-4">
          <div className="relative aspect-[3/4] overflow-clip">
            <Parallax strength={0.25}>
              <Image src={STAGE.detail} alt="" fill className="object-cover" sizes="(min-width:768px) 33vw, 100vw" />
            </Parallax>
            <div className="grain-overlay pointer-events-none absolute inset-0 opacity-20" />
            <div className="absolute bottom-6 left-6 text-[var(--bone)]">
              <p className="eyebrow">Atelier №07</p>
              <p className="font-display text-2xl mt-1">In progress</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Process — three large editorial cards
// ─────────────────────────────────────────────────────────────────────────────

function ProcessSection() {
  return (
    <section className="surface-paper section">
      <div className="container-edge container-wide">
        <div className="flex flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <Reveal>
              <p className="eyebrow text-[var(--storm-55)]">Three acts</p>
            </Reveal>
            <SplitHeading
              as="h2"
              trigger="scroll"
              className="font-display mt-6 text-display-lg text-[var(--ink)]"
            >
              The unboxing<br /><em>begins long before</em> the box arrives.
            </SplitHeading>
          </div>
          <Reveal delay={0.2}>
            <p className="max-w-sm text-body text-[var(--storm-55)]">
              Choose the centrepiece, then the softer counterpoint, then the closing whisper. Each piece sits in its own slot, like notes on a score.
            </p>
          </Reveal>
        </div>

        <div className="mt-24 grid grid-cols-1 gap-x-12 gap-y-24 md:grid-cols-3">
          {PROCESS.map((step, i) => (
            <Reveal key={step.roman} delay={i * 0.12}>
              <article className="group flex flex-col">
                <div className="relative aspect-[4/5] overflow-clip">
                  <Parallax strength={0.18}>
                    <Image src={step.img} alt={step.label} fill className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]" sizes="(min-width:1024px) 33vw, 100vw" />
                  </Parallax>
                  <div className="absolute left-4 top-4 font-display text-[3rem] leading-none text-[var(--bone)] mix-blend-difference">
                    {step.roman}
                  </div>
                </div>
                <div className="mt-6 flex items-baseline justify-between border-b border-[var(--hair-warm)] pb-3">
                  <p className="eyebrow text-[var(--storm-55)]">Act {step.roman}</p>
                  <p className="font-display text-xl text-[var(--ink)]">{step.label}</p>
                </div>
                <p className="mt-4 max-w-sm text-body-sm text-[var(--storm-55)]">{step.copy}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Full bleed cinematic image
// ─────────────────────────────────────────────────────────────────────────────

function FullBleed() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <section ref={ref} className="relative h-[85vh] min-h-[560px] overflow-clip">
      <motion.div style={{ y }} className="absolute inset-x-0 -top-[12%] -bottom-[12%]">
        <Image src={STAGE.full} alt="Hand-wrapped box on linen" fill className="object-cover" sizes="100vw" />
      </motion.div>
      <div className="grain-overlay absolute inset-0 opacity-25" />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/65 via-[var(--ink)]/10 to-transparent" />
      <div className="absolute inset-0 container-edge flex flex-col justify-end pb-12 text-[var(--bone)]">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:items-end">
          <div className="md:col-span-2">
            <Reveal>
              <p className="eyebrow opacity-70">An archive of small ceremonies</p>
            </Reveal>
            <SplitHeading
              as="h3"
              trigger="scroll"
              className="font-display mt-6 text-display-lg leading-[0.95]"
            >
              Each box is its own short film — paused on linen, opened in private.
            </SplitHeading>
          </div>
          <Reveal delay={0.25}>
            <Link
              href="/build-a-box"
              className="link-reveal inline-flex items-center gap-3 text-[12px] uppercase tracking-[0.32em] text-[var(--bone)]/80"
            >
              Start writing yours
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Audiences
// ─────────────────────────────────────────────────────────────────────────────

function Audiences() {
  const items = [
    { href: "/shop?audience=for_her", eyebrow: "Chapter 01", label: "For her.",   sub: "Roses, perfume, the warmth of brass.",      img: STAGE.her,  swap: STAGE.perfume },
    { href: "/shop?audience=for_him", eyebrow: "Chapter 02", label: "For him.",   sub: "Leather, cologne, a quiet object he uses.", img: STAGE.him,  swap: STAGE.detail },
    { href: "/shop?audience=couple",  eyebrow: "Chapter 03", label: "For both.",  sub: "Linen, evening light, a story you share.",  img: STAGE.both, swap: STAGE.candle },
  ];

  return (
    <section className="section container-edge container-wide">
      <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
        <Reveal>
          <p className="eyebrow text-[var(--storm-55)]">Three chapters</p>
          <SplitHeading
            as="h2"
            trigger="scroll"
            className="font-display mt-6 text-display-md text-[var(--ink)]"
          >
            Who is the<br /><em>story</em> for?
          </SplitHeading>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="max-w-sm text-body text-[var(--storm-55)]">
            Three carefully sketched archetypes. Choose one to step into — or compose your own from the full shop.
          </p>
        </Reveal>
      </div>

      <div className="mt-20 grid grid-cols-1 gap-16 md:grid-cols-3">
        {items.map((item, i) => (
          <Reveal key={item.href} delay={i * 0.1}>
            <Link href={item.href} className="group block">
              <div className="relative aspect-[4/5] overflow-clip">
                <Image
                  src={item.img}
                  alt={item.label}
                  fill
                  className="object-cover transition-all duration-[1200ms] ease-out group-hover:opacity-0 group-hover:scale-105"
                  sizes="(min-width:768px) 33vw, 100vw"
                />
                <Image
                  src={item.swap}
                  alt=""
                  fill
                  className="object-cover opacity-0 transition-all duration-[1200ms] ease-out group-hover:opacity-100 group-hover:scale-105"
                  sizes="(min-width:768px) 33vw, 100vw"
                />
                <div className="absolute left-5 top-5 text-[var(--bone)]">
                  <p className="eyebrow">{item.eyebrow}</p>
                </div>
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-[var(--bone)]">
                  <h3 className="font-display text-3xl">{item.label}</h3>
                  <ArrowRight className="h-4 w-4 -translate-x-2 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100" />
                </div>
              </div>
              <p className="mt-5 text-body-sm text-[var(--storm-55)]">{item.sub}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pieces — slim editorial product preview
// ─────────────────────────────────────────────────────────────────────────────

function Pieces() {
  return (
    <section className="surface-ink section text-[var(--bone)]">
      <div aria-hidden className="grain-overlay pointer-events-none absolute inset-0 opacity-20" />
      <div className="container-edge container-wide relative">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <Reveal>
            <p className="eyebrow text-[var(--bone)]/55">Inside the box</p>
            <SplitHeading
              as="h2"
              trigger="scroll"
              className="font-display mt-6 text-display-md text-[var(--bone)]"
            >
              Each piece chosen<br /><em className="italic-serif text-[var(--accent-2)]">with intention.</em>
            </SplitHeading>
          </Reveal>
          <Reveal delay={0.15}>
            <Link
              href="/shop"
              className="link-reveal inline-flex items-center gap-3 text-[12px] uppercase tracking-[0.32em] text-[var(--bone)]/80"
            >
              View the collection
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-x-10 gap-y-20 md:grid-cols-12">
          {PIECES.map((piece, i) => (
            <Reveal
              key={piece.name}
              delay={i * 0.1}
              className={
                i === 0 ? "md:col-span-5 md:col-start-1" :
                i === 1 ? "md:col-span-4 md:col-start-7 md:mt-32" :
                          "md:col-span-4 md:col-start-2 md:mt-16"
              }
            >
              <Link href="/shop" className="group block">
                <div className="relative aspect-portrait overflow-clip bg-[var(--ink-2)]">
                  <Image src={piece.img} alt={piece.name} fill className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105" sizes="(min-width:1024px) 30vw, 100vw" />
                </div>
                <div className="mt-5 flex items-baseline justify-between border-b border-[var(--hair)] pb-3">
                  <p className="font-display text-2xl text-[var(--bone)]">{piece.name}</p>
                  <p className="tabular text-[var(--bone)]/70">{(piece.price/100).toFixed(0)} ₾</p>
                </div>
                <p className="mt-3 text-body-sm text-[var(--bone)]/55">{piece.sub}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Numbers strip
// ─────────────────────────────────────────────────────────────────────────────

function NumbersStrip() {
  return (
    <section className="section-tight surface-paper">
      <div className="container-edge container-wide">
        <div className="grid grid-cols-2 gap-px overflow-clip border border-[var(--hair-warm)] md:grid-cols-4">
          {NUMBERS.map((n, i) => (
            <Reveal key={n.label} delay={i * 0.08} className="relative bg-[var(--paper)] p-10">
              <p className="font-display text-display-md tabular text-[var(--ink)]">{n.value}</p>
              <p className="eyebrow mt-3 text-[var(--storm-55)]">{n.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Testimonials — magazine spread
// ─────────────────────────────────────────────────────────────────────────────

function Testimonials() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % TESTIMONIALS.length), 7000);
    return () => clearInterval(t);
  }, []);
  const item = TESTIMONIALS[idx];

  return (
    <section className="section container-edge container-wide">
      <Reveal>
        <p className="eyebrow text-[var(--storm-55)]">From the recipients</p>
      </Reveal>
      <div className="mt-10 grid grid-cols-1 gap-16 md:grid-cols-12 md:items-start">
        <motion.figure
          key={idx}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.95, ease }}
          className="md:col-span-8"
        >
          <blockquote className="font-display text-quote leading-[1.1] text-[var(--ink)]">
            <span className="text-[var(--accent)]">&ldquo;</span>{item.quote}<span className="text-[var(--accent)]">&rdquo;</span>
          </blockquote>
          <figcaption className="mt-10 flex items-center gap-6">
            <span className="block h-px w-10 bg-[var(--ink)]" />
            <div className="flex flex-col">
              <span className="eyebrow text-[var(--ink)]">{item.author}</span>
              <span className="text-[var(--storm-55)] text-sm">{item.role} · {item.piece}</span>
            </div>
          </figcaption>
        </motion.figure>

        <div className="md:col-span-4 md:mt-2 flex flex-col gap-4">
          {TESTIMONIALS.map((t, i) => (
            <button
              key={t.author}
              onClick={() => setIdx(i)}
              className="group flex items-baseline justify-between gap-4 border-b border-[var(--hair-warm)] py-4 text-left"
            >
              <span className={`font-display text-2xl transition-colors ${i === idx ? "text-[var(--ink)]" : "text-[var(--storm-35)]"}`}>
                {String(i+1).padStart(2,"0")} — {t.author.split(" ")[0]}
              </span>
              <span className="eyebrow text-[var(--storm-55)]">{t.role}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Closing invite — large CTA
// ─────────────────────────────────────────────────────────────────────────────

function ClosingInvite() {
  return (
    <section className="surface-ink relative overflow-clip text-[var(--bone)] section">
      <div aria-hidden className="grain-overlay pointer-events-none absolute inset-0 opacity-25" />
      <div className="container-edge container-wide relative grid grid-cols-1 gap-12 md:grid-cols-12 md:items-end">
        <div className="md:col-span-7">
          <Reveal>
            <p className="eyebrow text-[var(--bone)]/55">Begin</p>
          </Reveal>
          <SplitHeading
            as="h2"
            trigger="scroll"
            className="font-display mt-8 text-display-xl leading-[0.88] text-[var(--bone)]"
          >
            Compose<br />a <em className="italic-serif text-[var(--accent-2)]">small</em> ceremony.
          </SplitHeading>
        </div>
        <Reveal delay={0.2} className="md:col-span-5">
          <p className="max-w-md text-body-lg text-[var(--bone)]/75">
            Three pieces. A printed note. A lucky spin and a wax seal.<br />Everything wrapped, handed off to the courier within 48 hours.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Link href="/build-a-box" className="btn-cinematic btn-cinematic--outline border-[var(--bone)]/65 text-[var(--bone)]">
              <span className="btn-cinematic__label">Build a box</span>
            </Link>
            <Link href="/quiz" className="link-reveal text-[12px] tracking-[0.22em] uppercase text-[var(--bone)]/70">
              Or take the quiz
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
