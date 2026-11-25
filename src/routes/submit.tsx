import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertCircle,
  CheckCircle2,
  Dumbbell,
  Film,
  Flag,
  Link2,
  Loader2,
  Play,
  RotateCw,
  Target,
  Trash2,
  UploadCloud,
  Wrench,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import { toast } from "sonner";

import { PageWithOutline, type OutlineSection } from "@/components/site/page-outline";
import { SubmitSkeleton } from "@/components/site/page-skeletons";
import { WorkspaceTabs } from "@/components/site/workspace-tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { normalizeAnalysis, type Analysis } from "@/lib/analysis";
import {
  AUCTUS_STATE_EVENT,
  loadPreviewTier,
  savePreviewTier,
  type PreviewTier,
} from "@/lib/athlete-notes";
import { getBillingStatus } from "@/lib/billing.functions";
import { formatDate, youtubeId } from "@/lib/format";
import { SEED_TECHNIQUES } from "@/lib/mock-seed";
import { getTierById } from "@/lib/plans";
import { cn } from "@/lib/utils";
import type { StoredVideoSubmission } from "@/lib/video-submissions.server";

const MAX_CLIENT_VIDEO_BYTES = 45 * 1024 * 1024; // 45 MB
const ALLOWED_EXTENSIONS = [".mp4", ".mov", ".webm", ".m4v"];
const ALLOWED_MIME_TYPES = new Set(["video/mp4", "video/quicktime", "video/webm", "video/x-m4v"]);
const DEMO_SUBMISSIONS_STORAGE_KEY = "auctus_demo_video_analyses_v1";

type AnalysisStage = "idle" | "uploading" | "analyzing" | "complete" | "error";

interface DemoSubmission extends StoredVideoSubmission {
  is_demo: true;
}

const FLAG_FOCUS_OPTIONS = [
  "Form Breakdown",
  "Asymmetry Check",
  "Load Progression",
  "Movement Comfort Screen",
] as const;

const SUBMIT_OUTLINE: OutlineSection[] = [
  { id: "video-demo", label: "Interactive Demo" },
  { id: "video-upload", label: "Upload & Analyze" },
  { id: "video-flagged", label: "Flagged Queue" },
  { id: "video-results", label: "Analysis Results" },
];

interface DemoPreset {
  id: string;
  label: string;
  title: string;
  sport: string;
  notes: string;
  analysis: Analysis;
}

const DEMO_PRESETS: DemoPreset[] = [
  {
    id: "demo-back-squat",
    label: "Back Squat @ 82%",
    title: "Demo: Barbell Back Squat — 3 Reps @ 82%",
    sport: "Strength",
    notes:
      "Working set at RPE 8. Focusing on bottom-position knee tracking and torso angle out of the hole.",
    analysis: {
      video_reviewed: true,
      overall_score: 8,
      summary:
        "Consistent depth below parallel across all three repetitions with a tight upper-back shelf and steady tempo into the bottom. Slight forward hip rise on the transition out of rep three reduces bar speed slightly.",
      what_went_well: [
        "Bar path tracks vertically over mid-foot on descent with zero heel lift.",
        "Ribcage stays stacked over pelvis throughout the eccentric phase.",
        "Controlled 2-second lowering cadence avoids bouncing out of the bottom.",
      ],
      areas_to_improve: [
        "Right knee caves slightly inward (valgus) as concentric drive begins on rep 3.",
        "Hips rise 1–2 inches faster than the chest during the sticking point.",
      ],
      corrective_drills: [
        {
          target_area: "Concentric torso-hip timing",
          cue: "Push shoulders up into the bar as fast as your hips rise",
          drill: "Paused High-Bar Squat — 3 sets × 3 reps (2-sec pause at parallel @ 65–70%)",
        },
        {
          target_area: "Knee tracking stability",
          cue: "Screw feet outward into the floor before every rep",
          drill: "Tempo Goblet Squat with light mini-band — 2 sets × 8 reps",
        },
      ],
      next_session:
        "Keep working sets at RPE 7.5–8 while opening warm-up ramps with 2 paused squat sets to reinforce chest-first drive.",
    },
  },
  {
    id: "demo-sprint-start",
    label: "Sprint Start — 20m",
    title: "Demo: 20m Acceleration Start — Turf",
    sport: "Track & Field",
    notes: "Two-point stance focusing on low shin angles over the first four ground contacts.",
    analysis: {
      video_reviewed: true,
      overall_score: 8,
      summary:
        "Strong initial projection angle off the first step with decisive arm swing splitting cleanly at the torso. Step three overstrides slightly in front of the center of mass, causing brief upright pop-up.",
      what_went_well: [
        "Front shin projects forward cleanly at ~45 degrees through steps one and two.",
        "Aggressive backward punch of the swing leg creates stiff early contact.",
      ],
      areas_to_improve: [
        "Foot strike on step three lands slightly ahead of the hip, creating brief braking.",
        "Head lifts early toward upright posture before the 10-meter mark.",
      ],
      corrective_drills: [
        {
          target_area: "Piston-like foot strike under hip",
          cue: "Strike back behind your hip rather than reaching forward",
          drill: "Wall Sprint Switches (Single & Triple) — 3 sets × 4 switches per leg",
        },
        {
          target_area: "Gradual rise out of drive phase",
          cue: "Keep eyes 3 meters ahead of your feet for the first 6 steps",
          drill: "15m Heavy Sled Push (moderate load) — 4 reps with 2 min full rest",
        },
      ],
      next_session:
        "Pair two crisp 15m wall-to-turf acceleration contrasts before higher-velocity flying sprints.",
    },
  },
  {
    id: "demo-jump-landing",
    label: "Court Landing Mechanics",
    title: "Demo: Approach Jump & Two-Foot Deceleration",
    sport: "Basketball",
    notes: "Checking knee valgus and landing quietness after a two-foot gather jump.",
    analysis: {
      video_reviewed: true,
      overall_score: 7,
      summary:
        "Explosive upward hip extension and clean arm gather produce solid vertical height. On landing, ankles stiffen slightly early while knees drift toward midline during deeper absorption.",
      what_went_well: [
        "Clean penultimate step converts horizontal approach momentum upward.",
        "Trunk stays balanced in mid-air without drifting laterally.",
      ],
      areas_to_improve: [
        "Loud forefoot impact and minimal hip hinge on initial deceleration contact.",
        "Symmetry gap: left knee translates inward slightly more than right on deep catch.",
      ],
      corrective_drills: [
        {
          target_area: "Quiet multi-joint shock absorption",
          cue: "Catch like a spring — hips back, quiet feet, chest tall",
          drill: "Altitude Drop to Stick (16-inch box) — 3 sets × 4 reps with 2-sec stick",
        },
        {
          target_area: "Single-leg frontal-plane control",
          cue: "Keep knee aligned over second and third toe",
          drill: "Single-Leg Skater Hop to Stick — 3 sets × 5 / side",
        },
      ],
      next_session:
        "Open lower-body court prep with 3 sets of low-box altitude landings before plyometric work.",
    },
  },
];

interface SubmissionsApiResponse {
  geminiConfigured?: boolean;
  maxUploadBytes?: number;
  submissions?: StoredVideoSubmission[];
  error?: string;
}

async function getAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

const submitQuery = () =>
  queryOptions({
    queryKey: ["submissions"],
    queryFn: async () => {
      if (typeof window === "undefined") {
        return {
          techniques: SEED_TECHNIQUES.map((tech) => ({
            id: tech.id,
            sport: tech.sport,
            name: tech.name,
          })),
          geminiConfigured: true,
          submissions: [] as StoredVideoSubmission[],
        };
      }

      const token = await getAccessToken();
      const [techRes, videoApiRes] = await Promise.all([
        supabase
          .from("techniques")
          .select("id, sport, name")
          .order("sport")
          .order("name")
          .then(
            (r) => r,
            () => ({ data: null }),
          ),
        token
          ? fetch("/api/video/submissions", {
              headers: { Authorization: `Bearer ${token}` },
            })
              .then(async (res) => {
                if (!res.ok) return { geminiConfigured: true, submissions: [] };
                return (await res.json()) as SubmissionsApiResponse;
              })
              .catch(() => ({ geminiConfigured: true, submissions: [] }) as SubmissionsApiResponse)
          : Promise.resolve({ geminiConfigured: true, submissions: [] } as SubmissionsApiResponse),
      ]);

      const techniques =
        techRes.data && techRes.data.length > 0
          ? techRes.data
          : SEED_TECHNIQUES.map((tech) => ({ id: tech.id, sport: tech.sport, name: tech.name }));

      return {
        techniques,
        geminiConfigured: videoApiRes.geminiConfigured ?? true,
        submissions: videoApiRes.submissions ?? [],
      };
    },
  });

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "AI Video Upload & Analysis — Auctus Performance" },
      {
        name: "description",
        content:
          "Upload an exercise clip (.mp4, .mov, .webm), paste a YouTube URL, or run the interactive AI Video Demo and Flag for Deeper Review workflow.",
      },
      { property: "og:title", content: "AI Video Upload & Analysis — Auctus Performance" },
      {
        property: "og:description",
        content:
          "Upload a training video clip, run a sample AI demo analysis, and track clips flagged for deeper coach review.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  pendingComponent: SubmitSkeleton,
  loader: ({ context }) => context.queryClient.ensureQueryData(submitQuery()),
  component: SubmitPage,
});

function isCurrentMonth(iso: string): boolean {
  const now = new Date();
  const d = new Date(iso);
  return d.getUTCFullYear() === now.getUTCFullYear() && d.getUTCMonth() === now.getUTCMonth();
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateVideoFile(file: File): string | null {
  if (file.size === 0) return "Selected video file is empty.";
  if (file.size > MAX_CLIENT_VIDEO_BYTES) {
    return `File is too large (${formatFileSize(file.size)}). Maximum clip size is 45 MB—trim your clip or paste a public YouTube URL.`;
  }
  const lowerName = file.name.toLowerCase();
  const hasAllowedExt = ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  const normalizedMime = file.type.split(";")[0]?.trim().toLowerCase() ?? "";
  if (!ALLOWED_MIME_TYPES.has(normalizedMime) && !hasAllowedExt) {
    return "Unsupported file format. Please choose an .mp4, .mov, or .webm video clip.";
  }
  return null;
}

function uploadVideoWithProgress(
  formData: FormData,
  token: string,
  onUploadProgress: (percent: number) => void,
  onUploadFinished: () => void,
): Promise<{
  status: number;
  body: { ok?: boolean; error?: string; submission?: StoredVideoSubmission };
}> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/video/analyze");
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable && evt.total > 0) {
        const pct = Math.min(99, Math.round((evt.loaded / evt.total) * 100));
        onUploadProgress(pct);
      }
    };
    xhr.upload.onload = () => {
      onUploadProgress(100);
      onUploadFinished();
    };
    xhr.onload = () => {
      try {
        const parsed = JSON.parse(xhr.responseText || "{}") as {
          ok?: boolean;
          error?: string;
          submission?: StoredVideoSubmission;
        };
        resolve({ status: xhr.status, body: parsed });
      } catch {
        reject(new Error(`Unexpected response from server (HTTP ${xhr.status}).`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error while uploading video clip."));
    xhr.ontimeout = () =>
      reject(new Error("Video analysis request timed out. Please retry with a shorter clip."));
    xhr.timeout = 120_000;
    xhr.send(formData);
  });
}

function SubmitPage() {
  const { session, ready } = useAuth();
  const { data } = useSuspenseQuery(submitQuery());
  const queryClient = useQueryClient();
  const fetchBillingStatus = useServerFn(getBillingStatus);
  const billingQuery = useQuery({
    queryKey: ["billing-status", session?.user?.id ?? "anon"],
    queryFn: () => fetchBillingStatus(),
    enabled: ready && Boolean(session),
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [sourceMode, setSourceMode] = useState<"upload" | "link">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [clipDurationSec, setClipDurationSec] = useState<number | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const [title, setTitle] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [notes, setNotes] = useState("");
  const [techniqueId, setTechniqueId] = useState("");

  const [stage, setStage] = useState<AnalysisStage>("idle");
  const [uploadPercent, setUploadPercent] = useState(0);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Interactive Demo + Flag for Deeper Review states
  const [selectedDemoId, setSelectedDemoId] = useState<string>(DEMO_PRESETS[0]!.id);
  const [demoSubmissions, setDemoSubmissions] = useState<DemoSubmission[]>([]);
  const [demoBusy, setDemoBusy] = useState(false);
  const [previewTier, setPreviewTier] = useState<PreviewTier>("free");
  const [flaggingId, setFlaggingId] = useState<string | null>(null);
  const [flagFocus, setFlagFocus] = useState<string>(FLAG_FOCUS_OPTIONS[0]);
  const [flagNote, setFlagNote] = useState("");
  const [flagBusy, setFlagBusy] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const rawDemos = window.localStorage.getItem(DEMO_SUBMISSIONS_STORAGE_KEY);
      if (rawDemos) {
        const parsed = JSON.parse(rawDemos) as DemoSubmission[];
        if (Array.isArray(parsed)) setDemoSubmissions(parsed);
      }
      setPreviewTier(loadPreviewTier());
    } catch {
      // Ignore malformed localStorage
    } finally {
      setHydrated(true);
    }

    const syncTier = () => setPreviewTier(loadPreviewTier());
    window.addEventListener(AUCTUS_STATE_EVENT, syncTier);
    return () => window.removeEventListener(AUCTUS_STATE_EVENT, syncTier);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(DEMO_SUBMISSIONS_STORAGE_KEY, JSON.stringify(demoSubmissions));
    } catch {
      // Ignore storage quota errors
    }
  }, [hydrated, demoSubmissions]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const isSubscribed =
    billingQuery.data?.status === "active" || billingQuery.data?.status === "trialing";
  const activeTier = isSubscribed ? getTierById(billingQuery.data?.plan) : undefined;
  const maxMonthlyReviews = activeTier?.maxMonthlyReviews ?? null;
  const monthCompletedCount = useMemo(
    () =>
      data.submissions.filter((s) => s.status === "complete" && isCurrentMonth(s.created_at))
        .length,
    [data.submissions],
  );
  const quotaReached =
    typeof maxMonthlyReviews === "number" && monthCompletedCount >= maxMonthlyReviews;
  const isBusy = stage === "uploading" || stage === "analyzing" || retryingId !== null || demoBusy;

  const combinedSubmissions = useMemo(
    () => [...demoSubmissions, ...data.submissions],
    [demoSubmissions, data.submissions],
  );

  const flaggedSubmissions = useMemo(
    () => combinedSubmissions.filter((sub) => sub.flagged),
    [combinedSubmissions],
  );

  function clearSelectedFile() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setClipDurationSec(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function acceptFile(file: File | undefined) {
    if (!file) return;
    setErrorBanner(null);
    const validationError = validateVideoFile(file);
    if (validationError) {
      setErrorBanner(validationError);
      toast.error(validationError);
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
    setClipDurationSec(null);
    if (!title.trim()) {
      const cleanName = file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ");
      setTitle(cleanName.slice(0, 120));
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    acceptFile(e.target.files?.[0]);
  }

  function handleDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragActive(false);
    acceptFile(e.dataTransfer.files?.[0]);
  }

  async function runInteractiveDemo(presetId?: string) {
    const preset =
      DEMO_PRESETS.find((p) => p.id === (presetId ?? selectedDemoId)) ?? DEMO_PRESETS[0]!;
    setErrorBanner(null);
    setDemoBusy(true);
    setStage("uploading");
    setUploadPercent(42);

    await new Promise((r) => setTimeout(r, 320));
    setUploadPercent(100);
    setStage("analyzing");
    await new Promise((r) => setTimeout(r, 520));

    const nowIso = new Date().toISOString();
    const demoRecord: DemoSubmission = {
      id: `demo-${preset.id}-${Date.now()}`,
      user_id: "demo",
      title: preset.title,
      video_url: "https://auctusperformance.app/demo",
      source_type: "upload",
      file_name: `${preset.id}.mp4`,
      file_size_bytes: 8_400_000,
      notes: preset.notes,
      technique_id: null,
      technique: { name: preset.label, sport: preset.sport },
      status: "complete",
      analysis: preset.analysis,
      error: null,
      flagged: false,
      flag_focus: null,
      flag_note: null,
      flag_status: null,
      flagged_at: null,
      created_at: nowIso,
      analyzed_at: nowIso,
      is_demo: true,
    };

    setDemoSubmissions((prev) => [demoRecord, ...prev].slice(0, 6));
    setStage("complete");
    setDemoBusy(false);
    toast.success("Sample demo analysis complete — try Flag for Deeper Review below!");
  }

  function handleTogglePreviewTier() {
    const next: PreviewTier = previewTier === "pro_preview" ? "free" : "pro_preview";
    setPreviewTier(next);
    savePreviewTier(next);
    toast.success(
      next === "pro_preview"
        ? "Pro Preview activated — deeper review flagging and unlimited demo tracking enabled."
        : "Switched back to Free view.",
    );
  }

  async function handleFlagSubmit(submission: StoredVideoSubmission | DemoSubmission) {
    const cleanNote = flagNote.trim();
    if (cleanNote.length < 4) {
      toast.error("Add a brief coaching note (at least 4 characters) describing what to review.");
      return;
    }

    if ("is_demo" in submission && submission.is_demo) {
      setDemoSubmissions((prev) =>
        prev.map((item) =>
          item.id === submission.id
            ? {
                ...item,
                flagged: true,
                flag_focus: flagFocus,
                flag_note: cleanNote,
                flag_status: "pending_review",
                flagged_at: new Date().toISOString(),
              }
            : item,
        ),
      );
      setFlaggingId(null);
      setFlagNote("");
      toast.success("Flagged for deeper review (Demo preview tracked).");
      return;
    }

    const token = await getAccessToken();
    if (!token) {
      toast.error("Sign in to save flags on live submissions.");
      return;
    }

    setFlagBusy(true);
    try {
      const res = await fetch("/api/video/flag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          submissionId: submission.id,
          flagFocus,
          flagNote: cleanNote,
          action: "flag",
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        toast.error(body.error ?? "Could not flag submission for deeper review.");
        return;
      }
      setFlaggingId(null);
      setFlagNote("");
      toast.success("Flagged for deeper review.");
      await queryClient.invalidateQueries({ queryKey: ["submissions"] });
    } catch {
      toast.error("Network error while flagging submission.");
    } finally {
      setFlagBusy(false);
    }
  }

  async function handleUnflag(submission: StoredVideoSubmission | DemoSubmission) {
    if ("is_demo" in submission && submission.is_demo) {
      setDemoSubmissions((prev) =>
        prev.map((item) =>
          item.id === submission.id
            ? {
                ...item,
                flagged: false,
                flag_focus: null,
                flag_note: null,
                flag_status: null,
                flagged_at: null,
              }
            : item,
        ),
      );
      toast.info("Removed from Deeper Review queue.");
      return;
    }

    const token = await getAccessToken();
    if (!token) return;
    try {
      const res = await fetch("/api/video/flag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ submissionId: submission.id, action: "unflag" }),
      });
      if (res.ok) {
        toast.info("Removed from Deeper Review queue.");
        await queryClient.invalidateQueries({ queryKey: ["submissions"] });
      }
    } catch {
      toast.error("Could not update flag status.");
    }
  }

  async function handleRetrySubmission(sub: StoredVideoSubmission) {
    if (sub.source_type === "upload") {
      setSourceMode("upload");
      setTitle(sub.title);
      setNotes(sub.notes);
      setTechniqueId(sub.technique_id ?? "");
      const msg = "Select your video file again on the form to re-run Gemini analysis.";
      setErrorBanner(msg);
      toast.info(msg);
      return;
    }

    const token = await getAccessToken();
    if (!token) {
      toast.error("Please sign in again to retry analysis.");
      return;
    }

    setRetryingId(sub.id);
    setErrorBanner(null);
    setStage("analyzing");
    try {
      const res = await fetch("/api/video/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ retrySubmissionId: sub.id }),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) {
        const msg = body.error ?? "AI video analysis couldn't be completed.";
        setStage("error");
        setErrorBanner(msg);
        toast.error(msg);
      } else {
        setStage("complete");
        toast.success("Analysis complete.");
      }
    } catch {
      const msg = "Network error while analyzing video.";
      setStage("error");
      setErrorBanner(msg);
      toast.error(msg);
    } finally {
      setRetryingId(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["submissions"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    }
  }

  async function handleDeleteSubmission(sub: StoredVideoSubmission | DemoSubmission) {
    if ("is_demo" in sub && sub.is_demo) {
      setDemoSubmissions((prev) => prev.filter((item) => item.id !== sub.id));
      toast.success("Demo sample removed.");
      return;
    }

    const token = await getAccessToken();
    if (!token) return;
    setDeletingId(sub.id);
    try {
      const res = await fetch(`/api/video/submissions/${encodeURIComponent(sub.id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Analysis removed from history.");
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["submissions"] }),
          queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
        ]);
      } else {
        toast.error("Could not delete submission.");
      }
    } catch {
      toast.error("Could not delete submission.");
    } finally {
      setDeletingId(null);
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorBanner(null);

    if (quotaReached) {
      const msg = `You've reached your ${maxMonthlyReviews} monthly review limit on ${activeTier?.name ?? "this plan"}.`;
      setErrorBanner(msg);
      toast.error(msg);
      return;
    }

    const token = await getAccessToken();
    if (!token) {
      const msg =
        "Sign in with your Auctus account to run live Gemini uploads—or click Try Demo below to test a sample analysis immediately.";
      setErrorBanner(msg);
      toast.info("Sign in for live uploads, or use Try Demo right below.");
      return;
    }

    if (sourceMode === "upload") {
      if (!selectedFile) {
        const msg = "Choose a video file (.mp4, .mov, .webm) or switch to Paste YouTube URL.";
        setErrorBanner(msg);
        toast.error(msg);
        return;
      }
      const fileError = validateVideoFile(selectedFile);
      if (fileError) {
        setErrorBanner(fileError);
        toast.error(fileError);
        return;
      }

      const formData = new FormData();
      formData.append("video", selectedFile);
      formData.append(
        "title",
        title.trim() || selectedFile.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "),
      );
      formData.append("notes", notes.trim());
      if (techniqueId) formData.append("techniqueId", techniqueId);

      setUploadPercent(0);
      setStage("uploading");
      try {
        const { status, body } = await uploadVideoWithProgress(
          formData,
          token,
          (pct) => setUploadPercent(pct),
          () => setStage("analyzing"),
        );

        if (status >= 400 || !body.ok) {
          const msg = body.error ?? "AI video analysis could not be completed.";
          setStage("error");
          setErrorBanner(msg);
          toast.error(msg);
        } else {
          setStage("complete");
          toast.success("AI coaching breakdown complete!");
          setTitle("");
          setNotes("");
          setTechniqueId("");
          clearSelectedFile();
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed. Please retry.";
        setStage("error");
        setErrorBanner(msg);
        toast.error(msg);
      } finally {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["submissions"] }),
          queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
        ]);
      }
      return;
    }

    const cleanUrl = videoLink.trim();
    if (!cleanUrl || !youtubeId(cleanUrl)) {
      const msg = "Enter a valid public YouTube URL (e.g., https://youtube.com/watch?v=...).";
      setErrorBanner(msg);
      toast.error(msg);
      return;
    }

    setStage("uploading");
    setUploadPercent(100);
    try {
      setStage("analyzing");
      const res = await fetch("/api/video/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim() || "YouTube Movement Review",
          videoUrl: cleanUrl,
          notes: notes.trim(),
          techniqueId: techniqueId || undefined,
        }),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) {
        const msg = body.error ?? "Could not analyze that YouTube URL.";
        setStage("error");
        setErrorBanner(msg);
        toast.error(msg);
      } else {
        setStage("complete");
        toast.success("AI coaching breakdown complete!");
        setTitle("");
        setVideoLink("");
        setNotes("");
        setTechniqueId("");
      }
    } catch {
      const msg = "Network error while sending YouTube link for Gemini analysis.";
      setStage("error");
      setErrorBanner(msg);
      toast.error(msg);
    } finally {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["submissions"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    }
  }

  return (
    <PageWithOutline sections={SUBMIT_OUTLINE} title="AI Video">
      <WorkspaceTabs active="analysis" />

      {/* INTERACTIVE TRY DEMO BAR */}
      <section
        id="video-demo"
        aria-label="Interactive AI Video Demo"
        className="mb-8 scroll-mt-24 rounded-2xl border border-brand-amber/40 bg-surface p-5 sm:p-6"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p className="eyebrow text-brand-amber">Interactive Demo</p>
            <h2 className="text-display mt-1.5 text-2xl text-foreground">
              Preview AI Analysis &amp; Flagging
            </h2>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTogglePreviewTier}
              className="min-h-10 whitespace-nowrap"
            >
              {previewTier === "pro_preview" ? "Pro Preview: Active" : "Try Pro Preview"}
            </Button>
            <Button
              type="button"
              variant="hero"
              size="default"
              disabled={isBusy}
              onClick={() => runInteractiveDemo()}
              className="min-h-10 gap-2 whitespace-nowrap"
            >
              {demoBusy ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Play className="size-4" aria-hidden="true" />
              )}
              Try Demo Analysis
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-border/60 pt-4">
          {DEMO_PRESETS.map((preset) => {
            const active = selectedDemoId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedDemoId(preset.id)}
                className={cn(
                  "min-h-10 rounded-lg border px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                  active
                    ? "border-brand-amber bg-primary text-primary-foreground"
                    : "border-border bg-background/60 text-muted-foreground hover:text-foreground",
                )}
              >
                {preset.label} ({preset.sport})
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-[1fr_1.25fr] lg:gap-12">
        <section id="video-upload" className="min-w-0 scroll-mt-24">
          <p className="eyebrow text-brand-amber">AI Video</p>
          <h1 className="text-display mt-2 text-3xl sm:text-5xl">Upload &amp; Analyze</h1>
          <p className="mt-2.5 text-sm text-muted-foreground">
            Upload an MP4/MOV/WebM clip or paste a public YouTube link.
          </p>

          {!data.geminiConfigured && (
            <div
              role="status"
              className="mt-5 flex items-start gap-3 rounded-xl border border-brand-amber/40 bg-surface p-4 text-sm"
            >
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-brand-amber" aria-hidden="true" />
              <div className="min-w-0">
                <p className="font-medium text-foreground">
                  Live Gemini upload key not set on this server — Demo mode ready
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Add <code className="font-mono text-brand-amber">GEMINI_API_KEY</code> to process
                  live clips, or click <strong>Try Demo Analysis</strong> above right now.
                </p>
              </div>
            </div>
          )}

          {!session && (
            <div className="mt-5 flex flex-col items-start justify-between gap-3 rounded-xl border border-border bg-surface p-4 text-sm sm:flex-row sm:items-center">
              <div className="min-w-0">
                <p className="font-medium text-foreground">Previewing as guest</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Try any sample demo above right away, or sign in to submit live clips and track
                  history.
                </p>
              </div>
              <Button
                asChild
                variant="glass"
                size="sm"
                className="min-h-10 shrink-0 whitespace-nowrap"
              >
                <Link to="/auth">Sign in / Join</Link>
              </Button>
            </div>
          )}

          {session &&
            (billingQuery.isLoading ? (
              <div
                className="mt-6 h-20 animate-pulse rounded-xl border border-border bg-surface p-4"
                aria-hidden="true"
              />
            ) : (
              <div className="mt-6 rounded-xl border border-border bg-surface p-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="eyebrow">
                    {activeTier ? `${activeTier.name} tier` : "Free preview tier"}
                  </span>
                  <Link
                    to="/pricing"
                    className="inline-flex min-h-10 items-center text-xs text-brand-amber hover:underline sm:min-h-0"
                  >
                    Compare Free vs. Pro
                  </Link>
                </div>
                <p className="mt-1 font-medium text-foreground tabular-nums">
                  {activeTier
                    ? maxMonthlyReviews === null
                      ? `${monthCompletedCount} reviews this month · Unlimited access`
                      : `${monthCompletedCount} / ${maxMonthlyReviews} monthly reviews used`
                    : `${monthCompletedCount} live sessions · Demo & preview active`}
                </p>
              </div>
            ))}

          <form onSubmit={onSubmit} className="mt-7 space-y-5" noValidate>
            {/* SOURCE SWITCHER */}
            <div className="grid grid-cols-1 gap-2 rounded-xl border border-border bg-surface p-1.5 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setSourceMode("upload");
                  setErrorBanner(null);
                }}
                className={cn(
                  "flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  sourceMode === "upload"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <UploadCloud className="size-4 shrink-0" aria-hidden="true" />
                Upload Video Clip
              </button>
              <button
                type="button"
                onClick={() => {
                  setSourceMode("link");
                  setErrorBanner(null);
                }}
                className={cn(
                  "flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  sourceMode === "link"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Link2 className="size-4 shrink-0" aria-hidden="true" />
                Paste YouTube URL
              </button>
            </div>

            {sourceMode === "upload" ? (
              <div className="space-y-3">
                <Label htmlFor="video_file">
                  Exercise video clip (.mp4, .mov, .webm · max 45 MB)
                </Label>
                {!selectedFile ? (
                  <label
                    htmlFor="video_file"
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    className={cn(
                      "flex min-h-[144px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed bg-surface px-5 py-7 text-center transition-colors",
                      dragActive
                        ? "border-brand-amber bg-surface-raised"
                        : "border-border hover:border-brand-amber/60",
                    )}
                  >
                    <UploadCloud className="size-8 text-brand-amber" aria-hidden="true" />
                    <p className="mt-3 text-sm font-medium text-foreground">
                      Tap or drag to choose a training clip
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      MP4, MOV, or WebM · Ideal clip length: 5–45 seconds
                    </p>
                    <input
                      ref={fileInputRef}
                      id="video_file"
                      type="file"
                      accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm,.m4v"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                    {previewUrl && (
                      <video
                        src={previewUrl}
                        controls
                        playsInline
                        onLoadedMetadata={(e) => setClipDurationSec(e.currentTarget.duration)}
                        className="aspect-video w-full bg-background object-contain"
                      />
                    )}
                    <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2.5 text-xs sm:px-4">
                      <div className="flex min-w-0 items-center gap-2">
                        <Film className="size-4 shrink-0 text-brand-amber" aria-hidden="true" />
                        <span className="truncate font-medium text-foreground">
                          {selectedFile.name}
                        </span>
                        <span className="shrink-0 text-muted-foreground tabular-nums">
                          {formatFileSize(selectedFile.size)}
                          {clipDurationSec ? ` · ${clipDurationSec.toFixed(1)}s` : ""}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-11 shrink-0"
                        aria-label="Remove video clip"
                        onClick={clearSelectedFile}
                        disabled={isBusy}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="video_url">Public YouTube URL</Label>
                <Input
                  id="video_url"
                  type="url"
                  inputMode="url"
                  value={videoLink}
                  onChange={(e) => setVideoLink(e.target.value)}
                  maxLength={500}
                  placeholder="https://youtube.com/watch?v=..."
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Make sure the YouTube video is set to Public or Unlisted.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Movement / Rep Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                placeholder="e.g., Barbell Back Squat — 3 Reps @ 80%"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label>Reference Technique (optional)</Label>
              <Select value={techniqueId} onValueChange={setTechniqueId}>
                <SelectTrigger aria-label="Technique" className="h-11">
                  <SelectValue placeholder="Auto-detect from video or choose a technique" />
                </SelectTrigger>
                <SelectContent>
                  {data.techniques.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.sport} — {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes on the exercise or movement</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={2000}
                rows={4}
                placeholder="What movement are you performing, what weight/speed, and where do you want coaching feedback?"
              />
            </div>

            {/* VISIBLE PROGRESS TRACKER */}
            {stage !== "idle" && (
              <div
                role="status"
                aria-live="polite"
                className={cn(
                  "rounded-xl border p-4 text-sm",
                  stage === "error"
                    ? "border-destructive/60 bg-destructive/10"
                    : stage === "complete"
                      ? "border-success/50 bg-success/10"
                      : "border-brand-amber/50 bg-surface",
                )}
              >
                <div className="flex items-center gap-2.5">
                  {stage === "uploading" || stage === "analyzing" ? (
                    <Loader2 className="size-4 shrink-0 animate-spin text-brand-amber" />
                  ) : stage === "complete" ? (
                    <CheckCircle2 className="size-4 shrink-0 text-success" />
                  ) : (
                    <AlertCircle className="size-4 shrink-0 text-destructive" />
                  )}
                  <span className="font-medium text-foreground">
                    {stage === "uploading" && `Uploading video... (${uploadPercent}%)`}
                    {stage === "analyzing" && "Analyzing movement mechanics..."}
                    {stage === "complete" && "Complete"}
                    {stage === "error" && "Analysis could not finish"}
                  </span>
                </div>

                {(stage === "uploading" || stage === "analyzing" || stage === "complete") && (
                  <div className="mt-3 space-y-2">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-background">
                      <div
                        className={cn(
                          "h-full transition-all duration-300",
                          stage === "complete"
                            ? "w-full bg-success"
                            : stage === "analyzing"
                              ? "w-4/5 animate-pulse bg-sunset"
                              : "bg-sunset",
                        )}
                        style={
                          stage === "uploading"
                            ? { width: `${Math.max(10, uploadPercent)}%` }
                            : undefined
                        }
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-1 font-mono text-[0.62rem] uppercase tracking-[0.12em]">
                      <span
                        className={cn(stage === "uploading" ? "text-brand-amber" : "text-success")}
                      >
                        1. Uploading
                      </span>
                      <span
                        className={cn(
                          "text-center",
                          stage === "analyzing"
                            ? "text-brand-amber"
                            : stage === "complete"
                              ? "text-success"
                              : "text-muted-foreground",
                        )}
                      >
                        2. Mechanics
                      </span>
                      <span
                        className={cn(
                          "text-right",
                          stage === "complete" ? "text-success" : "text-muted-foreground",
                        )}
                      >
                        3. Complete
                      </span>
                    </div>
                  </div>
                )}

                {errorBanner && (
                  <p className="mt-2.5 text-xs leading-relaxed text-destructive">{errorBanner}</p>
                )}
              </div>
            )}

            {stage === "idle" && errorBanner && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-destructive/60 bg-destructive/10 p-3.5 text-xs leading-relaxed text-destructive"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>{errorBanner}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="hero"
              size="xl"
              className="min-h-12 w-full"
              disabled={isBusy || quotaReached}
            >
              {isBusy && <Loader2 className="animate-spin" aria-hidden="true" />}
              {quotaReached
                ? "Monthly review limit reached"
                : stage === "uploading"
                  ? "Uploading video..."
                  : stage === "analyzing"
                    ? "Analyzing movement mechanics..."
                    : "Analyze Video"}
            </Button>
          </form>
        </section>

        {/* ANALYSIS HISTORY, FLAG FOR DEEPER REVIEW TRACKER & STRUCTURED COACHING CARDS */}
        <div className="min-w-0 space-y-6">
          {/* FLAGGED FOR DEEPER REVIEW TRACKER */}
          <section
            id="video-flagged"
            aria-label="Flagged for Deeper Review Queue"
            className="scroll-mt-24 rounded-2xl border border-border bg-surface p-5 sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Flag className="size-4 text-brand-amber" aria-hidden="true" />
                <h2 className="text-display text-xl text-foreground">Flagged for Deeper Review</h2>
              </div>
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {flaggedSubmissions.length} tracked (Pro feature · Demo active)
              </span>
            </div>

            {flaggedSubmissions.length === 0 ? (
              <p className="mt-2.5 text-xs font-light leading-relaxed text-muted-foreground">
                Flag any completed AI analysis below with a note (for example, joint discomfort or
                left/right asymmetry) to track it for deeper frame-by-frame review.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-border/70 border-t border-border/70">
                {flaggedSubmissions.map((item) => (
                  <li key={`flag-${item.id}`} className="py-3 first:pt-3 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-brand-amber">
                          {item.flag_focus ?? "Form Breakdown"} ·{" "}
                          {item.flag_status === "reviewed"
                            ? "Reviewed"
                            : "Queued for Deeper Review"}
                        </p>
                        <p className="mt-0.5 truncate text-sm font-medium text-foreground">
                          {item.title}
                        </p>
                        {item.flag_note && (
                          <p className="mt-1 text-xs font-light leading-relaxed text-muted-foreground">
                            &ldquo;{item.flag_note}&rdquo;
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUnflag(item)}
                        className="shrink-0 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground underline underline-offset-4 hover:text-destructive"
                      >
                        Remove flag
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div
            id="video-results"
            className="scroll-mt-24 flex flex-wrap items-baseline justify-between gap-2"
          >
            <h2 className="text-display text-2xl sm:text-4xl">Analysis results</h2>
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              {combinedSubmissions.length}{" "}
              {combinedSubmissions.length === 1 ? "session" : "sessions"}
            </span>
          </div>

          {combinedSubmissions.length === 0 && (
            <div className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted-foreground sm:p-8">
              <p>
                No video analyses yet. Upload a clip (.mp4, .mov, .webm), paste a public YouTube
                URL, or click <strong>Try Demo Analysis</strong> above to inspect a realistic sample
                breakdown immediately.
              </p>
            </div>
          )}

          {combinedSubmissions.map((s) => {
            const parsed = normalizeAnalysis(s.analysis);
            const running = retryingId === s.id || s.status === "analyzing";
            const isDemo = Boolean("is_demo" in s && s.is_demo);
            const isFlagFormOpen = flaggingId === s.id;

            return (
              <article
                key={s.id}
                className="overflow-hidden rounded-2xl border border-border bg-surface p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {isDemo && (
                      <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-brand-amber">
                        Sample Demo Result
                      </p>
                    )}
                    <h3 className="break-words text-lg font-medium text-foreground">{s.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {s.technique ? `${s.technique.sport} — ${s.technique.name} · ` : ""}
                      {isDemo
                        ? "Interactive Demo"
                        : s.source_type === "upload"
                          ? "Uploaded Clip"
                          : "YouTube Video"}{" "}
                      · {formatDate(s.created_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {parsed && (
                      <span className="text-display text-3xl font-light text-brand-amber tabular-nums sm:text-4xl">
                        {parsed.overall_score}/10
                      </span>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-11"
                      aria-label={`Delete analysis ${s.title}`}
                      disabled={deletingId === s.id || running}
                      onClick={() => handleDeleteSubmission(s)}
                    >
                      {deletingId === s.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
                      )}
                    </Button>
                  </div>
                </div>

                {running && (
                  <p className="mt-4 flex items-center gap-2 text-sm text-brand-amber">
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Analyzing
                    movement mechanics...
                  </p>
                )}

                {!running && s.status !== "complete" && (
                  <div className="mt-4 flex flex-col items-start justify-between gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm sm:flex-row sm:items-center">
                    <p className="text-xs leading-relaxed text-destructive">
                      {s.error ?? "Analysis did not complete."}
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="min-h-11 shrink-0"
                      onClick={() => handleRetrySubmission(s)}
                    >
                      <RotateCw className="size-3.5" aria-hidden="true" /> Retry
                    </Button>
                  </div>
                )}

                {parsed && !running && (
                  <div className="mt-5 space-y-4 text-sm">
                    <p className="leading-relaxed text-foreground/95">{parsed.summary}</p>

                    {/* 1) WHAT WENT WELL */}
                    {parsed.what_went_well.length > 0 && (
                      <div className="rounded-xl border border-success/30 bg-background/60 p-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
                          <p className="eyebrow text-success">What Went Well</p>
                        </div>
                        <ul className="mt-2.5 space-y-1.5 text-foreground/90">
                          {parsed.what_went_well.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-success" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 2) AREAS TO IMPROVE */}
                    {parsed.areas_to_improve.length > 0 && (
                      <div className="rounded-xl border border-brand-orange/35 bg-background/60 p-4">
                        <div className="flex items-center gap-2">
                          <Target className="size-4 text-brand-orange" aria-hidden="true" />
                          <p className="eyebrow text-brand-orange">Areas to Improve</p>
                        </div>
                        <ul className="mt-2.5 space-y-1.5 text-foreground/90">
                          {parsed.areas_to_improve.map((area, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-orange" />
                              <span>{area}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 3) ACTIONABLE CORRECTIVE DRILLS & CUES */}
                    {parsed.corrective_drills.length > 0 && (
                      <div className="rounded-xl border border-brand-amber/35 bg-background/60 p-4">
                        <div className="flex items-center gap-2">
                          <Wrench className="size-4 text-brand-amber" aria-hidden="true" />
                          <p className="eyebrow text-brand-amber">
                            Actionable Corrective Drills &amp; Cues
                          </p>
                        </div>
                        <div className="mt-3 space-y-3">
                          {parsed.corrective_drills.map((item, idx) => (
                            <div
                              key={idx}
                              className="rounded-lg border border-border/80 bg-surface/80 p-3.5"
                            >
                              {item.target_area && (
                                <p className="font-medium text-foreground">{item.target_area}</p>
                              )}
                              <p className="mt-1 text-xs leading-relaxed text-foreground/90 sm:text-sm">
                                <span className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-brand-coral">
                                  Cue:
                                </span>{" "}
                                {item.cue}
                              </p>
                              <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                                <span className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-brand-amber">
                                  Drill:
                                </span>{" "}
                                {item.drill}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* NEXT SESSION FOCUS */}
                    <div className="flex items-start gap-3 rounded-xl border border-border bg-background/50 p-4">
                      <Dumbbell
                        className="mt-0.5 size-4 shrink-0 text-brand-indigo"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="eyebrow">Next Session Priority</p>
                        <p className="mt-1 text-sm text-foreground/90">{parsed.next_session}</p>
                      </div>
                    </div>

                    {/* FLAG FOR DEEPER REVIEW ACTION */}
                    <div className="border-t border-border/70 pt-4">
                      {s.flagged ? (
                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-amber/40 bg-background/60 p-3.5">
                          <div>
                            <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-brand-amber">
                              Flagged for Deeper Review · {s.flag_focus}
                            </p>
                            {s.flag_note && (
                              <p className="mt-1 text-xs text-muted-foreground">{s.flag_note}</p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnflag(s)}
                            className="min-h-9 text-xs text-muted-foreground hover:text-destructive"
                          >
                            Remove flag
                          </Button>
                        </div>
                      ) : !isFlagFormOpen ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFlaggingId(s.id);
                            setFlagFocus(FLAG_FOCUS_OPTIONS[0]);
                            setFlagNote("");
                          }}
                          className="min-h-10 gap-2 whitespace-nowrap"
                        >
                          <Flag className="size-3.5 text-brand-amber" aria-hidden="true" />
                          Flag for Deeper Review
                        </Button>
                      ) : (
                        <div className="space-y-3 rounded-xl border border-brand-amber/40 bg-background/70 p-4">
                          <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-brand-amber">
                            Flag Clip for Deeper Review (Pro / Demo)
                          </p>
                          <div className="space-y-1.5">
                            <Label htmlFor={`flag-focus-${s.id}`} className="text-xs">
                              Review Focus
                            </Label>
                            <Select value={flagFocus} onValueChange={setFlagFocus}>
                              <SelectTrigger id={`flag-focus-${s.id}`} className="h-10 bg-surface">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {FLAG_FOCUS_OPTIONS.map((opt) => (
                                  <SelectItem key={opt} value={opt}>
                                    {opt}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor={`flag-note-${s.id}`} className="text-xs">
                              What should be inspected closer?
                            </Label>
                            <Textarea
                              id={`flag-note-${s.id}`}
                              rows={2}
                              maxLength={600}
                              value={flagNote}
                              onChange={(e) => setFlagNote(e.target.value)}
                              placeholder="e.g., Right knee tracks slightly inward at the bottom of rep 3..."
                              className="bg-surface text-xs"
                            />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant="hero"
                              size="sm"
                              disabled={flagBusy}
                              onClick={() => handleFlagSubmit(s)}
                              className="min-h-10"
                            >
                              {flagBusy ? "Submitting..." : "Submit Flag"}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setFlaggingId(null)}
                              className="min-h-10"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </PageWithOutline>
  );
}
