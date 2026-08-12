/** Advance-payment + delivery settings. Edit these when your details change. */
export const payment = {
  /** Standard cash-on-delivery advance (also used for the "pay in full" option's delivery leg). */
  deliveryFee: 350,
  /** Novelty "delivery by the CEO" advance — replaces the standard delivery fee. */
  ceoDeliveryFee: 20000,
  nayaPayNumber: "0334 0801640",
  /** Name the NayaPay account is registered under. */
  nayaPayAccountName: "Thrift by Hasni",
};

export type PaymentMethodId = "cod" | "full" | "ceo";

export type PaymentMethodOption = {
  id: PaymentMethodId;
  label: string;
  tagline: string;
  /** Short line shown in the "how it works" box. */
  description: string;
};

export const paymentMethods: PaymentMethodOption[] = [
  {
    id: "cod",
    label: "Cash on Delivery",
    tagline: `Rs ${payment.deliveryFee} advance now`,
    description: `Pay a Rs ${payment.deliveryFee} delivery advance via NayaPay now. Pay the rest in cash when your order arrives.`,
  },
  {
    id: "full",
    label: "Full Payment",
    tagline: "Pay it all upfront",
    description:
      "Pay the entire order total via NayaPay now. Nothing to pay when it arrives — straight handover.",
  },
  {
    id: "ceo",
    label: "Delivery by the CEO 🚗",
    tagline: `Rs ${payment.ceoDeliveryFee.toLocaleString()} advance`,
    description: `A little unhinged, but real: the CEO personally shows up with your pairs. Rs ${payment.ceoDeliveryFee.toLocaleString()} advance via NayaPay, rest in cash on arrival.`,
  },
];

export function getPaymentMethod(id: PaymentMethodId): PaymentMethodOption {
  return paymentMethods.find((m) => m.id === id) ?? paymentMethods[0]!;
}

/** Delivery/advance charge for a given method, before "full" folds in the subtotal. */
export function deliveryFeeFor(method: PaymentMethodId): number {
  return method === "ceo" ? payment.ceoDeliveryFee : payment.deliveryFee;
}

/** The amount that must be paid via NayaPay *right now* to confirm the order. */
export function advanceAmountFor(method: PaymentMethodId, subtotal: number): number {
  const delivery = deliveryFeeFor(method);
  return method === "full" ? subtotal + delivery : delivery;
}
