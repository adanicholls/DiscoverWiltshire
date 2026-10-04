import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import JournalEntryForm from "@/components/admin/JournalEntryForm";

export const metadata: Metadata = {
  title: "New journal entry — Discover Wiltshire admin",
  robots: { index: false, follow: false },
};

export default async function AdminNewJournalEntryPage() {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("journal_entries").select("category");
  const categories = [...new Set((data ?? []).map((r) => r.category).filter(Boolean))].sort((a, b) => a.localeCompare(b));

  return (
    <>
      <Link className="breadcrumb" href="/admin/journal">
        ← Journal
      </Link>
      <h1 className="page-title">new entry</h1>
      <JournalEntryForm categories={categories} />
    </>
  );
}
