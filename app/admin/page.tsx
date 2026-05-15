"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, ArrowLeft, BarChart2, Gift, RefreshCw, Settings, Zap } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

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
  { rewardType: "free_shipping",  probability: 0.30, label: "🚚 Free Shipping!",      active: true },
  { rewardType: "discount_code",  probability: 0.25, label: "💸 10% Off Your Order",  active: true },
  { rewardType: "free_tiny_gift", probability: 0.20, label: "🎁 Free Tiny Gift!",     active: true },
  { rewardType: "hidden_item",    probability: 0.10, label: "✨ Secret Surprise Item", active: true },
  { rewardType: "upgraded_gift",  probability: 0.05, label: "⬆️ Upgraded Gift",        active: true },
  { rewardType: "no_reward",      probability: 0.10, label: "🔄 Better Luck Next Time",active: true },
];

type Tab = "analytics" | "spin" | "products" | "sync";

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("analytics");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [spinConfig, setSpinConfig] = useState<SpinConfig>(DEFAULT_SPIN_CONFIG);
  const [saving, setSaving] = useState(false);
  const [syncUrl, setSyncUrl] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

  useEffect(() => {
    fetch(`${API}/admin/analytics`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setAnalytics(d))
      .catch(() => {});

    fetch(`${API}/admin/spin-config`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.length && setSpinConfig(d))
      .catch(() => {});
  }, [API]);

  function totalProbability() {
    return spinConfig.reduce((s, c) => s + c.probability, 0);
  }

  async function saveSpinConfig() {
    const total = totalProbability();
    if (Math.abs(total - 1.0) > 0.005) {
      setMessage({ type: "err", text: `Probabilities must sum to 1.0 (currently ${total.toFixed(3)})` });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/admin/spin-config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(spinConfig),
      });
      setMessage({ type: res.ok ? "ok" : "err", text: res.ok ? "Spin config saved!" : "Failed to save." });
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
    { id: "analytics", label: "Analytics",   icon: BarChart2  },
    { id: "spin",      label: "Spin Config", icon: Zap        },
    { id: "products",  label: "Products",    icon: Gift       },
    { id: "sync",      label: "Sync",        icon: RefreshCw  },
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      {/* Nav */}
      <nav className="sticky top-0 z-40 glass border-b border-white/5 px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-bold">
          <ArrowLeft className="w-4 h-4" /> Back to Site
        </Link>
        <span className="font-display text-lg font-bold text-white">
          Admin <span className="text-accent">Panel</span>
        </span>
        <Settings className="w-5 h-5 text-white/30" />
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Tab bar */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all shrink-0 ${
                tab === t.id
                  ? "bg-accent/15 border-accent/40 text-accent"
                  : "glass border-white/10 text-white/50 hover:text-white"
              }`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 px-4 py-3 rounded-xl text-sm font-bold border ${
              message.type === "ok"
                ? "bg-emerald/10 border-emerald/30 text-emerald"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {message.text}
          </motion.div>
        )}

        {/* ── Analytics ──────────────────────────────────────────────── */}
        {tab === "analytics" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {analytics ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: "Total Boxes",    value: analytics.overview.totalBoxes },
                    { label: "Paid Boxes",     value: analytics.overview.paidBoxes },
                    { label: "Conversion",     value: `${analytics.overview.conversionRate}%` },
                    { label: "Total Products", value: analytics.overview.totalProducts },
                    { label: "Active Products",value: analytics.overview.activeProducts },
                  ].map((s) => (
                    <div key={s.label} className="glass border border-white/10 rounded-2xl p-5 text-center">
                      <p className="text-2xl font-black text-white mb-1">{s.value}</p>
                      <p className="text-white/40 text-xs font-bold uppercase tracking-wider">{s.label}</p>
                    </div>
                  ))}
                </div>

                {analytics.rewardBreakdown.length > 0 && (
                  <div className="glass border border-white/10 rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-accent" /> Spin Reward Distribution
                    </h3>
                    <div className="space-y-3">
                      {analytics.rewardBreakdown.map((r) => (
                        <div key={r.type} className="flex items-center gap-3">
                          <span className="text-white/60 text-sm w-36 font-bold">{r.type.replace(/_/g, " ")}</span>
                          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent rounded-full"
                              style={{ width: `${Math.min((r._count.type / (analytics.overview.totalBoxes || 1)) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-white/40 text-xs w-8 text-right">{r._count.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 text-white/30">
                <BarChart2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-bold">Analytics unavailable.</p>
                <p className="text-sm mt-1">Make sure the NestJS server is running at <code className="text-accent">{API}</code></p>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Spin Config ─────────────────────────────────────────────── */}
        {tab === "spin" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <p className="text-white/50 text-sm">
              Adjust spin probabilities. They must sum to exactly <span className="text-white font-bold">1.0</span>.
              Currently: <span className={Math.abs(totalProbability() - 1.0) < 0.005 ? "text-emerald font-bold" : "text-red-400 font-bold"}>
                {totalProbability().toFixed(3)}
              </span>
            </p>

            {spinConfig.map((config, i) => (
              <div key={config.rewardType} className="glass border border-white/10 rounded-2xl p-5 flex items-center gap-4">
                <div className="flex-1">
                  <input
                    value={config.label}
                    onChange={(e) => setSpinConfig((prev) => prev.map((c, j) => j === i ? { ...c, label: e.target.value } : c))}
                    className="w-full bg-transparent text-white font-bold text-sm focus:outline-none border-b border-white/10 pb-1 mb-2"
                  />
                  <div className="flex items-center gap-3">
                    <span className="text-white/30 text-xs">Probability:</span>
                    <input
                      type="number"
                      min={0}
                      max={1}
                      step={0.01}
                      value={config.probability}
                      onChange={(e) => setSpinConfig((prev) => prev.map((c, j) => j === i ? { ...c, probability: parseFloat(e.target.value) } : c))}
                      className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-accent/50"
                    />
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all"
                        style={{ width: `${config.probability * 100}%` }}
                      />
                    </div>
                    <span className="text-white/50 text-xs w-10">{(config.probability * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <label className="flex items-center gap-2 text-xs text-white/50 shrink-0">
                  <input
                    type="checkbox"
                    checked={config.active}
                    onChange={(e) => setSpinConfig((prev) => prev.map((c, j) => j === i ? { ...c, active: e.target.checked } : c))}
                    className="accent-accent"
                  />
                  Active
                </label>
              </div>
            ))}

            <button
              onClick={saveSpinConfig}
              disabled={saving}
              className="btn-dopamine px-8 py-3 rounded-xl text-sm font-black flex items-center gap-2"
            >
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Zap className="w-4 h-4" />}
              Save Configuration
            </button>
          </motion.div>
        )}

        {/* ── Products ────────────────────────────────────────────────── */}
        {tab === "products" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <p className="text-white/50 text-sm">
              Products are synced from your backoffice system via the Sync tab or webhook at{" "}
              <code className="text-accent">{API}/webhooks/product-sync</code>
            </p>
            <div className="glass border border-white/10 rounded-2xl p-6 text-center text-white/30">
              <Gift className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-bold">Product list loaded from API.</p>
              <Link href="/shop" className="text-accent text-sm mt-2 block hover:underline">View shop →</Link>
            </div>
          </motion.div>
        )}

        {/* ── Sync ─────────────────────────────────────────────────────── */}
        {tab === "sync" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="glass border border-white/10 rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-accent" /> Manual Product Sync
              </h3>
              <p className="text-white/40 text-sm mb-4">
                Enter the URL of your backoffice products endpoint. It should return an array of products.
              </p>
              <div className="flex gap-3">
                <input
                  value={syncUrl}
                  onChange={(e) => setSyncUrl(e.target.value)}
                  placeholder="https://your-backoffice.com/api/products"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50"
                />
                <button
                  onClick={triggerSync}
                  disabled={!syncUrl || syncing}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold shrink-0 transition-all ${
                    syncUrl && !syncing ? "btn-dopamine" : "glass border border-white/10 text-white/30 cursor-not-allowed"
                  }`}
                >
                  {syncing
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><RefreshCw className="w-4 h-4" /> Sync</>}
                </button>
              </div>
            </div>

            <div className="glass border border-white/10 rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4">Webhook Endpoints</h3>
              <div className="space-y-3">
                {[
                  { label: "Product sync (batch)", url: `${API}/products/sync`, method: "POST" },
                  { label: "Product inventory update", url: `${API}/products/sync/:externalId/stock`, method: "PUT" },
                  { label: "Realtime product webhook", url: `${API}/webhooks/product-sync`, method: "POST" },
                  { label: "Stripe payment webhook", url: `${API}/webhooks/stripe`, method: "POST" },
                ].map((w) => (
                  <div key={w.url} className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${w.method === "POST" ? "bg-accent/20 text-accent" : "bg-gold/20 text-gold"}`}>
                      {w.method}
                    </span>
                    <span className="text-white/50 text-sm flex-1">{w.label}</span>
                    <code className="text-accent/70 text-xs font-mono truncate max-w-[200px]">{w.url}</code>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
