"use client";

import { useState, type FormEvent } from "react";
import { updateBio } from "@/app/member-actions";
import { BIO_MAX } from "@/lib/members";

export default function BioForm({ initialBio }: { initialBio: string }) {
  const [bio, setBio] = useState(initialBio);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    const result = await updateBio(bio);
    setSaving(false);
    if (result.ok) setSaved(true);
    else setError(result.error ?? "Couldn't save your bio.");
  }

  return (
    <form className="bio-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="bio">About you</label>
        <textarea
          id="bio"
          value={bio}
          maxLength={BIO_MAX}
          onChange={(e) => {
            setBio(e.target.value);
            setSaved(false);
          }}
          placeholder="A line or two about you — where you live, what you love about Wiltshire."
        />
        <div className="hint">
          Shown on your public profile. {bio.length}/{BIO_MAX}
        </div>
      </div>
      {error && <p className="auth-error">{error}</p>}
      <div className="bio-form-row">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
        {saved && <span className="bio-saved">Saved</span>}
      </div>
    </form>
  );
}
