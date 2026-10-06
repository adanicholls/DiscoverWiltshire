import Link from "next/link";
import type { TradeCategory } from "@/lib/data";

/** The trades & services hub's category links, laid out as the same grey-
 * hover button cards as the /towns page. A town filter (?town=) carries
 * through, so picking a trade after choosing a town stays in that town. */
export default function TradeCards({ categories, town }: { categories: TradeCategory[]; town?: string }) {
  const suffix = town ? `?town=${encodeURIComponent(town)}` : "";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: 8,
        margin: "16px 0 28px",
      }}
    >
      {categories.map((cat) => (
        <Link key={cat.id} className="card town-card" href={`/trades/${cat.id}${suffix}`}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{cat.label}</div>
          <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>see who&apos;s ranked here</div>
        </Link>
      ))}
    </div>
  );
}
