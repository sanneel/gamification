import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  let event;

  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, env.stripeWebhookSecret());
  } catch {
    return NextResponse.json({ error: "Invalid Stripe webhook signature" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  if (event.type === "checkout.session.completed") {
    const checkoutSession = event.data.object;
    const giftSessionId = checkoutSession.metadata?.gift_session_id;

    if (!giftSessionId) {
      return NextResponse.json({ received: true });
    }

    await supabase
      .from("orders")
      .update({
        status: "paid",
        stripe_payment_intent:
          typeof checkoutSession.payment_intent === "string" ? checkoutSession.payment_intent : checkoutSession.payment_intent?.id ?? null
      })
      .eq("stripe_checkout_session_id", checkoutSession.id);

    await supabase.from("gift_sessions").update({ status: "completed" }).eq("id", giftSessionId);
  }

  if (event.type === "checkout.session.expired") {
    const checkoutSession = event.data.object;
    await supabase.from("orders").update({ status: "failed" }).eq("stripe_checkout_session_id", checkoutSession.id);
  }

  return NextResponse.json({ received: true });
}
