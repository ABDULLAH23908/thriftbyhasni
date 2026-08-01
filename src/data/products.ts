/**
 * ============================================================
 *  EDIT YOUR STORE HERE
 * ============================================================
 * To add a product: copy one block below, paste it, change the values.
 *
 *  image  -> use one of the imported photos at the top, or paste a URL
 *             in quotes, e.g. image: "https://example.shoe.jpg"
 *  images -> optional. Add extra angles/photos of the same pair.
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

// New batch — uploaded directly via GitHub, so these are plain image
// imports (no .asset.json wrapper, no .url — Vite gives the URL directly).
import shoes7 from "@/assets/Shoes7.jpeg";
import shoes8 from "@/assets/Shoes8.jpeg";
import shoes9 from "@/assets/Shoes9.jpeg";
import shoes10 from "@/assets/Shoes10.jpeg";
import shoes11 from "@/assets/Shoes11.jpeg";
import shoes12 from "@/assets/Shoes12.jpeg";
import shoes13 from "@/assets/Shoes13.jpeg";
import shoes14 from "@/assets/Shoes14.jpeg";
import shoes15 from "@/assets/Shoes15.jpeg";

export type Condition = "Premium+" | "Premium" | "Excellence" | "Very Good";

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: "Men" | "Women" | "Kids" | "Sports" | "Casual";
  price: number;
  oldPrice?: number;
  condition: "Premium+" | "Premium" | "Excellence" | "Very Good";
  sizes: string[];
  image: string;
  /** Optional extra photos/angles of the same pair. */
  images?: string[];
  color?: string;
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
    condition: "Premium",
    sizes: ["5.5 UK", "38.5 EUR"],
    image: shoes2.url,
  },
  {
    id: "af1-sunflower",
    name: "Nike Air Force 1 Low LV8 'Have a nike day'",
    brand: "Nike",
    category: "Women",
    price: 1999,
    oldPrice: 3000,
    condition: "Premium",
    sizes: ["6.5 US", "39 EUR"],
    image: shoes3.url,
  },
  {
    id: "af1-floral-swoosh",
    name: "GS Nike Air Force 1 Low 'Melted Crayon' CU4632-100",
    brand: "Nike",
    category: "Casual",
    price: 1999,
    oldPrice: 3000,
    condition: "Excellence",
    sizes: ["6 UK", "8 US", "39 EUR"],
    image: shoes4.url,
  },
  {
    id: "af1-grey-suede",
    name: "Nike Air Force 1 LV8 'Athletic Club' Sneakers",
    brand: "Nike",
    category: "Sports",
    price: 1999,
    oldPrice: 3000,
    condition: "Premium+",
    sizes: ["5 UK", "7 US", "38 EUR"],
    image: shoes5.url,
  },
  {
    id: "af1-just-do-more",
    name: "Nike Air Force 1 'JUST DO MORE' Lightning Bolts",
    brand: "Nike",
    category: "Kids",
    price: 1999,
    oldPrice: 3000,
    condition: "Premium",
    sizes: ["6 UK", "8 US", "39 EUR"],
    image: shoes6.url,
  },

  // ---------- New batch (from WhatsApp catalog) ----------
  {
    id: "court-borough-low-2-sneakers",
    name: "Nike Court Borough Low 2 Sneakers",
    brand: "Nike",
    category: "Men",
    price: 2499,
    condition: "Premium", // TODO: confirm actual wear grade
    sizes: ["UK 6", "EUR 40"],
    image: shoes7,
  },
  {
    id: "court-vision-low-next-nature-black",
    name: "Nike Court Vision Low Next Nature",
    brand: "Nike",
    category: "Men",
    price: 2999,
    condition: "Premium", // TODO: confirm actual wear grade
    sizes: ["UK 8.5", "EUR 42.5"],
    image: shoes8,
    color: "Black",
  },
  {
    id: "court-borough-low-2-low-top",
    name: "Nike Court Borough Low 2 Low Top",
    brand: "Nike",
    category: "Women", // TODO: confirm — smaller UK size, guessed Women
    price: 2499,
    condition: "Premium+", // TODO: confirm actual wear grade ("Very rare" in chat is not a condition grade)
    sizes: ["UK 5.5", "EUR 38.5"],
    image: shoes9,
  },
  {
    id: "af1-react-astronomy-blue",
    name: "Air Force 1 React 'Astronomy Blue'",
    brand: "Nike",
    category: "Men",
    price: 2999, // TODO: price was cut off in the WhatsApp screenshot — confirm real number
    condition: "Premium", // TODO: confirm actual wear grade
    sizes: ["UK 6", "EUR 40"],
    image: shoes10,
  },
  {
    id: "af1-lumberjack-pack-black",
    name: "Nike Air Force 1 Low Lumberjack Pack Black",
    brand: "Nike",
    category: "Men",
    price: 3499,
    condition: "Premium+", // TODO: confirm actual wear grade ("Extremely rare" in chat is not a condition grade)
    sizes: ["UK 8.5", "EUR 43"],
    image: shoes11,
  },
  {
    id: "af1-low-white",
    name: "Nike Air Force 1 Low",
    brand: "Nike",
    category: "Men",
    price: 3499,
    condition: "Premium", // TODO: confirm actual wear grade
    sizes: ["UK 7.5", "EUR 42", "US 8.5"],
    image: shoes12,
    color: "White",
  },
  {
    id: "af1-07-se-recycled-white-black",
    name: "Nike Air Force 1 Low '07 SE Recycled White Black Light Bone",
    brand: "Nike",
    category: "Men",
    price: 3499,
    condition: "Premium+", // TODO: confirm actual wear grade
    sizes: ["UK 9", "EUR 44", "US 11.5"],
    image: shoes13,
    color: "White / Light Bone",
  },
  {
    id: "af1-gs-black-gum-light-brown",
    name: "Nike Air Force 1 Low GS 'Black Gum Light Brown'",
    brand: "Nike",
    // "GS" = Grade School in Nike sizing, so this is youth sizing — flag if wrong
    category: "Kids",
    price: 3499,
    condition: "Premium+", // TODO: confirm actual wear grade
    sizes: ["UK 8.5", "EUR 43", "US 9.5"],
    image: shoes14,
    images: [shoes14, shoes15],
    color: "Black / Gum",
  },
];

/** Text on the thin bar at the very top of the site. */
export const announcement = "";

/** Store contact details used in the footer. */
export const store = {
  name: "Thrift by Hasni",
  phone: "0334 0801640",
  whatsapp: "+92 334 0801640",
  email: "thriftbyhasni1@gmail.com",
  address: "VWVC+M5, Mohra Kor Chisham, near Chakwal–Jhelum Rd, Pakistan",
  hours: "Open daily · closes 8:00 PM",
  mapsUrl: "https://www.google.com/maps/place/Thrift+by+hasni/@32.8938391,72.9166273,935m/data=!3m2!1e3!4b1!4m6!3m5!1s0x392043007e39c833:0x1bb18281164463f6!8m2!3d32.8938346!4d72.9192022!16s%2Fg%2F11z911g8ds?entry=ttu&g_ep=EgoyMDI2MDcyOS4wIKXMDSoASAFQAw%3D%3D",
  instagram: "https://www.instagram.com/thrift_by_hasni1/",
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
  "qc",
  "hoka",
  "brooks",
];
