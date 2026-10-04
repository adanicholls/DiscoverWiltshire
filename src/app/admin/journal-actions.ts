"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { JOURNAL_IMAGE_BUCKET, JOURNAL_IMAGE_EXTENSIONS, journalImagePath } from "@/lib/journal";
import { parseJournalForm, validateImageFile } from "@/lib/journal-form";

// Server Actions are directly callable, so every one re-checks admin status
// itself rather than trusting that it was only reachable via a gated page.
async function requireAdmin() {
  const { isAdmin } = await getAdminSession();
  if (!isAdmin) throw new Error("Not authorized");
}

// These *return* a result instead of throwing for problems the admin can fix
// (a bad link, a too-big image, a taken address): Next masks the message of a
// thrown error in production builds, and the point is to say what to change.
export type JournalActionResult = { ok: true; id: string } | { ok: false; error: string };
export type JournalDeleteResult = { ok: true } | { ok: false; error: string };
export type JournalImageResult = { ok: true; url: string } | { ok: false; error: string };

function revalidateJournal() {
  revalidatePath("/journal");
  revalidatePath("/journal/[slug]", "page");
  revalidatePath("/admin/journal");
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong";
}

async function uploadImage(file: File): Promise<{ path: string; url: string }> {
  const supabase = createSupabaseAdminClient();
  const path = `${crypto.randomUUID()}.${JOURNAL_IMAGE_EXTENSIONS[file.type]}`;
  const { error } = await supabase.storage
    .from(JOURNAL_IMAGE_BUCKET)
    .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type });
  if (error) throw new Error(`Couldn't upload the image: ${error.message}`);
  return { path, url: supabase.storage.from(JOURNAL_IMAGE_BUCKET).getPublicUrl(path).data.publicUrl };
}

export async function saveJournalEntry(formData: FormData): Promise<JournalActionResult> {
  await requireAdmin();

  try {
    const parsed = parseJournalForm(formData);
    if (!parsed.ok) return { ok: false, error: parsed.error };
    const { id, row, slug, slugFromTitle, cover, removeCover } = parsed.value;

    const supabase = createSupabaseAdminClient();

    let existing: { slug: string; cover_url: string } | null = null;
    if (id) {
      const { data, error } = await supabase.from("journal_entries").select("slug, cover_url").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!data) return { ok: false, error: "That entry no longer exists" };
      existing = data;
    }

    let coverUrl = existing?.cover_url ?? "";
    let uploadedPath: string | null = null;
    if (cover) {
      const uploaded = await uploadImage(cover);
      uploadedPath = uploaded.path;
      coverUrl = uploaded.url;
    } else if (removeCover) {
      coverUrl = "";
    }

    // An article's address is whatever was chosen. A news item's address is
    // never seen (its card links out), so it keeps the one it has, or gets
    // one made from its headline plus a short random suffix.
    const finalSlug =
      row.entry_type === "article" ? slug : existing?.slug || `${slugFromTitle}-${crypto.randomUUID().slice(0, 6)}`;

    const payload = { ...row, slug: finalSlug, cover_url: coverUrl, updated_at: new Date().toISOString() };

    let savedId = id;
    let saveError: { code?: string; message: string } | null = null;
    if (id) {
      const { error } = await supabase.from("journal_entries").update(payload).eq("id", id);
      saveError = error;
    } else {
      const { data, error } = await supabase.from("journal_entries").insert(payload).select("id").single();
      saveError = error;
      savedId = data?.id ?? "";
    }

    if (saveError) {
      // Don't leave the image we just uploaded orphaned in the bucket.
      if (uploadedPath) await supabase.storage.from(JOURNAL_IMAGE_BUCKET).remove([uploadedPath]);
      if (saveError.code === "23505") {
        return { ok: false, error: "That web address is already used by another entry - change the address (slug)" };
      }
      throw new Error(saveError.message);
    }

    // The saved row no longer points at the old cover if it was replaced or
    // removed, so it can go (best effort - a leftover file is harmless).
    if (existing?.cover_url && coverUrl !== existing.cover_url) {
      const oldPath = journalImagePath(existing.cover_url);
      if (oldPath) await supabase.storage.from(JOURNAL_IMAGE_BUCKET).remove([oldPath]);
    }

    revalidateJournal();
    return { ok: true, id: savedId };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}

export async function deleteJournalEntry(id: string): Promise<JournalDeleteResult> {
  await requireAdmin();

  try {
    const supabase = createSupabaseAdminClient();

    const { data: existing, error: existingError } = await supabase
      .from("journal_entries")
      .select("cover_url")
      .eq("id", id)
      .maybeSingle();
    if (existingError) throw existingError;

    const { error } = await supabase.from("journal_entries").delete().eq("id", id);
    if (error) throw error;

    if (existing?.cover_url) {
      const path = journalImagePath(existing.cover_url);
      if (path) await supabase.storage.from(JOURNAL_IMAGE_BUCKET).remove([path]);
    }

    revalidateJournal();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}

/** Uploads an image for the editor's "Insert image" button and returns its
 * public URL to paste into the article as Markdown. */
export async function uploadJournalImage(formData: FormData): Promise<JournalImageResult> {
  await requireAdmin();

  try {
    const file = formData.get("image");
    if (typeof file !== "object" || file === null || !("size" in file) || file.size === 0) {
      return { ok: false, error: "Choose an image to upload" };
    }
    const problem = validateImageFile(file as File);
    if (problem) return { ok: false, error: problem };

    const { url } = await uploadImage(file as File);
    return { ok: true, url };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}
