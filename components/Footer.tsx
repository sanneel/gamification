"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SplitHeading } from "@/components/primitives/SplitHeading";
import { Marquee } from "@/components/primitives/Marquee";

const ease = [0.16, 1, 0.3, 1] as const;

const SHOP_LINKS  = [
  { href: "/shop?audience=for_her", label: "For Her" },
  { href: "/shop?audience=for_him", label: "For Him" },
  { href: "/shop?audience=couple",  label: "For Both" },
  { href: "/shop?vibe=luxury",      label: "Luxury" },
  { href: "/shop?vibe=cozy",        label: "Cozy" },
];

const ATELIER_LINKS = [
  { href: "/build-a-box", label: "Build a Box" },
  { href: "/quiz",        label: "Gift Quiz" },
  { href: "/admin",       label: "Atelier dashboard" },
];

export function Footer() {
  return (
    <footer className="surface-ink relative overflow-clip text-[var(--bone)]">
      <div aria-hidden className="grain-overlay pointer-events-none absolute inset-0 opacity-20" />

      <div className="border-t border-b border-[var(--hair)] py-8">
        <Marquee speed={45}>
          <span className="font-display text-display-sm tracking-tight px-6">— curated mystery gifting</span>
          <span className="divider-dot" />
          <span className="font-display text-display-sm italic tracking-tight px-6">made in tbilisi, georgia</span>
          <span className="divider-dot" />
          <span className="font-display text-display-sm tracking-tight px-6">since 2025</span>
          <span className="divider-dot" />
          <span className="font-display text-display-sm italic tracking-tight px-6">unboxing as ritual</span>
        </Marquee>
      </div>

      <div className="container-edge py-24">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="eyebrow text-[var(--bone)]/55">A note from the atelier</p>
            <SplitHeading
              as="h2"
              trigger="scroll"
              className="font-display mt-6 text-display-md text-[var(--bone)]"
            >
              The gift that makes them gasp before they even open it.
            </SplitHeading>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{ duration: 0.95, ease, delay: 0.2 }}
              className="mt-10 flex flex-wrap items-center gap-6"
            >
              <Link href="/build-a-box" className="btn-cinematic btn-cinematic--primary">
                <span className="btn-cinematic__label">Begin your box</span>
              </Link>
              <Link href="/quiz" className="link-reveal text-[11px] uppercase tracking-[0.32em] text-[var(--bone)]/70">
                Take the gift quiz
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 gap-10 md:col-span-5">
            <FooterColumn title="Shop" items={SHOP_LINKS} />
            <FooterColumn title="Atelier" items={ATELIER_LINKS} />
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 gap-10 border-t border-[var(--hair)] pt-10 md:grid-cols-3 md:items-end">
          <div>
            <p className="eyebrow text-[var(--bone)]/55">Atelier</p>
            <p className="mt-3 text-sm text-[var(--bone)]/75">
              7 Marjanishvili St.<br /> 0102 Tbilisi, Georgia
            </p>
          </div>
          <div>
            <p className="eyebrow text-[var(--bone)]/55">Reach us</p>
            <p className="mt-3 text-sm text-[var(--bone)]/75">
              hello@gamif.ge<br /> +995 32 234 12 04
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-x-6 gap-y-3 text-[11px] uppercase tracking-[0.32em] text-[var(--bone)]/65 md:justify-end">
            <span className="link-reveal">Instagram</span>
            <span className="link-reveal">TikTok</span>
            <span className="link-reveal">Pinterest</span>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--hair)] py-8 container-edge flex flex-col items-start justify-between gap-4 text-[11px] uppercase tracking-[0.28em] text-[var(--bone)]/55 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <span className="font-display normal-case text-base tracking-tight text-[var(--bone)]">gamif</span>
          <span className="divider-dot" />
          <span>© {new Date().getFullYear()} all rights reserved</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <span>Stripe payments · GEL</span>
          <span className="divider-dot" />
          <span>Built in Georgia · Shipped worldwide</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, items }: { title: string; items: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="eyebrow text-[var(--bone)]/55">{title}</p>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="font-display text-xl text-[var(--bone)] transition-colors hover:text-[var(--accent-2)]"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
