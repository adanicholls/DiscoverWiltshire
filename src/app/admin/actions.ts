"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

// Every action re-checks admin status itself rather than trusting that it
// was only reachable via an already-gated page - Server Actions are
// callable directly, so page-level gating (proxy.ts, admin/layout.tsx)
// isn't sufficient on its own. See Next.js's authentication guide.
async function requireAdmin() {
  const { isAdmin } = await getAdminSession();
  if (!isAdmin) throw new Error("Not authorized");
}

export async function approveListing(id: string) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("businesses").update({ status: "approved" }).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin");
}

export async function declineListing(id: string) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("businesses").update({ status: "declined" }).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin");
}

export async function deleteBusiness(id: string) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("businesses").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin");
  revalidatePath("/admin/businesses");
}

export async function approveUpgradeRequest(requestId: string, businessId: string, type: "promoted-slot" | "founding-member") {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const { error: requestError } = await supabase
    .from("upgrade_requests")
    .update({ status: "approved" })
    .eq("id", requestId);
  if (requestError) throw requestError;

  // Simplified today, same as the rest of the site: approving just flips
  // the flag rather than enforcing the real 4-sellable-slots model or
  // capturing payment - see the promoted-slot note in Leaderboard.tsx.
  const field = type === "promoted-slot" ? "promoted" : "founding_member";
  const { error: businessError } = await supabase.from("businesses").update({ [field]: true }).eq("id", businessId);
  if (businessError) throw businessError;

  revalidatePath("/admin");
}

export async function declineUpgradeRequest(requestId: string) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("upgrade_requests").update({ status: "declined" }).eq("id", requestId);
  if (error) throw error;
  revalidatePath("/admin");
}

export interface BusinessEditFields {
  name: string;
  category_id: string;
  town_id: string | null;
  tagline: string;
  description: string;
  location: string;
  price_range: string;
  phone: string;
  website: string;
  photo_color: string;
  promoted: boolean;
  featured: boolean;
  founding_member: boolean;
  status: "pending" | "approved" | "declined";
}

export async function updateBusiness(id: string, fields: BusinessEditFields) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("businesses").update(fields).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/businesses");
  revalidatePath(`/business/${id}`);
}
