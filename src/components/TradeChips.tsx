import Link from "next/link";
import { Store } from "@/lib/store";

/** Chip row for jumping between trade categories — used on both the trades
 * hub (activeSlug omitted) and an individual trade category page. Fetches
 * from Supabase (rather than a static list) since trade categories are
 * admin-editable. */
export default async function TradeChips({ activeSlug }: { activeSlug?: string }) {
  const tradeCategories = await Store.getTradeCategories();

  return (
    <div className="tabs">
      {activeSlug ? (
        <Link className="tab" href="/trades">
          All trades &amp; services
        </Link>
      ) : (
        <span className="tab active">All trades &amp; services</span>
      )}
      {tradeCategories.map((cat) =>
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
