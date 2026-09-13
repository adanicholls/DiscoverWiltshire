"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORY_LABELS_CORE, DIRECT_CATEGORY_PAGES, TRADE_CATEGORIES, TOWNS } from "@/lib/data";
import { Store } from "@/lib/store";
import { slugify } from "@/lib/slug";

interface Errors {
  name?: boolean;
  category?: boolean;
  tagline?: boolean;
  location?: boolean;
  town?: boolean;
}

export default function ListingForm() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [town, setTown] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [founding, setFounding] = useState(false);

  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    const newErrors: Errors = {
      name: !name.trim(),
      category: !category,
      tagline: !tagline.trim(),
      location: !location.trim(),
      town: !town,
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setSubmitting(true);
    setSubmitError(false);
    try {
      const id = slugify(name);
      await Store.submitListing({
        id,
        name: name.trim(),
        category,
        tagline: tagline.trim(),
        description: description.trim(),
        location: location.trim(),
        town,
        priceRange,
        phone: phone.trim(),
        website: website.trim(),
      });
      if (founding) {
        await Store.submitUpgradeRequest(id, "founding-member", "requested at listing submission time");
      }
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit listing:", err);
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div id="lb-success">
        <h1 className="page-title">submitted</h1>
        <p style={{ fontSize: 14, opacity: 0.75, lineHeight: 1.7, maxWidth: "55ch" }}>
          Thanks — we&apos;ll review this and get it live within 2 business days. Once it&apos;s approved, it joins
          the leaderboard and can start climbing on real upvotes.
        </p>
        <Link className="btn btn-secondary" href="/">
          Back to the leaderboard
        </Link>
      </div>
    );
  }

  return (
    <div id="lb-form">
      <h1 className="page-title">list your business</h1>
      <p className="page-subtitle">Free to list. Every submission is reviewed before it goes live, usually within 2 business days.</p>

      <div className="field">
        <label htmlFor="biz-name">Business name</label>
        <input id="biz-name" type="text" placeholder="The Old Forge Kitchen" value={name} onChange={(e) => setName(e.target.value)} />
        {errors.name && <div className="err" style={{ display: "block" }}>Enter a business name</div>}
      </div>

      <div className="field">
        <label htmlFor="biz-category">Category</label>
        <select id="biz-category" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Choose a category</option>
          <optgroup label="Eat, stay & things to do">
            {DIRECT_CATEGORY_PAGES.map((id) => (
              <option key={id} value={id}>
                {CATEGORY_LABELS_CORE[id]}
              </option>
            ))}
          </optgroup>
          <optgroup label="Trades & services">
            {TRADE_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </optgroup>
        </select>
        {errors.category && <div className="err" style={{ display: "block" }}>Choose a category</div>}
      </div>

      <div className="field">
        <label htmlFor="biz-tagline">One-line tagline</label>
        <input
          id="biz-tagline"
          type="text"
          placeholder="seasonal menu, chef's table Fridays"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
        />
        <div className="hint">This is what people see in the leaderboard — keep it short.</div>
        {errors.tagline && <div className="err" style={{ display: "block" }}>Add a one-line tagline</div>}
      </div>

      <div className="field">
        <label htmlFor="biz-desc">Description</label>
        <textarea
          id="biz-desc"
          rows={4}
          placeholder="Tell us what makes this place worth a visit"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="biz-location">Location</label>
        <input id="biz-location" type="text" placeholder="e.g. Coombe Bissett" value={location} onChange={(e) => setLocation(e.target.value)} />
        <div className="hint">The specific place — village, street, or town — shown on your profile.</div>
        {errors.location && <div className="err" style={{ display: "block" }}>Add a location</div>}
      </div>

      <div className="field">
        <label htmlFor="biz-town">Nearest town</label>
        <select id="biz-town" value={town} onChange={(e) => setTown(e.target.value)}>
          <option value="">Choose the nearest major town</option>
          {TOWNS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <div className="hint">Used to group you into the right town&apos;s rankings — pick whichever&apos;s closest.</div>
        {errors.town && <div className="err" style={{ display: "block" }}>Choose the nearest town</div>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="field">
          <label htmlFor="biz-price">Price range (optional)</label>
          <select id="biz-price" value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
            <option value="">Not applicable</option>
            <option>£</option>
            <option>££</option>
            <option>£££</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="biz-phone">Phone (optional)</label>
          <input id="biz-phone" type="tel" placeholder="01672 000000" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </div>

      <div className="field">
        <label htmlFor="biz-website">Website or booking link (optional)</label>
        <input id="biz-website" type="url" placeholder="https://" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>

      <div className="field">
        <label>Photos</label>
        <div className="dropzone">Drag photos here, or click to upload (up to 6)</div>
      </div>

      <div className="field founding-opt">
        <input type="checkbox" id="founding-opt" style={{ marginTop: 3 }} checked={founding} onChange={(e) => setFounding(e.target.checked)} />
        <label htmlFor="founding-opt" style={{ margin: 0, cursor: "pointer", fontWeight: 400 }}>
          <div style={{ fontWeight: 500 }}>
            Also become a founding member <span className="tag tag-slot">6 months only</span>
          </div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>
            Lock in today&apos;s promoted-slot pricing for life, one-time fee. You&apos;ll be sent payment details after
            this listing is approved.
          </div>
        </label>
      </div>

      {submitError && (
        <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>
          Something went wrong submitting this — please try again.
        </p>
      )}

      <button
        className="btn btn-primary"
        style={{ width: "100%", justifyContent: "center", padding: 12 }}
        disabled={submitting}
        onClick={handleSubmit}
      >
        {submitting ? "Submitting…" : "Submit for review"}
      </button>
    </div>
  );
}
