import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { conditions, brands } from "@/data/products";
import { productStockQuery, useStockedProducts } from "@/lib/stock";

type ShopSearch = {
  category?: string | undefined;
  condition?: string | undefined;
  brand?: string | undefined;
};

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    category: typeof search["category"] === "string" ? search["category"] : undefined,
    condition: typeof search["condition"] === "string" ? search["condition"] : undefined,
    brand: typeof search["brand"] === "string" ? search["brand"] : undefined,
  }),

  head: () => ({
    meta: [
      { title: "Shop Thrifted Sneakers — Thrift by Hasni" },
      {
        name: "description",
        content:
          "Browse every graded thrifted sneaker in stock. Filter by category, condition and brand, then order the exact pair on WhatsApp.",
      },
      { property: "og:title", content: "Shop Thrifted Sneakers — Thrift by Hasni" },
      {
        property: "og:description",
        content: "Filter graded thrifted sneakers by category, condition and brand.",
      },
      { property: "og:url", content: "https://thriftbyhasni.lovable.app/shop" },
    ],
    links: [{ rel: "canonical", href: "https://thriftbyhasni.lovable.app/shop" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productStockQuery),
  errorComponent: () => (
    <p className="p-10 text-center text-sm text-muted-foreground">
      Could not load the catalog. Please refresh.
    </p>
  ),
  component: Shop,
});

const categories = ["Men", "Women", "Kids", "Sports", "Casual"];

function FilterRow({
  title,
  values,
  active,
  keyName,
}: {
  title: string;
  values: string[];
  active?: string;
  keyName: keyof ShopSearch;
}) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link
          to="/shop"
          search={(prev: ShopSearch) => ({ ...prev, [keyName]: undefined })}
          className={`border px-4 py-2 text-[11px] font-bold uppercase tracking-widest ${
            active ? "border-border" : "border-brand bg-brand text-brand-foreground"
          }`}
        >
          All
        </Link>
        {values.map((v) => (
          <Link
            key={v}
            to="/shop"
            search={(prev: ShopSearch) => ({ ...prev, [keyName]: v })}
            className={`border px-4 py-2 text-[11px] font-bold uppercase tracking-widest ${
              active === v ? "border-brand bg-brand text-brand-foreground" : "border-border"
            }`}
          >
            {v}
          </Link>
        ))}
      </div>
    </div>
  );
}

function Shop() {
  const { category, condition, brand } = Route.useSearch();
  const products = useStockedProducts();

  const filtered = products.filter(
    (p) =>
      (!category || p.category === category) &&
      (!condition || p.condition === condition) &&
      (!brand || p.brand === brand),
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-3xl font-bold uppercase tracking-tight">Shop Thrifted Sneakers</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {filtered.length} pair{filtered.length === 1 ? "" : "s"} in stock right now.
        </p>

        <div className="mt-8 space-y-5 border-y border-border py-6">
          <FilterRow title="Category" values={categories} active={category} keyName="category" />
          <FilterRow
            title="Condition"
            values={conditions.map((c) => c.label)}
            active={condition}
            keyName="condition"
          />
          <FilterRow title="Brand" values={brands} active={brand} keyName="brand" />
        </div>

        {filtered.length === 0 ? (
          <p className="py-20 text-center text-sm text-muted-foreground">
            Nothing matches those filters yet — try clearing one.
          </p>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
