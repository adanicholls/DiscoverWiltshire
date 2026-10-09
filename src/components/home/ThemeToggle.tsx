"use client";

import { useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "./icons";

type Theme = "light" | "dark";

const STORAGE_KEY = "dw-theme";
const CHANGE_EVENT = "dw-theme-change";

// The chosen theme lives on <html data-theme="...">. A tiny inline script in
// the root layout sets it before the page first paints (so there's no flash
// of the wrong theme); this toggle changes it and remembers the choice.
function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

function getSnapshot(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function getServerSnapshot(): Theme {
  return "dark";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Private mode or blocked storage: the choice still applies to this visit.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Light / Dark switch for the footer. */
export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <div className="ph-theme" role="group" aria-label="Colour theme">
      <button
        type="button"
        className={"ph-theme-btn" + (theme === "light" ? " active" : "")}
        aria-pressed={theme === "light"}
        onClick={() => applyTheme("light")}
      >
        <SunIcon size={16} />
        Light
      </button>
      <button
        type="button"
        className={"ph-theme-btn" + (theme === "dark" ? " active" : "")}
        aria-pressed={theme === "dark"}
        onClick={() => applyTheme("dark")}
      >
        <MoonIcon size={16} />
        Dark
      </button>
    </div>
  );
}
