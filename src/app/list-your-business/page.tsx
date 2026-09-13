import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingForm from "@/components/ListingForm";
import { Store } from "@/lib/store";

export const metadata: Metadata = {
  title: "List your business — Discover Wiltshire",
};

export default async function ListYourBusinessPage() {
  const tradeCategories = await Store.getTradeCategories();

  return (
    <>
      <Header />
      <main className="wrap" style={{ maxWidth: 600 }}>
        <ListingForm tradeCategories={tradeCategories} />
      </main>
      <Footer />
    </>
  );
}
