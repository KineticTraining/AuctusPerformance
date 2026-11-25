import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import type { ArticleSource } from "./mock-seed";
import {
  AGE_GROUPS,
  EXPERIENCE_LEVELS,
  normalizeArticleCategory,
  type ArticleCategory,
} from "./sports";

export type ArticleSummary = {
  slug: string;
  title: string;
  excerpt: string;
  category: ArticleCategory;
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
  average_rating: number;
  rating_count: number;
  comment_count: number;
};

export type Article = ArticleSummary & { body: string };

const DEFAULT_AGE_GROUPS = [...AGE_GROUPS];
const DEFAULT_EXPERIENCE = [...EXPERIENCE_LEVELS];

export const listArticles = createServerFn({ method: "GET" }).handler(
  async (): Promise<ArticleSummary[]> => {
    const [{ getCmsState, LEGACY_FABRICATED_ARTICLE_SLUGS }, { getArticleFeedbackSummaryMap }] =
      await Promise.all([import("./cms-store.server"), import("./article-feedback.server")]);

    const cmsArticles = getCmsState().articles;
    const bySlug = new Map<
      string,
      Omit<ArticleSummary, "average_rating" | "rating_count" | "comment_count">
    >();

    const hasSupabase = Boolean(
      process.env["SUPABASE_URL"] && process.env["SUPABASE_PUBLISHABLE_KEY"],
    );

    if (hasSupabase) {
      try {
        const { createPublicSupabase } = await import("./public-supabase.server");
        const { data } = await createPublicSupabase()
          .from("articles")
          .select(
            "slug, title, excerpt, category, author, author_role, read_minutes, featured, published_at, sports",
          )
          .order("published_at", { ascending: false });

        for (const row of data ?? []) {
          if (LEGACY_FABRICATED_ARTICLE_SLUGS.has(row.slug)) continue;
          bySlug.set(row.slug, {
            ...row,
            category: normalizeArticleCategory(row.category),
            age_groups: DEFAULT_AGE_GROUPS,
            experience_levels: DEFAULT_EXPERIENCE,
            sources: [],
            data_conclusion: "",
          });
        }
      } catch {
        // Safely continue with CMS seed articles if Supabase query fails
      }
    }

    for (const cms of cmsArticles) {
      const { body: _b, ...summary } = cms;
      bySlug.set(cms.slug, {
        ...summary,
        category: normalizeArticleCategory(summary.category),
      });
    }

    const sorted = Array.from(bySlug.values()).sort((a, b) =>
      b.published_at.localeCompare(a.published_at),
    );
    const feedbackMap = getArticleFeedbackSummaryMap(sorted.map((item) => item.slug));

    return sorted.map((item) => {
      const stats = feedbackMap[item.slug];
      return {
        ...item,
        average_rating: stats?.averageRating ?? 0,
        rating_count: stats?.ratingCount ?? 0,
        comment_count: stats?.commentCount ?? 0,
      };
    });
  },
);

export const getArticle = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) =>
    z.object({ slug: z.string().min(1).max(120) }).parse(input),
  )
  .handler(async ({ data }): Promise<Article | null> => {
    const [{ getCmsState, LEGACY_FABRICATED_ARTICLE_SLUGS }, { getArticleFeedbackSummaryMap }] =
      await Promise.all([import("./cms-store.server"), import("./article-feedback.server")]);

    if (LEGACY_FABRICATED_ARTICLE_SLUGS.has(data.slug)) {
      return null;
    }

    const cmsMatch = getCmsState().articles.find((a) => a.slug === data.slug);
    const stats = getArticleFeedbackSummaryMap([data.slug])[data.slug];

    if (cmsMatch) {
      return {
        ...cmsMatch,
        category: normalizeArticleCategory(cmsMatch.category),
        average_rating: stats?.averageRating ?? 0,
        rating_count: stats?.ratingCount ?? 0,
        comment_count: stats?.commentCount ?? 0,
      };
    }

    const hasSupabase = Boolean(
      process.env["SUPABASE_URL"] && process.env["SUPABASE_PUBLISHABLE_KEY"],
    );
    if (!hasSupabase) return null;

    try {
      const { createPublicSupabase } = await import("./public-supabase.server");
      const { data: row, error } = await createPublicSupabase()
        .from("articles")
        .select(
          "slug, title, excerpt, body, category, author, author_role, read_minutes, featured, published_at, sports",
        )
        .eq("slug", data.slug)
        .maybeSingle();

      if (error || !row) return null;

      return {
        ...row,
        category: normalizeArticleCategory(row.category),
        age_groups: DEFAULT_AGE_GROUPS,
        experience_levels: DEFAULT_EXPERIENCE,
        sources: [],
        data_conclusion: "",
        average_rating: stats?.averageRating ?? 0,
        rating_count: stats?.ratingCount ?? 0,
        comment_count: stats?.commentCount ?? 0,
      };
    } catch {
      return null;
    }
  });

export const articlesQuery = () =>
  queryOptions({ queryKey: ["articles"], queryFn: () => listArticles() });
export const articleQuery = (slug: string) =>
  queryOptions({ queryKey: ["article", slug], queryFn: () => getArticle({ data: { slug } }) });
