import { GoogleGenAI, Type, type Part } from "@google/genai";
import {
  analysisSchema,
  normalizeAnalysis,
  type Analysis,
  type NormalizedAnalysis,
} from "./analysis";
import { readEnvFallback } from "./billing-store.server";
import { youtubeId } from "./format";

export const GEMINI_VIDEO_MODEL = "gemini-4-hydrogen" as const;
export const MAX_VIDEO_UPLOAD_BYTES = 45 * 1024 * 1024; // 45 MB
const INLINE_VIDEO_BYTES_LIMIT = 14 * 1024 * 1024; // 14 MB (stays well under 20 MB after base64)

const ALLOWED_VIDEO_MIME_BY_EXT: Record<string, string> = {
  ".mp4": "video/mp4",
  ".m4v": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
};

const ALLOWED_VIDEO_MIME_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-m4v",
]);

export class VideoAnalysisError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 500, code = "ANALYSIS_FAILED") {
    super(message);
    this.name = "VideoAnalysisError";
    this.status = status;
    this.code = code;
  }
}

export function resolveGeminiApiKey(): string | undefined {
  return (
    readEnvFallback("GEMINI_API_KEY") ??
    readEnvFallback("GOOGLE_API_KEY") ??
    readEnvFallback("VITE_GEMINI_API_KEY")
  );
}

export function isGeminiConfigured(): boolean {
  return Boolean(resolveGeminiApiKey());
}

export function resolveAllowedVideoMimeType(fileName: string, reportedMime: string): string | null {
  const normalizedMime = reportedMime.split(";")[0]?.trim().toLowerCase() ?? "";
  if (ALLOWED_VIDEO_MIME_TYPES.has(normalizedMime)) {
    return normalizedMime === "video/x-m4v" ? "video/mp4" : normalizedMime;
  }
  const lowerName = fileName.trim().toLowerCase();
  const dotIdx = lowerName.lastIndexOf(".");
  if (dotIdx >= 0) {
    const ext = lowerName.slice(dotIdx);
    if (ALLOWED_VIDEO_MIME_BY_EXT[ext]) {
      return ALLOWED_VIDEO_MIME_BY_EXT[ext];
    }
  }
  return null;
}

export interface TechniqueReferenceInput {
  sport?: string;
  name?: string;
  summary?: string;
  key_cues?: string[];
  common_faults?: string[];
  drills?: string[];
}

export interface AnalyzeVideoInput {
  title: string;
  notes: string;
  athleteContext?: string | undefined;
  technique?: TechniqueReferenceInput | null | undefined;
  uploadedFile?:
    | {
        buffer: Buffer;
        fileName: string;
        mimeType: string;
      }
    | undefined;
  youtubeUrl?: string | undefined;
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  required: [
    "video_reviewed",
    "overall_score",
    "summary",
    "what_went_well",
    "areas_to_improve",
    "corrective_drills",
    "next_session",
  ],
  properties: {
    video_reviewed: {
      type: Type.BOOLEAN,
      description: "Set to true when the video frames/clip content were observed directly.",
    },
    overall_score: {
      type: Type.INTEGER,
      description: "Technique execution score from 1 to 10.",
    },
    summary: {
      type: Type.STRING,
      description: "Concise 2-3 sentence biomechanical summary of the rep or movement sequence.",
    },
    what_went_well: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "2 to 4 concrete mechanical strengths observed in the clip.",
    },
    areas_to_improve: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "2 to 4 specific form leaks, posture, timing, or efficiency issues.",
    },
    corrective_drills: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ["target_area", "cue", "drill"],
        properties: {
          target_area: {
            type: Type.STRING,
            description: "The specific mechanical leak this drill targets.",
          },
          cue: {
            type: Type.STRING,
            description: "Short, easy-to-remember coaching cue.",
          },
          drill: {
            type: Type.STRING,
            description: "Actionable corrective drill with exact sets and reps.",
          },
        },
      },
      description: "2 to 4 actionable corrective drills and cues fixing the areas to improve.",
    },
    next_session: {
      type: Type.STRING,
      description: "One concrete focus or warm-up progression for the athlete's next session.",
    },
  },
};

function buildSportsScienceSystemPrompt(): string {
  return [
    "You are an elite strength, speed, and biomechanics sports-science coach for Auctus Performance.",
    "Carefully watch and analyze the submitted athlete exercise video alongside the athlete's movement notes and reference cues.",
    "Break down the mechanics into three crisp coaching sections:",
    "1) What Went Well (key mechanical strengths, posture, joint alignment, rhythm, force application).",
    "2) Areas to Improve (specific form leaks, posture breakdowns, timing delays, asymmetry, or efficiency losses).",
    "3) Actionable Corrective Drills & Cues (simple external coaching cues paired with exact drills, sets, and reps).",
    "Be honest, constructive, and specific to the movement shown. Never invent movements you did not observe.",
    "Return valid JSON matching the response schema.",
  ].join(" ");
}

function buildTechniqueBlock(technique?: TechniqueReferenceInput | null): string {
  if (!technique?.name) {
    return "Reference model: Identify the movement/exercise directly from the video and athlete notes and apply evidence-based biomechanics coaching principles.";
  }
  return [
    `TECHNIQUE REFERENCE: ${technique.name}${technique.sport ? ` (${technique.sport})` : ""}`,
    technique.summary ? `Model: ${technique.summary}` : null,
    technique.key_cues?.length ? `Key cues:\n- ${technique.key_cues.join("\n- ")}` : null,
    technique.common_faults?.length
      ? `Common faults:\n- ${technique.common_faults.join("\n- ")}`
      : null,
    technique.drills?.length ? `Reference drills:\n- ${technique.drills.join("\n- ")}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");
}

function parseGeminiError(err: unknown): VideoAnalysisError {
  if (err instanceof VideoAnalysisError) return err;
  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();

  if (lower.includes("api key") || lower.includes("api_key") || lower.includes("unauthenticated")) {
    return new VideoAnalysisError(
      "Gemini API authentication failed. Verify GEMINI_API_KEY in server environment secrets.",
      503,
      "GEMINI_AUTH_FAILED",
    );
  }
  if (lower.includes("quota") || lower.includes("429") || lower.includes("rate limit")) {
    return new VideoAnalysisError(
      "Gemini AI is experiencing high traffic (rate limit). Please wait a moment and try again.",
      429,
      "GEMINI_RATE_LIMIT",
    );
  }
  if (lower.includes("private") || lower.includes("unavailable") || lower.includes("youtube")) {
    return new VideoAnalysisError(
      "Could not access that YouTube video. Make sure the link is Public or Unlisted (not Private), or upload an MP4/MOV/WebM clip directly.",
      422,
      "VIDEO_UNACCESSIBLE",
    );
  }
  if (lower.includes("too large") || lower.includes("payload") || lower.includes("size")) {
    return new VideoAnalysisError(
      "The video clip is too large for processing. Trim it under 45 MB (15–45 seconds works best).",
      413,
      "VIDEO_TOO_LARGE",
    );
  }
  return new VideoAnalysisError(
    `AI video analysis failed: ${message.slice(0, 220)}`,
    502,
    "GEMINI_REQUEST_FAILED",
  );
}

async function waitForGeminiFileActive(
  ai: GoogleGenAI,
  fileName: string,
): Promise<{ uri: string; mimeType: string }> {
  const deadline = Date.now() + 45_000;
  while (Date.now() < deadline) {
    const file = await ai.files.get({ name: fileName });
    if (file.state === "ACTIVE" && file.uri) {
      return {
        uri: file.uri,
        mimeType: file.mimeType ?? "video/mp4",
      };
    }
    if (file.state === "FAILED") {
      throw new VideoAnalysisError(
        "Gemini could not decode this video file. Try re-exporting as standard H.264 MP4 or WebM.",
        422,
        "GEMINI_FILE_PROCESSING_FAILED",
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  throw new VideoAnalysisError(
    "Video processing timed out on the AI server. Try trimming the clip under 30 seconds.",
    504,
    "GEMINI_FILE_TIMEOUT",
  );
}

export async function analyzeExerciseVideoWithGemini(
  input: AnalyzeVideoInput,
): Promise<{ analysis: Analysis; normalized: NormalizedAnalysis }> {
  const apiKey = resolveGeminiApiKey();
  if (!apiKey) {
    throw new VideoAnalysisError(
      "Gemini API key is missing. Add GEMINI_API_KEY in server environment secrets and restart the server to run AI video analysis.",
      503,
      "GEMINI_KEY_MISSING",
    );
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { "User-Agent": "aistudio-build" } },
  });

  const parts: Part[] = [];
  let uploadedFileName: string | null = null;

  if (input.uploadedFile) {
    const { buffer, fileName, mimeType } = input.uploadedFile;
    if (buffer.byteLength === 0) {
      throw new VideoAnalysisError("Uploaded video file is empty.", 400, "EMPTY_FILE");
    }
    if (buffer.byteLength > MAX_VIDEO_UPLOAD_BYTES) {
      throw new VideoAnalysisError(
        "Uploaded video exceeds the 45 MB maximum size. Trim the clip or paste a public YouTube URL.",
        413,
        "VIDEO_TOO_LARGE",
      );
    }
    const safeMime = resolveAllowedVideoMimeType(fileName, mimeType);
    if (!safeMime) {
      throw new VideoAnalysisError(
        "Unsupported video format. Upload an .mp4, .mov, or .webm clip.",
        415,
        "UNSUPPORTED_MEDIA_TYPE",
      );
    }

    if (buffer.byteLength <= INLINE_VIDEO_BYTES_LIMIT) {
      parts.push({
        inlineData: {
          mimeType: safeMime,
          data: buffer.toString("base64"),
        },
      });
    } else {
      const uploaded = await ai.files.upload({
        file: new Blob([new Uint8Array(buffer)], { type: safeMime }),
        config: {
          mimeType: safeMime,
          displayName: fileName.slice(0, 120),
        },
      });
      if (!uploaded.name) {
        throw new VideoAnalysisError("Failed to stage uploaded video clip.", 502, "UPLOAD_FAILED");
      }
      uploadedFileName = uploaded.name;
      const active = await waitForGeminiFileActive(ai, uploaded.name);
      parts.push({
        fileData: {
          fileUri: active.uri,
          mimeType: active.mimeType,
        },
      });
    }
  } else if (input.youtubeUrl) {
    const id = youtubeId(input.youtubeUrl);
    if (!id) {
      throw new VideoAnalysisError(
        "Enter a valid public YouTube URL (e.g., https://youtube.com/watch?v=...).",
        400,
        "INVALID_YOUTUBE_URL",
      );
    }
    parts.push({
      fileData: {
        fileUri: `https://www.youtube.com/watch?v=${id}`,
        mimeType: "video/*",
      },
    });
  } else {
    throw new VideoAnalysisError(
      "Provide either a video clip (.mp4, .mov, .webm) or a public YouTube URL.",
      400,
      "NO_VIDEO_SOURCE",
    );
  }

  const promptText = [
    input.athleteContext ? `ATHLETE: ${input.athleteContext}` : null,
    `SESSION TITLE: ${input.title}`,
    `MOVEMENT / ATHLETE NOTES: ${input.notes || "(No extra notes provided)"}`,
    buildTechniqueBlock(input.technique),
  ]
    .filter(Boolean)
    .join("\n\n");

  parts.push({ text: promptText });

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_VIDEO_MODEL,
      contents: parts,
      config: {
        systemInstruction: buildSportsScienceSystemPrompt(),
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const rawText = (response.text ?? "").trim();
    if (!rawText) {
      throw new VideoAnalysisError(
        "Gemini returned an empty response for this video clip. Please retry.",
        502,
        "EMPTY_AI_RESPONSE",
      );
    }

    const cleanedJson = rawText.replace(/^```(?:json)?\s*|\s*```$/g, "");
    const rawParsed = JSON.parse(cleanedJson) as unknown;
    const validated = analysisSchema.parse(rawParsed);
    const normalized = normalizeAnalysis(validated);
    if (!normalized) {
      throw new VideoAnalysisError("AI output failed coaching structure validation.", 502);
    }

    const storedAnalysis: Analysis = {
      video_reviewed: validated.video_reviewed,
      overall_score: Math.min(10, Math.max(1, Math.round(validated.overall_score))),
      summary: normalized.summary,
      what_went_well: normalized.what_went_well,
      areas_to_improve: normalized.areas_to_improve,
      corrective_drills: normalized.corrective_drills,
      strengths: normalized.what_went_well,
      improvements: normalized.corrective_drills.map((d, idx) => ({
        issue: d.target_area || normalized.areas_to_improve[idx] || "Movement mechanics",
        cue: d.cue,
        drill: d.drill,
      })),
      next_session: normalized.next_session,
    };

    return { analysis: storedAnalysis, normalized };
  } catch (err) {
    throw parseGeminiError(err);
  } finally {
    if (uploadedFileName) {
      await ai.files.delete({ name: uploadedFileName }).catch(() => {});
    }
  }
}
