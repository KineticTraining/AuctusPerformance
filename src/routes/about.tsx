import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SITE_MEDIA } from "@/lib/media";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Dusk Kinetic Performance" },
      {
        name: "description",
        content:
          "Dusk Kinetic Performance bridges the gap between elite sports science, nutrition, and accessible coaching.",
      },
      { property: "og:title", content: "About — Dusk Kinetic Performance" },
      {
        property: "og:description",
        content:
          "Research-backed methodology, practitioner coaching bios, and our mission to make pro-caliber training accessible.",
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
    body: "Adding weight or sprinting fatigue over faulty mechanics only reinforces compensations. Every progression starts with joint stacking, ground contact stiffness, and clean movement patterns.",
  },
  {
    number: "02",
    title: "Evidence translated to Monday morning",
    body: "Peer-reviewed research only helps when you know sets, reps, rest intervals, and exercise selection. Our practitioners convert lab data into clear, repeatable court and weight-room blocks.",
  },
  {
    number: "03",
    title: "Tendon resilience & smart load progression",
    body: "Soft-tissue availability decides seasons. Eccentric hamstring work, hip capsule mobility, and session-RPE workload guardrails are baked into every weekly schedule.",
  },
  {
    number: "04",
    title: "Objective film review every week",
    body: "Feel rarely matches reality at game speed. Comparing your actual rep footage against structured mechanical cues eliminates guesswork between in-person sessions.",
  },
];

const COACH_TEAM = [
  {
    name: "Coach Daniel Reyes, CSCS",
    role: "Head Coach & Performance Director",
    credentials: "Collegiate S&C · Sprint & Force-Plate Coaching",
    bio: "Led strength, speed, and return-to-court programming for collegiate basketball and track programs before founding Dusk Kinetic to make structured mechanical coaching accessible.",
  },
  {
    name: "Dr. Maya Okafor, PhD",
    role: "Lead Sports Physiologist",
    credentials: "PhD Exercise Physiology · Workload & Recovery Research",
    bio: "Directs Dusk Kinetic's research curriculum across sleep architecture, eccentric injury prevention, and neuromuscular fatigue monitoring so athletes peak when competition matters.",
  },
  {
    name: "Priya Shah, RD, CSSD",
    role: "Performance Dietitian",
    credentials: "Board-Certified Specialist in Sports Dietetics",
    bio: "Builds practical carbohydrate periodization, hydration, and match-day fueling protocols designed around school, full-time work, and multi-game tournament schedules.",
  },
  {
    name: "Dr. Lena Brooks, PsyD",
    role: "Applied Sport Psychologist",
    credentials: "CMPC · Motor Imagery & Clutch Execution",
    bio: "Designs PETTLEP visualization sequences, pre-shot reset routines, and pressure-regulation frameworks used by sprinters, shooters, and club competitors.",
  },
];

function AboutPage() {
  return (
    <div>
      {/* Mission Hero */}
      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <span className="block h-[3px] w-16 bg-tricolor" aria-hidden="true" />
        <p className="eyebrow mt-6 text-brand-amber">About Dusk Kinetic Performance</p>
        <div className="mt-4 grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <h1 className="text-display text-5xl md:text-7xl">
              Bridging elite sports science and accessible coaching.
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-light leading-relaxed text-muted-foreground">
              Pro clubs and funded collegiate programs employ biomechanists, strength coaches,
              dietitians, and film analysts under one roof. Everyday athletes get scattered clips.
              Dusk Kinetic closes that gap with structured training, nutrition protocols, and fast,
              objective video feedback anyone can afford.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="xl" className="min-h-12">
                <Link to="/pricing">
                  Explore memberships <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="glass" size="xl" className="min-h-12">
                <Link to="/contact">Book a call</Link>
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <img
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
      <section className="border-y border-border/60 bg-surface/40">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-24">
          <div className="max-w-2xl">
            <p className="eyebrow">Methodology</p>
            <h2 className="text-display mt-4 text-4xl md:text-5xl">
              Research-backed training with zero guesswork.
            </h2>
            <p className="mt-4 text-base font-light text-muted-foreground">
              Four core principles govern every drill in the Training Library and every breakdown
              returned by our AI technique review engine.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {METHODOLOGY.map((item) => (
              <article
                key={item.number}
                className="rounded-2xl border border-border bg-surface p-8"
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

      {/* Coach Bio & Lab Team */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.3fr]">
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <img
              src={SITE_MEDIA.coachLab.src}
              alt={SITE_MEDIA.coachLab.alt}
              width={SITE_MEDIA.coachLab.width}
              height={SITE_MEDIA.coachLab.height}
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="border-t border-border p-6">
              <p className="eyebrow text-brand-red">Kinetic Coaching Staff</p>
              <p className="mt-2 text-base font-normal text-foreground">
                Practitioners across strength, sprint mechanics, physiology, nutrition, and sport
                psychology.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {COACH_TEAM.map((coach) => (
              <article
                key={coach.name}
                className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-6"
              >
                <div>
                  <p className="eyebrow text-brand-orange">{coach.role}</p>
                  <h3 className="text-display mt-2 text-2xl text-foreground">{coach.name}</h3>
                  <p className="mt-1 text-xs font-medium text-foreground/80">{coach.credentials}</p>
                  <p className="mt-3 text-sm font-light leading-relaxed text-muted-foreground">
                    {coach.bio}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
