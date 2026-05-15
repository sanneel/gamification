import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY ?? "";
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  if (!signature || !STRIPE_SECRET) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    const stripe = new Stripe(STRIPE_SECRET, { apiVersion: "2025-02-24.acacia" });
    event = stripe.webhooks.constructEvent(rawBody, signature, WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  // Forward to NestJS backend
  try {
    await fetch(`${API_URL}/webhooks/stripe`, {
      method: "POST",
      headers: { "stripe-signature": signature, "content-type": "application/json" },
      body: rawBody,
    });
  } catch {
    // Log but don't fail — event already verified
  }

  return NextResponse.json({ received: true });
}
