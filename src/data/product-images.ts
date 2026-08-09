/**
 * Local photo library.
 *
 * The `image` / `images` columns in the database can hold either:
 *   - a full URL ("https://…") or a site path ("/uploads/x.jpg"), used as-is, or
 *   - one of the keys below, e.g. "shoes7" — handy for photos stored in the app.
 */
import shoes1 from "@/assets/shoes1.png.asset.json";
import shoes2 from "@/assets/Shoes2.jpeg.asset.json";
import shoes3 from "@/assets/shoes3.jpeg.asset.json";
import shoes4 from "@/assets/shoes4.jpeg.asset.json";
import shoes5 from "@/assets/shoes5.jpeg.asset.json";
import shoes6 from "@/assets/shoes6.jpeg.asset.json";
import shoes7 from "@/assets/Shoes7.jpeg";
import shoes8 from "@/assets/Shoes8.jpeg";
import shoes9 from "@/assets/Shoes9.jpeg";
import shoes10 from "@/assets/Shoes10.jpeg";
import shoes11 from "@/assets/Shoes11.jpeg";
import shoes12 from "@/assets/Shoes12.jpeg";
import shoes13 from "@/assets/Shoes13.jpeg";
import shoes14 from "@/assets/Shoes14.jpeg";
import shoes15 from "@/assets/Shoes15.jpeg";

export const productImages: Record<string, string> = {
  shoes1: shoes1.url,
  shoes2: shoes2.url,
  shoes3: shoes3.url,
  shoes4: shoes4.url,
  shoes5: shoes5.url,
  shoes6: shoes6.url,
  shoes7,
  shoes8,
  shoes9,
  shoes10,
  shoes11,
  shoes12,
  shoes13,
  shoes14,
  shoes15,
};

export function resolveProductImage(value: string | null | undefined): string {
  if (!value) return "";
  if (value.startsWith("http") || value.startsWith("/")) return value;
  return productImages[value] ?? "";
}
