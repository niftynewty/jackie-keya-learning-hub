import { createFileRoute } from "@tanstack/react-router";
import { PageIntro } from "@/components/site/page";
import { meta } from "@/components/site/page-meta";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
export const Route = createFileRoute("/faq")({
  head: () =>
    meta(
      "Frequently asked questions",
      "Answers about courses, access, payments, and the Learning Hub.",
    ),
  component: Page,
});
function Page() {
  const q = [
    [
      "How long can I access a course?",
      "Each course includes 42 days of access from enrolment, so you can learn at your own pace.",
    ],
    [
      "Are the sessions live?",
      "The courses are self-paced. Individual booking is planned for a later release.",
    ],
    [
      "How do payments work?",
      "This initial release demonstrates M-Pesa and Paystack checkout without making a real charge.",
    ],
    [
      "Will I receive a certificate?",
      "A named certificate becomes available after every lesson in an eligible course is complete.",
    ],
    [
      "Can this replace therapy?",
      "The Learning Hub offers coaching and education. It is not crisis support, medical care, or a replacement for therapy.",
    ],
  ];
  return (
    <>
      <PageIntro
        eyebrow="Questions, answered"
        title="Everything you need to know before you begin."
        copy="If your question is not covered here, reach out and we will point you in the right direction."
      />
      <section className="mx-auto max-w-3xl px-5 py-16">
        <Accordion type="single" collapsible>
          {q.map(([a, b], i) => (
            <AccordionItem value={`${i}`} key={a}>
              <AccordionTrigger className="text-base">{a}</AccordionTrigger>
              <AccordionContent className="leading-7 text-muted-foreground">{b}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </>
  );
}
