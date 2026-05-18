"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, ArrowLeft, BarChart2, Gift, RefreshCw, Settings, Zap } from "lucide-react";
import clsx from "clsx";

const ease = [0.16, 1, 0.3, 1] as const;

type Analytics = {
  overview: {
    totalBoxes: number;
    paidBoxes: number;
    conversionRate: number;
    totalProducts: number;
    activeProducts: number;
  };
  rewardBreakdown: Array<{ type: string; _count: { type: number } }>;
};

type SpinConfig = Array<{
  rewardType: string;
  probability: number;
  label: string;
  active: boolean;
}>;

const DEFAULT_SPIN_CONFIG: SpinConfig = [
  { rewardType: "free_shipping",  probability: 0.30, label: "Free delivery",          active: true },
  { rewardType: "discount_code",  probability: 0.25, label: "Ten percent off",        active: true },
  { rewardType: "free_tiny_gift", probability: 0.20, label: "A free tiny piece",      active: true },
  { rewardType: "hidden_item",    probability: 0.10, label: "A secret surprise item", active: true },
  { rewardType: "upgraded_gift",  probability: 0.05, label: "An upgraded centrepiece",active: true },
  { rewardType: "no_reward",      probability: 0.10, label: "No reward this round",   active: true },
];

type Tab = "analytics" | "spin" | "products" | "sync";

export default function AdminPage() {
  const [tab, setTab]             = useState<Tab>("analytics");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [spinConfig, setSpinConfig] = useState<SpinConfig>(DEFAULT_SPIN_CONFIG);
  const [saving, setSaving]       = useState(false);
  const [syncUrl, setSyncUrl]     = useState("");
  const [syncing, setSyncing]     = useState(false);
  const [message, setMessage]     = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

  useEffect(() => {
    fetch(`${API}/admin/analytics`).then((r) => r.ok ? r.json() : null).then((d) => d && setAnalytics(d)).catch(() => {});
    fetch(`${API}/admin/spin-config`).then((r) => r.ok ? r.json() : null).then((d) => d?.length && setSpinConfig(d)).catch(() => {});
  }, [API]);

  const totalProbability = () => spinConfig.reduce((s, c) => s + c.probability, 0);

  async function saveSpinConfig() {
    const total = totalProbability();
    if (Math.abs(total - 1.0) > 0.005) {
      setMessage({ type: "err", text: `Probabilities must sum to 1.0 — currently ${total.toFixed(3)}` });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/admin/spin-config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(spinConfig),
      });
      setMessage({ type: res.ok ? "ok" : "err", text: res.ok ? "Spin configuration saved." : "Save failed." });
    } catch {
      setMessage({ type: "err", text: "Network error." });
    } finally {
      setSaving(false);
    }
  }

  async function triggerSync() {
    if (!syncUrl) return;
    setSyncing(true);
    try {
      const dataRes = await fetch(syncUrl);
      const products = await dataRes.json();
      const res = await fetch(`${API}/products/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products }),
      });
      const result = await res.json();
      setMessage({ type: "ok", text: `Synced ${result.synced} products. ${result.errors?.length ?? 0} errors.` });
    } catch {
      setMessage({ type: "err", text: "Sync failed. Check the URL and try again." });
    } finally {
      setSyncing(false);
    }
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "analytics", label: "Analytics", icon: BarChart2 },
    { id: "spin",      label: "Spin",      icon: Zap },
    { id: "products",  label: "Products",  icon: Gift },
    { id: "sync",      label: "Sync",      icon: RefreshCw },
  ];

  return (
    <main className="surface-paper min-h-dvh text-[var(--ink)]">
      <nav className="container-edge container-wide flex h-20 items-center justify-between border-b border-[var(--hair-warm)]">
        <Link href="/" className="eyebrow flex items-center gap-2 text-[var(--storm-55)] transition-colors hover:text-[var(--ink)]">
          <ArrowLeft className="h-3 w-3" /> Back to atelier
        </Link>
        <div className="flex items-baseline gap-3">
          <span className="font-display text-2xl text-[var(--ink)]">gamif</span>
          <span className="eyebrow text-[var(--storm-55)]">Atelier console</span>
        </div>
        <Settings className="h-4 w-4 text-[var(--storm-55)]" />
      </nav>

      <section className="container-edge container-wide pt-20 pb-12">
        <p className="eyebrow text-[var(--storm-55)]">Operations</p>
        <h1 className="font-display mt-6 text-display-lg leading-[0.92] text-[var(--ink)]">
          The console.
        </h1>
        <p className="mt-6 max-w-xl text-body text-[var(--storm-55)]">
          Probabilities, syncs, analytics. Every detail of how the atelier responds to the world.
        </p>
      </section>

      <section className="container-edge container-wide">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar border-y border-[var(--hair-warm)] py-4">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={clsx(
                "flex items-center gap-2 px-4 py-1 text-[11px] uppercase tracking-[0.28em] transition-colors",
                tab === t.id ? "bg-[var(--ink)] text-[var(--bone)]" : "text-[var(--storm-55)] hover:text-[var(--ink)]",
              )}
            >
              <t.icon className="h-3 w-3" /> {t.label}
            </button>
          ))}
        </div>
      </section>

      <section className="container-edge container-wide py-12">
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
              "mb-8 border px-5 py-4 text-sm",
              message.type === "ok" ? "border-[var(--ink)] text-[var(--ink)]" : "border-[var(--accent)] text-[var(--accent)]",
            )}
          >
            {message.text}
          </motion.div>
        )}

        {tab === "analytics" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, ease }}>
            {analytics ? (
              <div className="space-y-12">
                <div className="grid grid-cols-2 gap-px overflow-clip border border-[var(--hair-warm)] md:grid-cols-5">
                  {[
                    { label: "Total boxes",    value: analytics.overview.totalBoxes },
                    { label: "Paid boxes",     value: analytics.overview.paidBoxes },
                    { label: "Conversion",     value: `${analytics.overview.conversionRate}%` },
                    { label: "Products",       value: analytics.overview.totalProducts },
                    { label: "Active",         value: analytics.overview.activeProducts },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-[var(--paper)] p-8">
                      <p className="eyebrow text-[var(--storm-55)]">{stat.label}</p>
                      <p className="mt-3 font-display text-display-sm tabular text-[var(--ink)]">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {analytics.rewardBreakdown.length > 0 && (
                  <div className="border border-[var(--hair-warm)] p-8">
                    <div className="flex items-center gap-3">
                      <Activity className="h-4 w-4 text-[var(--ink)]" />
                      <p className="eyebrow text-[var(--storm-55)]">Spin reward distribution</p>
                    </div>
                    <div className="mt-8 space-y-4">
                      {analytics.rewardBreakdown.map((r) => (
                        <div key={r.type} className="flex items-center gap-4">
                          <span className="w-36 font-display text-base capitalize text-[var(--ink)]">{r.type.replace(/_/g, " ")}</span>
                          <div className="h-px flex-1 bg-[var(--hair-warm)]">
                            <div
                              className="h-px bg-[var(--ink)]"
                              style={{ width: `${Math.min((r._count.type / (analytics.overview.totalBoxes || 1)) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="w-10 text-right text-xs tabular text-[var(--storm-55)]">{r._count.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="border border-dashed border-[var(--hair-warm)] p-16 text-center">
                <BarChart2 className="mx-auto h-10 w-10 text-[var(--storm-35)]" />
                <p className="mt-6 font-display text-2xl text-[var(--ink)]">Analytics offline.</p>
                <p className="mt-2 text-sm text-[var(--storm-55)]">Start the NestJS server at <code>{API}</code>.</p>
              </div>
            )}
          </motion.div>
        )}

        {tab === "spin" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, ease }} className="space-y-8">
            <div className="border border-[var(--hair-warm)] p-6">
              <p className="text-sm text-[var(--storm-55)]">
                Probabilities must sum to <span className="font-bold text-[var(--ink)]">1.0</span>.
                Currently:{" "}
                <span className={clsx(
                  "tabular font-bold",
                  Math.abs(totalProbability() - 1.0) < 0.005 ? "text-[var(--ink)]" : "text-[var(--accent)]",
                )}>
                  {totalProbability().toFixed(3)}
                </span>
              </p>
            </div>

            <div className="space-y-3">
              {spinConfig.map((config, i) => (
                <div key={config.rewardType} className="grid grid-cols-1 gap-4 border border-[var(--hair-warm)] p-6 md:grid-cols-[1fr_auto_auto]">
                  <div>
                    <p className="eyebrow text-[var(--storm-55)]">{config.rewardType.replace(/_/g, " ")}</p>
                    <input
                      value={config.label}
                      onChange={(e) =>
                        setSpinConfig((prev) => prev.map((c, j) => (j === i ? { ...c, label: e.target.value } : c)))
                      }
                      className="canvas-input mt-1 w-full text-lg"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number" min={0} max={1} step={0.01}
                      value={config.probability}
                      onChange={(e) =>
                        setSpinConfig((prev) =>
                          prev.map((c, j) => (j === i ? { ...c, probability: parseFloat(e.target.value) } : c)),
                        )
                      }
                      className="canvas-input w-24 text-base tabular"
                    />
                    <span className="eyebrow text-[var(--storm-55)] tabular">{(config.probability * 100).toFixed(0)}%</span>
                  </div>
                  <label className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[var(--storm-55)]">
                    <input
                      type="checkbox"
                      checked={config.active}
                      onChange={(e) =>
                        setSpinConfig((prev) => prev.map((c, j) => (j === i ? { ...c, active: e.target.checked } : c)))
                      }
                    />
                    Active
                  </label>
                </div>
              ))}
            </div>

            <button
              onClick={saveSpinConfig}
              disabled={saving}
              className="btn-cinematic btn-cinematic--primary"
            >
              <span className="btn-cinematic__label flex items-center gap-3">
                <Zap className="h-3 w-3" /> {saving ? "Saving…" : "Save configuration"}
              </span>
            </button>
          </motion.div>
        )}

        {tab === "products" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, ease }} className="space-y-6">
            <div className="border border-[var(--hair-warm)] p-8">
              <p className="text-sm text-[var(--storm-55)]">
                Products are synced from your backoffice system via the Sync tab or webhook at{" "}
                <code className="text-[var(--ink)]">{API}/webhooks/product-sync</code>.
              </p>
            </div>
            <div className="border border-dashed border-[var(--hair-warm)] p-16 text-center">
              <Gift className="mx-auto h-10 w-10 text-[var(--storm-35)]" />
              <p className="mt-6 font-display text-2xl text-[var(--ink)]">Catalogue mirrored from the API.</p>
              <Link href="/shop" className="link-reveal eyebrow mt-4 inline-block">View the shop</Link>
            </div>
          </motion.div>
        )}

        {tab === "sync" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, ease }} className="space-y-8">
            <div className="border border-[var(--hair-warm)] p-8">
              <p className="eyebrow text-[var(--storm-55)]">Manual product sync</p>
              <p className="mt-3 text-sm text-[var(--storm-55)]">
                Paste the URL of your backoffice products endpoint — it should return an array of products.
              </p>
              <div className="mt-6 flex gap-3">
                <input
                  value={syncUrl}
                  onChange={(e) => setSyncUrl(e.target.value)}
                  placeholder="https://your-backoffice.com/api/products"
                  className="canvas-input flex-1 text-base"
                />
                <button
                  onClick={triggerSync}
                  disabled={!syncUrl || syncing}
                  className={clsx("btn-cinematic", syncUrl && !syncing ? "btn-cinematic--primary" : "border border-[var(--hair-warm)] text-[var(--storm-35)]")}
                >
                  <span className="btn-cinematic__label flex items-center gap-3">
                    <RefreshCw className="h-3 w-3" /> {syncing ? "Syncing…" : "Sync"}
                  </span>
                </button>
              </div>
            </div>

            <div className="border border-[var(--hair-warm)] p-8">
              <p className="eyebrow text-[var(--storm-55)]">Webhook endpoints</p>
              <div className="mt-6 space-y-4">
                {[
                  { label: "Product sync (batch)",         url: `${API}/products/sync`,                  method: "POST" },
                  { label: "Product inventory update",     url: `${API}/products/sync/:externalId/stock`,method: "PUT"  },
                  { label: "Realtime product webhook",     url: `${API}/webhooks/product-sync`,          method: "POST" },
                  { label: "Stripe payment webhook",       url: `${API}/webhooks/stripe`,                method: "POST" },
                ].map((w) => (
                  <div key={w.url} className="flex flex-wrap items-center gap-3 border-b border-[var(--hair-warm)] py-3">
                    <span className="box-badge--outline box-badge tabular">{w.method}</span>
                    <span className="flex-1 text-sm text-[var(--ink)]">{w.label}</span>
                    <code className="truncate max-w-[280px] text-xs text-[var(--storm-55)]">{w.url}</code>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </section>
    </main>
  );
}
