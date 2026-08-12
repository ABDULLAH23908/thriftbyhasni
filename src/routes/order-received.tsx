import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getPaymentMethod } from "@/data/payment";
import { store } from "@/data/products";
import { WHATSAPP_PENDING_KEY } from "@/lib/whatsapp";

export const Route = createFileRoute("/order-received")({
  validateSearch: z.object({
    id: z.string().optional(),
    method: z.enum(["cod", "full", "ceo"]).optional(),
    advance: z.coerce.number().optional(),
  }),
  head: () => ({
    meta: [
      { title: "Order Received — Thrift by Hasni" },
      {
        name: "description",
        content:
          "Your thrift order is in. We'll confirm your NayaPay advance and reach out shortly.",
      },
      { property: "og:title", content: "Order Received — Thrift by Hasni" },
      { property: "og:description", content: "Your order is in — we'll confirm shortly." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderReceived,
});

function OrderReceived() {
  const { id, method, advance } = Route.useSearch();
  const paymentMethod = getPaymentMethod(method ?? "cod");
  const advanceAmount = advance ?? 0;
  const [waUrl, setWaUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      setWaUrl(sessionStorage.getItem(WHATSAPP_PENDING_KEY));
    } catch {
      /* storage unavailable */
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-xl px-4 py-20 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-brand" />
        <h1 className="mt-6 text-3xl font-bold uppercase tracking-tight">Order received</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          We&apos;ll confirm your {advanceAmount > 0 ? `Rs ${advanceAmount.toLocaleString()} ` : ""}
          {paymentMethod.label.toLowerCase()} payment and reach out on WhatsApp or phone shortly.
        </p>
        {paymentMethod.id === "ceo" && (
          <p className="mt-2 text-xs font-semibold text-brand">
            Yes, really — the CEO is personally handling this delivery. 🚗
          </p>
        )}
        {id && (
          <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">
            Order reference: {id.slice(0, 8)}
          </p>
        )}
        {waUrl && (
          <div className="mt-8 border-2 border-brand bg-secondary/40 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em]">One last step</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Tap below to send us your order details on WhatsApp — this is how we confirm your
              payment and get your order moving.
            </p>
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block bg-highlight px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-highlight-foreground"
            >
              Send order details on WhatsApp
            </a>
          </div>
        )}
        <p className="mt-6 text-xs text-muted-foreground">
          Questions? Call {store.phone} or message us on WhatsApp.
        </p>

        <Link
          to="/shop"
          className="mt-8 inline-block bg-brand px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-foreground"
        >
          Keep browsing
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
