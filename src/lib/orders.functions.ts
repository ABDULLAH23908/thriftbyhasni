import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { cleanText } from "./sanitize";

const proofSchema = z
  .object({
    name: z.string().max(200),
    type: z.enum(["image/jpeg", "image/png", "image/webp"]),
    /** base64 (no data: prefix), capped at ~4MB of binary. */
    base64: z.string().max(6_000_000),
  })
  .nullable()
  .optional();

const orderInput = z.object({
  customerName: z.string(),
  phone: z.string(),
  address: z.string(),
  city: z.string(),
  notes: z.string().optional().default(""),
  advanceReference: z.string(),
  items: z
    .array(z.object({ productId: z.string().min(1).max(120), size: z.string().max(60).optional() }))
    .min(1)
    .max(20),
  proof: proofSchema,
});

export type PlaceOrderResult =
  | { ok: true; orderId: string; total: number }
  | { ok: false; error: "sold_out" | "empty_cart" | "invalid"; message: string };

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((data) => orderInput.parse(data))
  .handler(async ({ data }): Promise<PlaceOrderResult> => {
    const customerName = cleanText(data.customerName, 120);
    const phone = cleanText(data.phone, 30);
    const address = cleanText(data.address, 400);
    const city = cleanText(data.city, 80);
    const notes = cleanText(data.notes ?? "", 500);
    const advanceReference = cleanText(data.advanceReference, 120);

    if (customerName.length < 3) {
      return { ok: false, error: "invalid", message: "Please enter your full name." };
    }
    if (!/^[0-9+\-\s()]{10,20}$/.test(phone)) {
      return { ok: false, error: "invalid", message: "Please enter a valid phone number." };
    }
    if (address.length < 10) {
      return { ok: false, error: "invalid", message: "Please enter a complete delivery address." };
    }
    if (city.length < 2) {
      return { ok: false, error: "invalid", message: "Please enter your city." };
    }
    if (advanceReference.length < 4) {
      return {
        ok: false,
        error: "invalid",
        message: "Please enter the NayaPay transaction ID for the Rs 350 advance.",
      };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let proofPath: string | null = null;
    if (data.proof && data.proof.base64.length > 0) {
      const binary = Buffer.from(data.proof.base64, "base64");
      if (binary.byteLength > 4_000_000) {
        return { ok: false, error: "invalid", message: "Screenshot must be smaller than 4 MB." };
      }
      const ext = data.proof.type === "image/png" ? "png" : data.proof.type === "image/webp" ? "webp" : "jpg";
      const key = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from("payment-proofs")
        .upload(key, binary, { contentType: data.proof.type, upsert: false });
      if (uploadError) {
        console.error("payment proof upload failed", uploadError);
      } else {
        proofPath = key;
      }
    }

    const { data: result, error } = await supabaseAdmin.rpc("place_order", {
      p_customer_name: customerName,
      p_phone: phone,
      p_address: address,
      p_city: city,
      p_notes: notes,
      p_items: data.items.map((i) => ({ product_id: i.productId, size: i.size ?? "" })),
      p_advance_reference: advanceReference,
      ...(proofPath ? { p_payment_proof_url: proofPath } : {}),
    });

    if (error) {
      console.error("place_order failed", error);
      throw new Error("Could not place the order. Please try again.");
    }

    const payload = result as {
      ok?: boolean;
      error?: string;
      order_id?: string;
      total?: number;
    } | null;

    if (!payload?.ok) {
      if (payload?.error === "empty_cart") {
        return { ok: false, error: "empty_cart", message: "Your bag is empty." };
      }
      return {
        ok: false,
        error: "sold_out",
        message: "Sorry, this pair was just sold.",
      };
    }

    const itemsSummary = data.items
      .map((i) => `${i.productId}${i.size ? ` (size ${i.size})` : ""}`)
      .join(", ");

    // Fire-and-forget — don't let a notification failure block the order
    fetch("https://script.google.com/macros/s/AKfycbzMwG601UyA3eZvuQ1otRviVdayr_8INP52MCoYsV26BMy9ecCAJc1HA0rR-KVQX5CD/exec", {
      method: "POST",
      body: JSON.stringify({
        name: customerName,
        phone,
        items: itemsSummary,
        address: `${address}, ${city}`,
        notes: notes || "—",
      }),
    }).catch((err) => console.error("Order notification failed:", err));

    return { ok: true, orderId: payload.order_id!, total: Number(payload.total ?? 0) };
  });
