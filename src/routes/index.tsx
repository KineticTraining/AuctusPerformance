import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpenText, PlayCircle, UploadCloud, Utensils } from "lucide-react";

import { FaqSection } from "@/components/site/social-proof-faq";
import { Button } from "@/components/ui/button";
import { SITE_MEDIA } from "@/lib/media";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dusk Kinetic Performance — Train Smarter. Move Faster." },
      {
        name: "description",
        content:
          "Dusk Kinetic Performance: structured training progressions, clear athlete nutrition guides, latest sports science, and AI video technique analysis.",
      },
      { property: "og:title", content: "Dusk Kinetic Performance — Train Smarter. Move Faster." },
      {
        property: "og:description",
        content:
          "Coach-led training, performance nutrition, latest science, and AI video analysis for athletes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const pillars = [
  {
    icon: PlayCircle,
    title: "Training Library",
    body: "Strength, speed, mobility, and sport-skill progressions filterable by age group, level, and sport.",
    to: "/dashboard" as const,
    cta: "Open library",
  },
  {
    icon: Utensils,
    title: "Nutrition Guide",
    body: "Clean age-filtered breakdown of macronutrients, vitamins, and minerals with quick summaries and biochemical depth.",
    to: "/nutrition" as const,
    cta: "Explore nutrients",
  },
  {
    icon: BookOpenText,
    title: "Latest Science",
    body: "Sports science articles, peer-reviewed citations, and practical coach takeaways.",
    to: "/articles" as const,
    cta: "Read Latest Science",
  },
  {
    icon: UploadCloud,
    title: "AI Video Analysis",
    body: "Upload a rep clip or paste a link in a dedicated workspace for cue-based technique feedback.",
    to: "/submit" as const,
    cta: "Analyze a clip",
  },
];

const pillarTone = [
  "bg-brand-amber text-background",
  "bg-brand-orange text-background",
  "bg-brand-coral text-background",
  "bg-brand-indigo text-foreground",
];

function Landing() {
  return (
    <div>
      {/* HERO */}
      <section className="relative isolate overflow-hidden border-b border-border/60">
        <img
          src={SITE_MEDIA.heroCourt.src}
          alt={SITE_MEDIA.heroCourt.alt}
          width={SITE_MEDIA.heroCourt.width}
          height={SITE_MEDIA.heroCourt.height}
          decoding="async"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center brightness-90 saturate-[1.08]"
        />
        <div className="absolute inset-0 -z-10 bg-fade-left" />
        <div className="absolute inset-0 -z-10 bg-fade-up" />
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl flex-col justify-end px-5 pb-20 pt-28 md:px-8 md:pb-24">
          <span className="block h-[3px] w-16 animate-rise bg-tricolor" aria-hidden="true" />
          <p className="eyebrow mt-6 animate-rise text-brand-amber">Dusk Kinetic Performance</p>
          <h1 className="text-display mt-4 max-w-4xl animate-rise text-5xl [animation-delay:80ms] sm:text-7xl md:text-8xl">
            Train smarter.
            <br />
            <span className="text-sunset">Move faster at dusk.</span>
          </h1>
          <p className="mt-6 max-w-xl animate-rise text-lg font-light text-foreground/85 [animation-delay:160ms]">
            Structured training progressions, clear nutrition science, and fast video technique
            analysis — designed to stay simple from day one.
          </p>
          <div className="mt-9 flex animate-rise flex-wrap gap-3 [animation-delay:240ms]">
            <Button asChild variant="hero" size="xl" className="min-h-12">
              <Link to="/auth" search={{ mode: "signup" }}>
                Start training <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="glass" size="xl" className="min-h-12">
              <Link to="/nutrition">Explore Nutrition Guide</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CORE PILLARS */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-24">
        <div className="max-w-2xl">
          <p className="eyebrow text-brand-amber">Platform Overview</p>
          <h2 className="text-display mt-3 text-4xl md:text-5xl">
            Four focused tools. Zero clutter.
          </h2>
          <p className="mt-3 text-base font-light text-muted-foreground">
            Start with foundational drills, check what your body needs at your age, read the latest
            research, or upload a clip for technique feedback.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {pillars.map(({ icon: Icon, title, body, to, cta }, i) => (
            <Link
              key={title}
              to={to}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface p-7 transition-colors hover:border-brand-amber/50"
            >
              <div>
                <span className="absolute right-6 top-6 font-mono text-xs text-muted-foreground tabular-nums">
                  0{i + 1}
                </span>
                <span className={`grid size-11 place-items-center rounded-md ${pillarTone[i]}`}>
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="text-display mt-7 text-2xl">{title}</h3>
                <p className="mt-3 text-sm font-light leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </div>
              <p className="mt-6 font-mono text-xs uppercase tracking-[0.14em] text-brand-amber group-hover:underline">
                {cta} →
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* AI VIDEO UPLOAD & ANALYSIS WORKFLOW */}
      <section className="border-y border-border/60 bg-surface">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:grid-cols-2 md:px-8 md:py-24">
          <div className="overflow-hidden rounded-2xl border border-border bg-background">
            <img
              src={SITE_MEDIA.trainingGym.src}
              alt={SITE_MEDIA.trainingGym.alt}
              width={SITE_MEDIA.trainingGym.width}
              height={SITE_MEDIA.trainingGym.height}
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full object-cover saturate-[1.06]"
            />
          </div>
          <div>
            <p className="eyebrow text-brand-orange">Dedicated AI Video Workspace</p>
            <h2 className="text-display mt-4 text-4xl md:text-5xl">
              Upload your clip. Get clear technique cues.
            </h2>
            <ol className="mt-8 space-y-6">
              {[
                [
                  "Upload a clip or paste a link",
                  "Select a training video directly from your device or paste a YouTube URL in the AI Video tab.",
                ],
                [
                  "Choose your target skill & notes",
                  "Tag the movement you are practicing and add quick notes on timing, balance, or fatigue.",
                ],
                [
                  "Review strengths & corrective drills",
                  "Receive structured feedback aligned with our technique cues and recommended next-session drills.",
                ],
              ].map(([t, b], i) => (
                <li key={t} className="flex gap-5">
                  <span className="pt-1 font-mono text-sm text-brand-amber tabular-nums">
                    0{i + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-normal tracking-tight">{t}</h3>
                    <p className="mt-1 font-light text-muted-foreground">{b}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-8">
              <Button asChild variant="hero" size="lg" className="min-h-11">
                <Link to="/submit">
                  Open AI Video Analysis <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE FAQ */}
      <FaqSection />

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-24">
        <div className="relative isolate overflow-hidden rounded-3xl border border-border p-10 md:p-16">
          <img
            src={SITE_MEDIA.arenaCta.src}
            alt={SITE_MEDIA.arenaCta.alt}
            width={SITE_MEDIA.arenaCta.width}
            height={SITE_MEDIA.arenaCta.height}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 -z-20 h-full w-full object-cover brightness-75 saturate-[1.08]"
          />
          <div className="absolute inset-0 -z-10 bg-tint" />
          <div className="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="block h-[3px] w-16 bg-tricolor" aria-hidden="true" />
              <h2 className="text-display mt-6 max-w-2xl text-4xl font-light md:text-6xl">
                Ready to put consistent work in?
              </h2>
            </div>
            <Button asChild size="xl" variant="hero" className="min-h-12">
              <Link to="/auth" search={{ mode: "signup" }}>
                Create free account <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
