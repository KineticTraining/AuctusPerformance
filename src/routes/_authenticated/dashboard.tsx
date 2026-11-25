import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Play } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AthleticImage } from "@/components/site/athletic-image";
import { MultiFilterBar } from "@/components/site/multi-filter-bar";
import { PageWithOutline, type OutlineSection } from "@/components/site/page-outline";
import { DashboardSkeleton } from "@/components/site/page-skeletons";
import { SportFilter } from "@/components/site/sport-filter";
import { WorkspaceTabs } from "@/components/site/workspace-tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { getBillingStatus } from "@/lib/billing.functions";
import { getVideoThumbnail } from "@/lib/media";
import { SEED_VIDEOS, type VideoSeedRow } from "@/lib/mock-seed";
import { getTierById } from "@/lib/plans";
import { matchesAgeFilter, matchesExperienceFilter } from "@/lib/sports";
import { cn } from "@/lib/utils";

const SEED_VIDEO_BY_YT = new Map(SEED_VIDEOS.map((sv) => [sv.youtube_id, sv]));

const dashboardQuery = () =>
  queryOptions({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const [{ data: auth }, videos, videoApi] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from("videos")
          .select(
            "id, created_at, section, title, description, sport, sports, level, duration_label, youtube_id, coach, sort_order",
          )
          .order("section")
          .order("sort_order")
          .then(
            (r) => r,
            () => ({ data: null }),
          ),
        supabase.auth.getSession().then(async ({ data: sessionRes }) => {
          const token = sessionRes.session?.access_token;
          if (!token) return [];
          try {
            const res = await fetch("/api/video/submissions", {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) return [];
            const payload = (await res.json()) as {
              submissions?: Array<{
                id: string;
                title: string;
                status: string;
                created_at: string;
              }>;
            };
            return payload.submissions ?? [];
          } catch {
            return [];
          }
        }),
      ]);
      const userId = auth.user?.id ?? "";
      const { data: profile } = userId
        ? await supabase
            .from("profiles")
            .select("display_name, sport, level")
            .eq("id", userId)
            .maybeSingle()
            .then(
              (r) => r,
              () => ({ data: null }),
            )
        : { data: null };

      const rawVideos = videos.data && videos.data.length > 0 ? videos.data : SEED_VIDEOS;

      const enrichedVideos: VideoSeedRow[] = rawVideos.map((v) => {
        const seedMeta = SEED_VIDEO_BY_YT.get(v.youtube_id);
        const raw = v as VideoSeedRow;
        return {
          ...v,
          age_groups: raw.age_groups ??
            seedMeta?.age_groups ?? ["Young Adult (18–29)", "Adult (30–45)"],
          experience_levels:
            raw.experience_levels ??
            seedMeta?.experience_levels ??
            (v.level === "All levels" ? ["Beginner", "Intermediate", "Advanced"] : [v.level]),
        };
      });

      const meta = (auth.user?.user_metadata ?? {}) as Record<string, string | undefined>;
      const resolvedProfile = profile ?? {
        display_name: meta["display_name"] ?? auth.user?.email?.split("@")[0] ?? "Athlete",
        sport: meta["sport"] ?? "",
        level: meta["level"] ?? "",
      };

      return { profile: resolvedProfile, videos: enrichedVideos, submissions: videoApi };
    },
  });

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Training Library — Auctus Performance" },
      {
        name: "description",
        content: "Your Auctus Performance training dashboard and video library.",
      },
      { property: "og:title", content: "Training Library — Auctus Performance" },
      {
        property: "og:description",
        content: "Your Auctus Performance training dashboard and video library.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  pendingComponent: DashboardSkeleton,
  loader: ({ context }) => context.queryClient.ensureQueryData(dashboardQuery()),
  component: Dashboard,
});

const SECTIONS = [
  "All sections",
  "Strength & Power",
  "Speed & Agility",
  "Mobility & Recovery",
  "Sport Skills",
  "Mindset",
];

const DASHBOARD_OUTLINE: OutlineSection[] = [
  { id: "library-overview", label: "Overview" },
  { id: "library-filters", label: "Filters" },
  { id: "library-videos", label: "Training Videos" },
];

function Dashboard() {
  const { data } = useSuspenseQuery(dashboardQuery());
  const fetchBillingStatus = useServerFn(getBillingStatus);
  const billingQuery = useQuery({
    queryKey: ["billing-status"],
    queryFn: () => fetchBillingStatus(),
  });

  const [section, setSection] = useState("All sections");
  const [ageGroup, setAgeGroup] = useState("All");
  const [experienceLevel, setExperienceLevel] = useState("All");
  const [search, setSearch] = useState("");
  const [playing, setPlaying] = useState<{ youtube_id: string; title: string } | null>(null);
  const [sportFilters, setSportFilters] = useState<string[]>([]);
  const [showAllVideos, setShowAllVideos] = useState(false);

  const isSubscribed =
    billingQuery.data?.status === "active" || billingQuery.data?.status === "trialing";
  const activeTier = isSubscribed ? getTierById(billingQuery.data?.plan) : undefined;
  const maxSportFilters = activeTier?.maxSportFilters ?? null;

  useEffect(() => {
    if (typeof maxSportFilters === "number" && sportFilters.length > maxSportFilters) {
      setSportFilters((prev) => prev.slice(0, maxSportFilters));
    }
  }, [maxSportFilters, sportFilters.length]);

  const queryLower = search.trim().toLowerCase();

  const videos = useMemo(() => {
    const sectionVideos = data.videos.filter(
      (v) =>
        (section === "All sections" || v.section === section) &&
        (sportFilters.length === 0 || v.sports.some((s) => sportFilters.includes(s))) &&
        matchesAgeFilter(v.age_groups, ageGroup) &&
        matchesExperienceFilter(v.experience_levels, experienceLevel) &&
        (!queryLower ||
          v.title.toLowerCase().includes(queryLower) ||
          v.description.toLowerCase().includes(queryLower) ||
          v.coach.toLowerCase().includes(queryLower) ||
          v.sport.toLowerCase().includes(queryLower)),
    );

    if (activeTier?.videoAccess !== "beginner_some_intermediate") {
      return sectionVideos;
    }

    const intermediatePerSection = new Map<string, number>();
    return sectionVideos.filter((v) => {
      if (v.level === "Beginner" || v.level === "All levels") return true;
      if (v.level === "Intermediate") {
        const used = intermediatePerSection.get(v.section) ?? 0;
        if (used === 0) {
          intermediatePerSection.set(v.section, 1);
          return true;
        }
      }
      return false;
    });
  }, [
    data.videos,
    section,
    sportFilters,
    ageGroup,
    experienceLevel,
    queryLower,
    activeTier?.videoAccess,
  ]);

  const hasActiveFilters =
    section !== "All sections" ||
    ageGroup !== "All" ||
    experienceLevel !== "All" ||
    search.trim() !== "" ||
    sportFilters.length > 0;

  // Uncluttered starter set when no filters are active
  const visibleVideos = useMemo(
    () => (!hasActiveFilters && !showAllVideos ? videos.slice(0, 4) : videos),
    [hasActiveFilters, showAllVideos, videos],
  );

  function resetAllFilters() {
    setSection("All sections");
    setAgeGroup("All");
    setExperienceLevel("All");
    setSearch("");
    setSportFilters([]);
  }

  const name = data.profile?.display_name?.split(" ")[0] || "Athlete";
  const reviewsReadyCount = useMemo(
    () => data.submissions.filter((s) => s.status === "complete").length,
    [data.submissions],
  );

  return (
    <PageWithOutline sections={DASHBOARD_OUTLINE} title="Video Library">
      <WorkspaceTabs active="library" />

      <div
        id="library-overview"
        className="scroll-mt-24 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <p className="eyebrow text-brand-amber">
            {[
              data.profile?.sport,
              data.profile?.level,
              activeTier ? `${activeTier.name} Plan` : null,
            ]
              .filter(Boolean)
              .join(" · ") || "Training Library"}
          </p>
          <h1 className="text-display mt-3 text-3xl sm:text-5xl md:text-6xl">
            Let&apos;s work, {name}.
          </h1>
          <p className="mt-2 font-mono text-xs text-muted-foreground tabular-nums">
            {data.videos.length} library videos · {data.submissions.length} submissions ·{" "}
            {reviewsReadyCount} AI reviews ready
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {billingQuery.isLoading ? (
            <Skeleton className="h-11 w-full sm:w-36" />
          ) : (
            <Button asChild variant="glass" size="lg" className="min-h-11 w-full sm:w-auto">
              <Link to="/pricing">
                {activeTier ? `${activeTier.name} plan` : "Plans & pricing"}
              </Link>
            </Button>
          )}
          <Button asChild variant="hero" size="lg" className="min-h-11 w-full sm:w-auto">
            <Link to="/submit">
              Open AI Video Analysis <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>

      <section id="library-filters" className="mt-8 scroll-mt-24 space-y-5 sm:mt-10">
        <div className="flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSection(s)}
              className={cn(
                "min-h-11 rounded-full border px-4 py-2 text-sm font-normal whitespace-nowrap transition-colors",
                section === s
                  ? "border-brand-amber bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <MultiFilterBar
          ageGroup={ageGroup}
          onAgeGroupChange={setAgeGroup}
          experienceLevel={experienceLevel}
          onExperienceLevelChange={setExperienceLevel}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search drills, coaches, or movements..."
          hasActiveFilters={hasActiveFilters}
          onReset={resetAllFilters}
          resultCount={videos.length}
          totalCount={data.videos.length}
        />

        <SportFilter
          selected={sportFilters}
          onChange={setSportFilters}
          maxSelections={maxSportFilters}
          onLimitReached={(limit) =>
            toast.info(
              `Your ${activeTier?.name ?? "current"} plan includes up to ${limit} sport filters. Upgrade on Pricing for more.`,
            )
          }
        />
      </section>

      {videos.length === 0 && (
        <div className="mt-10 rounded-2xl border border-border bg-surface p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No training videos match these combined filters yet.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={resetAllFilters}
            className="mt-4"
          >
            Reset all filters
          </Button>
        </div>
      )}

      <div
        id="library-videos"
        className="mt-8 scroll-mt-24 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {visibleVideos.map((v) => {
          const thumb = getVideoThumbnail({
            youtubeId: v.youtube_id,
            sport: v.sport,
            section: v.section,
            title: v.title,
            coach: v.coach,
          });
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => setPlaying(v)}
              aria-label={`Play ${v.title} coached by ${v.coach}`}
              className="group overflow-hidden rounded-2xl border border-border bg-surface text-left transition-colors hover:border-brand-amber/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="relative aspect-video overflow-hidden bg-background">
                <AthleticImage
                  src={thumb.src}
                  alt={thumb.alt}
                  width={1280}
                  height={720}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute inset-0 grid place-items-center bg-background/35 transition-colors group-hover:bg-background/20">
                  <span className="grid size-12 place-items-center rounded-full bg-foreground text-background shadow-lg">
                    <Play className="size-5" aria-hidden="true" />
                  </span>
                </span>
                <span className="absolute bottom-2 right-2 rounded bg-background/85 px-2 py-0.5 font-mono text-[0.68rem] text-foreground tabular-nums">
                  {v.duration_label}
                </span>
              </div>
              <div className="p-4">
                <p className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-brand-amber">
                  {v.sport} · {v.level}
                </p>
                <h3 className="mt-1.5 text-base font-normal text-foreground">{v.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {v.description}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {v.coach} · {v.age_groups.length === 4 ? "All ages" : v.age_groups[0]}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {!hasActiveFilters && videos.length > 4 && (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/70 bg-surface/60 px-5 py-3.5 text-sm">
          <p className="text-muted-foreground">
            {showAllVideos
              ? `Showing all ${videos.length} training videos.`
              : `Showing 4 starter fundamentals. Apply any filter above or expand all ${videos.length} videos.`}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAllVideos((prev) => !prev)}
          >
            {showAllVideos ? "Show starter set (4)" : `Browse all ${videos.length} videos`}
          </Button>
        </div>
      )}

      <Dialog open={!!playing} onOpenChange={(o) => !o && setPlaying(null)}>
        <DialogContent className="max-w-4xl overflow-hidden p-0">
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
    </PageWithOutline>
  );
}
