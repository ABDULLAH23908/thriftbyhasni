import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AdminOrder = {
  id: string;
  created_at: string;
  customer_name: string;
  phone: string;
  address: string;
  city: string;
  notes: string | null;
  items: { product_id: string; name: string; size: string; condition: string; price: number }[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  advance_paid: boolean;
  advance_reference: string | null;
  payment_status: string;
  order_status: string;
  proof_url: string | null;
};

export async function assertAdmin(context: { supabase: { rpc: unknown }; userId: string }) {
  const supabase = context.supabase as unknown as {
    rpc: (
      fn: "has_role",
      args: { _user_id: string; _role: "admin" },
    ) => Promise<{ data: boolean | null; error: unknown }>;
  };
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Forbidden");
}

export const listOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminOrder[]> => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw error;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    return Promise.all(
      (data ?? []).map(async (row) => {
        let proofUrl: string | null = null;
        if (row.payment_proof_url) {
          const { data: signed } = await supabaseAdmin.storage
            .from("payment-proofs")
            .createSignedUrl(row.payment_proof_url, 60 * 60);
          proofUrl = signed?.signedUrl ?? null;
        }
        return {
          id: row.id,
          created_at: row.created_at,
          customer_name: row.customer_name,
          phone: row.phone,
          address: row.address,
          city: row.city,
          notes: row.notes,
          items: Array.isArray(row.items) ? (row.items as AdminOrder["items"]) : [],
          subtotal: Number(row.subtotal),
          delivery_fee: Number(row.delivery_fee),
          total: Number(row.total),
          advance_paid: row.advance_paid,
          advance_reference: row.advance_reference,
          payment_status: row.payment_status,
          order_status: row.order_status,
          proof_url: proofUrl,
        };
      }),
    );
  });

export const updateOrderState = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        orderId: z.string().uuid(),
        paymentStatus: z.enum(["advance_verified"]).optional(),
        orderStatus: z.enum(["fulfilled", "cancelled"]).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.rpc("set_order_state", {
      p_order_id: data.orderId,
      ...(data.paymentStatus ? { p_payment_status: data.paymentStatus } : {}),
      ...(data.orderStatus ? { p_order_status: data.orderStatus } : {}),
    });
    if (error) throw error;
    return { ok: true };
  });

/**
 * One-time admin bootstrap. Creates the single admin account from the
 * ADMIN_EMAIL / ADMIN_PASSWORD server secrets and grants it the admin role.
 * Does nothing (and reveals nothing) once the account exists.
 */
export const ensureAdminAccount = createServerFn({ method: "POST" }).handler(async () => {
  const email = process.env["ADMIN_EMAIL"];
  const password = process.env["ADMIN_PASSWORD"];
  if (!email || !password) return { ok: false as const, reason: "not_configured" as const };

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
  let userId = list?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())?.id;

  if (!userId) {
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error || !created.user) {
      console.error("admin bootstrap failed", error);
      return { ok: false as const, reason: "create_failed" as const };
    }
    userId = created.user.id;
  }

  await supabaseAdmin.from("user_roles").upsert(
    { user_id: userId, role: "admin" },
    { onConflict: "user_id,role", ignoreDuplicates: true },
  );

  return { ok: true as const, reason: "ready" as const };
});
