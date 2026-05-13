import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gift } from "lucide-react";

const products = [
  {
    name: "Preserved Rose Box",
    price: "£29",
    category: "Romantic",
    image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Gold Initial Necklace",
    price: "£34",
    category: "Elegant",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Signature Candle",
    price: "£16",
    category: "Cozy",
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Keepsake Photo Frame",
    price: "£22",
    category: "Personal",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Artisan Chocolate Set",
    price: "£14",
    category: "Sweet",
    image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Soft Keepsake Plush",
    price: "£24",
    category: "Playful",
    image: "https://images.unsplash.com/photo-1563901935883-cb61f5d49be4?auto=format&fit=crop&w=900&q=80"
  }
];

const collections = ["Romantic gifts", "Cozy night in", "Birthday-ready", "Small luxuries"];

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-[#f7f3ec] text-ink">
      <header className="border-b border-ink/10 bg-white/88 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link className="text-lg font-black" href="/">
            Mystery Gift Box
          </Link>
          <nav className="flex items-center gap-5 text-sm font-bold text-ink/68">
            <Link className="text-ink" href="/shop">
              Shop
            </Link>
            <Link className="hover:text-ink" href="/gift-box-builder">
              Build a Gift Box
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-mint">Shop gifts</p>
              <h1 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">Browse thoughtful gifts and curated box options.</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-ink/68">
                Choose a single gift quickly, or use the guided builder when you want a complete gift box.
              </p>
            </div>
            <Link
              className="flex min-h-56 flex-col justify-between rounded-lg border border-ink bg-ink p-5 text-white transition hover:-translate-y-0.5"
              href="/gift-box-builder"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  <span className="text-sm font-bold uppercase tracking-[0.16em] text-white/68">Guided gifting</span>
                </div>
                <h2 className="mt-4 text-2xl font-black">Build Your Gift Box</h2>
                <p className="mt-3 text-sm leading-6 text-white/72">Choose the box size, add gifts, and unlock a surprise reward before checkout.</p>
              </div>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-black">
                Start building
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex flex-wrap gap-2">
            {collections.map((collection) => (
              <button key={collection} className="rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-bold text-ink/70" type="button">
                {collection}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article key={product.name} className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm">
                <div className="relative aspect-[4/3] bg-white">
                  <Image alt="" className="object-cover" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" src={product.image} />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-mint">{product.category}</p>
                      <h2 className="mt-1 text-lg font-black">{product.name}</h2>
                    </div>
                    <span className="font-black">{product.price}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
