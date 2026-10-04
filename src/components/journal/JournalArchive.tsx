"use client";

import { useMemo, useState } from "react";
import JournalCard from "@/components/journal/JournalCard";
import {
  JOURNAL_PAGE_SIZE,
  buildCategoryOptions,
  filterEntries,
  type JournalFilter,
  type JournalSummary,
} from "@/lib/journal";
import "./journal.css";

interface Props {
  entries: JournalSummary[];
  /** From the URL (?category= / ?type=), so a filtered view can be linked to. */
  initialFilter: JournalFilter;
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button type="button" className="journal-filter" aria-pressed={active} onClick={onClick}>
      {children}
    </button>
  );
}

/** The journal index: filter pills over a grid of cards, revealed a page at
 * a time. Filtering and "Load more" happen instantly in the browser (the
 * whole list is small, so it's sent down once) - and the address bar is kept
 * in step so a filtered view can still be shared. */
export default function JournalArchive({ entries, initialFilter }: Props) {
  const options = useMemo(() => buildCategoryOptions(entries), [entries]);
  const hasNews = useMemo(() => entries.some((e) => e.type === "news"), [entries]);
  const [filter, setFilter] = useState<JournalFilter>(initialFilter);
  const [visible, setVisible] = useState(JOURNAL_PAGE_SIZE);

  const filtered = useMemo(() => filterEntries(entries, filter), [entries, filter]);
  const shown = filtered.slice(0, visible);

  function choose(next: JournalFilter) {
    setFilter(next);
    setVisible(JOURNAL_PAGE_SIZE);

    const url = new URL(window.location.href);
    url.searchParams.delete("category");
    url.searchParams.delete("type");
    if (next.kind === "category") url.searchParams.set("category", next.slug);
    if (next.kind === "news") url.searchParams.set("type", "news");
    window.history.replaceState(null, "", url.pathname + url.search);
  }

  if (entries.length === 0) {
    return (
      <div className="card journal-empty">
        Nothing in the journal yet &mdash; the first stories are on their way.
      </div>
    );
  }

  return (
    <>
      {(options.length > 0 || hasNews) && (
        <div className="journal-filters" role="group" aria-label="Filter the journal">
          <FilterPill active={filter.kind === "all"} onClick={() => choose({ kind: "all" })}>
            All
          </FilterPill>
          {options.map((o) => (
            <FilterPill
              key={o.slug}
              active={filter.kind === "category" && filter.slug === o.slug}
              onClick={() => choose({ kind: "category", slug: o.slug })}
            >
              {o.label}
            </FilterPill>
          ))}
          {hasNews && (
            <FilterPill active={filter.kind === "news"} onClick={() => choose({ kind: "news" })}>
              News
            </FilterPill>
          )}
        </div>
      )}

      <div className="journal-grid">
        {shown.map((entry, i) => (
          <JournalCard key={entry.id} entry={entry} priority={i < 4} />
        ))}
      </div>

      {filtered.length > visible && (
        <div className="journal-more">
          <button type="button" className="btn btn-secondary" onClick={() => setVisible((v) => v + JOURNAL_PAGE_SIZE)}>
            Load more
          </button>
        </div>
      )}
    </>
  );
}
