"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { slugifyBase } from "@/lib/slug";
import { Store } from "@/lib/store";
import { TOWN_LABELS } from "@/lib/data";
import {
  SPONSOR_DEFAULT_COLOR,
  SPONSOR_IMAGE_BUCKET,
  SPONSOR_IMAGE_MAX_BYTES,
  SPONSOR_IMAGE_TYPES,
  isHexColor,
  normalizeWebsite,
  sponsorImagePath,
} from "@/lib/sponsors";

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

// Events (the "what's on" calendar) go through the same
// submit-pending / admin-approve flow as business listings.
export async function approveEvent(id: string) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("events").update({ status: "approved" }).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin");
  revalidatePath("/whats-on");
  revalidatePath("/towns/[slug]", "page");
  revalidatePath("/");
}

export async function declineEvent(id: string) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("events").update({ status: "declined" }).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin");
}

export async function deleteEvent(id: string) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin");
  revalidatePath("/admin/events");
  revalidatePath("/whats-on");
  revalidatePath("/towns/[slug]", "page");
  revalidatePath("/");
}

export interface EventEditFields {
  name: string;
  description: string;
  starts_at: string;
  venue: string;
  town_id: string | null;
  website: string;
  price_text: string;
  photo_color: string;
  status: "pending" | "approved" | "declined";
}

export async function updateEvent(id: string, fields: EventEditFields) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("events").update(fields).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/events");
  revalidatePath("/whats-on");
  // The event's town (or status) may have just changed, so any town page
  // could now be showing a stale list.
  revalidatePath("/towns/[slug]", "page");
  revalidatePath("/");
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

// Sponsorships: the image-led "Sponsored" card on a category or town page.
//
// Unlike the actions above these *return* a result instead of throwing for
// problems the admin can fix (bad link, wrong file type, "that town already
// has a sponsor"): Next masks the message of a thrown error in production
// builds, and the whole point here is telling them what to change.
export type SponsorActionResult = { ok: true } | { ok: false; error: string };

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

function revalidateSponsorPages() {
  revalidatePath("/admin/sponsors");
  // Town pages are statically generated; category pages render per request.
  revalidatePath("/towns/[slug]", "page");
}

export async function saveSponsorship(formData: FormData): Promise<SponsorActionResult> {
  await requireAdmin();

  try {
    const id = String(formData.get("id") ?? "");
    const targetType = String(formData.get("target_type") ?? "");
    const targetId = String(formData.get("target_id") ?? "");
    const sponsorName = String(formData.get("sponsor_name") ?? "").trim();
    const headline = String(formData.get("headline") ?? "").trim();
    const website = normalizeWebsite(String(formData.get("website") ?? ""));
    const colorInput = String(formData.get("photo_color") ?? "");
    const photoColor = isHexColor(colorInput) ? colorInput : SPONSOR_DEFAULT_COLOR;
    const removeImage = formData.get("remove_image") === "on";
    const file = formData.get("image");

    if (targetType !== "category" && targetType !== "town") {
      throw new Error("Choose whether this sponsors a category or a town");
    }
    if (!targetId) throw new Error("Choose which page is being sponsored");
    if (!sponsorName) throw new Error("Enter the sponsor's name");
    if (sponsorName.length > 80) throw new Error("The sponsor's name is too long (80 characters max)");
    if (headline.length > 120) throw new Error("The headline is too long (120 characters max)");

    // target_id has no foreign key (it points at two different tables), so
    // check here that it names something real.
    if (targetType === "town") {
      if (!TOWN_LABELS[targetId]) throw new Error("That town doesn't exist");
    } else {
      const labels = await Store.getCategoryLabels();
      if (!labels[targetId]) throw new Error("That category doesn't exist");
    }

    const supabase = createSupabaseAdminClient();

    let existingImageUrl = "";
    if (id) {
      const { data: existing, error: existingError } = await supabase
        .from("sponsorships")
        .select("image_url")
        .eq("id", id)
        .maybeSingle();
      if (existingError) throw existingError;
      if (!existing) throw new Error("That sponsorship no longer exists");
      existingImageUrl = existing.image_url;
    }

    let imageUrl = existingImageUrl;
    let uploadedPath: string | null = null;

    if (file instanceof File && file.size > 0) {
      if (!SPONSOR_IMAGE_TYPES.includes(file.type)) {
        throw new Error("The image must be a PNG, JPG, WebP or GIF");
      }
      if (file.size > SPONSOR_IMAGE_MAX_BYTES) {
        throw new Error("The image is too big - 2MB is the most it can be");
      }
      const path = `${crypto.randomUUID()}.${IMAGE_EXTENSIONS[file.type]}`;
      const { error: uploadError } = await supabase.storage
        .from(SPONSOR_IMAGE_BUCKET)
        .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type });
      if (uploadError) throw new Error(`Couldn't upload the image: ${uploadError.message}`);
      uploadedPath = path;
      imageUrl = supabase.storage.from(SPONSOR_IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
    } else if (removeImage) {
      imageUrl = "";
    }

    const row = {
      target_type: targetType,
      target_id: targetId,
      sponsor_name: sponsorName,
      headline,
      website,
      image_url: imageUrl,
      photo_color: photoColor,
    };
    const { error: saveError } = id
      ? await supabase.from("sponsorships").update(row).eq("id", id)
      : await supabase.from("sponsorships").insert(row);

    if (saveError) {
      // Don't leave the image we just uploaded orphaned in the bucket.
      if (uploadedPath) await supabase.storage.from(SPONSOR_IMAGE_BUCKET).remove([uploadedPath]);
      if (saveError.code === "23505") {
        throw new Error(
          `That ${targetType} already has a sponsor - edit or delete the existing one instead of adding another`
        );
      }
      throw saveError;
    }

    // The saved row no longer points at the old image if it was replaced or
    // removed, so it can go (best effort - a leftover file is harmless).
    if (existingImageUrl && imageUrl !== existingImageUrl) {
      const oldPath = sponsorImagePath(existingImageUrl);
      if (oldPath) await supabase.storage.from(SPONSOR_IMAGE_BUCKET).remove([oldPath]);
    }

    revalidateSponsorPages();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Something went wrong" };
  }
}

export async function deleteSponsorship(id: string): Promise<SponsorActionResult> {
  await requireAdmin();

  try {
    const supabase = createSupabaseAdminClient();

    const { data: existing, error: existingError } = await supabase
      .from("sponsorships")
      .select("image_url")
      .eq("id", id)
      .maybeSingle();
    if (existingError) throw existingError;

    const { error } = await supabase.from("sponsorships").delete().eq("id", id);
    if (error) throw error;

    if (existing?.image_url) {
      const path = sponsorImagePath(existing.image_url);
      if (path) await supabase.storage.from(SPONSOR_IMAGE_BUCKET).remove([path]);
    }

    revalidateSponsorPages();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Something went wrong" };
  }
}
