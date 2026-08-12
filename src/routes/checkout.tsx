import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useCart } from "@/lib/cart-context";
import { getCartProducts } from "@/lib/catalog.functions";
import { placeOrder } from "@/lib/orders.functions";
import { resolveProductImage } from "@/data/product-images";
import {
  payment,
  paymentMethods,
  advanceAmountFor,
  deliveryFeeFor,
  type PaymentMethodId,
} from "@/data/payment";
import { buildOrderWhatsAppUrl, WHATSAPP_PENDING_KEY } from "@/lib/whatsapp";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Thrift by Hasni" },
      {
        name: "description",
        content:
          "Confirm your thrifted sneakers — choose cash on delivery, pay in full, or CEO delivery, and confirm with a NayaPay advance.",
      },
      { property: "og:title", content: "Checkout — Thrift by Hasni" },
      {
        property: "og:description",
        content:
          "Cash on delivery, full prepayment, or CEO delivery — confirm with a NayaPay advance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Checkout,
});

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error("Could not read the file"));
    reader.readAsDataURL(file);
  });
}

function Checkout() {
  const navigate = useNavigate();
  const { items, clearCart, removeItem } = useCart();
  const submitOrder = useServerFn(placeOrder);
  const fetchProducts = useServerFn(getCartProducts);

  const ids = items.map((i) => i.id);
  const { data: fresh, isLoading } = useQuery({
    queryKey: ["cart-products", ids.join(",")],
    queryFn: () => fetchProducts({ data: { ids } }),
    enabled: ids.length > 0,
  });

  const available = (fresh ?? []).filter((p) => p.status === "available");
  const goneIds = ids.filter((id) => !available.some((p) => p.id === id));

  // Compute subtotal including add-ons
  const subtotal = available.reduce((sum, p) => {
    const cartItem = items.find((i) => i.id === p.id);
    const addOnsTotal = cartItem?.addOns?.reduce((aSum, a) => aSum + a.price, 0) ?? 0;
    return sum + p.price + addOnsTotal;
  }, 0);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("cod");
  const deliveryFee = deliveryFeeFor(paymentMethod);
  const total = subtotal + deliveryFee;
  const advanceAmount = advanceAmountFor(paymentMethod, subtotal);
  const remainingOnDelivery = total - advanceAmount;

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
    advanceReference: "",
  });
  const [proof, setProof] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const set =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (available.length === 0) return;
    setBusy(true);
    setMessage("");

    let proofPayload: {
      name: string;
      type: "image/jpeg" | "image/png" | "image/webp";
      base64: string;
    } | null = null;
    if (proof) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(proof.type)) {
        setBusy(false);
        setMessage("Screenshot must be a JPG, PNG or WEBP image.");
        return;
      }
      proofPayload = {
        name: proof.name,
        type: proof.type as "image/jpeg" | "image/png" | "image/webp",
        base64: await readFileAsBase64(proof),
      };
    }

    try {
      const result = await submitOrder({
        data: {
          ...form,
          paymentMethod,
          items: available.map((p) => {
            const cartItem = items.find((i) => i.id === p.id);
            return {
              productId: p.id,
              size: cartItem?.size ?? p.sizes[0] ?? "",
              addOns: cartItem?.addOns ?? [],
            };
          }),
          proof: proofPayload,
        },
      });

      if (result.ok) {
        const waUrl = buildOrderWhatsAppUrl({
          orderId: result.orderId,
          ...form,
          subtotal,
          total,
          paymentMethod,
          advanceAmount,
          items: available.map((p) => {
            const cartItem = items.find((i) => i.id === p.id);
            const addOns = cartItem?.addOns ?? [];
            return {
              name: p.name,
              size: cartItem?.size ?? p.sizes[0] ?? "",
              condition: p.condition,
              price: p.price + addOns.reduce((sum, a) => sum + a.price, 0),
              addOns,
            };
          }),
        });
        try {
          sessionStorage.setItem(WHATSAPP_PENDING_KEY, waUrl);
        } catch {
          /* storage unavailable */
        }
        // Opened inside the submit gesture so the browser doesn't block it.
        window.open(waUrl, "_blank", "noopener,noreferrer");
        clearCart();
        navigate({
          to: "/order-received",
          search: { id: result.orderId, method: paymentMethod, advance: advanceAmount },
        });
        return;
      }

      if (result.error === "sold_out") {
        setMessage("Sorry, this pair was just sold. Taking you back to the shop…");
        setTimeout(() => navigate({ to: "/shop" }), 2200);
      } else {
        setMessage(result.message);
      }
    } catch {
      setMessage("Something went wrong placing the order. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-3xl font-bold uppercase tracking-tight">Checkout</h1>

        {items.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-muted-foreground">Your bag is empty.</p>
            <Link
              to="/shop"
              className="mt-6 inline-block bg-brand px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-foreground"
            >
              Shop pairs
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
            {/* Order summary */}
            <section>
              <h2 className="text-sm font-bold uppercase tracking-[0.2em]">Your pairs</h2>
              {isLoading && <p className="mt-4 text-sm text-muted-foreground">Checking stock…</p>}

              <ul className="mt-4 divide-y divide-border border-y border-border">
                {available.map((p) => {
                  const cartItem = items.find((i) => i.id === p.id);
                  const addOnsTotal = cartItem?.addOns?.reduce((sum, a) => sum + a.price, 0) ?? 0;
                  const itemTotal = p.price + addOnsTotal;

                  return (
                    <li key={p.id} className="flex gap-4 py-4">
                      <img
                        src={resolveProductImage(p.image)}
                        alt={p.name}
                        className="h-20 w-20 object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{p.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {p.condition} · {cartItem?.size ?? p.sizes[0]}
                        </p>

                        {/* Add-ons Checklist */}
                        {cartItem?.addOns && cartItem.addOns.length > 0 && (
                          <div className="mt-2 border-l-2 border-brand/50 pl-2 text-xs text-muted-foreground">
                            <span className="font-bold text-foreground">Included Add-ons:</span>
                            <ul className="mt-0.5 space-y-0.5">
                              {cartItem.addOns.map((addon) => (
                                <li key={addon.id} className="flex justify-between">
                                  <span>+ {addon.name}</span>
                                  <span>Rs {addon.price.toLocaleString()}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-bold">Rs {itemTotal.toLocaleString()}</span>
                    </li>
                  );
                })}
              </ul>

              {goneIds.length > 0 && (
                <div className="mt-4 border border-destructive/40 bg-destructive/5 p-4 text-xs">
                  <p className="font-bold uppercase tracking-widest text-destructive">
                    No longer available
                  </p>
                  {goneIds.map((id) => (
                    <p key={id} className="mt-2">
                      {items.find((i) => i.id === id)?.name ?? id} was just sold.{" "}
                      <button
                        type="button"
                        onClick={() => removeItem(id)}
                        className="font-bold underline"
                      >
                        Remove
                      </button>
                    </p>
                  ))}
                </div>
              )}

              {/* Payment method selector */}
              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em]">
                  How do you want to pay?
                </p>
                <div className="mt-3 space-y-2">
                  {paymentMethods.map((m) => {
                    const selected = paymentMethod === m.id;
                    return (
                      <label
                        key={m.id}
                        className={`flex cursor-pointer items-start gap-3 border p-3 text-sm transition-colors ${
                          selected
                            ? "border-brand bg-brand/5"
                            : "border-border hover:border-foreground/40"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={m.id}
                          checked={selected}
                          onChange={() => setPaymentMethod(m.id)}
                          className="mt-1 accent-brand"
                        />
                        <span>
                          <span className="flex items-center gap-2">
                            <span className="font-bold">{m.label}</span>
                            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                              {m.tagline}
                            </span>
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {m.description}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <dl className="mt-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt>Subtotal (pairs & add-ons)</dt>
                  <dd className="font-semibold">Rs {subtotal.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>{paymentMethod === "ceo" ? "CEO delivery fee" : "Delivery fee"}</dt>
                  <dd className="font-semibold">Rs {deliveryFee.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-base font-bold uppercase tracking-widest">
                  <dt>Total</dt>
                  <dd>Rs {total.toLocaleString()}</dd>
                </div>
              </dl>

              <div className="mt-6 border border-border bg-secondary/40 p-5 text-sm">
                <p className="text-xs font-bold uppercase tracking-[0.2em]">
                  {paymentMethod === "full"
                    ? "Full payment — how it works"
                    : paymentMethod === "ceo"
                      ? "CEO delivery — how it works"
                      : "Cash on delivery — how it works"}
                </p>
                <p className="mt-3">
                  {paymentMethod === "full" ? (
                    <>
                      Pay the full <strong>Rs {total.toLocaleString()}</strong> via NayaPay now to
                      confirm your order. Nothing to pay when it arrives.
                    </>
                  ) : (
                    <>
                      The <strong>Rs {advanceAmount.toLocaleString()}</strong>{" "}
                      {paymentMethod === "ceo" ? "CEO delivery fee" : "delivery fee"} is paid in
                      advance via NayaPay to confirm your order. The remaining amount (
                      <strong>Rs {remainingOnDelivery.toLocaleString()}</strong>) is paid in cash
                      when your order arrives
                      {paymentMethod === "ceo" ? " — by the CEO, in person" : ""}.
                    </>
                  )}
                </p>
                <div className="mt-4 border-t border-border pt-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Send Rs {advanceAmount.toLocaleString()} to
                  </p>
                  <p className="mt-1 font-bold">NayaPay {payment.nayaPayNumber}</p>
                  <p className="text-xs text-muted-foreground">{payment.nayaPayAccountName}</p>
                </div>
              </div>
            </section>

            {/* Form */}
            <section>
              <h2 className="text-sm font-bold uppercase tracking-[0.2em]">Delivery details</h2>
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                {(
                  [
                    { key: "customerName", label: "Full name", type: "text", required: true },
                    { key: "phone", label: "Phone number", type: "tel", required: true },
                    { key: "city", label: "City", type: "text", required: true },
                  ] as const
                ).map((field) => (
                  <div key={field.key}>
                    <label
                      htmlFor={field.key}
                      className="text-[11px] font-bold uppercase tracking-widest"
                    >
                      {field.label}
                    </label>
                    <input
                      id={field.key}
                      type={field.type}
                      required={field.required}
                      maxLength={200}
                      value={form[field.key]}
                      onChange={set(field.key)}
                      className="mt-1 w-full border border-border bg-card px-3 py-2 text-sm"
                    />
                  </div>
                ))}

                <div>
                  <label
                    htmlFor="address"
                    className="text-[11px] font-bold uppercase tracking-widest"
                  >
                    Full delivery address
                  </label>
                  <textarea
                    id="address"
                    required
                    rows={3}
                    maxLength={400}
                    value={form.address}
                    onChange={set("address")}
                    className="mt-1 w-full border border-border bg-card px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="notes"
                    className="text-[11px] font-bold uppercase tracking-widest"
                  >
                    Notes (optional)
                  </label>
                  <textarea
                    id="notes"
                    rows={2}
                    maxLength={500}
                    value={form.notes}
                    onChange={set("notes")}
                    className="mt-1 w-full border border-border bg-card px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="advanceReference"
                    className="text-[11px] font-bold uppercase tracking-widest"
                  >
                    NayaPay transaction ID / reference
                  </label>
                  <input
                    id="advanceReference"
                    required
                    maxLength={120}
                    value={form.advanceReference}
                    onChange={set("advanceReference")}
                    placeholder={`After sending Rs ${advanceAmount.toLocaleString()}`}
                    className="mt-1 w-full border border-border bg-card px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="proof"
                    className="text-[11px] font-bold uppercase tracking-widest"
                  >
                    Payment screenshot (optional)
                  </label>
                  <input
                    id="proof"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setProof(e.target.files?.[0] ?? null)}
                    className="mt-1 w-full border border-border bg-card px-3 py-2 text-xs"
                  />
                </div>

                {message && <p className="text-xs font-semibold text-destructive">{message}</p>}

                <button
                  type="submit"
                  disabled={busy || available.length === 0}
                  className="w-full bg-brand px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-foreground disabled:opacity-60"
                >
                  {busy ? "Placing order…" : `Place order · Rs ${total.toLocaleString()}`}
                </button>
                <p className="text-[11px] text-muted-foreground">
                  We confirm your Rs {advanceAmount.toLocaleString()} advance manually, then reach
                  out on WhatsApp or phone.
                </p>
              </form>
            </section>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
