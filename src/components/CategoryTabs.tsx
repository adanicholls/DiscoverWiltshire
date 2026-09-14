import Link from "next/link";

// Trimmed to the categories people actually browse for inspiration -
// Trades & services is deliberately not here; it's discoverable primarily
// via search (see HomeSearchBar), not menu drilling. The page itself still
// exists at /trades for SEO/direct linking.
const TABS: { href: string; label: string }[] = [
  { href: "/", label: "All" },
  { href: "/eat-drink", label: "Eat & drink" },
  { href: "/stay", label: "Stay" },
  { href: "/things-to-do", label: "Things to do" },
  { href: "/shops", label: "Shops" },
];

export default function CategoryTabs({ active }: { active: string }) {
  return (
    <div className="tabs">
      {TABS.map((tab) =>
        tab.href === active ? (
          <span key={tab.href} className="tab active">
            {tab.label}
          </span>
        ) : (
          <Link key={tab.href} className="tab" href={tab.href}>
            {tab.label}
          </Link>
        )
      )}
    </div>
  );
}
