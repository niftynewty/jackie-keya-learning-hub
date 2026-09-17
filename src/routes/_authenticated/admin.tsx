import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { meta } from "@/components/site/page";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell, type AdminView } from "@/components/admin/admin-shell";
import { useAdminData } from "@/components/admin/data";
import { OverviewPanel } from "@/components/admin/overview-panel";
import { CoursesPanel } from "@/components/admin/courses-panel";
import { StudentsPanel } from "@/components/admin/students-panel";
import { OrdersPanel } from "@/components/admin/orders-panel";
import { CertificatesPanel } from "@/components/admin/certificates-panel";
import { BookingsPanel } from "@/components/admin/bookings-panel";
import { EnrollmentsPanel } from "@/components/admin/enrollments-panel";
import { AnalyticsPanel } from "@/components/admin/analytics-panel";
import { ArticlesPanel, BadgesPanel, CategoriesPanel, DiscountsPanel, ResourcesPanel, TestimonialsPanel } from "@/components/admin/content-panels";
import { ActivityPanel, CalendarPanel, SettingsPanel } from "@/components/admin/settings-panels";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [
    { title: "Admin Workspace | Jackie Keya" },
    { name: "description", content: "Manage Jackie Keya Learning Hub courses, students, enrollments, content, bookings, and reports." },
    { property: "og:title", content: "Admin Workspace | Jackie Keya" },
    { property: "og:description", content: "Manage Jackie Keya Learning Hub operations." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: AdminRoute,
});

function AdminRoute() {
  const { user } = Route.useRouteContext();
  const [state, setState] = useState<"checking" | "allowed" | "denied">("checking");
  useEffect(() => { supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => setState(data ? "allowed" : "denied")); }, [user.id]);
  if (state === "checking") return <div className="flex min-h-screen items-center justify-center bg-admin-canvas"><Loader2 className="size-6 animate-spin text-primary" /></div>;
  if (state === "denied") return <section className="mx-auto max-w-xl px-5 py-24 text-center"><ShieldCheck className="mx-auto size-10 text-primary"/><h1 className="mt-6 font-display text-4xl">Admin access required</h1><p className="mt-4 leading-7 text-muted-foreground">This workspace is reserved for approved administrators.</p><Button asChild variant="outline" className="mt-8"><Link to="/dashboard">Back to my learning</Link></Button></section>;
  return <AdminWorkspace />;
}

function AdminWorkspace() {
  const admin = useAdminData();
  const [view, setView] = useState<AdminView>("overview");
  const [search, setSearch] = useState("");
  const [bookingCount, setBookingCount] = useState(0);
  useEffect(() => { supabase.from("bookings").select("id", { count: "exact", head: true }).then(({ count }) => setBookingCount(count ?? 0)); }, []);
  if (admin.loading) return <div className="flex min-h-screen items-center justify-center bg-admin-canvas"><Loader2 className="size-6 animate-spin text-primary" /></div>;
  return <AdminShell active={view} onChange={setView} search={search} onSearch={setSearch}>
    {view === "overview" && <OverviewPanel admin={admin} onNavigate={setView}/>} 
    {view === "courses" && <CoursesPanel search={search}/>} 
    {view === "categories" && <CategoriesPanel admin={admin}/>} 
    {view === "certificates" && <CertificatesPanel admin={admin}/>} 
    {view === "badges" && <BadgesPanel/>} 
    {view === "students" && <StudentsPanel admin={admin} search={search}/>} 
    {view === "enrollments" && <EnrollmentsPanel admin={admin}/>} 
    {(view === "orders" || view === "payments") && <OrdersPanel names={admin.names} courseTitles={admin.courseTitles}/>} 
    {view === "discounts" && <DiscountsPanel admin={admin}/>} 
    {view === "articles" && <ArticlesPanel/>} 
    {view === "resources" && <ResourcesPanel admin={admin}/>} 
    {view === "testimonials" && <TestimonialsPanel admin={admin}/>} 
    {view === "sessions" && <BookingsPanel/>} 
    {view === "calendar" && <CalendarPanel/>} 
    {view === "analytics" && <AnalyticsPanel admin={admin} bookingCount={bookingCount}/>} 
    {view === "activity" && <ActivityPanel/>} 
    {view === "settings" && <SettingsPanel/>} 
  </AdminShell>;
}