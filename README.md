# Gamif — Premium Mystery Gift Platform

A cinematic, dopamine-driven gifting platform built for the Georgian market. Users build curated mystery gift boxes at exclusive **box prices**, spin a lucky wheel for surprise rewards, and experience an unboxing moment that's meant to be shared on TikTok.

---

## Architecture

```
/                   → Next.js 14 frontend (App Router, TypeScript)
/server             → NestJS backend (PostgreSQL, Prisma, Redis)
/docker-compose.yml → Full stack local dev
```

## Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | Next.js 14, Tailwind CSS, Framer Motion |
| Backend  | NestJS, Prisma ORM, Redis               |
| Database | PostgreSQL                              |
| Payments | Stripe (GEL currency)                   |
| Hosting  | Docker / any Node.js PaaS               |

---

## Key Features

### Dual Pricing System
Every product has two prices:
- **Normal Price** — standard retail (e.g. 49 ₾)
- **Box Price** — exclusive discounted price when added to a gift box (e.g. 40 ₾)

The box price creates higher perceived value, increased AOV, and gamified shopping psychology.

### Box Builder
Users select 3 items across 3 slots:
1. **Main Surprise** — the star of the box
2. **Sweet Pick** — a complementary item
3. **Tiny Extra** — a small bonus

### Lucky Spin Wheel
After completing the box, users spin a wheel for a reward:
- 🚚 Free Shipping (30%)
- 💸 10% Discount (25%)
- 🎁 Free Tiny Gift (20%)
- ✨ Secret Item (10%)
- ⬆️ Gift Upgrade (5%)
- 🔄 No Reward (10%)

**The spin result is 100% server-side.** The frontend only animates to the result — it cannot cheat.

### Product Sync
Products come from an external backoffice system via:
- `POST /api/products/sync` — batch upsert
- `PUT /api/products/sync/:externalId/stock` — inventory update
- `POST /api/webhooks/product-sync` — realtime webhook

### Admin Panel
Available at `/admin`:
- Analytics overview
- Spin probability configuration
- Product sync trigger
- Webhook endpoint reference

---

## Getting Started

### Prerequisites
- Node.js 20+
- Docker & Docker Compose

### 1. Clone & install
```bash
# Frontend dependencies
npm install

# Backend dependencies
cd server && npm install
```

### 2. Environment
```bash
# Root .env
cp .env.example .env

# Server .env
cp server/.env.example server/.env
# Fill in DATABASE_URL, REDIS_URL, STRIPE keys
```

### 3. Start with Docker
```bash
docker compose up -d
```

### 4. Or start locally
```bash
# Terminal 1 — PostgreSQL + Redis (Docker)
docker compose up postgres redis -d

# Terminal 2 — NestJS backend
cd server
npm run prisma:migrate  # first time only
npm run start:dev

# Terminal 3 — Next.js frontend
npm run dev
```

---

## API Reference

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all active products |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products/sync` | Batch upsert from backoffice |
| PUT | `/api/products/sync/:externalId/stock` | Update stock |

### Boxes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/boxes` | Create new box session |
| GET | `/api/boxes/:token` | Get box with selections |
| PATCH | `/api/boxes/:token` | Update slot selections |
| GET | `/api/boxes/:token/total` | Get price breakdown |

### Spin
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/spin` | Execute server-side spin |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/analytics` | Platform overview |
| GET | `/api/admin/spin-config` | Current spin probabilities |
| PUT | `/api/admin/spin-config` | Update probabilities |

### Webhooks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhooks/stripe` | Stripe payment events |
| POST | `/api/webhooks/product-sync` | Backoffice product updates |

---

## Swagger Docs

Available at `http://localhost:4000/api/docs` when the backend is running.

---

## Product Model

```typescript
Product {
  id, title, description
  normalPrice: number   // GEL in tetri (100 = 1 ₾)
  boxPrice: number      // discounted box price
  images: string[]
  stock: number
  active: boolean
  category: 'main_surprise' | 'sweet_pick' | 'tiny_extra' | 'lucky_bonus'
  audience: 'for_her' | 'for_him' | 'couple' | 'neutral'
  vibes: ('romantic' | 'cute' | 'cozy' | 'luxury' | 'funny' | 'soft' | 'gamer' | 'aesthetic')[]
  tags: string[]
  externalId: string    // for backoffice sync
}
```
