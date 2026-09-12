import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingForm from "@/components/ListingForm";

export const metadata: Metadata = {
  title: "List your business — Discover Wiltshire",
};

export default function ListYourBusinessPage() {
  return (
    <>
      <Header />
      <main className="wrap" style={{ maxWidth: 600 }}>
        <ListingForm />
      </main>
      <Footer />
    </>
  );
}
