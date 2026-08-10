import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import logoWhite from "@/assets/logo-white.png";
import { announcement, store } from "@/data/products";
import { useCart } from "@/lib/cart-context";

export function SiteHeader() {
  const { count, toggleCart } = useCart();

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-highlight px-4 py-1.5 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-highlight-foreground">
        {announcement}
      </div>
      <div className="bg-brand text-brand-foreground">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link to="/" className="shrink-0">
            <img src={logoWhite} alt={`${store.name} logo`} className="h-7 w-auto" />
          </Link>
          <nav className="hidden items-center gap-6 text-xs font-semibold uppercase tracking-widest md:flex">
            <Link to="/shop" className="opacity-80 transition-opacity hover:opacity-100">
              Shop All
            </Link>
            <Link
              to="/shop"
              search={{ category: "Men" }}
              className="opacity-80 transition-opacity hover:opacity-100"
            >
              Men
            </Link>
            <Link
              to="/shop"
              search={{ category: "Women" }}
              className="opacity-80 transition-opacity hover:opacity-100"
            >
              Women
            </Link>
            <Link
              to="/shop"
              search={{ category: "Kids" }}
              className="opacity-80 transition-opacity hover:opacity-100"
            >
              Kids
            </Link>
            <Link to="/reviews" className="opacity-80 transition-opacity hover:opacity-100">
              Reviews
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={toggleCart}
              aria-label="Open cart"
              className="relative rounded-sm p-2 opacity-90 transition-opacity hover:opacity-100"
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-highlight text-[10px] font-bold text-highlight-foreground">
                  {count}
                </span>
              )}
            </button>
            <a
              href={`https://wa.me/${store.whatsapp.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-sm bg-highlight px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-highlight-foreground transition-transform hover:-translate-y-0.5"
            >
              Order on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
