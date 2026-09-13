"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { slugifyBase } from "@/lib/slug";

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

// Trade categories (Painters, Plumbers, and anything added later, like
// Motoring or Solar) live in the `categories` table so they're editable
// here instead of needing a code change + redeploy. The four core
// categories (eat-drink, stay, things-to-do, shops) each have their own
// hand-built page and aren't managed through this UI.
export async function addCategory(label: string): Promise<void> {
  await requireAdmin();
  const trimmed = label.trim();
  if (!trimmed) throw new Error("Enter a category name");

  const id = slugifyBase(trimmed);
  if (!id) throw new Error("That name doesn't produce a usable id — try adding a letter or number");

  const supabase = createSupabaseAdminClient();

  const { data: existing, error: existingError } = await supabase
    .from("categories")
    .select("id")
    .eq("id", id)
    .maybeSingle();
  if (existingError) throw existingError;
  if (existing) throw new Error(`A category with id "${id}" already exists`);

  const { data: maxRow, error: maxError } = await supabase
    .from("categories")
    .select("sort_order")
    .eq("category_group", "trade")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (maxError) throw maxError;
  const sortOrder = (maxRow?.sort_order ?? 9) + 1;

  const { error } = await supabase
    .from("categories")
    .insert({ id, label: trimmed, category_group: "trade", sort_order: sortOrder });
  if (error) throw error;

  revalidatePath("/admin/categories");
  revalidatePath("/trades", "layout");
}

export async function updateCategoryLabel(id: string, label: string): Promise<void> {
  await requireAdmin();
  const trimmed = label.trim();
  if (!trimmed) throw new Error("Enter a category name");

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("categories").update({ label: trimmed }).eq("id", id);
  if (error) throw error;

  revalidatePath("/admin/categories");
  revalidatePath("/trades", "layout");
}

export async function deleteCategory(id: string): Promise<void> {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  // Deleting a category out from under existing businesses would leave
  // them pointing at a category_id that no longer resolves to anything
  // (or violate the FK outright) - block it and tell the admin why.
  const { count, error: countError } = await supabase
    .from("businesses")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);
  if (countError) throw countError;
  if (count && count > 0) {
    throw new Error(`${count} business${count === 1 ? "" : "es"} still use this category — move or delete them first`);
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/admin/categories");
  revalidatePath("/trades", "layout");
}
