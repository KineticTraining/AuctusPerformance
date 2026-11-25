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

import { NutrientPriorityPanel } from "@/components/nutrition/nutrient-priority-panel";
import { AthleticImage } from "@/components/site/athletic-image";
import { PageWithOutline, type OutlineSection } from "@/components/site/page-outline";
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
import { getNutrientPriority } from "@/lib/nutrition-data";
import { nutritionListQuery } from "@/lib/nutrition.functions";
import { NUTRITION_STORE_PACKAGES, type PlanId } from "@/lib/plans";
import { NUTRITION_GROUPS, type NutritionGroup } from "@/lib/sports";
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
      { title: "Nutrition Guide & Program — Auctus Performance" },
      {
        name: "description",
        content:
          "Verified athletic nutrition guide covering macronutrients, vitamins, macrominerals, and trace minerals with interactive priority cues alongside our 6–8 Week Health & Performance Program.",
      },
      { property: "og:title", content: "Nutrition Guide — Auctus Performance" },
      {
        property: "og:description",
        content:
          "Summarized and in-depth biochemical reference for 26 core nutrients with priority cues.",
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

const NUTRITION_OUTLINE: OutlineSection[] = [
  { id: "nutrition-overview", label: "Overview" },
  { id: "nutrient-guide", label: "Nutrient Guide" },
  { id: "flagship-program", label: "6–8 Week Program" },
  { id: "nutrition-packages", label: "Packages" },
];

const PROGRAM_PHASES = [
  {
    phase: "Weeks 1–2 · Foundation & Fueling Baseline",
    focus: "Diagnostic movement screen, protein/hydration rhythm, and circadian sleep anchor.",
    deliverables: [
      "Audit daily protein distribution & sweat-rate hydration baseline",
      "Establish 3x/week hinge, squat & ankle stiffness mechanics before heavy intensity",
      "Capture baseline sprint or court skill clip for analysis",
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

  const [expandedGroups, setExpandedGroups] = useState<Record<NutritionGroup, boolean>>({
    Macronutrients: true,
    Vitamins: false,
    Macrominerals: false,
    "Trace Minerals": false,
  });
  const [inspectedNutrient, setInspectedNutrient] = useState<NutrientEntry | null>(
    () => nutrients[0] ?? null,
  );
  const [selectedNutrient, setSelectedNutrient] = useState<NutrientEntry | null>(null);
  const [detailTab, setDetailTab] = useState<"summarized" | "indepth">("summarized");

  const [busyPlan, setBusyPlan] = useState<PlanId | null>(null);
  const [externalUrl, setExternalUrl] = useState<{ label: string; url: string } | null>(null);
  const [verifiedSessionId, setVerifiedSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (!inspectedNutrient && nutrients.length > 0) {
      setInspectedNutrient(nutrients[0] ?? null);
    }
  }, [nutrients, inspectedNutrient]);

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
        toast.success(
          "Enrollment confirmed — welcome to the Auctus Performance Nutrition Program.",
        );
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

  const groupedNutrients = useMemo(() => {
    const map = new Map<
      NutritionGroup,
      { items: NutrientEntry[]; fatSoluble: NutrientEntry[]; waterSoluble: NutrientEntry[] }
    >();
    for (const group of NUTRITION_GROUPS) {
      const items = nutrients.filter((n) => n.group === group);
      map.set(group, {
        items,
        fatSoluble: group === "Vitamins" ? items.filter((i) => i.subgroup === "Fat-Soluble") : [],
        waterSoluble: group === "Vitamins" ? items.filter((i) => i.subgroup !== "Fat-Soluble") : [],
      });
    }
    return map;
  }, [nutrients]);

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
    setInspectedNutrient(nutrient);
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
    if (!configured) {
      toast.info(
        "This package is shown in preview/demo mode — use Book Consultation for coaching inquiries.",
      );
      return;
    }
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
    <PageWithOutline sections={NUTRITION_OUTLINE} title="Nutrition">
      {/* HERO */}
      <section
        id="nutrition-overview"
        className="scroll-mt-24 relative isolate overflow-hidden rounded-2xl border border-border/60 sm:rounded-3xl"
      >
        <AthleticImage
          src={SITE_MEDIA.nutritionBowl.src}
          alt={SITE_MEDIA.nutritionBowl.alt}
          width={SITE_MEDIA.nutritionBowl.width}
          height={SITE_MEDIA.nutritionBowl.height}
          decoding="async"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center opacity-45 brightness-75"
        />
        <div className="absolute inset-0 -z-10 bg-fade-left" />
        <div className="absolute inset-0 -z-10 bg-fade-up" />

        <div className="px-6 py-14 sm:px-10 sm:py-20">
          <span className="block h-[3px] w-16 bg-tricolor" aria-hidden="true" />
          <p className="eyebrow mt-5 text-brand-amber">Nutrition Reference</p>
          <h1 className="text-display mt-3 max-w-3xl text-4xl sm:text-6xl">
            Every essential nutrient. <span className="text-sunset">Clearly explained.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base font-light text-foreground/85 sm:text-lg">
            26 macronutrients, vitamins, and minerals with priority tiers.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild variant="hero" size="xl" className="min-h-12 w-full sm:w-auto">
              <a href="#nutrient-guide">
                Nutrient Guide <ArrowRight aria-hidden="true" />
              </a>
            </Button>
            <Button asChild variant="glass" size="xl" className="min-h-12 w-full sm:w-auto">
              <a href="#flagship-program">6–8 Week Program</a>
            </Button>
          </div>
        </div>
      </section>

      {/* NUTRIENT GUIDE + DYNAMIC PRIORITY INSPECTOR */}
      <section id="nutrient-guide" className="scroll-mt-24 py-14 sm:py-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow text-brand-amber">Nutrient Reference</p>
            <h2 className="text-display mt-2.5 text-3xl sm:text-4xl">
              Macronutrients, Vitamins &amp; Minerals
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="font-mono tabular-nums">{nutrients.length} verified nutrients</span>
            <button
              type="button"
              onClick={toggleExpandAll}
              className="inline-flex min-h-11 items-center font-mono uppercase tracking-[0.14em] text-brand-amber underline underline-offset-4 hover:text-foreground"
            >
              {allExpanded ? "Collapse all" : "Expand all"}
            </button>
          </div>
        </div>

        {/* 2-Column Split: 4 Expandable Groups + Sticky Priority Graphic */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.25fr_0.9fr] lg:items-start">
          <div className="space-y-4">
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
                    className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-background/40 sm:px-6 sm:py-5"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-display text-2xl text-foreground sm:text-3xl">
                          {group}
                        </h3>
                        <span className="font-mono text-xs text-brand-amber tabular-nums">
                          {items.length} {items.length === 1 ? "item" : "items"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-light text-muted-foreground">
                        {meta.subtitle} · {meta.detail}
                      </p>
                    </div>
                    <span className="grid size-11 shrink-0 place-items-center rounded-full border border-border text-muted-foreground">
                      {isOpen ? (
                        <ChevronDown className="size-4" aria-hidden="true" />
                      ) : (
                        <ChevronRight className="size-4" aria-hidden="true" />
                      )}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="border-t border-border/70 px-5 pb-6 pt-5 sm:px-6">
                      {group === "Vitamins" ? (
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
                                    isInspected={inspectedNutrient?.id === item.id}
                                    onInspect={setInspectedNutrient}
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
                                    isInspected={inspectedNutrient?.id === item.id}
                                    onInspect={setInspectedNutrient}
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
                              isInspected={inspectedNutrient?.id === item.id}
                              onInspect={setInspectedNutrient}
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

          {/* Sticky Dynamic Priority Panel */}
          <NutrientPriorityPanel nutrient={inspectedNutrient} onOpenModal={openNutrientModal} />
        </div>
      </section>

      {/* POP-OUT NUTRIENT MODAL (SUMMARIZED VS IN-DEPTH TABS) */}
      <Dialog
        open={Boolean(selectedNutrient)}
        onOpenChange={(open) => !open && setSelectedNutrient(null)}
      >
        <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto bg-surface p-5 sm:p-8">
          {selectedNutrient && (
            <>
              <DialogHeader className="pr-10 text-left">
                <p className="eyebrow text-brand-amber">
                  {selectedNutrient.group}
                  {selectedNutrient.subgroup ? ` · ${selectedNutrient.subgroup}` : ""}
                </p>
                <DialogTitle className="text-display mt-1 text-2xl text-foreground sm:text-4xl">
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
                <TabsList className="grid h-auto w-full grid-cols-1 gap-1 bg-background p-1 sm:grid-cols-2">
                  <TabsTrigger value="summarized" className="min-h-11 text-sm">
                    Summarized Explanation
                  </TabsTrigger>
                  <TabsTrigger value="indepth" className="min-h-11 text-sm">
                    In-Depth Explanation
                  </TabsTrigger>
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
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* FLAGSHIP 6-8 WEEK HEALTH & PERFORMANCE PROGRAM SHOWCASE */}
      <section
        id="flagship-program"
        className="scroll-mt-24 rounded-3xl border border-border/60 bg-surface/50 px-6 py-14 sm:px-8 sm:py-18"
      >
        <div>
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <span className="block h-[3px] w-16 bg-tricolor" aria-hidden="true" />
              <p className="eyebrow mt-5 text-brand-amber">Flagship Program</p>
              <h2 className="text-display mt-3 text-4xl sm:text-5xl md:text-6xl">
                6–8 Week Health &amp; Performance Program
              </h2>
              <p className="mt-4 text-base font-light leading-relaxed text-muted-foreground">
                Our periodized sprint, strength, and sports nutrition curriculum engineered to build
                sustainable fueling habits and repeatable output across 8 focused weeks.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  { icon: Flame, label: "Sprint & Power", value: "3x / week + mobility" },
                  { icon: Utensils, label: "Macro Periodization", value: "Rest vs Training days" },
                  { icon: Droplets, label: "Weekly Check-Ins", value: "Structured load tracking" },
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

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Button
                  type="button"
                  variant="hero"
                  size="xl"
                  className="min-h-12 w-full sm:w-auto"
                  disabled={busyPlan !== null}
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
                  ) : !configured ? (
                    <>
                      Preview Program — $399 <ArrowRight aria-hidden="true" />
                    </>
                  ) : (
                    <>
                      Enroll Now — $399 <ArrowRight aria-hidden="true" />
                    </>
                  )}
                </Button>
                <Button asChild variant="glass" size="xl" className="min-h-12 w-full sm:w-auto">
                  <Link to="/contact">
                    <CalendarClock aria-hidden="true" /> Book Consultation
                  </Link>
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl border border-border bg-background">
                <AthleticImage
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
      <section id="nutrition-packages" className="scroll-mt-24 pt-16 sm:pt-20">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Custom Performance Packages</p>
            <h2 className="text-display mt-3 text-4xl md:text-5xl">
              Targeted Coaching &amp; Blueprints
            </h2>
          </div>
          <p className="max-w-md text-sm font-light text-muted-foreground">
            Processed securely via Stripe Checkout. Choose a one-time custom fueling blueprint, the
            8-week cohort, or ongoing bi-weekly adjustments.
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
                    disabled={owned || busyPlan !== null}
                    onClick={() => handleEnroll(pkg.id)}
                  >
                    {busyPlan === pkg.id ? (
                      <>
                        <Loader2 className="animate-spin" /> Connecting to Stripe…
                      </>
                    ) : owned ? (
                      "Enrolled / Active"
                    ) : !configured ? (
                      <>
                        Preview Tier ({pkg.priceDisplay}) <ArrowRight />
                      </>
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
    </PageWithOutline>
  );
}

function NutrientRowCard({
  nutrient,
  isInspected,
  onInspect,
  onOpen,
}: {
  nutrient: NutrientEntry;
  isInspected: boolean;
  onInspect: (n: NutrientEntry) => void;
  onOpen: (n: NutrientEntry) => void;
}) {
  const priority = getNutrientPriority(nutrient);
  const tierColor =
    priority.tier === "high"
      ? "text-brand-amber"
      : priority.tier === "situational"
        ? "text-brand-orange"
        : "text-brand-indigo";

  return (
    <button
      type="button"
      onMouseEnter={() => onInspect(nutrient)}
      onFocus={() => onInspect(nutrient)}
      onClick={() => onOpen(nutrient)}
      className={cn(
        "group flex flex-col justify-between rounded-xl border bg-background/60 p-4 text-left transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isInspected
          ? "border-brand-amber/60 bg-background"
          : "border-border hover:border-brand-amber/40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={cn("font-mono text-[0.64rem] uppercase tracking-[0.14em]", tierColor)}>
            {priority.tier === "high"
              ? "High Priority"
              : priority.tier === "situational"
                ? "Situational"
                : "Baseline"}
          </p>
          <h4 className="mt-1 text-base font-medium text-foreground group-hover:text-brand-amber">
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
    </button>
  );
}
