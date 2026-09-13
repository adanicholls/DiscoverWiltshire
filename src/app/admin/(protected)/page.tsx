import type { Metadata } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import PendingListingRow from "@/components/admin/PendingListingRow";
import PendingUpgradeRow from "@/components/admin/PendingUpgradeRow";
import { Store } from "@/lib/store";

export const metadata: Metadata = {
  title: "Approval queue — Discover Wiltshire admin",
  robots: { index: false, follow: false },
};

export default async function AdminQueuePage() {
  const supabase = createSupabaseAdminClient();

  const [{ data: pendingListings, error: listingsError }, { data: pendingUpgrades, error: upgradesError }, categoryLabels] =
    await Promise.all([
      supabase.from("businesses").select("*").eq("status", "pending").order("created_at", { ascending: false }),
      supabase
        .from("upgrade_requests")
        .select("*, businesses(name)")
        .eq("status", "pending")
        .order("created_at", { ascending: false }),
      Store.getCategoryLabels(),
    ]);

  if (listingsError || upgradesError) {
    return (
      <div className="card" style={{ marginTop: 24 }}>
        Couldn&apos;t load the queue: {(listingsError || upgradesError)?.message}
      </div>
    );
  }

  const listings = pendingListings ?? [];
  const upgrades = pendingUpgrades ?? [];
  const totalPending = listings.length + upgrades.length;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "24px 0 4px" }}>
        <h1 className="page-title" style={{ margin: 0 }}>
          approval queue
        </h1>
        <span className="pending-count" style={{ fontSize: 12, background: "var(--terracotta)", color: "#fff", padding: "3px 10px", borderRadius: 999 }}>
          {totalPending} pending
        </span>
      </div>
      <p className="page-subtitle">New listings and paid upgrade requests, reviewed before anything goes live.</p>

      {totalPending === 0 ? (
        <div className="card" style={{ textAlign: "center", opacity: 0.6 }}>
          Nothing waiting on you right now.
        </div>
      ) : (
        <>
          {listings.map((b) => (
            <PendingListingRow
              key={b.id}
              id={b.id}
              name={b.name}
              categoryId={b.category_id}
              categoryLabel={categoryLabels[b.category_id] || b.category_id}
              townId={b.town_id}
              tagline={b.tagline}
              createdAt={b.created_at}
            />
          ))}
          {upgrades.map((u) => (
            <PendingUpgradeRow
              key={u.id}
              id={u.id}
              businessId={u.business_id}
              businessName={u.businesses?.name ?? u.business_id}
              requestType={u.request_type}
              detail={u.detail}
              createdAt={u.created_at}
            />
          ))}
        </>
      )}
    </>
  );
}
