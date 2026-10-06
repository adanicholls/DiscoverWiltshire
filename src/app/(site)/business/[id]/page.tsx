import type { Metadata } from "next";
import Link from "next/link";
import ShareButton from "@/components/business/ShareButton";
import SidebarEvents from "@/components/SidebarEvents";
import { VoteProvider, VoteCount, UpvoteActionButton, UpvoteCtaButton } from "@/components/UpvoteBlock";
import { DirectionsIcon, GlobeIcon, PhoneIcon } from "@/components/home/icons";
import { DIRECT_CATEGORY_PAGES, TOWN_LABELS } from "@/lib/data";
import { Store } from "@/lib/store";
import { shade } from "@/lib/color";
import "@/components/business/business.css";

export async function generateMetadata({ params }: PageProps<"/business/[id]">): Promise<Metadata> {
  const { id } = await params;
  const business = await Store.getBusinessById(id);
  return { title: business ? `${business.name} — Discover Wiltshire` : "Business — Discover Wiltshire" };
}

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]!.toUpperCase())
      .join("") || "?"
  );
}

/** "https://www.example.co.uk/menu" -> "example.co.uk"; null for the "#"
 * placeholder a listing gets when it has no website. */
function websiteHost(url: string): string | null {
  if (!/^https?:\/\//i.test(url)) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export default async function BusinessPage({ params }: PageProps<"/business/[id]">) {
  const { id } = await params;
  const business = await Store.getBusinessById(id);

  if (!business) {
    return (
      <>
        <div className="wrap" style={{ maxWidth: 760 }}>
          <p style={{ padding: "40px 0" }}>
            We couldn&apos;t find that business. <Link href="/">Back to the leaderboard</Link>.
          </p>
        </div>
      </>
    );
  }

  const categoryHref = DIRECT_CATEGORY_PAGES.includes(business.category)
    ? `/${business.category}`
    : `/trades/${business.category}`;
  const [categoryLabels, sameCategory] = await Promise.all([
    Store.getCategoryLabels(),
    Store.getApprovedBusinesses({ category: business.category }),
  ]);
  const categoryLabel = categoryLabels[business.category] || business.category;
  const townLabel = business.town ? TOWN_LABELS[business.town] || business.town : null;

  // Standing within its category on upvotes alone (the promoted slots that
  // pin businesses to the top of a list don't count towards this).
  const byVotes = [...sameCategory].sort((a, b) => b.liveVotes - a.liveVotes);
  const rank = byVotes.findIndex((b) => b.id === business.id) + 1;
  const more = byVotes.filter((b) => b.id !== business.id).slice(0, 4);

  const host = websiteHost(business.website);
  const phoneHref = business.phone ? `tel:${business.phone.replace(/[^\d+]/g, "")}` : null;
  const directionsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    [business.name, business.location].filter(Boolean).join(", ")
  )}`;
  const tags = [categoryLabel, townLabel, business.priceRange].filter(Boolean) as string[];

  return (
    <VoteProvider businessId={business.id} initialVotes={business.liveVotes}>
      <Link className="bp2-back" href={categoryHref}>
        ← {categoryLabel}
      </Link>

      <div className="bp2">
        <div className="bp2-main">
          <header className="bp2-head">
            <div className="bp2-title-row">
              <h1 className="bp2-name">{business.name}</h1>
              <ShareButton title={business.name} />
            </div>

            <div className="bp2-score">
              <span className="bp2-score-num">
                <span aria-hidden="true">▲</span> <VoteCount />
              </span>
              <span className="bp2-dot">•</span>
              <span>upvotes</span>
              {rank > 0 && (
                <>
                  <span className="bp2-dot">•</span>
                  <span>
                    #{rank} in {categoryLabel}
                  </span>
                </>
              )}
            </div>

            <div className="bp2-tags">
              {tags.map((t, i) => (
                <span key={t} className="bp2-tag">
                  {i > 0 && <span className="bp2-dot">•</span>}
                  {t}
                </span>
              ))}
              {business.promoted && <span className="tag tag-promoted">Promoted</span>}
              {business.featured && <span className="tag tag-featured">Featured</span>}
              {business.foundingMember && <span className="tag tag-founding">Founding member</span>}
            </div>

            <p className="bp2-tagline">{business.tagline}</p>

            <div className="bp2-actions">
              <UpvoteActionButton />
              <a className="btn btn-secondary" href={directionsHref} target="_blank" rel="noopener noreferrer">
                <DirectionsIcon size={16} />
                Directions
              </a>
              {phoneHref && (
                <a className="btn btn-secondary" href={phoneHref}>
                  <PhoneIcon size={16} />
                  Call
                </a>
              )}
              {host && (
                <a className="btn btn-secondary" href={business.website} target="_blank" rel="noopener noreferrer">
                  <GlobeIcon size={16} />
                  Website
                </a>
              )}
            </div>
          </header>

          <section className="bp2-section" aria-labelledby="bp2-photos">
            <h2 id="bp2-photos" className="bp2-h2">
              Photos
            </h2>
            <div className="bp2-photos">
              {[0, 12, -8, 18].map((amount) => (
                <div key={amount} className="bp2-photo" style={{ background: shade(business.photoColor, amount) }} />
              ))}
            </div>
          </section>

          <section className="bp2-section" aria-labelledby="bp2-about">
            <h2 id="bp2-about" className="bp2-h2">
              About
            </h2>
            <p className="bp2-about">{business.description}</p>
            <div className="bp2-chips">
              {tags.map((t) => (
                <span key={t} className="bp2-chip">
                  {t}
                </span>
              ))}
              {business.foundingMember && <span className="bp2-chip">Founding member</span>}
            </div>
          </section>

          {business.testimonials.length > 0 && (
            <section className="bp2-section" aria-labelledby="bp2-reviews">
              <h2 id="bp2-reviews" className="bp2-h2">
                What people are saying
              </h2>
              <div className="bp2-reviews">
                {business.testimonials.map((t) => (
                  <article className="bp2-review" key={t.name}>
                    <span className="bp2-avatar" aria-hidden="true">
                      {initials(t.name)}
                    </span>
                    <div>
                      <div className="bp2-review-name">{t.name}</div>
                      <p className="bp2-review-quote">{t.quote}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          <div className="cta-band">
            <h3>think {business.name} deserves to climb higher?</h3>
            <UpvoteCtaButton />
          </div>
        </div>

        <aside className="bp2-side">
          <section className="bp2-card" aria-labelledby="bp2-find">
            <h2 id="bp2-find" className="bp2-card-title">
              Find us
            </h2>
            <dl className="bp2-rows">
              {(business.location || townLabel) && (
                <div>
                  <dt>Address</dt>
                  <dd>
                    {business.location}
                    {townLabel && business.location && <br />}
                    {townLabel && <Link href={`/towns/${business.town}`}>{townLabel}</Link>}
                  </dd>
                </div>
              )}
              {phoneHref && (
                <div>
                  <dt>Phone</dt>
                  <dd>
                    <a href={phoneHref}>{business.phone}</a>
                  </dd>
                </div>
              )}
              {host && (
                <div>
                  <dt>Website</dt>
                  <dd>
                    <a href={business.website} target="_blank" rel="noopener noreferrer">
                      {host}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
            <a className="bp2-card-link" href={directionsHref} target="_blank" rel="noopener noreferrer">
              Get directions →
            </a>
          </section>

          <section className="bp2-card" aria-labelledby="bp2-glance">
            <h2 id="bp2-glance" className="bp2-card-title">
              At a glance
            </h2>
            <dl className="bp2-rows bp2-rows--split">
              <div>
                <dt>Category</dt>
                <dd>
                  <Link href={categoryHref}>{categoryLabel}</Link>
                </dd>
              </div>
              {townLabel && (
                <div>
                  <dt>Area</dt>
                  <dd>
                    <Link href={`/towns/${business.town}`}>{townLabel}</Link>
                  </dd>
                </div>
              )}
              {business.priceRange && (
                <div>
                  <dt>Price</dt>
                  <dd>{business.priceRange}</dd>
                </div>
              )}
              <div>
                <dt>Upvotes</dt>
                <dd>
                  <VoteCount />
                </dd>
              </div>
              {rank > 0 && (
                <div>
                  <dt>Ranking</dt>
                  <dd>
                    #{rank} of {byVotes.length}
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {more.length > 0 && (
            <section className="bp2-card" aria-labelledby="bp2-more">
              <h2 id="bp2-more" className="bp2-card-title">
                More in {categoryLabel}
              </h2>
              <ul className="bp2-more">
                {more.map((b) => (
                  <li key={b.id}>
                    <Link href={`/business/${b.id}`} className="bp2-more-row">
                      <span className="bp2-more-thumb" style={{ background: b.photoColor }} aria-hidden="true" />
                      <span className="bp2-more-text">
                        <span className="bp2-more-name">{b.name}</span>
                        <span className="bp2-more-tag">{b.tagline}</span>
                      </span>
                      <span className="bp2-more-votes">▲ {b.liveVotes}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link className="bp2-card-link" href={categoryHref}>
                See all →
              </Link>
            </section>
          )}

          {business.town && <SidebarEvents town={business.town} />}
        </aside>
      </div>
    </VoteProvider>
  );
}
