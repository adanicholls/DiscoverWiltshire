"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateEvent, type EventEditFields } from "@/app/admin/actions";
import { TOWNS } from "@/lib/data";

interface Props {
  id: string;
  initial: EventEditFields;
}

// datetime-local inputs need a zone-less "YYYY-MM-DDTHH:mm" string. Reading
// the Date object's local getters (rather than any UTC/ISO slicing) means
// this renders in whichever timezone the admin's own browser is in - fine
// here since the admin is in the UK, same as EventForm's submit side.
function toLocalInputValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EventEditForm({ id, initial }: Props) {
  const router = useRouter();
  const [fields, setFields] = useState<EventEditFields>(initial);
  const [startsAtLocal, setStartsAtLocal] = useState(toLocalInputValue(initial.starts_at));
  const [endsAtLocal, setEndsAtLocal] = useState(initial.ends_at ? toLocalInputValue(initial.ends_at) : "");
  // The featured-slot controls only appear once migration 0008 has added the columns.
  const hasFeatured = initial.featured !== undefined;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof EventEditFields>(key: K, value: EventEditFields[K]) {
    setFields((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateEvent(id, {
        ...fields,
        starts_at: new Date(startsAtLocal).toISOString(),
        ...(hasFeatured ? { ends_at: endsAtLocal ? new Date(endsAtLocal).toISOString() : null } : {}),
      });
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
      <div className="field">
        <label htmlFor="edit-ev-name">Event name</label>
        <input id="edit-ev-name" type="text" value={fields.name} onChange={(e) => set("name", e.target.value)} />
      </div>

      <div className="field">
        <label htmlFor="edit-ev-status">Status</label>
        <select id="edit-ev-status" value={fields.status} onChange={(e) => set("status", e.target.value as EventEditFields["status"])}>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="declined">Declined</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="edit-ev-desc">Description</label>
        <textarea id="edit-ev-desc" rows={4} value={fields.description} onChange={(e) => set("description", e.target.value)} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="field">
          <label htmlFor="edit-ev-starts">Date &amp; time</label>
          <input
            id="edit-ev-starts"
            type="datetime-local"
            value={startsAtLocal}
            onChange={(e) => {
              setStartsAtLocal(e.target.value);
              setSaved(false);
            }}
          />
        </div>
        <div className="field">
          <label htmlFor="edit-ev-price">Price</label>
          <input id="edit-ev-price" type="text" value={fields.price_text} onChange={(e) => set("price_text", e.target.value)} />
        </div>
      </div>

      <div className="field">
        <label htmlFor="edit-ev-venue">Venue</label>
        <input id="edit-ev-venue" type="text" value={fields.venue} onChange={(e) => set("venue", e.target.value)} />
      </div>

      <div className="field">
        <label htmlFor="edit-ev-town">Nearest town</label>
        <select id="edit-ev-town" value={fields.town_id ?? ""} onChange={(e) => set("town_id", e.target.value || null)}>
          <option value="">— none —</option>
          {TOWNS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="edit-ev-website">Website / ticket link</label>
        <input id="edit-ev-website" type="text" value={fields.website} onChange={(e) => set("website", e.target.value)} />
      </div>

      <div className="field">
        <label htmlFor="edit-ev-photo-color">Placeholder photo colour</label>
        <input id="edit-ev-photo-color" type="text" value={fields.photo_color} onChange={(e) => set("photo_color", e.target.value)} />
      </div>

      {hasFeatured && (
        <fieldset style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "16px 18px 6px", margin: "8px 0 20px" }}>
          <legend style={{ padding: "0 8px", fontSize: 13, fontWeight: 500 }}>Featured slot on /whats-on</legend>

          <div className="field">
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                style={{ width: "auto" }}
                checked={!!fields.featured}
                onChange={(e) => set("featured", e.target.checked)}
              />
              Show this event in the banner slot at the top of the page
            </label>
            <div className="hint">
              Only one event can hold the slot - ticking this releases whichever event has it now. The event must be
              Approved. It stays in the slot until its end date below.
            </div>
          </div>

          {fields.featured && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="field">
                  <label htmlFor="edit-ev-ends">Last day (optional)</label>
                  <input
                    id="edit-ev-ends"
                    type="datetime-local"
                    value={endsAtLocal}
                    onChange={(e) => {
                      setEndsAtLocal(e.target.value);
                      setSaved(false);
                    }}
                  />
                  <div className="hint">For a multi-day event. Leave blank for a single day.</div>
                </div>
                <div className="field">
                  <label htmlFor="edit-ev-label">Label on the card</label>
                  <select id="edit-ev-label" value={fields.sponsor_label ?? "Featured"} onChange={(e) => set("sponsor_label", e.target.value)}>
                    <option value="Sponsored">Sponsored (paid placement)</option>
                    <option value="Featured">Featured (editorial pick)</option>
                  </select>
                </div>
              </div>

              <div className="field">
                <label htmlFor="edit-ev-image">Banner image address</label>
                <input
                  id="edit-ev-image"
                  type="text"
                  value={fields.image_url ?? ""}
                  onChange={(e) => set("image_url", e.target.value)}
                  placeholder="https://…"
                />
                <div className="hint">A wide picture works best (16:9). Make sure you have permission to use it.</div>
              </div>

              <div className="field">
                <label htmlFor="edit-ev-cta">Button text</label>
                <input id="edit-ev-cta" type="text" value={fields.cta_label ?? ""} onChange={(e) => set("cta_label", e.target.value)} />
                <div className="hint">The button links to the website / ticket link above.</div>
              </div>
            </>
          )}
        </fieldset>
      )}
      {error && <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>{error}</p>}
      {saved && <p style={{ color: "var(--green)", fontSize: 13, marginBottom: 12 }}>Saved.</p>}

      <button className="btn btn-primary" type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
