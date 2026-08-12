import { store } from "@/data/products";
import { getPaymentMethod, type PaymentMethodId } from "@/data/payment";

export type WhatsAppOrderLine = {
  name: string;
  size?: string;
  condition?: string;
  price: number;
  addOns?: { name: string; price: number }[];
};

export type WhatsAppOrder = {
  orderId: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
  advanceReference: string;
  items: WhatsAppOrderLine[];
  subtotal: number;
  total: number;
  paymentMethod: PaymentMethodId;
  advanceAmount: number;
};

export const WHATSAPP_PENDING_KEY = "tbh-pending-whatsapp";

/** Builds the order message that gets sent to the store's WhatsApp. */
export function buildOrderMessage(order: WhatsAppOrder): string {
  const lines: string[] = [];
  lines.push("*NEW ORDER — Thrift by Hasni*");
  lines.push(`Order ref: ${order.orderId.slice(0, 8)}`);
  lines.push("");
  lines.push("*Items*");
  order.items.forEach((item, index) => {
    lines.push(
      `${index + 1}. ${item.name}${item.size ? ` — Size ${item.size}` : ""}${
        item.condition ? ` (${item.condition})` : ""
      } — Rs ${item.price.toLocaleString()}`,
    );
    item.addOns?.forEach((addOn) => {
      lines.push(`   + ${addOn.name} — Rs ${addOn.price.toLocaleString()}`);
    });
  });
  const method = getPaymentMethod(order.paymentMethod);
  lines.push("");
  lines.push(`Payment method: ${method.label}`);
  lines.push(`Subtotal: Rs ${order.subtotal.toLocaleString()}`);
  lines.push(`Advance paid now (NayaPay): Rs ${order.advanceAmount.toLocaleString()}`);
  lines.push(`Total: Rs ${order.total.toLocaleString()}`);
  lines.push(`Advance reference: ${order.advanceReference}`);
  lines.push("");
  lines.push("*Customer*");
  lines.push(`Name: ${order.customerName}`);
  lines.push(`Phone: ${order.phone}`);
  lines.push(`Address: ${order.address}, ${order.city}`);
  if (order.notes) lines.push(`Notes: ${order.notes}`);
  lines.push("");
  lines.push("Please verify this order in the admin panel.");
  return lines.join("\n");
}

export function buildOrderWhatsAppUrl(order: WhatsAppOrder): string {
  const number = store.whatsapp.replace(/[^0-9]/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(buildOrderMessage(order))}`;
}
