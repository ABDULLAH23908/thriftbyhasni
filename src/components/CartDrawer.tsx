import { Link } from "@tanstack/react-router";
import { X, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, subtotal } = useCart();


  return (
    <>
      <div
        onClick={closeCart}
        className={`fixed inset-0 z-[60] bg-foreground/40 transition-opacity ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-full max-w-sm flex-col bg-card shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em]">Your bag ({items.length})</h2>
          <button onClick={closeCart} aria-label="Close cart">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-muted-foreground">
              <ShoppingBag className="h-8 w-8 opacity-40" />
              Your bag is empty.
              <Link
                to="/shop"
                onClick={closeCart}
                className="text-xs font-bold uppercase tracking-widest text-brand underline underline-offset-4"
              >
                Browse pairs
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => {
                const addOnsTotal = item.addOns?.reduce((s, a) => s + a.price, 0) ?? 0;
                return (
                <li key={item.id} className="flex gap-3 border-b border-border pb-4">
                  <img src={item.image} alt={item.name} className="h-20 w-20 shrink-0 object-cover" />
                  <div className="flex flex-1 flex-col">
                    <p className="text-sm font-semibold leading-snug">{item.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.condition} · {item.size}
                    </p>
                    {item.addOns && item.addOns.length > 0 && (
                      <ul className="mt-1 space-y-0.5 text-[11px] text-muted-foreground">
                        {item.addOns.map((a) => (
                          <li key={a.id}>+ {a.name} (Rs {a.price.toLocaleString()})</li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <span className="text-sm font-bold">
                        PKR {(item.price + addOnsTotal).toLocaleString()}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        aria-label="Remove from bag"
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border px-5 py-4">
            <div className="flex items-center justify-between text-sm font-bold uppercase tracking-widest">
              <span>Subtotal</span>
              <span>PKR {subtotal.toLocaleString()}</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Each pair is one of a kind — we'll confirm it's still available on WhatsApp.
            </p>
            <Link
              to="/checkout"
              onClick={closeCart}
              className="mt-4 flex items-center justify-center bg-brand px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-foreground transition-colors hover:bg-brand/90"
            >
              Proceed to checkout
            </Link>
            <Link
              to="/cart"
              onClick={closeCart}
              className="mt-2 block text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              View full bag
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
