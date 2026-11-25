import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

import type { Analysis } from "./analysis";
import { getMemberSubscription, readEnvFallback } from "./billing-store.server";
import { youtubeId } from "./format";
import {
  analyzeExerciseVideoWithGemini,
  isGeminiConfigured,
  MAX_VIDEO_UPLOAD_BYTES,
  resolveAllowedVideoMimeType,
  VideoAnalysisError,
} from "./gemini-video.server";
import { SEED_TECHNIQUES } from "./mock-seed";
import { decodeMockJwt } from "./mock-supabase";
import { getTierById } from "./plans";

export interface StoredVideoSubmission {
  id: string;
  user_id: string;
  title: string;
  video_url: string;
  source_type: "upload" | "youtube";
  file_name?: string | null;
  file_size_bytes?: number | null;
  notes: string;
  technique_id: string | null;
  technique: { name: string; sport: string } | null;
  status: "analyzing" | "complete" | "failed";
  analysis: Analysis | null;
  error: string | null;
  flagged?: boolean;
  flag_focus?: string | null;
  flag_note?: string | null;
  flag_status?: "pending_review" | "reviewed" | null;
  flagged_at?: string | null;
  created_at: string;
  analyzed_at: string | null;
}

const DATA_FILE = resolve(process.cwd(), ".data", "video-submissions.json");
const STORE_KEY = "__auctus_video_submissions__";

function loadSubmissionsStore(): StoredVideoSubmission[] {
  const g = globalThis as unknown as Record<string, StoredVideoSubmission[] | undefined>;
  if (g[STORE_KEY]) return g[STORE_KEY]!;
  try {
    if (existsSync(DATA_FILE)) {
      const parsed = JSON.parse(readFileSync(DATA_FILE, "utf8")) as StoredVideoSubmission[];
      if (Array.isArray(parsed)) {
        g[STORE_KEY] = parsed;
        return parsed;
      }
    }
  } catch {
    // Start cleanly when file is unreadable
  }
  const initial: StoredVideoSubmission[] = [];
  g[STORE_KEY] = initial;
  return initial;
}

function saveSubmissionsStore(list: StoredVideoSubmission[]): void {
  const g = globalThis as unknown as Record<string, StoredVideoSubmission[] | undefined>;
  g[STORE_KEY] = list;
  try {
    mkdirSync(dirname(DATA_FILE), { recursive: true });
    writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), "utf8");
  } catch {
    // Memory copy remains intact on read-only environments
  }
}

export function listUserSubmissions(userId: string): StoredVideoSubmission[] {
  return loadSubmissionsStore()
    .filter((item) => item.user_id === userId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getUserSubmissionById(
  userId: string,
  submissionId: string,
): StoredVideoSubmission | undefined {
  return loadSubmissionsStore().find((item) => item.id === submissionId && item.user_id === userId);
}

export function upsertUserSubmission(entry: StoredVideoSubmission): StoredVideoSubmission {
  const all = loadSubmissionsStore();
  const idx = all.findIndex((item) => item.id === entry.id && item.user_id === entry.user_id);
  const next = [...all];
  if (idx >= 0) {
    next[idx] = entry;
  } else {
    next.unshift(entry);
  }
  if (next.length > 500) next.length = 500;
  saveSubmissionsStore(next);
  return entry;
}

export function deleteUserSubmission(userId: string, submissionId: string): boolean {
  const all = loadSubmissionsStore();
  const next = all.filter((item) => !(item.id === submissionId && item.user_id === userId));
  if (next.length === all.length) return false;
  saveSubmissionsStore(next);
  return true;
}

interface AuthenticatedUser {
  userId: string;
  email?: string;
}

async function authenticateBearerRequest(request: Request): Promise<AuthenticatedUser | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice("Bearer ".length).trim();
  if (!token || token.split(".").length !== 3) return null;

  const supabaseUrl = readEnvFallback("SUPABASE_URL") ?? readEnvFallback("VITE_SUPABASE_URL");
  const supabaseKey =
    readEnvFallback("SUPABASE_PUBLISHABLE_KEY") ?? readEnvFallback("VITE_SUPABASE_PUBLISHABLE_KEY");

  if (!supabaseUrl || !supabaseKey) {
    const claims = decodeMockJwt(token);
    if (!claims?.sub) return null;
    return claims.email ? { userId: claims.sub, email: claims.email } : { userId: claims.sub };
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase.auth.getClaims(token);
    if (error || !data?.claims?.sub) return null;
    const email = typeof data.claims["email"] === "string" ? data.claims["email"] : undefined;
    return email ? { userId: data.claims.sub, email } : { userId: data.claims.sub };
  } catch {
    return null;
  }
}

function countMonthlyReviewsUsed(userId: string, excludeId?: string): number {
  const now = new Date();
  return listUserSubmissions(userId).filter((row) => {
    if (row.id === excludeId || row.status !== "complete") return false;
    const d = new Date(row.created_at);
    return d.getUTCFullYear() === now.getUTCFullYear() && d.getUTCMonth() === now.getUTCMonth();
  }).length;
}

export async function handleVideoApiRequest(request: Request): Promise<Response | null> {
  const url = new URL(request.url);

  if (url.pathname === "/api/video/submissions" && request.method === "GET") {
    const user = await authenticateBearerRequest(request);
    if (!user) {
      return Response.json(
        { error: "Please sign in to access your video analyses." },
        { status: 401 },
      );
    }
    return Response.json({
      geminiConfigured: isGeminiConfigured(),
      maxUploadBytes: MAX_VIDEO_UPLOAD_BYTES,
      submissions: listUserSubmissions(user.userId),
    });
  }

  if (url.pathname.startsWith("/api/video/submissions/") && request.method === "DELETE") {
    const user = await authenticateBearerRequest(request);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const submissionId = decodeURIComponent(
      url.pathname.slice("/api/video/submissions/".length),
    ).trim();
    if (!submissionId) {
      return Response.json({ error: "Submission ID required." }, { status: 400 });
    }
    const removed = deleteUserSubmission(user.userId, submissionId);
    if (!removed) {
      return Response.json({ error: "Submission not found." }, { status: 404 });
    }
    return Response.json({ ok: true });
  }

  if (url.pathname === "/api/video/flag" && request.method === "POST") {
    const user = await authenticateBearerRequest(request);
    if (!user) {
      return Response.json(
        { error: "Please sign in to flag a submission for deeper review." },
        { status: 401 },
      );
    }

    let submissionId = "";
    let flagFocus = "Form Breakdown";
    let flagNote = "";
    let action: "flag" | "unflag" = "flag";

    try {
      const body = (await request.json()) as Record<string, unknown>;
      submissionId = typeof body["submissionId"] === "string" ? body["submissionId"].trim() : "";
      flagFocus =
        typeof body["flagFocus"] === "string" && body["flagFocus"].trim()
          ? body["flagFocus"].trim().slice(0, 80)
          : "Form Breakdown";
      flagNote = typeof body["flagNote"] === "string" ? body["flagNote"].trim().slice(0, 600) : "";
      action = body["action"] === "unflag" ? "unflag" : "flag";
    } catch {
      return Response.json({ error: "Invalid request payload." }, { status: 400 });
    }

    if (!submissionId) {
      return Response.json({ error: "Submission ID is required." }, { status: 400 });
    }

    const existing = getUserSubmissionById(user.userId, submissionId);
    if (!existing) {
      return Response.json({ error: "Submission not found." }, { status: 404 });
    }

    const updated = upsertUserSubmission({
      ...existing,
      flagged: action === "flag",
      flag_focus: action === "flag" ? flagFocus : null,
      flag_note: action === "flag" ? flagNote : null,
      flag_status: action === "flag" ? "pending_review" : null,
      flagged_at: action === "flag" ? new Date().toISOString() : null,
    });

    return Response.json({ ok: true, submission: updated });
  }

  if (url.pathname === "/api/video/analyze" && request.method === "POST") {
    const user = await authenticateBearerRequest(request);
    if (!user) {
      return Response.json(
        { error: "Please sign in to submit a video for AI analysis." },
        { status: 401 },
      );
    }

    const memberSub = getMemberSubscription(user.userId);
    const activeTier =
      memberSub.status === "active" || memberSub.status === "trialing"
        ? getTierById(memberSub.plan)
        : undefined;

    const contentType = request.headers.get("content-type") ?? "";
    let title = "";
    let notes = "";
    let techniqueId = "";
    let youtubeUrl = "";
    let retryId = "";
    let uploadedFile:
      | {
          buffer: Buffer;
          fileName: string;
          mimeType: string;
        }
      | undefined;

    if (contentType.includes("multipart/form-data")) {
      let formData: FormData;
      try {
        formData = await request.formData();
      } catch {
        return Response.json(
          { error: "Failed to read uploaded video form data." },
          { status: 400 },
        );
      }

      title = String(formData.get("title") ?? "")
        .trim()
        .slice(0, 120);
      notes = String(formData.get("notes") ?? "")
        .trim()
        .slice(0, 2000);
      techniqueId = String(formData.get("techniqueId") ?? "")
        .trim()
        .slice(0, 120);
      youtubeUrl = String(formData.get("videoUrl") ?? "")
        .trim()
        .slice(0, 500);
      retryId = String(formData.get("retrySubmissionId") ?? "")
        .trim()
        .slice(0, 120);

      const maybeFile = formData.get("video");
      if (maybeFile && typeof maybeFile === "object" && "arrayBuffer" in maybeFile) {
        const fileObj = maybeFile as File;
        if (fileObj.size > MAX_VIDEO_UPLOAD_BYTES) {
          return Response.json(
            {
              error:
                "Uploaded video exceeds the 45 MB maximum size. Trim the clip or paste a public YouTube link.",
            },
            { status: 413 },
          );
        }
        const safeMime = resolveAllowedVideoMimeType(fileObj.name, fileObj.type);
        if (!safeMime) {
          return Response.json(
            { error: "Unsupported video file format. Please upload an .mp4, .mov, or .webm clip." },
            { status: 415 },
          );
        }
        const arrayBuf = await fileObj.arrayBuffer();
        uploadedFile = {
          buffer: Buffer.from(arrayBuf),
          fileName: fileObj.name || "training-clip.mp4",
          mimeType: safeMime,
        };
      }
    } else {
      try {
        const body = (await request.json()) as Record<string, unknown>;
        title = typeof body["title"] === "string" ? body["title"].trim().slice(0, 120) : "";
        notes = typeof body["notes"] === "string" ? body["notes"].trim().slice(0, 2000) : "";
        techniqueId =
          typeof body["techniqueId"] === "string" ? body["techniqueId"].trim().slice(0, 120) : "";
        youtubeUrl =
          typeof body["videoUrl"] === "string" ? body["videoUrl"].trim().slice(0, 500) : "";
        retryId =
          typeof body["retrySubmissionId"] === "string"
            ? body["retrySubmissionId"].trim().slice(0, 120)
            : "";
      } catch {
        return Response.json({ error: "Invalid request payload." }, { status: 400 });
      }
    }

    const existingRetry = retryId ? getUserSubmissionById(user.userId, retryId) : undefined;
    if (existingRetry) {
      if (!title) title = existingRetry.title;
      if (!notes) notes = existingRetry.notes;
      if (!techniqueId && existingRetry.technique_id) techniqueId = existingRetry.technique_id;
      if (!youtubeUrl && existingRetry.source_type === "youtube") {
        youtubeUrl = existingRetry.video_url;
      }
    }

    if (!uploadedFile && !youtubeUrl) {
      return Response.json(
        { error: "Select a video file (.mp4, .mov, .webm) or enter a public YouTube URL." },
        { status: 400 },
      );
    }

    if (youtubeUrl && !uploadedFile) {
      const yt = youtubeId(youtubeUrl);
      if (!yt) {
        return Response.json(
          {
            error:
              "Please enter a valid public YouTube URL (e.g., https://youtube.com/watch?v=...).",
          },
          { status: 400 },
        );
      }
      youtubeUrl = `https://www.youtube.com/watch?v=${yt}`;
    }

    if (!title) {
      title = uploadedFile
        ? uploadedFile.fileName
            .replace(/\.[^.]+$/, "")
            .replace(/[_-]+/g, " ")
            .slice(0, 120)
        : "YouTube Movement Review";
    }

    const submissionId = existingRetry?.id ?? randomUUID();

    if (activeTier && typeof activeTier.maxMonthlyReviews === "number") {
      const used = countMonthlyReviewsUsed(user.userId, submissionId);
      if (used >= activeTier.maxMonthlyReviews) {
        return Response.json(
          {
            error: `Monthly limit of ${activeTier.maxMonthlyReviews} video reviews reached on ${activeTier.name}. Upgrade on Pricing for more reviews.`,
          },
          { status: 403 },
        );
      }
    }

    const matchedTechnique =
      SEED_TECHNIQUES.find((t) => t.id === techniqueId) ??
      SEED_TECHNIQUES.find((t) => t.name === techniqueId) ??
      null;

    const record: StoredVideoSubmission = {
      id: submissionId,
      user_id: user.userId,
      title,
      video_url: uploadedFile
        ? `https://auctusperformance.app/upload/${encodeURIComponent(uploadedFile.fileName)}`
        : youtubeUrl,
      source_type: uploadedFile ? "upload" : "youtube",
      file_name: uploadedFile ? uploadedFile.fileName : null,
      file_size_bytes: uploadedFile ? uploadedFile.buffer.byteLength : null,
      notes,
      technique_id: matchedTechnique?.id ?? (techniqueId || null),
      technique: matchedTechnique
        ? { name: matchedTechnique.name, sport: matchedTechnique.sport }
        : (existingRetry?.technique ?? null),
      status: "analyzing",
      analysis: null,
      error: null,
      created_at: existingRetry?.created_at ?? new Date().toISOString(),
      analyzed_at: null,
    };
    upsertUserSubmission(record);

    try {
      const { analysis } = await analyzeExerciseVideoWithGemini({
        title,
        notes,
        athleteContext: user.email ? `Member (${user.email})` : undefined,
        technique: matchedTechnique
          ? {
              sport: matchedTechnique.sport,
              name: matchedTechnique.name,
              summary: matchedTechnique.summary,
              key_cues: matchedTechnique.key_cues,
              common_faults: matchedTechnique.common_faults,
              drills: matchedTechnique.drills,
            }
          : null,
        ...(uploadedFile ? { uploadedFile } : { youtubeUrl }),
      });

      const completed = upsertUserSubmission({
        ...record,
        status: "complete",
        analysis,
        error: null,
        analyzed_at: new Date().toISOString(),
      });

      return Response.json({ ok: true, submission: completed });
    } catch (err) {
      const analysisError =
        err instanceof VideoAnalysisError
          ? err
          : new VideoAnalysisError(
              err instanceof Error ? err.message : "Could not complete AI video analysis.",
              502,
            );
      const failed = upsertUserSubmission({
        ...record,
        status: "failed",
        error: analysisError.message,
      });
      return Response.json(
        {
          ok: false,
          error: analysisError.message,
          code: analysisError.code,
          submission: failed,
        },
        { status: analysisError.status },
      );
    }
  }

  return null;
}
