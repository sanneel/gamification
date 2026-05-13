create extension if not exists pgcrypto;

do $$ begin
  create type product_category as enum ('large', 'medium', 'small', 'bonus');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type gender_target as enum ('boy', 'girl', 'unisex');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type gift_session_status as enum ('active', 'completed');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type order_status as enum ('paid', 'pending', 'failed');
exception
  when duplicate_object then null;
end $$;

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  descriptor text,
  price integer not null check (price >= 0),
  image text not null,
  category product_category not null,
  gender_target gender_target not null default 'unisex',
  tag text,
  best_for text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table products add column if not exists descriptor text;
alter table products add column if not exists tag text;
alter table products add column if not exists best_for text;

create table if not exists gift_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  large_item_id uuid references products(id),
  medium_item_id uuid references products(id),
  free_item_id uuid references products(id),
  wheel_reward text,
  status gift_session_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint large_item_category check (large_item_id is null or large_item_id <> medium_item_id),
  constraint wheel_reward_once check (
    wheel_reward is null
    or wheel_reward in ('free_sticker', 'mini_gift', 'discount_10', 'free_shipping', 'no_reward')
  )
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references gift_sessions(id) on delete restrict unique,
  items jsonb not null,
  total_price integer not null check (total_price >= 0),
  stripe_checkout_session_id text unique,
  stripe_checkout_url text,
  stripe_payment_intent text,
  status order_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists spin_rate_limits (
  id uuid primary key default gen_random_uuid(),
  ip_hash text not null,
  window_start timestamptz not null default date_trunc('hour', now()),
  attempts integer not null default 1,
  unique (ip_hash, window_start)
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_gift_sessions_updated_at on gift_sessions;
create trigger set_gift_sessions_updated_at
before update on gift_sessions
for each row execute function set_updated_at();

drop trigger if exists set_orders_updated_at on orders;
create trigger set_orders_updated_at
before update on orders
for each row execute function set_updated_at();

alter table products enable row level security;
alter table gift_sessions enable row level security;
alter table orders enable row level security;
alter table spin_rate_limits enable row level security;

drop policy if exists "Public can read active products" on products;
create policy "Public can read active products"
on products for select
using (is_active = true);

drop policy if exists "Users can read their own sessions" on gift_sessions;
create policy "Users can read their own sessions"
on gift_sessions for select
using (auth.uid() = user_id);

drop policy if exists "Users can read their own orders" on orders;
create policy "Users can read their own orders"
on orders for select
using (
  exists (
    select 1 from gift_sessions
    where gift_sessions.id = orders.session_id
    and gift_sessions.user_id = auth.uid()
  )
);

create index if not exists products_category_active_idx on products (category, is_active);
create unique index if not exists products_name_category_key on products (name, category);
create index if not exists gift_sessions_status_idx on gift_sessions (status);
create index if not exists orders_status_idx on orders (status);
create index if not exists spin_rate_limits_ip_window_idx on spin_rate_limits (ip_hash, window_start);

insert into products (name, descriptor, price, image, category, gender_target, tag, best_for, is_active) values
  ('Gold Initial Necklace', 'A delicate personalised piece with everyday polish.', 3400, 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80', 'large', 'girl', 'Jewellery', 'Elegant', true),
  ('Preserved Rose Box', 'A lasting floral keepsake presented in a premium box.', 2900, 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=900&q=80', 'large', 'girl', 'Keepsake', 'Romantic', true),
  ('Silver Charm Bracelet', 'A subtle bracelet made for stacking or daily wear.', 3200, 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=80', 'large', 'unisex', 'Jewellery', 'Elegant', true),
  ('Mini Eau de Parfum', 'A compact fragrance for a polished finishing touch.', 2600, 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=80', 'large', 'unisex', 'Fragrance', 'Sophisticated', true),
  ('Keepsake Photo Frame', 'A clean frame for a favourite photo or message card.', 2200, 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80', 'large', 'unisex', 'Personal', 'Sentimental', true),
  ('Soft Keepsake Plush', 'A premium soft keepsake with a warm, comforting feel.', 2400, 'https://images.unsplash.com/photo-1563901935883-cb61f5d49be4?auto=format&fit=crop&w=900&q=80', 'large', 'unisex', 'Keepsake', 'Playful', true),
  ('Signature Candle', 'A softly scented candle for an easy cozy add-on.', 1600, 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=80', 'medium', 'unisex', 'Home', 'Cozy', true),
  ('Artisan Chocolate Set', 'A small box of rich chocolates with gift-ready appeal.', 1400, 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=900&q=80', 'medium', 'unisex', 'Sweet', 'Indulgent', true),
  ('Polished Keychain', 'A useful keepsake that feels personal without overthinking it.', 1200, 'https://images.unsplash.com/photo-1602752250015-52934bc45613?auto=format&fit=crop&w=900&q=80', 'medium', 'unisex', 'Accessory', 'Practical', true),
  ('Handwritten Card Set', 'A small set of premium cards for a personal note.', 1100, 'https://images.unsplash.com/photo-1517971129774-8a2b38fa128e?auto=format&fit=crop&w=900&q=80', 'medium', 'unisex', 'Stationery', 'Personal', true),
  ('Compact Mirror', 'A sleek everyday piece with a considered finish.', 1300, 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80', 'medium', 'girl', 'Beauty', 'Elegant', true),
  ('Ceramic Mug', 'A simple daily-use gift with a warm, familiar feel.', 1500, 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=80', 'medium', 'unisex', 'Home', 'Cozy', true),
  ('Ferrero Treat', 'A classic chocolate bite included with the box.', 0, 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=900&q=80', 'small', 'unisex', 'Chocolate', 'Sweet', true),
  ('Fruit Gummies', 'A bright little sweet treat for a playful finish.', 0, 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=900&q=80', 'small', 'unisex', 'Candy', 'Playful', true),
  ('Mini Cookies', 'A comforting snack-sized extra for the box.', 0, 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=900&q=80', 'small', 'unisex', 'Bakery', 'Cozy', true),
  ('Tea Sachet', 'A calming tea moment tucked into the gift box.', 0, 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=900&q=80', 'small', 'unisex', 'Tea', 'Calm', true),
  ('Vanilla Marshmallows', 'A soft sweet extra that keeps the box light.', 0, 'https://images.unsplash.com/photo-1587536849024-daaa4a417b16?auto=format&fit=crop&w=900&q=80', 'small', 'unisex', 'Sweet', 'Playful', true),
  ('10% Off Reward', 'A checkout discount revealed after the box is complete.', 0, 'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=900&q=80', 'bonus', 'unisex', 'Discount', 'Value', true),
  ('Free Gift Note', 'A complimentary note to make the box feel personal.', 0, 'https://images.unsplash.com/photo-1517971071642-34a2d3ecc9cd?auto=format&fit=crop&w=900&q=80', 'bonus', 'unisex', 'Personal', 'Thoughtful', true),
  ('Free Mini Candle', 'A small candle reward for a warmer unboxing.', 0, 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=900&q=80', 'bonus', 'unisex', 'Home', 'Cozy', true),
  ('Free Premium Wrap', 'An upgraded presentation reward for checkout.', 0, 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=900&q=80', 'bonus', 'unisex', 'Packaging', 'Premium', true)
on conflict (name, category) do update set
  descriptor = excluded.descriptor,
  price = excluded.price,
  image = excluded.image,
  gender_target = excluded.gender_target,
  tag = excluded.tag,
  best_for = excluded.best_for,
  is_active = excluded.is_active;
