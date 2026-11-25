export type PlanId =
  | "basic"
  | "pro"
  | "unlimited_monthly"
  | "unlimited_annual"
  | "macro_blueprint"
  | "nutrition_coaching"
  | "program_8week";

export type MembershipPlanId = "free" | PlanId;
export type PlanInterval = "month" | "year" | "one_time";

export interface PricingTier {
  id: PlanId;
  tierLabel: string;
  name: string;
  tagline: string;
  amountCents: number;
  priceDisplay: string;
  interval: PlanInterval;
  cadenceLabel: string;
  maxSportFilters: number | null; // null = unlimited
  maxMonthlyReviews: number | null; // null = unlimited
  videoAccess: "beginner_some_intermediate" | "all";
  highlighted?: boolean;
  badge?: string;
  envPriceIdKey: string;
  features: string[];
  kind: "membership" | "nutrition_program";
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "basic",
    tierLabel: "Tier 1",
    name: "Basic",
    tagline: "Focused two-sport foundation for consistent weekly training.",
    amountCents: 4500,
    priceDisplay: "$45",
    interval: "month",
    cadenceLabel: "/ month",
    maxSportFilters: 2,
    maxMonthlyReviews: 20,
    videoAccess: "beginner_some_intermediate",
    envPriceIdKey: "STRIPE_PRICE_ID_BASIC",
    kind: "membership",
    features: [
      "Filter up to 2 sports in the Training Library",
      "Beginner & select Intermediate drill videos for your sports",
      "20 AI technique video reviews per month",
      "Full access to Sports Science & Free Nutrition libraries",
    ],
  },
  {
    id: "pro",
    tierLabel: "Tier 2",
    name: "Pro",
    tagline: "Multi-sport coverage and twice the monthly video feedback.",
    amountCents: 7000,
    priceDisplay: "$70",
    interval: "month",
    cadenceLabel: "/ month",
    maxSportFilters: 5,
    maxMonthlyReviews: 40,
    videoAccess: "all",
    highlighted: true,
    badge: "Most popular",
    envPriceIdKey: "STRIPE_PRICE_ID_PRO",
    kind: "membership",
    features: [
      "Filter up to 5 sports across every training category",
      "All Beginner, Intermediate & Advanced drill progressions",
      "40 AI technique video reviews per month",
      "Personalized cues, faults & drill prescriptions",
    ],
  },
  {
    id: "unlimited_monthly",
    tierLabel: "Tier 3",
    name: "Unlimited",
    tagline: "Unrestricted library access and unlimited AI reviews every month.",
    amountCents: 10000,
    priceDisplay: "$100",
    interval: "month",
    cadenceLabel: "/ month",
    maxSportFilters: null,
    maxMonthlyReviews: null,
    videoAccess: "all",
    envPriceIdKey: "STRIPE_PRICE_ID_UNLIMITED_MONTHLY",
    kind: "membership",
    features: [
      "Unlimited sport filters across every discipline",
      "Complete Auctus Performance Training Library & Nutrition Hub",
      "Unlimited AI technique video reviews every month",
      "Priority processing on every submitted clip",
    ],
  },
  {
    id: "unlimited_annual",
    tierLabel: "Annual",
    name: "Annual Unlimited",
    tagline: "Year-round unlimited access — save $200 vs monthly billing.",
    amountCents: 100000,
    priceDisplay: "$1,000",
    interval: "year",
    cadenceLabel: "/ year",
    maxSportFilters: null,
    maxMonthlyReviews: null,
    videoAccess: "all",
    badge: "Save $200/yr",
    envPriceIdKey: "STRIPE_PRICE_ID_ANNUAL",
    kind: "membership",
    features: [
      "Everything in Unlimited Monthly for 12 full months",
      "Unlimited sport filters & complete drill library",
      "Unlimited AI technique video reviews year-round",
      "Save 2 months compared to Unlimited Monthly",
    ],
  },
];

export const NUTRITION_STORE_PACKAGES: PricingTier[] = [
  {
    id: "macro_blueprint",
    tierLabel: "Custom Protocol",
    name: "Custom Macro & Game-Day Blueprint",
    tagline: "Personalized calorie, macro, and match-day fueling targets built by our sports RD.",
    amountCents: 14900,
    priceDisplay: "$149",
    interval: "one_time",
    cadenceLabel: "one-time",
    maxSportFilters: 2,
    maxMonthlyReviews: 5,
    videoAccess: "all",
    envPriceIdKey: "STRIPE_PRICE_ID_MACRO_BLUEPRINT",
    kind: "nutrition_program",
    features: [
      "Custom training-day vs rest-day macro splits (g/kg)",
      "Electrolyte & sweat-rate hydration calculator protocol",
      "Travel tournament & pre-game meal timing templates",
      "7-day high-protein meal builder tailored to your preferences",
    ],
  },
  {
    id: "program_8week",
    tierLabel: "Flagship Program",
    name: "6–8 Week Health & Performance Program",
    tagline: "Integrated nutrition, sprint/strength conditioning, and weekly check-ins.",
    amountCents: 39900,
    priceDisplay: "$399",
    interval: "one_time",
    cadenceLabel: "8-week cohort",
    maxSportFilters: null,
    maxMonthlyReviews: null,
    videoAccess: "all",
    highlighted: true,
    badge: "Flagship Cohort",
    envPriceIdKey: "STRIPE_PRICE_ID_PROGRAM_8WEEK",
    kind: "nutrition_program",
    features: [
      "8-week periodized training + nutrition progression",
      "Weekly coach film review + biometric load adjustments",
      "Phase 1 Baseline -> Phase 2 Power -> Phase 3 Peak Taper",
      "Full Auctus Performance platform access throughout the cohort",
    ],
  },
  {
    id: "nutrition_coaching",
    tierLabel: "1-on-1 Nutrition",
    name: "Ongoing Performance Nutrition Coaching",
    tagline: "Bi-weekly dietitian adjustments for body recomposition, energy, and tournament prep.",
    amountCents: 24900,
    priceDisplay: "$249",
    interval: "month",
    cadenceLabel: "/ month",
    maxSportFilters: null,
    maxMonthlyReviews: 40,
    videoAccess: "all",
    envPriceIdKey: "STRIPE_PRICE_ID_NUTRITION_COACHING",
    kind: "nutrition_program",
    features: [
      "Bi-weekly 1-on-1 adjustments with a Certified Sports Dietitian (RD, CSSD)",
      "Blood-panel & micronutrient sufficiency review guide",
      "Supplement safety check (NSF Certified for Sport)",
      "Direct support chat & recovery fueling audits",
    ],
  },
];

export const ALL_PLANS: PricingTier[] = [...PRICING_TIERS, ...NUTRITION_STORE_PACKAGES];

export function getTierById(plan: string | null | undefined): PricingTier | undefined {
  return ALL_PLANS.find((t) => t.id === plan);
}
