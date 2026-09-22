import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { type Course, fmt } from "@/lib/site-data";

export function CourseCard({ course }: { course: Course }) {
  return (
    <article className="group flex h-full flex-col border-t border-border py-7">
      <div className="mb-8 flex items-start justify-between gap-4">
        <span className="text-xs font-semibold uppercase tracking-[.18em] text-primary">
          {course.tone}
        </span>
        {course.original && (
          <span className="border border-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
            Save {fmt(course.original - course.price)}
          </span>
        )}
      </div>
      <h3 className="font-display text-3xl leading-tight text-foreground">{course.title}</h3>
      <p className="mt-3 flex-1 text-sm leading-7 text-muted-foreground">{course.short}</p>
      <div className="mt-6 flex items-center gap-5 text-xs text-muted-foreground">
        <span>{course.modules} modules</span>
        <span>{course.duration}</span>
      </div>
      <div className="mt-7 flex items-end justify-between gap-3">
        <div>
          {course.original && (
            <p className="text-xs text-muted-foreground line-through">{fmt(course.original)}</p>
          )}
          <p className="text-xl font-semibold">{fmt(course.price)}</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/courses/$slug" params={{ slug: course.slug }}>
            View course
          </Link>
        </Button>
      </div>
    </article>
  );
}
