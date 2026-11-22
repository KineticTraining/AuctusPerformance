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
    question: "How much time do I need each week?",
    answer:
      "Most athletes train effectively with 3 to 4 focused sessions per week, averaging 35 to 50 minutes total. Warm-ups and mobility blocks run 6 to 12 minutes, and you can pair a strength or skill clip directly with your court, field, or gym practice.",
  },
  {
    id: "equipment-needed",
    question: "What equipment is required for the drills and programs?",
    answer:
      "No specialty facility is required. Sport skills, acceleration progressions, agility footwork, and hip mobility routines need flat turf, court space, or a living-room mat plus a phone to film reps. Strength & Power progressions scale cleanly whether you have a barbell rack, dumbbells, or bodyweight options.",
  },
  {
    id: "video-feedback",
    question: "How does AI video upload and technique analysis work?",
    answer:
      "Open the dedicated AI Video tab to upload a training clip from your device or paste a YouTube link, select the target technique (such as Jump Shot, Sprint Acceleration, Back Squat, or Tennis Serve), and add brief notes on what you felt. Dusk Kinetic evaluates your submission against our coaching cue and fault framework to return strengths, corrections, and specific drills.",
  },
  {
    id: "plans-limits",
    question: "How do the Basic, Pro, Unlimited, and Annual tiers differ?",
    answer:
      "Basic ($45/mo) unlocks 2 sport filters with beginner and select intermediate videos plus up to 20 video reviews each month. Pro ($70/mo) expands to 5 sport filters, all drill levels, and 40 monthly reviews. Unlimited Monthly ($100/mo) and Annual ($1,000/yr) include every sport filter, the entire library, and unlimited reviews.",
  },
  {
    id: "cancellation",
    question: "Can I switch plans or cancel anytime?",
    answer:
      "Yes. All subscriptions are managed directly through the Stripe Billing Portal on your Membership page. You can upgrade, switch between monthly and annual billing, update cards, or cancel at any point.",
  },
];

export function FaqSection() {
  return (
    <section className="border-t border-border/60 bg-surface/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:grid-cols-[1fr_1.4fr] md:px-8 md:py-24">
        <div>
          <p className="eyebrow text-brand-amber">Frequently Asked Questions</p>
          <h2 className="text-display mt-4 text-4xl md:text-5xl">
            Clear answers before you start.
          </h2>
          <p className="mt-4 max-w-sm text-sm font-light leading-relaxed text-muted-foreground">
            Practical details on weekly training volume, home or gym equipment, and how our AI video
            analysis works.
          </p>
        </div>

        <Accordion
          type="single"
          collapsible
          className="w-full rounded-2xl border border-border bg-surface px-6"
        >
          {FAQS.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id} className="border-border/80 last:border-b-0">
              <AccordionTrigger className="min-h-14 py-5 text-left text-base font-normal text-foreground hover:text-brand-amber hover:no-underline">
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
