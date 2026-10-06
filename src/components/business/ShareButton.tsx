"use client";

import { useState } from "react";
import { ShareIcon } from "@/components/home/icons";

/** Uses the phone/OS share sheet where there is one, otherwise copies the
 * page address to the clipboard and says so. */
export default function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Dismissing the share sheet rejects the promise; nothing to report.
    }
  }

  return (
    <button type="button" className="btn btn-secondary" onClick={share}>
      <ShareIcon size={16} />
      {copied ? "Link copied" : "Share"}
    </button>
  );
}
