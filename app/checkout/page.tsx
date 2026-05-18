"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, CreditCard, Lock } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/primitives/Reveal";
import { SplitHeading } from "@/components/primitives/SplitHeading";
import { useCartStore } from "@/lib/stores/cart";
import { formatGELSimple } from "@/lib/types";

const ease = [0.16, 1, 0.3, 1] as const;
type Step = "details" | "payment" | "success";
type FormKey = "name" | "email" | "phone" | "city" | "address" | "note" | "promoCode";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCartStore();
  const [step, setStep]       = useState<Step>("details");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [form, setForm]       = useState<Record<FormKey, string>>({
    name: "", email: "", phone: "", city: "", address: "", note: "", promoCode: "",
  });

  const sub      = subtotal();
  const shipping = sub > 0 ? 500 : 0;
  const total    = sub + shipping;

  const update = (key: FormKey, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const detailsValid = form.name.trim().length >= 2 && form.email.includes("@") && form.city.trim().length >= 2;

  async function handlePlaceOrder() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
          deliveryCity: form.city,
          deliveryAddress: form.address,
          note: form.note,
          promoCode: form.promoCode,
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else if (data.success || res.ok) { clearCart(); setStep("success"); }
      else setError(data.error ?? "Checkout failed. Please try again.");
    } catch {
      clearCart();
      setStep("success");
    } finally {
      setLoading(false);
    }
  }

  if (step === "success") return <Success name={form.name} />;

  return (
    <main className="surface-bone min-h-dvh">
      <Navbar />

      <section className="container-edge container-wide pt-40 pb-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <Reveal>
              <p className="eyebrow text-[var(--storm-55)]">Step into the final act</p>
            </Reveal>
            <SplitHeading
              as="h1"
              className="font-display mt-6 text-display-xl leading-[0.9] text-[var(--ink)]"
            >
              Checkout.
            </SplitHeading>
          </div>
          <Reveal delay={0.18} className="md:col-span-4">
            <ProgressIndicator step={step} />
          </Reveal>
        </div>
      </section>

      <section className="container-edge container-wide pb-32">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-12">
          <div className="md:col-span-7">
            <AnimatePresence mode="wait">
              {step === "details" && (
                <Details
                  key="details"
                  form={form}
                  update={update}
                  isValid={detailsValid}
                  onNext={() => setStep("payment")}
                />
              )}
              {step === "payment" && (
                <Payment
                  key="payment"
                  form={form}
                  update={update}
                  onBack={() => setStep("details")}
                  onPlace={handlePlaceOrder}
                  loading={loading}
                  error={error}
                  total={total}
                />
              )}
            </AnimatePresence>
          </div>

          <div className="md:col-span-5">
            <Summary items={items} sub={sub} shipping={shipping} total={total} />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function ProgressIndicator({ step }: { step: Step }) {
  const steps = [
    { key: "details", label: "Delivery" },
    { key: "payment", label: "Payment" },
    { key: "success", label: "Sealed" },
  ] as const;
  const idx = steps.findIndex((s) => s.key === step);
  return (
    <div className="flex items-center gap-3">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center gap-3">
          <span className={clsx(
            "flex h-7 w-7 items-center justify-center border text-[11px] tabular",
            i < idx ? "bg-[var(--ink)] text-[var(--bone)] border-[var(--ink)]"
            : i === idx ? "border-[var(--ink)] text-[var(--ink)]"
            : "border-[var(--hair-warm)] text-[var(--storm-35)]",
          )}>
            {i < idx ? <Check className="h-3 w-3" /> : String(i+1).padStart(2,"0")}
          </span>
          <span className={clsx("eyebrow", i === idx ? "text-[var(--ink)]" : "text-[var(--storm-55)]")}>
            {s.label}
          </span>
          {i < steps.length - 1 && <span className="block h-px w-6 bg-[var(--hair-warm)]" />}
        </div>
      ))}
    </div>
  );
}

function Details({ form, update, isValid, onNext }: {
  form: Record<FormKey, string>;
  update: (k: FormKey, v: string) => void;
  isValid: boolean;
  onNext: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.55, ease }}
      className="space-y-12"
    >
      <div>
        <p className="eyebrow text-[var(--storm-55)]">Act I · Delivery</p>
        <p className="font-display mt-4 text-display-sm text-[var(--ink)]">Where shall we send the box?</p>
      </div>

      <div className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
        <Field label="Full name" value={form.name} onChange={(v) => update("name", v)} placeholder="Nino Beridze" required />
        <Field label="Email"     value={form.email} onChange={(v) => update("email", v)} placeholder="nino@example.com" type="email" required />
        <Field label="Phone"     value={form.phone} onChange={(v) => update("phone", v)} placeholder="+995 5xx xxx xxx" type="tel" />
        <Field label="City"      value={form.city} onChange={(v) => update("city", v)} placeholder="Tbilisi" required />
        <Field className="sm:col-span-2" label="Address" value={form.address} onChange={(v) => update("address", v)} placeholder="Street, apartment, postcode" />
        <div className="sm:col-span-2">
          <label className="eyebrow mb-3 block text-[var(--storm-55)]">A note to the courier</label>
          <textarea
            value={form.note}
            onChange={(e) => update("note", e.target.value)}
            placeholder="Any special instructions for the delivery…"
            rows={4}
            className="canvas-input w-full resize-none text-base"
          />
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!isValid}
        className={clsx(
          "btn-cinematic w-full justify-center",
          isValid ? "btn-cinematic--primary" : "border border-[var(--hair-warm)] text-[var(--storm-35)] cursor-not-allowed",
        )}
      >
        <span className="btn-cinematic__label flex items-center gap-3">
          Continue to payment <ArrowRight className="h-3 w-3" />
        </span>
      </button>
    </motion.div>
  );
}

function Payment({ form, update, onBack, onPlace, loading, error, total }: {
  form: Record<FormKey, string>;
  update: (k: FormKey, v: string) => void;
  onBack: () => void;
  onPlace: () => void;
  loading: boolean;
  error: string | null;
  total: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.55, ease }}
      className="space-y-12"
    >
      <div>
        <p className="eyebrow text-[var(--storm-55)]">Act II · Payment</p>
        <p className="font-display mt-4 text-display-sm text-[var(--ink)]">A short visit to Stripe.</p>
        <p className="mt-3 max-w-md text-body text-[var(--storm-55)]">
          Card details never touch our servers — Stripe handles the entire exchange.
        </p>
      </div>

      <div>
        <label className="eyebrow mb-3 block text-[var(--storm-55)]">Promo code</label>
        <div className="flex gap-3">
          <input
            value={form.promoCode}
            onChange={(e) => update("promoCode", e.target.value.toUpperCase())}
            placeholder="ATELIER15"
            className="canvas-input flex-1 tabular tracking-[0.18em]"
          />
          <button className="btn-cinematic btn-cinematic--outline">
            <span className="btn-cinematic__label">Apply</span>
          </button>
        </div>
      </div>

      <div className="border border-[var(--hair-warm)] p-6">
        <div className="flex items-center gap-3 text-[var(--ink)]">
          <CreditCard className="h-4 w-4" />
          <p className="eyebrow">Stripe · secure exchange</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {["Visa", "Mastercard", "Amex", "Apple Pay", "Google Pay"].map((m) => (
            <span key={m} className="box-badge--outline box-badge">{m}</span>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="border border-[var(--accent)] px-5 py-4 text-sm text-[var(--accent)]"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-3 md:flex-row">
        <button onClick={onBack} className="btn-cinematic btn-cinematic--outline">
          <span className="btn-cinematic__label flex items-center gap-3">
            <ArrowLeft className="h-3 w-3" /> Edit delivery
          </span>
        </button>
        <button
          onClick={onPlace}
          disabled={loading}
          className="btn-cinematic btn-cinematic--primary flex-1 justify-center"
        >
          <span className="btn-cinematic__label flex items-center gap-3">
            {loading ? "Routing to Stripe…" : `Pay ${formatGELSimple(total)}`}
          </span>
        </button>
      </div>

      <p className="flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.28em] text-[var(--storm-55)]">
        <Lock className="h-3 w-3" /> 256-bit SSL · powered by Stripe
      </p>
    </motion.div>
  );
}

function Summary({ items, sub, shipping, total }: {
  items: ReturnType<typeof useCartStore.getState>["items"];
  sub: number;
  shipping: number;
  total: number;
}) {
  return (
    <div className="sticky top-32 border border-[var(--hair-warm)] p-8 space-y-6">
      <p className="eyebrow text-[var(--storm-55)]">Your order</p>

      <div className="max-h-72 space-y-5 overflow-y-auto">
        {items.length === 0 && (
          <p className="text-sm text-[var(--storm-55)]">Nothing in the cart yet.</p>
        )}
        {items.map((item) => (
          <div key={item.product.id} className="flex items-center gap-4">
            <div className="relative h-14 w-12 shrink-0 overflow-clip surface-bone-2">
              <Image src={item.product.images[0]} alt={item.product.title} fill sizes="48px" className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-base text-[var(--ink)] truncate">{item.product.title}</p>
              <p className="text-xs text-[var(--storm-55)] tabular">×{item.quantity}</p>
            </div>
            <span className="tabular text-sm text-[var(--ink)]">
              {formatGELSimple(item.product.normalPrice * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-3 border-t border-[var(--hair-warm)] pt-5">
        <Row label="Subtotal" value={formatGELSimple(sub)} />
        <Row label="Delivery" value={formatGELSimple(shipping)} />
        <div className="flex items-baseline justify-between border-t border-[var(--hair-warm)] pt-4">
          <span className="eyebrow text-[var(--ink)]">Total · GEL</span>
          <span className="font-display text-display-sm tabular text-[var(--ink)]">{formatGELSimple(total)}</span>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-[var(--storm-55)]">{label}</span>
      <span className="tabular text-[var(--ink)]">{value}</span>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, type = "text", required = false, className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="eyebrow mb-3 block text-[var(--storm-55)]">
        {label} {required && <span className="text-[var(--accent)]">·</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="canvas-input w-full text-base"
      />
    </div>
  );
}

function Success({ name }: { name: string }) {
  return (
    <main className="surface-bone min-h-dvh">
      <Navbar />
      <section className="container-edge container-wide pt-44 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.1, ease }}
          className="max-w-xl"
        >
          <p className="eyebrow text-[var(--accent)]">Sealed · printed · dispatched</p>
          <SplitHeading
            as="h1"
            className="font-display mt-6 text-display-xl leading-[0.9] text-[var(--ink)]"
          >
            The box is on its way{name ? `, ${name.split(" ")[0]}` : ""}.
          </SplitHeading>
          <p className="mt-8 text-body-lg text-[var(--storm-55)]">
            A confirmation email is on its way. We will hand-wrap your selection within 48 hours; the courier handles the rest. The recipient will find your letter inside, printed on archival paper.
          </p>
          <div className="mt-12 flex flex-wrap gap-4">
            <Link href="/shop" className="btn-cinematic btn-cinematic--primary">
              <span className="btn-cinematic__label">Browse another chapter</span>
            </Link>
            <Link href="/build-a-box" className="btn-cinematic btn-cinematic--outline">
              <span className="btn-cinematic__label">Compose another box</span>
            </Link>
          </div>
        </motion.div>
      </section>
      <Footer />
    </main>
  );
}
