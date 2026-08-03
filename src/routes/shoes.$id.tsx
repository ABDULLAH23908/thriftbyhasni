import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Check, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductImageZoom } from "@/components/ProductImageZoom";
import { SizeChart } from "@/components/SizeChart";
import { AccessoriesPicker, accessoriesTotal } from "@/components/AccessoriesPicker";
import { products, store } from "@/data/products";
import { accessories } from "@/data/accessories";
import { useCart } from "@/lib/cart-context";

const ACCESSORY_LOOKUP = Object.fromEntries(accessories.map((a) => [a.id, a]));

export const Route = createFileRoute("/shoes/$id")({
  component: ShoeDetailPage,
});

function HighlightBox({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}:
      </p>
      <div className="mt-2 rounded-md bg-foreground px-5 py-3 text-center font-semibold text-background">
        {value}
      </div>
    </div>
  );
}

export function ShoeDetailPage() {
  const { id } = Route.useParams();
  const product = products.find((p) => p.id === id);

  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const { addItem, isInCart, openCart } = useCart();

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h1 className="font-display text-2xl font-bold">Pair not found</h1>
          <p className="mt-2 text-muted-foreground">
            This listing may have sold or been removed.
          </p>
          <Button asChild className="mt-6">
            <Link to="/">Back to shop</Link>
          </Button>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const inCart = isInCart(product.id);
  const addOnsTotal = accessoriesTotal(selectedAccessories);
  const grandTotal = product.price + addOnsTotal;

  function buildWhatsAppLink() {
    const lines = [
      `Hi! I'd like to order:`,
      `*${product!.name}*`,
      `Size: ${product!.sizes.join(" / ")}`,
      `Condition: ${product!.condition}`,
    ];

    if (selectedAccessories.length > 0) {
      lines.push(``, `Add-ons:`);
      selectedAccessories.forEach((accId) => {
        const found = ACCESSORY_LOOKUP[accId];
        lines.push(`- ${found ? found.name : accId}`);
      });
    }

    lines.push(``, `Total: Rs ${grandTotal.toLocaleString()}`);

    const text = encodeURIComponent(lines.join("\n"));
    const phone = store.whatsapp.replace(/[^0-9]/g, "");
    return `https://wa.me/${phone}?text=${text}`;
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Link
          to="/shop"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to all pairs
        </Link>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Image with magnifier */}
          <div className="aspect-square w-full rounded-lg border border-border bg-card">
            <ProductImageZoom src={product.image} alt={product.name} />
          </div>

          {/* Details */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {product.brand} · {product.category}
            </p>

            <h1 className="mt-1 font-display text-2xl font-bold leading-tight sm:text-3xl">
              {product.name}
            </h1>

            <div className="mt-3 flex items-baseline gap-3">
              <span className="font-display text-2xl font-bold">
                PKR {product.price.toLocaleString()}
              </span>
              {product.oldPrice && (
                <span className="text-muted-foreground line-through">
                  {product.oldPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Static highlight boxes — thrift stock, one exact pair, not a size picker */}
            <div className="mt-6 flex flex-wrap gap-6">
              <HighlightBox label="Size" value={product.sizes.join(" / ")} />
              <HighlightBox label="Condition" value={product.condition} />
              {product.color && <HighlightBox label="Color" value={product.color} />}
            </div>

            <div className="mt-4">
              <SizeChart />
            </div>

            {/* Accessories */}
            <div className="mt-8">
              <AccessoriesPicker
                selected={selectedAccessories}
                onChange={setSelectedAccessories}
              />
            </div>

            {/* Total */}
            <div className="mt-8 rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Pair</span>
                <span>Rs {product.price.toLocaleString()}</span>
              </div>
              {addOnsTotal > 0 && (
                <div className="mt-1 flex items-center justify-between text-sm text-muted-foreground">
                  <span>Add-ons</span>
                  <span>Rs {addOnsTotal.toLocaleString()}</span>
                </div>
              )}
              <div className="mt-2 flex items-center justify-between border-t border-border pt-2 font-display text-base font-bold">
                <span>Total</span>
                <span>Rs {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Add to bag — same size as Order on WhatsApp, sits right above it */}
            <Button
              onClick={() => (inCart ? openCart() : addItem(product))}
              size="lg"
              className={`mt-4 w-full ${
                inCart
                  ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  : "bg-brand text-brand-foreground hover:bg-brand/90"
              }`}
            >
              {inCart ? (
                <>
                  <Check className="h-4 w-4" /> In your bag
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" /> Add to bag
                </>
              )}
            </Button>

            <Button
              asChild
              size="lg"
              className="mt-3 w-full bg-highlight text-highlight-foreground hover:bg-highlight/90"
            >
              <a href={buildWhatsAppLink()} target="_blank" rel="noopener noreferrer">
                Order on WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

export default ShoeDetailPage;
