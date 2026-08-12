import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { listOrders, updateOrderState } from "@/lib/admin.functions";
import { getPaymentMethod } from "@/data/payment";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  head: () => ({
    meta: [
      { title: "Orders — Thrift by Hasni Admin" },
      { name: "description", content: "Manage incoming Thrift by Hasni orders." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Orders — Thrift by Hasni Admin" },
      { property: "og:description", content: "Manage incoming orders." },
    ],
  }),
  component: AdminOrders,
});

const statusTone: Record<string, string> = {
  pending: "bg-highlight text-highlight-foreground",
  advance_verified: "bg-brand text-brand-foreground",
  cancelled: "bg-muted text-muted-foreground",
  processing: "bg-secondary text-secondary-foreground",
  fulfilled: "bg-brand text-brand-foreground",
};

const methodTone: Record<string, string> = {
  cod: "bg-secondary text-secondary-foreground",
  full: "bg-brand text-brand-foreground",
  ceo: "bg-highlight text-highlight-foreground",
};

function AdminOrders() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchOrders = useServerFn(listOrders);
  const mutate = useServerFn(updateOrderState);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => fetchOrders(),
  });

  async function act(
    orderId: string,
    payload: { paymentStatus?: "advance_verified"; orderStatus?: "fulfilled" | "cancelled" },
  ) {
    await mutate({ data: { orderId, ...payload } });
    await queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
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
          <h1 className="text-sm font-bold uppercase tracking-[0.2em]">Orders</h1>
          <div className="flex items-center gap-4">
            <Link
              to="/admin/products"
              className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              Products
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
        {isLoading && <p className="text-sm text-muted-foreground">Loading orders…</p>}
        {error && (
          <p className="text-sm text-destructive">
            Could not load orders. Make sure you are signed in as the admin account.
          </p>
        )}
        {data && data.length === 0 && (
          <p className="text-sm text-muted-foreground">No orders yet.</p>
        )}

        <div className="space-y-4">
          {data?.map((order) => (
            <article key={order.id} className="border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{order.customer_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.phone} · {order.city}
                  </p>
                  <p className="mt-1 max-w-md text-xs text-muted-foreground">{order.address}</p>
                  {order.notes && <p className="mt-1 text-xs italic">“{order.notes}”</p>}
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                  <p className="mt-1 text-lg font-bold">Rs {order.total.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    Pairs Rs {order.subtotal.toLocaleString()} + delivery Rs{" "}
                    {order.delivery_fee.toLocaleString()}
                  </p>
                  <p className="text-xs font-semibold text-brand">
                    Advance Rs {order.advance_amount.toLocaleString()}
                  </p>
                </div>
              </div>

              <ul className="mt-4 space-y-1 border-y border-border py-3 text-sm">
                {order.items.map((item) => (
                  <li key={item.product_id} className="flex justify-between gap-3">
                    <span>
                      {item.name}{" "}
                      <span className="text-xs text-muted-foreground">
                        ({item.condition} · {item.size})
                      </span>
                    </span>
                    <span className="font-semibold">Rs {Number(item.price).toLocaleString()}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span
                  className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                    methodTone[order.payment_method] ?? "bg-muted"
                  }`}
                >
                  {getPaymentMethod(order.payment_method as "cod" | "full" | "ceo").label}
                </span>
                <span
                  className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                    statusTone[order.payment_status] ?? "bg-muted"
                  }`}
                >
                  payment: {order.payment_status.replace("_", " ")}
                </span>
                <span
                  className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                    statusTone[order.order_status] ?? "bg-muted"
                  }`}
                >
                  order: {order.order_status}
                </span>
                <span className="text-xs text-muted-foreground">
                  NayaPay ref: {order.advance_reference ?? "—"}
                </span>
                {order.proof_url && (
                  <a
                    href={order.proof_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold uppercase tracking-widest underline"
                  >
                    View screenshot
                  </a>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {order.payment_status === "pending" && order.order_status === "processing" && (
                  <button
                    onClick={() => act(order.id, { paymentStatus: "advance_verified" })}
                    className="bg-brand px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-brand-foreground"
                  >
                    Mark advance verified
                  </button>
                )}
                {order.order_status === "processing" && (
                  <>
                    <button
                      onClick={() => act(order.id, { orderStatus: "fulfilled" })}
                      className="border border-border px-4 py-2 text-[11px] font-bold uppercase tracking-widest"
                    >
                      Mark fulfilled
                    </button>
                    <button
                      onClick={() => act(order.id, { orderStatus: "cancelled" })}
                      className="border border-destructive px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-destructive"
                    >
                      Cancel &amp; relist pairs
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
