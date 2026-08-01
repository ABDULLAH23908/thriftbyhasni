/**
 * ============================================================
 *  EDIT YOUR STORE HERE
 * ============================================================
 * To add a product: copy one block below, paste it, change the values.
 *
 *  image  -> use one of the imported photos at the top, or paste a URL
 *             in quotes, e.g. image: "https://example.shoe.jpg"
 *  price  -> number in PKR (no commas)
 *  oldPrice -> optional, shows a crossed-out price
 *  condition -> "Premium+" | "Premium" | "Excellence" | "Very Good"
 *  sizes  -> list of UK sizes available
 *  sold   -> true hides the "Add to cart" style CTA and marks it sold
 */

import shoes1 from "@/assets/shoes1.png.asset.json";
import shoes2 from "@/assets/Shoes2.jpeg.asset.json";
import shoes3 from "@/assets/shoes3.jpeg.asset.json";
import shoes4 from "@/assets/shoes4.jpeg.asset.json";
import shoes5 from "@/assets/shoes5.jpeg.asset.json";
import shoes6 from "@/assets/shoes6.jpeg.asset.json";

export type Condition = "Premium+" | "Premium" | "Excellence" | "Very Good";

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: "Men" | "Women" | "Kids" | "Sports" | "Casual";
  price: number;
  oldPrice?: number;
  condition: Condition;
  sizes: string[];
  image: string;
  sold?: boolean;
};

export const products: Product[] = [
 export type Product = {
  id: string;
  name: string;
  brand: string;
  category: "Men" | "Women" | "Kids" | "Sports" | "Casual";
  price: number;
  oldPrice?: number;
  condition: Condition;
  sizes: string[];
  image: string;
  sold?: boolean;
};

export const products: Product[] = [
  {
    id: "dunk-panda",
    name: "Dunk Low Retro Panda",
    brand: "Nike",
    category: "Men",
    price: 2499,
    oldPrice: 4000,
    condition: "Premium+",
    sizes: ["7", "8", "9", "10"],
    image: shoes1.url,
  },
  {
    id: "af1-midnight-navy",
    name: "Air Force 1 LV8 3 GS 'College Pack - Midnight Navy'",
    brand: "Nike",
    category: "Men",
    price: 1999,
    oldPrice: 4000,
    condition: "Authentic",
    sizes: ["5.5 UK", "38.5 EUR"],
    image: shoes2.url,
  },
  {
    id: "af1-sunflower",
    name: "Nike Air Force 1 Low LV8 'Have a nike day'",
    brand: "Nike",
    category: "Women",
    price: 1999,
    condition: "Authentic",
    sizes: ["6.5 US", "39 EUR"],
    image: shoes3.url,
  },
  {
    id: "af1-floral-swoosh",
    name: "GS Nike Air Force 1 Low 'Melted Crayon' CU4632-100",
    brand: "Nike",
    category: "Casual",
    price: 1999,
    oldPrice: 14000,
    condition: "Authentic",
    sizes: ["6 UK", "8 US", "39 EUR"],
    image: shoes4.url,
  },
  {
    id: "af1-grey-suede",
    name: "Nike Air Force 1 LV8 'Athletic Club' Sneakers",
    brand: "Nike",
    category: "Sports",
    price: 1999,
    condition: "Authentic",
    sizes: ["5 UK", "7 US", "38 EUR"],
    image: shoes5.url,
  },
  {
    id: "af1-just-do-more",
    name: "Nike Air Force 1 'JUST DO MORE' Lightning Bolts",
    brand: "Nike",
    category: "Kids",
    price: 1999,
    oldPrice: 11500,
    condition: "Authentic",
    sizes: ["6 UK", "8 US", "39 EUR"],
    image: shoes6.url,
  },
];

/** Text on the thin bar at the very top of the site. */
export const announcement = "BACK TO SCHOOL SALE — UP TO 45% OFF · FREE DELIVERY OVER PKR 5,000";

/** Store contact details used in the footer. */
export const store = {
  name: "Thrift by Hasni",
  phone: "0334 0801640",
  whatsapp: "+92 334 0801640",
  email: "hello@thriftbyhasni.pk",
  address: "VWVC+M5, Mohra Kor Chisham, near Chakwal–Jhelum Rd, Pakistan",
  hours: "Open daily · closes 8:00 PM",
  mapsUrl: "https://maps.google.com/?q=VWVC%2BM5+Mohra+Kor+Chisham+Pakistan",
  instagram: "https://instagram.com",
};

/** Condition guide shown on the homepage. */
export const conditions: { label: Condition; blurb: string }[] = [
  { label: "Premium+", blurb: "Looks brand new. Barely worn, no visible flaws." },
  { label: "Premium", blurb: "Light signs of wear, crisp shape and clean sole." },
  { label: "Excellence", blurb: "Honest wear with plenty of life left in them." },
  { label: "Very Good", blurb: "Well loved pairs at the friendliest prices." },
];

/** Brands strip — add or remove freely. */
export const brands = [
  "Nike",
  "Adidas",
  "New Balance",
  "Asics",
  "Skechers",
  "Saucony",
  "Under Armour",
  "Brooks",
];
