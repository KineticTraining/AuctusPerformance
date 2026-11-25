import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

export type ArticleComment = {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
};

export type ArticleFeedbackRecord = {
  ratingsByVoter: Record<string, number>;
  comments: ArticleComment[];
};

export type ArticleFeedbackSnapshot = {
  slug: string;
  averageRating: number;
  ratingCount: number;
  userRating: number | null;
  comments: ArticleComment[];
};

export type ArticleFeedbackSummary = {
  averageRating: number;
  ratingCount: number;
  commentCount: number;
};

type FeedbackStore = Record<string, ArticleFeedbackRecord>;

const FEEDBACK_GLOBAL_KEY = "__auctus_article_feedback_store__";
const g = globalThis as unknown as Record<string, unknown>;

function feedbackPath(): string {
  return resolve(process.cwd(), ".data", "article-feedback.json");
}

function loadStore(): FeedbackStore {
  if (g[FEEDBACK_GLOBAL_KEY]) {
    return g[FEEDBACK_GLOBAL_KEY] as FeedbackStore;
  }
  try {
    const file = feedbackPath();
    if (existsSync(file)) {
      const raw = readFileSync(file, "utf8");
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        g[FEEDBACK_GLOBAL_KEY] = parsed as FeedbackStore;
        return g[FEEDBACK_GLOBAL_KEY] as FeedbackStore;
      }
    }
  } catch {
    // Fall back to empty in-memory store
  }
  const empty: FeedbackStore = {};
  g[FEEDBACK_GLOBAL_KEY] = empty;
  return empty;
}

function saveStore(store: FeedbackStore): void {
  g[FEEDBACK_GLOBAL_KEY] = store;
  try {
    const file = feedbackPath();
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify(store, null, 2), "utf8");
  } catch {
    // Non-fatal in read-only runtimes
  }
}

function ensureRecord(store: FeedbackStore, slug: string): ArticleFeedbackRecord {
  const existing = store[slug];
  if (existing && typeof existing === "object") {
    return {
      ratingsByVoter:
        existing.ratingsByVoter && typeof existing.ratingsByVoter === "object"
          ? existing.ratingsByVoter
          : {},
      comments: Array.isArray(existing.comments) ? existing.comments : [],
    };
  }
  return { ratingsByVoter: {}, comments: [] };
}

function computeAverage(ratingsByVoter: Record<string, number>): {
  averageRating: number;
  ratingCount: number;
} {
  const values = Object.values(ratingsByVoter).filter(
    (v) => typeof v === "number" && Number.isFinite(v) && v >= 1 && v <= 5,
  );
  if (values.length === 0) {
    return { averageRating: 0, ratingCount: 0 };
  }
  const sum = values.reduce((acc, v) => acc + v, 0);
  return {
    averageRating: Math.round((sum / values.length) * 10) / 10,
    ratingCount: values.length,
  };
}

export function getArticleFeedback(slug: string, voterId?: string | null): ArticleFeedbackSnapshot {
  const store = loadStore();
  const rec = ensureRecord(store, slug);
  const { averageRating, ratingCount } = computeAverage(rec.ratingsByVoter);
  const userRating =
    voterId && typeof rec.ratingsByVoter[voterId] === "number"
      ? rec.ratingsByVoter[voterId]!
      : null;

  return {
    slug,
    averageRating,
    ratingCount,
    userRating,
    comments: [...rec.comments].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  };
}

export function getArticleFeedbackSummaryMap(
  slugs: string[],
): Record<string, ArticleFeedbackSummary> {
  const store = loadStore();
  const out: Record<string, ArticleFeedbackSummary> = {};
  for (const slug of slugs) {
    const rec = ensureRecord(store, slug);
    const { averageRating, ratingCount } = computeAverage(rec.ratingsByVoter);
    out[slug] = {
      averageRating,
      ratingCount,
      commentCount: rec.comments.length,
    };
  }
  return out;
}

export function submitArticleRating(input: {
  slug: string;
  voterId: string;
  rating: number;
}): ArticleFeedbackSnapshot {
  const cleanSlug = input.slug.trim();
  const cleanVoter = input.voterId.trim();
  const rating = Math.round(input.rating);
  if (!cleanSlug || !cleanVoter) {
    throw new Error("Missing article identifier or voter key.");
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5 stars.");
  }

  const store = loadStore();
  const rec = ensureRecord(store, cleanSlug);
  rec.ratingsByVoter[cleanVoter] = rating;
  store[cleanSlug] = rec;
  saveStore(store);

  return getArticleFeedback(cleanSlug, cleanVoter);
}

export function addArticleComment(input: {
  slug: string;
  authorName: string;
  body: string;
  voterId?: string | null;
}): ArticleFeedbackSnapshot {
  const cleanSlug = input.slug.trim();
  const cleanName = input.authorName.trim();
  const cleanBody = input.body.trim();

  if (!cleanSlug) {
    throw new Error("Article slug is required.");
  }
  if (cleanName.length < 2 || cleanName.length > 60) {
    throw new Error("Name must be between 2 and 60 characters.");
  }
  if (cleanBody.length < 3 || cleanBody.length > 1200) {
    throw new Error("Comment must be between 3 and 1,200 characters.");
  }

  const store = loadStore();
  const rec = ensureRecord(store, cleanSlug);
  rec.comments.unshift({
    id: `cmt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    authorName: cleanName,
    body: cleanBody,
    createdAt: new Date().toISOString(),
  });
  store[cleanSlug] = rec;
  saveStore(store);

  return getArticleFeedback(cleanSlug, input.voterId);
}
