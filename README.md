# Gamified Gift Box MVP

Lightweight custom commerce engine for a viral gift box builder. The app uses Next.js App Router, TypeScript, TailwindCSS, Supabase Postgres, and Stripe Checkout Sessions.

## Core Flow

1. Customer selects one large item, one medium item, and one free small item.
2. `/api/session/save` persists the selection in `gift_sessions`.
3. `/api/spin` assigns a weighted server-side reward once per session.
4. `/api/checkout` reloads the session from Supabase, validates item categories, calculates totals server-side, creates a Stripe Checkout Session, and stores a pending order.
5. `/api/webhook/stripe` verifies Stripe signatures, marks the order paid, and completes the gift session.

## Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Copy `.env.example` to `.env.local` and fill in Supabase and Stripe values.
4. Run `npm install`.
5. Run `npm run dev`.

For local Stripe webhooks:

```bash
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

## Folder Structure

```text
app/
  api/
    checkout/route.ts
    products/route.ts
    session/get/route.ts
    session/save/route.ts
    spin/route.ts
    webhook/stripe/route.ts
  globals.css
  layout.tsx
  page.tsx
lib/
  commerce.ts
  env.ts
  rewards.ts
  stripe.ts
  supabaseAdmin.ts
  types.ts
supabase/
  schema.sql
```

## Security Notes

- Frontend prices are never trusted.
- Checkout reloads products from Supabase and validates required categories.
- Spin rewards are generated on the backend and saved once with a conditional update.
- Spin calls are rate limited by hashed IP per hour.
- Existing pending/paid orders prevent repeated checkout creation for the same gift session.
