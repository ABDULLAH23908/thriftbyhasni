import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { markProductsSoldInFile } from "@/lib/product.functions";
import { products as staticProducts } from "@/data/products";

export const Route = createFileRoute("/_authenticated/admin/products")({
  head: () => ({
    meta: [
      { title: "Products — Thrift by Hasni Admin" },
      { name: "description", content: "Mark pairs as sold or available." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Products — Thrift by Hasni Admin" },
      { property: "og:description", content: "Mark pairs as sold or available." },
    ],
  }),
  component: AdminProducts,
});

function AdminProducts() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mutate = useServerFn(markProductsSoldInFile);

  // Local optimistic view of sold state, keyed by product id. The real
  // source of truth is src/data/products.ts on disk — this state just lets
  // the toggle feel instant without needing a full page reload.
  const [soldOverrides, setSoldOverrides] = useState<Record<string, boolean>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function isSold(id: string, fileSold: boolean | undefined) {
    return soldOverrides[id] ?? Boolean(fileSold);
  }

  async function toggle(id: string, current: boolean) {
    setPendingId(id);
    setError(null);
    try {
      const result = await mutate({ data: { productIds: [id], sold: !current } });
      if (!result.success) {
        setError(result.error ?? "Could not update this product.");
        return;
      }
      setSoldOverrides((prev) => ({ ...prev, [id]: !current }));
    } catch (err) {
      console.error(err);
      setError("Could not update this product. Make sure you are signed in as admin.");
    } finally {
      setPendingId(null);
    }
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-4 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-sm font-bold uppercase tracking-[0.2em]">Products</h1>
          <div className="flex items-center gap-4">
            <Link
              to="/admin/orders"
              className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              Orders
            </Link>
            <Link to="/" className="text-[11px] font-bold uppercase tracking-widest">
              Storefront
            </Link>
            <button
              onClick={signOut}
              className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <p className="mb-6 max-w-2xl text-xs text-muted-foreground">
          Toggling a pair here edits <code className="font-mono">src/data/products.ts</code> directly
          — the same file you edit by hand to add new products, so both stay in sync. A "Sold" pair
          is greyed out and disabled everywhere it's listed on the site; toggle it again any time to
          put it back on sale.
        </p>

        {error && (
          <p className="mb-4 border border-destructive bg-destructive/5 px-4 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {staticProducts.map((product) => {
            const sold = isSold(product.id, product.sold);
            const pending = pendingId === product.id;
            return (
              <article key={product.id} className="flex flex-col border border-border bg-card">
                <div className="relative aspect-square overflow-hidden bg-secondary">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className={`h-full w-full object-cover ${sold ? "opacity-60 grayscale" : ""}`}
                  />
                  {sold && (
                    <span className="absolute inset-0 grid place-items-center bg-black/60 text-xs font-bold uppercase tracking-[0.2em] text-white">
                      Sold out
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {product.brand} · {product.category}
                  </p>
                  <h3 className="text-sm font-semibold leading-snug">{product.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    PKR {product.price.toLocaleString()}
                  </p>
                  <button
                    onClick={() => toggle(product.id, sold)}
                    disabled={pending}
                    className={`mt-3 inline-flex justify-center px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-colors disabled:cursor-wait disabled:opacity-60 ${
                      sold
                        ? "bg-brand text-brand-foreground hover:bg-brand/90"
                        : "border border-destructive text-destructive hover:bg-destructive/10"
                    }`}
                  >
                    {pending ? "Updating…" : sold ? "Mark available" : "Mark sold"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}
