import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png";
import { store, brands } from "@/data/products";

export function SiteFooter() {
  return (
    <footer className="bg-highlight text-highlight-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <img src={logo} alt={`${store.name} logo`} className="h-8 w-auto" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            Hand-picked thrifted sneakers, graded honestly and priced fairly. One pair, one owner,
            one price.
          </p>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em]">Visit &amp; contact</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href={store.mapsUrl} target="_blank" rel="noreferrer" className="underline">
                {store.address}
              </a>
            </li>
            <li>{store.hours}</li>
            <li>
              <a href={`tel:${store.phone.replace(/\s/g, "")}`} className="underline">
                {store.phone}
              </a>
            </li>
            <li>{store.email}</li>
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em]">Brands we stock</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {brands.slice(0, 5).map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em]">Support</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>Sizing &amp; fit guide</li>
            <li>Shipping across Pakistan</li>
            <li>
              <a href={store.instagram} target="_blank" rel="noreferrer" className="underline">
                Instagram
              </a>
            </li>
            <li>
              <Link to="/policies" className="underline">
                Terms &amp; Refund Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-highlight-foreground/15 py-5 text-center text-xs">
        <span>
          © {new Date().getFullYear()} {store.name}. All rights reserved.
        </span>
        <span className="mx-2">·</span>
        <Link to="/policies" className="underline">
          Terms &amp; Refund Policy
        </Link>
      </div>
    </footer>
  );
}
