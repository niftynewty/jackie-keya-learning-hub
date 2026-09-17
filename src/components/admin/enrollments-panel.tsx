import { useMemo, useState } from "react";
import { CalendarPlus, Search, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import type { useAdminData } from "./data";
import { Empty, Status } from "./overview-panel";

export function EnrollmentsPanel({ admin }: { admin: ReturnType<typeof useAdminData> }) {
  const { data, names, courseTitles, percent, reload } = admin;
  const [query, setQuery] = useState("");
  const [student, setStudent] = useState(data.profiles[0]?.id ?? "");
  const [course, setCourse] = useState(data.courses[0]?.id ?? "");
  const rows = useMemo(() => data.enrollments.filter((item) => `${names[item.user_id]} ${courseTitles[item.course_id]} ${item.status}`.toLowerCase().includes(query.toLowerCase())), [courseTitles, data.enrollments, names, query]);

  async function enroll() {
    if (!student || !course) { toast.error("Choose a student and course"); return; }
    const accessDays = data.courses.find((item) => item.id === course)?.access_days ?? 42;
    const expires = new Date(); expires.setDate(expires.getDate() + accessDays);
    const { error } = await supabase.from("enrollments").insert({ user_id: student, course_id: course, expires_at: expires.toISOString(), status: "active" });
    if (error) { toast.error(error.message); return; }
    toast.success("Complimentary access granted"); reload();
  }

  async function update(id: string, values: { status?: "active" | "expired" | "revoked"; expires_at?: string }) {
    const { error } = await supabase.from("enrollments").update(values).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Enrollment updated"); reload();
  }

  return <div className="space-y-6">
    <section className="rounded-md border border-border bg-card p-5 shadow-sm"><div className="flex flex-col gap-4 xl:flex-row xl:items-end"><div className="min-w-56 flex-1"><label className="text-xs font-semibold">Student</label><select className="mt-2 h-9 w-full border border-input bg-background px-3 text-sm" value={student} onChange={(event) => setStudent(event.target.value)}>{data.profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.display_name || "Student"}</option>)}</select></div><div className="min-w-56 flex-1"><label className="text-xs font-semibold">Course</label><select className="mt-2 h-9 w-full border border-input bg-background px-3 text-sm" value={course} onChange={(event) => setCourse(event.target.value)}>{data.courses.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></div><Button onClick={enroll}><UserPlus />Grant complimentary access</Button></div></section>
    <section className="overflow-hidden rounded-md border border-border bg-card shadow-sm"><div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-display text-2xl">All enrollments</h2><p className="text-xs text-muted-foreground">{data.enrollments.length} records</p></div><div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input className="w-72 pl-9" placeholder="Search student or course" value={query} onChange={(event) => setQuery(event.target.value)}/></div></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-muted/70 text-[10px] uppercase text-muted-foreground"><tr><th className="px-5 py-3">Student</th><th className="px-5 py-3">Course</th><th className="px-5 py-3">Enrolled</th><th className="px-5 py-3">Expires</th><th className="px-5 py-3">Progress</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Actions</th></tr></thead><tbody className="divide-y divide-border">{rows.map((item) => <tr key={item.id}><td className="px-5 py-4 font-medium">{names[item.user_id] ?? "Student"}</td><td className="px-5 py-4 text-muted-foreground">{courseTitles[item.course_id] ?? "Course"}</td><td className="px-5 py-4 text-xs">{new Date(item.enrolled_at).toLocaleDateString()}</td><td className="px-5 py-4 text-xs">{new Date(item.expires_at).toLocaleDateString()}</td><td className="px-5 py-4">{percent(item.user_id, item.course_id)}%</td><td className="px-5 py-4"><Status value={item.status}/></td><td className="px-5 py-4"><div className="flex gap-1"><Button size="sm" variant="outline" onClick={() => { const next = new Date(item.expires_at); next.setDate(next.getDate()+42); update(item.id,{expires_at:next.toISOString(),status:"active"}); }}><CalendarPlus/>Extend</Button>{item.status === "revoked" ? <Button size="sm" variant="ghost" onClick={() => update(item.id,{status:"active"})}>Restore</Button> : <Button size="sm" variant="ghost" onClick={() => update(item.id,{status:"revoked"})}>Revoke</Button>}</div></td></tr>)}</tbody></table></div>{!rows.length && <Empty text="No matching enrollments."/>}</section>
  </div>;
}