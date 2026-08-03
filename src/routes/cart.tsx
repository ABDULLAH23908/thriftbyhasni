import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2, ShoppingBag } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useCart, buildCartWhatsAppMessage } from "@/lib/cart-context";
import { store } from "@/data/products";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Bag — TBH Thrift" }] }),
  component: CartPage,
});

function CartPage() {
  const { items, removeItem, subtotal, clearCart } = useCart();


  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold uppercase tracking-tight">Your bag</h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground">Your bag is empty.</p>
            <Link
              to="/shop"
              className="bg-brand px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-foreground"
            >
              Shop pairs
            </Link>
          </div>
        ) : (
          <>
            <ul className="mt-8 divide-y divide-border border-y border-border">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 py-5">
                  <img src={item.image} alt={item.name} className="h-24 w-24 object-cover" />
                  <div className="flex flex-1 flex-col">
                    <p className="font-semibold">{item.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.brand} · {item.condition} · {item.size}
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="font-bold">PKR {item.price.toLocaleString()}</span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" /> Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center justify-between border-t border-border pt-6 text-lg font-bold uppercase tracking-widest">
              <span>Subtotal</span>
              <span>PKR {subtotal.toLocaleString()}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Each pair is one of a kind — we'll confirm availability when you message us.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/checkout"
                className="flex-1 bg-brand px-6 py-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-brand-foreground hover:bg-brand/90"
              >
                Proceed to checkout
              </Link>
              <button
                onClick={clearCart}
                className="border border-border px-6 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:bg-secondary"
              >
                Clear bag
              </button>
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
