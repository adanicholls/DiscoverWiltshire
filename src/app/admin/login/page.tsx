import { Suspense } from "react";
import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin sign in — Discover Wiltshire",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="wrap" style={{ paddingTop: 60 }}>
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
