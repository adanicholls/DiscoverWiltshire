"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CATEGORY_LABELS_CORE, TOWN_LABELS } from "@/lib/data";
import { Store, type LiveBusiness } from "@/lib/store";
import { UpvoteIcon } from "./icons";

const CORE_IDS = Object.keys(CATEGORY_LABELS_CORE);

function rank(list: LiveBusiness[]): LiveBusiness[] {
  // Same simplified promoted-slot model as the Leaderboard: promoted
  // businesses are pinned above the organic ranking.
  const promoted = list.filter((b) => b.promoted).sort((a, b) => b.liveVotes - a.liveVotes);
  const organic = list.filter((b) => !b.promoted).sort((a, b) => b.liveVotes - a.liveVotes);
  return promoted.concat(organic);
}

function categoryHref(id: string): string {
  return CORE_IDS.includes(id) ? `/${id}` : `/trades/${id}`;
}

interface Section {
  key: string;
  title: string;
  subtitle: string;
  href?: string;
  items: LiveBusiness[];
  header: boolean;
}

/** The ranked sections of the homepage, laid out like Product Hunt's feed
 * table: rank, thumbnail + name + tagline, topic chips, price, score. One
 * fetch of every approved business feeds all the sections, and the score
 * buttons are the real one-vote-per-visitor upvotes. */
export default function HomeFeed({ town }: { town?: string }) {
  const [businesses, setBusinesses] = useState<LiveBusiness[] | null>(null);
  const [labels, setLabels] = useState<Record<string, string>>(CATEGORY_LABELS_CORE);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadError(false);
      try {
        const [list, categoryLabels] = await Promise.all([
          Store.getApprovedBusinesses({ town }),
          Store.getCategoryLabels().catch(() => CATEGORY_LABELS_CORE),
        ]);
        if (cancelled) return;
        setLabels(categoryLabels);
        setBusinesses(list);
      } catch (err) {
        console.error("Failed to load businesses:", err);
        if (!cancelled) setLoadError(true);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [town]);

  async function handleVote(id: string) {
    const didVote = await Store.addVote(id);
    if (!didVote) return;
    setBusinesses((prev) => prev && prev.map((b) => (b.id === id ? { ...b, liveVotes: b.liveVotes + 1 } : b)));
  }

  const sections = useMemo<Section[]>(() => {
    if (!businesses) return [];
    const townLabel = town ? TOWN_LABELS[town] : undefined;
    const out: Section[] = [
      {
        key: "top",
        title: townLabel ? `Top in ${townLabel}` : "Top in Wiltshire",
        subtitle: "Ranked by upvotes from the people who live here",
        items: rank(businesses).slice(0, 10),
        header: true,
      },
    ];
    for (const id of CORE_IDS) {
      out.push({
        key: id,
        title: `Top ${CATEGORY_LABELS_CORE[id]}`,
        subtitle: `The favourites in ${CATEGORY_LABELS_CORE[id].toLowerCase()}`,
        href: `/${id}`,
        items: rank(businesses.filter((b) => b.category === id)).slice(0, 5),
        header: false,
      });
    }
    out.push({
      key: "trades",
      title: "Top Trades & services",
      subtitle: "Painters, plumbers, electricians and more",
      href: "/trades",
      items: rank(businesses.filter((b) => !CORE_IDS.includes(b.category))).slice(0, 5),
      header: false,
    });
    return out.filter((s) => s.key === "top" || s.items.length > 0);
  }, [businesses, town]);

  if (loadError) {
    return <p className="ph-feed-note">Couldn&apos;t load the rankings right now — try refreshing.</p>;
  }

  if (businesses === null) {
    return (
      <div className="ph-feed-skeleton" aria-busy="true" aria-label="Loading rankings">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="ph-skel-row" />
        ))}
      </div>
    );
  }

  return (
    <>
      {town && (
        <p className="ph-feed-filter">
          Showing {TOWN_LABELS[town] || town} only. <Link href="/">Show all of Wiltshire</Link>
        </p>
      )}
      {sections.map((section) => (
        <section key={section.key} className="ph-section" aria-labelledby={`ph-s-${section.key}`}>
          <div className="ph-section-head">
            <div>
              <h2 id={`ph-s-${section.key}`} className="ph-section-title">
                {section.title}
              </h2>
              <p className="ph-section-sub">{section.subtitle}</p>
            </div>
            {section.href && (
              <Link href={section.href} className="ph-see-all">
                See all
              </Link>
            )}
          </div>

          {section.header && (
            <div className="ph-feed-header" aria-hidden="true">
              <span />
              <span>Name</span>
              <span className="ph-col-topics">Topics</span>
              <span className="ph-col-score">Score</span>
            </div>
          )}

          {section.items.length === 0 ? (
            <p className="ph-feed-note">
              Nothing here yet — the first business to be approved takes the top spot.
            </p>
          ) : (
            <ol className="ph-feed">
              {section.items.map((b, i) => {
                const voted = Store.hasVoted(b.id);
                return (
                  <li key={b.id} className="ph-row">
                    <span className="ph-rank">{i + 1}</span>
                    <Link href={`/business/${b.id}`} className="ph-post">
                      <span className="ph-post-text">
                        <span className="ph-post-name">
                          <span className="ph-post-name-text">{b.name}</span>
                          {b.promoted && <span className="ph-flag ph-flag-promoted">Promoted</span>}
                          {b.featured && <span className="ph-flag ph-flag-featured">Featured</span>}
                        </span>
                        <span className="ph-post-tagline">{b.tagline}</span>
                      </span>
                    </Link>
                    <span className="ph-col-topics ph-chips">
                      <Link href={categoryHref(b.category)} className="ph-chip">
                        {labels[b.category] || b.category}
                      </Link>
                      {b.town && (
                        <Link href={`/towns/${b.town}`} className="ph-chip">
                          {TOWN_LABELS[b.town] || b.town}
                        </Link>
                      )}
                    </span>
                    <button
                      type="button"
                      className={"ph-vote" + (voted ? " voted" : "")}
                      aria-label={voted ? `You upvoted ${b.name}` : `Upvote ${b.name}`}
                      disabled={voted}
                      onClick={() => handleVote(b.id)}
                    >
                      <UpvoteIcon />
                      <span>{b.liveVotes}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      ))}
    </>
  );
}
