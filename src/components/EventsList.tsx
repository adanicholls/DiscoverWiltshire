import { Store } from "@/lib/store";

export default async function EventsList() {
  const events = await Store.getEvents();

  if (events.length === 0) {
    return <p style={{ fontSize: 13, opacity: 0.6 }}>Nothing on the calendar right now.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {events.map((ev) => (
        <div className="card" key={ev.name} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <span>{ev.name}</span>
          <span style={{ opacity: 0.6 }}>{ev.when}</span>
        </div>
      ))}
    </div>
  );
}
