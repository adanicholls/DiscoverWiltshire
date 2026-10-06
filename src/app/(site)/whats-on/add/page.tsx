import type { Metadata } from "next";
import EventForm from "@/components/EventForm";

export const metadata: Metadata = {
  title: "Add your event — Discover Wiltshire",
};

export default function AddEventPage() {
  return (
    <>
      <div className="wrap" style={{ maxWidth: 600 }}>
        <EventForm />
      </div>
    </>
  );
}
