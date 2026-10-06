import type { Metadata } from "next";
import Link from "next/link";
import "@/components/members/members.css";

export const metadata: Metadata = {
  title: "Privacy notice — Discover Wiltshire",
};

export default function PrivacyPage() {
  return (
    <div className="wrap legal" style={{ maxWidth: 720 }}>
      <h1 className="page-title">privacy notice</h1>
      <p className="legal-draft">
        <strong>Draft.</strong> This describes what the site actually does today. It hasn&apos;t been reviewed by a
        solicitor — have it checked, and add the name and contact details of whoever runs the site, before you rely on it.
      </p>

      <h2>Who we are</h2>
      <p>Discover Wiltshire is run by [add your name or business name and contact email]. We decide how your data is used, so we are the &ldquo;controller&rdquo;.</p>

      <h2>What we collect, and why</h2>
      <ul>
        <li>
          <strong>If you create an account:</strong> your email address, a display name you choose, an optional short bio,
          and your password (stored only as a one-way hash by our sign-in provider — we can never see it). We use these to
          run your account and show your name on your reviews and profile.
        </li>
        <li>
          <strong>If you write a review:</strong> the rating, your text, the date, and which business it&apos;s about. Approved
          reviews are public, with your display name.
        </li>
        <li>
          <strong>If you report a review:</strong> your report and who sent it, so we can follow up. Reports are never public.
        </li>
        <li>
          <strong>If you upvote:</strong> a random anonymous ID is stored in your browser so we can count one vote per person.
          It isn&apos;t linked to your name or email.
        </li>
        <li>
          <strong>If you list a business or submit an event:</strong> the details you give us, which are published once approved.
        </li>
      </ul>
      <p>
        We rely on <em>contract</em> (providing the account you asked for) and <em>legitimate interests</em> (keeping reviews
        honest and the site safe) to use this data. We don&apos;t sell it and we don&apos;t send marketing emails.
      </p>

      <h2>Who else handles it</h2>
      <p>
        Our database and sign-in are provided by Supabase, and the site is hosted by Vercel. They process data on our
        behalf. Confirmation emails are sent through our email provider.
      </p>

      <h2>How long we keep it</h2>
      <p>
        Your account and reviews stay until you delete them or ask us to. Deleting a review removes it straight away.
        Reports are kept for as long as they&apos;re needed to deal with the issue.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask to see, correct or delete the data we hold about you, or object to how we use it, by contacting us. You
        can delete your own reviews from your <Link href="/account">account page</Link>. If you&apos;re unhappy with how
        we&apos;ve handled your data you can complain to the Information Commissioner&apos;s Office (ico.org.uk).
      </p>

      <h2>Cookies</h2>
      <p>
        We use only what the site needs to work: a sign-in cookie if you have an account, and a small piece of browser
        storage for your anonymous voting ID. We don&apos;t use advertising or tracking cookies.
      </p>

      <h2>Contact</h2>
      <p>[Add a contact email address here before launch.]</p>

      <p>
        See also the <Link href="/terms">terms of use</Link>.
      </p>
    </div>
  );
}
