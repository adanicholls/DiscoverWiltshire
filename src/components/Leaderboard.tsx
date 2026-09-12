"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CATEGORY_LABELS, type Business } from "@/lib/data";
import { Store } from "@/lib/store";

interface RankedBusiness extends Business {
  liveVotes: number;
}

interface LeaderboardProps {
  category?: string;
  categories?: string[];
  showCategoryTag?: boolean;
  limit?: number;
  /** When set, overrides category/categories and searches every business. */
  searchQuery?: string;
}

function rank(list: Business[]): RankedBusiness[] {
  const withVotes = list.map((b) => ({ ...b, liveVotes: Store.votesFor(b) }));
  // Simplified promoted-slot model: promoted items are pinned above organic
  // ranking. A real build should cap this at 4 sellable slots per list and
  // backfill any unsold slots with the next-best organic business.
  const promoted = withVotes.filter((b) => b.promoted).sort((a, b) => b.liveVotes - a.liveVotes);
  const organic = withVotes.filter((b) => !b.promoted).sort((a, b) => b.liveVotes - a.liveVotes);
  return promoted.concat(organic);
}

function search(all: Business[], query: string): RankedBusiness[] {
  const q = query.trim().toLowerCase();
  const matches = all.filter((b) => {
    const category = (CATEGORY_LABELS[b.category] || b.category).toLowerCase();
    return [b.name, b.tagline, b.description, b.location, category].some((field) =>
      (field || "").toLowerCase().includes(q)
    );
  });
  return matches
    .map((b) => ({ ...b, liveVotes: Store.votesFor(b) }))
    .sort((a, b) => b.liveVotes - a.liveVotes);
}

export default function Leaderboard({ category, categories, showCategoryTag, limit, searchQuery }: LeaderboardProps) {
  const [businesses, setBusinesses] = useState<RankedBusiness[] | null>(null);
  const [votedIds, setVotedIds] = useState<string[]>([]);

  useEffect(() => {
    const all = Store.getAllBusinesses();

    let ranked: RankedBusiness[];
    if (searchQuery && searchQuery.trim()) {
      ranked = search(all, searchQuery);
    } else {
      let list = all;
      if (category) {
        list = list.filter((b) => b.category === category);
      } else if (categories) {
        list = list.filter((b) => categories.includes(b.category));
      }
      ranked = rank(list);
      if (limit) ranked = ranked.slice(0, limit);
    }

    // Store is a temporary localStorage shim standing in for Supabase (see
    // src/lib/store.ts) — reading it is an external-system sync, which is
    // exactly what effects are for, but it does mean an unavoidable extra
    // render on mount. This whole effect goes away once votes/businesses
    // come from a real data fetch instead.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBusinesses(ranked);
    setVotedIds(Store.getVotedIds());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, categories?.join(","), limit, searchQuery]);

  function handleVote(id: string) {
    if (!Store.addVote(id)) return;
    setVotedIds(Store.getVotedIds());
    setBusinesses((prev) => prev && prev.map((b) => (b.id === id ? { ...b, liveVotes: b.liveVotes + 1 } : b)));
  }

  if (businesses === null) {
    // Avoids a flash of "nothing here" before localStorage-derived state
    // is read on mount (server-rendered markup has no vote data yet).
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
              {showCategoryTag ? `${CATEGORY_LABELS[b.category] || b.category} · ` : ""}
              {b.tagline}
            </div>
          </div>
          <button
            className="upvote"
            aria-label={`Upvote ${b.name}`}
            disabled={votedIds.includes(b.id)}
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
