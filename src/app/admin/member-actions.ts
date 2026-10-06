"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

// Moderation of member content. As with the other admin actions, each one
// re-checks that the caller is the admin itself (Server Actions can be called
// directly, so page-level gating alone isn't enough). They return
// { ok, error } rather than throwing, since production replaces a thrown
// message with a generic one.

export interface AdminResult {
  ok: boolean;
  error?: string;
}

async function requireAdmin(): Promise<AdminResult | null> {
  const { isAdmin } = await getAdminSession();
  return isAdmin ? null : { ok: false, error: "Not authorized" };
}

/** Puts the review on, or takes it off, the public business page. */
export async function setReviewStatus(reviewId: string, status: "approved" | "declined" | "pending"): Promise<AdminResult> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("reviews").update({ status }).eq("id", reviewId).select("business_id").maybeSingle();
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/reviews");
  if (data?.business_id) revalidatePath(`/business/${data.business_id}`);
  return { ok: true };
}

export async function deleteReview(reviewId: string): Promise<AdminResult> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const supabase = createSupabaseAdminClient();
  const { data: row } = await supabase.from("reviews").select("business_id").eq("id", reviewId).maybeSingle();
  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/reviews");
  if (row?.business_id) revalidatePath(`/business/${row.business_id}`);
  return { ok: true };
}

/** Marks every open report on a review as dealt with. */
export async function resolveReportsFor(reviewId: string): Promise<AdminResult> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("content_reports")
    .update({ resolved: true })
    .eq("target_type", "review")
    .eq("target_id", reviewId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/reviews");
  return { ok: true };
}

/** A banned member can still sign in and read, but can't post reviews or
 * file reports (the database refuses). */
export async function setMemberBanned(memberId: string, banned: boolean): Promise<AdminResult> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("profiles").update({ banned }).eq("id", memberId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/members");
  return { ok: true };
}
