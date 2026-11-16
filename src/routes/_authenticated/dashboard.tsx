import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Play } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SportFilter } from "@/components/site/sport-filter";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const dashboardQuery = () =>
  queryOptions({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const [{ data: auth }, videos, subs] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("videos").select("*").order("section").order("sort_order"),
        supabase.from("submissions").select("id, title, status, created_at").order("created_at", { ascending: false }).limit(5),
      ]);
      const userId = auth.user?.id ?? "";
      const { data: profile } = await supabase.from("profiles").select("display_name, sport, level").eq("id", userId).maybeSingle();
      return { profile, videos: videos.data ?? [], submissions: subs.data ?? [] };
    },
  });

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Kinetic" },
      { name: "description", content: "Your Kinetic training dashboard and video library." },
      { property: "og:title", content: "Dashboard — Kinetic" },
      { property: "og:description", content: "Your Kinetic training dashboard and video library." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(dashboardQuery()),
  component: Dashboard,
});

const SECTIONS = ["Strength & Power", "Speed & Agility", "Mobility & Recovery", "Sport Skills", "Mindset"];

function Dashboard() {
  const { data } = useSuspenseQuery(dashboardQuery());
  const [section, setSection] = useState(SECTIONS[0]!);
  const [playing, setPlaying] = useState<{ youtube_id: string; title: string } | null>(null);
  const [sportFilters, setSportFilters] = useState<string[]>([]);
  const videos = data.videos.filter(
    (v) => v.section === section && (sportFilters.length === 0 || v.sports.some((s) => sportFilters.includes(s))),
  );
  const name = data.profile?.display_name?.split(" ")[0] || "Athlete";

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">{[data.profile?.sport, data.profile?.level].filter(Boolean).join(" · ") || "Member"}</p>
          <h1 className="text-display mt-3 text-5xl md:text-7xl">Let's work, {name}.</h1>
        </div>
        <Button asChild variant="hero" size="xl">
          <Link to="/submit">Submit a video <ArrowRight /></Link>
        </Button>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          ["Videos in library", data.videos.length],
          ["Your submissions", data.submissions.length],
          ["AI reviews ready", data.submissions.filter((s) => s.status === "complete").length],
        ].map(([label, n]) => (
          <div key={label} className="rounded-2xl border border-border bg-surface p-6">
            <p className="text-display text-5xl font-extralight">{n}</p>
            <p className="mt-1 text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <h2 className="text-display mt-16 text-4xl">Video library</h2>
      <div className="mt-6 flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setSection(s)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-normal transition-colors",
              section === s ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="mt-6">
        <SportFilter selected={sportFilters} onChange={setSportFilters} />
      </div>
      {videos.length === 0 && (
        <p className="mt-10 text-sm text-muted-foreground">No videos match these filters in this section yet.</p>
      )}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((v) => (
          <button key={v.id} onClick={() => setPlaying(v)} className="group overflow-hidden rounded-2xl border border-border bg-surface text-left transition-colors hover:border-foreground/30">
            <div className="relative aspect-video overflow-hidden">
              <img src={`https://i.ytimg.com/vi/${v.youtube_id}/hqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
              <span className="absolute inset-0 grid place-items-center bg-background/30">
                <span className="grid size-14 place-items-center rounded-full bg-foreground text-background"><Play className="size-6" /></span>
              </span>
              <span className="absolute bottom-2 right-2 rounded bg-background/80 px-2 py-0.5 font-mono text-[0.68rem]">{v.duration_label}</span>
            </div>
            <div className="p-5">
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-brand-blue">{v.sport} · {v.level}</p>
              <h3 className="mt-2 text-base font-normal">{v.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{v.description}</p>
              <p className="mt-3 text-xs text-muted-foreground">{v.coach}</p>
            </div>
          </button>
        ))}
      </div>

      <Dialog open={!!playing} onOpenChange={(o) => !o && setPlaying(null)}>
        <DialogContent className="max-w-4xl p-0">
          <DialogTitle className="sr-only">{playing?.title}</DialogTitle>
          {playing && (
            <iframe
              className="aspect-video w-full rounded-lg"
              src={`https://www.youtube-nocookie.com/embed/${playing.youtube_id}?autoplay=1`}
              title={playing.title}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
