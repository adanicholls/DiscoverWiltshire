import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EventForm from "@/components/EventForm";

export const metadata: Metadata = {
  title: "Add your event — Discover Wiltshire",
};

export default function AddEventPage() {
  return (
    <>
      <Header />
      <main className="wrap" style={{ maxWidth: 600 }}>
        <EventForm />
      </main>
      <Footer />
    </>
  );
}
