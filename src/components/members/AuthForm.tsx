"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { checkDisplayNameAvailable } from "@/app/member-actions";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { DISPLAY_NAME_MAX, validateDisplayName, validatePassword } from "@/lib/members";

interface Props {
  mode: "login" | "signup";
  /** A path on this site to return to afterwards (already sanitised by the page). */
  next: string;
  /** A note shown above the form, e.g. when an email link had expired. */
  notice?: string;
}

/** Sign in / create an account. Both use Supabase Auth directly from the
 * browser; the session lands in a cookie so server pages and actions see it. */
export default function AuthForm({ mode, next, notice }: Props) {
  const router = useRouter();
  const signup = mode === "signup";

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const supabase = createSupabaseBrowserClient();

    if (!signup) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(
          signInError.message === "Email not confirmed"
            ? "Please confirm your email first - we sent you a link when you signed up."
            : "That email and password don't match."
        );
        setSubmitting(false);
        return;
      }
      router.push(next);
      router.refresh();
      return;
    }

    const nameProblem = validateDisplayName(displayName) ?? validatePassword(password);
    if (nameProblem) {
      setError(nameProblem);
      setSubmitting(false);
      return;
    }
    const availability = await checkDisplayNameAvailable(displayName);
    if (!availability.ok) {
      setError(availability.error ?? "That name isn't available.");
      setSubmitting(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (signUpError) {
      setError(signUpError.message);
      setSubmitting(false);
      return;
    }

    if (data.session) {
      // Email confirmation is switched off in Supabase: they're already signed in.
      router.push(next);
      router.refresh();
      return;
    }
    setCheckEmail(true);
    setSubmitting(false);
  }

  if (checkEmail) {
    return (
      <div className="auth-card">
        <h1 className="page-title">check your email</h1>
        <p className="auth-note">
          We&apos;ve sent a confirmation link to <strong>{email}</strong>. Click it to finish creating your account â€” it
          can take a minute or two to arrive, and it&apos;s worth checking your spam folder.
        </p>
      </div>
    );
  }

  const otherHref = `${signup ? "/login" : "/signup"}?next=${encodeURIComponent(next)}`;

  return (
    <form className="auth-card" onSubmit={handleSubmit}>
      <h1 className="page-title">{signup ? "create your account" : "sign in"}</h1>
      <p className="auth-note">
        {signup
          ? "Join to review the places you love and help others find the best of Wiltshire."
          : "Welcome back. Sign in to write reviews and manage your profile."}
      </p>

      {notice && <p className="auth-error">{notice}</p>}

      {signup && (
        <div className="field">
          <label htmlFor="auth-name">Display name</label>
          <input
            id="auth-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={DISPLAY_NAME_MAX}
            required
            autoComplete="nickname"
          />
          <div className="hint">Shown publicly next to your reviews. You can&apos;t change it later.</div>
        </div>
      )}

      <div className="field">
        <label htmlFor="auth-email">Email</label>
        <input
          id="auth-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        {signup && <div className="hint">Never shown publicly. We use it to confirm your account.</div>}
      </div>

      <div className="field">
        <label htmlFor="auth-password">Password</label>
        <input
          id="auth-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={signup ? 8 : undefined}
          autoComplete={signup ? "new-password" : "current-password"}
        />
        {signup && <div className="hint">At least 8 characters.</div>}
      </div>

      {signup && (
        <label className="auth-check">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} required />
          <span>
            I agree to the <Link href="/terms">terms</Link> and have read the <Link href="/privacy">privacy notice</Link>.
          </span>
        </label>
      )}

      {error && <p className="auth-error">{error}</p>}

      <button className="btn btn-primary auth-submit" type="submit" disabled={submitting || (signup && !agreed)}>
        {submitting ? (signup ? "Creating accountâ€¦" : "Signing inâ€¦") : signup ? "Create account" : "Sign in"}
      </button>

      <p className="auth-switch">
        {signup ? "Already a member?" : "New here?"} <Link href={otherHref}>{signup ? "Sign in" : "Create an account"}</Link>
      </p>
    </form>
  );
}
