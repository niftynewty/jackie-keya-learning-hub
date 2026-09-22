import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Play,
  ReceiptText,
  Award,
  Settings,
  LogOut,
  Clock3,
  Bell,
  ShieldCheck,
  Flame,
  Timer,
  CalendarDays,
  UserRound,
} from "@/components/ui/icons";
import { meta } from "@/components/site/page";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { courses, fmt } from "@/lib/site-data";
import { toast } from "sonner";
import { NotificationsPanel } from "@/components/site/notifications-panel";
import { CertificateArtwork } from "@/components/certificate/certificate-artwork";
import { downloadCertificatePdf } from "@/lib/certificate-pdf";
import { MyBookings } from "@/components/site/my-bookings";
import { useProgress } from "@/lib/use-progress";
type Enrollment = {
  id: string;
  course_id: string;
  enrolled_at: string;
  expires_at: string;
  status: string;
};
type Certificate = {
  id: string;
  course_id: string;
  certificate_number: string;
  recipient_name_formatted: string;
  issued_at: string;
  pdf_url: string | null;
  template_id: string;
  status: string;
};
type Payment = {
  id: string;
  amount: number;
  provider: string;
  provider_transaction_id: string;
  status: string;
  created_at: string;
};
type Profile = {
  display_name: string;
  phone: string | null;
  email_notifications: boolean;
  learning_reminders: boolean;
};
export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () =>
    meta("My learning", "Continue courses, view progress, certificates, and account settings."),
  component: Dashboard,
});
function Dashboard() {
  const { user } = Route.useRouteContext();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]),
    [payments, setPayments] = useState<Payment[]>([]),
    [certificates, setCertificates] = useState<Certificate[]>([]),
    [profile, setProfile] = useState<Profile>({
      display_name: "",
      phone: null,
      email_notifications: true,
      learning_reminders: true,
    });
  const navigate = useNavigate();
  const progress = useProgress(user.id);
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    supabase
      .rpc("has_role", { _user_id: user.id, _role: "admin" })
      .then(({ data }) => setIsAdmin(Boolean(data)));
  }, [user.id]);
  useEffect(() => {
    Promise.all([
      supabase.from("enrollments").select("*").order("enrolled_at", { ascending: false }),
      supabase.from("payments").select("*").order("created_at", { ascending: false }),
      supabase.from("certificates").select("*").order("issued_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("display_name,phone,email_notifications,learning_reminders")
        .eq("id", user.id)
        .single(),
    ]).then(([e, p, c, r]) => {
      setEnrollments((e.data ?? []) as Enrollment[]);
      setPayments((p.data ?? []) as Payment[]);
      setCertificates((c.data ?? []) as Certificate[]);
      if (r.data) setProfile(r.data);
    });
  }, [user.id]);
  const enrolled = useMemo(
    () =>
      enrollments
        .map((e) => ({ e, c: courses.find((c) => c.id === e.course_id) }))
        .filter((x) => x.c),
    [enrollments],
  );
  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  async function save() {
    const { error } = await supabase.from("profiles").update(profile).eq("id", user.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Settings saved");
  }
  return (
    <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">
            Your learning space
          </p>
          <h1 className="mt-3 font-display text-5xl">
            Welcome, {profile.display_name || user.email?.split("@")[0]}.
          </h1>
          <p className="mt-3 text-muted-foreground">A small step today still moves you forward.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {isAdmin && (
            <Button asChild variant="secondary">
              <Link to="/admin">
                <ShieldCheck />
                Admin studio
              </Link>
            </Button>
          )}
          <Button asChild variant="secondary">
            <Link to="/profile">
              <UserRound />
              My profile
            </Link>
          </Button>
          <Button variant="outline" onClick={signOut}>
            <LogOut />
            Sign out
          </Button>
        </div>
      </div>
      <Tabs defaultValue="overview" className="mt-12">
        <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-none border-b border-border bg-transparent p-0">
          <Tab value="overview" icon={BookOpen}>
            Overview
          </Tab>
          <Tab value="sessions" icon={CalendarDays}>
            Sessions
          </Tab>
          <Tab value="notifications" icon={Bell}>
            Notifications
          </Tab>
          <Tab value="certificates" icon={Award}>
            Certificates
          </Tab>
          <Tab value="payments" icon={ReceiptText}>
            Payments
          </Tab>
          <Tab value="settings" icon={Settings}>
            Settings
          </Tab>
        </TabsList>
        <TabsContent value="overview" className="mt-10">
          {enrolled.length ? (
            <>
              <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <Metric
                  icon={BookOpen}
                  label="Courses in progress"
                  value={String(enrolled.length)}
                />
                <Metric
                  icon={Flame}
                  label="Lessons completed"
                  value={String(progress.completedLessons)}
                />
                <Metric
                  icon={Timer}
                  label="Minutes learned"
                  value={String(progress.minutesLearned)}
                />
              </div>
              <div className="bg-primary p-7 text-primary-foreground">
                <p className="text-xs font-semibold uppercase tracking-[.18em] opacity-70">
                  Continue learning
                </p>
                <div className="mt-5 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                  <div>
                    <h2 className="font-display text-4xl">{enrolled[0]?.c?.title}</h2>
                    <p className="mt-2 text-sm opacity-75">
                      Return to your latest course and keep your momentum.
                    </p>
                  </div>
                  <Button asChild variant="secondary">
                    <Link to="/learn/$slug" params={{ slug: enrolled[0]?.c?.slug ?? "" }}>
                      <Play />
                      Resume course
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="mt-10 grid gap-6 md:grid-cols-2">
                {enrolled.map(
                  ({ e, c }) =>
                    c && (
                      <article key={e.id} className="border border-border bg-card p-6">
                        <div className="flex justify-between gap-3">
                          <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">
                            {c.tone}
                          </p>
                          <span className="text-xs text-muted-foreground">Active</span>
                        </div>
                        <h3 className="mt-5 font-display text-3xl">{c.title}</h3>
                        <div className="mt-7">
                          <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                            <span>Course progress</span>
                            <span>{progress.percent(c.id)}%</span>
                          </div>
                          <Progress value={progress.percent(c.id)} />
                          <p className="mt-2 text-xs text-muted-foreground">
                            {progress.completed(c.id)} of {progress.total(c.id)} lessons complete
                          </p>
                        </div>
                        <p className="mt-5 flex gap-2 text-xs text-muted-foreground">
                          <Clock3 className="size-4" />
                          Access until {new Date(e.expires_at).toLocaleDateString()}
                        </p>
                        <Button asChild variant="outline" className="mt-6">
                          <Link to="/learn/$slug" params={{ slug: c.slug }}>
                            Open course
                          </Link>
                        </Button>
                      </article>
                    ),
                )}
              </div>
            </>
          ) : (
            <div className="border border-border bg-card p-10 text-center">
              <BookOpen className="mx-auto size-8 text-primary" />
              <h2 className="mt-5 font-display text-3xl">Your first course is waiting.</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted-foreground">
                Choose the support that feels right for this season. Your learning will appear here
                after checkout.
              </p>
              <Button asChild className="mt-6">
                <Link to="/courses">Explore courses</Link>
              </Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="sessions" className="mt-10">
          <MyBookings userId={user.id} />
        </TabsContent>
        <TabsContent value="notifications" className="mt-10">
          <NotificationsPanel userId={user.id} />
        </TabsContent>
        <TabsContent value="certificates" className="mt-10">
          {certificates.length ? (
            <div className="grid gap-6 md:grid-cols-2">
              {certificates.map((c) => {
                const title =
                  courses.find((course) => course.id === c.course_id)?.title ?? "Course";
                return (
                  <article key={c.id} className="border border-border bg-card p-4">
                    <CertificateArtwork
                      recipient={c.recipient_name_formatted}
                      course={title}
                      issuedAt={c.issued_at}
                      code={c.certificate_number}
                      templateId={c.template_id}
                      status={c.status}
                    />
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3 pb-1">
                      <div>
                        <p className="font-display text-xl italic">{c.recipient_name_formatted}</p>
                        <p className="text-xs capitalize text-muted-foreground">
                          {new Date(c.issued_at).toLocaleDateString()} · {c.status}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        disabled={c.status === "revoked"}
                        onClick={() =>
                          downloadCertificatePdf({
                            recipient: c.recipient_name_formatted,
                            course: title,
                            issuedAt: c.issued_at,
                            code: c.certificate_number,
                            templateId: c.template_id,
                          })
                        }
                      >
                        Download PDF
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <Empty
              icon={Award}
              title="Certificates appear here"
              copy="Complete every lesson in a course to unlock your named certificate."
            />
          )}
        </TabsContent>
        <TabsContent value="payments" className="mt-10">
          {payments.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Method</th>
                    <th className="p-4">Transaction</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr className="border-b border-border" key={p.id}>
                      <td className="p-4">{new Date(p.created_at).toLocaleDateString()}</td>
                      <td className="p-4 font-semibold">{fmt(p.amount)}</td>
                      <td className="p-4">
                        {p.provider === "mpesa_direct" ? "M-Pesa" : "Paystack"}
                      </td>
                      <td className="p-4 font-mono text-xs">{p.provider_transaction_id}</td>
                      <td className="p-4 capitalize text-primary">{p.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty
              icon={ReceiptText}
              title="No payments yet"
              copy="Your successful purchases and transaction references will appear here."
            />
          )}
        </TabsContent>
        <TabsContent value="settings" className="mt-10 max-w-xl space-y-5">
          <h2 className="font-display text-3xl">Account settings</h2>
          <p className="text-sm text-muted-foreground">
            Need more detail? Your{" "}
            <Link to="/profile" className="text-primary underline">
              full profile
            </Link>{" "}
            holds your story, focus areas, achievements and privacy choices.
          </p>
          <div>
            <Label>Display name</Label>
            <Input
              className="mt-2"
              value={profile.display_name}
              onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
            />
          </div>
          <div>
            <Label>Phone number</Label>
            <Input
              className="mt-2"
              value={profile.phone ?? ""}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
          </div>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={profile.email_notifications}
              onChange={(e) => setProfile({ ...profile, email_notifications: e.target.checked })}
            />
            Email updates
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={profile.learning_reminders}
              onChange={(e) => setProfile({ ...profile, learning_reminders: e.target.checked })}
            />
            Learning reminders
          </label>
          <Button onClick={save}>Save settings</Button>
        </TabsContent>
      </Tabs>
    </section>
  );
}
function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
}) {
  return (
    <div className="border border-border bg-card p-5">
      <p className="flex items-center gap-2 text-xs uppercase tracking-[.16em] text-muted-foreground">
        <Icon className="size-4 text-primary" />
        {label}
      </p>
      <p className="mt-3 font-display text-3xl">{value}</p>
    </div>
  );
}
function Tab({
  value,
  icon: Icon,
  children,
}: {
  value: string;
  icon: typeof BookOpen;
  children: React.ReactNode;
}) {
  return (
    <TabsTrigger
      value={value}
      className="rounded-none border-b-2 border-transparent px-5 py-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
    >
      <Icon />
      {children}
    </TabsTrigger>
  );
}
function Empty({ icon: Icon, title, copy }: { icon: typeof Award; title: string; copy: string }) {
  return (
    <div className="border border-border bg-card p-10 text-center">
      <Icon className="mx-auto size-8 text-primary" />
      <h2 className="mt-5 font-display text-3xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted-foreground">{copy}</p>
    </div>
  );
}
