import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Award, CalendarDays, CreditCard, Download, GraduationCap, Mail, Phone, RotateCcw, ShieldX, Sparkles, User } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import type { useAdminData } from "./data";
import { CertificateArtwork } from "@/components/certificate/certificate-artwork";
import { downloadCertificatePdf } from "@/lib/certificate-pdf";

const money = (kes: number) => `KES ${kes.toLocaleString()}`;
const date = (value: string) => new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
const dateTime = (value: string) => new Date(value).toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function StudentProfileSheet({ admin, studentId, trigger }: { admin: ReturnType<typeof useAdminData>; studentId: string; trigger: React.ReactNode }) {
  const { data, names, courseTitles, percent, completedCount, totalLessons, reload } = admin;
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState({ title: "", body: "" });
  const [sending, setSending] = useState(false);

  const profile = data.profiles.find((p) => p.id === studentId);

  const detail = useMemo(() => {
    const enrollments = data.enrollments.filter((e) => e.user_id === studentId);
    const payments = data.payments.filter((p) => p.user_id === studentId);
    const certificates = data.certificates.filter((c) => c.user_id === studentId);
    const bookings = data.bookings.filter((b) => b.user_id === studentId);
    const badges = data.studentBadges.filter((b) => b.user_id === studentId);
    const lessonTitles = new Map(data.lessons.map((l) => [l.id, l.title]));
    const activity = data.progress
      .filter((p) => p.user_id === studentId && p.is_completed)
      .sort((a, b) => (b.completed_at ?? b.updated_at).localeCompare(a.completed_at ?? a.updated_at))
      .slice(0, 12)
      .map((p) => ({ id: p.id, title: lessonTitles.get(p.lesson_id) ?? "Lesson", at: p.completed_at ?? p.updated_at }));
    const spent = payments.filter((p) => p.status === "successful").reduce((sum, p) => sum + p.amount, 0);
    const lessonsDone = data.progress.filter((p) => p.user_id === studentId && p.is_completed).length;
    return { enrollments, payments, certificates, bookings, badges, activity, spent, lessonsDone };
  }, [data, studentId]);

  async function sendNote() {
    if (!note.title.trim()) { toast.error("Add a short title first"); return; }
    setSending(true);
    const { error } = await supabase.from("notifications").insert({
      user_id: studentId, kind: "admin", title: note.title.trim(), body: note.body.trim() || null, link: "/dashboard",
    });
    setSending(false);
    if (error) { toast.error(error.message); return; }
    setNote({ title: "", body: "" });
    toast.success("Message sent to this student");
  }

  async function extend(id: string, expiresAt: string) {
    const base = new Date(expiresAt) > new Date() ? new Date(expiresAt) : new Date();
    base.setDate(base.getDate() + 42);
    const { error } = await supabase.from("enrollments").update({ expires_at: base.toISOString(), status: "active" }).eq("id", id);
    error ? toast.error(error.message) : (toast.success("Access extended by 42 days"), reload());
  }

  async function setStatus(id: string, status: "active" | "revoked") {
    const { error } = await supabase.from("enrollments").update({ status }).eq("id", id);
    error ? toast.error(error.message) : (toast.success(status === "active" ? "Access restored" : "Access revoked"), reload());
  }

  async function setCertificateStatus(id: string, revoked: boolean) {
    const { error } = await supabase.from("certificates").update({ status: revoked ? "revoked" : "valid", revoked_at: revoked ? new Date().toISOString() : null }).eq("id", id);
    error ? toast.error(error.message) : (toast.success(revoked ? "Certificate revoked" : "Certificate restored"), reload());
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="font-display text-3xl">{names[studentId] ?? "Student"}</SheetTitle>
          <SheetDescription>Everything on record for this student.</SheetDescription>
        </SheetHeader>

        <div className="space-y-8 px-4 pb-10">
          <Section icon={<User className="size-4" />} title="Account">
            <dl className="grid gap-3 sm:grid-cols-2">
              <Row label="Name" value={profile?.display_name || "Student"} />
              <Row label="Phone" value={profile?.phone || "Not provided"} icon={<Phone className="size-3.5" />} />
              <Row label="Joined" value={profile ? date(profile.created_at) : "Not available"} />
              <Row label="Email updates" value={profile?.email_notifications ? "On" : "Off"} icon={<Mail className="size-3.5" />} />
              <Row label="Learning reminders" value={profile?.learning_reminders ? "On" : "Off"} />
              <Row label="Student ID" value={studentId.slice(0, 8)} />
            </dl>
          </Section>

          <div className="grid gap-4 sm:grid-cols-3">
            <Metric label="Courses" value={String(detail.enrollments.length)} />
            <Metric label="Lessons completed" value={String(detail.lessonsDone)} />
            <Metric label="Total paid" value={money(detail.spent)} />
          </div>

          <Section icon={<GraduationCap className="size-4" />} title="Learning and access">
            {detail.enrollments.length ? detail.enrollments.map((e) => (
              <div key={e.id} className="border border-border bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">{courseTitles[e.course_id] ?? "Course"}</p>
                  <span className="text-xs text-muted-foreground">{e.status === "revoked" ? "Revoked" : `Access until ${date(e.expires_at)}`}</span>
                </div>
                <div className="mt-3 flex items-center gap-4">
                  <Progress value={percent(studentId, e.course_id)} />
                  <span className="w-36 shrink-0 text-right text-xs text-muted-foreground">{completedCount(studentId, e.course_id)}/{totalLessons(e.course_id)} · {percent(studentId, e.course_id)}%</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => extend(e.id, e.expires_at)}>Extend 42 days</Button>
                  {e.status === "revoked"
                    ? <Button size="sm" variant="ghost" onClick={() => setStatus(e.id, "active")}>Restore access</Button>
                    : <Button size="sm" variant="ghost" onClick={() => setStatus(e.id, "revoked")}>Revoke access</Button>}
                </div>
              </div>
            )) : <Empty>No course enrolments yet.</Empty>}
          </Section>

          <Section icon={<CreditCard className="size-4" />} title="Purchases">
            {detail.payments.length ? detail.payments.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 border border-border bg-card p-4 text-sm">
                <span>{p.course_id ? courseTitles[p.course_id] ?? "Course" : "General payment"}</span>
                <span className="text-xs text-muted-foreground">{money(p.amount)} · {p.provider} · {p.status} · {date(p.created_at)}</span>
              </div>
            )) : <Empty>No payments recorded.</Empty>}
          </Section>

          <Section icon={<CalendarDays className="size-4" />} title="Coaching sessions">
            {detail.bookings.length ? detail.bookings.map((b) => (
              <div key={b.id} className="flex flex-wrap items-center justify-between gap-2 border border-border bg-card p-4 text-sm">
                <span>{b.session_type.replace(/_/g, " ")}</span>
                <span className="text-xs text-muted-foreground">{dateTime(b.scheduled_for)} · {b.duration_minutes} min · {b.status}</span>
              </div>
            )) : <Empty>No sessions booked.</Empty>}
          </Section>

          <Section icon={<Award className="size-4" />} title="Certificates and badges">
            {detail.certificates.map((c) => (
              <div key={c.id} className="border border-border bg-card p-3 text-sm">
                <CertificateArtwork compact recipient={c.recipient_name_formatted} course={courseTitles[c.course_id] ?? "Course"} issuedAt={c.issued_at} code={c.certificate_number} templateId={c.template_id} status={c.status} />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div><span className="block font-display text-lg italic">{c.recipient_name_formatted}</span><span className="text-xs capitalize text-muted-foreground">{c.certificate_number} · {date(c.issued_at)} · {c.status}</span></div>
                  <div className="flex gap-2"><Button size="sm" variant="outline" disabled={c.status === "revoked"} onClick={() => downloadCertificatePdf({ recipient: c.recipient_name_formatted, course: courseTitles[c.course_id] ?? "Course", issuedAt: c.issued_at, code: c.certificate_number, templateId: c.template_id })}><Download />PDF</Button><Button size="sm" variant="outline" onClick={() => setCertificateStatus(c.id, c.status !== "revoked")}>{c.status === "revoked" ? <RotateCcw /> : <ShieldX />}</Button></div>
                </div>
              </div>
            ))}
            {detail.badges.map((b) => (
              <div key={b.id} className="flex items-center gap-2 border border-border bg-card p-4 text-sm">
                <Sparkles className="size-4 text-primary" />
                {data.badges.find((x) => x.id === b.badge_id)?.name ?? "Badge"}
                <span className="ml-auto text-xs text-muted-foreground">{date(b.awarded_at)}</span>
              </div>
            ))}
            {!detail.certificates.length && !detail.badges.length && <Empty>Nothing awarded yet.</Empty>}
          </Section>

          <Section icon={<GraduationCap className="size-4" />} title="Recent activity">
            {detail.activity.length ? detail.activity.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-border py-2 text-sm">
                <span>Completed {a.title}</span>
                <span className="text-xs text-muted-foreground">{dateTime(a.at)}</span>
              </div>
            )) : <Empty>No lesson activity yet.</Empty>}
          </Section>

          <Section icon={<Mail className="size-4" />} title="Send a message">
            <Input placeholder="Message title" value={note.title} onChange={(e) => setNote({ ...note, title: e.target.value })} />
            <Input placeholder="Short note (optional)" value={note.body} onChange={(e) => setNote({ ...note, body: e.target.value })} />
            <Button size="sm" disabled={sending} onClick={sendNote}>{sending ? "Sending…" : "Send to student"}</Button>
          </Section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h4 className="flex items-center gap-2 font-display text-xl">{icon}{title}</h4>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function Row({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 flex items-center gap-2 text-sm">{icon}{value}</dd>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl">{value}</p>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}
