import type { Metadata } from "next";
import { Store } from "@/lib/store";
import AddCategoryForm from "@/components/admin/AddCategoryForm";
import CategoryRow from "@/components/admin/CategoryRow";

export const metadata: Metadata = {
  title: "Categories — Discover Wiltshire admin",
  robots: { index: false, follow: false },
};

export default async function AdminCategoriesPage() {
  const tradeCategories = await Store.getTradeCategories();

  return (
    <>
      <h1 className="page-title">categories</h1>
      <p className="page-subtitle">
        Trades &amp; services categories — add a new one (e.g. &ldquo;Motoring&rdquo;, &ldquo;Solar&rdquo;) and it
        shows up immediately in the nav, the trades hub, and the &ldquo;list your business&rdquo; picker. Eat &amp;
        drink, Stay, Things to do, and Shops aren&apos;t managed here — each has its own hand-built page.
      </p>

      <AddCategoryForm />

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {tradeCategories.length === 0 ? (
          <div className="card" style={{ textAlign: "center", opacity: 0.6 }}>
            No trade categories yet — add the first one above.
          </div>
        ) : (
          tradeCategories.map((cat) => <CategoryRow key={cat.id} id={cat.id} label={cat.label} />)
        )}
      </div>
    </>
  );
}
