import { NextRequest, NextResponse } from "next/server";
import { calculateCheckoutTotal, loadCheckoutProducts, loadGiftSession } from "@/lib/commerce";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type CheckoutBody = {
  sessionId?: string;
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as CheckoutBody;

  if (!body.sessionId) {
    return NextResponse.json({ error: "Missing session id" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const giftSession = await loadGiftSession(body.sessionId);

  if (!giftSession) {
    return NextResponse.json({ error: "Gift session not found" }, { status: 404 });
  }

  if (giftSession.status !== "active") {
    return NextResponse.json({ error: "Gift session is already completed" }, { status: 409 });
  }

  const { data: existingOrder } = await supabase
    .from("orders")
    .select("status,stripe_checkout_url")
    .eq("session_id", body.sessionId)
    .maybeSingle();

  if (existingOrder?.status === "paid") {
    return NextResponse.json({ error: "Gift session has already been paid" }, { status: 409 });
  }

  if (existingOrder?.status === "pending" && existingOrder.stripe_checkout_url) {
    return NextResponse.json({ url: existingOrder.stripe_checkout_url, reused: true });
  }

  let checkoutTotal;
  try {
    const products = await loadCheckoutProducts(giftSession);
    checkoutTotal = calculateCheckoutTotal(products, giftSession.wheel_reward);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid gift box" }, { status: 400 });
  }

  const stripe = getStripe();
  const appUrl = env.appUrl();
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "gbp",
          product_data: {
            name: "Mystery gift box",
            description: `Large + medium + free item${giftSession.wheel_reward ? " + spin reward" : ""}`
          },
          unit_amount: checkoutTotal.subtotal - checkoutTotal.discount
        }
      },
      ...(checkoutTotal.shipping > 0
        ? [
            {
              quantity: 1,
              price_data: {
                currency: "gbp",
                product_data: { name: "Standard shipping" },
                unit_amount: checkoutTotal.shipping
              }
            }
          ]
        : [])
    ],
    metadata: {
      gift_session_id: giftSession.id,
      wheel_reward: giftSession.wheel_reward ?? "none"
    },
    success_url: `${appUrl}/?checkout=success&session_id=${giftSession.id}`,
    cancel_url: `${appUrl}/?checkout=cancelled&session_id=${giftSession.id}`
  });

  const { error: orderError } = await supabase.from("orders").upsert(
    {
      session_id: giftSession.id,
      items: checkoutTotal.items,
      total_price: checkoutTotal.total,
      stripe_checkout_session_id: checkoutSession.id,
      stripe_checkout_url: checkoutSession.url,
      status: "pending"
    },
    { onConflict: "session_id" }
  );

  if (orderError || !checkoutSession.url) {
    return NextResponse.json({ error: "Unable to create order" }, { status: 500 });
  }

  return NextResponse.json({ url: checkoutSession.url });
}
