import type { Metadata } from "next";
import Link from "next/link";
import "@/components/members/members.css";

export const metadata: Metadata = {
  title: "Terms — Discover Wiltshire",
};

export default function TermsPage() {
  return (
    <div className="wrap legal" style={{ maxWidth: 720 }}>
      <h1 className="page-title">terms of use</h1>
      <p className="legal-draft">
        <strong>Draft.</strong> This is a plain-English starting point written to match how the site works. It hasn&apos;t
        been reviewed by a solicitor — have it checked, and add your contact details, before you rely on it.
      </p>

      <h2>Using Discover Wiltshire</h2>
      <p>
        Discover Wiltshire is a directory of local businesses, ranked by upvotes from the people who live here. You can
        browse and upvote without an account. Creating a free account lets you write reviews and keep a public profile.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>Give a real email address — we use it to confirm your account — and keep your password to yourself.</li>
        <li>Your display name is public. Choose something that doesn&apos;t impersonate anyone else.</li>
        <li>One person, one account.</li>
      </ul>

      <h2>Reviews</h2>
      <p>Reviews help people decide where to spend their money, so they have to be trustworthy. When you write one you confirm that:</p>
      <ul>
        <li>it&apos;s about your own, genuine experience of the business;</li>
        <li>you aren&apos;t the owner, an employee, or a competitor of the business, and nobody has paid or rewarded you to write it;</li>
        <li>it doesn&apos;t include abuse, hate, personal details about anyone, or claims you can&apos;t stand behind; and</li>
        <li>you haven&apos;t copied it from somewhere else.</li>
      </ul>
      <p>
        Reviews are read by us before they appear, and we may decline or remove any review, for any reason, including
        reviews that break these rules. Please don&apos;t take that personally — it&apos;s how we keep the reviews honest.
      </p>
      <p>
        You keep ownership of what you write, but you give us permission to publish it on Discover Wiltshire and to keep
        showing it until you delete it. You can delete your own reviews at any time from your account page.
      </p>

      <h2>Reporting a problem</h2>
      <p>
        Every review has a <em>Report</em> link. If you&apos;re a business owner and believe a review is false or
        defamatory, use that link or contact us (below) and tell us what&apos;s wrong and why. We&apos;ll look at it
        promptly and may remove the review while we do.
      </p>

      <h2>Businesses</h2>
      <p>
        Listings are free. Rankings are decided by upvotes; paid options (promoted slots, sponsorships) are always
        labelled and never change a business&apos;s upvote count. See the <Link href="/pricing">pricing page</Link>.
      </p>

      <h2>Our responsibility</h2>
      <p>
        We do our best to keep the information here accurate, but it comes from businesses and members, so we can&apos;t
        promise it&apos;s always right or up to date. Check opening times and details with the business before you travel.
        Nothing here limits any rights you have under UK consumer law.
      </p>

      <h2>Changes and law</h2>
      <p>
        We may update these terms; the date of the latest version will be shown here. They&apos;re governed by the laws
        of England and Wales.
      </p>

      <h2>Contact</h2>
      <p>[Add a contact email address or form here before launch.]</p>

      <p>
        How we handle your personal data is explained in the <Link href="/privacy">privacy notice</Link>.
      </p>
    </div>
  );
}
