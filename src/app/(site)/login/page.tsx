import type { Metadata } from "next";
import AuthForm from "@/components/members/AuthForm";
import { safeNextPath } from "@/lib/members";
import "@/components/members/members.css";

export const metadata: Metadata = {
  title: "Sign in — Discover Wiltshire",
  robots: { index: false, follow: true },
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = safeNextPath(typeof params.next === "string" ? params.next : null);
  const notice =
    params.error === "link" ? "That email link has expired or was already used. Sign in, or create your account again." : undefined;

  return (
    <div className="wrap" style={{ maxWidth: 420 }}>
      <AuthForm mode="login" next={next} notice={notice} />
    </div>
  );
}
