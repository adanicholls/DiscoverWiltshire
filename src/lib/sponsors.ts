// Small pure helpers for sponsorships - kept free of Supabase/Next imports
// so the server action, the card, and a quick node test can all share them.

export const SPONSOR_IMAGE_BUCKET = "sponsor-images";
export const SPONSOR_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
export const SPONSOR_IMAGE_MAX_BYTES = 2 * 1024 * 1024;
export const SPONSOR_DEFAULT_COLOR = "#D9C7A3";

/** Cleans up a sponsor's link: trims it, assumes https:// if no scheme was
 * typed, and only ever accepts http(s) - anything else (javascript:, data:,
 * mailto: ...) is rejected rather than rendered into an href. Returns ""
 * for an empty input, since a link is optional. */
export function normalizeWebsite(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  // Anything that isn't already http(s):// gets https:// put in front, which
  // makes other schemes ("javascript:alert(1)", "data:...") parse as a
  // nonsense host:port and fail below instead of slipping through.
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    throw new Error("That website address doesn't look right");
  }
  if (!url.hostname.includes(".") || url.username || url.password) {
    throw new Error("That website address doesn't look right");
  }
  return url.toString();
}

/** "https://www.example.com/path" -> "example.com", for showing under the ad. */
export function websiteDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/** The object path inside the sponsor-images bucket for one of its public
 * URLs (".../object/public/sponsor-images/abc.png" -> "abc.png"), or null if
 * the URL isn't from this bucket. Used to delete a replaced/removed image. */
export function sponsorImagePath(publicUrl: string): string | null {
  const marker = `/object/public/${SPONSOR_IMAGE_BUCKET}/`;
  const at = publicUrl.indexOf(marker);
  if (at === -1) return null;
  const path = decodeURIComponent(publicUrl.slice(at + marker.length).split("?")[0]);
  return path || null;
}

export function isHexColor(value: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(value);
}

/** Black or white, whichever reads better on the given background - for the
 * sponsor's initial on its fallback tile. */
export function readableTextOn(hex: string): "#101828" | "#ffffff" {
  const color = isHexColor(hex) ? hex : SPONSOR_DEFAULT_COLOR;
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  // Perceived brightness (ITU-R BT.601).
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#101828" : "#ffffff";
}
