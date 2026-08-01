import { Link } from "@tanstack/react-router";
import type { Product } from "@/data/products";
import { store } from "@/data/products";

const conditionTone: Record<string, string> = {
  "Premium+": "bg-brand text-brand-foreground",
  Premium: "bg-highlight text-highlight-foreground",
  Excellence: "bg-secondary text-secondary-foreground",
  "Very Good": "bg-muted text-muted-foreground",
};

export function ProductCard({ product }: { product: Product }) {
  const waLink = `https://wa.me/${store.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    `Hi ${store.name}, I want the ${product.name} (${product.condition}) — PKR ${product.price.toLocaleString()}`,
  )}`;

  return (
    <article className="group flex flex-col overflow-hidden border border-border bg-card">
      <Link to="/shoes/$id" params={{ id: product.id }}>
        <div className="relative aspect-square overflow-hidden bg-secondary">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span
            className={`absolute left-0 top-3 px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${conditionTone[product.condition]}`}
          >
            {product.condition}
          </span>
          {product.sold && (
            <span className="absolute inset-0 grid place-items-center bg-brand/70 text-sm font-bold uppercase tracking-[0.2em] text-brand-foreground">
              Sold out
            </span>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {product.brand} · {product.category}
        </p>
        <Link to="/shoes/$id" params={{ id: product.id }}>
          <h3 className="mt-1 text-base font-semibold leading-snug hover:underline">
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
        {!product.sold && (
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex justify-center bg-brand px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-brand-foreground transition-colors hover:bg-brand/90"
          >
            Order this pair
          </a>
        )}
      </div>
    </article>
  );
}
