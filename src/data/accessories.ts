/**
 * Extra accessories offered as add-ons on every product page.
 * Add/remove/edit freely — id must stay unique.
 */

export type Accessory = {
  id: string;
  name: string;
  price: number;
};

export const accessories: Accessory[] = [
  { id: "laces", name: "Extra Laces", price: 399 },
  { id: "cleaner", name: "Shoe Cleaner Kit", price: 599 },
  { id: "socks", name: "Pair of Socks", price: 299 },
];
