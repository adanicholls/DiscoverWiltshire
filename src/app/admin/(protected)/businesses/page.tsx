import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { CATEGORY_LABELS, TOWN_LABELS } from "@/lib/data";
import DeleteBusinessButton from "@/components/admin/DeleteBusinessButton";

export const metadata: Metadata = {
  title: "Businesses — Discover Wiltshire admin",
  robots: { index: false, follow: false },
};

const STATUS_COLORS: Record<string, string> = {
  approved: "var(--green)",
  pending: "var(--mustard-ink)",
  declined: "var(--danger)",
};

export default async function AdminBusinessesPage() {
  const supabase = createSupabaseAdminClient();
  const { data: businesses, error } = await supabase.from("businesses").select("*").order("name");

  if (error) {
    return <div className="card" style={{ marginTop: 24 }}>Couldn&apos;t load businesses: {error.message}</div>;
  }

  return (
    <>
      <h1 className="page-title">businesses</h1>
      <p className="page-subtitle">Every business regardless of status — edit anything, or clean up test/duplicate rows.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
        {(businesses ?? []).map((b) => (
          <div key={b.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{b.name}</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: STATUS_COLORS[b.status] }}>{b.status}</span>
              </div>
              <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>
                {CATEGORY_LABELS[b.category_id] || b.category_id}
                {b.town_id ? ` · ${TOWN_LABELS[b.town_id] || b.town_id}` : ""} · {b.tagline}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Link className="btn btn-secondary" href={`/admin/businesses/${b.id}/edit`}>
                Edit
              </Link>
              <DeleteBusinessButton id={b.id} name={b.name} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
