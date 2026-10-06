import Link from "next/link";
import type { ReactNode } from "react";
import {
  CalendarIcon,
  EatIcon,
  HomeIcon,
  JournalIcon,
  MegaphoneIcon,
  ShopsIcon,
  StayIcon,
  ThingsIcon,
  TownsIcon,
  TradesIcon,
} from "./icons";

const LINKS: { href: string; label: string; icon: ReactNode }[] = [
  { href: "/", label: "Home", icon: <HomeIcon /> },
  { href: "/eat-drink", label: "Eat & drink", icon: <EatIcon /> },
  { href: "/stay", label: "Stay", icon: <StayIcon /> },
  { href: "/things-to-do", label: "Things to do", icon: <ThingsIcon /> },
  { href: "/shops", label: "Shops", icon: <ShopsIcon /> },
  { href: "/trades", label: "Trades & services", icon: <TradesIcon /> },
  { href: "/towns", label: "Towns", icon: <TownsIcon /> },
  { href: "/whats-on", label: "What's on", icon: <CalendarIcon /> },
  { href: "/journal", label: "Journal", icon: <JournalIcon /> },
  { href: "/pricing", label: "Advertise", icon: <MegaphoneIcon /> },
];

/** The pill-shaped link list at the top of the left sidebar (and inside the
 * mobile menu drawer). The homepage is the only page that has this shell,
 * so "Home" is always the active one here. */
export default function HomeNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="ph-nav" aria-label="Main">
      {LINKS.map((link) => {
        const active = link.href === "/";
        return (
          <Link
            key={link.href}
            href={link.href}
            className={"ph-nav-link" + (active ? " active" : "")}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
          >
            {link.icon}
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
