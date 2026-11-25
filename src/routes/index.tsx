import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpenText,
  HeartPulse,
  PlayCircle,
  UploadCloud,
  Utensils,
} from "lucide-react";

import { AthleticImage } from "@/components/site/athletic-image";
import { StrideVectorDivider } from "@/components/site/biomechanical-curves";
import { PageWithOutline, type OutlineSection } from "@/components/site/page-outline";
import { FaqSection } from "@/components/site/social-proof-faq";
import { WorkingOnCard } from "@/components/site/working-on-card";
import { Button } from "@/components/ui/button";
import { SITE_MEDIA } from "@/lib/media";

const HOME_OUTLINE: OutlineSection[] = [
  { id: "hero", label: "Overview" },
  { id: "platform", label: "Five Hubs" },
  { id: "working-on", label: "Current Focus" },
  { id: "ai-video", label: "AI Video" },
  { id: "faq", label: "Quick Answers" },
  { id: "get-started", label: "Get Started" },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Auctus Performance — Sports Science, Nutrition & Athletic Coaching" },
      {
        name: "description",
        content:
          "Understand the science behind athletics and health—without wasting time. Training progressions, verified nutrition data, research, and AI video cues.",
      },
      { property: "og:title", content: "Auctus Performance" },
      {
        property: "og:description",
        content: "Understand the science behind athletics and health—without wasting time.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const PRIMARY_HUBS = [
  {
    index: "01",
    icon: PlayCircle,
    title: "Training",
    body: "400+ exercises, muscle filters & workout builder.",
    to: "/training" as const,
    cta: "Open Training",
    gradientClass:
      "border-amber-400/35 bg-gradient-to-br from-[#9A3412] via-[#C2410C]/90 to-[#E11D48]/85",
  },
  {
    index: "02",
    icon: HeartPulse,
    title: "Recovery",
    body: "Sleep, tendon load & readiness protocols.",
    to: "/articles" as const,
    cta: "Read Recovery",
    gradientClass:
      "border-indigo-400/35 bg-gradient-to-br from-[#312E81] via-[#4F46E5]/85 to-[#7C3AED]/80",
  },
];

const SECONDARY_HUBS = [
  {
    index: "03",
    icon: Utensils,
    title: "Nutrition",
    body: "26 essential nutrients & priority tiers.",
    to: "/nutrition" as const,
    cta: "Open Nutrition",
    gradientClass:
      "border-emerald-400/35 bg-gradient-to-br from-[#064E3B] via-[#059669]/85 to-[#0D9488]/85",
  },
  {
    index: "04",
    icon: BookOpenText,
    title: "Latest Science",
    body: "Sports research with filters & reader ratings.",
    to: "/articles" as const,
    cta: "Browse Science",
    gradientClass:
      "border-rose-400/35 bg-gradient-to-br from-[#831843] via-[#BE185D]/85 to-[#E11D48]/80",
  },
  {
    index: "05",
    icon: UploadCloud,
    title: "AI Video",
    body: "Upload a clip or URL for mechanical cues.",
    to: "/submit" as const,
    cta: "Try AI Video",
    gradientClass:
      "border-amber-300/35 bg-gradient-to-br from-[#1E3A8A] via-[#4338CA]/85 to-[#D97706]/85",
  },
];

function Landing() {
  return (
    <PageWithOutline sections={HOME_OUTLINE} title="Home">
      {/* HERO */}
      <section
        id="hero"
        className="scroll-mt-24 relative isolate overflow-hidden rounded-2xl border border-border/60 sm:rounded-3xl"
      >
        <AthleticImage
          src={SITE_MEDIA.heroCourt.src}
          alt={SITE_MEDIA.heroCourt.alt}
          width={SITE_MEDIA.heroCourt.width}
          height={SITE_MEDIA.heroCourt.height}
          decoding="async"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center brightness-90 saturate-[1.08]"
        />
        <div className="absolute inset-0 -z-10 bg-fade-left" />
        <div className="absolute inset-0 -z-10 bg-fade-up" />

        <div className="flex min-h-[calc(100svh-8rem)] items-end px-6 pb-14 pt-20 sm:px-10 sm:pb-20 sm:pt-24 lg:pb-24">
          <div className="min-w-0 max-w-3xl">
            <span className="block h-[3px] w-16 animate-rise bg-tricolor" aria-hidden="true" />
            <p className="eyebrow mt-6 animate-rise text-brand-amber">Auctus Performance</p>
            <h1 className="text-display mt-4 animate-rise text-4xl [animation-delay:80ms] sm:text-6xl lg:text-7xl">
              Understand the science behind athletics and health
              <span className="text-sunset">—without wasting time.</span>
            </h1>
            <p className="mt-5 max-w-xl animate-rise text-base font-light text-foreground/85 [animation-delay:160ms] sm:text-lg">
              Exercises, verified nutrition, sports science, and AI video cues.
            </p>
            <div className="mt-8 flex animate-rise flex-col gap-3.5 [animation-delay:240ms] sm:flex-row sm:flex-wrap">
              <Button asChild variant="hero" size="xl" className="min-h-12 w-full sm:w-auto">
                <Link to="/training">
                  Explore Training <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="glass" size="xl" className="min-h-12 w-full sm:w-auto">
                <Link to="/submit">Try Video Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CORE HUBS — COLORFUL GRADIENT FEATURE BOXES */}
      <section id="platform" className="scroll-mt-24 py-14 sm:py-20">
        <div className="max-w-xl">
          <p className="eyebrow text-brand-amber">Platform</p>
          <h2 className="text-display mt-2.5 text-3xl sm:text-4xl md:text-5xl">
            Five hubs. Zero clutter.
          </h2>
        </div>

        {/* Row 1: Primary 2-Column Gradient Hubs */}
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {PRIMARY_HUBS.map(({ index, icon: Icon, title, body, to, cta, gradientClass }) => (
            <Link
              key={title}
              to={to}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-8 text-white transition-transform duration-200 hover:-translate-y-0.5 sm:p-10 ${gradientClass}`}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/10"
              />
              <div className="relative">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-xs uppercase tracking-[0.18em] text-white/80 tabular-nums">
                    {index}.
                  </span>
                  <Icon className="size-5 text-white/90" aria-hidden="true" />
                </div>
                <h3 className="text-display mt-6 text-2xl text-white sm:text-3xl">{title}</h3>
                <p className="mt-2.5 max-w-md text-sm font-normal text-white/90 sm:text-base">
                  {body}
                </p>
              </div>
              <p className="relative mt-8 font-mono text-xs uppercase tracking-[0.14em] text-white group-hover:underline">
                {cta} →
              </p>
            </Link>
          ))}
        </div>

        {/* Row 2: 3-Column Gradient Hubs */}
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {SECONDARY_HUBS.map(({ index, icon: Icon, title, body, to, cta, gradientClass }) => (
            <Link
              key={title}
              to={to}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-7 text-white transition-transform duration-200 hover:-translate-y-0.5 sm:p-8 ${gradientClass}`}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/10"
              />
              <div className="relative">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-xs uppercase tracking-[0.18em] text-white/80 tabular-nums">
                    {index}.
                  </span>
                  <Icon className="size-4 text-white/90" aria-hidden="true" />
                </div>
                <h3 className="text-display mt-5 text-xl text-white sm:text-2xl">{title}</h3>
                <p className="mt-2 text-sm font-normal text-white/90">{body}</p>
              </div>
              <p className="relative mt-7 font-mono text-xs uppercase tracking-[0.14em] text-white group-hover:underline">
                {cta} →
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section id="working-on" className="scroll-mt-24 pb-14 sm:pb-20">
        <WorkingOnCard />
      </section>

      <StrideVectorDivider className="w-full text-foreground" />

      {/* AI VIDEO WORKFLOW */}
      <section id="ai-video" className="scroll-mt-24 py-14 sm:py-20">
        <div className="grid items-stretch gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <AthleticImage
              src={SITE_MEDIA.trainingGym.src}
              alt={SITE_MEDIA.trainingGym.alt}
              width={SITE_MEDIA.trainingGym.width}
              height={SITE_MEDIA.trainingGym.height}
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full object-cover saturate-[1.08] lg:h-full"
            />
          </div>
          <div className="flex flex-col justify-center">
            <p className="eyebrow text-brand-orange">AI Video</p>
            <h2 className="text-display mt-2.5 text-3xl sm:text-4xl md:text-5xl">
              Film a rep. Get clear cues.
            </h2>
            <ol className="mt-7 space-y-5">
              {[
                ["Upload clip or YouTube link", "MP4, MOV, WebM, or public video URL."],
                ["Add exercise notes", "Tag the movement and what felt off."],
                ["Review drills & fixes", "Strengths, form adjustments, and corrective drills."],
              ].map(([t, b], i) => (
                <li key={t} className="flex gap-4">
                  <span className="pt-0.5 font-mono text-sm text-brand-amber tabular-nums">
                    0{i + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-medium tracking-tight text-foreground sm:text-lg">
                      {t}
                    </h3>
                    <p className="mt-1 text-sm font-light text-muted-foreground">{b}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-8">
              <Button asChild variant="hero" size="lg" className="min-h-12 w-full sm:w-auto">
                <Link to="/submit">
                  Open AI Video <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE FAQ */}
      <FaqSection id="faq" />

      {/* BOTTOM CTA */}
      <section id="get-started" className="scroll-mt-24 pt-14 sm:pt-20">
        <div className="relative isolate overflow-hidden rounded-3xl border border-border p-8 sm:p-12 md:p-16">
          <AthleticImage
            src={SITE_MEDIA.arenaCta.src}
            alt={SITE_MEDIA.arenaCta.alt}
            width={SITE_MEDIA.arenaCta.width}
            height={SITE_MEDIA.arenaCta.height}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 -z-20 h-full w-full object-cover brightness-85 saturate-[1.08]"
          />
          <div className="absolute inset-0 -z-10 bg-tint" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-8">
            <div>
              <span className="block h-[3px] w-16 bg-tricolor" aria-hidden="true" />
              <h2 className="text-display mt-5 max-w-xl text-3xl sm:text-4xl md:text-5xl">
                Train with clearer feedback.
              </h2>
            </div>
            <Button asChild size="xl" variant="hero" className="min-h-12 w-full shrink-0 sm:w-auto">
              <Link to="/auth" search={{ mode: "signup" }}>
                Create Account <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </PageWithOutline>
  );
}
