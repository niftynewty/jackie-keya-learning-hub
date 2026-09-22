import { createFileRoute } from "@tanstack/react-router";
import { PageIntro, meta } from "@/components/site/page";
export const Route = createFileRoute("/contact")({
  head: () =>
    meta("Contact", "Contact the Jackie Keya Learning Hub for course and support questions."),
  component: Page,
});
function Page() {
  return (
    <>
      <PageIntro
        eyebrow="We’re here to help"
        title="Let’s make your next step clearer."
        copy="Ask about a course, your account, or the support that may suit your season."
      />
      <section className="mx-auto max-w-5xl px-5 py-16">
        <div className="grid gap-10 border-y border-border py-10 sm:grid-cols-2">
          <p>
            <strong className="block">Email</strong>
            <a
              className="mt-2 block text-muted-foreground underline"
              href="mailto:jackiekeyao@gmail.com"
            >
              jackiekeyao@gmail.com
            </a>
          </p>
          <p>
            <strong className="block">WhatsApp</strong>
            <a
              className="mt-2 block text-muted-foreground underline"
              href="https://wa.me/254726460246"
            >
              0726460246
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
