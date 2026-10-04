"use client";

import { useState, useTransition, type FormEvent } from "react";
import Image from "next/image";
import { saveSponsorship } from "@/app/admin/actions";
import { SPONSOR_DEFAULT_COLOR, SPONSOR_IMAGE_TYPES } from "@/lib/sponsors";
import type { SponsorTargetType } from "@/lib/store";

export interface SponsorFormInitial {
  id: string;
  targetType: SponsorTargetType;
  targetId: string;
  sponsorName: string;
  headline: string;
  website: string;
  imageUrl: string;
  photoColor: string;
}

interface Option {
  id: string;
  label: string;
}

interface Props {
  categoryOptions: Option[];
  townOptions: Option[];
  /** Present when editing an existing sponsorship; absent for "add". */
  initial?: SponsorFormInitial;
  onDone?: () => void;
  onCancel?: () => void;
}

export default function SponsorForm({ categoryOptions, townOptions, initial, onDone, onCancel }: Props) {
  const [targetType, setTargetType] = useState<SponsorTargetType>(initial?.targetType ?? "category");
  const [targetId, setTargetId] = useState(initial?.targetId ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const options = targetType === "town" ? townOptions : categoryOptions;
  const idPrefix = initial ? `sponsor-${initial.id}` : "sponsor-new";

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    if (initial) formData.set("id", initial.id);
    setError(null);

    startTransition(async () => {
      const result = await saveSponsorship(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (!initial) {
        form.reset();
        setTargetType("category");
        setTargetId("");
      }
      onDone?.();
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 560 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 14 }}>
        <div className="field">
          <label htmlFor={`${idPrefix}-type`}>Sponsors a</label>
          <select
            id={`${idPrefix}-type`}
            name="target_type"
            value={targetType}
            onChange={(e) => {
              setTargetType(e.target.value as SponsorTargetType);
              setTargetId("");
            }}
          >
            <option value="category">Category</option>
            <option value="town">Town</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor={`${idPrefix}-target`}>{targetType === "town" ? "Town" : "Category"}</label>
          <select
            id={`${idPrefix}-target`}
            name="target_id"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            required
          >
            <option value="">Choose…</option>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor={`${idPrefix}-name`}>Sponsor name</label>
        <input
          id={`${idPrefix}-name`}
          name="sponsor_name"
          type="text"
          defaultValue={initial?.sponsorName}
          maxLength={80}
          required
        />
      </div>

      <div className="field">
        <label htmlFor={`${idPrefix}-headline`}>Headline (optional)</label>
        <input
          id={`${idPrefix}-headline`}
          name="headline"
          type="text"
          defaultValue={initial?.headline}
          maxLength={120}
          placeholder="A short line under the name"
        />
      </div>

      <div className="field">
        <label htmlFor={`${idPrefix}-website`}>Website (optional)</label>
        <input
          id={`${idPrefix}-website`}
          name="website"
          type="text"
          defaultValue={initial?.website}
          placeholder="example.co.uk"
        />
        <div className="hint">The whole card links here. Leave blank for a card that isn&apos;t clickable.</div>
      </div>

      <div className="field">
        <label htmlFor={`${idPrefix}-image`}>Image</label>
        {initial?.imageUrl && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <Image
              src={initial.imageUrl}
              alt="Current sponsor image"
              width={64}
              height={64}
              style={{ objectFit: "cover", borderRadius: 8 }}
            />
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 400, margin: 0 }}>
              <input type="checkbox" name="remove_image" /> Remove this image
            </label>
          </div>
        )}
        <input id={`${idPrefix}-image`} name="image" type="file" accept={SPONSOR_IMAGE_TYPES.join(",")} />
        <div className="hint">
          PNG, JPG, WebP or GIF, up to 2MB. Square works best.
          {initial?.imageUrl ? " Choosing a new file replaces the current one." : ""}
        </div>
      </div>

      <div className="field">
        <label htmlFor={`${idPrefix}-color`}>Fallback colour</label>
        <input
          id={`${idPrefix}-color`}
          name="photo_color"
          type="color"
          defaultValue={initial?.photoColor ?? SPONSOR_DEFAULT_COLOR}
          style={{ width: 56, height: 36, padding: 2 }}
        />
        <div className="hint">Shown with the sponsor&apos;s initial until an image is added.</div>
      </div>

      {error && <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>{error}</p>}

      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-primary" type="submit" disabled={pending}>
          {pending ? "Saving…" : initial ? "Save changes" : "Add sponsor"}
        </button>
        {onCancel && (
          <button className="btn btn-secondary" type="button" disabled={pending} onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
