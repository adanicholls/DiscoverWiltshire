"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { TOWNS } from "@/lib/data";
import { splitTradeAndTown } from "@/lib/searchParse";

interface Props {
  /** Prefills the fields when this bar is reused on /search to refine a query. */
  initialQuery?: string;
  initialTown?: string;
}

/** The "I need X, near me, now" entry point - separate from the browsing
 * leaderboard below it, not a replacement for it. Structured as two
 * fields (what + where) rather than one keyword box, but a combined
 * phrase typed into "what" alone (e.g. "electrician Melksham") still
 * works via splitTradeAndTown. */
export default function HomeSearchBar({ initialQuery = "", initialTown = "" }: Props) {
  const router = useRouter();
  const [trade, setTrade] = useState(initialQuery);
  const [town, setTown] = useState(initialTown);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    let tradeText = trade.trim();
    let townId = town;

    if (!townId && tradeText) {
      const parsed = splitTradeAndTown(tradeText);
      tradeText = parsed.trade;
      townId = parsed.townId;
    }

    if (!tradeText) {
      // Town picked with nothing else typed - that's town-based browsing,
      // not a search, so it goes straight to that town's hub page.
      if (townId) router.push(`/towns/${townId}`);
      return;
    }

    const qs = new URLSearchParams({ q: tradeText });
    if (townId) qs.set("town", townId);
    router.push(`/search?${qs.toString()}`);
  }

  return (
    <form className="home-search" onSubmit={handleSubmit} role="search">
      <input
        type="text"
        className="home-search-input"
        placeholder="What do you need? e.g. electrician, plumber, café"
        aria-label="What are you looking for"
        value={trade}
        onChange={(e) => setTrade(e.target.value)}
      />
      <select className="home-search-town" aria-label="Where in Wiltshire" value={town} onChange={(e) => setTown(e.target.value)}>
        <option value="">Anywhere in Wiltshire</option>
        {TOWNS.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>
      <button className="btn btn-primary home-search-submit" type="submit">
        Search
      </button>
    </form>
  );
}
