import { Link, useNavigate } from "@tanstack/react-router";
import { Check, ShoppingBag } from "lucide-react";
import type { Product } from "@/data/products";
import { useCart } from "@/lib/cart-context";

const conditionTone: Record<string, string> = {
  "Premium+": "bg-brand text-brand-foreground",
  Premium: "bg-highlight text-highlight-foreground",
  Excellence: "bg-secondary text-secondary-foreground",
  "Very Good": "bg-muted text-muted-foreground",
};

export function ProductCard({ product }: { product: Product }) {
  const { addItem, isInCart, openCart } = useCart();
  const navigate = useNavigate();
  const inCart = isInCart(product.id);

  function handleBuyNow() {
    if (!inCart) addItem(product);
    navigate({ to: "/checkout" });
  }

  return (
    <article
      className={`group flex flex-col overflow-hidden border border-border bg-card transition-all ${
        product.sold ? "opacity-60 grayscale" : ""
      }`}
    >
      <Link
        to="/shoes/$id"
        params={{ id: product.id }}
        tabIndex={product.sold ? -1 : 0}
        className={product.sold ? "pointer-events-none" : ""}
      >
        <div className="relative aspect-square overflow-hidden bg-secondary">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span
            className={`absolute left-0 top-3 px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
              conditionTone[product.condition] ?? "bg-muted text-muted-foreground"
            }`}
          >
            {product.condition}
          </span>
          {product.sold && (
            <span className="absolute inset-0 grid place-items-center bg-black/60 text-xs font-bold uppercase tracking-[0.2em] text-white">
              Sold out
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {product.brand} · {product.category}
        </p>
        
        <Link
          to="/shoes/$id"
          params={{ id: product.id }}
          tabIndex={product.sold ? -1 : 0}
          className={product.sold ? "pointer-events-none" : ""}
        >
          <h3 className={`mt-1 text-base font-semibold leading-snug ${!product.sold && "hover:underline"}`}>
            {product.name}
          </h3>
        </Link>
        
        <p className="mt-1 text-xs text-muted-foreground"> {product.sizes.join(" · ")}</p>
        
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold">PKR {product.price.toLocaleString()}</span>
          {product.oldPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {product.oldPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-col gap-2">
          {product.sold ? (
            <button
              disabled
              className="inline-flex justify-center bg-muted px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground cursor-not-allowed"
            >
              Sold Out
            </button>
          ) : (
            <>
              <button
                onClick={() => (inCart ? openCart() : addItem(product))}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-colors ${
                  inCart
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-brand text-brand-foreground hover:bg-brand/90"
                }`}
              >
                {inCart ? (
                  <>
                    <Check className="h-3.5 w-3.5" /> In your bag
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-3.5 w-3.5" /> Add to bag
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                className="inline-flex justify-center bg-highlight px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-highlight-foreground transition-colors hover:bg-highlight/90"
              >
                Buy Now
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
