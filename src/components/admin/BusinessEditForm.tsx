"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateBusiness, type BusinessEditFields } from "@/app/admin/actions";
import { CATEGORY_LABELS_CORE, DIRECT_CATEGORY_PAGES, TOWNS, type TradeCategory } from "@/lib/data";

interface Props {
  id: string;
  initial: BusinessEditFields;
  tradeCategories: TradeCategory[];
}

export default function BusinessEditForm({ id, initial, tradeCategories }: Props) {
  const router = useRouter();
  const [fields, setFields] = useState<BusinessEditFields>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof BusinessEditFields>(key: K, value: BusinessEditFields[K]) {
    setFields((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateBusiness(id, fields);
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
        <label htmlFor="edit-name">Business name</label>
        <input id="edit-name" type="text" value={fields.name} onChange={(e) => set("name", e.target.value)} />
      </div>

      <div className="field">
        <label htmlFor="edit-status">Status</label>
        <select id="edit-status" value={fields.status} onChange={(e) => set("status", e.target.value as BusinessEditFields["status"])}>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="declined">Declined</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="edit-category">Category</label>
        <select id="edit-category" value={fields.category_id} onChange={(e) => set("category_id", e.target.value)}>
          <optgroup label="Eat, stay & things to do">
            {DIRECT_CATEGORY_PAGES.map((catId) => (
              <option key={catId} value={catId}>
                {CATEGORY_LABELS_CORE[catId]}
              </option>
            ))}
          </optgroup>
          <optgroup label="Trades & services">
            {tradeCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      <div className="field">
        <label htmlFor="edit-tagline">Tagline</label>
        <input id="edit-tagline" type="text" value={fields.tagline} onChange={(e) => set("tagline", e.target.value)} />
      </div>

      <div className="field">
        <label htmlFor="edit-description">Description</label>
        <textarea id="edit-description" rows={4} value={fields.description} onChange={(e) => set("description", e.target.value)} />
      </div>

      <div className="field">
        <label htmlFor="edit-location">Location</label>
        <input id="edit-location" type="text" value={fields.location} onChange={(e) => set("location", e.target.value)} />
      </div>

      <div className="field">
        <label htmlFor="edit-town">Nearest town</label>
        <select id="edit-town" value={fields.town_id ?? ""} onChange={(e) => set("town_id", e.target.value || null)}>
          <option value="">— none —</option>
          {TOWNS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="field">
          <label htmlFor="edit-price">Price range</label>
          <select id="edit-price" value={fields.price_range} onChange={(e) => set("price_range", e.target.value)}>
            <option value="">Not applicable</option>
            <option>£</option>
            <option>££</option>
            <option>£££</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="edit-phone">Phone</label>
          <input id="edit-phone" type="tel" value={fields.phone} onChange={(e) => set("phone", e.target.value)} />
        </div>
      </div>

      <div className="field">
        <label htmlFor="edit-website">Website</label>
        <input id="edit-website" type="text" value={fields.website} onChange={(e) => set("website", e.target.value)} />
      </div>

      <div className="field">
        <label htmlFor="edit-photo-color">Placeholder photo colour</label>
        <input id="edit-photo-color" type="text" value={fields.photo_color} onChange={(e) => set("photo_color", e.target.value)} />
      </div>

      <div className="field" style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 400 }}>
          <input type="checkbox" checked={fields.promoted} onChange={(e) => set("promoted", e.target.checked)} /> Promoted
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 400 }}>
          <input type="checkbox" checked={fields.featured} onChange={(e) => set("featured", e.target.checked)} /> Featured
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 400 }}>
          <input type="checkbox" checked={fields.founding_member} onChange={(e) => set("founding_member", e.target.checked)} /> Founding member
        </label>
      </div>

      {error && <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>{error}</p>}
      {saved && <p style={{ color: "var(--green)", fontSize: 13, marginBottom: 12 }}>Saved.</p>}

      <button className="btn btn-primary" type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
