"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { TOWNS } from "@/lib/data";
import { searchHref } from "@/lib/searchHref";
import { ArrowRightIcon } from "./icons";

/** The big gradient-edged card at the top of the homepage. Product Hunt
 * uses this slot for a sponsor takeover with a "Try it" command row; here
 * it carries the site's pitch and the "what + where" search, so the
 * fast lane for "I need an electrician in Melksham" is the first thing
 * on the page. */
export default function HeroBanner() {
  const router = useRouter();
  const [trade, setTrade] = useState("");
  const [town, setTown] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const href = searchHref(trade, town);
    if (href) router.push(href);
  }

  return (
    <section className="ph-hero" aria-labelledby="ph-hero-title">
      <div className="ph-hero-inner">
        <span className="ph-hero-pill">Ranked by the people who live here</span>
        <h1 id="ph-hero-title" className="ph-hero-title">
          The friend who knows <span className="ph-gradient-text">Wiltshire</span> best
        </h1>
        <p className="ph-hero-copy">
          Every pub, stay, day out, shop and local trade in the county — ranked by real upvotes from locals, not by who
          pays the most.
        </p>

        <form className="ph-command" onSubmit={handleSubmit} role="search">
          <span className="ph-command-prompt" aria-hidden="true">
            &gt;
          </span>
          <input
            type="text"
            className="ph-command-input"
            placeholder="electrician, plumber, café…"
            aria-label="What are you looking for"
            value={trade}
            onChange={(e) => setTrade(e.target.value)}
          />
          <select
            className="ph-command-select"
            aria-label="Where in Wiltshire"
            value={town}
            onChange={(e) => setTown(e.target.value)}
          >
            <option value="">Anywhere in Wiltshire</option>
            {TOWNS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <button type="submit" className="ph-btn-blue">
            Find it <kbd>⏎</kbd>
          </button>
        </form>

        <div className="ph-hero-links">
          <Link href="/list-your-business">
            List your business <ArrowRightIcon size={16} />
          </Link>
          <Link href="/pricing">
            See pricing <ArrowRightIcon size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
