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
      await updateEvent(id, { ...fields, starts_at: new Date(startsAtLocal).toISOString() });
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

      {error && <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>{error}</p>}
      {saved && <p style={{ color: "var(--green)", fontSize: 13, marginBottom: 12 }}>Saved.</p>}

      <button className="btn btn-primary" type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
