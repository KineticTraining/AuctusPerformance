import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpenText, Check, PlayCircle, ScanEye } from "lucide-react";

import { Button } from "@/components/ui/button";
import heroImg from "@/assets/photos/basketball-arena-hero.jpg.asset.json";
import trainingCourtImg from "@/assets/photos/indoor-training-court.jpg.asset.json";
import gameCourtImg from "@/assets/photos/basketball-game-court.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kinetic — Train Smarter. Move Faster." },
      {
        name: "description",
        content:
          "Join Kinetic: a training membership with coach-led video library, sports science articles and AI technique review of your own footage.",
      },
      { property: "og:title", content: "Kinetic — Train Smarter. Move Faster." },
      {
        property: "og:description",
        content: "Coach-led video library, sports science and AI technique review for serious athletes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const sports = ["Basketball", "Sprinting", "Soccer", "Tennis", "Swimming", "Strength", "Football", "Volleyball"];

const pillars = [
  {
    icon: PlayCircle,
    title: "Video Library",
    body: "Strength, speed, mobility, sport skills and mindset — organized into training sections you can follow session by session.",
  },
  {
    icon: BookOpenText,
    title: "Sports Science",
    body: "Plain-language breakdowns of the research on sleep, load, power and recovery, written by practitioners.",
  },
  {
    icon: ScanEye,
    title: "AI Technique Review",
    body: "Submit a video link and notes. Our AI watches your rep and compares it to a database of coaching cues and common faults.",
  },
];

const pillarTone = ["bg-brand-red text-foreground", "bg-foreground text-background", "bg-brand-blue text-foreground"];

function Landing() {
  return (
    <div>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImg.url}
          alt="Basketball player standing on an indoor arena court under the lights"
          width={2400}
          height={1600}
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[60%_30%] saturate-[1.15]"
        />
        <div className="absolute inset-0 -z-10 bg-fade-left" />
        <div className="absolute inset-0 -z-10 bg-fade-up" />
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col justify-end px-5 pb-20 pt-32 md:px-8 md:pb-28">
          <span className="block h-[3px] w-16 animate-rise bg-tricolor" aria-hidden="true" />
          <p className="eyebrow mt-6 animate-rise text-foreground/80">Sports training membership</p>
          <h1 className="text-display mt-5 max-w-4xl animate-rise text-6xl font-extralight [animation-delay:80ms] sm:text-7xl md:text-8xl lg:text-[7.5rem]">
            Train smarter.
            <br />
            <span className="text-foreground/55">Move faster.</span>
          </h1>
          <p className="mt-8 max-w-xl animate-rise text-lg font-light text-foreground/75 [animation-delay:160ms]">
            Coach-built programs, the science behind them, and AI feedback on your own technique — all in one membership.
          </p>
          <div className="mt-10 flex animate-rise flex-wrap gap-3 [animation-delay:240ms]">
            <Button asChild variant="hero" size="xl">
              <Link to="/auth" search={{ mode: "signup" }}>
                Start training <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="glass" size="xl">
              <Link to="/articles">Read the science</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="overflow-hidden border-y border-border/60 bg-surface py-5">
        <div className="flex w-max animate-marquee gap-12">
          {[...sports, ...sports].map((s, i) => (
            <span key={i} className="eyebrow flex items-center gap-12 text-sm text-muted-foreground">
              {s} <span className={`size-1.5 rounded-full ${i % 2 ? "bg-brand-blue" : "bg-brand-red"}`} />
            </span>
          ))}
        </div>
      </div>

      {/* MISSION */}
      <section className="relative bg-grid">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 md:grid-cols-[1fr_1.2fr] md:px-8 md:py-32">
          <div>
            <p className="eyebrow">Our mission</p>
            <h2 className="text-display mt-4 text-5xl md:text-6xl">
              Elite coaching shouldn't be reserved for the elite.
            </h2>
          </div>
          <div className="space-y-6 text-lg font-light leading-relaxed text-muted-foreground">
            <p>
              Most athletes train hard. Far fewer train with a plan grounded in evidence, or get honest feedback on how they actually move.
            </p>
            <p>
              Kinetic brings together the coaching content, the sports science and the technique review that used to require a pro
              program — so a high-school sprinter, a weekend tennis player and a college hooper can all train with intent.
            </p>
            <ul className="grid gap-3 pt-2 text-base text-foreground sm:grid-cols-2">
              {["Evidence before trends", "Technique before load", "Feedback every week", "Built for every level"].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="grid size-6 place-items-center rounded-full border border-brand-blue/50 text-brand-blue">
                    <Check className="size-3.5" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="mx-auto max-w-7xl px-5 pb-24 md:px-8 md:pb-32">
        <div className="grid gap-5 md:grid-cols-3">
          {pillars.map(({ icon: Icon, title, body }, i) => (
            <article
              key={title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-8 transition-colors hover:border-foreground/30"
            >
              <span className="absolute right-6 top-6 font-mono text-xs text-muted-foreground">0{i + 1}</span>
              <span className={`grid size-12 place-items-center rounded-md ${pillarTone[i]}`}>
                <Icon className="size-6" />
              </span>
              <h3 className="text-display mt-8 text-2xl">{title}</h3>
              <p className="mt-3 font-light text-muted-foreground">{body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* AI REVIEW */}
      <section className="border-y border-border/60 bg-surface">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-24 md:grid-cols-2 md:px-8">
          <div className="relative overflow-hidden rounded-2xl border border-border">
            <img
              src={trainingCourtImg.url}
              alt="Two players running a dribbling drill in an indoor training gym"
              width={1800}
              height={1390}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover saturate-[1.15]"
            />
            <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-border bg-background/80 p-4 backdrop-blur-md">
              <p className="eyebrow">Sample feedback · Jump shot</p>
              <p className="mt-2 text-sm font-light">
                “Your elbow flares out on the lift and you release on the way down. Keep the elbow under the ball and let it go at the top — try 50 one-hand form shots.”
              </p>
            </div>
          </div>
          <div>
            <p className="eyebrow">How video review works</p>
            <h2 className="text-display mt-4 text-5xl md:text-6xl">Your rep, measured against the cues that matter.</h2>
            <ol className="mt-10 space-y-6">
              {[
                ["Share a link", "Paste a YouTube link to your rep and pick the technique you're working on."],
                ["Add context", "Tell us what you feel, what your coach says, and what you want fixed."],
                ["Get your breakdown", "AI watches the clip against our technique database and returns strengths, faults, cues and drills."],
              ].map(([t, b], i) => (
                <li key={t} className="flex gap-5">
                  <span className="pt-1 font-mono text-sm text-brand-blue">0{i + 1}</span>
                  <div>
                    <h3 className="text-lg font-normal tracking-tight">{t}</h3>
                    <p className="mt-1 font-light text-muted-foreground">{b}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
        <div className="relative isolate overflow-hidden rounded-3xl border border-border p-10 md:p-16">
          <img
            src={gameCourtImg.url}
            alt=""
            width={2000}
            height={1334}
            loading="lazy"
            className="absolute inset-0 -z-20 h-full w-full object-cover saturate-[1.15]"
          />
          <div className="absolute inset-0 -z-10 bg-tint" />
          <div className="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="block h-[3px] w-16 bg-tricolor" aria-hidden="true" />
              <h2 className="text-display mt-6 max-w-2xl text-5xl font-extralight md:text-7xl">Your next PR starts with the next rep.</h2>
            </div>
            <Button asChild size="xl" variant="hero">
              <Link to="/auth" search={{ mode: "signup" }}>
                Become a member <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
