import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Pricing — Discover Wiltshire",
};

const bodyText: React.CSSProperties = { fontSize: 14, opacity: 0.8, lineHeight: 1.7 };
const listText: React.CSSProperties = { fontSize: 14, opacity: 0.8, lineHeight: 1.9 };

export default function PricingPage() {
  return (
    <>
      <style>{`
        .price-section { padding: 26px 0; border-top: 1px solid var(--border); }
        .price-section:first-of-type { border-top: none; }
        .price-head { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 8px; }
        .price-head h2 { font-family: var(--font-voice); font-size: 19px; font-weight: 400; margin: 0; }
        .price-tag { font-size: 13px; opacity: 0.7; }
        .price-table { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 13px; }
        .price-table th, .price-table td { text-align: left; padding: 8px 10px; border: 1px solid var(--border); }
        .faq-item { margin-bottom: 16px; }
        .faq-item p:first-child { font-weight: 500; margin-bottom: 4px; }
      `}</style>

      <Header />

      <main className="wrap" style={{ maxWidth: 680 }}>
        <h1 className="page-title">pricing</h1>
        <p className="placeholder-note">The numbers below are a starting draft — swap in your own before this goes live.</p>
        <p style={bodyText}>
          Every business gets a free listing, a spot in the rankings, and a fair shot at climbing on real upvotes
          from real locals. No catch, no time limit, no card required. The options below are for businesses who want
          a bit more visibility on top of that — they buy attention, never rank.
        </p>

        <div className="price-section">
          <div className="price-head">
            <h2>List your business</h2>
            <span className="price-tag">free, forever</span>
          </div>
          <ul style={listText}>
            <li>A full business profile — photos, description, hours, contact details</li>
            <li>A place in your category&apos;s leaderboard, and the county-wide one</li>
            <li>The ability to climb purely on genuine upvotes</li>
            <li>Reviewed by a human before it goes live, usually within 2 business days</li>
          </ul>
          <p style={bodyText}>No upvote can be bought. No listing can be bumped by paying more. That&apos;s the whole point.</p>
          <a className="btn btn-primary" href="/list-your-business">
            List your business →
          </a>
        </div>

        <div className="price-section">
          <div className="price-head">
            <h2>Promote your listing</h2>
            <span className="price-tag">from £25/week</span>
          </div>
          <p style={bodyText}>
            Want your business seen by everyone checking Discover Wiltshire today, not just the people already
            searching your category? A promoted slot puts you in one of the 4 featured positions at the top of a
            page, clearly tagged, alongside — not instead of — the genuine top performers.
          </p>
          <table className="price-table">
            <tbody>
              <tr>
                <th>Placement</th>
                <th>Rate</th>
                <th>Positions available</th>
              </tr>
              <tr>
                <td>A single category page</td>
                <td>£25/week</td>
                <td>4</td>
              </tr>
              <tr>
                <td>The homepage</td>
                <td>£50/week</td>
                <td>4</td>
              </tr>
            </tbody>
          </table>
          <ul style={listText}>
            <li>Self-serve — pick your slot, pick your dates, pay on the spot</li>
            <li>Every purchase is reviewed before it goes live</li>
            <li>When your slot ends, you drop back to wherever your real upvotes put you</li>
          </ul>
        </div>

        <div className="price-section">
          <div className="price-head">
            <h2>Sponsor a category</h2>
            <span className="price-tag">from £150/month</span>
          </div>
          <p style={bodyText}>
            Put your name on an entire category — &quot;Eat &amp; drink, in partnership with [your business]&quot; —
            for as long as you hold the sponsorship. This is a masthead credit, not a ranking boost: it buys
            visibility and goodwill, not a numbered position. One sponsor per category at a time.
          </p>
        </div>

        <div className="price-section">
          <div className="price-head">
            <h2>Featured listing upgrade</h2>
            <span className="price-tag">£75, one-time</span>
          </div>
          <p style={bodyText}>
            For businesses who aren&apos;t chasing the top spot but want to put their best foot forward: a permanent
            &quot;Featured&quot; badge, extra photos, and a booking or contact button built into your profile. Your
            rank stays exactly what your upvotes say it is — this just makes your listing look as good as the place
            actually is.
          </p>
        </div>

        <div className="price-section" id="founding-membership">
          <div className="price-head">
            <h2>Founding membership</h2>
            <span className="price-tag">£99, one-time — open for 6 months only</span>
          </div>
          <p style={bodyText}>
            The businesses who back Discover Wiltshire early deserve to be treated like it. Become a founding member
            before <strong>[date]</strong> and:
          </p>
          <ul style={listText}>
            <li>Lock in today&apos;s promoted-slot pricing for life, however much rates rise later</li>
            <li>Get a permanent founding member badge on your profile</li>
            <li>Get first refusal on new promoted slots as they open up</li>
          </ul>
          <p style={bodyText}>
            After <strong>[date]</strong>, this offer closes permanently. No exceptions, no re-opening it later —
            that&apos;s what makes it worth having.
          </p>
        </div>

        <h2 className="section-heading">questions worth answering up front</h2>
        <div className="faq-item">
          <p>Does paying move me up the rankings?</p>
          <p style={{ opacity: 0.75, fontSize: 14 }}>
            No. Paid options buy a tag, a badge, or a position at the top of the page — never a vote. Every upvote
            you see is real.
          </p>
        </div>
        <div className="faq-item">
          <p>What happens when my promoted slot runs out?</p>
          <p style={{ opacity: 0.75, fontSize: 14 }}>
            You drop back to your genuine position, based on your real upvote count. Nothing about your organic
            ranking is affected either way.
          </p>
        </div>
        <div className="faq-item">
          <p>Can more than one business sponsor the same category?</p>
          <p style={{ opacity: 0.75, fontSize: 14 }}>No — one sponsor per category, so it actually means something.</p>
        </div>
        <div className="faq-item">
          <p>Is the free listing really free forever?</p>
          <p style={{ opacity: 0.75, fontSize: 14 }}>Yes. Listing, climbing the rankings, and getting found costs nothing today or ever.</p>
        </div>
        <div className="faq-item">
          <p>What if I become a founding member and then never buy a promoted slot?</p>
          <p style={{ opacity: 0.75, fontSize: 14 }}>
            The price lock and badge are yours regardless — you&apos;re not obligated to use them, they&apos;re just
            waiting whenever you do.
          </p>
        </div>

        <div className="cta-band">
          <h3>ready to be found by the people already looking for you?</h3>
          <a className="btn btn-primary" href="/list-your-business">
            List your business — it&apos;s free →
          </a>
        </div>
      </main>

      <Footer />
    </>
  );
}
