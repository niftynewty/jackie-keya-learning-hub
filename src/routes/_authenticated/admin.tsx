import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, BookOpen, CalendarDays, Loader2, ReceiptText, Send, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { meta } from "@/components/site/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAdminData } from "@/components/admin/data";
import { CoursesPanel } from "@/components/admin/courses-panel";
import { StudentsPanel } from "@/components/admin/students-panel";
import { OrdersPanel, Stat } from "@/components/admin/orders-panel";
import { CertificatesPanel } from "@/components/admin/certificates-panel";
import { BookingsPanel } from "@/components/admin/bookings-panel";
import { fmt } from "@/lib/site-data";
import { dateTimeLabel } from "@/lib/booking";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => meta("Admin", "Manage courses, students, orders, certificates, and coaching sessions."),
  component: AdminRoute,
});

function AdminRoute() {
  const { user } = Route.useRouteContext();
  const [state, setState] = useState<"checking" | "allowed" | "denied">("checking");
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => setState(data ? "allowed" : "denied"));
  }, [user.id]);

  async function claim() {
    setClaiming(true);
    const { data, error } = await supabase.rpc("claim_first_admin");
    setClaiming(false);
    if (error) { toast.error(error.message); return; }
    if (data) { toast.success("You are now the hub administrator"); setState("allowed"); }
    else toast.error("An administrator already exists for this hub");
  }

  if (state === "checking") return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="size-6 animate-spin text-primary" /></div>;

  if (state === "denied") return (
    <section className="mx-auto max-w-xl px-5 py-24 text-center">
      <ShieldCheck className="mx-auto size-10 text-primary" />
      <h1 className="mt-6 font-display text-4xl">Admin access required</h1>
      <p className="mt-4 leading-7 text-muted-foreground">This area is reserved for Jackie. If this hub does not have an administrator yet, you can claim that role once.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={claim} disabled={claiming}>{claiming && <Loader2 className="animate-spin" />}Claim admin access</Button>
        <Button asChild variant="outline"><Link to="/dashboard">Back to my learning</Link></Button>
      </div>
    </section>
  );

  return <AdminWorkspace />;
}

function AdminWorkspace() {
  const admin = useAdminData();
  const { data, names, courseTitles, loading } = admin;
  const [broadcast, setBroadcast] = useState({ title: "", body: "" });
  const [sending, setSending] = useState(false);
  const [bookings, setBookings] = useState<{ id: string; scheduled_for: string; full_name: string; status: string }[]>([]);

  useEffect(() => {
    supabase.from("bookings").select("id,scheduled_for,full_name,status").gte("scheduled_for", new Date().toISOString())
      .neq("status", "cancelled").order("scheduled_for").limit(4).then(({ data: rows }) => setBookings(rows ?? []));
  }, []);

  async function send() {
    if (!broadcast.title.trim()) { toast.error("Add a title for the notification"); return; }
    setSending(true);
    const rows = data.profiles.map((p) => ({ user_id: p.id, kind: "message", title: broadcast.title.trim(), body: broadcast.body.trim() || null, link: "/dashboard" }));
    const { error } = await supabase.from("notifications").insert(rows);
    setSending(false);
    if (error) { toast.error(error.message); return; }
    setBroadcast({ title: "", body: "" });
    toast.success(`Sent to ${rows.length} student${rows.length === 1 ? "" : "s"}`);
  }

  const revenue = data.payments.filter((p) => p.status === "successful").reduce((sum, p) => sum + p.amount, 0);

  return (
    <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">Hub administration</p>
          <h1 className="mt-3 font-display text-5xl">Jackie's studio.</h1>
          <p className="mt-3 text-muted-foreground">Courses, students, orders, certificates, and sessions in one calm place.</p>
        </div>
        <Button asChild variant="outline"><Link to="/dashboard">My learning view</Link></Button>
      </div>

      <Tabs defaultValue="overview" className="mt-12">
        <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-none border-b border-border bg-transparent p-0">
          <Tab value="overview" icon={ShieldCheck}>Overview</Tab>
          <Tab value="courses" icon={BookOpen}>Courses</Tab>
          <Tab value="students" icon={Users}>Students</Tab>
          <Tab value="orders" icon={ReceiptText}>Orders</Tab>
          <Tab value="certificates" icon={Award}>Certificates</Tab>
          <Tab value="bookings" icon={CalendarDays}>Sessions</Tab>
        </TabsList>

        <TabsContent value="overview" className="mt-10">
          {loading ? <Loader2 className="size-5 animate-spin text-primary" /> : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <Stat label="Published courses" value={String(data.courses.filter((c) => c.is_published).length)} />
                <Stat label="Students" value={String(data.profiles.length)} />
                <Stat label="Collected" value={fmt(revenue)} />
                <Stat label="Certificates" value={String(data.certificates.length)} />
              </div>
              <div className="mt-10 grid gap-8 lg:grid-cols-2">
                <div className="border border-border bg-card p-6">
                  <h2 className="font-display text-2xl">Next sessions</h2>
                  <div className="mt-5 space-y-4">
                    {bookings.map((b) => (
                      <div key={b.id} className="flex items-baseline justify-between gap-4 border-b border-border pb-3 last:border-0">
                        <div><p className="text-sm font-medium">{b.full_name}</p><p className="text-xs text-muted-foreground">{dateTimeLabel(b.scheduled_for)}</p></div>
                        <span className="text-xs capitalize text-primary">{b.status}</span>
                      </div>
                    ))}
                    {!bookings.length && <p className="text-sm text-muted-foreground">No upcoming sessions.</p>}
                  </div>
                </div>
                <div className="border border-border bg-card p-6">
                  <h2 className="font-display text-2xl">Message all students</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Appears in each student's notifications panel.</p>
                  <div className="mt-5 space-y-4">
                    <Input placeholder="Title" value={broadcast.title} onChange={(e) => setBroadcast({ ...broadcast, title: e.target.value })} />
                    <Textarea rows={3} placeholder="A short, warm message" value={broadcast.body} onChange={(e) => setBroadcast({ ...broadcast, body: e.target.value })} />
                    <Button onClick={send} disabled={sending}>{sending ? <Loader2 className="animate-spin" /> : <Send />}Send notification</Button>
                  </div>
                </div>
              </div>
              <div className="mt-10 border border-border bg-card p-6">
                <h2 className="font-display text-2xl">Latest orders</h2>
                <div className="mt-5 space-y-3">
                  {data.payments.slice(0, 5).map((p) => (
                    <div key={p.id} className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-3 last:border-0 text-sm">
                      <span>{names[p.user_id] ?? "Student"} · {p.course_id ? courseTitles[p.course_id] ?? "—" : "—"}</span>
                      <span className="text-muted-foreground">{fmt(p.amount)} · <span className="capitalize">{p.status}</span></span>
                    </div>
                  ))}
                  {!data.payments.length && <p className="text-sm text-muted-foreground">No orders yet.</p>}
                </div>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="courses" className="mt-10"><CoursesPanel /></TabsContent>
        <TabsContent value="students" className="mt-10"><StudentsPanel admin={admin} /></TabsContent>
        <TabsContent value="orders" className="mt-10"><OrdersPanel names={names} courseTitles={courseTitles} /></TabsContent>
        <TabsContent value="certificates" className="mt-10"><CertificatesPanel admin={admin} /></TabsContent>
        <TabsContent value="bookings" className="mt-10"><BookingsPanel /></TabsContent>
      </Tabs>
    </section>
  );
}

function Tab({ value, icon: Icon, children }: { value: string; icon: typeof BookOpen; children: React.ReactNode }) {
  return <TabsTrigger value={value} className="rounded-none border-b-2 border-transparent px-5 py-4 shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"><Icon />{children}</TabsTrigger>;
}
