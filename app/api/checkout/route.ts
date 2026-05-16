import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY ?? "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const sessionToken = body.sessionToken ?? body.sessionId;

  if (!sessionToken) {
    return NextResponse.json({ error: "Missing sessionToken" }, { status: 400 });
  }

  if (!STRIPE_SECRET) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  // Fetch box from backend
  let box: {
    mainSurprise?: { title: string; boxPrice: number } | null;
    sweetPick?: { title: string; boxPrice: number } | null;
    tinyExtra?: { title: string; boxPrice: number } | null;
    spinReward?: { type: string; label: string; value: string | null } | null;
  } | null = null;

  try {
    const res = await fetch(`${API_URL}/boxes/${sessionToken}/total`);
    if (res.ok) {
      const total = await res.json();
      const boxRes = await fetch(`${API_URL}/boxes/${sessionToken}`);
      if (boxRes.ok) box = await boxRes.json();
    }
  } catch {}

  // Calculate totals
  const subtotal =
    (box?.mainSurprise?.boxPrice ?? 0) +
    (box?.sweetPick?.boxPrice ?? 0) +
    (box?.tinyExtra?.boxPrice ?? 0);

  if (subtotal === 0) {
    return NextResponse.json({ error: "Box is empty" }, { status: 400 });
  }

  const reward = box?.spinReward;
  let discount = 0;
  let shipping = 500; // 5 GEL default

  if (reward?.type === "free_shipping") shipping = 0;
  else if (reward?.type === "discount_code" && reward.value) {
    discount = Math.round(subtotal * (parseFloat(reward.value) / 100));
  } else if (reward?.type === "free_tiny_gift") {
    discount = box?.tinyExtra?.boxPrice ?? 0;
  }

  const total = subtotal - discount + shipping;

  const stripe = new Stripe(STRIPE_SECRET, { apiVersion: "2025-02-24.acacia" });

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  // Main box line item
  lineItems.push({
    quantity: 1,
    price_data: {
      currency: "gel",
      product_data: {
        name: "Mystery Gift Box",
        description: [box?.mainSurprise?.title, box?.sweetPick?.title, box?.tinyExtra?.title]
          .filter(Boolean)
          .join(" + ") || "Curated gift box",
      },
      unit_amount: subtotal - discount,
    },
  });

  if (shipping > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "gel",
        product_data: { name: "Standard Shipping" },
        unit_amount: shipping,
      },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: lineItems,
    metadata: {
      boxSessionToken: sessionToken,
      rewardType: reward?.type ?? "none",
    },
    success_url: `${APP_URL}/?checkout=success&token=${sessionToken}`,
    cancel_url: `${APP_URL}/build-a-box?token=${sessionToken}`,
  });

  if (!session.url) {
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }

  return NextResponse.json({ url: session.url, total });
}
