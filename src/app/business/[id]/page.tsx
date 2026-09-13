import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VoteProvider, UpvoteButton, UpvoteCtaButton } from "@/components/UpvoteBlock";
import { DIRECT_CATEGORY_PAGES } from "@/lib/data";
import { Store } from "@/lib/store";
import { shade } from "@/lib/color";

export async function generateMetadata({ params }: PageProps<"/business/[id]">): Promise<Metadata> {
  const { id } = await params;
  const business = await Store.getBusinessById(id);
  return { title: business ? `${business.name} — Discover Wiltshire` : "Business — Discover Wiltshire" };
}

export default async function BusinessPage({ params }: PageProps<"/business/[id]">) {
  const { id } = await params;
  const business = await Store.getBusinessById(id);

  if (!business) {
    return (
      <>
        <Header />
        <main className="wrap" style={{ maxWidth: 760 }}>
          <p style={{ padding: "40px 0" }}>
            We couldn&apos;t find that business. <Link href="/">Back to the leaderboard</Link>.
          </p>
        </main>
        <Footer />
      </>
    );
  }

  const breadcrumbHref = DIRECT_CATEGORY_PAGES.includes(business.category)
    ? `/${business.category}`
    : `/trades/${business.category}`;
  const categoryLabels = await Store.getCategoryLabels();
  const categoryLabel = categoryLabels[business.category] || business.category;

  return (
    <VoteProvider businessId={business.id} initialVotes={business.liveVotes}>
      <Header />

      <main className="wrap" style={{ maxWidth: 760 }}>
        <Link className="breadcrumb" href={breadcrumbHref}>
          ← {categoryLabel}
        </Link>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 8,
            margin: "16px 0",
          }}
        >
          <div style={{ background: business.photoColor, height: 220, borderRadius: "var(--radius)" }} />
          <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 8 }}>
            <div style={{ background: shade(business.photoColor, 10), borderRadius: "var(--radius)" }} />
            <div style={{ background: shade(business.photoColor, -10), borderRadius: "var(--radius)" }} />
          </div>
        </div>

        <div className="bp-header">
          <div>
            <div className="bp-name-row">
              <div className="bp-name">{business.name}</div>
              {business.promoted && <span className="tag tag-promoted">Promoted</span>}
              {business.featured && <span className="tag tag-featured">Featured</span>}
              {business.foundingMember && <span className="tag tag-founding">Founding member</span>}
            </div>
            <div style={{ fontSize: 13, opacity: 0.65, marginTop: 4 }}>{business.tagline}</div>
          </div>
          <UpvoteButton />
        </div>

        <div className="bp-facts">
          <span>📍 {business.location}</span>
          <span>{business.priceRange}</span>
          <span>{business.phone}</span>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          <a className="btn btn-primary" href={business.website}>
            Book / contact
          </a>
          <a className="btn btn-secondary" href="#">
            Get directions
          </a>
        </div>

        <h2 className="section-heading">why locals love it</h2>
        <p style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.7, maxWidth: "65ch" }}>{business.description}</p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 8,
            margin: "14px 0 22px",
          }}
        >
          <div style={{ background: shade(business.photoColor, 12), height: 70, borderRadius: 8 }} />
          <div style={{ background: shade(business.photoColor, -6), height: 70, borderRadius: 8 }} />
          <div style={{ background: shade(business.photoColor, 18), height: 70, borderRadius: 8 }} />
          <div style={{ background: shade(business.photoColor, -14), height: 70, borderRadius: 8 }} />
        </div>

        {business.testimonials.length > 0 && (
          <>
            <h2 className="section-heading">what people are saying</h2>
            {business.testimonials.map((t) => (
              <div className="card testimonial" key={t.name} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 500 }}>{t.name}</div>
                <div style={{ fontSize: 13, opacity: 0.75, marginTop: 2 }}>{t.quote}</div>
              </div>
            ))}
          </>
        )}

        <p className="placeholder-note">
          Photos and the map are colour-block placeholders in this prototype. Swap in real photography, and a real
          map embed if you want one, when this becomes a live page.
        </p>

        <div className="cta-band">
          <h3>think {business.name} deserves to climb higher?</h3>
          <UpvoteCtaButton />
        </div>
      </main>

      <Footer />
    </VoteProvider>
  );
}
