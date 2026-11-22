import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowRight,
  CalendarClock,
  Check,
  ChevronDown,
  ChevronRight,
  Droplets,
  ExternalLink,
  Flame,
  Loader2,
  ShieldCheck,
  Utensils,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { NutritionSkeleton } from "@/components/site/page-skeletons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import {
  createCheckoutSession,
  getBillingStatus,
  pricingCatalogQuery,
  verifyCheckoutSession,
} from "@/lib/billing.functions";
import { SITE_MEDIA } from "@/lib/media";
import type { NutrientEntry } from "@/lib/mock-seed";
import { nutritionListQuery } from "@/lib/nutrition.functions";
import { NUTRITION_STORE_PACKAGES, type PlanId } from "@/lib/plans";
import {
  AGE_GROUPS,
  NUTRITION_GROUPS,
  matchesAgeFilter,
  type AgeGroup,
  type NutritionGroup,
} from "@/lib/sports";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/nutrition")({
  validateSearch: (
    s: Record<string, unknown>,
  ): { session_id?: string | undefined; canceled?: string | undefined } => ({
    session_id:
      typeof s["session_id"] === "string" && s["session_id"] ? s["session_id"] : undefined,
    canceled: typeof s["canceled"] === "string" ? s["canceled"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Nutrition Guide & 6–8 Week Program — Dusk Kinetic Performance" },
      {
        name: "description",
        content:
          "Age-tailored athlete nutrition guide covering macronutrients, vitamins, macrominerals, and trace minerals alongside our 6–8 Week Health & Performance Program.",
      },
      { property: "og:title", content: "Nutrition Guide — Dusk Kinetic Performance" },
      {
        property: "og:description",
        content:
          "Clear summarized and in-depth biochemical reference for all 26 core nutrients, filtered by age bracket.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  pendingComponent: NutritionSkeleton,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(nutritionListQuery()),
      context.queryClient.ensureQueryData(pricingCatalogQuery()),
    ]);
  },
  component: NutritionPage,
});

const GROUP_DESCRIPTIONS: Record<NutritionGroup, { subtitle: string; detail: string }> = {
  Macronutrients: {
    subtitle: "3 primary energy & structural nutrients",
    detail: "Carbohydrates, proteins, and lipids powering daily output and tissue recovery.",
  },
  Vitamins: {
    subtitle: "13 essential fat-soluble & water-soluble vitamins",
    detail: "Cofactors regulating energy metabolism, red blood cells, immunity, and bone turnover.",
  },
  Macrominerals: {
    subtitle: "7 major minerals (≥ 100 mg/day)",
    detail: "Electrolytes, bone matrix minerals, and neuromuscular signaling ions.",
  },
  "Trace Minerals": {
    subtitle: "3 essential trace minerals (< 100 mg/day)",
    detail: "Oxygen transport, enzyme catalysis, and connective tissue cross-linking.",
  },
};

const PROGRAM_PHASES = [
  {
    phase: "Weeks 1–2 · Foundation & Fueling Baseline",
    focus: "Diagnostic movement screen, protein/hydration rhythm, and circadian sleep anchor.",
    deliverables: [
      "Audit daily protein distribution & sweat-rate hydration baseline",
      "Establish 3x/week hinge, squat & ankle stiffness mechanics before heavy intensity",
      "Capture baseline sprint or court skill clip for coach feedback",
    ],
  },
  {
    phase: "Weeks 3–5 · Force Output & Glycogen Periodization",
    focus: "Progressive power development paired with high/low carbohydrate intake days.",
    deliverables: [
      "Scale carbohydrate availability on heavy sprint & lift days vs recovery mobility days",
      "Contrast heavy compound lifts with crisp plyometric clusters",
      "Weekly form adjustments and recovery-RPE load balancing",
    ],
  },
  {
    phase: "Weeks 6–8 · Peak Conditioning & Competition Taper",
    focus: "Convert strength and tissue resilience into repeatable late-game speed.",
    deliverables: [
      "Execute game-day countdown fueling matrix (T-4h, T-60m, halftime)",
      "Taper lifting volume while maintaining velocity and explosive intent",
      "Post-cohort re-test on power, stride efficiency, and recovery habits",
    ],
  },
];

function NutritionPage() {
  const { session_id: sessionId, canceled } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session, ready } = useAuth();

  const { data: nutrients } = useSuspenseQuery(nutritionListQuery());
  const catalogQuery = useSuspenseQuery(pricingCatalogQuery());
  const fetchBillingStatus = useServerFn(getBillingStatus);
  const startCheckout = useServerFn(createCheckoutSession);
  const confirmCheckout = useServerFn(verifyCheckoutSession);

  const billingQuery = useQuery({
    queryKey: ["billing-status", session?.user?.id ?? "anon"],
    queryFn: () => fetchBillingStatus(),
    enabled: ready && Boolean(session),
  });

  // Age Filter ONLY on Nutrition
  const [ageGroup, setAgeGroup] = useState<string>("All");
  const [expandedGroups, setExpandedGroups] = useState<Record<NutritionGroup, boolean>>({
    Macronutrients: true,
    Vitamins: false,
    Macrominerals: false,
    "Trace Minerals": false,
  });
  const [selectedNutrient, setSelectedNutrient] = useState<NutrientEntry | null>(null);
  const [detailTab, setDetailTab] = useState<"summarized" | "indepth">("summarized");

  const [busyPlan, setBusyPlan] = useState<PlanId | null>(null);
  const [externalUrl, setExternalUrl] = useState<{ label: string; url: string } | null>(null);
  const [verifiedSessionId, setVerifiedSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (canceled) {
      toast.info("Checkout canceled — your package was not charged.");
    }
  }, [canceled]);

  useEffect(() => {
    if (!ready || !session || !sessionId || verifiedSessionId === sessionId) return;
    setVerifiedSessionId(sessionId);
    confirmCheckout({ data: { sessionId } })
      .then((res) => {
        queryClient.setQueryData(["billing-status", session.user.id], res);
        toast.success("Enrollment confirmed — welcome to the Dusk Kinetic Nutrition Program.");
        navigate({
          to: "/nutrition",
          search: { session_id: undefined, canceled: undefined },
          replace: true,
        });
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Could not verify checkout session.");
      });
  }, [ready, session, sessionId, verifiedSessionId, confirmCheckout, queryClient, navigate]);

  const filteredNutrients = useMemo(
    () => nutrients.filter((n) => matchesAgeFilter(n.ageGroups, ageGroup)),
    [nutrients, ageGroup],
  );

  const groupedNutrients = useMemo(() => {
    const map = new Map<
      NutritionGroup,
      { items: NutrientEntry[]; fatSoluble: NutrientEntry[]; waterSoluble: NutrientEntry[] }
    >();
    for (const group of NUTRITION_GROUPS) {
      const items = filteredNutrients.filter((n) => n.group === group);
      map.set(group, {
        items,
        fatSoluble: group === "Vitamins" ? items.filter((i) => i.subgroup === "Fat-Soluble") : [],
        waterSoluble: group === "Vitamins" ? items.filter((i) => i.subgroup !== "Fat-Soluble") : [],
      });
    }
    return map;
  }, [filteredNutrients]);

  const allExpanded = NUTRITION_GROUPS.every((g) => expandedGroups[g]);

  function toggleGroup(group: NutritionGroup) {
    setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  }

  function toggleExpandAll() {
    const nextState = !allExpanded;
    setExpandedGroups({
      Macronutrients: nextState,
      Vitamins: nextState,
      Macrominerals: nextState,
      "Trace Minerals": nextState,
    });
  }

  function openNutrientModal(nutrient: NutrientEntry) {
    setSelectedNutrient(nutrient);
    setDetailTab("summarized");
  }

  function redirectToStripe(url: string, label: string) {
    setExternalUrl({ label, url });
    try {
      if (window.self === window.top) {
        window.location.href = url;
      } else if (window.top) {
        window.top.location.href = url;
      }
    } catch {
      // Fallback link stays visible
    }
  }

  async function handleEnroll(plan: PlanId) {
    if (!session) {
      navigate({ to: "/auth", search: { mode: "signup" } });
      return;
    }
    setBusyPlan(plan);
    setExternalUrl(null);
    try {
      const { url } = await startCheckout({ data: { plan, returnPath: "/nutrition" } });
      redirectToStripe(url, "Continue to Stripe Checkout");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to start Stripe Checkout.");
    } finally {
      setBusyPlan(null);
    }
  }

  const packages = catalogQuery.data?.nutritionPackages ?? NUTRITION_STORE_PACKAGES;
  const purchasedPrograms = billingQuery.data?.purchasedPrograms ?? [];
  const activePlan = billingQuery.data?.plan ?? "free";
  const configured = catalogQuery.data?.configured ?? false;

  return (
    <div>
      {/* HERO */}
      <section className="relative isolate overflow-hidden border-b border-border/60">
        <img
          src={SITE_MEDIA.nutritionBowl.src}
          alt={SITE_MEDIA.nutritionBowl.alt}
          width={SITE_MEDIA.nutritionBowl.width}
          height={SITE_MEDIA.nutritionBowl.height}
          decoding="async"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center opacity-45 brightness-75"
        />
        <div className="absolute inset-0 -z-10 bg-fade-left" />
        <div className="absolute inset-0 -z-10 bg-fade-up" />

        <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
          <span className="block h-[3px] w-16 bg-tricolor" aria-hidden="true" />
          <p className="eyebrow mt-6 text-brand-amber">Nutrition Reference &amp; Coaching</p>
          <h1 className="text-display mt-4 max-w-4xl text-4xl sm:text-6xl md:text-7xl">
            Every essential nutrient. <span className="text-sunset">Clearly explained.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-light text-foreground/85">
            Browse macronutrients, vitamins, macrominerals, and trace minerals by age group. Click
            any nutrient for both an everyday summary and full biochemical depth.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="hero" size="xl" className="min-h-12">
              <a href="#nutrient-guide">
                Browse Nutrient Guide <ArrowRight aria-hidden="true" />
              </a>
            </Button>
            <Button asChild variant="glass" size="xl" className="min-h-12">
              <a href="#flagship-program">6–8 Week Performance Program</a>
            </Button>
          </div>
        </div>
      </section>

      {/* CLEAN NUTRIENT GUIDE WITH AGE FILTER ONLY */}
      <section id="nutrient-guide" className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow text-brand-amber">Open-Access Nutrient Guide</p>
            <h2 className="text-display mt-3 text-4xl md:text-5xl">
              Macronutrients, Vitamins &amp; Minerals
            </h2>
            <p className="mt-2 max-w-xl text-sm font-light text-muted-foreground">
              Open a category box below and select any nutrient to view its summarized guide or
              in-depth biochemical profile.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="font-mono tabular-nums">
              Showing {filteredNutrients.length} of {nutrients.length} nutrients
            </span>
            <button
              type="button"
              onClick={toggleExpandAll}
              className="font-mono uppercase tracking-[0.14em] text-brand-amber underline underline-offset-4 hover:text-foreground"
            >
              {allExpanded ? "Collapse all" : "Expand all"}
            </button>
          </div>
        </div>

        {/* AGE FILTER ONLY */}
        <div className="mt-8 rounded-2xl border border-border bg-surface p-5">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground">
            Filter by Age Group
          </p>
          <div
            role="radiogroup"
            aria-label="Filter nutrients by age group"
            className="mt-3 flex flex-wrap gap-2"
          >
            <button
              type="button"
              role="radio"
              aria-checked={ageGroup === "All"}
              onClick={() => setAgeGroup("All")}
              className={cn(
                "min-h-10 rounded-full border px-4 py-1.5 text-sm whitespace-nowrap transition-colors",
                ageGroup === "All"
                  ? "border-brand-amber bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              All Ages
            </button>
            {AGE_GROUPS.map((ag) => (
              <button
                key={ag}
                type="button"
                role="radio"
                aria-checked={ageGroup === ag}
                onClick={() => setAgeGroup(ag)}
                className={cn(
                  "min-h-10 rounded-full border px-4 py-1.5 text-sm whitespace-nowrap transition-colors",
                  ageGroup === ag
                    ? "border-brand-amber bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {ag}
              </button>
            ))}
          </div>
        </div>

        {/* 4 CLEAN EXPANDABLE NUTRIENT BOXES */}
        <div className="mt-8 space-y-4">
          {NUTRITION_GROUPS.map((group) => {
            const bucket = groupedNutrients.get(group);
            const items = bucket?.items ?? [];
            const isOpen = expandedGroups[group];
            const meta = GROUP_DESCRIPTIONS[group];
            const fatSoluble = bucket?.fatSoluble ?? [];
            const waterSoluble = bucket?.waterSoluble ?? [];

            return (
              <section
                key={group}
                className="overflow-hidden rounded-2xl border border-border bg-surface"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => toggleGroup(group)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-background/40"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-display text-2xl text-foreground sm:text-3xl">{group}</h3>
                      <span className="font-mono text-xs text-brand-amber tabular-nums">
                        {items.length} {items.length === 1 ? "item" : "items"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-light text-muted-foreground">
                      {meta.subtitle} · {meta.detail}
                    </p>
                  </div>
                  <span className="grid size-9 shrink-0 place-items-center rounded-full border border-border text-muted-foreground">
                    {isOpen ? (
                      <ChevronDown className="size-4" aria-hidden="true" />
                    ) : (
                      <ChevronRight className="size-4" aria-hidden="true" />
                    )}
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-border/70 px-6 pb-6 pt-4">
                    {items.length === 0 ? (
                      <p className="py-4 text-sm text-muted-foreground">
                        No nutrients prioritized specifically for {ageGroup} in this group. Switch
                        to All Ages to inspect the full list.
                      </p>
                    ) : group === "Vitamins" ? (
                      <div className="space-y-6">
                        {fatSoluble.length > 0 && (
                          <div>
                            <p className="mb-3 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-brand-orange">
                              Fat-Soluble Vitamins
                            </p>
                            <div className="grid gap-3 md:grid-cols-2">
                              {fatSoluble.map((item) => (
                                <NutrientRowCard
                                  key={item.id}
                                  nutrient={item}
                                  selectedAge={ageGroup}
                                  onOpen={openNutrientModal}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        {waterSoluble.length > 0 && (
                          <div>
                            <p className="mb-3 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-brand-amber">
                              Water-Soluble: B-Complex &amp; Vitamin C
                            </p>
                            <div className="grid gap-3 md:grid-cols-2">
                              {waterSoluble.map((item) => (
                                <NutrientRowCard
                                  key={item.id}
                                  nutrient={item}
                                  selectedAge={ageGroup}
                                  onOpen={openNutrientModal}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="grid gap-3 md:grid-cols-2">
                        {items.map((item) => (
                          <NutrientRowCard
                            key={item.id}
                            nutrient={item}
                            selectedAge={ageGroup}
                            onOpen={openNutrientModal}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </section>

      {/* POP-OUT NUTRIENT MODAL (SUMMARIZED VS IN-DEPTH TABS) */}
      <Dialog
        open={Boolean(selectedNutrient)}
        onOpenChange={(open) => !open && setSelectedNutrient(null)}
      >
        <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto bg-surface p-6 sm:p-8">
          {selectedNutrient && (
            <>
              <DialogHeader>
                <p className="eyebrow text-brand-amber">
                  {selectedNutrient.group}
                  {selectedNutrient.subgroup ? ` · ${selectedNutrient.subgroup}` : ""}
                </p>
                <DialogTitle className="text-display mt-1 text-3xl text-foreground sm:text-4xl">
                  {selectedNutrient.name}
                </DialogTitle>
                <DialogDescription className="pt-1 text-sm font-normal leading-relaxed text-foreground/85">
                  {selectedNutrient.performanceOneLiner}
                </DialogDescription>
              </DialogHeader>

              <Tabs
                value={detailTab}
                onValueChange={(v) => setDetailTab(v as "summarized" | "indepth")}
                className="mt-4"
              >
                <TabsList className="grid w-full grid-cols-2 bg-background">
                  <TabsTrigger value="summarized">Summarized Explanation</TabsTrigger>
                  <TabsTrigger value="indepth">In-Depth Explanation</TabsTrigger>
                </TabsList>

                <TabsContent value="summarized" className="mt-5 space-y-4">
                  <div className="rounded-xl border border-border bg-background/60 p-4">
                    <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-brand-amber">
                      What it does
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-foreground/95">
                      {selectedNutrient.summarized.whatItDoes}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-background/60 p-4">
                    <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-brand-orange">
                      3 Foods
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-foreground/95">
                      {selectedNutrient.summarized.threeFoods}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-border bg-background/60 p-4">
                      <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
                        Body Needs
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-foreground/95">
                        {selectedNutrient.summarized.bodyNeeds}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border bg-background/60 p-4">
                      <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
                        Average American Gets
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-foreground/95">
                        {selectedNutrient.summarized.averageAmericanGets}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="indepth" className="mt-5 space-y-4">
                  <div className="rounded-xl border border-border bg-background/60 p-5">
                    <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-brand-amber">
                      Biochemical Function
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-foreground/95">
                      {selectedNutrient.inDepth.biochemicalFunction}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-background/60 p-5">
                    <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-brand-orange">
                      Where It Is Located in Food
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-foreground/95">
                      {selectedNutrient.inDepth.whereLocatedInFood}
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              {selectedNutrient.ageGuidance &&
                Object.keys(selectedNutrient.ageGuidance).length > 0 && (
                  <div className="mt-4 rounded-xl border border-brand-amber/30 bg-background/50 p-4">
                    <p className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-brand-amber">
                      Age-Specific Notes
                    </p>
                    <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-muted-foreground">
                      {(Object.entries(selectedNutrient.ageGuidance) as [AgeGroup, string][]).map(
                        ([bracket, note]) => (
                          <li
                            key={bracket}
                            className={cn(
                              ageGroup === bracket ? "font-medium text-foreground" : "",
                            )}
                          >
                            <span className="text-foreground/90">{bracket}:</span> {note}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* FLAGSHIP 6-8 WEEK HEALTH & PERFORMANCE PROGRAM SHOWCASE */}
      <section id="flagship-program" className="border-y border-border/60 bg-surface/50">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <span className="block h-[3px] w-16 bg-tricolor" aria-hidden="true" />
              <p className="eyebrow mt-5 text-brand-amber">Flagship Cohort Storefront</p>
              <h2 className="text-display mt-3 text-4xl sm:text-5xl md:text-6xl">
                6–8 Week Health &amp; Performance Program
              </h2>
              <p className="mt-4 text-base font-light leading-relaxed text-muted-foreground">
                Our periodized sprint, strength, and sports nutrition cohort built by Head Coach
                Daniel Reyes and Sports Dietitian Priya Shah. Engineered to build sustainable
                fueling habits and repeatable speed across 8 weeks.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  { icon: Flame, label: "Sprint & Power", value: "3x / week + mobility" },
                  { icon: Utensils, label: "Macro Periodization", value: "Rest vs Training days" },
                  { icon: Droplets, label: "Biometric Reviews", value: "Weekly coach check-in" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-xl border border-border bg-background/70 p-4">
                    <Icon className="size-4 text-brand-orange" aria-hidden="true" />
                    <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="hero"
                  size="xl"
                  className="min-h-12"
                  disabled={busyPlan !== null || (!configured && Boolean(session))}
                  onClick={() => handleEnroll("program_8week")}
                >
                  {busyPlan === "program_8week" ? (
                    <>
                      <Loader2 className="animate-spin" aria-hidden="true" /> Opening Stripe…
                    </>
                  ) : purchasedPrograms.includes("program_8week") ? (
                    <>
                      <ShieldCheck aria-hidden="true" /> Enrolled in 8-Week Program
                    </>
                  ) : (
                    <>
                      Enroll Now — $399 <ArrowRight aria-hidden="true" />
                    </>
                  )}
                </Button>
                <Button asChild variant="glass" size="xl" className="min-h-12">
                  <Link to="/contact">
                    <CalendarClock aria-hidden="true" /> Book Consultation
                  </Link>
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl border border-border bg-background">
                <img
                  src={SITE_MEDIA.nutritionGreens.src}
                  alt={SITE_MEDIA.nutritionGreens.alt}
                  width={SITE_MEDIA.nutritionGreens.width}
                  height={SITE_MEDIA.nutritionGreens.height}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[16/9] w-full object-cover"
                />
              </div>
              {PROGRAM_PHASES.map((p) => (
                <div key={p.phase} className="rounded-2xl border border-border bg-surface p-5">
                  <p className="font-mono text-xs uppercase tracking-[0.14em] text-brand-amber">
                    {p.phase}
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">{p.focus}</p>
                  <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                    {p.deliverables.map((d) => (
                      <li key={d} className="flex items-start gap-2">
                        <span className="mt-1.5 size-1 shrink-0 rounded-full bg-brand-orange" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CUSTOM NUTRITION PACKAGES STOREFRONT */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-24">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Custom Performance Packages</p>
            <h2 className="text-display mt-3 text-4xl md:text-5xl">
              Targeted Coaching &amp; Blueprints
            </h2>
          </div>
          <p className="max-w-md text-sm font-light text-muted-foreground">
            Processed securely via Stripe Checkout. Choose a one-time custom fueling blueprint, the
            flagship 8-week cohort, or ongoing bi-weekly RD adjustments.
          </p>
        </div>

        {externalUrl && (
          <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-brand-amber/50 bg-surface p-6 sm:flex-row sm:items-center">
            <div>
              <p className="eyebrow text-brand-amber">Checkout session ready</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Use the secure link below if Stripe Checkout did not open automatically.
              </p>
            </div>
            <Button asChild variant="hero" size="lg">
              <a href={externalUrl.url} target="_blank" rel="noopener noreferrer">
                {externalUrl.label} <ExternalLink />
              </a>
            </Button>
          </div>
        )}

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {packages.map((pkg) => {
            const owned =
              purchasedPrograms.includes(pkg.id) ||
              (activePlan === pkg.id && billingQuery.data?.status === "active");

            return (
              <article
                key={pkg.id}
                className={cn(
                  "flex flex-col justify-between rounded-2xl border bg-surface p-7 transition-colors hover:border-foreground/30",
                  pkg.highlighted ? "border-brand-amber/60" : "border-border",
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="eyebrow">{pkg.tierLabel}</p>
                    {pkg.badge && (
                      <span className="font-mono text-[0.64rem] uppercase tracking-[0.16em] text-brand-amber">
                        {pkg.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-display mt-4 text-3xl">{pkg.name}</h3>
                  <p className="mt-2 min-h-[3rem] text-sm font-light text-muted-foreground">
                    {pkg.tagline}
                  </p>

                  <div className="mt-6 flex items-baseline gap-2.5">
                    <span className="text-display text-5xl font-light tabular-nums">
                      {pkg.priceDisplay}
                    </span>
                    <span className="text-sm text-muted-foreground">{pkg.cadenceLabel}</span>
                  </div>

                  <ul className="mt-6 space-y-3 border-t border-border pt-6 text-sm text-muted-foreground">
                    {pkg.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-3 text-foreground/90">
                        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-brand-amber/50 text-brand-amber">
                          <Check className="size-3" />
                        </span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 space-y-2.5">
                  <Button
                    type="button"
                    variant={pkg.highlighted ? "hero" : "glass"}
                    size="xl"
                    className="w-full"
                    disabled={owned || busyPlan !== null || (!configured && Boolean(session))}
                    onClick={() => handleEnroll(pkg.id)}
                  >
                    {busyPlan === pkg.id ? (
                      <>
                        <Loader2 className="animate-spin" /> Connecting to Stripe…
                      </>
                    ) : owned ? (
                      "Enrolled / Active"
                    ) : !session ? (
                      <>
                        Sign up &amp; enroll <ArrowRight />
                      </>
                    ) : (
                      <>
                        Enroll Now <ArrowRight />
                      </>
                    )}
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-muted-foreground"
                  >
                    <Link to="/contact">Questions? Book a consultation →</Link>
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function NutrientRowCard({
  nutrient,
  selectedAge,
  onOpen,
}: {
  nutrient: NutrientEntry;
  selectedAge: string;
  onOpen: (n: NutrientEntry) => void;
}) {
  const ageNote =
    selectedAge !== "All" && nutrient.ageGuidance
      ? nutrient.ageGuidance[selectedAge as AgeGroup]
      : undefined;

  return (
    <button
      type="button"
      onClick={() => onOpen(nutrient)}
      className="group flex flex-col justify-between rounded-xl border border-border bg-background/60 p-4 text-left transition-colors hover:border-brand-amber/50 hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-base font-medium text-foreground group-hover:text-brand-amber">
            {nutrient.name}
          </h4>
          <p className="mt-1 text-sm font-light leading-relaxed text-muted-foreground">
            {nutrient.performanceOneLiner}
          </p>
        </div>
        <span className="shrink-0 pt-0.5 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-brand-amber">
          Open →
        </span>
      </div>
      {ageNote && (
        <p className="mt-2.5 border-t border-border/60 pt-2 text-xs text-foreground/85">
          <span className="font-mono text-[0.64rem] uppercase tracking-[0.12em] text-brand-orange">
            {selectedAge}:
          </span>{" "}
          {ageNote}
        </p>
      )}
    </button>
  );
}
