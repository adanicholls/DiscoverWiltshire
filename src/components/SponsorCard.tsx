import Link from "next/link";
import RemoteImage from "@/components/RemoteImage";
import { Store, type SponsorTargetType } from "@/lib/store";
import { readableTextOn, websiteDomain } from "@/lib/sponsors";

interface Props {
  type: SponsorTargetType;
  id: string;
  /** Display name of the page being sponsored, e.g. "Eat & drink" or "Devizes". */
  label: string;
}

/** The image-led "Sponsored" card in the right-hand column of a category or
 * town page: a small Sponsored tag, the creative, who it's in partnership
 * with, a headline, and the sponsor's domain - the whole card is the link.
 * When nobody has bought the slot it shows a quiet "sponsor this page"
 * prompt instead of leaving a hole. */
export default async function SponsorCard({ type, id, label }: Props) {
  const sponsor = await Store.getSponsorship(type, id);

  if (!sponsor) {
    return (
      <Link
        className="sponsor-card sponsor-card--house sponsor-card--link"
        href={type === "town" ? "/pricing#town-sponsorship" : "/pricing#category-sponsorship"}
      >
        <span className="sponsor-card__tag">Available</span>
        <div className="sponsor-card__name">Sponsor {label}</div>
        <div className="sponsor-card__headline">Your name, image and link at the top of this page.</div>
        <div className="sponsor-card__domain">See sponsorship options →</div>
      </Link>
    );
  }

  // The admin action only ever saves clean http(s) links, but rows can also
  // be edited directly in Supabase - so don't put anything else (javascript:,
  // a bare "example.com" that would resolve as a relative link...) in an href.
  const href = /^https?:\/\//i.test(sponsor.website) ? sponsor.website : "";
  const domain = websiteDomain(href);
  const body = (
    <>
      <span className="sponsor-card__tag">Sponsored</span>
      <div className="sponsor-card__media">
        {sponsor.imageUrl ? (
          <RemoteImage
            src={sponsor.imageUrl}
            alt={sponsor.sponsorName}
            sizes="(max-width: 860px) 100vw, 300px"
            className="sponsor-card__img"
          />
        ) : (
          <div
            className="sponsor-card__fallback"
            style={{ background: sponsor.photoColor, color: readableTextOn(sponsor.photoColor) }}
            aria-hidden="true"
          >
            {sponsor.sponsorName.trim().charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="sponsor-card__eyebrow">{label}, in partnership with</div>
      <div className="sponsor-card__name">{sponsor.sponsorName}</div>
      {sponsor.headline && <div className="sponsor-card__headline">{sponsor.headline}</div>}
      {domain && <div className="sponsor-card__domain">{domain} ↗</div>}
    </>
  );

  if (!href) {
    return <div className="sponsor-card">{body}</div>;
  }

  return (
    <a
      className="sponsor-card sponsor-card--link"
      href={href}
      target="_blank"
      rel="sponsored noopener noreferrer"
      aria-label={`Advertisement: ${sponsor.sponsorName}${sponsor.headline ? `. ${sponsor.headline}` : ""}`}
    >
      {body}
    </a>
  );
}
