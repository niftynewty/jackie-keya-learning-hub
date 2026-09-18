import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/site/course-card";
import { courses } from "@/lib/site-data";
import { meta } from "@/components/site/page";
import hero from "@/assets/jackie-hero.jpg";

// No head() here: the home route inherits title/description/og/twitter from
// __root.tsx, and ships no og:image so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  head: () =>
    meta(
      "Find your way forward",
      "Compassionate online courses for emotional healing, new beginnings, and stronger blended families.",
    ),
  component: Index,
});

// IMPORTANT: Replace this placeholder. See ./README.md for routing conventions.
function Index() {
  const paths = [
    ["Healing & heartbreak", "Gentle support for grief, release, and rebuilding.", "/new-beginnings"],
    ["Relationships", "Build honest, healthier ways of relating.", "/courses"],
    ["Blended families", "Create trust, boundaries, and belonging.", "/blended-families"],
    ["Parenting & co-parenting", "Put children and clarity at the centre.", "/blended-families"],
    ["Personal growth", "Reconnect with who you are becoming.", "/courses"],
    ["New beginnings", "Turn uncertainty into a grounded next step.", "/new-beginnings"],
  ] as const;
  return (
    <>
      <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
        <img
          src={hero}
          alt="Jackie Keya, family and relationship coach"
          width={1600}
          height={1104}
          className="absolute inset-0 size-full object-cover object-[62%_center]"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-background/80 lg:right-[38%]" />
        <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center px-5 py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[.22em] text-primary">
              Healing fresh starts & harmonious blended families
            </p>
            <h1 className="mt-6 font-display text-6xl leading-[.98] md:text-8xl">Your journey to peace starts here.</h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-muted-foreground md:text-lg">
              Life’s transitions can feel overwhelming, but they also open the door to renewal. Find compassionate
              guidance for personal healing and family unity.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/courses">
                  Explore courses
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/about">Meet Jackie</Link>
              </Button>
            </div>
            <div className="mt-12 flex flex-wrap gap-9 border-t border-foreground/15 pt-7">
              <p>
                <strong className="block font-display text-3xl">2</strong>
                <span className="text-xs text-muted-foreground">focused learning tracks</span>
              </p>
              <p>
                <strong className="block font-display text-3xl">42</strong>
                <span className="text-xs text-muted-foreground">days of course access</span>
              </p>
              <p>
                <strong className="block font-display text-3xl">Your pace</strong>
                <span className="text-xs text-muted-foreground">private, guided learning</span>
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-primary">Start where you are</p>
            <h2 className="mt-5 font-display text-5xl leading-tight">What are you navigating right now?</h2>
            <p className="mt-5 max-w-md leading-7 text-muted-foreground">
              Choose the path that feels closest to your experience. There is no wrong place to begin.
            </p>
          </div>
          <div className="grid sm:grid-cols-2">
            {paths.map(([title, copy, to], i) => (
              <Link key={title} to={to} className="border-t border-border py-7 sm:px-6 sm:odd:border-r">
                <h3 className="font-display text-2xl">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
                <span className="mt-5 block text-xs font-semibold uppercase tracking-[.14em] text-primary">Explore this path</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-card">
        <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-primary">Guided learning</p>
              <h2 className="mt-4 font-display text-5xl">Choose your next step.</h2>
            </div>
            <Button asChild variant="outline">
              <Link to="/courses">
                View all courses
              </Link>
            </Button>
          </div>
          <div className="mt-12 grid gap-x-8 md:grid-cols-2 lg:grid-cols-4">
            {courses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-5 py-24 text-center">
        <p className="font-display text-4xl leading-tight md:text-5xl">
          “Healing is not about returning to who you were. It is learning to trust who you are becoming.”
        </p>
        <p className="mt-6 text-sm font-semibold text-primary">Jackie Keya</p>
      </section>
    </>
  );
}
