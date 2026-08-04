import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Check, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductImageZoom } from "@/components/ProductImageZoom";
import { SizeChart } from "@/components/SizeChart";
import { AccessoriesPicker, accessoriesTotal } from "@/components/AccessoriesPicker";
import { productStockQuery, useStockedProduct } from "@/lib/stock";
import { accessories } from "@/data/accessories";
import { useCart } from "@/lib/cart-context";

const ACCESSORY_LOOKUP = Object.fromEntries(accessories.map((a) => [a.id, a]));

export const Route = createFileRoute("/shoes/$id")({
  loader: ({ context }) => context.queryClient.ensureQueryData(productStockQuery),
  errorComponent: () => (
    <p className="p-10 text-center text-sm text-muted-foreground">
      Could not load this pair. Please refresh.
    </p>
  ),
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
  const product = useStockedProduct(id);

  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const { addItem, isInCart, openCart } = useCart();
  const navigate = useNavigate();

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

  const isSoldOut = Boolean(product.sold);
  const inCart = isInCart(product.id);
  const addOnsTotal = accessoriesTotal(selectedAccessories);
  const grandTotal = product.price + addOnsTotal;

  const selectedAddOns = selectedAccessories
    .map((id) => ACCESSORY_LOOKUP[id])
    .filter(Boolean);

  function handleBuyNow() {
    if (isSoldOut) return;
    addItem(product!, { addOns: selectedAddOns });
    navigate({ to: "/checkout" });
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
          {/* Image Container with Sold Out state */}
          <div
            className={`relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-card ${
              isSoldOut ? "opacity-60 grayscale" : ""
            }`}
          >
            <ProductImageZoom src={product.image} alt={product.name} />
            {isSoldOut && (
              <div className="absolute inset-0 grid place-items-center bg-black/50 pointer-events-none">
                <span className="bg-destructive text-destructive-foreground px-4 py-2 text-sm font-bold uppercase tracking-[0.2em] rounded">
                  Sold Out
                </span>
              </div>
            )}
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

            {/* Static highlight boxes */}
            <div className="mt-6 flex flex-wrap gap-6">
              <HighlightBox label="Size" value={product.sizes.join(" / ")} />
              <HighlightBox label="Condition" value={product.condition} />
              {product.color && <HighlightBox label="Color" value={product.color} />}
            </div>

            <div className="mt-4">
              <SizeChart />
            </div>

            {/* Accessories Picker (Disabled if sold out) */}
            <div className={`mt-8 ${isSoldOut ? "pointer-events-none opacity-50" : ""}`}>
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

            {/* Action Buttons */}
            {isSoldOut ? (
              <Button
                disabled
                size="lg"
                className="mt-4 w-full bg-muted text-muted-foreground cursor-not-allowed uppercase font-bold tracking-widest"
              >
                Sold Out
              </Button>
            ) : (
              <>
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
                  onClick={handleBuyNow}
                  size="lg"
                  className="mt-3 w-full bg-highlight text-highlight-foreground hover:bg-highlight/90"
                >
                  Buy Now
                </Button>
              </>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

export default ShoeDetailPage;
