import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ProgressSummary = {
  percent: (courseId: string) => number;
  completed: (courseId: string) => number;
  total: (courseId: string) => number;
  completedLessons: number;
  minutesLearned: number;
  ready: boolean;
};

/** Real completion tracking for the signed-in student, across every course. */
export function useProgress(userId: string): ProgressSummary {
  const [lessonCourse, setLessonCourse] = useState<Map<string, string>>(new Map());
  const [lessonMinutes, setLessonMinutes] = useState<Map<string, number>>(new Map());
  const [done, setDone] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from("modules").select("id,course_id"),
      supabase.from("lessons").select("id,module_id,duration_seconds"),
      supabase.from("lesson_progress").select("lesson_id,is_completed").eq("user_id", userId),
    ]).then(([mods, les, prog]) => {
      const courseByModule = new Map((mods.data ?? []).map((m) => [m.id, m.course_id]));
      const map = new Map<string, string>();
      const minutes = new Map<string, number>();
      for (const lesson of les.data ?? []) {
        const courseId = courseByModule.get(lesson.module_id);
        if (courseId) map.set(lesson.id, courseId);
        minutes.set(lesson.id, Math.round((lesson.duration_seconds ?? 0) / 60));
      }
      setLessonCourse(map);
      setLessonMinutes(minutes);
      setDone(new Set((prog.data ?? []).filter((p) => p.is_completed).map((p) => p.lesson_id)));
      setReady(true);
    });
  }, [userId]);

  const total = (courseId: string) =>
    [...lessonCourse.values()].filter((id) => id === courseId).length;
  const completed = (courseId: string) =>
    [...done].filter((lessonId) => lessonCourse.get(lessonId) === courseId).length;
  const percent = (courseId: string) => {
    const t = total(courseId);
    return t ? Math.round((completed(courseId) / t) * 100) : 0;
  };
  const minutesLearned = [...done].reduce(
    (sum, lessonId) => sum + (lessonMinutes.get(lessonId) ?? 0),
    0,
  );

  return { percent, completed, total, completedLessons: done.size, minutesLearned, ready };
}
