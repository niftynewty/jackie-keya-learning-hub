import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft, Award, BadgeCheck, BookOpen, CalendarDays, Clock3, Download, Flame, Heart, KeyRound,
  Loader2, MapPin, ReceiptText, Save, ShieldCheck, Sparkles, Timer, UserRound,
} from "@/components/ui/icons";
import { toast } from "sonner";
import { meta } from "@/components/site/page";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { courses, fmt } from "@/lib/site-data";
import { dateTimeLabel, sessionTypeLabel } from "@/lib/booking";
import { useProgress } from "@/lib/use-progress";
import { ProfileAvatar } from "@/components/student/profile-avatar";
import { CertificateArtwork } from "@/components/certificate/certificate-artwork";
import { downloadCertificatePdf } from "@/lib/certificate-pdf";
import { AreaField, ChipField, ChoiceField, SectionCard, TextField, ToggleRow } from "@/components/student/profile-fields";
import {
  CONTACT_METHODS, FAMILY_SITUATIONS, FOCUS_AREAS, GENDERS, LANGUAGES, LIFE_STAGES, REFERRAL_SOURCES,
  RELATIONSHIP_STATUS, REMINDER_TIMES, TIMEZONES, VISIBILITY, completeness, dateLabel, engagementTier, recency,
  type StudentProfile,
} from "@/lib/student-profile";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => meta("My profile", "Manage your personal details, learning journey, achievements, preferences and account security."),
  component: ProfilePage,
});

type Enrollment = Tables<"enrollments">;
type Certificate = Tables<"certificates">;
type Payment = Tables<"payments">;
type Booking = Tables<"bookings">;
type Badge = Tables<"badges">;

function ProfilePage() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const progress = useProgress(user.id);

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [badges, setBadges] = useState<Array<{ awarded_at: string; badge: Badge | null }>>([]);
  const [completedLessons, setCompletedLessons] = useState<Array<{ lesson_id: string; completed_at: string | null }>>([]);
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    const loadAll = () => Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("enrollments").select("*").order("enrolled_at", { ascending: false }),
      supabase.from("certificates").select("*").order("issued_at", { ascending: false }),
      supabase.from("payments").select("*").order("created_at", { ascending: false }),
      supabase.from("bookings").select("*").eq("user_id", user.id).order("scheduled_for", { ascending: false }),
      supabase.from("student_badges").select("awarded_at,badges(*)").eq("user_id", user.id).order("awarded_at", { ascending: false }),
      supabase.from("lesson_progress").select("lesson_id,completed_at").eq("user_id", user.id).eq("is_completed", true).order("completed_at", { ascending: false }).limit(8),
    ]).then(([p, e, c, pay, b, sb, lp]) => {
      if (p.data) setProfile(p.data as StudentProfile);
      setEnrollments(e.data ?? []);
      setCertificates(c.data ?? []);
      setPayments(pay.data ?? []);
      setBookings(b.data ?? []);
      setBadges(((sb.data ?? []) as Array<{ awarded_at: string; badges: Badge | null }>).map((row) => ({ awarded_at: row.awarded_at, badge: row.badges })));
      setCompletedLessons(lp.data ?? []);
    });
    void loadAll().then(() => supabase.rpc("touch_profile_activity"));
  }, [user.id]);

  const enrolled = useMemo(
    () => enrollments.map((e) => ({ e, course: courses.find((c) => c.id === e.course_id) })).filter((row) => row.course),
    [enrollments],
  );
  const spend = payments.filter((p) => p.status === "successful").reduce((sum, p) => sum + p.amount, 0);
  const tier = engagementTier(progress.completedLessons, progress.minutesLearned, enrolled.length);
  const seen = recency(profile?.last_active_at ?? null);
  const score = profile ? completeness(profile) : null;

  function patch(update: Partial<StudentProfile>) {
    setProfile((current) => (current ? { ...current, ...update } : current));
  }

  async function save() {
    if (!profile) return;
    setSaving(true);
    const { id, created_at, updated_at, login_count, last_active_at, ...editable } = profile;
    const { error } = await supabase.from("profiles").update({ ...editable, onboarding_completed: true }).eq("id", user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Profile saved");
  }

  async function changePassword() {
    if (password.length < 8) { toast.error("Use at least 8 characters"); return; }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { toast.error(error.message); return; }
    setPassword("");
    toast.success("Password updated");
  }

  function exportData() {
    const blob = new Blob([JSON.stringify({ profile, enrollments, certificates, payments, bookings, badges }, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `jackie-keya-profile-${user.id.slice(0, 8)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success("Your data file is downloading");
  }

  if (!profile) {
    return <section className="mx-auto grid max-w-7xl place-items-center px-5 py-32"><p className="text-sm text-muted-foreground">Loading profile</p></section>;
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
      <Button asChild variant="ghost" size="sm" className="-ml-3"><Link to="/dashboard"><ArrowLeft />Back to my learning</Link></Button>

      {/* Identity header */}
      <div className="mt-6 border border-border bg-card p-6 md:p-9">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <ProfileAvatar userId={user.id} path={profile.avatar_url} name={profile.display_name} onChange={(avatar_url) => patch({ avatar_url })} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">Student profile</p>
              <h1 className="mt-2 font-display text-4xl md:text-5xl">{profile.display_name || user.email?.split("@")[0]}</h1>
              <p className="mt-2 max-w-lg text-sm leading-7 text-muted-foreground">{profile.headline || "Add a short headline so Jackie knows how to greet you."}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><UserRound className="size-3.5" />{user.email}</span>
                <span className="flex items-center gap-1.5"><MapPin className="size-3.5" />{[profile.city, profile.country].filter(Boolean).join(", ") || "Location not set"}</span>
                <span className="flex items-center gap-1.5"><CalendarDays className="size-3.5" />Joined {dateLabel(profile.created_at)}</span>
                <span className="flex items-center gap-1.5"><Clock3 className="size-3.5" />{seen.label}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className={`px-3 py-1 text-xs font-semibold ${tier.tone}`}>{tier.label}</span>
                {profile.life_stage && <span className="border border-border px-3 py-1 text-xs text-muted-foreground">{profile.life_stage}</span>}
                {profile.focus_areas.slice(0, 4).map((area) => <span key={area} className="border border-border px-3 py-1 text-xs text-muted-foreground">{area}</span>)}
              </div>
            </div>
          </div>
          <div className="w-full max-w-xs border border-border bg-background p-5">
            <p className="text-xs font-semibold uppercase tracking-[.14em] text-muted-foreground">Profile completeness</p>
            <p className="mt-3 font-display text-4xl text-primary">{score?.percent ?? 0}%</p>
            <Progress className="mt-3" value={score?.percent ?? 0} />
            <p className="mt-3 text-xs text-muted-foreground">{score?.done} of {score?.total} details added.</p>
            {score && score.missing.length > 0 && (
              <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                {score.missing.slice(0, 4).map((field) => <li key={String(field.key)}>• {field.label}</li>)}
              </ul>
            )}
          </div>
        </div>
        <p className="mt-6 border-t border-border pt-5 text-sm italic text-muted-foreground">{tier.copy}</p>
      </div>

      {/* Snapshot */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={BookOpen} label="Courses enrolled" value={String(enrolled.length)} />
        <Metric icon={Flame} label="Lessons completed" value={String(progress.completedLessons)} />
        <Metric icon={Timer} label="Minutes learned" value={String(progress.minutesLearned)} />
        <Metric icon={Award} label="Certificates" value={String(certificates.length)} />
        <Metric icon={CalendarDays} label="Coaching sessions" value={String(bookings.length)} />
        <Metric icon={Sparkles} label="Badges earned" value={String(badges.length)} />
        <Metric icon={ReceiptText} label="Invested" value={fmt(spend)} />
        <Metric icon={ShieldCheck} label="Sign-ins" value={String(profile.login_count)} />
      </div>

      <Tabs defaultValue="journey" className="mt-10">
        <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-none border-b border-border bg-transparent p-0">
          <Tab value="journey">Journey</Tab>
          <Tab value="personal">Personal details</Tab>
          <Tab value="story">About you</Tab>
          <Tab value="preferences">Preferences</Tab>
          <Tab value="history">History</Tab>
          <Tab value="security">Security &amp; privacy</Tab>
        </TabsList>

        {/* Journey */}
        <TabsContent value="journey" className="mt-8 space-y-6">
          <SectionCard title="Learning journey" copy="Every course you have access to, with real progress and access dates.">
            {enrolled.length ? (
              <div className="grid gap-5 md:grid-cols-2">
                {enrolled.map(({ e, course }) => course && (
                  <article key={e.id} className="border border-border p-5">
                    <div className="flex justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">{course.tone}</p>
                      <span className="text-xs capitalize text-muted-foreground">{e.status}</span>
                    </div>
                    <h3 className="mt-4 font-display text-2xl">{course.title}</h3>
                    <div className="mt-5 mb-2 flex justify-between text-xs text-muted-foreground"><span>Progress</span><span>{progress.percent(course.id)}%</span></div>
                    <Progress value={progress.percent(course.id)} />
                    <p className="mt-2 text-xs text-muted-foreground">{progress.completed(course.id)} of {progress.total(course.id)} lessons · enrolled {dateLabel(e.enrolled_at)} · access until {dateLabel(e.expires_at)}</p>
                    <Button asChild variant="outline" size="sm" className="mt-5"><Link to="/learn/$slug" params={{ slug: course.slug }}>Continue</Link></Button>
                  </article>
                ))}
              </div>
            ) : <Empty copy="No courses yet. Your enrolled courses will appear here." action={<Button asChild size="sm"><Link to="/courses">Explore courses</Link></Button>} />}
          </SectionCard>

          <SectionCard title="Achievements" copy="Badges and certificates you have earned along the way.">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[.14em] text-muted-foreground">Badges</h3>
                <div className="mt-4 space-y-3">
                  {badges.length ? badges.map(({ awarded_at, badge }) => (
                    <div key={`${badge?.id}-${awarded_at}`} className="flex items-start gap-3 border border-border p-4">
                      <BadgeCheck className="mt-0.5 size-5 text-primary" />
                      <div>
                        <p className="text-sm font-semibold">{badge?.name ?? "Badge"}</p>
                        <p className="text-xs text-muted-foreground">{badge?.description}</p>
                        <p className="mt-1 text-xs text-muted-foreground">Awarded {dateLabel(awarded_at)}</p>
                      </div>
                    </div>
                  )) : <p className="text-sm text-muted-foreground">No badges yet: they arrive as you complete milestones.</p>}
                </div>
              </div>
              <div className="md:col-span-2">
                <h3 className="text-xs font-semibold uppercase tracking-[.14em] text-muted-foreground">Certificates</h3>
                <div className="mt-4 grid gap-5 lg:grid-cols-2">
                  {certificates.length ? certificates.map((c) => (
                    <div key={c.id} className="border border-border p-3">
                      <CertificateArtwork compact recipient={c.recipient_name_formatted} course={courses.find((course) => course.id === c.course_id)?.title ?? "Course"} issuedAt={c.issued_at} code={c.certificate_number} templateId={c.template_id} status={c.status} />
                      <div className="flex flex-wrap items-center justify-between gap-3 px-2 pt-3">
                        <div><p className="font-display text-xl italic">{c.recipient_name_formatted}</p><p className="text-xs capitalize text-muted-foreground">Issued {dateLabel(c.issued_at)} · {c.status}</p></div>
                        <Button size="sm" variant="outline" disabled={c.status === "revoked"} onClick={() => downloadCertificatePdf({ recipient: c.recipient_name_formatted, course: courses.find((course) => course.id === c.course_id)?.title ?? "Course", issuedAt: c.issued_at, code: c.certificate_number, templateId: c.template_id })}><Download />Download PDF</Button>
                      </div>
                    </div>
                  )) : <p className="text-sm text-muted-foreground">Complete a full course to earn your named certificate.</p>}
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Recent activity" copy="The last lessons you marked complete.">
            {completedLessons.length ? (
              <ul className="space-y-3">
                {completedLessons.map((row) => (
                  <li key={row.lesson_id} className="flex items-center gap-3 border-b border-border pb-3 text-sm last:border-0">
                    <Heart className="size-4 text-primary" />Lesson completed<span className="text-muted-foreground">· {dateLabel(row.completed_at)}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-muted-foreground">Your completed lessons will be listed here.</p>}
          </SectionCard>
        </TabsContent>

        {/* Personal details */}
        <TabsContent value="personal" className="mt-8 space-y-6">
          <SectionCard title="Personal details" copy="Only you and Jackie's team can see this information." actions={<SaveButton saving={saving} onClick={save} />}>
            <div className="grid gap-6 md:grid-cols-2">
              <TextField label="Full name" value={profile.display_name} onChange={(display_name) => patch({ display_name })} />
              <TextField label="Headline" hint="A one-line note about your season, e.g. “Rebuilding gently after divorce”." value={profile.headline ?? ""} onChange={(headline) => patch({ headline })} />
              <TextField label="Phone number" value={profile.phone ?? ""} onChange={(phone) => patch({ phone })} />
              <TextField label="WhatsApp number" value={profile.whatsapp ?? ""} onChange={(whatsapp) => patch({ whatsapp })} />
              <TextField label="City" value={profile.city ?? ""} onChange={(city) => patch({ city })} />
              <TextField label="Country" value={profile.country ?? ""} onChange={(country) => patch({ country })} />
              <TextField label="Date of birth" type="date" value={profile.date_of_birth ?? ""} onChange={(date_of_birth) => patch({ date_of_birth: date_of_birth || null })} />
              <ChoiceField label="Gender" value={profile.gender ?? ""} options={GENDERS} onChange={(gender) => patch({ gender: gender || null })} />
              <TextField label="Pronouns" value={profile.pronouns ?? ""} onChange={(pronouns) => patch({ pronouns })} />
              <TextField label="Work or occupation" value={profile.occupation ?? ""} onChange={(occupation) => patch({ occupation })} />
              <ChoiceField label="Time zone" value={profile.timezone} options={TIMEZONES} allowEmpty={false} onChange={(timezone) => patch({ timezone })} />
              <ChoiceField label="Preferred language" value={profile.preferred_language} options={LANGUAGES} allowEmpty={false} onChange={(preferred_language) => patch({ preferred_language })} />
            </div>
          </SectionCard>
          <SectionCard title="Someone who supports you" copy="Optional. Helpful if you ever want a trusted person included in a coaching conversation." actions={<SaveButton saving={saving} onClick={save} />}>
            <div className="grid gap-6 md:grid-cols-2">
              <TextField label="Their name" value={profile.support_person_name ?? ""} onChange={(support_person_name) => patch({ support_person_name })} />
              <TextField label="Their phone" value={profile.support_person_phone ?? ""} onChange={(support_person_phone) => patch({ support_person_phone })} />
            </div>
          </SectionCard>
        </TabsContent>

        {/* About you */}
        <TabsContent value="story" className="mt-8 space-y-6">
          <SectionCard title="Your story and focus" copy="This helps Jackie recommend the right courses and prepare for your sessions." actions={<SaveButton saving={saving} onClick={save} />}>
            <div className="space-y-6">
              <AreaField label="About you" hint="Share as much or as little as you like." value={profile.bio ?? ""} onChange={(bio) => patch({ bio })} />
              <AreaField label="What you hope to gain" value={profile.goals ?? ""} onChange={(goals) => patch({ goals })} rows={3} />
              <ChoiceField label="Current season" value={profile.life_stage ?? ""} options={LIFE_STAGES} onChange={(life_stage) => patch({ life_stage: life_stage || null })} />
              <ChipField label="Focus areas" hint="Pick everything that feels relevant." values={profile.focus_areas} options={FOCUS_AREAS} onChange={(focus_areas) => patch({ focus_areas })} />
              <div className="grid gap-6 md:grid-cols-2">
                <ChoiceField label="Relationship status" value={profile.relationship_status ?? ""} options={RELATIONSHIP_STATUS} onChange={(relationship_status) => patch({ relationship_status: relationship_status || null })} />
                <ChoiceField label="Family situation" value={profile.family_situation ?? ""} options={FAMILY_SITUATIONS} onChange={(family_situation) => patch({ family_situation: family_situation || null })} />
                <ChoiceField label="How you found the hub" value={profile.referral_source ?? ""} options={REFERRAL_SOURCES} onChange={(referral_source) => patch({ referral_source: referral_source || null })} />
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences" className="mt-8 space-y-6">
          <SectionCard title="Communication preferences" copy="Choose how and when you hear from the hub." actions={<SaveButton saving={saving} onClick={save} />}>
            <div className="grid gap-6 md:grid-cols-2">
              <ChoiceField label="Preferred contact method" value={profile.preferred_contact} options={CONTACT_METHODS} allowEmpty={false} onChange={(preferred_contact) => patch({ preferred_contact })} />
              <ChoiceField label="Best time for reminders" value={profile.reminder_time} options={REMINDER_TIMES} allowEmpty={false} onChange={(reminder_time) => patch({ reminder_time })} />
            </div>
            <div className="mt-6">
              <ToggleRow label="Email updates" copy="Course news, new lessons and important account messages." checked={profile.email_notifications} onChange={(email_notifications) => patch({ email_notifications })} />
              <ToggleRow label="Learning reminders" copy="Gentle nudges to continue a lesson you started." checked={profile.learning_reminders} onChange={(learning_reminders) => patch({ learning_reminders })} />
              <ToggleRow label="SMS updates" copy="Short text messages for session reminders." checked={profile.sms_notifications} onChange={(sms_notifications) => patch({ sms_notifications })} />
              <ToggleRow label="Weekly digest" copy="A Sunday summary of your progress and encouragement." checked={profile.weekly_digest} onChange={(weekly_digest) => patch({ weekly_digest })} />
              <ToggleRow label="Offers and new releases" copy="Occasional notes about new courses, resources and discounts." checked={profile.marketing_opt_in} onChange={(marketing_opt_in) => patch({ marketing_opt_in })} />
            </div>
          </SectionCard>
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="mt-8 space-y-6">
          <SectionCard title="Payment history" copy="Every purchase made with this account.">
            {payments.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border text-xs uppercase text-muted-foreground"><tr><th className="p-3">Date</th><th className="p-3">Course</th><th className="p-3">Amount</th><th className="p-3">Method</th><th className="p-3">Reference</th><th className="p-3">Status</th></tr></thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id} className="border-b border-border">
                        <td className="p-3">{dateLabel(p.created_at)}</td>
                        <td className="p-3">{courses.find((c) => c.id === p.course_id)?.title ?? "Not available"}</td>
                        <td className="p-3 font-semibold">{fmt(p.amount)}</td>
                        <td className="p-3">{p.provider === "mpesa_direct" ? "M-Pesa" : "Paystack"}</td>
                        <td className="p-3 font-mono text-xs">{p.provider_transaction_id}</td>
                        <td className="p-3 capitalize text-primary">{p.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-sm text-muted-foreground">No payments recorded yet.</p>}
          </SectionCard>
          <SectionCard title="Coaching sessions" copy="Your booked, completed and cancelled sessions." actions={<Button asChild variant="outline" size="sm"><Link to="/book-a-session">Book a session</Link></Button>}>
            {bookings.length ? (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 border border-border p-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">{sessionTypeLabel(b.session_type)} · {b.duration_minutes} min</p>
                      <p className="mt-2 text-sm">{dateTimeLabel(b.scheduled_for)}</p>
                    </div>
                    <span className="text-xs capitalize text-muted-foreground">{b.status}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">No sessions booked yet.</p>}
          </SectionCard>
        </TabsContent>

        {/* Security & privacy */}
        <TabsContent value="security" className="mt-8 space-y-6">
          <SectionCard title="Account security" copy="Keep your account protected.">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <TextField label="New password" type="password" hint="At least 8 characters." value={password} onChange={setPassword} />
                <Button onClick={changePassword}><KeyRound />Update password</Button>
              </div>
              <div className="border border-border p-5 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Account facts</p>
                <p className="mt-3">Email: {user.email}</p>
                <p className="mt-1">Sign-in method: {user.app_metadata?.provider ?? "email"}</p>
                <p className="mt-1">Total sign-ins: {profile.login_count}</p>
                <p className="mt-1">Last active: {seen.label}</p>
                <p className="mt-1">Student ID: <span className="font-mono text-xs">{user.id}</span></p>
              </div>
            </div>
          </SectionCard>
          <SectionCard title="Privacy and your data" copy="You decide what is shared and you can take a copy of your data at any time." actions={<SaveButton saving={saving} onClick={save} />}>
            <ChoiceField label="Profile visibility" value={profile.profile_visibility} options={VISIBILITY} allowEmpty={false} onChange={(profile_visibility) => patch({ profile_visibility })} />
            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="outline" onClick={exportData}><Download />Download my data</Button>
              <Button variant="ghost" onClick={async () => { await supabase.auth.signOut(); void navigate({ to: "/auth", replace: true }); }}>Sign out of this device</Button>
            </div>
            <p className="mt-4 text-xs leading-6 text-muted-foreground">To close your account and remove your records, contact Jackie&apos;s team and we will handle it for you.</p>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </section>
  );
}

function Tab({ value, children }: { value: string; children: React.ReactNode }) {
  return <TabsTrigger value={value} className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">{children}</TabsTrigger>;
}

function Metric({ icon: Icon, label, value }: { icon: typeof BookOpen; label: string; value: string }) {
  return (
    <div className="border border-border bg-card p-5">
      <p className="flex items-center gap-2 text-xs uppercase tracking-[.14em] text-muted-foreground"><Icon className="size-4 text-primary" />{label}</p>
      <p className="mt-3 font-display text-3xl">{value}</p>
    </div>
  );
}

function Empty({ copy, action }: { copy: string; action?: React.ReactNode }) {
  return <div className="border border-dashed border-border p-8 text-center"><p className="text-sm text-muted-foreground">{copy}</p>{action && <div className="mt-4">{action}</div>}</div>;
}

function SaveButton({ saving, onClick }: { saving: boolean; onClick: () => void }) {
  return <Button size="sm" onClick={onClick} disabled={saving}>{saving ? "Saving" : "Save changes"}</Button>;
}
