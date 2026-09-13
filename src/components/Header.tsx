"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { TRADE_CATEGORIES, TOWNS } from "@/lib/data";

type MenuKey = "none" | "explore" | "business";

const HOVER_CLOSE_DELAY = 150; // tolerates the cursor briefly leaving between button and panel

// useSearchParams() opts a page into dynamic rendering unless whatever
// calls it sits behind a Suspense boundary — needed here specifically
// because Header (via this) is used on statically-generated pages like
// /trades/[slug] and /towns/[slug]. Isolated into its own component so
// only this part needs the boundary, not all of Header.
function HeaderSearchInput({ onSubmit }: { onSubmit: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <input
      type="search"
      id="site-search"
      className="search-box"
      placeholder="Search Discover Wiltshire…"
      aria-label="Search Discover Wiltshire"
      onKeyDown={(e) => {
        const value = e.currentTarget.value.trim();
        if (e.key === "Enter" && value) {
          onSubmit();
          // Preserves an active town filter (only ever set on the
          // homepage) across a new search, rather than a search
          // silently dropping it.
          const town = searchParams.get("town");
          const qs = new URLSearchParams({ q: value });
          if (town) qs.set("town", town);
          router.push("/?" + qs.toString());
        }
      }}
    />
  );
}

export default function Header() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<MenuKey>("none");
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  const exploreActive =
    pathname === "/" ||
    ["/eat-drink", "/stay", "/things-to-do", "/shops", "/trades", "/towns"].some(
      (p) => pathname === p || pathname.startsWith(p + "/")
    );
  const advertiseActive = pathname === "/list-your-business" || pathname === "/pricing";
  const whatsOnActive = pathname === "/whats-on";
  const storyActive = pathname === "/about";

  function show(which: MenuKey) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(which);
  }

  function scheduleClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu("none"), HOVER_CLOSE_DELAY);
  }

  function closeAll() {
    setOpenMenu("none");
    setMobileOpen(false);
  }

  // Clicking anywhere outside the header closes an open mega-menu or the
  // mobile flyout. Checking containment here (rather than stopping
  // propagation on the header itself) avoids any ambiguity between
  // React's synthetic event bubbling and this native document listener —
  // a click that opens a menu would otherwise immediately re-close it.
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (headerRef.current && headerRef.current.contains(e.target as Node)) return;
      closeAll();
    }
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  return (
    <header className="site-header" ref={headerRef}>
      <div className="wrap nav-bar">
        <Link className="logo" href="/">
          Discover Wiltshire
        </Link>

        <button
          className="nav-toggle"
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          aria-controls="nav-collapse"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={"nav-collapse" + (mobileOpen ? " open" : "")} id="nav-collapse">
          <nav className="nav-links">
            <button
              className={"nav-item" + (exploreActive ? " active" : "")}
              aria-current={exploreActive ? "page" : undefined}
              onMouseEnter={() => show("explore")}
              onMouseLeave={scheduleClose}
              onClick={() => show(openMenu === "explore" ? "none" : "explore")}
            >
              Explore
            </button>
            <Link className={"nav-item" + (whatsOnActive ? " active" : "")} aria-current={whatsOnActive ? "page" : undefined} href="/whats-on" onClick={closeAll}>
              What&apos;s on
            </Link>
            <button
              className={"nav-item" + (advertiseActive ? " active" : "")}
              aria-current={advertiseActive ? "page" : undefined}
              onMouseEnter={() => show("business")}
              onMouseLeave={scheduleClose}
              onClick={() => show(openMenu === "business" ? "none" : "business")}
            >
              Advertise
            </button>
            <Link className={"nav-item" + (storyActive ? " active" : "")} aria-current={storyActive ? "page" : undefined} href="/about" onClick={closeAll}>
              Our story
            </Link>
          </nav>

          <Suspense fallback={<input type="search" className="search-box" placeholder="Search Discover Wiltshire…" aria-label="Search Discover Wiltshire" disabled />}>
            <HeaderSearchInput onSubmit={closeAll} />
          </Suspense>

          <div className="nav-utility">
            <span className="sign-in">Sign in</span>
            <Link className="btn btn-primary" href="/list-your-business" onClick={closeAll}>
              List your business
            </Link>
          </div>
        </div>
      </div>

      <div
        className="mega-menu"
        hidden={openMenu !== "explore"}
        onMouseEnter={() => show("explore")}
        onMouseLeave={scheduleClose}
      >
        <Link className="mega-item" href="/" onClick={closeAll}>
          <div className="mega-item-title">All rankings</div>
          <div className="mega-item-desc">the full leaderboard, every category</div>
        </Link>
        <Link className="mega-item" href="/eat-drink" onClick={closeAll}>
          <div className="mega-item-title">Eat &amp; drink</div>
          <div className="mega-item-desc">pubs, restaurants, cafés, ranked</div>
        </Link>
        <Link className="mega-item" href="/stay" onClick={closeAll}>
          <div className="mega-item-title">Stay</div>
          <div className="mega-item-desc">places to stay, ranked</div>
        </Link>
        <Link className="mega-item" href="/things-to-do" onClick={closeAll}>
          <div className="mega-item-title">Things to do</div>
          <div className="mega-item-desc">activities and days out, ranked</div>
        </Link>
        <Link className="mega-item" href="/shops" onClick={closeAll}>
          <div className="mega-item-title">Shops</div>
          <div className="mega-item-desc">local shops and services, ranked</div>
        </Link>

        <div className="mega-trades">
          <Link className="mega-trades-heading" href="/trades" onClick={closeAll}>
            Trades &amp; services
          </Link>
          <div className="mega-trades-grid">
            {TRADE_CATEGORIES.map((cat) => (
              <Link key={cat.id} className="mega-trades-link" href={`/trades/${cat.id}`} onClick={closeAll}>
                {cat.label}
              </Link>
            ))}
          </div>
          <Link className="mega-trades-all" href="/trades" onClick={closeAll}>
            Browse all trades &amp; services →
          </Link>
        </div>

        <div className="mega-trades">
          <Link className="mega-trades-heading" href="/towns" onClick={closeAll}>
            Browse by town
          </Link>
          <div className="mega-trades-grid">
            {TOWNS.map((town) => (
              <Link key={town.id} className="mega-trades-link" href={`/towns/${town.id}`} onClick={closeAll}>
                {town.label}
              </Link>
            ))}
          </div>
          <Link className="mega-trades-all" href="/towns" onClick={closeAll}>
            See all towns →
          </Link>
        </div>
      </div>

      <div
        className="mega-menu"
        hidden={openMenu !== "business"}
        onMouseEnter={() => show("business")}
        onMouseLeave={scheduleClose}
      >
        <Link className="mega-item" href="/list-your-business" onClick={closeAll}>
          <div className="mega-item-title">List your business</div>
          <div className="mega-item-desc">get listed and start climbing the rankings</div>
        </Link>
        <Link className="mega-item" href="/pricing" onClick={closeAll}>
          <div className="mega-item-title">Pricing</div>
          <div className="mega-item-desc">every option, from free to founding member</div>
        </Link>
        <Link className="mega-item" href="/pricing" onClick={closeAll}>
          <div className="mega-item-title">Promote your listing</div>
          <div className="mega-item-desc">buy a featured slot on your category or the homepage</div>
        </Link>
        <Link className="mega-item" href="/pricing#founding-membership" onClick={closeAll}>
          <div className="mega-item-title">
            Founding membership <span className="tag tag-slot">6 months only</span>
          </div>
          <div className="mega-item-desc">lock in today&apos;s pricing for life</div>
        </Link>
      </div>
    </header>
  );
}
