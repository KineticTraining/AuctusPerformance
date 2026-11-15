import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock } from "lucide-react";

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
          { title: `${loaderData.title} — Kinetic` },
          { name: "description", content: loaderData.excerpt },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.excerpt },
          { property: "og:type", content: "article" },
          { name: "twitter:card", content: "summary" },
        ]
      : [{ title: "Article unavailable — Kinetic" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-5 py-32 text-center">
      <h1 className="text-display text-5xl">Article not found</h1>
      <Button asChild variant="hero" className="mt-8">
        <Link to="/articles">All articles</Link>
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

  return (
    <article className="mx-auto max-w-3xl px-5 py-16 md:py-24">
      <Link to="/articles" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All articles
      </Link>
      <p className="eyebrow mt-10">{a.category}</p>
      <h1 className="text-display mt-4 text-5xl md:text-7xl">{a.title}</h1>
      <p className="mt-6 text-xl text-muted-foreground">{a.excerpt}</p>
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-border py-4 text-sm text-muted-foreground">
        <span>
          <span className="font-semibold text-foreground">{a.author}</span> · {a.author_role}
        </span>
        <span>{formatDate(a.published_at)}</span>
        <span className="flex items-center gap-1">
          <Clock className="size-4" /> {a.read_minutes} min read
        </span>
      </div>
      <div className="mt-10 space-y-6 text-lg leading-relaxed text-foreground/85">
        {blocks.map((b, i) => {
          if (b.startsWith("## ")) return <h2 key={i} className="text-display pt-6 text-3xl text-foreground">{b.slice(3)}</h2>;
          const lines = b.split("\n");
          if (lines.every((l) => l.startsWith("- "))) {
            return (
              <ul key={i} className="space-y-3">
                {lines.map((l, j) => (
                  <li key={j} className="flex gap-3">
                    <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{l.slice(2)}</span>
                  </li>
                ))}
              </ul>
            );
          }
          return <p key={i}>{b}</p>;
        })}
      </div>
      <div className="mt-16 rounded-2xl border border-primary/30 bg-primary/10 p-8">
        <p className="text-display text-3xl">Put it into practice</p>
        <p className="mt-2 text-muted-foreground">Members get follow-along sessions and AI feedback on their technique.</p>
        <Button asChild variant="hero" className="mt-6">
          <Link to="/dashboard">Go to your training</Link>
        </Button>
      </div>
    </article>
  );
}
