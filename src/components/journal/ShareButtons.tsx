"use client";

import { useState, useSyncExternalStore } from "react";
import "./journal.css";

// Reads the page's own address in the browser. useSyncExternalStore (rather
// than state set in an effect) is the hydration-safe way to read a browser-
// only value: the server and first client render agree on "", then it fills in.
const subscribe = () => () => {};
const getUrl = () => window.location.href.split("#")[0];
const getServerUrl = () => "";

/** "Share this article": LinkedIn, Facebook, X, and a button that copies the link. */
export default function ShareButtons({ title }: { title: string }) {
  const url = useSyncExternalStore(subscribe, getUrl, getServerUrl);
  const [copied, setCopied] = useState(false);
  const encoded = encodeURIComponent(url);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be refused (older browsers, insecure context);
      // fall back to the browser's own prompt so the link is still gettable.
      window.prompt("Copy this link:", url);
    }
  }

  const link = (base: string) => (url ? base : "#");

  return (
    <div className="journal-share">
      <span className="journal-share__label">Share this article</span>
      <div className="journal-share__links">
        <a
          className="journal-pill"
          href={link(`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`)}
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </a>
        <a
          className="journal-pill"
          href={link(`https://www.facebook.com/sharer/sharer.php?u=${encoded}`)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Facebook
        </a>
        <a
          className="journal-pill"
          href={link(`https://x.com/intent/post?url=${encoded}&text=${encodeURIComponent(title)}`)}
          target="_blank"
          rel="noopener noreferrer"
        >
          X
        </a>
        <button type="button" className="journal-pill" onClick={copyLink} aria-live="polite">
          {copied ? "Copied" : "Link"}
        </button>
      </div>
    </div>
  );
}
