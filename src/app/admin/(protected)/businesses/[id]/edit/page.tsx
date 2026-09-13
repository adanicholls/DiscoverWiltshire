import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import BusinessEditForm from "@/components/admin/BusinessEditForm";

export const metadata: Metadata = {
  title: "Edit business — Discover Wiltshire admin",
  robots: { index: false, follow: false },
};

export default async function AdminEditBusinessPage({ params }: PageProps<"/admin/businesses/[id]/edit">) {
  const { id } = await params;
  const supabase = createSupabaseAdminClient();
  const { data: business, error } = await supabase.from("businesses").select("*").eq("id", id).maybeSingle();

  if (error || !business) {
    return (
      <div className="card" style={{ marginTop: 24 }}>
        Couldn&apos;t find that business. <Link href="/admin/businesses">Back to businesses</Link>.
      </div>
    );
  }

  return (
    <>
      <Link className="breadcrumb" href="/admin/businesses">
        ← Businesses
      </Link>
      <h1 className="page-title">{business.name}</h1>

      <BusinessEditForm
        id={id}
        initial={{
          name: business.name,
          category_id: business.category_id,
          town_id: business.town_id,
          tagline: business.tagline,
          description: business.description,
          location: business.location,
          price_range: business.price_range,
          phone: business.phone,
          website: business.website,
          photo_color: business.photo_color,
          promoted: business.promoted,
          featured: business.featured,
          founding_member: business.founding_member,
          status: business.status,
        }}
      />
    </>
  );
}
