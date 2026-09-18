import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CalendarDays } from "@/components/ui/icons";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { dateTimeLabel, sessionTypeLabel } from "@/lib/booking";

type Booking = Tables<"bookings">;

export function MyBookings({ userId }: { userId: string }) {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    supabase.from("bookings").select("*").eq("user_id", userId).order("scheduled_for", { ascending: false })
      .then(({ data }) => setBookings(data ?? []));
  }, [userId]);

  async function cancel(id: string) {
    const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
    error ? toast.error(error.message) : (setBookings((list) => list.map((b) => b.id === id ? { ...b, status: "cancelled" } : b)), toast.success("Session cancelled"));
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-3xl">Coaching sessions</h2>
        <Button asChild variant="outline"><Link to="/book-a-session">Book a session</Link></Button>
      </div>
      <div className="mt-6 space-y-4">
        {bookings.map((b) => (
          <article key={b.id} className="flex flex-wrap items-start justify-between gap-4 border border-border bg-card p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">{sessionTypeLabel(b.session_type)} · {b.duration_minutes} min</p>
              <h3 className="mt-3 font-display text-2xl">{dateTimeLabel(b.scheduled_for)}</h3>
              <p className="mt-2 text-sm capitalize text-muted-foreground">Status: {b.status}</p>
            </div>
            {b.status !== "cancelled" && b.status !== "completed" && <Button variant="ghost" size="sm" onClick={() => cancel(b.id)}>Cancel</Button>}
          </article>
        ))}
        {!bookings.length && <p className="text-sm leading-7 text-muted-foreground">No sessions booked yet. A private conversation with Jackie can sit alongside your course work.</p>}
      </div>
    </div>
  );
}
