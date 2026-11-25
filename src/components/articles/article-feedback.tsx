import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, MessageSquare, Send, Star } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import {
  articleFeedbackQuery,
  postArticleCommentFn,
  rateArticleFn,
} from "@/lib/article-feedback.functions";
import { cn } from "@/lib/utils";

const VISITOR_STORAGE_KEY = "auctus_visitor_id";

function getOrCreateVisitorId(authUserId?: string): string {
  if (authUserId) {
    return `user_${authUserId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64)}`;
  }
  if (typeof window === "undefined") return "anon_preview";
  try {
    const existing = window.localStorage.getItem(VISITOR_STORAGE_KEY);
    if (existing && /^[a-zA-Z0-9_-]{6,80}$/.test(existing)) {
      return existing;
    }
    const generated = `vis_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
    window.localStorage.setItem(VISITOR_STORAGE_KEY, generated);
    return generated;
  } catch {
    return "anon_visitor";
  }
}

function formatCommentDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

export function ArticleFeedbackSection({ slug }: { slug: string }) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const [voterId, setVoterId] = useState<string | undefined>(undefined);
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [ratingBusy, setRatingBusy] = useState(false);

  const [authorName, setAuthorName] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);

  const submitRating = useServerFn(rateArticleFn);
  const submitComment = useServerFn(postArticleCommentFn);

  useEffect(() => {
    const id = getOrCreateVisitorId(session?.user?.id);
    setVoterId(id);
    const metaName = session?.user?.user_metadata?.["display_name"];
    if (typeof metaName === "string" && metaName.trim() && !authorName) {
      setAuthorName(metaName.trim());
    }
  }, [session?.user?.id, session?.user?.user_metadata, authorName]);

  const feedbackQuery = useQuery(articleFeedbackQuery(slug, voterId));
  const feedback = feedbackQuery.data;

  const activeStars = hoveredStar || feedback?.userRating || 0;

  async function handleRate(stars: number) {
    const id = voterId ?? getOrCreateVisitorId(session?.user?.id);
    setVoterId(id);
    setRatingBusy(true);
    try {
      const updated = await submitRating({
        data: { slug, voterId: id, rating: stars },
      });
      queryClient.setQueryData(["article-feedback", slug, id], updated);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["articles"] }),
        queryClient.invalidateQueries({ queryKey: ["article", slug] }),
      ]);
      toast.success(`Rated ${stars} out of 5 stars.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save rating.");
    } finally {
      setRatingBusy(false);
    }
  }

  async function handleCommentSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const cleanName = authorName.trim();
    const cleanBody = commentBody.trim();
    if (cleanName.length < 2) {
      setCommentError("Please enter your name (at least 2 characters).");
      return;
    }
    if (cleanBody.length < 3) {
      setCommentError("Please write a comment (at least 3 characters).");
      return;
    }

    setCommentError(null);
    setSubmittingComment(true);
    try {
      const id = voterId ?? getOrCreateVisitorId(session?.user?.id);
      const updated = await submitComment({
        data: {
          slug,
          authorName: cleanName,
          body: cleanBody,
          ...(id ? { voterId: id } : {}),
        },
      });
      queryClient.setQueryData(["article-feedback", slug, id], updated);
      setCommentBody("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["articles"] }),
        queryClient.invalidateQueries({ queryKey: ["article", slug] }),
      ]);
      toast.success("Comment posted.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not post comment.";
      setCommentError(msg);
      toast.error(msg);
    } finally {
      setSubmittingComment(false);
    }
  }

  return (
    <section
      aria-label="Article ratings and reader discussion"
      className="mt-14 space-y-10 border-t border-border/70 pt-12"
    >
      {/* 5-STAR RATING BLOCK */}
      <div className="flex flex-col justify-between gap-6 rounded-2xl border border-border bg-surface p-6 sm:flex-row sm:items-center sm:p-7">
        <div>
          <p className="eyebrow text-brand-amber">Article Rating</p>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-display text-3xl text-foreground tabular-nums sm:text-4xl">
              {feedback && feedback.ratingCount > 0 ? feedback.averageRating.toFixed(1) : "—"}
            </span>
            <span className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground tabular-nums">
              / 5.0 ·{" "}
              {feedback
                ? `${feedback.ratingCount} ${feedback.ratingCount === 1 ? "rating" : "ratings"}`
                : "Loading ratings"}
            </span>
          </div>
          <p className="mt-1.5 text-sm font-light text-muted-foreground">
            {feedback?.userRating
              ? `Your rating: ${feedback.userRating} / 5 stars (click to update).`
              : "Rate how clear and actionable this research breakdown was."}
          </p>
        </div>

        <div
          role="group"
          aria-label="Rate this article from 1 to 5 stars"
          onMouseLeave={() => setHoveredStar(0)}
          className="flex items-center gap-1.5"
        >
          {[1, 2, 3, 4, 5].map((star) => {
            const filled = star <= activeStars;
            return (
              <button
                key={star}
                type="button"
                disabled={ratingBusy}
                onMouseEnter={() => setHoveredStar(star)}
                onFocus={() => setHoveredStar(star)}
                onBlur={() => setHoveredStar(0)}
                onClick={() => handleRate(star)}
                aria-label={`Rate ${star} out of 5 stars`}
                aria-pressed={feedback?.userRating === star}
                className="grid size-11 place-items-center rounded-lg border border-border/70 bg-background/60 transition-colors hover:border-brand-amber/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
              >
                <Star
                  className={cn(
                    "size-5 transition-colors",
                    filled ? "fill-brand-amber text-brand-amber" : "text-muted-foreground",
                  )}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* USER COMMENTS SECTION */}
      <div className="space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="size-4 text-brand-orange" aria-hidden="true" />
            <h2 className="text-display text-2xl text-foreground sm:text-3xl">Discussion</h2>
          </div>
          <span className="font-mono text-xs text-muted-foreground tabular-nums">
            {feedback?.comments.length ?? 0}{" "}
            {feedback?.comments.length === 1 ? "comment" : "comments"}
          </span>
        </div>

        <form
          onSubmit={handleCommentSubmit}
          className="space-y-4 rounded-2xl border border-border bg-surface p-6"
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="comment-author">Your name</Label>
              <Input
                id="comment-author"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Alex Morgan"
                maxLength={60}
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment-body">Add a comment or question</Label>
            <Textarea
              id="comment-body"
              rows={3}
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              maxLength={1200}
              placeholder="Share a takeaway, question, or training note related to this article..."
            />
          </div>

          {commentError && <p className="text-xs font-medium text-destructive">{commentError}</p>}

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="hero"
              size="lg"
              disabled={submittingComment}
              className="min-h-11 w-full sm:w-auto"
            >
              {submittingComment ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Posting…
                </>
              ) : (
                <>
                  Post Comment <Send className="size-4" aria-hidden="true" />
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="space-y-4">
          {feedbackQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading discussion…</p>
          ) : !feedback || feedback.comments.length === 0 ? (
            <p className="rounded-xl border border-border/60 bg-surface/50 px-5 py-6 text-sm text-muted-foreground">
              No comments yet. Start the discussion above.
            </p>
          ) : (
            feedback.comments.map((comment) => (
              <article
                key={comment.id}
                className="rounded-xl border border-border bg-surface/60 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-medium text-foreground">{comment.authorName}</span>
                  <time
                    dateTime={comment.createdAt}
                    className="font-mono text-muted-foreground tabular-nums"
                  >
                    {formatCommentDate(comment.createdAt)}
                  </time>
                </div>
                <p className="mt-2.5 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {comment.body}
                </p>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
