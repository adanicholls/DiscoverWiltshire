"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { TOWNS } from "@/lib/data";
import { searchHref } from "@/lib/searchHref";
import HomeNavLinks from "./HomeNavLinks";
import { CloseIcon, MegaphoneIcon, MenuIcon, PlusIcon, SearchIcon } from "./icons";

/** The fixed top bar of the homepage shell: logo + wordmark, a search pill
 * that opens a search dialog (also on Ctrl/Cmd + K), and the two calls to
 * action. Below the tablet breakpoint the search collapses to an icon and a
 * hamburger appears, which opens the sidebar's links as a drawer. */
export default function HomeHeader() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [trade, setTrade] = useState("");
  const [town, setTown] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Ctrl/Cmd + K opens search from anywhere on the page, Escape closes
  // whichever overlay is open.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setMenuOpen(false);
        setSearchOpen(true);
      } else if (e.key === "Escape") {
        setSearchOpen(false);
        setMenuOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  // Lock page scroll behind an open dialog or drawer.
  useEffect(() => {
    document.body.style.overflow = searchOpen || menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [searchOpen, menuOpen]);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const href = searchHref(trade, town);
    if (!href) return;
    setSearchOpen(false);
    router.push(href);
  }

  return (
    <>
      <header className="ph-header">
        <button
          type="button"
          className="ph-icon-btn ph-menu-btn"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
        </button>

        <Link href="/" className="ph-brand" aria-label="Discover Wiltshire home">
          <span className="ph-logo" aria-hidden="true">
            D
          </span>
          <span className="ph-wordmark">Discover Wiltshire</span>
        </Link>

        <button type="button" className="ph-search-pill" onClick={() => setSearchOpen(true)} aria-label="Search">
          <SearchIcon size={20} />
          <span>Search ( ctrl + k )</span>
        </button>
        <button
          type="button"
          className="ph-icon-btn ph-search-icon-btn"
          aria-label="Search"
          onClick={() => setSearchOpen(true)}
        >
          <SearchIcon size={22} />
        </button>

        <div className="ph-header-actions">
          <Link href="/pricing" className="ph-pill ph-pill-outline">
            <MegaphoneIcon size={18} />
            <span className="ph-pill-label">Advertise</span>
          </Link>
          <Link href="/list-your-business" className="ph-pill ph-pill-coral">
            <PlusIcon size={18} />
            <span className="ph-pill-label ph-pill-label-long">List your business</span>
            <span className="ph-pill-label ph-pill-label-short">List</span>
          </Link>
        </div>
      </header>

      {menuOpen && (
        <div className="ph-drawer-layer">
          <div className="ph-backdrop" onClick={() => setMenuOpen(false)} />
          <div className="ph-drawer" role="dialog" aria-label="Menu">
            <HomeNavLinks onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      {searchOpen && (
        <div className="ph-modal-layer" role="dialog" aria-modal="true" aria-label="Search Discover Wiltshire">
          <div className="ph-backdrop" onClick={() => setSearchOpen(false)} />
          <form className="ph-modal" onSubmit={handleSearch} role="search">
            <div className="ph-modal-field">
              <SearchIcon size={22} />
              <input
                ref={searchInputRef}
                type="text"
                className="ph-modal-input"
                placeholder="What do you need? e.g. electrician, plumber, café"
                aria-label="What are you looking for"
                value={trade}
                onChange={(e) => setTrade(e.target.value)}
              />
            </div>
            <div className="ph-modal-row">
              <select
                className="ph-modal-select"
                aria-label="Where in Wiltshire"
                value={town}
                onChange={(e) => setTown(e.target.value)}
              >
                <option value="">Anywhere in Wiltshire</option>
                {TOWNS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
              <button type="submit" className="ph-btn-blue">
                Search <kbd>⏎</kbd>
              </button>
            </div>
            <p className="ph-modal-hint">
              Try &ldquo;electrician Melksham&rdquo; — a trade and a town together works too. Press Esc to close.
            </p>
          </form>
        </div>
      )}
    </>
  );
}
