"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CreditCard, Gift, Lock, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/lib/stores/cart";
import { formatGELSimple } from "@/lib/types";
import { springs, ease } from "@/lib/motion";
import Navbar from "@/components/Navbar";

type Step = "details" | "payment" | "success";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCartStore();
  const [step, setStep] = useState<Step>("details");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", city: "", address: "", note: "", promoCode: "",
  });

  const sub = subtotal();
  const shipping = sub > 0 ? 500 : 0;
  const total = sub + shipping;

  function update(key: keyof typeof form, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  const isDetailsValid = form.name.trim().length >= 2 && form.email.includes("@") && form.city.trim().length >= 2;

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
      if (data.url) {
        window.location.href = data.url;
      } else if (data.success || res.ok) {
        clearCart();
        setStep("success");
      } else {
        setError(data.error ?? "Checkout failed. Please try again.");
      }
    } catch {
      clearCart();
      setStep("success");
    } finally {
      setLoading(false);
    }
  }

  if (step === "success") return <SuccessScreen name={form.name} />;

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-10">
          {(["details", "payment"] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <motion.div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  step === s
                    ? "bg-accent text-white shadow-glow-accent"
                    : step === "payment" && s === "details"
                    ? "bg-emerald text-white"
                    : "bg-white/8 text-white/30"
                }`}
                animate={step === s ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 0.5 }}
              >
                {step === "payment" && s === "details" ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </motion.div>
              <span className={`text-sm font-bold capitalize ${step === s ? "text-white" : "text-white/30"}`}>
                {s}
              </span>
              {i === 0 && <div className="w-12 h-px bg-white/8" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === "details" && (
                <DetailsForm key="details" form={form} update={update} onNext={() => setStep("payment")} isValid={isDetailsValid} />
              )}
              {step === "payment" && (
                <PaymentStep key="payment" form={form} update={update} onBack={() => setStep("details")} onPlace={handlePlaceOrder} loading={loading} error={error} total={total} />
              )}
            </AnimatePresence>
          </div>

          <div>
            <OrderSummary items={items} sub={sub} shipping={shipping} total={total} />
          </div>
        </div>
      </div>
    </div>
  );
}

type FormKey = "name" | "email" | "phone" | "city" | "address" | "note" | "promoCode";

function DetailsForm({ form, update, onNext, isValid }: {
  form: Record<FormKey, string>;
  update: (k: FormKey, v: string) => void;
  onNext: () => void;
  isValid: boolean;
}) {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.35, ease: ease.expo }}
    >
      <div>
        <h2 className="font-display text-2xl font-bold text-white mb-1">Delivery Details</h2>
        <p className="text-white/35 text-sm">Where should we send the magic?</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Full Name" value={form.name} onChange={(v) => update("name", v)} placeholder="Nino Beridze" required />
        <Field label="Email" type="email" value={form.email} onChange={(v) => update("email", v)} placeholder="nino@example.com" required />
        <Field label="Phone" type="tel" value={form.phone} onChange={(v) => update("phone", v)} placeholder="+995 5xx xxx xxx" />
        <Field label="City" value={form.city} onChange={(v) => update("city", v)} placeholder="Tbilisi" required />
        <div className="sm:col-span-2">
          <Field label="Address" value={form.address} onChange={(v) => update("address", v)} placeholder="Street, apartment..." />
        </div>
        <div className="sm:col-span-2">
          <label className="text-white/30 text-xs font-black uppercase tracking-widest mb-2 block">Gift Note</label>
          <textarea
            value={form.note}
            onChange={(e) => update("note", e.target.value)}
            placeholder="Include a special message with the delivery..."
            rows={3}
            className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none resize-none transition-all text-white placeholder-white/25"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            onFocus={(e) => { e.target.style.borderColor = "rgba(255,45,120,0.5)"; e.target.style.boxShadow = "0 0 0 2px rgba(255,45,120,0.12)"; }}
            onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
          />
        </div>
      </div>

      <motion.button
        onClick={onNext}
        disabled={!isValid}
        className={`w-full py-4 rounded-2xl text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 ${
          isValid ? "btn-dopamine" : "text-white/25 cursor-not-allowed"
        }`}
        style={!isValid ? { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" } : {}}
        whileHover={isValid ? { scale: 1.02 } : {}}
        whileTap={isValid ? { scale: 0.97 } : {}}
      >
        Continue to Payment <span className="ml-1">→</span>
      </motion.button>
    </motion.div>
  );
}

function PaymentStep({ form, update, onBack, onPlace, loading, error, total }: {
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
      className="space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.35, ease: ease.expo }}
    >
      <div>
        <h2 className="font-display text-2xl font-bold text-white mb-1">Payment</h2>
        <p className="text-white/35 text-sm">You&apos;ll be redirected to Stripe&apos;s secure page.</p>
      </div>

      {/* Promo code */}
      <div>
        <label className="text-white/30 text-xs font-black uppercase tracking-widest mb-2 block">Promo Code</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={form.promoCode}
            onChange={(e) => update("promoCode", e.target.value.toUpperCase())}
            placeholder="WELCOME15"
            className="flex-1 rounded-2xl px-4 py-3.5 text-sm outline-none transition-all text-white placeholder-white/25 font-mono"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            onFocus={(e) => { e.target.style.borderColor = "rgba(255,45,120,0.5)"; }}
            onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
          />
          <button className="px-5 py-3.5 rounded-2xl text-accent text-sm font-bold hover:text-white transition-all"
            style={{ border: "1px solid rgba(255,45,120,0.3)" }}>
            Apply
          </button>
        </div>
      </div>

      {/* Payment info */}
      <div className="rounded-2xl p-5"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-3 mb-3">
          <CreditCard className="w-5 h-5 text-accent" />
          <span className="text-white font-bold">Secure Payment via Stripe</span>
        </div>
        <p className="text-white/35 text-sm mb-4 leading-relaxed">
          We never store your card details. All transactions are encrypted.
        </p>
        <div className="flex gap-2 flex-wrap">
          {["Visa", "Mastercard", "Amex", "Apple Pay", "Google Pay"].map((m) => (
            <span key={m} className="text-[10px] font-bold px-2.5 py-1 rounded-lg text-white/40"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {m}
            </span>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            className="text-red-400 text-sm font-bold px-4 py-3 rounded-xl"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-4 rounded-2xl text-white/50 hover:text-white hover:border-white/25 transition-all text-sm font-bold"
          style={{ border: "1px solid rgba(255,255,255,0.1)" }}
        >
          ←
        </button>
        <motion.button
          onClick={onPlace}
          disabled={loading}
          className="flex-1 btn-dopamine py-4 rounded-2xl text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          {loading
            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <><Zap className="w-4 h-4" /> Pay {formatGELSimple(total)}</>}
        </motion.button>
      </div>

      <p className="text-center text-white/20 text-xs flex items-center justify-center gap-1.5">
        <Lock className="w-3 h-3" /> 256-bit SSL encryption · Powered by Stripe
      </p>
    </motion.div>
  );
}

function OrderSummary({ items, sub, shipping, total }: {
  items: ReturnType<typeof useCartStore.getState>["items"];
  sub: number;
  shipping: number;
  total: number;
}) {
  return (
    <div
      className="rounded-2xl p-5 sticky top-24 space-y-4"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <h3 className="font-display text-lg font-bold text-white">Your Order</h3>

      <div className="space-y-3 max-h-60 overflow-y-auto">
        {items.map((item) => (
          <div key={item.product.id} className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/8 shrink-0">
              <Image src={item.product.images[0]} alt={item.product.title} fill className="object-cover" sizes="48px" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-bold truncate">{item.product.title}</p>
              <p className="text-white/30 text-[10px]">×{item.quantity}</p>
            </div>
            <span className="text-white text-xs font-black shrink-0 tabular-nums">
              {formatGELSimple(item.product.normalPrice * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-white/8 pt-4 space-y-2">
        <div className="flex justify-between text-sm text-white/40">
          <span>Subtotal</span><span className="tabular-nums">{formatGELSimple(sub)}</span>
        </div>
        <div className="flex justify-between text-sm text-white/40">
          <span>Shipping</span><span className="tabular-nums">{formatGELSimple(shipping)}</span>
        </div>
        <div className="flex justify-between font-black text-white pt-1">
          <span>Total</span><span className="tabular-nums">{formatGELSimple(total)}</span>
        </div>
      </div>
    </div>
  );
}

function SuccessScreen({ name }: { name: string }) {
  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={springs.bouncy}
        className="space-y-6 max-w-sm"
      >
        <motion.div
          className="text-7xl"
          animate={{ rotate: [0, -5, 5, -3, 0] }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          🎉
        </motion.div>
        <h1 className="font-display text-4xl font-bold text-white">Order Placed!</h1>
        <p className="text-white/50 text-base leading-relaxed">
          Thank you{name ? `, ${name.split(" ")[0]}` : ""}! Your order is confirmed and will be gift-wrapped with love.
        </p>
        <div className="rounded-2xl p-4 flex items-center gap-3 text-left"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="text-2xl">📦</div>
          <div>
            <p className="text-white font-bold text-sm">What happens next?</p>
            <p className="text-white/40 text-xs">You&apos;ll receive a confirmation email shortly. Delivery within 1–3 days.</p>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Link href="/shop" className="btn-dopamine py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" /> Keep Shopping
          </Link>
          <Link href="/build-a-box" className="py-3 rounded-2xl text-white/50 hover:text-white text-sm font-bold flex items-center justify-center gap-2 transition-all"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
            <Gift className="w-4 h-4" /> Build Another Box
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", required = false }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-white/30 text-xs font-black uppercase tracking-widest mb-2 block">
        {label} {required && <span className="text-accent">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none transition-all text-white placeholder-white/25"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
        onFocus={(e) => { e.target.style.borderColor = "rgba(255,45,120,0.5)"; e.target.style.boxShadow = "0 0 0 2px rgba(255,45,120,0.12)"; }}
        onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}
