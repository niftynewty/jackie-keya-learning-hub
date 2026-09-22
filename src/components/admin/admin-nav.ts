import {
  Activity,
  Award,
  BadgeCheck,
  BarChart3,
  BookOpen,
  CalendarDays,
  CircleDollarSign,
  FileText,
  GraduationCap,
  LayoutDashboard,
  PackageOpen,
  Percent,
  ReceiptText,
  Settings,
  Star,
  Tags,
  Users,
} from "@/components/ui/icons";

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

export const groups: Array<{
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
