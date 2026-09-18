import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Award, BookOpen, CalendarDays, CircleDollarSign, Clock3, GraduationCap, ReceiptText, Send, TrendingUp, Users } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { dateTimeLabel } from "@/lib/booking";
import { fmt } from "@/lib/site-data";
import type { useAdminData } from "./data";
import type { AdminView } from "./admin-shell";
import { toast } from "sonner";

type BookingRow = { id: string; scheduled_for: string; full_name: string; session_type: string; status: string };

export function OverviewPanel({ admin, onNavigate }: { admin: ReturnType<typeof useAdminData>; onNavigate: (view: AdminView) => void }) {
  const { data, names, courseTitles, percent } = admin;
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [broadcast, setBroadcast] = useState({ title: "", body: "" });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    supabase.from("bookings").select("id,scheduled_for,full_name,session_type,status").order("scheduled_for", { ascending: true }).then(({ data: rows }) => setBookings(rows ?? []));
  }, []);

  const metrics = useMemo(() => {
    const successful = data.payments.filter((payment) => payment.status === "successful");
    const now = new Date();
    const monthlyRevenue = successful.filter((payment) => {
      const created = new Date(payment.created_at);
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).reduce((total, payment) => total + payment.amount, 0);
    const active = data.enrollments.filter((enrollment) => enrollment.status === "active" && new Date(enrollment.expires_at) > now);
    const completed = data.enrollments.filter((enrollment) => percent(enrollment.user_id, enrollment.course_id) === 100);
    return {
      students: data.profiles.length,
      activeStudents: new Set(active.map((item) => item.user_id)).size,
      courses: data.courses.length,
      enrollments: data.enrollments.length,
      completed: completed.length,
      revenue: successful.reduce((total, payment) => total + payment.amount, 0),
      monthlyRevenue,
      pending: data.payments.filter((payment) => payment.status === "pending").length,
      upcoming: bookings.filter((booking) => new Date(booking.scheduled_for) > now && !["cancelled", "completed"].includes(booking.status)).length,
    };
  }, [bookings, data, percent]);

  const topCourses = data.courses.map((course) => {
    const enrollments = data.enrollments.filter((item) => item.course_id === course.id);
    const average = enrollments.length ? Math.round(enrollments.reduce((sum, item) => sum + percent(item.user_id, course.id), 0) / enrollments.length) : 0;
    return { ...course, enrollmentCount: enrollments.length, average };
  }).sort((a, b) => b.enrollmentCount - a.enrollmentCount).slice(0, 4);

  async function sendBroadcast() {
    if (!broadcast.title.trim()) { toast.error("Add a notification title"); return; }
    setSending(true);
    const rows = data.profiles.map((profile) => ({ user_id: profile.id, kind: "message", title: broadcast.title.trim(), body: broadcast.body.trim() || null, link: "/dashboard" }));
    const { error } = await supabase.from("notifications").insert(rows);
    setSending(false);
    if (error) { toast.error(error.message); return; }
    setBroadcast({ title: "", body: "" });
    toast.success(`Notification sent to ${rows.length} students`);
  }

  const cards = [
    ["Total students", String(metrics.students), Users], ["Active students", String(metrics.activeStudents), Users],
    ["Courses", String(metrics.courses), BookOpen], ["Enrollments", String(metrics.enrollments), GraduationCap],
    ["Completed courses", String(metrics.completed), Award], ["Total revenue", fmt(metrics.revenue), CircleDollarSign],
    ["Revenue this month", fmt(metrics.monthlyRevenue), TrendingUp], ["Pending payments", String(metrics.pending), ReceiptText],
    ["Upcoming bookings", String(metrics.upcoming), CalendarDays],
  ] as const;

  return <div className="space-y-7">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p className="text-xs font-semibold uppercase text-primary">Today at a glance</p><h2 className="mt-2 font-display text-3xl md:text-4xl">Welcome back, Jackie.</h2><p className="mt-2 text-sm text-muted-foreground">Monitor learning, support students, and keep the studio moving.</p></div>
      <div className="flex gap-2"><Button onClick={() => onNavigate("courses")}><BookOpen />New course</Button><Button variant="outline" onClick={() => onNavigate("sessions")}><CalendarDays />Sessions</Button></div>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
      {cards.map(([label, value, Icon]) => <article key={label} className="rounded-sm border border-border bg-card p-5 "><div className="flex items-center justify-between"><Icon className="size-4 text-primary" /><span className="text-[10px] uppercase text-muted-foreground">Live</span></div><p className="mt-5 text-xs font-medium text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></article>)}
    </div>
    <div className="grid gap-6 xl:grid-cols-[1.45fr_.8fr]">
      <section className="overflow-hidden rounded-sm border border-border bg-card ">
        <PanelHead title="Recent enrollments" action="View all" onClick={() => onNavigate("enrollments")} />
        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-muted/70 text-[10px] uppercase text-muted-foreground"><tr><th className="px-5 py-3">Student</th><th className="px-5 py-3">Course</th><th className="px-5 py-3">Progress</th><th className="px-5 py-3">Access</th></tr></thead><tbody className="divide-y divide-border">{data.enrollments.slice(0, 6).map((enrollment) => <tr key={enrollment.id} className="hover:bg-muted/30"><td className="px-5 py-4 font-medium">{names[enrollment.user_id] ?? "Student"}</td><td className="px-5 py-4 text-muted-foreground">{courseTitles[enrollment.course_id] ?? "Course"}</td><td className="px-5 py-4"><div className="flex items-center gap-2"><span className="w-9 text-xs">{percent(enrollment.user_id, enrollment.course_id)}%</span><div className="h-1.5 w-20 bg-muted"><div className="h-full bg-primary" style={{ width: `${percent(enrollment.user_id, enrollment.course_id)}%` }} /></div></div></td><td className="px-5 py-4"><Status value={enrollment.status} /></td></tr>)}</tbody></table></div>
        {!data.enrollments.length && <Empty text="No enrollments yet." />}
      </section>
      <section className="rounded-sm border border-border bg-card p-5 ">
        <h3 className="font-display text-xl">Top courses</h3><p className="mt-1 text-xs text-muted-foreground">Ranked by enrollment</p>
        <div className="mt-5 space-y-5">{topCourses.map((course, index) => <div key={course.id} className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-sm bg-secondary/50 text-xs font-semibold">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{course.title}</p><p className="text-xs text-muted-foreground">{course.enrollmentCount} enrollments · {course.average}% avg. progress</p></div></div>)}{!topCourses.length && <p className="text-sm text-muted-foreground">No course activity yet.</p>}</div>
      </section>
    </div>
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="rounded-sm border border-border bg-card "><PanelHead title="Upcoming sessions" action="Open calendar" onClick={() => onNavigate("calendar")} /><div className="divide-y divide-border">{bookings.filter((booking) => new Date(booking.scheduled_for) > new Date() && booking.status !== "cancelled").slice(0, 5).map((booking) => <div key={booking.id} className="flex items-center gap-4 px-5 py-4"><span className="grid size-9 place-items-center rounded-sm bg-accent/25"><Clock3 className="size-4 text-primary" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{booking.full_name}</p><p className="text-xs text-muted-foreground">{dateTimeLabel(booking.scheduled_for)}</p></div><Status value={booking.status} /></div>)}</div>{!bookings.length && <Empty text="No sessions are scheduled." />}</section>
      <section className="rounded-sm border border-border bg-card p-5 "><h3 className="font-display text-xl">Message all students</h3><p className="mt-1 text-xs text-muted-foreground">Send an update to every student notification panel.</p><div className="mt-5 space-y-3"><Input placeholder="Notification title" value={broadcast.title} onChange={(event) => setBroadcast({ ...broadcast, title: event.target.value })} /><Textarea rows={3} placeholder="Write a short, warm message" value={broadcast.body} onChange={(event) => setBroadcast({ ...broadcast, body: event.target.value })} /><Button onClick={sendBroadcast} disabled={sending}><Send />{sending ? "Sending…" : "Send notification"}</Button></div></section>
    </div>
  </div>;
}

function PanelHead({ title, action, onClick }: { title: string; action: string; onClick: () => void }) { return <div className="flex items-center justify-between border-b border-border px-5 py-4"><h3 className="font-display text-xl">{title}</h3><Button variant="ghost" size="sm" onClick={onClick}>{action}<ArrowRight /></Button></div>; }
export function Status({ value }: { value: string }) { const good = ["active", "successful", "confirmed", "completed", "published", "valid", "approved"].includes(value); const bad = ["failed", "revoked", "cancelled", "rejected", "expired"].includes(value); return <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${good ? "bg-success/15 text-success" : bad ? "bg-destructive/10 text-destructive" : "bg-warning/20 text-warning-foreground"}`}>{value.replaceAll("_", " ")}</span>; }
export function Empty({ text }: { text: string }) { return <div className="px-5 py-8 text-center text-sm text-muted-foreground">{text}</div>; }