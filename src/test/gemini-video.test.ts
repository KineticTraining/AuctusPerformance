import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { generateContentMock, filesUploadMock, filesGetMock, filesDeleteMock, googleGenAICtorMock } =
  vi.hoisted(() => {
    const generateContent = vi.fn();
    const filesUpload = vi.fn();
    const filesGet = vi.fn();
    const filesDelete = vi.fn();
    const ctor = vi.fn();
    return {
      generateContentMock: generateContent,
      filesUploadMock: filesUpload,
      filesGetMock: filesGet,
      filesDeleteMock: filesDelete,
      googleGenAICtorMock: ctor,
    };
  });

vi.mock("@google/genai", async () => {
  const actual = await vi.importActual<typeof import("@google/genai")>("@google/genai");
  return {
    ...actual,
    GoogleGenAI: class MockGoogleGenAI {
      models = { generateContent: generateContentMock };
      files = {
        upload: filesUploadMock,
        get: filesGetMock,
        delete: filesDeleteMock,
      };
      constructor(opts: unknown) {
        googleGenAICtorMock(opts);
      }
    },
  };
});

import { normalizeAnalysis } from "@/lib/analysis";
import {
  analyzeExerciseVideoWithGemini,
  GEMINI_VIDEO_MODEL,
  MAX_VIDEO_UPLOAD_BYTES,
  resolveAllowedVideoMimeType,
  VideoAnalysisError,
} from "@/lib/gemini-video.server";
import { PRICING_TIERS } from "@/lib/plans";

const SAMPLE_AI_JSON = JSON.stringify({
  video_reviewed: true,
  overall_score: 8,
  summary: "Explosive first-step hip drive with minor knee valgus on the transition step.",
  what_went_well: [
    "Strong forward shin angle on initial acceleration push",
    "Crisp arm swing synchronized with hip extension",
  ],
  areas_to_improve: [
    "Left knee drifts medially on step 2 ground contact",
    "Torso rises slightly too early past 10 meters",
  ],
  corrective_drills: [
    {
      target_area: "Left knee frontal-plane stability",
      cue: "Drive the knee over the second toe and grip the turf.",
      drill: "3 × 6 single-leg banded wall drives with 2-second isometric hold",
    },
    {
      target_area: "Early torso rise",
      cue: "Keep nose over front toe through steps 1–4.",
      drill: "4 × 15m heavy sled march at 50% bodyweight load",
    },
  ],
  next_session: "Warm up with 2 sets of ankle stiffness pogos before full sprint reps.",
});

describe("Gemini Video Analyzer", () => {
  const savedEnv: Record<string, string | undefined> = {};

  beforeEach(() => {
    savedEnv["GEMINI_API_KEY"] = process.env["GEMINI_API_KEY"];
    savedEnv["GOOGLE_API_KEY"] = process.env["GOOGLE_API_KEY"];
    savedEnv["VITE_GEMINI_API_KEY"] = process.env["VITE_GEMINI_API_KEY"];
    process.env["GEMINI_API_KEY"] = "test-gemini-key-xyz";
    generateContentMock.mockReset();
    filesUploadMock.mockReset();
    filesGetMock.mockReset();
    filesDeleteMock.mockReset();
    googleGenAICtorMock.mockReset();
    filesDeleteMock.mockResolvedValue({});
  });

  afterEach(() => {
    for (const key of ["GEMINI_API_KEY", "GOOGLE_API_KEY", "VITE_GEMINI_API_KEY"] as const) {
      if (savedEnv[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = savedEnv[key];
      }
    }
  });

  it("validates supported video MIME types and extensions", () => {
    expect(resolveAllowedVideoMimeType("squat.mp4", "video/mp4")).toBe("video/mp4");
    expect(resolveAllowedVideoMimeType("sprint.MOV", "application/octet-stream")).toBe(
      "video/quicktime",
    );
    expect(resolveAllowedVideoMimeType("lift.webm", "video/webm;codecs=vp9")).toBe("video/webm");
    expect(resolveAllowedVideoMimeType("clean.m4v", "video/x-m4v")).toBe("video/mp4");
    expect(resolveAllowedVideoMimeType("notes.txt", "text/plain")).toBeNull();
    expect(resolveAllowedVideoMimeType("legacy.avi", "video/x-msvideo")).toBeNull();
  });

  it("throws actionable VideoAnalysisError when GEMINI_API_KEY is missing", async () => {
    delete process.env["GEMINI_API_KEY"];
    delete process.env["GOOGLE_API_KEY"];
    delete process.env["VITE_GEMINI_API_KEY"];

    await expect(
      analyzeExerciseVideoWithGemini({
        title: "Sprint block start",
        notes: "Check shin angle",
        youtubeUrl: "https://youtu.be/dQw4w9WgXcQ",
      }),
    ).rejects.toMatchObject({
      name: "VideoAnalysisError",
      status: 503,
      code: "GEMINI_KEY_MISSING",
    });
  });

  it("rejects oversized files (>45MB), unsupported formats, and invalid YouTube URLs", async () => {
    await expect(
      analyzeExerciseVideoWithGemini({
        title: "Too large",
        notes: "Check depth",
        uploadedFile: {
          buffer: Buffer.alloc(MAX_VIDEO_UPLOAD_BYTES + 1),
          fileName: "heavy.mp4",
          mimeType: "video/mp4",
        },
      }),
    ).rejects.toMatchObject({ status: 413, code: "VIDEO_TOO_LARGE" });

    await expect(
      analyzeExerciseVideoWithGemini({
        title: "Bad ext",
        notes: "Check form",
        uploadedFile: {
          buffer: Buffer.from("fake-avi-bytes"),
          fileName: "clip.avi",
          mimeType: "video/x-msvideo",
        },
      }),
    ).rejects.toMatchObject({ status: 415, code: "UNSUPPORTED_MEDIA_TYPE" });

    await expect(
      analyzeExerciseVideoWithGemini({
        title: "Bad link",
        notes: "Check jump",
        youtubeUrl: "https://evil.example.com/video.mp4",
      }),
    ).rejects.toBeInstanceOf(VideoAnalysisError);
  });

  it("analyzes uploaded small MP4 clip inline via gemini-4-hydrogen", async () => {
    generateContentMock.mockResolvedValue({ text: SAMPLE_AI_JSON });
    const fakeVideo = Buffer.from("00000018ftypmp4200000000mp42isom", "utf8");

    const result = await analyzeExerciseVideoWithGemini({
      title: "Block Acceleration",
      notes: "Felt heavy on step 2",
      uploadedFile: {
        buffer: fakeVideo,
        fileName: "sprint-clip.mp4",
        mimeType: "video/mp4",
      },
    });

    expect(googleGenAICtorMock).toHaveBeenCalledWith({
      apiKey: "test-gemini-key-xyz",
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });
    expect(generateContentMock).toHaveBeenCalledTimes(1);

    const callArg = generateContentMock.mock.calls[0]?.[0] as {
      model: string;
      contents: Array<{ inlineData?: { mimeType: string; data: string }; text?: string }>;
    };
    expect(callArg.model).toBe(GEMINI_VIDEO_MODEL);
    expect(GEMINI_VIDEO_MODEL).toBe("gemini-4-hydrogen");
    expect(callArg.contents[0]?.inlineData?.mimeType).toBe("video/mp4");
    expect(callArg.contents[0]?.inlineData?.data).toBe(fakeVideo.toString("base64"));

    expect(result.normalized.what_went_well).toHaveLength(2);
    expect(result.normalized.areas_to_improve).toHaveLength(2);
    expect(result.normalized.corrective_drills).toHaveLength(2);
    expect(result.analysis.overall_score).toBe(8);
  });

  it("uploads larger clips (>14MB) through Gemini Files API and deletes afterward", async () => {
    filesUploadMock.mockResolvedValue({ name: "files/video-123" });
    filesGetMock.mockResolvedValue({
      state: "ACTIVE",
      uri: "https://generativelanguage.googleapis.com/v1beta/files/video-123",
      mimeType: "video/quicktime",
    });
    generateContentMock.mockResolvedValue({ text: SAMPLE_AI_JSON });

    const largeClip = Buffer.alloc(15 * 1024 * 1024, 1);
    const result = await analyzeExerciseVideoWithGemini({
      title: "Barbell Back Squat",
      notes: "Bar path drift check",
      uploadedFile: {
        buffer: largeClip,
        fileName: "squat-heavy.mov",
        mimeType: "video/quicktime",
      },
    });

    expect(filesUploadMock).toHaveBeenCalledTimes(1);
    expect(filesGetMock).toHaveBeenCalledWith({ name: "files/video-123" });
    expect(filesDeleteMock).toHaveBeenCalledWith({ name: "files/video-123" });
    expect(result.normalized.corrective_drills[0]?.target_area).toBe(
      "Left knee frontal-plane stability",
    );
  });

  it("canonicalizes public YouTube URLs into fileData parts", async () => {
    generateContentMock.mockResolvedValue({ text: SAMPLE_AI_JSON });

    await analyzeExerciseVideoWithGemini({
      title: "Jump Shot Release",
      notes: "Elbow alignment at release",
      youtubeUrl: "https://youtu.be/dQw4w9WgXcQ?t=4",
    });

    const callArg = generateContentMock.mock.calls[0]?.[0] as {
      contents: Array<{ fileData?: { fileUri: string; mimeType: string } }>;
    };
    expect(callArg.contents[0]?.fileData).toEqual({
      fileUri: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      mimeType: "video/*",
    });
  });

  it("normalizes both modern 3-section and legacy AI feedback shapes", () => {
    const legacy = normalizeAnalysis({
      video_reviewed: true,
      overall_score: 7,
      summary: "Good base.",
      strengths: ["Quick ground contact"],
      improvements: [
        {
          issue: "Shoulder rounding",
          cue: "Ribs stacked over pelvis",
          drill: "2x10 wall slides",
        },
      ],
      next_session: "Add 2 warm-up sets.",
    });
    expect(legacy?.what_went_well).toEqual(["Quick ground contact"]);
    expect(legacy?.areas_to_improve).toEqual(["Shoulder rounding"]);
    expect(legacy?.corrective_drills[0]?.drill).toBe("2x10 wall slides");
  });

  it("maintains required Auctus Performance pricing tier structure", () => {
    const basic = PRICING_TIERS.find((p) => p.id === "basic");
    const pro = PRICING_TIERS.find((p) => p.id === "pro");
    const unlimMonth = PRICING_TIERS.find((p) => p.id === "unlimited_monthly");
    const unlimYear = PRICING_TIERS.find((p) => p.id === "unlimited_annual");

    expect(basic?.amountCents).toBe(4500);
    expect(basic?.maxSportFilters).toBe(2);
    expect(basic?.maxMonthlyReviews).toBe(20);

    expect(pro?.amountCents).toBe(7000);
    expect(pro?.maxSportFilters).toBe(5);
    expect(pro?.maxMonthlyReviews).toBe(40);

    expect(unlimMonth?.amountCents).toBe(10000);
    expect(unlimMonth?.maxMonthlyReviews).toBeNull();

    expect(unlimYear?.amountCents).toBe(100000);
    expect(unlimYear?.maxMonthlyReviews).toBeNull();
  });
});
