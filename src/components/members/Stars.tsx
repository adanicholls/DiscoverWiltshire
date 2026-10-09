/** Five stars, filled up to `rating` (whole or half-step values both read
 * fine). Purely visual - the number is always given in text alongside it for
 * screen readers. */
export default function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  const percent = Math.max(0, Math.min(5, rating)) * 20;
  const star = (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path d="M10 1.5l2.5 5.3 5.8.7-4.3 4 1.1 5.7L10 14.3l-5.1 2.9L6 11.5l-4.3-4 5.8-.7z" fill="currentColor" />
    </svg>
  );
  const row = (
    <span className="stars-row" style={{ display: "inline-flex", gap: 2 }}>
      {star}
      {star}
      {star}
      {star}
      {star}
    </span>
  );

  return (
    <span className="stars" role="img" aria-label={`${rating} out of 5 stars`} style={{ position: "relative", display: "inline-block" }}>
      <span style={{ color: "var(--ph-outline, #444746)", display: "inline-flex" }}>{row}</span>
      <span style={{ color: "#fbbc04", position: "absolute", inset: 0, width: `${percent}%`, overflow: "hidden", display: "flex" }}>
        <span style={{ flex: "none" }}>{row}</span>
      </span>
    </span>
  );
}
