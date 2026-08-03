import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { ensureAdminAccount } from "@/lib/admin.functions";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Login — Thrift by Hasni" },
      { name: "description", content: "Staff login for managing Thrift by Hasni orders." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Admin Login — Thrift by Hasni" },
      { property: "og:description", content: "Staff login for managing orders." },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const bootstrap = useServerFn(ensureAdminAccount);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    // Makes sure the single admin account exists before the first ever login.
    await bootstrap({}).catch(() => undefined);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (signInError) {
      setError("Wrong email or password.");
      return;
    }
    navigate({ to: "/admin/orders" });
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-sm px-4 py-20">
        <h1 className="text-2xl font-bold uppercase tracking-tight">Admin login</h1>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="text-[11px] font-bold uppercase tracking-widest">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-border bg-card px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-[11px] font-bold uppercase tracking-widest">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-border bg-card px-3 py-2 text-sm"
            />
          </div>
          {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-brand px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-foreground disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </main>
    </div>
  );
}
