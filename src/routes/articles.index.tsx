import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowUpRight, Clock, Info, MessageSquare, Newspaper, Star } from "lucide-react";
import { useMemo, useState } from "react";

import { PageWithOutline, type OutlineSection } from "@/components/site/page-outline";
import { ArticlesSkeleton } from "@/components/site/page-skeletons";
import { Button } from "@/components/ui/button";
import { articlesQuery, type ArticleSummary } from "@/lib/articles.functions";
import { formatDate } from "@/lib/format";
import { newslettersQuery } from "@/lib/nutrition.functions";
import {
  SCIENCE_SPORT_FILTERS,
  matchesScienceSportFilter,
  type ArticleCategory,
  type ScienceSportFilter,
} from "@/lib/sports";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/articles/")({
  head: () => ({
    meta: [
      { title: "Latest Science — Auctus Performance" },
      {
        name: "description",
        content:
          "Auctus Performance Latest Science: evidence-based articles organized into Training, Recovery, and Nutrition with sport-specific filters and reader ratings.",
      },
      { property: "og:title", content: "Latest Science — Auctus Performance" },
      {
        property: "og:description",
        content:
          "Sports science organized into Training, Recovery, and Nutrition for athletes and everyday health.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  pendingComponent: ArticlesSkeleton,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(articlesQuery()),
      context.queryClient.ensureQueryData(newslettersQuery()),
    ]);
  },
  component: ArticlesPage,
});

interface SectionVisualConfig {
  id: string;
  category: ArticleCategory;
  eyebrow: string;
  heading: string;
  description: string;
  supportsSportFilter: boolean;
  containerClass: string;
  accentTextClass: string;
  infoPanelClass: string;
  activeFilterClass: string;
  cardHoverClass: string;
}

const SECTION_CONFIGS: SectionVisualConfig[] = [
  {
    id: "training-science",
    category: "Training",
    eyebrow: "Section 01 · Output & Mechanics",
    heading: "Training",
    description:
      "Strength progression, sprint acceleration, plyometrics, and sport-specific mechanical cues backed by biomechanics research. Filter by sport below to narrow down drills and studies that fit your discipline.",
    supportsSportFilter: true,
    containerClass:
      "border-brand-amber/30 bg-gradient-to-b from-brand-amber/[0.06] via-brand-coral/[0.025] to-surface",
    accentTextClass: "text-brand-amber",
    infoPanelClass: "border-brand-amber/35 bg-background/70",
    activeFilterClass: "border-brand-amber bg-brand-amber text-background font-medium",
    cardHoverClass: "hover:border-brand-amber/50",
  },
  {
    id: "recovery-science",
    category: "Recovery",
    eyebrow: "Section 02 · Adaptation & Resilience",
    heading: "Recovery",
    description:
      "Sleep architecture, tendon load tolerance, neuromuscular readiness, and fatigue monitoring so heavy blocks turn into lasting gains. Apply sport filters when targeting tissue demands specific to your sport.",
    supportsSportFilter: true,
    containerClass:
      "border-brand-indigo/35 bg-gradient-to-b from-brand-indigo/[0.09] via-surface to-surface",
    accentTextClass: "text-brand-indigo",
    infoPanelClass: "border-brand-indigo/40 bg-background/70",
    activeFilterClass: "border-brand-indigo bg-brand-indigo text-foreground font-medium",
    cardHoverClass: "hover:border-brand-indigo/55",
  },
  {
    id: "nutrition-science",
    category: "Nutrition",
    eyebrow: "Section 03 · Fueling & Micronutrients",
    heading: "Nutrition",
    description:
      "Evidence-based fueling strategies, hydration balance, and micronutrient sufficiency explained clearly without fad claims. Pair these applied guides with our interactive Nutrition Reference for daily intake benchmarks.",
    supportsSportFilter: false,
    containerClass:
      "border-brand-orange/35 bg-gradient-to-b from-brand-orange/[0.07] via-brand-amber/[0.025] to-surface",
    accentTextClass: "text-brand-orange",
    infoPanelClass: "border-brand-orange/35 bg-background/70",
    activeFilterClass: "border-brand-orange bg-brand-orange text-background font-medium",
    cardHoverClass: "hover:border-brand-orange/50",
  },
];

function ArticlesPage() {
  const { data: articles } = useSuspenseQuery(articlesQuery());
  const { data: newsletters } = useSuspenseQuery(newslettersQuery());

  const [openInfo, setOpenInfo] = useState<Record<ArticleCategory, boolean>>({
    Training: false,
    Recovery: false,
    Nutrition: false,
  });

  const [sportFilters, setSportFilters] = useState<
    Record<"Training" | "Recovery", ScienceSportFilter | null>
  >({
    Training: null,
    Recovery: null,
  });

  const articlesByCategory = useMemo(() => {
    const grouped: Record<ArticleCategory, ArticleSummary[]> = {
      Training: [],
      Recovery: [],
      Nutrition: [],
    };
    for (const art of articles) {
      grouped[art.category].push(art);
    }
    return grouped;
  }, [articles]);

  function toggleSectionInfo(category: ArticleCategory) {
    setOpenInfo((prev) => ({ ...prev, [category]: !prev[category] }));
  }

  function toggleSportFilter(category: "Training" | "Recovery", sport: ScienceSportFilter) {
    setSportFilters((prev) => ({
      ...prev,
      [category]: prev[category] === sport ? null : sport,
    }));
  }

  const outlineSections: OutlineSection[] = useMemo(() => {
    const base: OutlineSection[] = [
      { id: "science-overview", label: "Overview" },
      {
        id: "training-science",
        label: "Training",
        accentTextClass: "text-brand-amber",
        accentDotClass: "bg-brand-amber",
        accentBarClass: "bg-brand-amber",
      },
      {
        id: "recovery-science",
        label: "Recovery",
        accentTextClass: "text-brand-indigo",
        accentDotClass: "bg-brand-indigo",
        accentBarClass: "bg-brand-indigo",
      },
      {
        id: "nutrition-science",
        label: "Nutrition",
        accentTextClass: "text-brand-orange",
        accentDotClass: "bg-brand-orange",
        accentBarClass: "bg-brand-orange",
      },
    ];
    if (newsletters.length > 0) {
      base.push({ id: "published-briefs", label: "Research Briefs" });
    }
    return base;
  }, [newsletters.length]);

  return (
    <PageWithOutline sections={outlineSections} title="Latest Science">
      <header
        id="science-overview"
        className="scroll-mt-24 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"
      >
        <div className="max-w-2xl">
          <span className="block h-[3px] w-16 bg-tricolor" aria-hidden="true" />
          <p className="eyebrow mt-5 text-brand-amber">Latest Science</p>
          <h1 className="text-display mt-2.5 text-4xl sm:text-5xl">Research built for training.</h1>
          <p className="mt-3 text-sm font-light text-muted-foreground sm:text-base">
            Training, Recovery, and Nutrition—organized and rated.
          </p>
        </div>

        <Link
          to="/admin"
          className="inline-flex min-h-11 shrink-0 items-center font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground underline underline-offset-4 hover:text-brand-amber"
        >
          Admin Studio →
        </Link>
      </header>

      {/* THREE COLOR-CODED SECTIONS IN EXACT ORDER: TRAINING, RECOVERY, NUTRITION */}
      <div className="mt-12 space-y-12 sm:mt-14 sm:space-y-14">
        {SECTION_CONFIGS.map((cfg) => {
          const allInCat = articlesByCategory[cfg.category];
          const activeSport =
            cfg.category === "Training" || cfg.category === "Recovery"
              ? sportFilters[cfg.category]
              : null;

          const visibleArticles =
            cfg.supportsSportFilter && activeSport
              ? allInCat.filter((art) => matchesScienceSportFilter(art.sports, activeSport))
              : allInCat;

          const infoOpen = openInfo[cfg.category];

          return (
            <section
              key={cfg.category}
              id={cfg.id}
              aria-labelledby={`heading-${cfg.id}`}
              className={cn(
                "scroll-mt-24 rounded-3xl border p-6 sm:p-8 md:p-10",
                cfg.containerClass,
              )}
            >
              {/* Section Header + Info Toggle */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className={cn("eyebrow", cfg.accentTextClass)}>{cfg.eyebrow}</p>
                  <div className="mt-2.5 flex items-center gap-3">
                    <h2
                      id={`heading-${cfg.id}`}
                      className="text-display text-3xl text-foreground sm:text-4xl"
                    >
                      {cfg.heading}
                    </h2>
                    <button
                      type="button"
                      aria-expanded={infoOpen}
                      aria-label={`About ${cfg.heading} section`}
                      onClick={() => toggleSectionInfo(cfg.category)}
                      className={cn(
                        "grid size-11 place-items-center rounded-full border border-border/80 bg-background/60 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:size-9",
                        infoOpen && cfg.accentTextClass,
                      )}
                    >
                      <Info className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <span className="font-mono text-xs text-muted-foreground tabular-nums">
                  {visibleArticles.length} {visibleArticles.length === 1 ? "article" : "articles"}
                </span>
              </div>

              {/* Expandable Section Explanation */}
              {infoOpen && (
                <div
                  className={cn(
                    "mt-5 rounded-xl border px-5 py-4 text-sm font-light leading-relaxed text-foreground/90",
                    cfg.infoPanelClass,
                  )}
                >
                  {cfg.description}
                </div>
              )}

              {/* Sport-Specific Filter Buttons (Training & Recovery only) */}
              {cfg.supportsSportFilter && (
                <div className="mt-6 border-t border-border/60 pt-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
                      Filter by sport
                    </p>
                    {activeSport && (
                      <button
                        type="button"
                        onClick={() =>
                          setSportFilters((prev) => ({
                            ...prev,
                            [cfg.category as "Training" | "Recovery"]: null,
                          }))
                        }
                        className="min-h-9 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground underline underline-offset-4 hover:text-foreground"
                      >
                        Clear filter
                      </button>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {SCIENCE_SPORT_FILTERS.map((sport) => {
                      const selected = activeSport === sport;
                      return (
                        <button
                          key={sport}
                          type="button"
                          aria-pressed={selected}
                          onClick={() =>
                            toggleSportFilter(cfg.category as "Training" | "Recovery", sport)
                          }
                          className={cn(
                            "min-h-11 rounded-lg border px-3.5 py-2 text-xs whitespace-nowrap transition-colors sm:min-h-9 sm:py-1.5",
                            selected
                              ? cfg.activeFilterClass
                              : "border-border/80 bg-background/50 text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {sport}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Articles Grid or Honest Empty State */}
              <div className="mt-8">
                {visibleArticles.length === 0 ? (
                  <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-border/70 bg-background/50 p-6 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {activeSport
                          ? `No ${cfg.heading} articles tagged for ${activeSport} yet.`
                          : `No ${cfg.heading} articles published yet.`}
                      </p>
                      <p className="mt-1 text-xs font-light text-muted-foreground">
                        {activeSport
                          ? "Clear the sport filter above or publish a new research post in Admin Studio."
                          : "Publish real, source-backed articles in Admin Studio to populate this section."}
                      </p>
                    </div>
                    {activeSport ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="min-h-11 shrink-0"
                        onClick={() =>
                          setSportFilters((prev) => ({
                            ...prev,
                            [cfg.category as "Training" | "Recovery"]: null,
                          }))
                        }
                      >
                        Show all {cfg.heading}
                      </Button>
                    ) : (
                      <Button asChild variant="outline" size="sm" className="min-h-11 shrink-0">
                        <Link to="/admin">Open Admin Studio</Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-5 md:grid-cols-2">
                    {visibleArticles.map((a) => (
                      <Link
                        key={a.slug}
                        to="/articles/$slug"
                        params={{ slug: a.slug }}
                        className={cn(
                          "group flex flex-col justify-between rounded-2xl border border-border/80 bg-background/65 p-6 transition-colors sm:p-7",
                          cfg.cardHoverClass,
                        )}
                      >
                        <div>
                          {/* Unboxed clean text metadata line */}
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className={cn("font-medium", cfg.accentTextClass)}>
                              {a.category}
                            </span>
                            {a.sports.length > 0 && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>{a.sports.slice(0, 2).join(" / ")}</span>
                              </>
                            )}
                            <span aria-hidden="true">·</span>
                            <span>{formatDate(a.published_at)}</span>
                          </div>

                          <div className="mt-3.5 flex items-start justify-between gap-3">
                            <h3 className="text-display text-xl text-foreground transition-colors group-hover:text-brand-amber sm:text-2xl">
                              {a.title}
                            </h3>
                            <ArrowUpRight
                              className="mt-1 size-5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-amber"
                              aria-hidden="true"
                            />
                          </div>

                          <p className="mt-3 line-clamp-3 text-sm font-light leading-relaxed text-muted-foreground">
                            {a.excerpt}
                          </p>
                        </div>

                        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4 text-xs text-muted-foreground">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="font-medium text-foreground">{a.author}</span>
                            <span className="inline-flex items-center gap-1 tabular-nums">
                              <Clock className="size-3.5" aria-hidden="true" /> {a.read_minutes} min
                            </span>
                          </div>

                          <div className="flex items-center gap-3 tabular-nums">
                            <span className="inline-flex items-center gap-1 text-foreground/90">
                              <Star
                                className={cn(
                                  "size-3.5",
                                  a.rating_count > 0
                                    ? "fill-brand-amber text-brand-amber"
                                    : "text-muted-foreground",
                                )}
                                aria-hidden="true"
                              />
                              {a.rating_count > 0
                                ? `${a.average_rating.toFixed(1)} (${a.rating_count})`
                                : "Rate"}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <MessageSquare className="size-3.5" aria-hidden="true" />
                              {a.comment_count}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* PUBLISHED DISPATCHES (RENDERED ONLY WHEN REAL ISSUES EXIST) */}
      {newsletters.length > 0 && (
        <section
          id="published-briefs"
          className="mt-16 scroll-mt-24 border-t border-border/70 pt-14"
        >
          <p className="eyebrow text-brand-orange">Research Briefs</p>
          <h2 className="text-display mt-3 text-3xl md:text-4xl">Published Briefs &amp; Notes</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {newsletters.map((nl) => (
              <article
                key={nl.id}
                className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-6 sm:p-7"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 font-mono text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5 text-brand-amber">
                      <Newspaper className="size-3.5" aria-hidden="true" />
                      Issue #{nl.issue_number}
                    </span>
                    <span>{formatDate(nl.published_at)}</span>
                  </div>
                  <h3 className="text-display mt-3 text-xl text-foreground">{nl.title}</h3>
                  <p className="mt-2.5 text-sm font-light leading-relaxed text-muted-foreground">
                    {nl.summary}
                  </p>
                  <ul className="mt-4 space-y-2 border-t border-border/70 pt-4 text-xs leading-relaxed text-foreground/85">
                    {nl.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2">
                        <span className="mt-1.5 size-1 shrink-0 rounded-full bg-brand-amber" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {nl.coach_note && (
                  <div className="mt-5 rounded-xl border border-border bg-background/60 p-4">
                    <p className="font-mono text-[0.64rem] uppercase tracking-[0.14em] text-brand-orange">
                      Takeaway Note
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {nl.coach_note}
                    </p>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </PageWithOutline>
  );
}
