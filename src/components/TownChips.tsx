import Link from "next/link";
import { TOWNS } from "@/lib/data";

/** Chip row for jumping between towns — used on both the towns hub
 * (activeSlug omitted) and an individual town page. */
export default function TownChips({ activeSlug }: { activeSlug?: string }) {
  return (
    <div className="tabs">
      {activeSlug ? (
        <Link className="tab" href="/towns">
          All towns
        </Link>
      ) : (
        <span className="tab active">All towns</span>
      )}
      {TOWNS.map((town) =>
        town.id === activeSlug ? (
          <span key={town.id} className="tab active">
            {town.label}
          </span>
        ) : (
          <Link key={town.id} className="tab" href={`/towns/${town.id}`}>
            {town.label}
          </Link>
        )
      )}
    </div>
  );
}
