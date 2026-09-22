import { createFileRoute } from "@tanstack/react-router";
import { PageIntro } from "@/components/site/page";
import { meta } from "@/components/site/page-meta";
import { CourseCard } from "@/components/site/course-card";
import { courses } from "@/lib/site-data";
import renewal from "@/assets/new-beginnings.jpg";
export const Route = createFileRoute("/new-beginnings")({
  head: () =>
    meta(
      "New beginnings",
      "Support for heartbreak, separation, personal growth, and starting over with clarity.",
    ),
  component: Page,
});
function Page() {
  return (
    <>
      <PageIntro
        eyebrow="A softer way forward"
        title="You are allowed to begin again."
        copy="A new beginning is not a denial of what happened. It is a patient decision to meet your life with honesty, hope, and self-trust."
      />
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-2 lg:px-8">
        <div className="flex flex-col justify-center">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">
            Renewal at your pace
          </p>
          <h2 className="mt-5 font-display text-5xl">Make room for the life ahead.</h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Whether you are healing from heartbreak, divorce, a difficult transition, or simply the
            feeling that something must change, you do not need to force your way forward.
          </p>
          <blockquote className="mt-10 border-y border-accent py-6 font-display text-2xl">
            A fresh start can be quiet. It can begin with one boundary, one truth, one kinder
            choice.
          </blockquote>
        </div>
        <img
          src={renewal}
          alt="A hopeful walk symbolising a new beginning"
          className="aspect-[4/3] size-full object-cover"
        />
      </section>
      <section className="bg-card">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <h2 className="font-display text-5xl">Begin with guided support</h2>
          <div className="mt-8 grid gap-10 md:grid-cols-2">
            {courses
              .filter((c) => c.category === "fresh_start")
              .map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
          </div>
        </div>
      </section>
    </>
  );
}
