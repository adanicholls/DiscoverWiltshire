"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CATEGORY_LABELS_CORE, TOWN_LABELS } from "@/lib/data";
import { Store, type LiveBusiness } from "@/lib/store";

interface LeaderboardProps {
  category?: string;
  categories?: string[];
  /** Restricts to one town (its nearest-major-town grouping, not the free-text location). */
  town?: string;
  showCategoryTag?: boolean;
  limit?: number;
  /** When set, overrides category/categories and searches every business. */
  searchQuery?: string;
}

function rank(list: LiveBusiness[]): LiveBusiness[] {
  // Simplified promoted-slot model: promoted items are pinned above organic
  // ranking. A real build should cap this at 4 sellable slots per list and
  // backfill any unsold slots with the next-best organic business.
  const promoted = list.filter((b) => b.promoted).sort((a, b) => b.liveVotes - a.liveVotes);
  const organic = list.filter((b) => !b.promoted).sort((a, b) => b.liveVotes - a.liveVotes);
  return promoted.concat(organic);
}

export default function Leaderboard({ category, categories, town, showCategoryTag, limit, searchQuery }: LeaderboardProps) {
  const [businesses, setBusinesses] = useState<LiveBusiness[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  // Starts with just the four static core labels so an early search still
  // works; Store.getCategoryLabels() fills in trade categories once loaded.
  const [categoryLabels, setCategoryLabels] = useState<Record<string, string>>(CATEGORY_LABELS_CORE);

  useEffect(() => {
    Store.getCategoryLabels().then(setCategoryLabels).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadError(false);
      try {
        let list: LiveBusiness[];
        if (searchQuery && searchQuery.trim()) {
          list = await Store.searchBusinesses(searchQuery, { categoryLabels, townLabels: TOWN_LABELS, town });
          list = list.sort((a, b) => b.liveVotes - a.liveVotes);
        } else {
          list = await Store.getApprovedBusinesses({ category, categories, town });
          list = rank(list);
          if (limit) list = list.slice(0, limit);
        }
        if (!cancelled) setBusinesses(list);
      } catch (err) {
        console.error("Failed to load businesses:", err);
        if (!cancelled) setLoadError(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, categories?.join(","), town, limit, searchQuery, categoryLabels]);

  async function handleVote(id: string) {
    const didVote = await Store.addVote(id);
    if (!didVote) return;
    // Store.hasVoted(id) is now true (addVote records it synchronously in
    // localStorage before resolving), so re-rendering is all this needs -
    // each row reads Store.hasVoted directly for its disabled state.
    setBusinesses((prev) => prev && prev.map((b) => (b.id === id ? { ...b, liveVotes: b.liveVotes + 1 } : b)));
  }

  if (loadError) {
    return (
      <div className="leaderboard">
        <div className="card" style={{ textAlign: "center", opacity: 0.6, fontSize: 13 }}>
          Couldn&apos;t load the leaderboard right now — try refreshing.
        </div>
      </div>
    );
  }

  if (businesses === null) {
    // Avoids a flash of "nothing here" before the first fetch resolves.
    return <div className="leaderboard" />;
  }

  if (businesses.length === 0) {
    return (
      <div className="leaderboard">
        <div className="card" style={{ textAlign: "center", opacity: 0.6, fontSize: 13 }}>
          {searchQuery
            ? `No matches for "${searchQuery.trim()}" — try a different search.`
            : "Nothing here yet — the first business to be approved in this category takes the top spot."}
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard">
      {businesses.map((b, i) => (
        <div className="lb-row" key={b.id}>
          <div className="lb-rank">{i + 1}</div>
          <div className="lb-thumb" style={{ background: b.photoColor || "#D9C7A3" }} />
          <div className="lb-info">
            <div className="lb-name-row">
              <Link className="lb-name" href={`/business/${b.id}`}>
                {b.name}
              </Link>
              {b.promoted && <span className="tag tag-promoted">Promoted</span>}
              {b.featured && <span className="tag tag-featured">Featured</span>}
            </div>
            <div className="lb-meta">
              {showCategoryTag ? `${categoryLabels[b.category] || b.category} · ` : ""}
              {b.tagline}
            </div>
          </div>
          <button
            className="upvote"
            aria-label={`Upvote ${b.name}`}
            disabled={Store.hasVoted(b.id)}
            onClick={() => handleVote(b.id)}
          >
            <span className="upvote-arrow" aria-hidden="true">▲</span>
            <span className="upvote-count">{b.liveVotes}</span>
          </button>
        </div>
      ))}
    </div>
  );
}
