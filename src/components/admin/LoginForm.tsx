"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const unauthorized = searchParams.get("unauthorized") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setSubmitting(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 360 }}>
      <h1 className="page-title">admin sign in</h1>

      {unauthorized && (
        <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 16 }}>
          That account doesn&apos;t have admin access.
        </p>
      )}

      <div className="field">
        <label htmlFor="admin-email">Email</label>
        <input
          id="admin-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
        />
      </div>

      <div className="field">
        <label htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>

      {error && (
        <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>{error}</p>
      )}

      <button className="btn btn-primary" type="submit" disabled={submitting} style={{ width: "100%", justifyContent: "center", padding: 12 }}>
        {submitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
