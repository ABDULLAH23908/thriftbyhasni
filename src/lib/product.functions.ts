import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin } from "@/lib/admin.functions";

export type AdminStock = { id: string; status: string; soldAt: string | null };

/**
 * Stock state for every pair, including pairs sold more than 24 hours ago
 * (which are hidden from shoppers but still manageable here).
 */
export const listAdminStock = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminStock[]> => {
    await assertAdmin(context);
    const { data, error } = await context.supabase.from("products").select("id, status, sold_at");
    if (error) throw error;
    return (data ?? []).map((row) => ({ id: row.id, status: row.status, soldAt: row.sold_at }));
  });

/**
 * Marks pairs sold, or puts them back in stock (e.g. after an order is
 * cancelled). Sold pairs stay visible as "Sold out" for 24 hours and then
 * drop off the storefront automatically.
 */
export const setProductStock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        productIds: z.array(z.string().min(1).max(120)).min(1).max(50),
        status: z.enum(["available", "sold"]),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("products")
      .update({ status: data.status })
      .in("id", data.productIds);
    if (error) {
      console.error("stock update failed", error);
      return { success: false as const, error: "Could not update stock." };
    }
    return { success: true as const };
  });
