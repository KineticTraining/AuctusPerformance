import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowUpRight, Clock, Newspaper } from "lucide-react";
import { useMemo, useState } from "react";

import { MultiFilterBar } from "@/components/site/multi-filter-bar";
import { ArticlesSkeleton } from "@/components/site/page-skeletons";
import { SportFilter } from "@/components/site/sport-filter";
import { Button } from "@/components/ui/button";
import { articlesQuery } from "@/lib/articles.functions";
import { formatDate } from "@/lib/format";
import { SITE_MEDIA } from "@/lib/media";
import { newslettersQuery } from "@/lib/nutrition.functions";
import { ARTICLE_CATEGORIES, matchesAgeFilter, matchesExperienceFilter } from "@/lib/sports";

export const Route = createFileRoute("/articles/")({
  head: () => ({
    meta: [
      { title: "Latest Science — Dusk Kinetic Performance" },
      {
        name: "description",
        content:
          "The Dusk Dispatch: latest sports science research articles, training dispatches, primary citations, and coach data takeaways.",
      },
      { property: "og:title", content: "Latest Science — Dusk Kinetic Performance" },
      {
        property: "og:description",
        content: "Sports science publication and training dispatches for dedicated athletes.",
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

function ArticlesPage() {
  const { data: articles } = useSuspenseQuery(articlesQuery());
  const { data: newsletters } = useSuspenseQuery(newslettersQuery());

  const [cat, setCat] = useState("All");
  const [ageGroup, setAgeGroup] = useState("All");
  const [experienceLevel, setExperienceLevel] = useState("All");
  const [search, setSearch] = useState("");
  const [sportFilters, setSportFilters] = useState<string[]>([]);
  const [showAllArticles, setShowAllArticles] = useState(false);
  const [showAllDispatches, setShowAllDispatches] = useState(false);

  const featured = useMemo(() => articles.find((a) => a.featured) ?? articles[0], [articles]);
  const isFiltered =
    cat !== "All" ||
    ageGroup !== "All" ||
    experienceLevel !== "All" ||
    search.trim() !== "" ||
    sportFilters.length > 0;

  const queryLower = search.trim().toLowerCase();

  const matchedGridArticles = useMemo(() => {
    return articles.filter(
      (a) =>
        (cat === "All" || a.category === cat) &&
        matchesAgeFilter(a.age_groups, ageGroup) &&
        matchesExperienceFilter(a.experience_levels, experienceLevel) &&
        (sportFilters.length === 0 || a.sports.some((s) => sportFilters.includes(s))) &&
        (!queryLower ||
          a.title.toLowerCase().includes(queryLower) ||
          a.excerpt.toLowerCase().includes(queryLower) ||
          a.data_conclusion.toLowerCase().includes(queryLower) ||
          a.author.toLowerCase().includes(queryLower)) &&
        (isFiltered || a.slug !== featured?.slug),
    );
  }, [
    articles,
    cat,
    ageGroup,
    experienceLevel,
    sportFilters,
    queryLower,
    isFiltered,
    featured?.slug,
  ]);

  const visibleGridArticles = useMemo(
    () => (!isFiltered && !showAllArticles ? matchedGridArticles.slice(0, 2) : matchedGridArticles),
    [isFiltered, showAllArticles, matchedGridArticles],
  );
  const hiddenArticlesCount = matchedGridArticles.length - visibleGridArticles.length;

  const visibleNewsletters = useMemo(
    () => (showAllDispatches ? newsletters : newsletters.slice(0, 1)),
    [showAllDispatches, newsletters],
  );

  function resetAllFilters() {
    setCat("All");
    setAgeGroup("All");
    setExperienceLevel("All");
    setSearch("");
    setSportFilters([]);
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="block h-[3px] w-16 bg-tricolor" aria-hidden="true" />
          <p className="eyebrow mt-6 text-brand-amber">Dusk Dispatch · Editorial Publication</p>
          <h1 className="text-display mt-3 text-5xl sm:text-6xl md:text-7xl">Latest Science</h1>
          <p className="mt-4 max-w-2xl text-lg font-light text-muted-foreground">
            Peer-reviewed sports science, biomechanics updates, and practical takeaways — starting
            with our top reads and expanding when you apply filters.
          </p>
        </div>
        <Link
          to="/admin"
          className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground underline underline-offset-4 hover:text-brand-amber"
        >
          Manage in Admin Studio →
        </Link>
      </div>

      {/* FEATURED LEAD STORY */}
      {featured && !isFiltered && (
        <Link
          to="/articles/$slug"
          params={{ slug: featured.slug }}
          className="group mt-12 grid overflow-hidden rounded-3xl border border-border bg-surface transition-colors hover:border-brand-amber/50 md:grid-cols-[1.25fr_1fr]"
        >
          <div className="flex flex-col justify-between p-8 md:p-11">
            <div>
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-brand-amber">
                Lead Story · {featured.category}
              </p>
              <h2 className="text-display mt-4 text-3xl sm:text-4xl md:text-5xl">
                {featured.title}
              </h2>
              <p className="mt-4 text-base font-light leading-relaxed text-muted-foreground">
                {featured.excerpt}
              </p>
              <div className="mt-5 rounded-xl border border-border/80 bg-background/60 p-4">
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-brand-orange">
                  Data Conclusion Preview
                </p>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-foreground/90">
                  {featured.data_conclusion}
                </p>
              </div>
            </div>
            <Byline a={featured} />
          </div>

          <div className="relative min-h-64 overflow-hidden border-t border-border md:border-l md:border-t-0">
            <img
              src={SITE_MEDIA.coachLab.src}
              alt={SITE_MEDIA.coachLab.alt}
              width={SITE_MEDIA.coachLab.width}
              height={SITE_MEDIA.coachLab.height}
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-fade-up opacity-80" />
            <ArrowUpRight
              className="absolute bottom-6 right-6 size-12 stroke-1 text-brand-amber transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </div>
        </Link>
      )}

      {/* MULTI-CRITERIA FILTER + SPORT FILTER */}
      <div className="mt-12 space-y-6">
        <MultiFilterBar
          ageGroup={ageGroup}
          onAgeGroupChange={setAgeGroup}
          experienceLevel={experienceLevel}
          onExperienceLevelChange={setExperienceLevel}
          topic={cat}
          onTopicChange={setCat}
          topicLabel="Editorial Category"
          topics={ARTICLE_CATEGORIES}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search headlines, authors, or conclusions..."
          hasActiveFilters={isFiltered}
          onReset={resetAllFilters}
          resultCount={matchedGridArticles.length + (!isFiltered && featured ? 1 : 0)}
          totalCount={articles.length}
        />

        <SportFilter selected={sportFilters} onChange={setSportFilters} />
      </div>

      {/* ARTICLES EDITORIAL GRID (CALM STARTER STATE BY DEFAULT) */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {visibleGridArticles.length === 0 && (
          <p className="text-sm text-muted-foreground md:col-span-2">
            No articles match your combined filter criteria yet.
          </p>
        )}
        {visibleGridArticles.map((a) => (
          <Link
            key={a.slug}
            to="/articles/$slug"
            params={{ slug: a.slug }}
            className="group flex flex-col justify-between rounded-2xl border border-border bg-surface p-7 transition-colors hover:border-brand-amber/40"
          >
            <div>
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="eyebrow text-brand-amber">{a.category}</span>
                <span className="font-mono text-[0.64rem] uppercase tracking-[0.14em] text-muted-foreground">
                  {a.experience_levels.join(" / ")}
                </span>
              </div>
              <h3 className="text-display mt-4 text-2xl transition-colors group-hover:text-brand-amber">
                {a.title}
              </h3>
              <p className="mt-3 line-clamp-3 text-sm font-light leading-relaxed text-muted-foreground">
                {a.excerpt}
              </p>
            </div>
            <div>
              <p className="mt-4 text-xs text-muted-foreground">
                Ages: {a.age_groups.length === 4 ? "All groups" : a.age_groups.join(" · ")}
              </p>
              <Byline a={a} />
            </div>
          </Link>
        ))}
      </div>

      {!isFiltered && matchedGridArticles.length > 2 && (
        <div className="mt-8 flex items-center justify-between rounded-xl border border-border/70 bg-surface/60 px-5 py-3.5 text-sm">
          <p className="text-muted-foreground">
            {showAllArticles
              ? `Showing all ${articles.length} Latest Science articles.`
              : `Showing our starter overview (${hiddenArticlesCount} additional articles available).`}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAllArticles((prev) => !prev)}
          >
            {showAllArticles
              ? "Show starter view"
              : `Browse all science articles (${articles.length})`}
          </Button>
        </div>
      )}

      {/* NEWSLETTER DISPATCHES (CONCISE LATEST PREVIEW + ARCHIVE TOGGLE) */}
      <section className="mt-20 border-t border-border/70 pt-14">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow text-brand-orange">Newsletter Dispatches</p>
            <h2 className="text-display mt-3 text-3xl md:text-4xl">
              Weekly Lab Notes &amp; Briefs
            </h2>
          </div>
          {newsletters.length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAllDispatches((prev) => !prev)}
            >
              {showAllDispatches
                ? "Show latest only"
                : `Show dispatch archive (${newsletters.length})`}
            </Button>
          )}
        </div>

        <div className={showAllDispatches ? "mt-8 grid gap-6 md:grid-cols-3" : "mt-8"}>
          {visibleNewsletters.map((nl) => (
            <article
              key={nl.id}
              className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-7"
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

              <div className="mt-5 rounded-xl border border-border bg-background/60 p-3.5">
                <p className="font-mono text-[0.64rem] uppercase tracking-[0.14em] text-brand-orange">
                  Coach&apos;s Note
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {nl.coach_note}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function Byline({ a }: { a: { author: string; read_minutes: number; published_at: string } }) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
      <span className="font-medium text-foreground">{a.author}</span>
      <span>{formatDate(a.published_at)}</span>
      <span className="flex items-center gap-1 tabular-nums">
        <Clock className="size-3.5" aria-hidden="true" /> {a.read_minutes} min
      </span>
    </div>
  );
}
