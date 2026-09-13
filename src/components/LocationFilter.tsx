"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { TOWNS } from "@/lib/data";

/** A town dropdown that narrows whatever's currently showing on the
 * homepage (the default top-8 list, or a text search) to one town —
 * combines with the free-text search box rather than replacing it. */
export default function LocationFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTown = searchParams.get("town") ?? "";

  function handleChange(townId: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (townId) {
      params.set("town", townId);
    } else {
      params.delete("town");
    }
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
  }

  return (
    <select
      aria-label="Filter by town"
      value={currentTown}
      onChange={(e) => handleChange(e.target.value)}
      style={{ width: "auto", minWidth: 160 }}
    >
      <option value="">All of Wiltshire</option>
      {TOWNS.map((town) => (
        <option key={town.id} value={town.id}>
          {town.label}
        </option>
      ))}
    </select>
  );
}
