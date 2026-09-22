import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  Award,
  BadgeCheck,
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Menu,
  PackageOpen,
  Percent,
  ReceiptText,
  Search,
  Settings,
  Star,
  Tags,
  Users,
  X,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type AdminView =
  | "overview"
  | "courses"
  | "categories"
  | "certificates"
  | "badges"
  | "students"
  | "enrollments"
  | "orders"
  | "payments"
  | "discounts"
  | "articles"
  | "resources"
  | "testimonials"
  | "sessions"
  | "calendar"
  | "analytics"
  | "activity"
  | "settings";

const groups: Array<{
  label?: string;
  items: Array<{ value: AdminView; label: string; icon: typeof LayoutDashboard }>;
}> = [
  { items: [{ value: "overview", label: "Dashboard", icon: LayoutDashboard }] },
  {
    label: "Learning",
    items: [
      { value: "courses", label: "Courses", icon: BookOpen },
      { value: "categories", label: "Categories", icon: Tags },
      { value: "certificates", label: "Certificates", icon: Award },
      { value: "badges", label: "Badges", icon: BadgeCheck },
    ],
  },
  {
    label: "People",
    items: [
      { value: "students", label: "Students", icon: Users },
      { value: "enrollments", label: "Enrollments", icon: GraduationCap },
    ],
  },
  {
    label: "Sales",
    items: [
      { value: "orders", label: "Orders", icon: ReceiptText },
      { value: "payments", label: "Payments", icon: CircleDollarSign },
      { value: "discounts", label: "Discounts", icon: Percent },
    ],
  },
  {
    label: "Content",
    items: [
      { value: "articles", label: "Articles", icon: FileText },
      { value: "resources", label: "Resources", icon: PackageOpen },
      { value: "testimonials", label: "Testimonials", icon: Star },
    ],
  },
  {
    label: "Bookings",
    items: [
      { value: "sessions", label: "Sessions", icon: CalendarDays },
      { value: "calendar", label: "Calendar", icon: CalendarDays },
    ],
  },
  {
    label: "Insights",
    items: [
      { value: "analytics", label: "Analytics", icon: BarChart3 },
      { value: "activity", label: "Activity log", icon: Activity },
      { value: "settings", label: "Settings", icon: Settings },
    ],
  },
];

export const adminViewLabels: Record<AdminView, string> = {
  overview: "Dashboard overview",
  courses: "Course management",
  categories: "Course categories",
  certificates: "Certificate management",
  badges: "Achievement badges",
  students: "Student management",
  enrollments: "Enrollment management",
  orders: "Orders",
  payments: "Payment records",
  discounts: "Discounts & coupons",
  articles: "Articles",
  resources: "Resource library",
  testimonials: "Testimonials",
  sessions: "Coaching sessions",
  calendar: "Booking calendar",
  analytics: "Reports & analytics",
  activity: "Admin activity log",
  settings: "Platform settings",
};

export function AdminShell({
  active,
  onChange,
  search,
  onSearch,
  children,
}: {
  active: AdminView;
  onChange: (view: AdminView) => void;
  search: string;
  onSearch: (value: string) => void;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-admin-canvas lg:flex">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/35 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`${mobileOpen ? "translate-x-0" : "-translate-x-full"} ${collapsed ? "lg:w-20" : "lg:w-64"} fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-admin-sidebar text-admin-sidebar-foreground transition-all lg:sticky lg:top-0 lg:h-screen lg:translate-x-0`}
      >
        <div className="flex h-20 items-center justify-between border-b border-admin-sidebar-border px-5">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-sm bg-admin-sidebar-accent font-display text-xl text-admin-sidebar-accent-foreground">
              J
            </span>
            {!collapsed && (
              <span className="min-w-0">
                <strong className="block truncate font-display text-lg font-normal">
                  Jackie Keya
                </strong>
                <span className="block truncate text-[10px] uppercase text-admin-sidebar-muted">
                  Learning Hub Admin
                </span>
              </span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="text-admin-sidebar-foreground lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X />
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {groups.map((group, groupIndex) => (
            <div key={group.label ?? groupIndex} className="mb-5">
              {group.label && !collapsed && (
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase text-admin-sidebar-muted">
                  {group.label}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map(({ value, label, icon: Icon }) => (
                  <Button
                    key={value}
                    variant="ghost"
                    onClick={() => {
                      onChange(value);
                      setMobileOpen(false);
                    }}
                    title={collapsed ? label : undefined}
                    className={`h-9 w-full justify-start px-3 text-sm ${active === value ? "bg-admin-sidebar-active text-admin-sidebar-active-foreground hover:bg-admin-sidebar-active" : "text-admin-sidebar-muted hover:bg-admin-sidebar-hover hover:text-admin-sidebar-foreground"}`}
                  >
                    <Icon className="size-4 shrink-0" />
                    {!collapsed && <span>{label}</span>}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-admin-sidebar-border p-3">
          <Button
            variant="ghost"
            className="w-full justify-start text-admin-sidebar-muted hover:bg-admin-sidebar-hover hover:text-admin-sidebar-foreground"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight />
            ) : (
              <>
                <ChevronLeft />
                <span>Collapse menu</span>
              </>
            )}
          </Button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/95 px-4 md:px-7">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-semibold md:text-lg">
              {adminViewLabels[active]}
            </h1>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Jackie Keya Learning Hub
            </p>
          </div>
          <div className="relative hidden w-full max-w-xs md:block">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="bg-muted pl-9"
              aria-label="Search this workspace"
              value={search}
              onChange={(event) => onSearch(event.target.value)}
            />
          </div>
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell />
            <span className="sr-only">Notifications</span>
          </Button>
          <div className="hidden items-center gap-3 border-l border-border pl-4 sm:flex">
            <div className="text-right">
              <p className="text-sm font-semibold">Jackie Keya</p>
              <p className="text-[10px] uppercase text-muted-foreground">Administrator</p>
            </div>
            <span className="grid size-9 place-items-center rounded-full bg-secondary font-display text-sm">
              JK
            </span>
          </div>
        </header>
        <main className="p-4 md:p-7 xl:p-9">{children}</main>
      </div>
    </div>
  );
}
