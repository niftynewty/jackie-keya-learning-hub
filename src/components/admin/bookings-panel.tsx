import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { dateTimeLabel, sessionTypeLabel } from "@/lib/booking";
import { Stat } from "./orders-panel";

type Booking = Tables<"bookings">;

export function BookingsPanel() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    supabase
      .from("bookings")
      .select("*")
      .order("scheduled_for", { ascending: true })
      .then(({ data }) => setBookings(data ?? []));
  }, []);

  async function setStatus(booking: Booking, status: Booking["status"]) {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", booking.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setBookings((list) => list.map((b) => (b.id === booking.id ? { ...b, status } : b)));
    toast.success(`Session ${status}`);
  }

  const upcoming = bookings.filter(
    (b) => new Date(b.scheduled_for) > new Date() && b.status !== "cancelled",
  );

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Upcoming sessions" value={String(upcoming.length)} />
        <Stat
          label="Awaiting your reply"
          value={String(bookings.filter((b) => b.status === "pending").length)}
        />
        <Stat
          label="Completed"
          value={String(bookings.filter((b) => b.status === "completed").length)}
        />
      </div>
      <div className="mt-6 space-y-4">
        {bookings.map((b) => (
          <article key={b.id} className="border border-border bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">
                  {sessionTypeLabel(b.session_type)} · {b.duration_minutes} min
                </p>
                <h3 className="mt-3 font-display text-2xl">{dateTimeLabel(b.scheduled_for)}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {b.full_name} · {b.email}
                  {b.phone ? ` · ${b.phone}` : ""}
                </p>
                {b.notes && <p className="mt-4 max-w-2xl text-sm leading-7">{b.notes}</p>}
              </div>
              <select
                className="h-9 border border-input bg-background px-2 text-sm capitalize"
                value={b.status}
                onChange={(e) => setStatus(b, e.target.value as Booking["status"])}
              >
                <option value="pending">pending</option>
                <option value="confirmed">confirmed</option>
                <option value="completed">completed</option>
                <option value="cancelled">cancelled</option>
              </select>
            </div>
          </article>
        ))}
        {!bookings.length && (
          <p className="text-sm text-muted-foreground">No session requests yet.</p>
        )}
      </div>
    </div>
  );
}
