import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import type { ArticleFeedbackSnapshot, ArticleFeedbackSummary } from "./article-feedback.server";

export type {
  ArticleComment,
  ArticleFeedbackSnapshot,
  ArticleFeedbackSummary,
} from "./article-feedback.server";

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9-]+$/, "Invalid article identifier");

const voterIdSchema = z
  .string()
  .trim()
  .min(4)
  .max(100)
  .regex(/^[a-zA-Z0-9_-]+$/, "Invalid voter identifier");

export const getArticleFeedbackFn = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string; voterId?: string | undefined }) =>
    z
      .object({
        slug: slugSchema,
        voterId: voterIdSchema.optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<ArticleFeedbackSnapshot> => {
    const { getArticleFeedback } = await import("./article-feedback.server");
    return getArticleFeedback(data.slug, data.voterId);
  });

export const listArticleFeedbackSummariesFn = createServerFn({ method: "POST" })
  .inputValidator((input: { slugs: string[] }) =>
    z.object({ slugs: z.array(slugSchema).max(200) }).parse(input),
  )
  .handler(async ({ data }): Promise<Record<string, ArticleFeedbackSummary>> => {
    const { getArticleFeedbackSummaryMap } = await import("./article-feedback.server");
    return getArticleFeedbackSummaryMap(data.slugs);
  });

export const rateArticleFn = createServerFn({ method: "POST" })
  .inputValidator((input: { slug: string; voterId: string; rating: number }) =>
    z
      .object({
        slug: slugSchema,
        voterId: voterIdSchema,
        rating: z.number().int().min(1).max(5),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<ArticleFeedbackSnapshot> => {
    const { submitArticleRating } = await import("./article-feedback.server");
    return submitArticleRating(data);
  });

export const postArticleCommentFn = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { slug: string; authorName: string; body: string; voterId?: string | undefined }) =>
      z
        .object({
          slug: slugSchema,
          authorName: z.string().trim().min(2, "Enter your name (2+ characters)").max(60),
          body: z
            .string()
            .trim()
            .min(3, "Write a comment (at least 3 characters)")
            .max(1200, "Comment is limited to 1,200 characters"),
          voterId: voterIdSchema.optional(),
        })
        .parse(input),
  )
  .handler(async ({ data }): Promise<ArticleFeedbackSnapshot> => {
    const { addArticleComment } = await import("./article-feedback.server");
    return addArticleComment({
      slug: data.slug,
      authorName: data.authorName,
      body: data.body,
      voterId: data.voterId ?? null,
    });
  });

export const articleFeedbackQuery = (slug: string, voterId?: string | undefined) =>
  queryOptions({
    queryKey: ["article-feedback", slug, voterId ?? "anon"],
    queryFn: () => getArticleFeedbackFn({ data: { slug, voterId } }),
  });
