import type { Metadata } from "next";

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
        /* Native <details>/<summary> accordion - disclosure semantics,
           keyboard support, and find-in-page all come from the browser,
           no JS or ARIA needed. Colours/type pull from this site's own
           tokens instead of the reference demo's blue theme. */
        /* Each question is its own dark card like the pricing tiles; the open
           one gets the coral -> magenta -> violet gradient as its outline. */
        .faq-accordion { display: flex; flex-direction: column; gap: 10px; margin-top: 14px; }
        .faq-accordion__item {
          background: #1a1a1c;
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 0 20px;
          transition: border-color 0.15s ease;
        }
        .faq-accordion__item:hover { border-color: #444746; }
        .faq-accordion__item[open] {
          border-color: transparent;
          background:
            linear-gradient(#1a1a1c, #1a1a1c) padding-box,
            linear-gradient(120deg, #ff6154 0%, #d946ef 58%, #7c5cff 100%) border-box;
        }
        .faq-accordion__q {
          list-style: none;
          cursor: pointer;
          position: relative;
          padding: 16px 32px 16px 0;
          font-size: 14px;
          font-weight: 500;
          color: var(--ink);
          transition: color 0.15s;
        }
        .faq-accordion__q::-webkit-details-marker { display: none; }
        .faq-accordion__q::marker { content: ""; }
        .faq-accordion__q:hover { color: #fff; }
        .faq-accordion__q::after {
          content: "";
          position: absolute;
          right: 4px;
          top: 50%;
          width: 8px;
          height: 8px;
          border-right: 2px solid currentColor;
          border-bottom: 2px solid currentColor;
          transform: translateY(-70%) rotate(45deg);
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0.55;
        }
        .faq-accordion__item[open] > .faq-accordion__q::after { transform: translateY(-30%) rotate(225deg); }
        .faq-accordion__item[open] > .faq-accordion__q { color: #fff; }
        .faq-accordion__item[open] > .faq-accordion__q::after { opacity: 1; color: #ff6154; }
        .faq-accordion__a { padding: 0 20px 18px 0; font-size: 13.5px; line-height: 1.6; color: var(--ink-muted); }
        .faq-accordion__item[open] .faq-accordion__a { animation: faq-accordion-in 0.3s cubic-bezier(0.2, 0.7, 0.3, 1); }
        @keyframes faq-accordion-in {
          from { opacity: 0; translate: 0 -6px; }
          to { opacity: 1; translate: 0 0; }
        }
        .faq-accordion__q:focus-visible { outline: 2px solid var(--terracotta); outline-offset: 3px; border-radius: 6px; }
        @media (prefers-reduced-motion: reduce) {
          .faq-accordion__item[open] .faq-accordion__a { animation: none; }
          .faq-accordion__q::after { transition: none; }
        }

        /* "At a glance" bento summary - the mechanic (one dominant tile,
           smaller cells fanning out) borrowed from a bento pricing layout,
           rebuilt on this site's own tokens/copy instead of the source's
           coral theme, fabricated stat, and invented customer quote. */
        /* This page's content column caps at 680px regardless of viewport
           (see the maxWidth style below), so a true 4-across desktop grid
           never has room to breathe - the 2-column arrangement is the
           default here, not a narrow-viewport fallback. */
        .pricing-bento {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-areas: "hero hero" "promoted sponsor" "town founding" "stat stat";
          gap: 12px;
          margin: 20px 0 8px;
        }
        /* Colours follow the site shell: near-black tiles with hairline
           borders, the coral -> magenta -> violet gradient from the homepage
           hero on the free tier, and the sidebar's blue for founding members. */
        .pricing-bento__tile {
          background: #1a1a1c;
          border: 1px solid var(--border);
          transition: border-color 0.15s ease;
          border-radius: var(--radius-lg);
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 120px;
        }
        .pricing-bento__hero {
          grid-area: hero;
          background: linear-gradient(120deg, #ff6154 0%, #d946ef 58%, #7c5cff 100%);
          border: 0;
          color: #fff;
          position: relative;
          overflow: hidden;
        }
        .pricing-bento__hero::after {
          content: "";
          position: absolute;
          right: -40px;
          bottom: -40px;
          width: 160px;
          height: 160px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.16), transparent 70%);
          pointer-events: none;
        }
        .pricing-bento__pill {
          display: inline-block;
          align-self: flex-start;
          background: rgba(255,255,255,0.2);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 999px;
          margin-bottom: 8px;
        }
        .pricing-bento__tile h3 { font-family: var(--font-voice); font-size: 15px; font-weight: 400; margin: 0 0 6px; }
        .pricing-bento__hero h3 { font-size: 20px; }
        .pricing-bento__price { font-family: var(--font-voice); font-size: clamp(26px, 4vw, 38px); line-height: 1; margin-bottom: 10px; }
        .pricing-bento__price span { font-size: 0.4em; opacity: 0.75; margin-left: 4px; font-family: var(--font-sans); }
        .pricing-bento__hero ul { list-style: none; padding: 0; margin: 0 0 16px; font-size: 13px; line-height: 1.8; }
        .pricing-bento__hero ul li::before { content: "✓"; display: inline-block; width: 18px; font-weight: 700; }
        .pricing-bento__tile p { font-size: 13px; line-height: 1.5; opacity: 0.75; margin: 0 0 12px; }
        .pricing-bento__hero p { opacity: 0.92; }
        .pricing-bento__cta {
          align-self: flex-start; display: inline-block; padding: 9px 16px; border-radius: 8px;
          text-decoration: none; font-size: 13px; font-weight: 500; background: #fff; color: #131314;
        }
        .pricing-bento__cta:hover { background: rgba(255,255,255,0.85); }
        .pricing-bento__cta-sm {
          align-self: flex-start; font-size: 12.5px; font-weight: 500; color: var(--terracotta);
          text-decoration: none; border: 1px solid var(--terracotta); border-radius: 8px; padding: 7px 12px;
        }
        .pricing-bento__cta-sm:hover { background: var(--terracotta-wash); }
        .pricing-bento__promoted { grid-area: promoted; }
        .pricing-bento__sponsor { grid-area: sponsor; }
        .pricing-bento__town { grid-area: town; }
        /* A slim full-width strip along the bottom rather than a square tile. */
        .pricing-bento__stat { grid-area: stat; flex-direction: row; align-items: center; justify-content: flex-start; gap: 14px; min-height: 0; }
        .pricing-bento__stat-num {
          font-family: var(--font-voice);
          font-size: clamp(28px, 4vw, 40px);
          background: linear-gradient(90deg, #8ab4f8, #d946ef 55%, #ff6154);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .pricing-bento__stat-lbl { font-size: 12px; opacity: 0.7; line-height: 1.4; }
        .pricing-bento__founding { grid-area: founding; background: #004a77; color: #c2e7ff; border: 0; }
        .pricing-bento__founding .pricing-bento__cta-sm { color: #c2e7ff; border-color: rgba(194,231,255,0.5); }
        .pricing-bento__founding .pricing-bento__cta-sm:hover { background: rgba(194,231,255,0.12); }
        .pricing-bento__tile:not(.pricing-bento__hero):not(.pricing-bento__founding):hover { border-color: #444746; }

        @media (max-width: 480px) {
          .pricing-bento { grid-template-columns: 1fr; grid-template-areas: "hero" "promoted" "sponsor" "town" "founding" "stat"; }
        }
      `}</style>

      <div className="wrap" style={{ maxWidth: 680 }}>
        <h1 className="page-title">pricing</h1>
        <p className="placeholder-note">The numbers below are a starting draft — swap in your own before this goes live.</p>
        <p style={bodyText}>
          Every business gets a free listing, a spot in the rankings, and a fair shot at climbing on real upvotes
          from real locals. No catch, no time limit, no card required. The options below are for businesses who want
          a bit more visibility on top of that — they buy attention, never rank.
        </p>

        <div className="pricing-bento">
          <article className="pricing-bento__tile pricing-bento__hero">
            <span className="pricing-bento__pill">Always free</span>
            <h3>List your business</h3>
            <div className="pricing-bento__price">
              £0<span>forever</span>
            </div>
            <ul>
              <li>A full profile — photos, description, contact details</li>
              <li>A place in your category&apos;s leaderboard</li>
              <li>Room to climb on real upvotes only</li>
            </ul>
            <a className="pricing-bento__cta" href="/list-your-business">
              List your business →
            </a>
          </article>

          <article className="pricing-bento__tile pricing-bento__promoted">
            <h3>Promoted slot</h3>
            <div className="pricing-bento__price">
              £25<span>/week</span>
            </div>
            <p>One of 4 featured positions at the top of a page.</p>
            <a className="pricing-bento__cta-sm" href="#promoted-slot">
              Details →
            </a>
          </article>

          <article className="pricing-bento__tile pricing-bento__stat">
            <span className="pricing-bento__stat-num">0%</span>
            <span className="pricing-bento__stat-lbl">of any ranking is ever bought — upvotes only</span>
          </article>

          <article className="pricing-bento__tile pricing-bento__sponsor">
            <h3>Sponsor a category</h3>
            <div className="pricing-bento__price">
              £150<span>/month</span>
            </div>
            <p>Your name on an entire category&apos;s masthead.</p>
            <a className="pricing-bento__cta-sm" href="#category-sponsorship">
              Details →
            </a>
          </article>

          <article className="pricing-bento__tile pricing-bento__town">
            <h3>Sponsor a town</h3>
            <div className="pricing-bento__price">
              £100<span>/calendar month</span>
            </div>
            <p>Your name on a town page&apos;s masthead.</p>
            <a className="pricing-bento__cta-sm" href="#town-sponsorship">
              Details →
            </a>
          </article>

          <article className="pricing-bento__tile pricing-bento__founding">
            <h3>Founding membership</h3>
            <p>Lock in today&apos;s promoted-slot pricing for life. £99 one-time — open for 6 months only.</p>
            <a className="pricing-bento__cta-sm" href="#founding-membership">
              Details →
            </a>
          </article>
        </div>

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

        <div className="price-section" id="promoted-slot">
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

        <div className="price-section" id="category-sponsorship">
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

        <div className="price-section" id="town-sponsorship">
          <div className="price-head">
            <h2>Sponsor a town page</h2>
            <span className="price-tag">£100 per calendar month</span>
          </div>
          <p style={bodyText}>
            Put your name on a town&apos;s page — &quot;Devizes, in partnership with [your business]&quot; — for as
            long as you hold the sponsorship. Like a category sponsorship, this is a masthead credit, not a ranking
            boost: it buys visibility and goodwill with the people browsing that town, not a numbered position. One
            sponsor per town at a time.
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
        <div className="faq-accordion">
          <details className="faq-accordion__item" open>
            <summary className="faq-accordion__q">Does paying move me up the rankings?</summary>
            <div className="faq-accordion__a">
              <p>
                No. Paid options buy a tag, a badge, or a position at the top of the page — never a vote. Every
                upvote you see is real.
              </p>
            </div>
          </details>
          <details className="faq-accordion__item">
            <summary className="faq-accordion__q">What happens when my promoted slot runs out?</summary>
            <div className="faq-accordion__a">
              <p>
                You drop back to your genuine position, based on your real upvote count. Nothing about your organic
                ranking is affected either way.
              </p>
            </div>
          </details>
          <details className="faq-accordion__item">
            <summary className="faq-accordion__q">Can more than one business sponsor the same category or town?</summary>
            <div className="faq-accordion__a">
              <p>No — one sponsor per category and one per town, so it actually means something.</p>
            </div>
          </details>
          <details className="faq-accordion__item">
            <summary className="faq-accordion__q">Is the free listing really free forever?</summary>
            <div className="faq-accordion__a">
              <p>Yes. Listing, climbing the rankings, and getting found costs nothing today or ever.</p>
            </div>
          </details>
          <details className="faq-accordion__item">
            <summary className="faq-accordion__q">What if I become a founding member and then never buy a promoted slot?</summary>
            <div className="faq-accordion__a">
              <p>
                The price lock and badge are yours regardless — you&apos;re not obligated to use them, they&apos;re
                just waiting whenever you do.
              </p>
            </div>
          </details>
        </div>

        <div className="cta-band">
          <h3>ready to be found by the people already looking for you?</h3>
          <a className="btn btn-primary" href="/list-your-business">
            List your business — it&apos;s free →
          </a>
        </div>
      </div>
    </>
  );
}
