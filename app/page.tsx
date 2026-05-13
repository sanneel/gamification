"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ArrowRight, Check, Gift, Loader2, Sparkles } from "lucide-react";
import { clsx } from "clsx";
import type { GiftSession, Product, ProductCategory, WheelReward } from "@/lib/types";
import { rewardLabel } from "@/lib/rewards";

type StepCategory = "large" | "medium" | "small";

const steps: Array<{ category: StepCategory; title: string; eyebrow: string }> = [
  { category: "large", title: "Pick the main gift", eyebrow: "Step 1" },
  { category: "medium", title: "Add the surprise", eyebrow: "Step 2" },
  { category: "small", title: "Choose the freebie", eyebrow: "Step 3" }
];

type ProductsByCategory = Record<ProductCategory, Product[]>;

export default function Home() {
  const [products, setProducts] = useState<ProductsByCategory>({
    large: [],
    medium: [],
    small: [],
    bonus: []
  });
  const [session, setSession] = useState<GiftSession | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const currentStep = steps[stepIndex];
  const selectedIds = useMemo(
    () => ({
      large: session?.large_item_id ?? null,
      medium: session?.medium_item_id ?? null,
      small: session?.free_item_id ?? null
    }),
    [session]
  );

  const selectedProducts = useMemo(() => {
    const allProducts = [...products.large, ...products.medium, ...products.small];
    return allProducts.filter((product) => Object.values(selectedIds).includes(product.id));
  }, [products, selectedIds]);

  const paidSubtotal = selectedProducts
    .filter((product) => product.category !== "small")
    .reduce((sum, product) => sum + product.price, 0);

  const canSpin = Boolean(session?.large_item_id && session.medium_item_id && session.free_item_id);
  const canCheckout = canSpin && Boolean(session?.wheel_reward);

  useEffect(() => {
    async function hydrate() {
      const [productsResponse, savedSession] = await Promise.all([
        fetch("/api/products").then((response) => response.json()),
        loadSavedSession()
      ]);

      const grouped: ProductsByCategory = { large: [], medium: [], small: [], bonus: [] };
      for (const product of productsResponse.products ?? []) {
        grouped[product.category as ProductCategory].push(product);
      }

      setProducts(grouped);
      setSession(savedSession);
      setIsLoading(false);
    }

    hydrate().catch(() => {
      setNotice("We could not load the builder. Refresh and try again.");
      setIsLoading(false);
    });
  }, []);

  async function loadSavedSession() {
    const sessionId = window.localStorage.getItem("gift_session_id");
    if (!sessionId) {
      return null;
    }

    const response = await fetch(`/api/session/get?id=${sessionId}`);
    if (!response.ok) {
      window.localStorage.removeItem("gift_session_id");
      return null;
    }

    const payload = await response.json();
    return payload.session as GiftSession;
  }

  async function selectProduct(product: Product) {
    setIsSaving(true);
    setNotice(null);

    const nextSelection = {
      sessionId: session?.id,
      large_item_id: product.category === "large" ? product.id : session?.large_item_id ?? null,
      medium_item_id: product.category === "medium" ? product.id : session?.medium_item_id ?? null,
      free_item_id: product.category === "small" ? product.id : session?.free_item_id ?? null
    };

    const response = await fetch("/api/session/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextSelection)
    });

    const payload = await response.json();
    setIsSaving(false);

    if (!response.ok) {
      setNotice(payload.error ?? "Selection could not be saved.");
      return;
    }

    window.localStorage.setItem("gift_session_id", payload.session.id);
    setSession(payload.session);

    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    }
  }

  async function spinWheel() {
    if (!session?.id) {
      return;
    }

    setIsSpinning(true);
    setNotice(null);

    const response = await fetch("/api/spin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: session.id })
    });
    const payload = await response.json();
    setIsSpinning(false);

    if (!response.ok && !payload.reward) {
      setNotice(payload.error ?? "Spin failed. Try again.");
      return;
    }

    setSession({ ...session, wheel_reward: payload.reward as WheelReward });
  }

  async function checkout() {
    if (!session?.id) {
      return;
    }

    setIsCheckingOut(true);
    setNotice(null);

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: session.id })
    });
    const payload = await response.json();

    if (!response.ok || !payload.url) {
      setIsCheckingOut(false);
      setNotice(payload.error ?? "Checkout could not be started.");
      return;
    }

    window.location.href = payload.url;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 rounded-lg border border-ink/10 bg-white/72 p-4 shadow-soft backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-berry">Mystery Gift Box</p>
          <h1 className="mt-1 text-3xl font-black text-ink sm:text-5xl">Build, spin, checkout.</h1>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          {steps.map((step, index) => (
            <button
              key={step.category}
              className={clsx(
                "rounded-md border px-3 py-2 font-semibold",
                index === stepIndex ? "border-ink bg-ink text-white" : "border-ink/10 bg-white text-ink"
              )}
              onClick={() => setStepIndex(index)}
              type="button"
            >
              {index + 1}
            </button>
          ))}
        </div>
      </header>

      {notice ? <p className="rounded-md border border-berry/30 bg-berry/10 p-3 text-sm font-semibold text-berry">{notice}</p> : null}

      <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-mint">{currentStep.eyebrow}</p>
              <h2 className="text-2xl font-black text-ink">{currentStep.title}</h2>
            </div>
            {isSaving ? <Loader2 className="h-5 w-5 animate-spin text-mint" /> : null}
          </div>

          {isLoading ? (
            <div className="grid min-h-96 place-items-center text-sm font-semibold text-ink/60">Loading products...</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {products[currentStep.category].map((product) => {
                const isSelected = selectedIds[currentStep.category] === product.id;
                return (
                  <button
                    key={product.id}
                    className={clsx(
                      "group overflow-hidden rounded-lg border bg-white text-left transition hover:-translate-y-0.5 hover:shadow-soft",
                      isSelected ? "border-mint ring-2 ring-mint/30" : "border-ink/10"
                    )}
                    onClick={() => selectProduct(product)}
                    type="button"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-paper">
                      <Image
                        alt=""
                        className="object-cover transition group-hover:scale-105"
                        fill
                        sizes="(min-width: 1280px) 300px, (min-width: 640px) 50vw, 100vw"
                        src={product.image}
                      />
                    </div>
                    <div className="flex min-h-28 flex-col justify-between gap-3 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base font-black text-ink">{product.name}</h3>
                        {isSelected ? <Check className="h-5 w-5 shrink-0 text-mint" /> : null}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-md bg-paper px-2 py-1 text-xs font-bold uppercase text-ink/70">{product.gender_target}</span>
                        <span className="text-sm font-black text-ink">{product.price === 0 ? "Free" : formatMoney(product.price)}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <aside className="flex flex-col gap-4">
          <div className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
            <div className="mb-3 flex items-center gap-2">
              <Gift className="h-5 w-5 text-berry" />
              <h2 className="text-lg font-black">Your box</h2>
            </div>
            <div className="space-y-2">
              {steps.map((step) => {
                const product = selectedProducts.find((item) => item.category === step.category);
                return (
                  <div key={step.category} className="flex items-center justify-between gap-3 rounded-md bg-paper px-3 py-2">
                    <span className="text-sm font-bold capitalize">{step.category}</span>
                    <span className="truncate text-right text-sm text-ink/70">{product?.name ?? "Not picked"}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 rounded-md bg-ink p-3 text-white">
              <div className="flex justify-between text-sm">
                <span>Box subtotal</span>
                <strong>{formatMoney(paidSubtotal)}</strong>
              </div>
              <p className="mt-1 text-xs text-white/70">Final discounts and shipping are calculated on the server.</p>
            </div>
          </div>

          <div className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-gold" />
              <h2 className="text-lg font-black">Spin reward</h2>
            </div>
            <div className="my-4 grid aspect-square place-items-center rounded-full border-[12px] border-gold/50 bg-[conic-gradient(#d64045_0_20%,#f4a261_20%_42%,#2a9d8f_42%_64%,#fffaf2_64%_82%,#181513_82%_100%)] p-7">
              <div className="grid h-full w-full place-items-center rounded-full bg-white text-center shadow-soft">
                <span className="px-4 text-lg font-black text-ink">
                  {session?.wheel_reward ? rewardLabel(session.wheel_reward) : "Ready?"}
                </span>
              </div>
            </div>
            <button
              className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-berry px-4 font-black text-white disabled:cursor-not-allowed disabled:bg-ink/20"
              disabled={!canSpin || Boolean(session?.wheel_reward) || isSpinning}
              onClick={spinWheel}
              type="button"
            >
              {isSpinning ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
              {session?.wheel_reward ? "Reward locked" : "Spin once"}
            </button>
          </div>

          <button
            className="flex h-14 w-full items-center justify-center gap-2 rounded-md bg-mint px-5 text-lg font-black text-white shadow-soft disabled:cursor-not-allowed disabled:bg-ink/20"
            disabled={!canCheckout || isCheckingOut}
            onClick={checkout}
            type="button"
          >
            {isCheckingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
            Checkout
          </button>
        </aside>
      </section>
    </main>
  );
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP"
  }).format(amount / 100);
}
