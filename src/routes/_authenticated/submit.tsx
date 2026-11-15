import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, RotateCw } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { analyzeSubmission } from "@/lib/analysis.functions";
import { analysisSchema } from "@/lib/analysis";
import { formatDate } from "@/lib/format";

const submitQuery = () =>
  queryOptions({
    queryKey: ["submissions"],
    queryFn: async () => {
      const [t, s] = await Promise.all([
        supabase.from("techniques").select("id, sport, name").order("sport").order("name"),
        supabase.from("submissions").select("*, technique:techniques(name, sport)").order("created_at", { ascending: false }),
      ]);
      return { techniques: t.data ?? [], submissions: s.data ?? [] };
    },
  });

export const Route = createFileRoute("/_authenticated/submit")({
  head: () => ({
    meta: [
      { title: "Video Review — Kinetic" },
      { name: "description", content: "Submit a training video link and notes for AI technique feedback." },
      { property: "og:title", content: "Video Review — Kinetic" },
      { property: "og:description", content: "Submit a training video link and notes for AI technique feedback." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(submitQuery()),
  component: SubmitPage,
});

const formSchema = z.object({
  title: z.string().trim().min(1, "Give it a title").max(120),
  video_url: z.string().trim().url("Enter a valid link").max(500),
  notes: z.string().trim().max(2000),
});

function SubmitPage() {
  const { data } = useSuspenseQuery(submitQuery());
  const queryClient = useQueryClient();
  const analyze = useServerFn(analyzeSubmission);
  const [techniqueId, setTechniqueId] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function runAnalysis(id: string) {
    setBusy(id);
    try {
      const res = await analyze({ data: { submissionId: id } });
      if (res.status === "complete") toast.success("Your AI review is ready");
      else toast.error("The review didn't finish. You can retry.");
    } catch {
      toast.error("The review didn't finish. You can retry.");
    }
    setBusy(null);
    queryClient.invalidateQueries({ queryKey: ["submissions"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const parsed = formSchema.safeParse(Object.fromEntries(new FormData(form).entries()));
    if (!parsed.success) return toast.error(parsed.error.issues[0]?.message ?? "Check the form");
    const { data: row, error } = await supabase
      .from("submissions")
      .insert({ ...parsed.data, technique_id: techniqueId || null })
      .select("id")
      .single();
    if (error || !row) return toast.error("Couldn't save your submission");
    form.reset();
    setTechniqueId("");
    await queryClient.invalidateQueries({ queryKey: ["submissions"] });
    await runAnalysis(row.id);
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-12 px-5 py-12 md:px-8 md:py-16 lg:grid-cols-[1fr_1.3fr]">
      <div>
        <p className="eyebrow">AI technique review</p>
        <h1 className="text-display mt-3 text-5xl md:text-6xl">Submit a rep</h1>
        <p className="mt-3 text-muted-foreground">
          Paste a public YouTube link. The AI watches the clip and compares it to our technique database. Other links get a notes-only review.
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div className="space-y-2"><Label htmlFor="title">Title</Label><Input id="title" name="title" maxLength={120} placeholder="Free throws — Tuesday" /></div>
          <div className="space-y-2"><Label htmlFor="video_url">Video link</Label><Input id="video_url" name="video_url" maxLength={500} placeholder="https://youtube.com/watch?v=…" /></div>
          <div className="space-y-2">
            <Label>Technique</Label>
            <Select value={techniqueId} onValueChange={setTechniqueId}>
              <SelectTrigger aria-label="Technique"><SelectValue placeholder="Choose a technique" /></SelectTrigger>
              <SelectContent>
                {data.techniques.map((t) => <SelectItem key={t.id} value={t.id}>{t.sport} — {t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label htmlFor="notes">Notes for the coach</Label><Textarea id="notes" name="notes" maxLength={2000} rows={5} placeholder="What do you feel? What do you want fixed?" /></div>
          <Button type="submit" variant="hero" size="xl" className="w-full" disabled={!!busy}>
            {busy && <Loader2 className="animate-spin" />} Submit for review
          </Button>
        </form>
      </div>

      <div className="space-y-5">
        <h2 className="text-display text-4xl">Your reviews</h2>
        {data.submissions.length === 0 && <p className="text-muted-foreground">No submissions yet.</p>}
        {data.submissions.map((s) => {
          const a = analysisSchema.safeParse(s.analysis);
          const running = busy === s.id || s.status === "analyzing";
          return (
            <article key={s.id} className="rounded-2xl border border-border bg-surface p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold">{s.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {s.technique ? `${s.technique.sport} — ${s.technique.name} · ` : ""}{formatDate(s.created_at)}
                  </p>
                </div>
                {a.success && <span className="text-display text-4xl text-primary">{a.data.overall_score}/10</span>}
              </div>
              {running && <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> AI is reviewing your rep…</p>}
              {!running && s.status !== "complete" && (
                <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
                  {s.error ?? "Waiting for review."}
                  <Button size="sm" variant="glass" onClick={() => runAnalysis(s.id)}><RotateCw /> Retry</Button>
                </div>
              )}
              {a.success && !running && (
                <div className="mt-4 space-y-4 text-sm">
                  {!a.data.video_reviewed && <p className="text-xs text-warning">Video couldn't be watched — feedback is based on your notes.</p>}
                  <p>{a.data.summary}</p>
                  {a.data.strengths.length > 0 && (
                    <div><p className="eyebrow">Strengths</p><ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">{a.data.strengths.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
                  )}
                  {a.data.improvements.map((imp, i) => (
                    <div key={i} className="rounded-xl border border-border bg-background/50 p-4">
                      <p className="font-semibold">{imp.issue}</p>
                      <p className="mt-1 text-muted-foreground"><span className="text-primary">Cue:</span> {imp.cue}</p>
                      <p className="mt-1 text-muted-foreground"><span className="text-primary">Drill:</span> {imp.drill}</p>
                    </div>
                  ))}
                  <p><span className="eyebrow">Next session</span><br />{a.data.next_session}</p>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
