import RemoteImage from "@/components/RemoteImage";
import { TOWN_LABELS } from "@/lib/data";
import { formatEventRange } from "@/lib/eventDate";
import type { FeaturedEvent } from "@/lib/store";
import "./featured.css";

/** The banner slot at the very top of /whats-on: one event with a big image,
 * its dates, where it is, and a single button to its own page. Styled like
 * the hero card on the homepage (gradient outline on a dark card) so it reads
 * as the page's headline, and always carries a "Sponsored" or "Featured"
 * label so a paid placement is never passed off as editorial. */
export default function FeaturedEventCard({ event }: { event: FeaturedEvent }) {
  const hasLink = /^https?:\/\//i.test(event.website);
  const where = [event.venue, event.town ? TOWN_LABELS[event.town] || event.town : ""].filter(Boolean).join(" · ");
  const dates = formatEventRange(event.startsAt, event.endsAt);
  const hasImage = /^https?:\/\//i.test(event.imageUrl);

  return (
    <article className="fe" aria-labelledby="fe-title">
      <div className="fe-inner">
        <div className="fe-media" style={{ background: event.photoColor }}>
          {hasImage && <RemoteImage src={event.imageUrl} alt="" sizes="(max-width: 860px) 100vw, 480px" priority />}
          <span className="fe-label">{event.sponsorLabel}</span>
        </div>

        <div className="fe-body">
          <p className="fe-dates">{dates}</p>
          <h2 id="fe-title" className="fe-title">
            {event.name}
          </h2>
          {where && <p className="fe-where">{where}</p>}
          {event.description && <p className="fe-desc">{event.description}</p>}
          {event.priceText && <p className="fe-price">{event.priceText}</p>}

          {hasLink && (
            <a className="btn btn-primary fe-cta" href={event.website} target="_blank" rel="sponsored noopener noreferrer">
              {event.ctaLabel} →
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
