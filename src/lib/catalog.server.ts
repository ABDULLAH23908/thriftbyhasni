import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type CatalogProduct = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  oldPrice: number | null;
  condition: string;
  sizes: string[];
  image: string;
  images: string[] | null;
  color: string | null;
  status: string;
};

/** Publishable-key client: reads only what the public policies allow. */
export function createPublicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const url = process.env["SUPABASE_URL"]!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

type Row = Database["public"]["Tables"]["products"]["Row"];

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

export function mapProduct(row: Row): CatalogProduct {
  const images = toStringArray(row.images);
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    category: row.category,
    price: Number(row.price),
    oldPrice: row.old_price == null ? null : Number(row.old_price),
    condition: row.condition,
    sizes: toStringArray(row.sizes),
    image: row.image,
    images: images.length > 0 ? images : null,
    color: row.color,
    status: row.status,
  };
}

const COLUMNS =
  "id, name, brand, category, price, old_price, condition, sizes, image, images, color, status, created_at";

export async function fetchAvailableProducts(): Promise<CatalogProduct[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(COLUMNS)
    .eq("status", "available")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapProduct);
}

export async function fetchProductById(id: string): Promise<CatalogProduct | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProduct(data) : null;
}

export async function fetchProductsByIds(ids: string[]): Promise<CatalogProduct[]> {
  if (ids.length === 0) return [];
  const supabase = createPublicClient();
  const { data, error } = await supabase.from("products").select(COLUMNS).in("id", ids);
  if (error) throw error;
  return (data ?? []).map(mapProduct);
}
