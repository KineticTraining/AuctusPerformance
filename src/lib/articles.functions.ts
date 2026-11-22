import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { SEED_ARTICLES, type ArticleSource } from "./mock-seed";
import { AGE_GROUPS, EXPERIENCE_LEVELS } from "./sports";

export type ArticleSummary = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  author_role: string;
  read_minutes: number;
  sports: string[];
  age_groups: string[];
  experience_levels: string[];
  sources: ArticleSource[];
  data_conclusion: string;
  featured: boolean;
  published_at: string;
};

export type Article = ArticleSummary & { body: string };

const DEFAULT_AGE_GROUPS = [...AGE_GROUPS];
const DEFAULT_EXPERIENCE = [...EXPERIENCE_LEVELS];
const SEED_ARTICLES_BY_SLUG = new Map(SEED_ARTICLES.map((a) => [a.slug, a]));

export const listArticles = createServerFn({ method: "GET" }).handler(
  async (): Promise<ArticleSummary[]> => {
    const { getCmsState } = await import("./cms-store.server");
    const cmsArticles = getCmsState().articles;

    const hasSupabase = Boolean(
      process.env["SUPABASE_URL"] && process.env["SUPABASE_PUBLISHABLE_KEY"],
    );

    if (!hasSupabase) {
      return [...cmsArticles]
        .sort((a, b) => b.published_at.localeCompare(a.published_at))
        .map(({ body: _body, ...rest }) => rest);
    }

    const { createPublicSupabase } = await import("./public-supabase.server");
    const { data, error } = await createPublicSupabase()
      .from("articles")
      .select(
        "slug, title, excerpt, category, author, author_role, read_minutes, featured, published_at, sports",
      )
      .order("published_at", { ascending: false });

    if (error) {
      return [...cmsArticles]
        .sort((a, b) => b.published_at.localeCompare(a.published_at))
        .map(({ body: _body, ...rest }) => rest);
    }

    const bySlug = new Map<string, ArticleSummary>();
    for (const row of data ?? []) {
      const seedMatch = SEED_ARTICLES_BY_SLUG.get(row.slug);
      bySlug.set(row.slug, {
        ...row,
        age_groups: seedMatch?.age_groups ?? DEFAULT_AGE_GROUPS,
        experience_levels: seedMatch?.experience_levels ?? DEFAULT_EXPERIENCE,
        sources: seedMatch?.sources ?? [],
        data_conclusion:
          seedMatch?.data_conclusion ??
          "Apply progressive overload and monitor weekly recovery metrics before adding density.",
      });
    }
    for (const cms of cmsArticles) {
      const { body: _b, ...summary } = cms;
      bySlug.set(cms.slug, summary);
    }
    return Array.from(bySlug.values()).sort((a, b) => b.published_at.localeCompare(a.published_at));
  },
);

export const getArticle = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) =>
    z.object({ slug: z.string().min(1).max(120) }).parse(input),
  )
  .handler(async ({ data }): Promise<Article | null> => {
    const { getCmsState } = await import("./cms-store.server");
    const cmsMatch = getCmsState().articles.find((a) => a.slug === data.slug);
    if (cmsMatch) {
      return cmsMatch;
    }

    const hasSupabase = Boolean(
      process.env["SUPABASE_URL"] && process.env["SUPABASE_PUBLISHABLE_KEY"],
    );
    if (!hasSupabase) return null;

    const { createPublicSupabase } = await import("./public-supabase.server");
    const { data: row, error } = await createPublicSupabase()
      .from("articles")
      .select(
        "slug, title, excerpt, body, category, author, author_role, read_minutes, featured, published_at, sports",
      )
      .eq("slug", data.slug)
      .maybeSingle();

    if (error) throw new Error("Could not load article");
    if (!row) return null;
    const seedMatch = SEED_ARTICLES_BY_SLUG.get(row.slug);
    return {
      ...row,
      age_groups: seedMatch?.age_groups ?? DEFAULT_AGE_GROUPS,
      experience_levels: seedMatch?.experience_levels ?? DEFAULT_EXPERIENCE,
      sources: seedMatch?.sources ?? [],
      data_conclusion:
        seedMatch?.data_conclusion ??
        "Apply progressive overload and monitor weekly recovery metrics before adding density.",
    };
  });

export const articlesQuery = () =>
  queryOptions({ queryKey: ["articles"], queryFn: () => listArticles() });
export const articleQuery = (slug: string) =>
  queryOptions({ queryKey: ["article", slug], queryFn: () => getArticle({ data: { slug } }) });
