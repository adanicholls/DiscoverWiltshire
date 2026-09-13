"use client";

import { useState } from "react";
import Link from "next/link";
import { TOWNS } from "@/lib/data";
import { Store } from "@/lib/store";

interface Errors {
  name?: boolean;
  startsAt?: boolean;
  venue?: boolean;
  town?: boolean;
}

export default function EventForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [venue, setVenue] = useState("");
  const [town, setTown] = useState("");
  const [website, setWebsite] = useState("");
  const [priceText, setPriceText] = useState("");

  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    const newErrors: Errors = {
      name: !name.trim(),
      startsAt: !startsAt,
      venue: !venue.trim(),
      town: !town,
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setSubmitting(true);
    setSubmitError(false);
    try {
      // datetime-local gives a zone-less string ("2026-07-16T19:30") that
      // the Date constructor parses as this browser's local time - since
      // the whole audience is Wiltshire, that's the right interpretation,
      // and toISOString() converts it to a real UTC instant for storage.
      await Store.submitEvent({
        name: name.trim(),
        description: description.trim(),
        startsAt: new Date(startsAt).toISOString(),
        venue: venue.trim(),
        town,
        website: website.trim(),
        priceText: priceText.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit event:", err);
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
          Thanks — we&apos;ll review this and get it on the calendar within 2 business days.
        </p>
        <Link className="btn btn-secondary" href="/whats-on">
          Back to what&apos;s on
        </Link>
      </div>
    );
  }

  return (
    <div id="lb-form">
      <h1 className="page-title">add your event</h1>
      <p className="page-subtitle">Free to list. Every submission is reviewed before it goes live, usually within 2 business days.</p>

      <div className="field">
        <label htmlFor="ev-name">Event name</label>
        <input
          id="ev-name"
          type="text"
          placeholder="Devizes farmers' market"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && <div className="err" style={{ display: "block" }}>Enter an event name</div>}
      </div>

      <div className="field">
        <label htmlFor="ev-desc">Description</label>
        <textarea
          id="ev-desc"
          rows={4}
          placeholder="What should people expect?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="field">
          <label htmlFor="ev-starts">Date &amp; time</label>
          <input id="ev-starts" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
          {errors.startsAt && <div className="err" style={{ display: "block" }}>Choose a date and time</div>}
        </div>
        <div className="field">
          <label htmlFor="ev-price">Price (optional)</label>
          <input
            id="ev-price"
            type="text"
            placeholder="Free, or £5 on the door"
            value={priceText}
            onChange={(e) => setPriceText(e.target.value)}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="ev-venue">Venue</label>
        <input id="ev-venue" type="text" placeholder="The Vine" value={venue} onChange={(e) => setVenue(e.target.value)} />
        {errors.venue && <div className="err" style={{ display: "block" }}>Add a venue</div>}
      </div>

      <div className="field">
        <label htmlFor="ev-town">Nearest town</label>
        <select id="ev-town" value={town} onChange={(e) => setTown(e.target.value)}>
          <option value="">Choose the nearest major town</option>
          {TOWNS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        {errors.town && <div className="err" style={{ display: "block" }}>Choose the nearest town</div>}
      </div>

      <div className="field">
        <label htmlFor="ev-website">Website or ticket link (optional)</label>
        <input id="ev-website" type="url" placeholder="https://" value={website} onChange={(e) => setWebsite(e.target.value)} />
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
