import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { store } from "@/data/products";

export const Route = createFileRoute("/policies")({
  head: () => ({
    meta: [
      { title: "Terms, Refund & Authenticity Policy — Thrift by Hasni" },
      {
        name: "description",
        content:
          "Thrift by Hasni's terms of service, refund & return policy, and authenticity disclaimer for thrifted sneakers.",
      },
      { property: "og:title", content: "Terms, Refund & Authenticity Policy — Thrift by Hasni" },
      {
        property: "og:description",
        content: "Read our terms of service, refund policy and authenticity disclaimer.",
      },
      { property: "og:url", content: "https://thriftbyhasni.lovable.app/policies" },
    ],
    links: [{ rel: "canonical", href: "https://thriftbyhasni.lovable.app/policies" }],
  }),
  component: PoliciesPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="text-xl font-bold uppercase tracking-tight text-foreground sm:text-2xl">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {children}
      </div>
    </section>
  );
}

function PoliciesPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-highlight">
          Please read before ordering
        </p>
        <h1 className="mt-2 text-3xl font-bold uppercase tracking-tight sm:text-4xl">
          Terms, Refund &amp; Authenticity Policy
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Last updated:{" "}
          {new Date().toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>

        <Section title="1. Who we are">
          <p>
            {store.name} sells secondhand, thrifted sneakers. Every pair is pre-owned, sourced
            individually, and sold in the honest condition described on its product page. By placing
            an order with us, you agree to the terms on this page.
          </p>
        </Section>

        <Section title="2. Product condition &amp; authenticity">
          <p>
            All shoes are secondhand and graded honestly using our condition system (Premium+,
            Premium, Excellence) shown on the homepage and on each product page. Pre-owned shoes may
            show signs of wear consistent with their stated grade — this is normal for thrifted
            footwear, not a defect.
          </p>
          <p>
            We do our best to verify authenticity on every pair we source, but we are a resale
            business, not the original brand or an authorized retailer. We do not guarantee that any
            pair is 100% authentic, and we are not affiliated with, endorsed by, or connected to any
            of the brands we resell. If you have specific authenticity concerns about a pair,
            message us on WhatsApp before ordering.
          </p>
        </Section>

        <Section title="3. Orders &amp; payment">
          <p>
            Orders require an advance payment via NayaPay and a screenshot of that payment uploaded
            at checkout. Your order stays "pending" until we manually confirm the payment — it is
            not automatically verified.
          </p>
          <p>
            Placing an order with a fake, edited, or unrelated payment screenshot will get the order
            cancelled and may result in us refusing future orders from you.
          </p>
        </Section>

        <Section title="4. Cancellations">
          <p>
            You can cancel an order for a full refund of your advance any time before it has been
            dispatched — message us on WhatsApp with your order details. Once a pair has been packed
            and handed to delivery (or the CEO is already on the way for CEO Delivery orders), it
            can no longer be cancelled.
          </p>
        </Section>

        <Section title="5. Refunds &amp; returns">
          <p>
            Because every pair is a unique, secondhand item, we do not offer returns or refunds for
            change of mind, sizing preference, or general dissatisfaction. Please check the size
            guide and condition photos carefully before ordering.
          </p>
          <p>We do offer a refund or replacement (our choice) only when:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              the pair sent does not match the condition grade or photos shown at checkout, or
            </li>
            <li>
              the pair is materially different from what you ordered (wrong shoe, wrong size sent),
              or
            </li>
            <li>the shoes are damaged in a way not disclosed on the product page.</li>
          </ul>
          <p>
            To claim any of the above, you must contact us on WhatsApp within{" "}
            <strong>24 hours of delivery</strong>, with a short unboxing video or clear photos
            showing the issue. Claims made after 24 hours, or without photo/video proof, cannot be
            accepted. Approved refunds are sent back to the same NayaPay account the advance was
            paid from, usually within 3–5 business days.
          </p>
        </Section>

        <Section title="6. Delivery">
          <p>
            We deliver across Pakistan. Delivery timelines are estimates, not guarantees, and can be
            affected by courier delays outside our control. For "Delivery by the CEO" orders,
            delivery windows are arranged directly with you over WhatsApp.
          </p>
        </Section>

        <Section title="7. Contact us">
          <p>
            Questions about an order, a refund claim, or this policy? Reach us on WhatsApp at{" "}
            <a href={`https://wa.me/${store.whatsapp.replace(/\D/g, "")}`} className="underline">
              {store.whatsapp}
            </a>{" "}
            or email{" "}
            <a href={`mailto:${store.email}`} className="underline">
              {store.email}
            </a>
            .
          </p>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
