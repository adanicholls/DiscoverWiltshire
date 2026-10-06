import type { Metadata } from "next";
import AuthForm from "@/components/members/AuthForm";
import { safeNextPath } from "@/lib/members";
import "@/components/members/members.css";

export const metadata: Metadata = {
  title: "Create your account — Discover Wiltshire",
  robots: { index: false, follow: true },
};

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const params = await searchParams;
  const next = safeNextPath(typeof params.next === "string" ? params.next : null);

  return (
    <div className="wrap" style={{ maxWidth: 420 }}>
      <AuthForm mode="signup" next={next} />
    </div>
  );
}
