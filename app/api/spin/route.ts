import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

// Fallback: server-side weighted spin for when NestJS is unavailable
const FALLBACK_REWARDS = [
  { type: "free_shipping",  label: "🚚 Free Shipping!",       probability: 0.30, value: null },
  { type: "discount_code",  label: "💸 10% Off Your Order",   probability: 0.25, value: "10" },
  { type: "free_tiny_gift", label: "🎁 Free Tiny Gift!",      probability: 0.20, value: null },
  { type: "hidden_item",    label: "✨ Secret Surprise Item",  probability: 0.10, value: null },
  { type: "upgraded_gift",  label: "⬆️ Upgraded Gift",         probability: 0.05, value: null },
  { type: "no_reward",      label: "🔄 Better Luck Next Time", probability: 0.10, value: null },
];

function pickFallbackReward() {
  const rand = Math.random();
  let cumulative = 0;
  for (const r of FALLBACK_REWARDS) {
    cumulative += r.probability;
    if (rand <= cumulative) return r;
  }
  return FALLBACK_REWARDS[FALLBACK_REWARDS.length - 1];
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const sessionToken = body.sessionToken ?? body.sessionId;

  if (!sessionToken) {
    return NextResponse.json({ error: "Missing sessionToken" }, { status: 400 });
  }

  // Forward to NestJS backend
  try {
    const res = await fetch(`${API_URL}/spin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionToken }),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    if (res.status === 400 || res.status === 404) {
      const err = await res.json();
      return NextResponse.json(err, { status: res.status });
    }
  } catch {
    // NestJS offline — use fallback
  }

  // Fallback: pick server-side and return
  const reward = pickFallbackReward();
  return NextResponse.json({
    reward: { id: `fallback-${Date.now()}`, ...reward, createdAt: new Date().toISOString() },
    alreadySpun: false,
  });
}
