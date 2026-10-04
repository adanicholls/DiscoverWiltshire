"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { saveJournalEntry, uploadJournalImage } from "@/app/admin/journal-actions";
import JournalBody from "@/components/journal/JournalBody";
import RemoteImage from "@/components/RemoteImage";
import { JOURNAL_IMAGE_TYPES, type JournalEntryType, type JournalStatus } from "@/lib/journal";
import { slugifyBase } from "@/lib/slug";

export interface JournalFormInitial {
  id: string;
  type: JournalEntryType;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  body: string;
  coverUrl: string;
  authorName: string;
  externalUrl: string;
  ctaLabel: string;
  status: JournalStatus;
  publishedAt: string;
}

interface Props {
  /** Present when editing; absent when writing a new entry. */
  initial?: JournalFormInitial;
  /** Categories already in use, offered as suggestions so spellings stay consistent. */
  categories: string[];
}

// datetime-local wants a zone-less "YYYY-MM-DDTHH:mm" in the admin's own time.
function toLocalInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function JournalEntryForm({ initial, categories }: Props) {
  const router = useRouter();
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState<JournalEntryType>(initial?.type ?? "article");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  // An existing entry's address is left alone; a new one follows the title
  // until the admin types their own.
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [body, setBody] = useState(initial?.body ?? "");
  const [previewing, setPreviewing] = useState(false);
  const [publishedLocal, setPublishedLocal] = useState(() =>
    toLocalInput(initial ? new Date(initial.publishedAt) : new Date())
  );
  const [fileKey, setFileKey] = useState(0);

  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const isArticle = type === "article";

  // --- Markdown toolbar --------------------------------------------------

  function edit(next: (text: string, start: number, end: number) => { text: string; start: number; end: number }) {
    const ta = bodyRef.current;
    if (!ta) return;
    // The textarea's own value, not the `body` from this render: an image
    // upload finishes seconds after it started, and anything typed in the
    // meantime must not be overwritten.
    const result = next(ta.value, ta.selectionStart, ta.selectionEnd);
    setBody(result.text);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(result.start, result.end);
    });
  }

  function wrap(before: string, after: string, placeholder: string) {
    edit((text, start, end) => {
      const selected = text.slice(start, end) || placeholder;
      return {
        text: text.slice(0, start) + before + selected + after + text.slice(end),
        start: start + before.length,
        end: start + before.length + selected.length,
      };
    });
  }

  function prefixLines(prefix: string) {
    edit((text, start, end) => {
      const from = text.lastIndexOf("\n", start - 1) + 1;
      const nl = text.indexOf("\n", end);
      const to = nl === -1 ? text.length : nl;
      const block = text
        .slice(from, to)
        .split("\n")
        .map((line) => prefix + line)
        .join("\n");
      return { text: text.slice(0, from) + block + text.slice(to), start: from, end: from + block.length };
    });
  }

  async function insertImage(file: File) {
    setError(null);
    setUploading(true);
    const formData = new FormData();
    formData.set("image", file);
    const result = await uploadJournalImage(formData);
    setUploading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
    const snippet = `\n\n![${alt}](${result.url})\n\n`;
    if (bodyRef.current) {
      edit((text, start, end) => ({
        text: text.slice(0, start) + snippet + text.slice(end),
        start: start + snippet.length,
        end: start + snippet.length,
      }));
    } else {
      // They switched to Preview while it uploaded - there's no cursor, so
      // the image goes at the end rather than being lost.
      setBody((prev) => prev + snippet);
    }
  }

  // --- Saving ------------------------------------------------------------

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    const formData = new FormData(e.currentTarget);
    if (initial) formData.set("id", initial.id);
    formData.set("entry_type", type);
    formData.set("title", title);
    formData.set("slug", slug);
    formData.set("body", body);
    // The picker's value has no timezone; new Date() reads it as this
    // browser's local time, and toISOString() turns that into a real instant.
    if (publishedLocal) formData.set("published_at", new Date(publishedLocal).toISOString());
    else formData.delete("published_at");

    startTransition(async () => {
      const result = await saveJournalEntry(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setFileKey((k) => k + 1); // clear the chosen cover file so it isn't re-sent
      if (!initial) {
        router.push(`/admin/journal/${result.id}/edit`);
      } else {
        setSaved(true);
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 760 }}>
      <fieldset className="field" style={{ border: 0, padding: 0 }}>
        <legend style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>What kind of entry is this?</legend>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 400 }}>
            <input type="radio" name="entry_type_choice" checked={isArticle} onChange={() => setType("article")} />
            Article <span style={{ opacity: 0.6, fontSize: 12 }}>— has its own page</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 400 }}>
            <input type="radio" name="entry_type_choice" checked={!isArticle} onChange={() => setType("news")} />
            News <span style={{ opacity: 0.6, fontSize: 12 }}>— links to another website</span>
          </label>
        </div>
      </fieldset>

      <div className="field">
        <label htmlFor="je-title">{isArticle ? "Title" : "Headline"}</label>
        <input
          id="je-title"
          type="text"
          value={title}
          maxLength={200}
          required
          onChange={(e) => {
            setTitle(e.target.value);
            if (!slugTouched) setSlug(slugifyBase(e.target.value));
          }}
        />
        {!isArticle && (
          <div className="hint">For news this is the whole text on the card, so a sentence or two works well.</div>
        )}
      </div>

      {isArticle && (
        <div className="field">
          <label htmlFor="je-slug">Web address</label>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13, opacity: 0.6, whiteSpace: "nowrap" }}>/journal/</span>
            <input
              id="je-slug"
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              placeholder="made-from-the-title"
            />
          </div>
          <div className="hint">
            Lowercase words joined by hyphens. Changing it later breaks any links already shared.
          </div>
        </div>
      )}

      <div className="field">
        <label htmlFor="je-category">Category (optional)</label>
        <input id="je-category" name="category" type="text" list="je-categories" defaultValue={initial?.category} maxLength={40} />
        <datalist id="je-categories">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <div className="hint">Becomes a filter on the journal page. Pick an existing one to keep spelling consistent.</div>
      </div>

      <div className="field">
        <label htmlFor="je-cover">{isArticle ? "Cover image" : "Image"}</label>
        {initial?.coverUrl && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ position: "relative", width: 72, height: 72, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
              <RemoteImage src={initial.coverUrl} alt="Current cover" sizes="72px" />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 400, margin: 0 }}>
              <input type="checkbox" name="remove_cover" /> Remove this image
            </label>
          </div>
        )}
        <input key={fileKey} id="je-cover" name="cover" type="file" accept={JOURNAL_IMAGE_TYPES.join(",")} />
        <div className="hint">
          PNG, JPG, WebP or GIF, up to 3MB. Shown on the card{isArticle ? " and at the top of the article" : ""}; a
          square picture works best.
          {initial?.coverUrl ? " Choosing a new file replaces the current one." : ""}
        </div>
      </div>

      {isArticle ? (
        <>
          <div className="field">
            <label htmlFor="je-excerpt">Summary (optional)</label>
            <textarea
              id="je-excerpt"
              name="excerpt"
              rows={2}
              maxLength={300}
              defaultValue={initial?.excerpt}
              placeholder="One or two sentences - used when the article is shared or found in a search"
            />
          </div>

          <div className="field">
            <label htmlFor="je-body">Article</label>
            <div className="journal-editor-toolbar">
              <button type="button" className="btn btn-secondary" onClick={() => setPreviewing(false)} aria-pressed={!previewing} style={!previewing ? { borderColor: "var(--ink)" } : undefined}>
                Write
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setPreviewing(true)} aria-pressed={previewing} style={previewing ? { borderColor: "var(--ink)" } : undefined}>
                Preview
              </button>
              {!previewing && (
                <>
                  <span style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />
                  <button type="button" className="btn btn-secondary" title="Heading" onClick={() => prefixLines("## ")}>H</button>
                  <button type="button" className="btn btn-secondary" title="Bold" onClick={() => wrap("**", "**", "bold text")}><strong>B</strong></button>
                  <button type="button" className="btn btn-secondary" title="Italic" onClick={() => wrap("*", "*", "italic text")}><em>I</em></button>
                  <button type="button" className="btn btn-secondary" title="Link" onClick={() => wrap("[", "](https://)", "link text")}>Link</button>
                  <button type="button" className="btn btn-secondary" title="Bulleted list" onClick={() => prefixLines("- ")}>List</button>
                  <button type="button" className="btn btn-secondary" title="Quote" onClick={() => prefixLines("> ")}>Quote</button>
                  <button type="button" className="btn btn-secondary" disabled={uploading} onClick={() => imageInputRef.current?.click()}>
                    {uploading ? "Uploading…" : "Insert image"}
                  </button>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept={JOURNAL_IMAGE_TYPES.join(",")}
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (file) void insertImage(file);
                    }}
                  />
                </>
              )}
            </div>

            {previewing ? (
              <div className="journal-editor-preview">
                <JournalBody markdown={body.trim() ? body : "*Nothing to preview yet.*"} />
              </div>
            ) : (
              <textarea
                id="je-body"
                ref={bodyRef}
                className="journal-editor-text"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={"Start writing…\n\n## A heading\n\nA paragraph of text."}
              />
            )}

            <details className="journal-help">
              <summary>Formatting help</summary>
              <p>
                Leave a blank line between paragraphs. <code>## Heading</code> · <code>**bold**</code> ·{" "}
                <code>*italic*</code> · <code>[link text](https://example.com)</code> · <code>- bullet</code> ·{" "}
                <code>1. numbered</code> · <code>&gt; quote</code> · <code>![description](image-url)</code>. The
                buttons above insert these for you, and &ldquo;Insert image&rdquo; uploads a picture and places it
                where your cursor is.
              </p>
            </details>
          </div>
        </>
      ) : (
        <>
          <div className="field">
            <label htmlFor="je-url">Link to</label>
            <input id="je-url" name="external_url" type="text" defaultValue={initial?.externalUrl} placeholder="example.com/the-story" />
            <div className="hint">The card opens this page in a new tab.</div>
          </div>
          <div className="field">
            <label htmlFor="je-cta">Button text</label>
            <input id="je-cta" name="cta_label" type="text" defaultValue={initial?.ctaLabel || "Read article"} maxLength={30} />
            <div className="hint">Appears on the image when someone hovers the card, e.g. &ldquo;Read article&rdquo; or &ldquo;Visit the website&rdquo;.</div>
          </div>
        </>
      )}

      <div className="field">
        <label htmlFor="je-author">Author (optional)</label>
        <input id="je-author" name="author_name" type="text" defaultValue={initial?.authorName} maxLength={80} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="field">
          <label htmlFor="je-date">Publish date</label>
          <input id="je-date" type="datetime-local" value={publishedLocal} onChange={(e) => setPublishedLocal(e.target.value)} />
          <div className="hint">A date in the future holds it back until then.</div>
        </div>
        <div className="field">
          <label htmlFor="je-status">Status</label>
          <select id="je-status" name="status" defaultValue={initial?.status ?? "draft"}>
            <option value="draft">Draft — only you can see it</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      {error && <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>{error}</p>}
      {saved && <p style={{ color: "var(--green)", fontSize: 13, marginBottom: 12 }}>Saved.</p>}

      <button className="btn btn-primary" type="submit" disabled={pending || uploading}>
        {pending ? "Saving…" : initial ? "Save changes" : "Create entry"}
      </button>
    </form>
  );
}
