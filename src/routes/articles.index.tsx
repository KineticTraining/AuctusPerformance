import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowUpRight, Clock } from "lucide-react";
import { useState } from "react";

import { articlesQuery } from "@/lib/articles.functions";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/articles/")({
  head: () => ({
    meta: [
      { title: "Sports Science Articles — Kinetic" },
      {
        name: "description",
        content: "Evidence-based articles on sleep, power, injury prevention, nutrition, psychology and training load for athletes.",
      },
      { property: "og:title", content: "Sports Science Articles — Kinetic" },
      { property: "og:description", content: "The research behind better training, explained by practitioners." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(articlesQuery()),
  component: ArticlesPage,
});

function ArticlesPage() {
  const { data: articles } = useSuspenseQuery(articlesQuery());
  const categories = ["All", ...Array.from(new Set(articles.map((a) => a.category)))];
  const [cat, setCat] = useState("All");
  const featured = articles.find((a) => a.featured) ?? articles[0];
  const rest = articles.filter((a) => a.slug !== featured?.slug && (cat === "All" || a.category === cat));

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
      <p className="eyebrow">The Lab Journal</p>
      <h1 className="text-display mt-4 text-6xl md:text-8xl">Sports science</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        The research behind better training — translated into what to actually do on Monday.
      </p>

      {featured && cat === "All" && (
        <Link
          to="/articles/$slug"
          params={{ slug: featured.slug }}
          className="group mt-14 grid overflow-hidden rounded-3xl border border-border bg-gradient-card shadow-card md:grid-cols-[1.3fr_1fr]"
        >
          <div className="p-8 md:p-12">
            <span className="inline-flex rounded-full bg-primary/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              Featured · {featured.category}
            </span>
            <h2 className="text-display mt-6 text-4xl md:text-6xl">{featured.title}</h2>
            <p className="mt-4 text-muted-foreground">{featured.excerpt}</p>
            <Byline a={featured} />
          </div>
          <div className="relative hidden items-end justify-end bg-grid p-8 md:flex">
            <ArrowUpRight className="size-16 text-primary transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
          </div>
        </Link>
      )}

      <div className="mt-14 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors",
              cat === c ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {(cat === "All" ? rest : articles.filter((a) => a.category === cat)).map((a) => (
          <Link
            key={a.slug}
            to="/articles/$slug"
            params={{ slug: a.slug }}
            className="group flex flex-col rounded-2xl border border-border bg-surface p-7 transition-all hover:-translate-y-1 hover:border-primary/40"
          >
            <span className="eyebrow">{a.category}</span>
            <h3 className="text-display mt-4 text-3xl">{a.title}</h3>
            <p className="mt-3 line-clamp-3 flex-1 text-sm text-muted-foreground">{a.excerpt}</p>
            <Byline a={a} />
          </Link>
        ))}
      </div>
    </div>
  );
}

function Byline({ a }: { a: { author: string; read_minutes: number; published_at: string } }) {
  return (
    <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
      <span className="font-semibold text-foreground">{a.author}</span>
      <span>{formatDate(a.published_at)}</span>
      <span className="flex items-center gap-1">
        <Clock className="size-3.5" /> {a.read_minutes} min
      </span>
    </div>
  );
}
