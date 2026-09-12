import Link from "next/link";

const TABS: { href: string; label: string }[] = [
  { href: "/", label: "All" },
  { href: "/eat-drink", label: "Eat & drink" },
  { href: "/stay", label: "Stay" },
  { href: "/things-to-do", label: "Things to do" },
  { href: "/trades", label: "Trades & services" },
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
