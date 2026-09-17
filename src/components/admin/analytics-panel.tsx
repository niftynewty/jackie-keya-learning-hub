import { Award, BookOpen, CalendarDays, CircleDollarSign, GraduationCap, Users } from "lucide-react";
import type { useAdminData } from "./data";
import { fmt } from "@/lib/site-data";

export function AnalyticsPanel({ admin, bookingCount = 0 }: { admin: ReturnType<typeof useAdminData>; bookingCount?: number }) {
  const { data, courseTitles, percent } = admin;
  const successful = data.payments.filter((item) => item.status === "successful");
  const completed = data.enrollments.filter((item) => percent(item.user_id, item.course_id) === 100);
  const courseRows = data.courses.map((course) => {
    const enrollments = data.enrollments.filter((item) => item.course_id === course.id);
    const revenue = successful.filter((item) => item.course_id === course.id).reduce((sum, item) => sum + item.amount, 0);
    const completion = enrollments.length ? Math.round(enrollments.reduce((sum, item) => sum + percent(item.user_id, course.id), 0) / enrollments.length) : 0;
    return { id: course.id, title: courseTitles[course.id], enrollments: enrollments.length, completion, revenue };
  }).sort((a,b) => b.enrollments-a.enrollments);
  const cards = [["Students",data.profiles.length,Users],["Enrollments",data.enrollments.length,GraduationCap],["Published courses",data.courses.filter((c)=>c.is_published).length,BookOpen],["Completions",completed.length,Award],["Revenue",fmt(successful.reduce((sum,item)=>sum+item.amount,0)),CircleDollarSign],["Bookings",bookingCount,CalendarDays]] as const;
  return <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([label,value,Icon])=><div key={label} className="rounded-md border border-border bg-card p-5 shadow-sm"><Icon className="size-5 text-primary"/><p className="mt-5 text-xs text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></div>)}</div><section className="overflow-hidden rounded-md border border-border bg-card shadow-sm"><div className="border-b border-border p-5"><h2 className="font-display text-2xl">Course performance</h2><p className="mt-1 text-sm text-muted-foreground">Enrollment, average progress, and manually confirmed revenue.</p></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-muted/70 text-[10px] uppercase text-muted-foreground"><tr><th className="px-5 py-3">Course</th><th className="px-5 py-3">Enrollments</th><th className="px-5 py-3">Average progress</th><th className="px-5 py-3">Revenue</th></tr></thead><tbody className="divide-y divide-border">{courseRows.map((row)=><tr key={row.id}><td className="px-5 py-4 font-medium">{row.title}</td><td className="px-5 py-4">{row.enrollments}</td><td className="px-5 py-4"><div className="flex items-center gap-3"><div className="h-2 w-40 bg-muted"><div className="h-full bg-primary" style={{width:`${row.completion}%`}}/></div><span>{row.completion}%</span></div></td><td className="px-5 py-4">{fmt(row.revenue)}</td></tr>)}</tbody></table></div></section></div>;
}