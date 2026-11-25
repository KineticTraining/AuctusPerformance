import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import type { ArticleSeedRow, NewsletterIssue, NutrientEntry } from "./mock-seed";
import { AGE_GROUPS, ARTICLE_CATEGORIES, EXPERIENCE_LEVELS, NUTRITION_GROUPS } from "./sports";

export type AdminStatus = {
  envConfigured: boolean;
  keyClaimed: boolean;
};

const safeUrlSchema = z
  .string()
  .trim()
  .url("Enter a valid URL (https://...)")
  .refine((u) => /^https?:\/\//i.test(u), "Source URL must start with http:// or https://");

const sourceItemSchema = z.object({
  label: z.string().trim().min(2, "Enter a citation label").max(200),
  url: safeUrlSchema,
});

export const articleUpsertSchema = z.object({
  adminToken: z.string().min(10),
  originalSlug: z.string().optional(),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  title: z.string().trim().min(3, "Enter an article title").max(160),
  excerpt: z.string().trim().min(10, "Enter a brief excerpt").max(400),
  body: z.string().trim().min(20, "Enter article body copy").max(25000),
  category: z.enum(ARTICLE_CATEGORIES),
  author: z.string().trim().min(2).max(80),
  author_role: z.string().trim().min(2).max(80),
  read_minutes: z.number().int().min(1).max(60),
  featured: z.boolean(),
  published_at: z.string().trim().min(8).max(32),
  sports: z.array(z.string().trim().min(1)).min(1),
  age_groups: z.array(z.enum(AGE_GROUPS)).min(1),
  experience_levels: z.array(z.enum(EXPERIENCE_LEVELS)).min(1),
  sources: z.array(sourceItemSchema).max(12),
  data_conclusion: z.string().trim().min(10, "Enter a practical data takeaway").max(1200),
});

export const newsletterUpsertSchema = z.object({
  adminToken: z.string().min(10),
  id: z.string().trim().min(1).max(80).optional(),
  issue_number: z.number().int().min(1).max(9999),
  title: z.string().trim().min(4).max(160),
  published_at: z.string().trim().min(8).max(32),
  summary: z.string().trim().min(10).max(800),
  highlights: z.array(z.string().trim().min(3).max(260)).min(1).max(8),
  coach_note: z.string().trim().min(10).max(1200),
});

export const nutritionUpsertSchema = z.object({
  adminToken: z.string().min(10),
  id: z.string().trim().min(1).max(80).optional(),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  name: z.string().trim().min(2).max(160),
  group: z.enum(NUTRITION_GROUPS),
  subgroup: z.string().trim().max(120).optional(),
  sortOrder: z.number().int().min(1).max(500).optional(),
  performanceOneLiner: z.string().trim().min(8).max(400),
  summarized: z.object({
    whatItDoes: z.string().trim().min(8).max(1200),
    threeFoods: z.string().trim().min(3).max(400),
    bodyNeeds: z.string().trim().min(3).max(600),
    averageAmericanGets: z.string().trim().min(3).max(600),
  }),
  inDepth: z.object({
    biochemicalFunction: z.string().trim().min(15).max(5000),
    whereLocatedInFood: z.string().trim().min(10).max(2000),
  }),
  ageGroups: z.array(z.enum(AGE_GROUPS)).optional(),
});

export const getAdminConfigStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminStatus> => {
    const { getAdminKeyStatus } = await import("./cms-store.server");
    return getAdminKeyStatus();
  },
);

export const claimAdminKeyFn = createServerFn({ method: "POST" })
  .inputValidator((input: { passkey: string }) =>
    z
      .object({ passkey: z.string().min(8, "Admin key must be at least 8 characters").max(128) })
      .parse(input),
  )
  .handler(async ({ data }): Promise<{ token: string; expiresAt: string }> => {
    const { claimInitialAdminKey, issueAdminSessionToken } = await import("./cms-store.server");
    claimInitialAdminKey(data.passkey);
    return issueAdminSessionToken();
  });

export const unlockAdminSession = createServerFn({ method: "POST" })
  .inputValidator((input: { passkey: string }) =>
    z.object({ passkey: z.string().min(1, "Enter your Admin Access Key").max(128) }).parse(input),
  )
  .handler(async ({ data }): Promise<{ token: string; expiresAt: string }> => {
    const { issueAdminSessionToken, verifyAdminPasskey } = await import("./cms-store.server");
    if (!verifyAdminPasskey(data.passkey)) {
      throw new Error("Invalid Admin Access Key.");
    }
    return issueAdminSessionToken();
  });

export const validateAdminToken = createServerFn({ method: "POST" })
  .inputValidator((input: { adminToken: string }) =>
    z.object({ adminToken: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data }): Promise<{ valid: boolean }> => {
    const { verifyAdminSessionToken } = await import("./cms-store.server");
    return { valid: verifyAdminSessionToken(data.adminToken) };
  });

export const listAdminContent = createServerFn({ method: "POST" })
  .inputValidator((input: { adminToken: string }) =>
    z.object({ adminToken: z.string().min(1) }).parse(input),
  )
  .handler(
    async ({
      data,
    }): Promise<{
      articles: ArticleSeedRow[];
      newsletters: NewsletterIssue[];
      nutrition: NutrientEntry[];
    }> => {
      const { getCmsState, verifyAdminSessionToken } = await import("./cms-store.server");
      if (!verifyAdminSessionToken(data.adminToken)) {
        throw new Error("Admin session expired or unauthorized.");
      }
      const state = getCmsState();
      return {
        articles: [...state.articles].sort((a, b) => b.published_at.localeCompare(a.published_at)),
        newsletters: [...state.newsletters].sort((a, b) => b.issue_number - a.issue_number),
        nutrition: [...state.nutrition].sort((a, b) => a.sortOrder - b.sortOrder),
      };
    },
  );

export const upsertCmsArticle = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => articleUpsertSchema.parse(input))
  .handler(async ({ data }): Promise<ArticleSeedRow> => {
    const { getCmsState, saveCmsState, verifyAdminSessionToken } =
      await import("./cms-store.server");
    if (!verifyAdminSessionToken(data.adminToken)) {
      throw new Error("Unauthorized: Admin session required.");
    }

    const state = getCmsState();
    const targetSlug = data.originalSlug ?? data.slug;
    const existingIndex = state.articles.findIndex((a) => a.slug === targetSlug);
    const existing = existingIndex >= 0 ? state.articles[existingIndex] : undefined;

    const nextArticle: ArticleSeedRow = {
      id: existing?.id ?? `art-${Date.now().toString(36)}`,
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt,
      body: data.body,
      category: data.category,
      author: data.author,
      author_role: data.author_role,
      read_minutes: data.read_minutes,
      featured: data.featured,
      published_at: data.published_at,
      sports: data.sports,
      age_groups: [...data.age_groups],
      experience_levels: [...data.experience_levels],
      sources: data.sources,
      data_conclusion: data.data_conclusion,
    };

    const nextArticles = state.articles.map((a) =>
      data.featured && a.slug !== nextArticle.slug ? { ...a, featured: false } : a,
    );

    if (existingIndex >= 0) {
      nextArticles[existingIndex] = nextArticle;
    } else {
      nextArticles.unshift(nextArticle);
    }

    saveCmsState({ ...state, articles: nextArticles });
    return nextArticle;
  });

export const deleteCmsArticle = createServerFn({ method: "POST" })
  .inputValidator((input: { adminToken: string; slug: string }) =>
    z.object({ adminToken: z.string().min(1), slug: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { getCmsState, saveCmsState, verifyAdminSessionToken } =
      await import("./cms-store.server");
    if (!verifyAdminSessionToken(data.adminToken)) {
      throw new Error("Unauthorized: Admin session required.");
    }
    const state = getCmsState();
    saveCmsState({
      ...state,
      articles: state.articles.filter((a) => a.slug !== data.slug),
    });
    return { ok: true };
  });

export const upsertCmsNewsletter = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => newsletterUpsertSchema.parse(input))
  .handler(async ({ data }): Promise<NewsletterIssue> => {
    const { getCmsState, saveCmsState, verifyAdminSessionToken } =
      await import("./cms-store.server");
    if (!verifyAdminSessionToken(data.adminToken)) {
      throw new Error("Unauthorized: Admin session required.");
    }
    const state = getCmsState();
    const id = data.id ?? `nl-${data.issue_number}-${Date.now().toString(36)}`;
    const nextIssue: NewsletterIssue = {
      id,
      issue_number: data.issue_number,
      title: data.title,
      published_at: data.published_at,
      summary: data.summary,
      highlights: data.highlights,
      coach_note: data.coach_note,
    };

    const idx = state.newsletters.findIndex((n) => n.id === id);
    const nextList = [...state.newsletters];
    if (idx >= 0) nextList[idx] = nextIssue;
    else nextList.unshift(nextIssue);

    saveCmsState({ ...state, newsletters: nextList });
    return nextIssue;
  });

export const deleteCmsNewsletter = createServerFn({ method: "POST" })
  .inputValidator((input: { adminToken: string; id: string }) =>
    z.object({ adminToken: z.string().min(1), id: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { getCmsState, saveCmsState, verifyAdminSessionToken } =
      await import("./cms-store.server");
    if (!verifyAdminSessionToken(data.adminToken)) {
      throw new Error("Unauthorized: Admin session required.");
    }
    const state = getCmsState();
    saveCmsState({
      ...state,
      newsletters: state.newsletters.filter((n) => n.id !== data.id),
    });
    return { ok: true };
  });

export const upsertCmsNutrition = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => nutritionUpsertSchema.parse(input))
  .handler(async ({ data }): Promise<NutrientEntry> => {
    const { getCmsState, saveCmsState, verifyAdminSessionToken } =
      await import("./cms-store.server");
    if (!verifyAdminSessionToken(data.adminToken)) {
      throw new Error("Unauthorized: Admin session required.");
    }
    const state = getCmsState();
    const id = data.id ?? `nut-${Date.now().toString(36)}`;
    const existing = state.nutrition.find((n) => n.id === id || n.slug === data.slug);
    const nextEntry: NutrientEntry = {
      id,
      slug: data.slug,
      name: data.name,
      group: data.group,
      ...(data.subgroup ? { subgroup: data.subgroup } : {}),
      sortOrder: data.sortOrder ?? existing?.sortOrder ?? state.nutrition.length + 1,
      performanceOneLiner: data.performanceOneLiner,
      summarized: { ...data.summarized },
      inDepth: { ...data.inDepth },
      ageGroups:
        data.ageGroups && data.ageGroups.length > 0 ? [...data.ageGroups] : [...AGE_GROUPS],
      ...(existing?.ageGuidance ? { ageGuidance: existing.ageGuidance } : {}),
      updated_at: new Date().toISOString().slice(0, 10),
    };

    const idx = state.nutrition.findIndex((n) => n.id === id || n.slug === data.slug);
    const nextList = [...state.nutrition];
    if (idx >= 0) nextList[idx] = nextEntry;
    else nextList.push(nextEntry);

    saveCmsState({ ...state, nutrition: nextList });
    return nextEntry;
  });

export const deleteCmsNutrition = createServerFn({ method: "POST" })
  .inputValidator((input: { adminToken: string; id: string }) =>
    z.object({ adminToken: z.string().min(1), id: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { getCmsState, saveCmsState, verifyAdminSessionToken } =
      await import("./cms-store.server");
    if (!verifyAdminSessionToken(data.adminToken)) {
      throw new Error("Unauthorized: Admin session required.");
    }
    const state = getCmsState();
    saveCmsState({
      ...state,
      nutrition: state.nutrition.filter((n) => n.id !== data.id),
    });
    return { ok: true };
  });

export const adminStatusQuery = () =>
  queryOptions({ queryKey: ["admin-config-status"], queryFn: () => getAdminConfigStatus() });
