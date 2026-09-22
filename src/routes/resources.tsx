import { createFileRoute, Link } from "@tanstack/react-router";
import { PageIntro, meta } from "@/components/site/page";
export const Route = createFileRoute("/resources")({
  head: () =>
    meta("Free resources", "Resources for healing and family wellbeing from Jackie Keya."),
  component: Page,
});
function Page() {
  return (
    <>
      <PageIntro
        eyebrow="Free support"
        title="Resources"
        copy="Jackie’s published resources will be available here."
      />
      <div className="mx-auto max-w-5xl px-5 py-16 lg:px-8">
        <p className="border-y border-border py-6 text-sm leading-7">
          For guided support,{" "}
          <Link to="/courses" className="font-semibold underline">
            explore the courses.
          </Link>
        </p>
      </div>
    </>
  );
}
