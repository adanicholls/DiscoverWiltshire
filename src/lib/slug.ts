// Turns a business name into a URL-friendly id, with a short random suffix
// so two submissions of the same name (or a resubmission) never collide on
// the businesses table's primary key.
export function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base || "listing"}-${suffix}`;
}
