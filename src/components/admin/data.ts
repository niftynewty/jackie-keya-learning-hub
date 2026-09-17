import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type AdminData = {
  courses: Tables<"courses">[];
  modules: Tables<"modules">[];
  lessons: Tables<"lessons">[];
  profiles: Tables<"profiles">[];
  enrollments: Tables<"enrollments">[];
  progress: Tables<"lesson_progress">[];
  certificates: Tables<"certificates">[];
  payments: Tables<"payments">[];
  bookings: Tables<"bookings">[];
  badges: Tables<"badges">[];
  studentBadges: Tables<"student_badges">[];
};

const empty: AdminData = { courses: [], modules: [], lessons: [], profiles: [], enrollments: [], progress: [], certificates: [], payments: [], bookings: [], badges: [], studentBadges: [] };

export function useAdminData() {
  const [data, setData] = useState<AdminData>(empty);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const [courses, modules, lessons, profiles, enrollments, progress, certificates, payments, bookings, badges, studentBadges] = await Promise.all([
      supabase.from("courses").select("*").order("created_at"),
      supabase.from("modules").select("*").order("sort_order"),
      supabase.from("lessons").select("*").order("sort_order"),
      supabase.from("profiles").select("*").order("created_at"),
      supabase.from("enrollments").select("*").order("enrolled_at", { ascending: false }),
      supabase.from("lesson_progress").select("*"),
      supabase.from("certificates").select("*").order("issued_at", { ascending: false }),
      supabase.from("payments").select("*").order("created_at", { ascending: false }),
      supabase.from("bookings").select("*").order("scheduled_for", { ascending: false }),
      supabase.from("badges").select("*").order("created_at"),
      supabase.from("student_badges").select("*").order("awarded_at", { ascending: false }),
    ]);
    setData({
      courses: courses.data ?? [], modules: modules.data ?? [], lessons: lessons.data ?? [], profiles: profiles.data ?? [],
      enrollments: enrollments.data ?? [], progress: progress.data ?? [], certificates: certificates.data ?? [], payments: payments.data ?? [],
      bookings: bookings.data ?? [], badges: badges.data ?? [], studentBadges: studentBadges.data ?? [],
    });
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const helpers = useMemo(() => {
    const lessonCourse = new Map<string, string>();
    for (const lesson of data.lessons) {
      const module = data.modules.find((m) => m.id === lesson.module_id);
      if (module) lessonCourse.set(lesson.id, module.course_id);
    }
    const lessonTotals = new Map<string, number>();
    for (const courseId of lessonCourse.values()) lessonTotals.set(courseId, (lessonTotals.get(courseId) ?? 0) + 1);
    const courseTitles: Record<string, string> = {};
    for (const course of data.courses) courseTitles[course.id] = course.title;
    const names: Record<string, string> = {};
    for (const profile of data.profiles) names[profile.id] = profile.display_name || "Student";
    const completedCount = (userId: string, courseId: string) =>
      data.progress.filter((p) => p.user_id === userId && p.is_completed && lessonCourse.get(p.lesson_id) === courseId).length;
    const totalLessons = (courseId: string) => lessonTotals.get(courseId) ?? 0;
    const percent = (userId: string, courseId: string) => {
      const total = totalLessons(courseId);
      return total ? Math.round((completedCount(userId, courseId) / total) * 100) : 0;
    };
    return { courseTitles, names, completedCount, totalLessons, percent, lessonCourse };
  }, [data]);

  return { data, loading, reload, ...helpers };
}
