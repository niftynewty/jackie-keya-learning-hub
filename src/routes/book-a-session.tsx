import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Check, Clock3, Loader2 } from "@/components/ui/icons";
import { toast } from "sonner";
import { PageIntro } from "@/components/site/page";
import { meta } from "@/components/site/page-meta";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  dateTimeLabel,
  endOfDay,
  sessionTypes,
  slotsForDay,
  startOfDay,
  timeLabel,
} from "@/lib/booking";

export const Route = createFileRoute("/book-a-session")({
  head: () =>
    meta(
      "Book a session with Jackie",
      "Choose a day and time for a private coaching session on healing, fresh starts, or blended family life.",
    ),
  component: BookingPage,
});

function BookingPage() {
  const [type, setType] = useState<string>(sessionTypes[0].value);
  const [day, setDay] = useState<Date | undefined>(undefined);
  const [slot, setSlot] = useState<Date | null>(null);
  const [taken, setTaken] = useState<string[]>([]);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [confirmed, setConfirmed] = useState<Date | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name,phone")
        .eq("id", data.user.id)
        .maybeSingle();
      setForm((f) => ({
        ...f,
        email: data.user!.email ?? f.email,
        full_name: profile?.display_name ?? f.full_name,
        phone: profile?.phone ?? f.phone,
      }));
    });
  }, []);

  useEffect(() => {
    setSlot(null);
    if (!day) return;
    supabase
      .rpc("taken_slots", {
        _from: startOfDay(day).toISOString(),
        _to: endOfDay(day).toISOString(),
      })
      .then(({ data }) =>
        setTaken(((data ?? []) as string[]).map((value) => new Date(value).getTime().toString())),
      );
  }, [day]);

  const slots = useMemo(
    () => (day ? slotsForDay(day).filter((s) => s.getTime() > Date.now()) : []),
    [day],
  );
  const selectedType = sessionTypes.find((t) => t.value === type)!;

  async function submit() {
    if (!slot) {
      toast.error("Choose a day and time first");
      return;
    }
    if (!form.full_name.trim() || !form.email.trim()) {
      toast.error("Please add your name and email");
      return;
    }
    setSaving(true);
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase.from("bookings").insert({
      user_id: auth.user?.id ?? null,
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      notes: form.notes.trim() || null,
      session_type: type,
      duration_minutes: selectedType.minutes,
      scheduled_for: slot.toISOString(),
    });
    setSaving(false);
    if (error) {
      toast.error(
        error.message.includes("duplicate")
          ? "That time was just taken. Please choose another."
          : error.message,
      );
      if (day) setTaken((t) => [...t, slot.getTime().toString()]);
      return;
    }
    setConfirmed(slot);
  }

  if (confirmed)
    return (
      <>
        <PageIntro
          eyebrow="Session requested"
          title="Your time is held."
          copy="Jackie reviews every request personally and will confirm your session by email."
        />
        <section className="mx-auto max-w-2xl px-5 py-16 text-center">
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">
            Request received
          </p>
          <h2 className="mt-4 font-display text-4xl">{dateTimeLabel(confirmed)}</h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            {selectedType.label} · {selectedType.minutes} minutes. Payment is arranged directly with
            Jackie once your session is confirmed.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/dashboard">Go to my learning</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/courses">Explore courses</Link>
            </Button>
          </div>
        </section>
      </>
    );

  return (
    <>
      <PageIntro
        eyebrow="Individual support"
        title="Book a session with Jackie."
        copy="Choose the kind of conversation you need, pick a time that suits you, and Jackie will confirm by email."
      />
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <h2 className="font-display text-3xl">1. What kind of session?</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {sessionTypes.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setType(option.value)}
                  className={`border p-5 text-left transition-colors ${type === option.value ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"}`}
                >
                  <p className="font-display text-xl">{option.label}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{option.copy}</p>
                  <p className="mt-4 text-xs text-primary">{option.minutes} minutes</p>
                </button>
              ))}
            </div>

            <h2 className="mt-12 font-display text-3xl">2. Choose a day and time</h2>
            <div className="mt-6 grid gap-8 sm:grid-cols-[auto_1fr]">
              <div className="border border-border bg-card p-2">
                <Calendar
                  mode="single"
                  selected={day}
                  onSelect={setDay}
                  disabled={(date) =>
                    date < startOfDay(new Date()) || slotsForDay(date).length === 0
                  }
                />
              </div>
              <div>
                {!day && (
                  <p className="text-sm text-muted-foreground">
                    Sessions run Monday to Friday. Select a date to see open times.
                  </p>
                )}
                {day && slots.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No remaining times on this day. Please choose another date.
                  </p>
                )}
                {day && slots.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {slots.map((s) => {
                      const isTaken = taken.includes(s.getTime().toString());
                      return (
                        <button
                          key={s.toISOString()}
                          type="button"
                          disabled={isTaken}
                          onClick={() => setSlot(s)}
                          className={`border py-3 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${slot?.getTime() === s.getTime() ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary"}`}
                        >
                          {timeLabel(s)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border border-border bg-card p-7">
            <h2 className="font-display text-3xl">3. Your details</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {slot ? dateTimeLabel(slot) : "No time selected yet."}
            </p>
            <div className="mt-6 space-y-5">
              <div>
                <Label>Full name</Label>
                <Input
                  className="mt-2"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  className="mt-2"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Phone (optional)</Label>
                <Input
                  className="mt-2"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <Label>What would you like to focus on?</Label>
                <Textarea
                  className="mt-2"
                  rows={4}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <Button className="w-full" onClick={submit} disabled={saving || !slot}>
                {saving ? "Sending request" : "Request this session"}
              </Button>
              <p className="text-xs leading-6 text-muted-foreground">
                Requests are reviewed personally. Session fees are arranged directly with Jackie
                after confirmation.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
