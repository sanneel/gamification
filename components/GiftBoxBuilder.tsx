"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Gift, Loader2, Lock, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { clsx } from "clsx";
import type { GiftSession, Product, ProductCategory, WheelReward } from "@/lib/types";
import { rewardLabel } from "@/lib/rewards";

type ProductsByCategory = Record<ProductCategory, Product[]>;
type StepId = "size" | "main" | "second" | "treat" | "bonus" | "review";
type GiftStage = "large" | "medium" | "small";
type BoxSizeId = "signature" | "premium" | "ultimate";

const stepFlow: Array<{ id: StepId; label: string }> = [
  { id: "size", label: "Choose box size" },
  { id: "main", label: "Main gift" },
  { id: "second", label: "Second gift" },
  { id: "treat", label: "Complimentary treat" },
  { id: "bonus", label: "Unlock bonus" },
  { id: "review", label: "Review and checkout" }
];

const boxSizes: Array<{ id: BoxSizeId; name: string; description: string; detail: string }> = [
  {
    id: "signature",
    name: "Signature Box",
    description: "A polished gift box with one standout gift, one supporting gift, and a complimentary small treat.",
    detail: "Best for birthdays, thank-you gifts, and everyday surprises."
  },
  {
    id: "premium",
    name: "Premium Box",
    description: "A fuller gift experience with the same guided build and a more elevated presentation.",
    detail: "Best when you want the box to feel more considered."
  },
  {
    id: "ultimate",
    name: "Ultimate Box",
    description: "Our most generous presentation for a recipient who deserves the full moment.",
    detail: "Best for bigger occasions and high-impact gifting."
  }
];

const giftStages: Array<{
  id: GiftStage;
  label: string;
  title: string;
  description: string;
  summaryLabel: string;
}> = [
  {
    id: "large",
    label: "Main gift",
    title: "Choose the main gift",
    description: "Start with the item that sets the tone for the box.",
    summaryLabel: "Main gift"
  },
  {
    id: "medium",
    label: "Second gift",
    title: "Add a second gift",
    description: "Choose the supporting item that rounds out the box.",
    summaryLabel: "Second gift"
  },
  {
    id: "small",
    label: "Complimentary treat",
    title: "Choose the complimentary treat",
    description: "This small item is included with your box.",
    summaryLabel: "Complimentary treat"
  }
];

const trustItems = [
  { icon: ShieldCheck, label: "Secure checkout" },
  { icon: Gift, label: "Curated gift options" },
  { icon: Truck, label: "Reward applied before payment" }
];

export default function Home() {
  const [products, setProducts] = useState<ProductsByCategory>({
    large: [],
    medium: [],
    small: [],
    bonus: []
  });
  const [session, setSession] = useState<GiftSession | null>(null);
  const [boxSize, setBoxSize] = useState<BoxSizeId | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const selectedIds = useMemo(
    () => ({
      large: session?.large_item_id ?? null,
      medium: session?.medium_item_id ?? null,
      small: session?.free_item_id ?? null
    }),
    [session]
  );

  const allProducts = useMemo(() => [...products.large, ...products.medium, ...products.small], [products]);

  const selectedProducts = useMemo(() => {
    return {
      large: allProducts.find((product) => product.id === selectedIds.large) ?? null,
      medium: allProducts.find((product) => product.id === selectedIds.medium) ?? null,
      small: allProducts.find((product) => product.id === selectedIds.small) ?? null
    };
  }, [allProducts, selectedIds]);

  const giftBoxComplete = Boolean(selectedIds.large && selectedIds.medium && selectedIds.small);
  const currentStep = stepFlow[stepIndex];
  const currentGiftStage = giftStages.find((stage) => stepToGiftStage(currentStep.id) === stage.id) ?? giftStages[0];
  const selectedBoxSize = boxSizes.find((size) => size.id === boxSize) ?? null;

  const paidSubtotal = [selectedProducts.large, selectedProducts.medium]
    .filter(Boolean)
    .reduce((sum, product) => sum + (product?.price ?? 0), 0);

  const activeStepIndex = useMemo(() => {
    if (!boxSize) {
      return 0;
    }
    if (!selectedIds.large) {
      return 1;
    }
    if (!selectedIds.medium) {
      return 2;
    }
    if (!selectedIds.small) {
      return 3;
    }
    if (!session?.wheel_reward) {
      return 4;
    }
    return 5;
  }, [boxSize, selectedIds.large, selectedIds.medium, selectedIds.small, session?.wheel_reward]);

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

      const savedBoxSize = window.localStorage.getItem("gift_box_size") as BoxSizeId | null;
      if (savedBoxSize && boxSizes.some((size) => size.id === savedBoxSize)) {
        setBoxSize(savedBoxSize);
      }

      setProducts(grouped);
      setSession(savedSession);
      setIsLoading(false);
    }

    hydrate().catch(() => {
      setNotice("The gift box builder is unavailable right now. Please try again shortly.");
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    setStepIndex((current) => Math.min(current, activeStepIndex));
  }, [activeStepIndex]);

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

  function chooseBoxSize(size: BoxSizeId) {
    setBoxSize(size);
    window.localStorage.setItem("gift_box_size", size);
    setNotice(null);
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
      setNotice(payload.error ?? "We could not save that choice. Please choose again.");
      return;
    }

    window.localStorage.setItem("gift_session_id", payload.session.id);
    setSession(payload.session);
  }

  function continueFromSize() {
    if (boxSize) {
      setStepIndex(1);
    }
  }

  function continueFromGift() {
    if (currentStep.id === "main" && selectedIds.large) {
      setStepIndex(2);
      return;
    }

    if (currentStep.id === "second" && selectedIds.medium) {
      setStepIndex(3);
      return;
    }

    if (currentStep.id === "treat" && selectedIds.small) {
      setStepIndex(4);
    }
  }

  async function spinWheel() {
    if (!session?.id || !giftBoxComplete) {
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
      setNotice(payload.error ?? "Your reward could not be unlocked. Please try again.");
      return;
    }

    setSession({ ...session, wheel_reward: payload.reward as WheelReward });
    setStepIndex(3);
  }

  async function checkout() {
    if (!session?.id || !session.wheel_reward) {
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
      setNotice(payload.error ?? "Checkout is not available right now. Please try again.");
      return;
    }

    window.location.href = payload.url;
  }

  const primaryAction = getPrimaryAction({
    step: currentStep.id,
    boxSize,
    selectedIds,
    reward: session?.wheel_reward ?? null,
    isSaving,
    isSpinning,
    isCheckingOut,
    continueFromSize,
    continueFromGift,
    spinWheel,
    checkout
  });

  return (
    <main className="min-h-screen bg-[#f7f3ec] pb-28 text-ink lg:pb-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between">
          <Link className="text-sm font-black text-ink/62 hover:text-ink" href="/shop">
            Back to shop
          </Link>
          <Link className="text-sm font-black text-ink hover:text-mint" href="/">
            Mystery Gift Box
          </Link>
        </header>
        <PremiumHeader />

        <StepProgress activeStepIndex={stepIndex} unlockedStepIndex={activeStepIndex} />

        {notice ? (
          <p className="rounded-md border border-berry/20 bg-white px-4 py-3 text-sm font-semibold text-berry shadow-sm">{notice}</p>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="rounded-lg border border-ink/10 bg-white shadow-soft">
            {isLoading ? (
              <div className="grid min-h-[520px] place-items-center px-6 text-sm font-semibold text-ink/60">
                Preparing your box options...
              </div>
            ) : (
              <>
                {currentStep.id === "size" ? (
                  <SizeStep boxSize={boxSize} onChoose={chooseBoxSize} />
                ) : null}

                {stepToGiftStage(currentStep.id) ? (
                  <GiftsStep
                    currentGiftStage={currentGiftStage}
                    isSaving={isSaving}
                    products={products[currentGiftStage.id]}
                    selectedId={selectedIds[currentGiftStage.id]}
                    onSelect={selectProduct}
                  />
                ) : null}

                {currentStep.id === "bonus" ? (
                  <BonusStep giftBoxComplete={giftBoxComplete} isSpinning={isSpinning} reward={session?.wheel_reward ?? null} />
                ) : null}

                {currentStep.id === "review" ? (
                  <ReviewStep
                    boxSize={selectedBoxSize}
                    selectedProducts={selectedProducts}
                    reward={session?.wheel_reward ?? null}
                    subtotal={paidSubtotal}
                  />
                ) : null}

                <div className="border-t border-ink/10 p-4 sm:p-6">
                  <button
                    className="flex h-14 min-h-14 w-full items-center justify-center gap-2 rounded-md bg-ink px-5 py-4 text-base font-black text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-ink/25"
                    disabled={primaryAction.disabled}
                    onClick={primaryAction.onClick}
                    type="button"
                  >
                    {primaryAction.loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
                    {primaryAction.label}
                  </button>
                </div>
              </>
            )}
          </div>

          <OrderSummary
            boxSize={selectedBoxSize}
            currentGiftStage={currentGiftStage}
            reward={session?.wheel_reward ?? null}
            selectedProducts={selectedProducts}
            subtotal={paidSubtotal}
          />
        </section>
      </div>

      <MobileSummaryBar
        boxSize={selectedBoxSize}
        currentStep={currentStep.id}
        reward={session?.wheel_reward ?? null}
        selectedProducts={selectedProducts}
        subtotal={paidSubtotal}
      />
    </main>
  );
}

function PremiumHeader() {
  return (
    <header className="rounded-lg border border-ink/10 bg-white px-5 py-6 shadow-soft sm:px-8 sm:py-8">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-mint">Mystery Gift Box</p>
      <div className="mt-3 max-w-3xl">
        <h1 className="text-4xl font-black leading-tight text-ink sm:text-5xl">Build a curated mystery gift box in minutes.</h1>
        <p className="mt-3 text-base leading-7 text-ink/70 sm:text-lg">
          Choose the box style, select the gifts, then unlock one surprise reward before secure checkout.
        </p>
      </div>
      <div className="mt-6 grid gap-2 border-t border-ink/10 pt-4 text-sm font-semibold text-ink/70 sm:grid-cols-3">
        {trustItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <item.icon className="h-4 w-4 text-mint" />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </header>
  );
}

function StepProgress({ activeStepIndex, unlockedStepIndex }: { activeStepIndex: number; unlockedStepIndex: number }) {
  return (
    <nav aria-label="Checkout progress" className="rounded-lg border border-ink/10 bg-white p-3 shadow-sm">
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {stepFlow.map((step, index) => {
          const isActive = index === activeStepIndex;
          const isComplete = index < activeStepIndex;
          const isLocked = index > unlockedStepIndex;

          return (
            <li key={step.id} className="min-w-0">
              <div
                className={clsx(
                  "h-1.5 rounded-full",
                  isActive || isComplete ? "bg-ink" : isLocked ? "bg-ink/10" : "bg-mint/30"
                )}
              />
              <div className="mt-2 flex min-h-10 items-start gap-2 text-xs font-bold sm:text-sm">
                <span
                  className={clsx(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-full border",
                    isActive
                      ? "border-ink bg-ink text-white"
                      : isComplete
                        ? "border-mint bg-mint text-white"
                        : "border-ink/15 bg-white text-ink/40"
                  )}
                >
                  {isLocked ? <Lock className="h-3 w-3" /> : index + 1}
                </span>
                <span className={clsx("leading-snug", isActive ? "text-ink" : "text-ink/45")}>{step.label}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function SizeStep({ boxSize, onChoose }: { boxSize: BoxSizeId | null; onChoose: (size: BoxSizeId) => void }) {
  return (
    <section className="p-5 sm:p-6">
      <StepIntro eyebrow="Step 1" title="Choose your box size" description="Start with the presentation that best fits the occasion." />
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {boxSizes.map((size) => {
          const isSelected = boxSize === size.id;
          return (
            <button
              key={size.id}
              className={clsx(
                "flex min-h-60 flex-col justify-between rounded-lg border p-5 text-left transition hover:-translate-y-0.5 hover:shadow-soft",
                isSelected ? "border-ink bg-ink text-white" : "border-ink/10 bg-[#fbfaf7] text-ink"
              )}
              onClick={() => onChoose(size.id)}
              type="button"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-black">{size.name}</h3>
                  {isSelected ? <Check className="h-5 w-5 shrink-0" /> : null}
                </div>
                <p className={clsx("mt-4 text-sm leading-6", isSelected ? "text-white/78" : "text-ink/68")}>{size.description}</p>
              </div>
              <p className={clsx("mt-6 border-t pt-4 text-sm font-semibold", isSelected ? "border-white/15 text-white" : "border-ink/10 text-ink")}>
                {size.detail}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function GiftsStep({
  currentGiftStage,
  isSaving,
  products,
  selectedId,
  onSelect
}: {
  currentGiftStage: (typeof giftStages)[number];
  isSaving: boolean;
  products: Product[];
  selectedId: string | null;
  onSelect: (product: Product) => void;
}) {
  return (
    <section className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <StepIntro eyebrow={`Step ${giftStages.findIndex((stage) => stage.id === currentGiftStage.id) + 2}`} title={currentGiftStage.title} description={currentGiftStage.description} />
        {isSaving ? <Loader2 className="mt-2 h-5 w-5 shrink-0 animate-spin text-mint" /> : null}
      </div>
      <div className="mt-4 flex gap-2">
        {giftStages.map((stage) => (
          <span
            key={stage.id}
            className={clsx(
              "rounded-full px-3 py-1 text-xs font-black",
              stage.id === currentGiftStage.id ? "bg-ink text-white" : "bg-[#f0ebe2] text-ink/55"
            )}
          >
            {stage.label}
          </span>
        ))}
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => {
          const isSelected = selectedId === product.id;
          return (
            <button
              key={product.id}
              className={clsx(
                "group overflow-hidden rounded-lg border bg-white text-left transition hover:-translate-y-0.5 hover:shadow-soft",
                isSelected ? "border-ink ring-2 ring-ink/10" : "border-ink/10"
              )}
              onClick={() => onSelect(product)}
              type="button"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#f0ebe2]">
                <Image
                  alt=""
                  className="object-cover transition group-hover:scale-105"
                  fill
                  sizes="(min-width: 1280px) 300px, (min-width: 640px) 50vw, 100vw"
                  src={product.image}
                />
              </div>
              <div className="flex min-h-32 flex-col justify-between gap-4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-black text-ink">{product.name}</h3>
                    <p className="mt-1 text-sm leading-5 text-ink/62">{product.descriptor ?? product.best_for ?? "A considered gift-box choice."}</p>
                  </div>
                  {isSelected ? <Check className="h-5 w-5 shrink-0 text-mint" /> : null}
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-[#f0ebe2] px-3 py-1 text-xs font-bold text-ink/65">{product.best_for ?? product.tag ?? "Gift-ready"}</span>
                  <span className="text-sm font-black text-ink">{product.price === 0 ? "Included" : formatMoney(product.price)}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function BonusStep({ giftBoxComplete, isSpinning, reward }: { giftBoxComplete: boolean; isSpinning: boolean; reward: WheelReward | null }) {
  return (
    <section className="p-5 sm:p-6">
      <StepIntro
        eyebrow="Step 5"
        title="Unlock your surprise reward"
        description="Your gift box is complete. Reveal the one-time reward that will be applied before checkout."
      />
      <div className="mt-6 rounded-lg border border-ink/10 bg-[#fbfaf7] p-6 text-center">
        <div className="mx-auto grid h-28 w-28 place-items-center rounded-full border border-gold/40 bg-white shadow-sm">
          {reward ? <Check className="h-10 w-10 text-mint" /> : isSpinning ? <Loader2 className="h-10 w-10 animate-spin text-mint" /> : <Sparkles className="h-10 w-10 text-gold" />}
        </div>
        <h3 className="mt-5 text-2xl font-black text-ink">{reward ? rewardLabel(reward) : "Your reward is ready"}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/65">
          {giftBoxComplete
            ? reward
              ? "This reward has been added to your box and will be reflected at checkout."
              : "Unlock it once, then review your completed box."
            : "Complete your gift selections to unlock your reward."}
        </p>
      </div>
    </section>
  );
}

function ReviewStep({
  boxSize,
  selectedProducts,
  reward,
  subtotal
}: {
  boxSize: (typeof boxSizes)[number] | null;
  selectedProducts: Record<GiftStage, Product | null>;
  reward: WheelReward | null;
  subtotal: number;
}) {
  return (
    <section className="p-5 sm:p-6">
      <StepIntro
        eyebrow="Step 6"
        title="Review your gift box"
        description="Everything is ready. Your final reward and delivery options are confirmed securely in checkout."
      />
      <div className="mt-6 divide-y divide-ink/10 rounded-lg border border-ink/10 bg-[#fbfaf7]">
        <ReviewRow label="Box size" value={boxSize?.name ?? "Choose a box size"} />
        {giftStages.map((stage) => (
          <ReviewRow key={stage.id} label={stage.summaryLabel} value={selectedProducts[stage.id]?.name ?? nextGiftMessage(stage.id)} />
        ))}
        <ReviewRow label="Surprise reward" value={reward ? rewardLabel(reward) ?? "Reward unlocked" : "Unlock your reward"} />
        <ReviewRow label="Gift subtotal" value={formatMoney(subtotal)} strong />
      </div>
    </section>
  );
}

function ReviewRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <span className="text-sm font-semibold text-ink/55">{label}</span>
      <span className={clsx("text-right text-sm", strong ? "font-black text-ink" : "font-bold text-ink")}>{value}</span>
    </div>
  );
}

function OrderSummary({
  boxSize,
  currentGiftStage,
  reward,
  selectedProducts,
  subtotal
}: {
  boxSize: (typeof boxSizes)[number] | null;
  currentGiftStage: (typeof giftStages)[number];
  reward: WheelReward | null;
  selectedProducts: Record<GiftStage, Product | null>;
  subtotal: number;
}) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-6 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-mint" />
          <h2 className="text-lg font-black">Your gift box</h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-ink/62">{summaryStateText(boxSize, selectedProducts, reward, currentGiftStage)}</p>

        <div className="mt-5 space-y-3">
          <SummaryLine label="Box size" value={boxSize?.name ?? "Choose your presentation"} />
          {giftStages.map((stage) => (
            <SummaryProductLine key={stage.id} label={stage.summaryLabel} product={selectedProducts[stage.id]} />
          ))}
          <SummaryLine label="Bonus" value={reward ? rewardLabel(reward) ?? "Reward unlocked" : "Unlocks after gifts"} />
        </div>

        <div className="mt-5 rounded-md bg-ink p-4 text-white">
          <div className="flex items-center justify-between text-sm">
            <span>Gift subtotal</span>
            <strong>{formatMoney(subtotal)}</strong>
          </div>
          <p className="mt-2 text-xs leading-5 text-white/70">Reward and delivery are confirmed before payment.</p>
        </div>
      </div>
    </aside>
  );
}

function MobileSummaryBar({
  boxSize,
  currentStep,
  reward,
  selectedProducts,
  subtotal
}: {
  boxSize: (typeof boxSizes)[number] | null;
  currentStep: StepId;
  reward: WheelReward | null;
  selectedProducts: Record<GiftStage, Product | null>;
  subtotal: number;
}) {
  const itemCount = [selectedProducts.large, selectedProducts.medium, selectedProducts.small].filter(Boolean).length;
  const state =
    currentStep === "size"
      ? boxSize?.name ?? "Choose your box size"
      : currentStep === "bonus"
        ? reward
          ? rewardLabel(reward) ?? "Reward unlocked"
          : "Reward ready to unlock"
        : `${itemCount}/3 gifts selected`;

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-ink/10 bg-white/95 px-4 py-3 shadow-[0_-12px_35px_rgba(24,21,19,0.12)] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-ink">{state}</p>
          <p className="text-xs font-semibold text-ink/55">Gift subtotal {formatMoney(subtotal)}</p>
        </div>
        <Gift className="h-5 w-5 shrink-0 text-mint" />
      </div>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-[#f7f3ec] px-3 py-2">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink/45">{label}</p>
      <p className="mt-1 text-sm font-bold text-ink">{value}</p>
    </div>
  );
}

function SummaryProductLine({ label, product }: { label: string; product: Product | null }) {
  if (!product) {
    return <SummaryLine label={label} value="Not selected yet" />;
  }

  return (
    <div className="flex gap-3 rounded-md bg-[#f7f3ec] p-2">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-white">
        <Image alt="" className="object-cover" fill sizes="56px" src={product.image} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink/45">{label}</p>
        <p className="truncate text-sm font-black text-ink">{product.name}</p>
        <p className="truncate text-xs font-semibold text-ink/55">{product.best_for ?? product.tag ?? "Gift-ready"}</p>
      </div>
    </div>
  );
}

function StepIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-mint">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-black leading-tight text-ink">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/65 sm:text-base">{description}</p>
    </div>
  );
}

function getPrimaryAction({
  step,
  boxSize,
  selectedIds,
  reward,
  isSaving,
  isSpinning,
  isCheckingOut,
  continueFromSize,
  continueFromGift,
  spinWheel,
  checkout
}: {
  step: StepId;
  boxSize: BoxSizeId | null;
  selectedIds: Record<GiftStage, string | null>;
  reward: WheelReward | null;
  isSaving: boolean;
  isSpinning: boolean;
  isCheckingOut: boolean;
  continueFromSize: () => void;
  continueFromGift: () => void;
  spinWheel: () => void;
  checkout: () => void;
}) {
  if (step === "size") {
    return {
      label: "Continue to gifts",
      disabled: !boxSize,
      loading: false,
      onClick: continueFromSize
    };
  }

  if (step === "main" || step === "second" || step === "treat") {
    const stage = stepToGiftStage(step) ?? "large";
    const giftSelected = Boolean(selectedIds[stage]);
    const label =
      stage === "large"
        ? "Continue to second gift"
        : stage === "medium"
          ? "Continue to complimentary treat"
          : "Continue to bonus";

    return {
      label,
      disabled: !giftSelected || isSaving,
      loading: isSaving,
      onClick: continueFromGift
    };
  }

  if (step === "bonus") {
    return {
      label: reward ? "Review your box" : "Unlock your surprise reward",
      disabled: isSpinning,
      loading: isSpinning,
      onClick: reward ? () => undefined : spinWheel
    };
  }

  return {
    label: "Checkout securely",
    disabled: !reward || isCheckingOut,
    loading: isCheckingOut,
    onClick: checkout
  };
}

function summaryStateText(
  boxSize: (typeof boxSizes)[number] | null,
  selectedProducts: Record<GiftStage, Product | null>,
  reward: WheelReward | null,
  currentGiftStage: (typeof giftStages)[number]
) {
  if (!boxSize) {
    return "Start by choosing the presentation for your gift box.";
  }

  if (!selectedProducts.large || !selectedProducts.medium || !selectedProducts.small) {
    return `${boxSize.name} selected. Next: ${currentGiftStage.title.toLowerCase()}.`;
  }

  if (!reward) {
    return "Your gift box is complete. Unlock the surprise reward before checkout.";
  }

  return "Your gift box is ready for secure checkout.";
}

function nextGiftMessage(stage: GiftStage) {
  if (stage === "large") {
    return "Choose the main gift";
  }
  if (stage === "medium") {
    return "Choose the second gift";
  }
  return "Choose the included treat";
}

function stepToGiftStage(step: StepId): GiftStage | null {
  if (step === "main") {
    return "large";
  }
  if (step === "second") {
    return "medium";
  }
  if (step === "treat") {
    return "small";
  }
  return null;
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP"
  }).format(amount / 100);
}
