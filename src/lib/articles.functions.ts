import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";

export type ArticleSummary = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  author_role: string;
  read_minutes: number;
  featured: boolean;
  published_at: string;
};

export type Article = ArticleSummary & { body: string };

export const listArticles = createServerFn({ method: "GET" }).handler(async (): Promise<ArticleSummary[]> => {
  const { createPublicSupabase } = await import("./public-supabase.server");
  const { data, error } = await createPublicSupabase()
    .from("articles")
    .select("slug, title, excerpt, category, author, author_role, read_minutes, featured, published_at")
    .order("published_at", { ascending: false });
  if (error) throw new Error("Could not load articles");
  return data ?? [];
});

export const getArticle = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => z.object({ slug: z.string().min(1).max(120) }).parse(input))
  .handler(async ({ data }): Promise<Article | null> => {
    const { createPublicSupabase } = await import("./public-supabase.server");
    const { data: row, error } = await createPublicSupabase()
      .from("articles")
      .select("slug, title, excerpt, body, category, author, author_role, read_minutes, featured, published_at")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error("Could not load article");
    return row;
  });

export const articlesQuery = () => queryOptions({ queryKey: ["articles"], queryFn: () => listArticles() });
export const articleQuery = (slug: string) =>
  queryOptions({ queryKey: ["article", slug], queryFn: () => getArticle({ data: { slug } }) });
