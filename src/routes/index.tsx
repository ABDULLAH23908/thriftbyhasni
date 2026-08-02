import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { ReviewCarousel } from "@/components/ReviewCarousel";
import { products, conditions, brands, store } from "@/data/products";
import { seedReviews } from "@/data/reviews";
import hero from "@/assets/hero.jpg";
import shoes1 from "@/assets/shoes1.png.asset.json";
import shoes3 from "@/assets/shoes3.jpeg.asset.json";
import shoes6 from "@/assets/shoes6.jpeg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TBH Thrift — Hand-Picked Thrifted Sneakers in Pakistan" },
      { property: "og:site_name", content: "Thrift by Hasni" },
      {
        name: "description",
        content:
          "Graded, hand-picked thrifted sneakers from Nike, Adidas, New Balance and more. One pair, one price — order on WhatsApp.",
      },
      { property: "og:title", content: "TBH Thrift — Hand-Picked Thrifted Sneakers" },
      {
        property: "og:description",
        content:
          "Graded thrifted sneakers at honest prices. Browse new arrivals, shop by condition and order on WhatsApp.",
      },
    ],
  }),
  component: Index,
});

const categoryTiles = [
  { label: "Men", image: shoes1.url },
  { label: "Women", image: shoes3.url },
  { label: "Kids", image: shoes6.url },
] as const;

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="relative isolate overflow-hidden">
          <img
            src={hero}
            alt="Thrifted sneakers on a sunlit street curb"
            width={1920}
            height={912}
            className="h-[62vh] min-h-80 w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand/85 via-brand/50 to-transparent" />
          <div className="absolute inset-0 mx-auto flex max-w-6xl flex-col justify-center px-4">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-highlight">
              100+ brands · one thrift stop
            </p>
            <h1 className="mt-3 max-w-xl text-4xl font-bold uppercase leading-[0.95] text-brand-foreground sm:text-6xl">
              Worn once.
              <br />
              Priced right.
            </h1>
            <p className="mt-4 max-w-md text-sm text-brand-foreground/85 sm:text-base">
              Every pair is inspected, graded and photographed by hand. What you see is the exact
              pair that lands at your door.
            </p>
            <Link
              to="/shop"
              className="mt-7 w-fit bg-highlight px-7 py-3 text-xs font-bold uppercase tracking-[0.2em] text-highlight-foreground transition-transform hover:-translate-y-0.5"
            >
              Shop new arrivals
            </Link>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-3 px-4 py-8 sm:grid-cols-3">
          {categoryTiles.map((tile) => (
            <Link
              key={tile.label}
              to="/shop"
              search={{ category: tile.label }}
              className="group relative overflow-hidden"
            >
              <img
                src={tile.image}
                alt={`${tile.label} thrifted sneakers`}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-x-0 bottom-0 bg-highlight py-2 text-center text-xs font-bold uppercase tracking-[0.22em] text-highlight-foreground">
                {tile.label}
              </span>
            </Link>
          ))}
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="flex items-end justify-between border-b border-border pb-3">
            <h2 className="text-2xl font-bold uppercase tracking-tight">New Arrivals</h2>
            <Link
              to="/shop"
              className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              View all
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 6).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        <section className="bg-brand py-16 text-brand-foreground">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-2xl font-bold uppercase tracking-tight">Shop by condition</h2>
            <p className="mt-2 max-w-lg text-sm text-brand-foreground/75">
              We grade every pair the same way, so you always know what you are paying for.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {conditions.map((c) => (
                <Link
                  key={c.label}
                  to="/shop"
                  search={{ condition: c.label }}
                  className="border border-brand-foreground/20 p-5 transition-colors hover:border-highlight"
                >
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-highlight">
                    {c.label}
                  </span>
                  <p className="mt-3 text-sm text-brand-foreground/80">{c.blurb}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-bold uppercase tracking-tight">Shop by brand</h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {brands.map((b) => (
              <Link
                key={b}
                to="/shop"
                search={{ brand: b }}
                className="border border-border px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors hover:bg-highlight hover:text-highlight-foreground"
              >
                {b}
              </Link>
            ))}
          </div>
          <div className="mt-12 flex flex-col items-start gap-4 bg-secondary p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-bold uppercase">Looking for a specific pair?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Message us your size and budget — we source it from the next bale.
              </p>
            </div>
            
              href={`https://wa.me/${store.whatsapp.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="bg-brand px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-foreground"
            >
              Chat with us
            </a>
          </div>
        </section>
        <section className="relative overflow-hidden py-16">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-secondary/60 via-background to-background" />
          <div className="relative mx-auto max-w-6xl px-4">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-highlight">
                  Real customers, real pairs
                </p>
                <h2 className="mt-2 text-2xl font-bold uppercase tracking-tight sm:text-3xl">
                  What our customers say
                </h2>
              </div>
              <Link
                to="/reviews"
                className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
              >
                View all reviews
              </Link>
            </div>
            <div className="mt-8">
              <ReviewCarousel reviews={seedReviews} />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
