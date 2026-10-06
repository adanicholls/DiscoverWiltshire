import type { Metadata } from "next";
import ListingForm from "@/components/ListingForm";
import { Store } from "@/lib/store";

export const metadata: Metadata = {
  title: "List your business — Discover Wiltshire",
};

export default async function ListYourBusinessPage() {
  const tradeCategories = await Store.getTradeCategories();

  return (
    <>
      <div className="wrap" style={{ maxWidth: 600 }}>
        <ListingForm tradeCategories={tradeCategories} />
      </div>
    </>
  );
}
