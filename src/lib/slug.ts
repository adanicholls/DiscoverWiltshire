// Turns a business name into a URL-friendly id, with a short random suffix
// so two submissions of the same name (or a resubmission) never collide on
// the businesses table's primary key.
export function slugify(name: string): string {
  const base = slugifyBase(name);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base || "listing"}-${suffix}`;
}

// Same cleanup, no random suffix - for ids that should stay stable and
// human-readable, like admin-created category ids (e.g. "Motoring" ->
// "motoring", used directly in /trades/motoring).
export function slugifyBase(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
