import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { listAdminStock, setProductStock } from "@/lib/product.functions";
import { products as catalog } from "@/data/products";
import { HIDE_AFTER_MS } from "@/lib/stock";

export const Route = createFileRoute("/_authenticated/admin/products")({
  head: () => ({
    meta: [
      { title: "Products — Thrift by Hasni Admin" },
      { name: "description", content: "Mark pairs as sold or put them back in stock." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Products — Thrift by Hasni Admin" },
      { property: "og:description", content: "Mark pairs as sold or put them back in stock." },
    ],
  }),
  component: AdminProducts,
});

function AdminProducts() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchStock = useServerFn(listAdminStock);
  const updateStock = useServerFn(setProductStock);

  const { data: stock, isLoading } = useQuery({
    queryKey: ["admin-stock"],
    queryFn: () => fetchStock(),
  });

  const mutation = useMutation({
    mutationFn: (vars: { id: string; status: "available" | "sold" }) =>
      updateStock({ data: { productIds: [vars.id], status: vars.status } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-stock"] });
      await queryClient.invalidateQueries({ queryKey: ["product-stock"] });
    },
  });

  const stockMap = new Map((stock ?? []).map((row) => [row.id, row]));

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
          "Mark sold" instantly greys the pair out on the home page, the shop grid and its product
          page — and after 24 hours it disappears from the site completely. If an order cancels or
          falls through, hit "Put back in stock" and the pair is on sale again right away.
        </p>

        {mutation.isError && (
          <p className="mb-4 border border-destructive bg-destructive/5 px-4 py-2 text-sm text-destructive">
            Could not update this pair. Make sure you are still signed in as admin.
          </p>
        )}

        {isLoading && <p className="text-sm text-muted-foreground">Loading stock…</p>}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {catalog.map((product) => {
            const row = stockMap.get(product.id);
            const status = row?.status ?? (product.sold ? "sold" : "available");
            const sold = status === "sold";
            const reserved = status === "reserved";
            const hidden =
              sold && row?.soldAt
                ? Date.now() - new Date(row.soldAt).getTime() > HIDE_AFTER_MS
                : false;
            const pending = mutation.isPending && mutation.variables?.id === product.id;

            return (
              <article key={product.id} className="flex flex-col border border-border bg-card">
                <div className="relative aspect-square overflow-hidden bg-secondary">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className={`h-full w-full object-cover ${sold || reserved ? "opacity-60 grayscale" : ""}`}
                  />
                  {(sold || reserved) && (
                    <span className="absolute inset-0 grid place-items-center bg-black/60 text-xs font-bold uppercase tracking-[0.2em] text-white">
                      {reserved ? "Reserved" : "Sold out"}
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
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    {reserved
                      ? "Reserved by a pending order"
                      : sold
                        ? hidden
                          ? "Sold · hidden from the site"
                          : "Sold · showing for 24 hours"
                        : "In stock"}
                  </p>
                  <button
                    onClick={() =>
                      mutation.mutate({
                        id: product.id,
                        status: sold || reserved ? "available" : "sold",
                      })
                    }
                    disabled={pending}
                    className={`mt-3 inline-flex justify-center px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-colors disabled:cursor-wait disabled:opacity-60 ${
                      sold || reserved
                        ? "bg-brand text-brand-foreground hover:bg-brand/90"
                        : "border border-destructive text-destructive hover:bg-destructive/10"
                    }`}
                  >
                    {pending
                      ? "Updating…"
                      : sold || reserved
                        ? "Put back in stock"
                        : "Mark sold"}
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
