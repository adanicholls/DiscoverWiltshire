import Link from "next/link";
import { TRADE_CATEGORIES } from "@/lib/data";

/** Chip row for jumping between trade categories — used on both the trades
 * hub (activeSlug omitted) and an individual trade category page. */
export default function TradeChips({ activeSlug }: { activeSlug?: string }) {
  return (
    <div className="tabs">
      {activeSlug ? (
        <Link className="tab" href="/trades">
          All trades &amp; services
        </Link>
      ) : (
        <span className="tab active">All trades &amp; services</span>
      )}
      {TRADE_CATEGORIES.map((cat) =>
        cat.id === activeSlug ? (
          <span key={cat.id} className="tab active">
            {cat.label}
          </span>
        ) : (
          <Link key={cat.id} className="tab" href={`/trades/${cat.id}`}>
            {cat.label}
          </Link>
        )
      )}
    </div>
  );
}
