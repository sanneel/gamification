import Stripe from "stripe";
import { env } from "@/lib/env";

let stripe: Stripe | null = null;

export function getStripe() {
  stripe ??= new Stripe(env.stripeSecretKey(), {
    apiVersion: "2025-02-24.acacia"
  });

  return stripe;
}
