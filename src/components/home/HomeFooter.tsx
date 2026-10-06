import Link from "next/link";
import { CATEGORY_LABELS_CORE, TOWNS } from "@/lib/data";

/** Product Hunt's homepage ends in a block of category links; this is the
 * Discover Wiltshire version - categories, every town, and the site pages. */
export default function HomeFooter() {
  return (
    <footer className="ph-footer">
      <div className="ph-footer-col">
        <h3>Top categories</h3>
        {Object.entries(CATEGORY_LABELS_CORE).map(([id, label]) => (
          <Link key={id} href={`/${id}`}>
            {label}
          </Link>
        ))}
        <Link href="/trades">Trades &amp; services</Link>
      </div>
      <div className="ph-footer-col ph-footer-col-wide">
        <h3>Browse by town</h3>
        <div className="ph-footer-towns">
          {TOWNS.map((t) => (
            <Link key={t.id} href={`/towns/${t.id}`}>
              {t.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="ph-footer-col">
        <h3>Discover Wiltshire</h3>
        <Link href="/whats-on">What&apos;s on</Link>
        <Link href="/journal">Journal</Link>
        <Link href="/list-your-business">List your business</Link>
        <Link href="/pricing">Pricing</Link>
      </div>
      <p className="ph-footer-note">Discover Wiltshire — the only list you&apos;ll need</p>
    </footer>
  );
}
