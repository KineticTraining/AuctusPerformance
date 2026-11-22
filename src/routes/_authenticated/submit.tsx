import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Film, Link2, Loader2, RotateCw, Trash2, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";

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
import { supabase } from "@/integrations/supabase/client";
import { analysisSchema } from "@/lib/analysis";
import { analyzeSubmission } from "@/lib/analysis.functions";
import { getBillingStatus } from "@/lib/billing.functions";
import { formatDate } from "@/lib/format";
import { SEED_TECHNIQUES } from "@/lib/mock-seed";
import { getTierById } from "@/lib/plans";
import { cn } from "@/lib/utils";

const submitQuery = () =>
  queryOptions({
    queryKey: ["submissions"],
    queryFn: async () => {
      const [t, s] = await Promise.all([
        supabase.from("techniques").select("id, sport, name").order("sport").order("name"),
        supabase
          .from("submissions")
          .select("*, technique:techniques(name, sport)")
          .order("created_at", { ascending: false }),
      ]);
      const techniques =
        t.data && t.data.length > 0
          ? t.data
          : SEED_TECHNIQUES.map((tech) => ({ id: tech.id, sport: tech.sport, name: tech.name }));
      return { techniques, submissions: s.data ?? [] };
    },
  });

export const Route = createFileRoute("/_authenticated/submit")({
  head: () => ({
    meta: [
      { title: "AI Video Upload & Analysis — Dusk Kinetic Performance" },
      {
        name: "description",
        content:
          "Upload a training clip or submit a video link for Dusk Kinetic AI technique feedback.",
      },
      { property: "og:title", content: "AI Video Upload & Analysis — Dusk Kinetic Performance" },
      {
        property: "og:description",
        content: "Upload a training video clip or link for cue-based AI coaching review.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  pendingComponent: SubmitSkeleton,
  loader: ({ context }) => context.queryClient.ensureQueryData(submitQuery()),
  component: SubmitPage,
});

const linkSchema = z.object({
  title: z.string().trim().min(1, "Give your clip a title").max(120),
  video_url: z.string().trim().url("Enter a valid video link").max(500),
  notes: z.string().trim().max(2000),
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

function SubmitPage() {
  const { data } = useSuspenseQuery(submitQuery());
  const queryClient = useQueryClient();
  const analyze = useServerFn(analyzeSubmission);
  const fetchBillingStatus = useServerFn(getBillingStatus);
  const billingQuery = useQuery({
    queryKey: ["billing-status"],
    queryFn: () => fetchBillingStatus(),
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [sourceMode, setSourceMode] = useState<"upload" | "link">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [clipDurationSec, setClipDurationSec] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [notes, setNotes] = useState("");
  const [techniqueId, setTechniqueId] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const isSubscribed =
    billingQuery.data?.status === "active" || billingQuery.data?.status === "trialing";
  const activeTier = isSubscribed ? getTierById(billingQuery.data?.plan) : undefined;
  const maxMonthlyReviews = activeTier?.maxMonthlyReviews ?? null;
  const monthSubmissionsCount = useMemo(
    () => data.submissions.filter((s) => isCurrentMonth(s.created_at)).length,
    [data.submissions],
  );
  const quotaReached =
    typeof maxMonthlyReviews === "number" && monthSubmissionsCount >= maxMonthlyReviews;

  function clearSelectedFile() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setClipDurationSec(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file (MP4, MOV, WebM).");
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

  async function runAnalysis(id: string) {
    setBusy(id);
    try {
      const res = await analyze({ data: { submissionId: id } });
      if (res.status === "complete") toast.success("Your AI analysis is ready.");
      else toast.error("The analysis didn't finish. You can retry.");
    } catch {
      toast.error("The analysis didn't finish. You can retry.");
    }
    setBusy(null);
    queryClient.invalidateQueries({ queryKey: ["submissions"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (quotaReached) {
      toast.error(
        `You've reached your ${maxMonthlyReviews} monthly review limit on ${activeTier?.name ?? "this plan"}.`,
      );
      return;
    }

    let resolvedUrl = videoLink.trim();
    let resolvedNotes = notes.trim();

    if (sourceMode === "upload") {
      if (!selectedFile) {
        toast.error("Choose a video file to upload or switch to Paste Link.");
        return;
      }
      resolvedUrl = `https://duskkinetic.app/upload/${encodeURIComponent(selectedFile.name)}`;
      const specParts = [
        `Uploaded clip: ${selectedFile.name}`,
        formatFileSize(selectedFile.size),
        clipDurationSec ? `${clipDurationSec.toFixed(1)}s` : null,
      ].filter(Boolean);
      const specLine = `[${specParts.join(" · ")}]`;
      resolvedNotes = resolvedNotes ? `${specLine}\n${resolvedNotes}` : specLine;
    }

    const parsed = linkSchema.safeParse({
      title,
      video_url: resolvedUrl,
      notes: resolvedNotes,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check the submission fields.");
      return;
    }

    const { data: row, error } = await supabase
      .from("submissions")
      .insert({ ...parsed.data, technique_id: techniqueId || null })
      .select("id")
      .single();
    if (error || !row) {
      toast.error("Couldn't save your submission.");
      return;
    }

    setTitle("");
    setVideoLink("");
    setNotes("");
    setTechniqueId("");
    clearSelectedFile();
    await queryClient.invalidateQueries({ queryKey: ["submissions"] });
    await runAnalysis(row.id);
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
      <WorkspaceTabs active="analysis" />

      <div className="grid gap-12 lg:grid-cols-[1fr_1.25fr]">
        <div>
          <p className="eyebrow text-brand-amber">Dedicated AI Video Workspace</p>
          <h1 className="text-display mt-3 text-4xl sm:text-5xl md:text-6xl">
            AI Video Upload &amp; Analysis
          </h1>
          <p className="mt-3 text-muted-foreground">
            Upload a clip from your phone or computer, or paste a public YouTube link. Tag the
            technique and add brief notes to get structured mechanical feedback.
          </p>

          {billingQuery.isLoading ? (
            <div
              className="mt-6 h-20 animate-pulse rounded-xl border border-border bg-surface p-4"
              aria-hidden="true"
            />
          ) : (
            activeTier && (
              <div className="mt-6 rounded-xl border border-border bg-surface p-4 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="eyebrow">{activeTier.name} quota</span>
                  <Link to="/pricing" className="text-xs text-brand-amber hover:underline">
                    Change plan
                  </Link>
                </div>
                <p className="mt-2 font-medium text-foreground tabular-nums">
                  {maxMonthlyReviews === null
                    ? `${monthSubmissionsCount} reviews this month · Unlimited access`
                    : `${monthSubmissionsCount} / ${maxMonthlyReviews} monthly reviews used`}
                </p>
              </div>
            )
          )}

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            {/* SOURCE SWITCHER */}
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-surface p-1">
              <button
                type="button"
                onClick={() => setSourceMode("upload")}
                className={cn(
                  "flex min-h-10 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors",
                  sourceMode === "upload"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <UploadCloud className="size-4" aria-hidden="true" />
                Upload Video Clip
              </button>
              <button
                type="button"
                onClick={() => setSourceMode("link")}
                className={cn(
                  "flex min-h-10 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors",
                  sourceMode === "link"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Link2 className="size-4" aria-hidden="true" />
                Paste Video Link
              </button>
            </div>

            {sourceMode === "upload" ? (
              <div className="space-y-3">
                <Label htmlFor="video_file">Video file</Label>
                {!selectedFile ? (
                  <label
                    htmlFor="video_file"
                    className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-8 text-center transition-colors hover:border-brand-amber/60"
                  >
                    <UploadCloud className="size-8 text-brand-amber" aria-hidden="true" />
                    <p className="mt-3 text-sm font-medium text-foreground">
                      Click to choose a training video
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      MP4, MOV, or WebM clips from your device
                    </p>
                    <input
                      ref={fileInputRef}
                      id="video_file"
                      type="file"
                      accept="video/*"
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
                        onLoadedMetadata={(e) => setClipDurationSec(e.currentTarget.duration)}
                        className="aspect-video w-full bg-background object-contain"
                      />
                    )}
                    <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 text-xs">
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
                        aria-label="Remove video clip"
                        onClick={clearSelectedFile}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="video_url">Video link</Label>
                <Input
                  id="video_url"
                  value={videoLink}
                  onChange={(e) => setVideoLink(e.target.value)}
                  maxLength={500}
                  placeholder="https://youtube.com/watch?v=…"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Session / Rep Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                placeholder="e.g., 20m Acceleration Starts — Set 2"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Technique</Label>
              <Select value={techniqueId} onValueChange={setTechniqueId}>
                <SelectTrigger aria-label="Technique">
                  <SelectValue placeholder="Choose a technique" />
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
              <Label htmlFor="notes">Notes for the coach</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={2000}
                rows={4}
                placeholder="What did you feel? Where do you want feedback?"
              />
            </div>

            <Button
              type="submit"
              variant="hero"
              size="xl"
              className="w-full"
              disabled={!!busy || quotaReached}
            >
              {busy && <Loader2 className="animate-spin" />}
              {quotaReached ? "Monthly review limit reached" : "Analyze video clip"}
            </Button>
          </form>
        </div>

        <div className="space-y-5">
          <h2 className="text-display text-3xl sm:text-4xl">Analysis history</h2>
          {data.submissions.length === 0 && (
            <div className="rounded-2xl border border-border bg-surface p-8 text-sm text-muted-foreground">
              No video analyses yet. Upload a clip or paste a link on the left to generate your
              first coaching breakdown.
            </div>
          )}
          {data.submissions.map((s) => {
            const a = analysisSchema.safeParse(s.analysis);
            const running = busy === s.id || s.status === "analyzing";
            return (
              <article key={s.id} className="rounded-2xl border border-border bg-surface p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-normal">{s.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {s.technique ? `${s.technique.sport} — ${s.technique.name} · ` : ""}
                      {formatDate(s.created_at)}
                    </p>
                  </div>
                  {a.success && (
                    <span className="text-display text-4xl font-extralight text-brand-amber tabular-nums">
                      {a.data.overall_score}/10
                    </span>
                  )}
                </div>
                {running && (
                  <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" /> AI is reviewing your rep…
                  </p>
                )}
                {!running && s.status !== "complete" && (
                  <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
                    {s.error ?? "Waiting for review."}
                    <Button size="sm" variant="glass" onClick={() => runAnalysis(s.id)}>
                      <RotateCw /> Retry
                    </Button>
                  </div>
                )}
                {a.success && !running && (
                  <div className="mt-4 space-y-4 text-sm">
                    {!a.data.video_reviewed && (
                      <p className="text-xs text-brand-orange">
                        Reviewed using your submitted technique cues and session notes.
                      </p>
                    )}
                    <p>{a.data.summary}</p>
                    {a.data.strengths.length > 0 && (
                      <div>
                        <p className="eyebrow">Strengths</p>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                          {a.data.strengths.map((x, i) => (
                            <li key={i}>{x}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {a.data.improvements.map((imp, i) => (
                      <div key={i} className="rounded-xl border border-border bg-background/50 p-4">
                        <p className="font-medium">{imp.issue}</p>
                        <p className="mt-1 text-muted-foreground">
                          <span className="text-brand-coral">Cue:</span> {imp.cue}
                        </p>
                        <p className="mt-1 text-muted-foreground">
                          <span className="text-brand-amber">Drill:</span> {imp.drill}
                        </p>
                      </div>
                    ))}
                    <p>
                      <span className="eyebrow">Next session</span>
                      <br />
                      {a.data.next_session}
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
