import type { ReactNode } from "react";
import Link from "next/link";
import RemoteImage from "@/components/RemoteImage";
import { ctaText, entryHref, entryIsExternal, entryTags, type JournalSummary } from "@/lib/journal";
import "./journal.css";

function Arrow({ external }: { external: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="journal-card__icon">
      {external ? (
        <path d="M4 10 10 4M5 4h5v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M2.5 7h9M8 3.5 11.5 7 8 10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

// An article opens its own page; a news item opens somewhere else in a new
// tab; a news item with no usable link is just not clickable.
function CardLink({
  href,
  external,
  className,
  decorative,
  children,
}: {
  href: string;
  external: boolean;
  className: string;
  decorative?: boolean;
  children: ReactNode;
}) {
  const extra = decorative ? { tabIndex: -1, "aria-hidden": true as const } : {};
  if (!href) return <div className={className}>{children}</div>;
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} {...extra}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} {...extra}>
      {children}
    </Link>
  );
}

/** One journal card. Articles get a square image; news gets a taller one and
 * leads with its (longer) blurb. The button on the image shows just an icon
 * until the card is hovered or focused, then reveals its label. */
export default function JournalCard({ entry, priority }: { entry: JournalSummary; priority?: boolean }) {
  const href = entryHref(entry);
  const external = entryIsExternal(entry);

  return (
    <article className={`journal-card journal-card--${entry.type}`}>
      {/* The image is a second route to the same place as the title, so it's
          taken out of the tab order and the accessibility tree. */}
      <CardLink href={href} external={external} className="journal-card__media" decorative>
        {entry.coverUrl ? (
          <RemoteImage
            src={entry.coverUrl}
            alt=""
            sizes="(max-width: 559px) 100vw, (max-width: 999px) 50vw, 260px"
            className="journal-card__img"
            priority={priority}
          />
        ) : (
          <div className="journal-card__placeholder" aria-hidden="true">
            {entry.title.trim().charAt(0).toUpperCase()}
          </div>
        )}
        {href && (
          <span className="journal-card__cta">
            <span className="journal-card__cta-text">{ctaText(entry)}</span>
            <Arrow external={external} />
          </span>
        )}
      </CardLink>

      <div className="journal-card__content">
        <div className="journal-card__tags">
          {entryTags(entry).map((tag) => (
            <span key={tag} className="journal-card__tag">
              {tag}
            </span>
          ))}
        </div>
        <CardLink href={href} external={external} className="journal-card__title">
          {entry.title}
        </CardLink>
      </div>
    </article>
  );
}
