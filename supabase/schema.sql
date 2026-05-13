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
  price integer not null check (price >= 0),
  image text not null,
  category product_category not null,
  gender_target gender_target not null default 'unisex',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

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
create index if not exists gift_sessions_status_idx on gift_sessions (status);
create index if not exists orders_status_idx on orders (status);
create index if not exists spin_rate_limits_ip_window_idx on spin_rate_limits (ip_hash, window_start);

insert into products (name, price, image, category, gender_target, is_active) values
  ('Plush Dino Hoodie', 2499, 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=900&q=80', 'large', 'unisex', true),
  ('Kawaii LED Night Light', 2299, 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=900&q=80', 'large', 'girl', true),
  ('Arcade Mini Basketball', 2199, 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80', 'large', 'boy', true),
  ('Cloud Slime Kit', 1299, 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=900&q=80', 'medium', 'unisex', true),
  ('Charm Bracelet Pack', 1199, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80', 'medium', 'girl', true),
  ('Mini RC Racer', 1399, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80', 'medium', 'boy', true),
  ('Sticker Bomb Sheet', 0, 'https://images.unsplash.com/photo-1510936111840-65e151ad71bb?auto=format&fit=crop&w=900&q=80', 'small', 'unisex', true),
  ('Squishy Keychain', 0, 'https://images.unsplash.com/photo-1523292562811-8fa7962a78c8?auto=format&fit=crop&w=900&q=80', 'small', 'girl', true),
  ('Mystery Trading Card', 0, 'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?auto=format&fit=crop&w=900&q=80', 'small', 'boy', true),
  ('Bonus Mini Gift', 0, 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=900&q=80', 'bonus', 'unisex', true)
on conflict do nothing;
