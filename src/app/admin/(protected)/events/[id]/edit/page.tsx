import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import EventEditForm from "@/components/admin/EventEditForm";

export const metadata: Metadata = {
  title: "Edit event — Discover Wiltshire admin",
  robots: { index: false, follow: false },
};

export default async function AdminEditEventPage({ params }: PageProps<"/admin/events/[id]/edit">) {
  const { id } = await params;
  const supabase = createSupabaseAdminClient();
  const { data: event, error } = await supabase.from("events").select("*").eq("id", id).maybeSingle();

  if (error || !event) {
    return (
      <div className="card" style={{ marginTop: 24 }}>
        Couldn&apos;t find that event. <Link href="/admin/events">Back to events</Link>.
      </div>
    );
  }

  return (
    <>
      <Link className="breadcrumb" href="/admin/events">
        ← Events
      </Link>
      <h1 className="page-title">{event.name}</h1>

      <EventEditForm
        id={id}
        initial={{
          name: event.name,
          description: event.description,
          starts_at: event.starts_at,
          venue: event.venue,
          town_id: event.town_id,
          website: event.website,
          price_text: event.price_text,
          photo_color: event.photo_color,
          status: event.status,
        }}
      />
    </>
  );
}
