import { toast } from "sonner";
import { Clock3, RotateCcw, UserSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import type { useAdminData } from "./data";
import { Stat } from "./orders-panel";
import { StudentProfileSheet } from "./student-profile";

export function StudentsPanel({ admin, search = "" }: { admin: ReturnType<typeof useAdminData>; search?: string }) {
  const { data, names, courseTitles, percent, completedCount, totalLessons, reload } = admin;

  async function extend(enrollmentId: string, expiresAt: string) {
    const base = new Date(expiresAt) > new Date() ? new Date(expiresAt) : new Date();
    base.setDate(base.getDate() + 42);
    const { error } = await supabase.from("enrollments").update({ expires_at: base.toISOString(), status: "active" }).eq("id", enrollmentId);
    error ? toast.error(error.message) : (toast.success("Access extended by 42 days"), reload());
  }
  async function revoke(enrollmentId: string) {
    const { error } = await supabase.from("enrollments").update({ status: "revoked" }).eq("id", enrollmentId);
    error ? toast.error(error.message) : (toast.success("Access revoked"), reload());
  }

  const students = data.profiles.map((profile) => ({
    profile,
    enrollments: data.enrollments.filter((e) => e.user_id === profile.id),
  })).filter(({ profile }) => `${profile.display_name} ${profile.phone ?? ""}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => b.enrollments.length - a.enrollments.length);

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-3">
        <Stat label="Students" value={String(data.profiles.length)} />
        <Stat label="Active enrolments" value={String(data.enrollments.filter((e) => e.status === "active" && new Date(e.expires_at) > new Date()).length)} />
        <Stat label="Lessons completed" value={String(data.progress.filter((p) => p.is_completed).length)} />
      </div>
      <div className="mt-6 space-y-5">
        {students.map(({ profile, enrollments }) => (
          <article key={profile.id} className="border border-border bg-card p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="font-display text-2xl">{names[profile.id]}</h3>
              <div className="flex items-center gap-3">
                <p className="text-xs text-muted-foreground">Joined {new Date(profile.created_at).toLocaleDateString()}{profile.phone ? ` · ${profile.phone}` : ""}</p>
                <StudentProfileSheet admin={admin} studentId={profile.id}
                  trigger={<Button size="sm" variant="outline"><UserSearch />View full profile</Button>} />
              </div>
            </div>
            {enrollments.length ? (
              <div className="mt-6 space-y-5">
                {enrollments.map((e) => (
                  <div key={e.id}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-medium">{courseTitles[e.course_id] ?? "Course"}</p>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-2 text-xs text-muted-foreground"><Clock3 className="size-3.5" />{e.status === "revoked" ? "Revoked" : `Until ${new Date(e.expires_at).toLocaleDateString()}`}</span>
                        <Button size="sm" variant="outline" onClick={() => extend(e.id, e.expires_at)}><RotateCcw />Extend 42 days</Button>
                        <Button size="sm" variant="ghost" onClick={() => revoke(e.id)}>Revoke</Button>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-4">
                      <Progress value={percent(profile.id, e.course_id)} />
                      <span className="w-40 shrink-0 text-right text-xs text-muted-foreground">{completedCount(profile.id, e.course_id)}/{totalLessons(e.course_id)} lessons · {percent(profile.id, e.course_id)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="mt-4 text-sm text-muted-foreground">No enrolments yet.</p>}
          </article>
        ))}
        {!students.length && <p className="text-sm text-muted-foreground">No students have registered yet.</p>}
      </div>
    </div>
  );
}
