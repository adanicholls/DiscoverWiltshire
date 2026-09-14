import { TOWNS } from "./data";

/** Splits a combined "electrician Melksham"-style phrase into its trade
 * and town parts, by checking whether it ends with a known town name. The
 * homepage search bar has two separate fields, but this lets the single
 * "what" field still work correctly if someone types both into it without
 * touching the town dropdown - the two-field layout is a hint, not a hard
 * requirement. */
export function splitTradeAndTown(raw: string): { trade: string; townId: string } {
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();

  for (const town of TOWNS) {
    const label = town.label.toLowerCase();
    if (lower.endsWith(label) && lower.length > label.length) {
      const rest = trimmed.slice(0, trimmed.length - town.label.length).trim();
      // Strips a trailing connector word left dangling by the split, e.g.
      // "electrician in Melksham" -> "electrician", not "electrician in".
      const cleaned = rest.replace(/\b(in|near|at)$/i, "").trim();
      if (cleaned) return { trade: cleaned, townId: town.id };
    }
  }

  return { trade: trimmed, townId: "" };
}
