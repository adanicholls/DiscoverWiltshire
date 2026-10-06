"use server";

import { revalidatePath } from "next/cache";
import { supabase as anonClient } from "@/lib/supabase";
import { getMemberSession } from "@/lib/supabase-server";
import {
  BIO_MAX,
  REPORT_REASON_MAX,
  REPORT_REASON_MIN,
  validateDisplayName,
  validateReview,
} from "@/lib/members";

// Server Actions for signed-in members. Each one looks up the session itself
// (never trusts that the page it came from was already gated) and then
// writes through the member's own cookie-bound Supabase client, so row-level
// security - not just this code - decides what is allowed. They return
// { ok, error } rather than throwing, because production builds replace a
// thrown message with a generic one the member couldn't act on.

export interface ActionResult {
  ok: boolean;
  error?: string;
}

const NOT_SIGNED_IN: ActionResult = { ok: false, error: "Please sign in first." };

interface PgError {
  code?: string;
  message?: string;
}

/** Turns a database error into something a member can act on. */
function friendlyError(error: PgError, fallback: string): string {
  switch (error.code) {
    case "23505":
      return "You've already done that.";
    case "42501":
      return "Your account isn't allowed to do that right now.";
    case "42P01":
    case "PGRST205":
      return "This feature isn't switched on yet - please check back soon.";
    case "P0001":
      // Messages raised on purpose by our own triggers (e.g. the daily review limit).
      return error.message || fallback;
    default:
      console.error("Member action failed:", error);
      return fallback;
  }
}

/** Is this display name free? Used by the sign-up form before it creates the
 * account, because the database would otherwise quietly hand out a generated
 * name when a chosen one is taken. If the lookup itself fails, the sign-up is
 * allowed to carry on. */
export async function checkDisplayNameAvailable(name: string): Promise<ActionResult> {
  const problem = validateDisplayName(name);
  if (problem) return { ok: false, error: problem };

  const escaped = name.trim().replace(/[\\%_]/g, (c) => `\\${c}`);
  const { data, error } = await anonClient.from("profiles").select("id").ilike("display_name", escaped).limit(1);
  if (error) return { ok: true };
  return data && data.length > 0 ? { ok: false, error: "That name is already taken - try another." } : { ok: true };
}

export async function submitReview(businessId: string, rating: number, body: string): Promise<ActionResult> {
  const { supabase, user } = await getMemberSession();
  if (!user) return NOT_SIGNED_IN;

  const problem = validateReview(rating, body);
  if (problem) return { ok: false, error: problem };

  const { error } = await supabase
    .from("reviews")
    .insert({ business_id: businessId, user_id: user.id, rating, body: body.trim(), status: "pending" });
  if (error) {
    if (error.code === "23505") return { ok: false, error: "You've already reviewed this business." };
    return { ok: false, error: friendlyError(error, "Couldn't save your review - please try again.") };
  }

  revalidatePath("/account");
  return { ok: true };
}

export async function deleteMyReview(reviewId: string): Promise<ActionResult> {
  const { supabase, user } = await getMemberSession();
  if (!user) return NOT_SIGNED_IN;

  // The policy only lets a member delete their own rows; the explicit
  // user_id filter keeps the intent obvious and the query narrow.
  const { error } = await supabase.from("reviews").delete().eq("id", reviewId).eq("user_id", user.id);
  if (error) return { ok: false, error: friendlyError(error, "Couldn't delete that review.") };

  revalidatePath("/account");
  return { ok: true };
}

export async function reportReview(reviewId: string, reason: string): Promise<ActionResult> {
  const { supabase, user } = await getMemberSession();
  if (!user) return NOT_SIGNED_IN;

  const text = reason.trim();
  if (text.length < REPORT_REASON_MIN) return { ok: false, error: "Please say briefly what's wrong." };
  if (text.length > REPORT_REASON_MAX) return { ok: false, error: `Please keep it under ${REPORT_REASON_MAX} characters.` };

  const { error } = await supabase
    .from("content_reports")
    .insert({ target_type: "review", target_id: reviewId, reporter_id: user.id, reason: text });
  if (error) {
    if (error.code === "23505") return { ok: true }; // already reported - thank them anyway
    return { ok: false, error: friendlyError(error, "Couldn't send your report - please try again.") };
  }
  return { ok: true };
}

export async function updateBio(bio: string): Promise<ActionResult> {
  const { supabase, user } = await getMemberSession();
  if (!user) return NOT_SIGNED_IN;

  const text = bio.trim();
  if (text.length > BIO_MAX) return { ok: false, error: `Please keep your bio under ${BIO_MAX} characters.` };

  const { error } = await supabase.from("profiles").update({ bio: text }).eq("id", user.id);
  if (error) return { ok: false, error: friendlyError(error, "Couldn't save your bio.") };

  revalidatePath("/account");
  return { ok: true };
}
