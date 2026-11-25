import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    id: "time-commitment",
    question: "How much weekly time is needed?",
    answer:
      "3 to 4 sessions per week (35–50 minutes each). Warm-ups take 6–12 minutes alongside court, field, or gym practice.",
  },
  {
    id: "equipment-needed",
    question: "What equipment do I need?",
    answer:
      "Filter the library for Barbells, Dumbbells, Machines, or Bodyweight. Sport and mobility drills work anywhere.",
  },
  {
    id: "video-feedback",
    question: "How does AI Video Analysis work?",
    answer:
      "Upload an MP4/MOV/WebM clip or YouTube link and add notes. You get mechanical strengths, form fixes, and corrective drills.",
  },
  {
    id: "plans-limits",
    question: "What is Free vs. Pro?",
    answer:
      "The 400+ exercise library, Latest Science, Nutrition reference, and sample demos are free. Pro adds workout saving, private notes, flagging, and higher video limits.",
  },
];

export function FaqSection({ id = "faq" }: { id?: string }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-border/60 bg-surface/40">
      <div className="grid gap-10 px-5 py-12 md:grid-cols-[0.9fr_1.5fr] md:px-8 md:py-16">
        <div>
          <p className="eyebrow text-brand-amber">FAQ</p>
          <h2 className="text-display mt-3 text-3xl sm:text-4xl">Quick answers.</h2>
        </div>

        <Accordion
          type="single"
          collapsible
          className="w-full rounded-2xl border border-border bg-surface px-6"
        >
          {FAQS.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id} className="border-border/80 last:border-b-0">
              <AccordionTrigger className="min-h-14 py-4 text-left text-base font-normal text-foreground hover:text-brand-amber hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm font-light leading-relaxed text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
