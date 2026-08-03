import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const listProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchAvailableProducts } = await import("./catalog.server");
  return fetchAvailableProducts();
});

export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ id: z.string().min(1).max(120) }).parse(data))
  .handler(async ({ data }) => {
    const { fetchProductById } = await import("./catalog.server");
    return fetchProductById(data.id);
  });

export const getCartProducts = createServerFn({ method: "GET" })
  .inputValidator((data) =>
    z.object({ ids: z.array(z.string().min(1).max(120)).max(30) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { fetchProductsByIds } = await import("./catalog.server");
    return fetchProductsByIds(data.ids);
  });
