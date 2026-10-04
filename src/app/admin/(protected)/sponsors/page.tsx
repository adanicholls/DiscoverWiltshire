import type { Metadata } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { SPONSORSHIP_COLUMNS, Store, mapSponsorshipRow, type SponsorshipRow } from "@/lib/store";
import { TOWNS, TOWN_LABELS } from "@/lib/data";
import SponsorForm from "@/components/admin/SponsorForm";
import SponsorRow from "@/components/admin/SponsorRow";

export const metadata: Metadata = {
  title: "Sponsors — Discover Wiltshire admin",
  robots: { index: false, follow: false },
};

export default async function AdminSponsorsPage() {
  const supabase = createSupabaseAdminClient();
  const [{ data, error }, categoryLabels] = await Promise.all([
    supabase.from("sponsorships").select(SPONSORSHIP_COLUMNS).order("created_at", { ascending: false }),
    Store.getCategoryLabels(),
  ]);

  if (error) {
    return (
      <div className="card" style={{ marginTop: 24 }}>
        Couldn&apos;t load sponsors: {error.message}
        <div style={{ fontSize: 12, opacity: 0.65, marginTop: 6 }}>
          If this is the first time, the <code>0005_sponsorships.sql</code> migration may not have been run in
          Supabase yet.
        </div>
      </div>
    );
  }

  // Core categories first, then trades - the order getCategoryLabels builds them in.
  const categoryOptions = Object.entries(categoryLabels).map(([id, label]) => ({ id, label }));
  const townOptions = TOWNS.map((t) => ({ id: t.id, label: t.label }));
  const sponsors = ((data ?? []) as SponsorshipRow[]).map(mapSponsorshipRow);

  return (
    <>
      <h1 className="page-title">sponsors</h1>
      <p className="page-subtitle">
        A sponsor gets an image-led &ldquo;Sponsored&rdquo; card at the top of the right-hand column on a category or
        town page, above the events. One sponsor per page &mdash; edit or remove the current one to hand it on.
      </p>

      <h2 className="section-heading">add a sponsor</h2>
      <div className="card" style={{ marginBottom: 28 }}>
        <SponsorForm categoryOptions={categoryOptions} townOptions={townOptions} />
      </div>

      <h2 className="section-heading">current sponsors</h2>
      {sponsors.length === 0 ? (
        <div className="card" style={{ textAlign: "center", opacity: 0.6, marginBottom: 28 }}>
          No sponsors yet &mdash; add the first one above.
        </div>
      ) : (
        <div style={{ marginBottom: 28 }}>
          {sponsors.map((s) => (
            <SponsorRow
              key={s.id}
              sponsor={s}
              targetLabel={
                s.targetType === "town" ? TOWN_LABELS[s.targetId] || s.targetId : categoryLabels[s.targetId] || s.targetId
              }
              categoryOptions={categoryOptions}
              townOptions={townOptions}
            />
          ))}
        </div>
      )}
    </>
  );
}
