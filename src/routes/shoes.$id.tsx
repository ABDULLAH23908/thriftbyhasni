import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductImageZoom } from "@/components/ProductImageZoom";
import { SizeChart } from "@/components/SizeChart";
import { AccessoriesPicker, accessoriesTotal } from "@/components/AccessoriesPicker";
import { products, store } from "@/data/products";

export const Route = createFileRoute("/shoes/$id")({
  component: ShoeDetailPage,
});

function ShoeDetailPage() {
  const { id } = Route.useParams();
  const product = products.find((p) => p.id === id);

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Pair not found</h1>
        <p className="mt-2 text-muted-foreground">
          This listing may have sold or been removed.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Back to shop</Link>
        </Button>
      </div>
    );
  }

  const addOnsTotal = accessoriesTotal(selectedAccessories);
  const grandTotal = product.price + addOnsTotal;

  function buildWhatsAppLink() {
    const lines = [
      `Hi! I'd like to order:`,
      `*${product!.name}*`,
      selectedSize ? `Size: ${selectedSize}` : `Size: (please confirm)`,
      `Condition: ${product!.condition}`,
    ];

    if (selectedAccessories.length > 0) {
      const accNames = selectedAccessories
        .map((accId) => {
          const found = ACCESSORY_LOOKUP[accId];
          return found ? found.name : accId;
        })
        .join(", ");
      lines.push(`Add-ons: ${accNames}`);
    }

    lines.push(`Total: Rs ${grandTotal.toLocaleString()}`);

    const text = encodeURIComponent(lines.join("\n"));
    const phone = store.whatsapp.replace(/[^0-9]/g, "");
    return `https://wa.me/${phone}?text=${text}`;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link
        to="/"
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
          <div className="mb-2 flex items-center gap-2">
            <Badge className="bg-highlight text-highlight-foreground hover:bg-highlight">
              {product.condition}
            </Badge>
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              {product.brand} · {product.category}
            </span>
          </div>

          <h1 className="font-display text-2xl font-bold leading-tight sm:text-3xl">
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

          {/* Size selector + size chart button */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
                Select Size
              </h3>
              <SizeChart />
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                    selectedSize === size
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-muted/50"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Accessories */}
          <div className="mt-8">
            <AccessoriesPicker
              selected={selectedAccessories}
              onChange={setSelectedAccessories}
            />
          </div>

          {/* Total + order */}
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

          <Button
            asChild
            size="lg"
            className="mt-4 w-full bg-highlight text-highlight-foreground hover:bg-highlight/90"
          >
            <a href={buildWhatsAppLink()} target="_blank" rel="noopener noreferrer">
              Order on WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

// Kept local so buildWhatsAppLink doesn't need to re-import the array —
// mirrors src/data/accessories.ts, update both if you add new items.
import { accessories } from "@/data/accessories";
const ACCESSORY_LOOKUP = Object.fromEntries(
  accessories.map((a) => [a.id, a]),
);
