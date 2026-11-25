import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, BookMarked, Clock, ExternalLink, FlaskConical } from "lucide-react";

import { ArticleFeedbackSection } from "@/components/articles/article-feedback";
import { PageWithOutline, type OutlineSection } from "@/components/site/page-outline";
import { Button } from "@/components/ui/button";
import { articleQuery } from "@/lib/articles.functions";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/articles/$slug")({
  loader: async ({ context, params }) => {
    const article = await context.queryClient.ensureQueryData(articleQuery(params.slug));
    if (!article) throw notFound();
    return { title: article.title, excerpt: article.excerpt };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — Auctus Performance` },
          { name: "description", content: loaderData.excerpt },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.excerpt },
          { property: "og:type", content: "article" },
          { name: "twitter:card", content: "summary" },
        ]
      : [
          { title: "Article unavailable — Auctus Performance" },
          { name: "robots", content: "noindex" },
        ],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-5 py-32 text-center">
      <h1 className="text-display text-5xl">Article not found</h1>
      <Button asChild variant="hero" className="mt-8">
        <Link to="/articles">All Latest Science</Link>
      </Button>
    </div>
  ),
  component: ArticlePage,
});

function ArticlePage() {
  const { slug } = Route.useParams();
  const { data: a } = useSuspenseQuery(articleQuery(slug));
  if (!a) return null;
  const blocks = a.body.split(/\n\s*\n/);

  const outlineSections: OutlineSection[] = [
    { id: "article-header", label: "Overview" },
    { id: "article-body", label: "Article" },
    ...(a.data_conclusion ? [{ id: "article-takeaway", label: "Key Takeaway" }] : []),
    ...(a.sources.length > 0 ? [{ id: "article-citations", label: "Citations" }] : []),
    { id: "article-discussion", label: "Ratings & Notes" },
  ];

  return (
    <PageWithOutline sections={outlineSections} title="Article">
      <article className="mx-auto max-w-3xl py-4 sm:py-8">
        <header id="article-header" className="scroll-mt-24">
          <Link
            to="/articles"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" /> All Latest Science
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground sm:mt-10">
            <span className="eyebrow text-brand-amber">{a.category}</span>
            {a.sports.length > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>{a.sports.join(" / ")}</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span className="font-mono uppercase tracking-[0.14em]">
              {a.experience_levels.join(" / ")}
            </span>
          </div>

          <h1 className="text-display mt-4 text-3xl sm:text-5xl md:text-6xl">{a.title}</h1>
          <p className="mt-6 text-lg font-light leading-relaxed text-muted-foreground sm:text-xl">
            {a.excerpt}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-border py-4 text-sm text-muted-foreground">
            <span>
              <span className="font-medium text-foreground">{a.author}</span>
              {a.author_role ? ` · ${a.author_role}` : ""}
            </span>
            <div className="flex flex-wrap items-center gap-5">
              <span>{formatDate(a.published_at)}</span>
              <span className="flex items-center gap-1 tabular-nums">
                <Clock className="size-4" aria-hidden="true" /> {a.read_minutes} min read
              </span>
            </div>
          </div>
        </header>

        <section
          id="article-body"
          className="mt-10 scroll-mt-24 space-y-6 text-base leading-7 text-foreground/90 sm:text-lg sm:leading-8"
        >
          {blocks.map((b, i) => {
            if (b.startsWith("## ")) {
              return (
                <h2 key={i} className="text-display pt-6 text-2xl text-foreground sm:text-3xl">
                  {b.slice(3)}
                </h2>
              );
            }
            const lines = b.split("\n");
            if (lines.every((l) => l.startsWith("- "))) {
              return (
                <ul key={i} className="space-y-3">
                  {lines.map((l, j) => (
                    <li key={j} className="flex gap-3">
                      <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand-amber" />
                      <span>{l.slice(2)}</span>
                    </li>
                  ))}
                </ul>
              );
            }
            return <p key={i}>{b}</p>;
          })}
        </section>

        {/* DATA CONCLUSION / APPLIED TAKEAWAY */}
        {a.data_conclusion && (
          <section
            id="article-takeaway"
            className="mt-14 scroll-mt-24 rounded-2xl border border-brand-amber/40 bg-surface p-6 sm:p-8"
          >
            <div className="flex items-center gap-2.5">
              <FlaskConical className="size-5 text-brand-amber" aria-hidden="true" />
              <p className="eyebrow text-brand-amber">Applied Conclusion &amp; Key Takeaway</p>
            </div>
            <p className="mt-3 text-base leading-relaxed text-foreground sm:text-lg">
              {a.data_conclusion}
            </p>
          </section>
        )}

        {/* PRIMARY RESEARCH SOURCES */}
        {a.sources.length > 0 && (
          <section
            id="article-citations"
            className="mt-8 scroll-mt-24 rounded-2xl border border-border bg-surface/60 p-6 sm:p-7"
          >
            <div className="flex items-center gap-2">
              <BookMarked className="size-4 text-brand-orange" aria-hidden="true" />
              <p className="eyebrow">Primary Research Citations</p>
            </div>
            <ul className="mt-4 space-y-2.5 text-sm">
              {a.sources.map((src) => (
                <li key={src.url} className="min-w-0">
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-1.5 break-words text-muted-foreground underline underline-offset-4 hover:text-brand-amber sm:min-h-0"
                  >
                    <span className="break-words">{src.label}</span>
                    <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* INTERACTIVE 5-STAR RATING & USER COMMENTS */}
        <div id="article-discussion" className="scroll-mt-24">
          <ArticleFeedbackSection slug={a.slug} />
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-surface p-6 sm:flex-row sm:items-center sm:p-7">
          <div>
            <p className="text-display text-2xl">Put this research into practice</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Filter matching progressions in the Training Library or submit footage for AI
              analysis.
            </p>
          </div>
          <Button asChild variant="hero" size="lg" className="min-h-12 w-full shrink-0 sm:w-auto">
            <Link to="/training">Open Training &amp; Workout Builder</Link>
          </Button>
        </div>
      </article>
    </PageWithOutline>
  );
}
