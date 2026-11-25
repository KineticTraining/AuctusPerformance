import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Analysis } from "./analysis";
import { youtubeId } from "./format";
import { analyzeExerciseVideoWithGemini } from "./gemini-video.server";
import {
  getUserSubmissionById,
  listUserSubmissions,
  upsertUserSubmission,
} from "./video-submissions.server";
import { SEED_TECHNIQUES } from "./mock-seed";
import { getMemberSubscription } from "./billing-store.server";
import { getTierById } from "./plans";

/** Runs AI technique review for an existing submission using the real Gemini video analyzer. */
export const analyzeSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { submissionId: string }) =>
    z.object({ submissionId: z.string().min(1) }).parse(input),
  )
  .handler(
    async ({
      data,
      context,
    }): Promise<{ status: "complete" | "failed"; analysis: Analysis | null; error?: string }> => {
      const { userId, claims } = context;
      const sub = getUserSubmissionById(userId, data.submissionId);
      if (!sub) {
        return {
          status: "failed",
          analysis: null,
          error: "Submission not found. Re-upload your clip to run Gemini AI analysis.",
        };
      }

      const memberSub = getMemberSubscription(userId);
      const activeTier =
        memberSub.status === "active" || memberSub.status === "trialing"
          ? getTierById(memberSub.plan)
          : undefined;
      if (activeTier && typeof activeTier.maxMonthlyReviews === "number") {
        const now = new Date();
        const used = listUserSubmissions(userId).filter((row) => {
          if (row.id === sub.id || row.status !== "complete") return false;
          const d = new Date(row.created_at);
          return (
            d.getUTCFullYear() === now.getUTCFullYear() && d.getUTCMonth() === now.getUTCMonth()
          );
        }).length;
        if (used >= activeTier.maxMonthlyReviews) {
          const message = `Monthly limit of ${activeTier.maxMonthlyReviews} video reviews reached on ${activeTier.name}.`;
          upsertUserSubmission({ ...sub, status: "failed", error: message });
          return { status: "failed", analysis: null, error: message };
        }
      }

      const yt = youtubeId(sub.video_url);
      if (!yt) {
        const msg =
          "Direct video file bytes must be re-selected and uploaded to analyze with Gemini.";
        upsertUserSubmission({ ...sub, status: "failed", error: msg });
        return { status: "failed", analysis: null, error: msg };
      }

      const matchedTechnique =
        SEED_TECHNIQUES.find((t) => t.id === sub.technique_id) ??
        SEED_TECHNIQUES.find((t) => t.name === sub.technique?.name) ??
        null;

      try {
        const { analysis } = await analyzeExerciseVideoWithGemini({
          title: sub.title,
          notes: sub.notes,
          athleteContext: claims.email ? `Member (${claims.email})` : undefined,
          technique: matchedTechnique,
          youtubeUrl: `https://www.youtube.com/watch?v=${yt}`,
        });
        upsertUserSubmission({
          ...sub,
          status: "complete",
          analysis,
          error: null,
          analyzed_at: new Date().toISOString(),
        });
        return { status: "complete", analysis };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Could not complete AI video analysis.";
        upsertUserSubmission({ ...sub, status: "failed", error: msg });
        return { status: "failed", analysis: null, error: msg };
      }
    },
  );
