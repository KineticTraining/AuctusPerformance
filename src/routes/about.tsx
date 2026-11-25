import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { AthleticImage } from "@/components/site/athletic-image";
import { ForceCurveAccent } from "@/components/site/biomechanical-curves";
import { PageWithOutline, type OutlineSection } from "@/components/site/page-outline";
import { Button } from "@/components/ui/button";
import { SITE_MEDIA } from "@/lib/media";

const ABOUT_OUTLINE: OutlineSection[] = [
  { id: "about-mission", label: "Mission" },
  { id: "about-methodology", label: "Methodology" },
  { id: "about-architecture", label: "Platform Hubs" },
];

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Auctus Performance" },
      {
        name: "description",
        content:
          "Auctus Performance helps athletes and everyday movers understand the science behind training, recovery, and nutrition—without wasting time.",
      },
      { property: "og:title", content: "About — Auctus Performance" },
      {
        property: "og:description",
        content:
          "Our mission, evidence-based training methodology, and transparent overview of the five hubs inside Auctus Performance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const METHODOLOGY = [
  {
    number: "01",
    title: "Biomechanics before intensity",
    body: "Adding weight or sprint fatigue over faulty mechanics only reinforces compensations. Every progression starts with joint alignment, ground contact stiffness, and clean movement patterns.",
  },
  {
    number: "02",
    title: "Evidence translated to practice",
    body: "Sports science only helps when you know sets, reps, rest intervals, and daily intake targets. We organize primary research into clear, practical guidance without academic fluff.",
  },
  {
    number: "03",
    title: "Tendon resilience & recovery balance",
    body: "Availability decides long-term progress. Eccentric hamstring work, ankle and hip mobility, and sleep-recovery pacing are built alongside high-output work.",
  },
  {
    number: "04",
    title: "Objective video feedback",
    body: "What a rep feels like rarely matches what happens at speed. Reviewing uploaded clips or YouTube links against structured mechanical cues removes guesswork.",
  },
];

const PLATFORM_PILLARS = [
  {
    title: "Training Library & Workout Builder",
    detail:
      "230+ exercises across 12 movement categories with smart prescriptions, muscle/equipment filters, and session builder.",
    to: "/training" as const,
  },
  {
    title: "Recovery Science",
    detail: "Evidence-backed sleep, workload, and soft-tissue protocols inside Latest Science.",
    to: "/articles" as const,
  },
  {
    title: "Verified Nutrition Reference",
    detail:
      "All 26 essential macronutrients, vitamins, and minerals with priority cues and biochemical depth.",
    to: "/nutrition" as const,
  },
  {
    title: "Latest Science Hub",
    detail:
      "Structured across Training, Recovery, and Nutrition with 5-star reader ratings and discussion.",
    to: "/articles" as const,
  },
  {
    title: "Gemini AI Video Analysis",
    detail:
      "Upload a training clip (.mp4, .mov, .webm) or YouTube link for cue-based form feedback.",
    to: "/submit" as const,
  },
];

function AboutPage() {
  return (
    <PageWithOutline sections={ABOUT_OUTLINE} title="About">
      {/* Mission Hero */}
      <section id="about-mission" className="scroll-mt-24 py-6 sm:py-10">
        <span className="block h-[3px] w-16 bg-tricolor" aria-hidden="true" />
        <p className="eyebrow mt-6 text-brand-amber">About Auctus Performance</p>
        <div className="mt-4 grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <h1 className="text-display text-4xl sm:text-5xl md:text-6xl">
              Understand the science behind athletics and health—without wasting time.
            </h1>
            <p className="mt-6 max-w-2xl text-base font-light leading-relaxed text-muted-foreground sm:text-lg">
              Reliable sports science, practical nutrition data, and objective movement feedback are
              often buried behind jargon or fragmented across dozens of feeds. Auctus Performance
              brings verified nutrition reference data, structured drill libraries, focused
              research, and AI video analysis into one clear workspace.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild variant="hero" size="xl" className="min-h-12 w-full sm:w-auto">
                <Link to="/pricing">
                  Explore Memberships <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="glass" size="xl" className="min-h-12 w-full sm:w-auto">
                <Link to="/contact">Contact &amp; Support</Link>
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <AthleticImage
              src={SITE_MEDIA.trainingGym.src}
              alt={SITE_MEDIA.trainingGym.alt}
              width={SITE_MEDIA.trainingGym.width}
              height={SITE_MEDIA.trainingGym.height}
              decoding="async"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Research-Backed Methodology */}
      <section
        id="about-methodology"
        className="mt-10 scroll-mt-24 rounded-3xl border border-border/60 bg-surface/40 px-6 py-12 sm:px-8 sm:py-16"
      >
        <div>
          <div className="max-w-2xl">
            <p className="eyebrow">Methodology</p>
            <h2 className="text-display mt-4 text-3xl sm:text-4xl md:text-5xl">
              Built on mechanics, verified data, and consistency.
            </h2>
            <p className="mt-4 text-sm font-light leading-relaxed text-muted-foreground sm:text-base">
              Four practical standards shape every drill in the Training Library, our verified
              nutrient reference, and our AI technique breakdown framework.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {METHODOLOGY.map((item) => (
              <article
                key={item.number}
                className="rounded-2xl border border-border bg-surface p-7 sm:p-8"
              >
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand-amber tabular-nums">
                  {item.number}.
                </p>
                <h3 className="text-display mt-3 text-2xl text-foreground">{item.title}</h3>
                <p className="mt-3 text-sm font-light leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Architecture Overview (Zero Fabricated Bios) */}
      <section id="about-architecture" className="scroll-mt-24 pt-14 sm:pt-20">
        <div className="grid items-start gap-12 lg:grid-cols-[0.9fr_1.3fr]">
          <div className="rounded-2xl border border-border bg-surface p-7">
            <p className="eyebrow text-brand-orange">Platform Architecture</p>
            <h2 className="text-display mt-3 text-3xl text-foreground">
              What is inside Auctus Performance
            </h2>
            <p className="mt-3 text-sm font-light leading-relaxed text-muted-foreground">
              Every hub is structured so you can inspect the reasoning behind a movement or nutrient
              and apply it in the gym the same day.
            </p>
            <ForceCurveAccent className="mt-6 w-full text-foreground" />
          </div>

          <div className="divide-y divide-border/70 rounded-2xl border border-border bg-surface px-6 sm:px-8">
            {PLATFORM_PILLARS.map((pillar, idx) => (
              <Link
                key={pillar.title}
                to={pillar.to}
                className="group flex flex-col justify-between gap-2 py-6 transition-colors sm:flex-row sm:items-center sm:gap-6"
              >
                <div>
                  <span className="font-mono text-xs text-brand-amber tabular-nums">
                    0{idx + 1}.
                  </span>
                  <h3 className="text-display mt-1 text-xl text-foreground group-hover:text-brand-amber">
                    {pillar.title}
                  </h3>
                  <p className="mt-1.5 text-sm font-light text-muted-foreground">{pillar.detail}</p>
                </div>
                <span className="shrink-0 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground group-hover:text-brand-amber">
                  Open →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PageWithOutline>
  );
}
