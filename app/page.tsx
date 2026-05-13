import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gift, ShieldCheck, Sparkles, Truck } from "lucide-react";

const featured = [
  {
    name: "Preserved Rose Box",
    price: "£29",
    image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Gold Initial Necklace",
    price: "£34",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Signature Candle",
    price: "£16",
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=80"
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f3ec] text-ink">
      <SiteNav />

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-14">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-mint">Mystery Gift Box</p>
          <h1 className="mt-4 max-w-2xl text-5xl font-black leading-tight text-ink sm:text-6xl">
            Gifts that feel considered from the first click.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-ink/68">
            Shop curated keepsakes, treats, and ready-to-build gift boxes for moments that need a little more care.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex h-14 items-center justify-center gap-2 rounded-md bg-ink px-6 py-4 text-base font-black text-white transition hover:bg-ink/90"
              href="/shop"
            >
              Shop gifts
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              className="inline-flex h-14 items-center justify-center gap-2 rounded-md border border-ink/15 bg-white px-6 py-4 text-base font-black text-ink transition hover:border-ink"
              href="/gift-box-builder"
            >
              Build a Gift Box
            </Link>
          </div>
          <TrustRow />
        </div>

        <div className="relative min-h-[460px] overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft">
          <Image
            alt=""
            className="object-cover"
            fill
            priority
            sizes="(min-width: 1024px) 48vw, 100vw"
            src="https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=1400&q=80"
          />
          <div className="absolute inset-x-5 bottom-5 rounded-lg bg-white/92 p-4 shadow-soft backdrop-blur">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-mint">Curated path</p>
            <h2 className="mt-1 text-2xl font-black">Build a complete gift box</h2>
            <p className="mt-2 text-sm leading-6 text-ink/65">Choose the box, add gifts, unlock a reward, then checkout securely.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-mint">Featured gifts</p>
            <h2 className="mt-2 text-3xl font-black">Ready to give</h2>
          </div>
          <Link className="hidden text-sm font-black text-ink underline decoration-ink/30 underline-offset-4 sm:inline" href="/shop">
            View shop
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {featured.map((product) => (
            <article key={product.name} className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm">
              <div className="relative aspect-[4/3] bg-white">
                <Image alt="" className="object-cover" fill sizes="(min-width: 640px) 33vw, 100vw" src={product.image} />
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <h3 className="font-black">{product.name}</h3>
                <span className="font-black">{product.price}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function SiteNav() {
  return (
    <header className="border-b border-ink/10 bg-white/88 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link className="text-lg font-black" href="/">
          Mystery Gift Box
        </Link>
        <nav className="flex items-center gap-5 text-sm font-bold text-ink/68">
          <Link className="hover:text-ink" href="/shop">
            Shop
          </Link>
          <Link className="hover:text-ink" href="/gift-box-builder">
            Build a Gift Box
          </Link>
        </nav>
      </div>
    </header>
  );
}

function TrustRow() {
  const items = [
    { icon: ShieldCheck, label: "Secure checkout" },
    { icon: Gift, label: "Curated options" },
    { icon: Truck, label: "Fast gift flow" }
  ];

  return (
    <div className="mt-8 grid gap-3 text-sm font-semibold text-ink/62 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <item.icon className="h-4 w-4 text-mint" />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
