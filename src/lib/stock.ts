import { queryOptions, useQuery } from "@tanstack/react-query";
import { listProductStock } from "./catalog.functions";
import { products as fileProducts, type Product } from "@/data/products";

export type ProductStock = { id: string; status: string; soldAt: string | null };

export const HIDE_AFTER_MS = 24 * 60 * 60 * 1000;

export const productStockQuery = queryOptions({
  queryKey: ["product-stock"],
  queryFn: () => listProductStock(),
  staleTime: 30_000,
});

function stockMap(rows: ProductStock[]) {
  return new Map(rows.map((row) => [row.id, row]));
}

/** True once a pair has been marked sold for more than 24 hours. */
function isExpired(row: ProductStock) {
  if (row.status !== "sold" || !row.soldAt) return false;
  return Date.now() - new Date(row.soldAt).getTime() > HIDE_AFTER_MS;
}

/**
 * Overlays live stock state (from the admin panel / orders) on top of the
 * hand-edited catalog in src/data/products.ts. A pair marked sold shows as
 * "Sold out" everywhere, then disappears from the site 24 hours later.
 */
export function withStock(list: Product[], rows: ProductStock[]): Product[] {
  const map = stockMap(rows);
  const out: Product[] = [];
  for (const product of list) {
    const row = map.get(product.id);
    if (!row) {
      out.push(product);
      continue;
    }
    if (isExpired(row)) continue;
    out.push({ ...product, sold: row.status === "sold" || row.status === "reserved" });
  }
  return out;
}

export function findWithStock(id: string, rows: ProductStock[]): Product | undefined {
  const product = fileProducts.find((p) => p.id === id);
  if (!product) return undefined;
  return withStock([product], rows)[0];
}

/** Catalog with live stock applied; sold-out pairs older than 24h are dropped. */
export function useStockedProducts(): Product[] {
  const { data } = useQuery(productStockQuery);
  return withStock(fileProducts, data ?? []);
}

export function useStockedProduct(id: string): Product | undefined {
  const { data } = useQuery(productStockQuery);
  return findWithStock(id, data ?? []);
}
