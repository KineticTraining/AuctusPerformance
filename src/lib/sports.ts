export const SPORTS = [
  "Track & Field",
  "Basketball",
  "Soccer",
  "Tennis",
  "Swimming",
  "Strength",
  "Football",
  "Other",
] as const;

export const FILTER_SPORTS = [
  "Basketball",
  "Bodybuilding",
  "Soccer",
  "Football",
  "Tennis",
  "Swimming",
  "Track & Field",
] as const;

export const SCIENCE_SPORT_FILTERS = [
  "Basketball",
  "Soccer / Field Sports",
  "Track & Sprint",
  "Strength / Powerlifting",
  "Court / Combat",
  "General Gym",
] as const;

export type ScienceSportFilter = (typeof SCIENCE_SPORT_FILTERS)[number];

export const AGE_GROUPS = [
  "Youth / Teen (Under 18)",
  "Young Adult (18–29)",
  "Adult (30–45)",
  "Older Adult / Masters (45+)",
] as const;

export type AgeGroup = (typeof AGE_GROUPS)[number];

export const EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export const ARTICLE_CATEGORIES = ["Training", "Recovery", "Nutrition"] as const;

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

export const NUTRITION_GROUPS = [
  "Macronutrients",
  "Vitamins",
  "Macrominerals",
  "Trace Minerals",
] as const;

export type NutritionGroup = (typeof NUTRITION_GROUPS)[number];

export function normalizeArticleCategory(raw: string | undefined | null): ArticleCategory {
  const val = (raw ?? "").trim().toLowerCase();
  if (val === "recovery" || val === "injury prevention" || val === "sleep") {
    return "Recovery";
  }
  if (val === "nutrition" || val === "fueling" || val === "hydration") {
    return "Nutrition";
  }
  return "Training";
}

const SCIENCE_SPORT_ALIASES: Record<ScienceSportFilter, string[]> = {
  Basketball: ["basketball", "all sports"],
  "Soccer / Field Sports": [
    "soccer",
    "football",
    "soccer / field sports",
    "field sports",
    "all sports",
  ],
  "Track & Sprint": ["track & field", "track & sprint", "running", "sprinting", "all sports"],
  "Strength / Powerlifting": [
    "strength",
    "strength / powerlifting",
    "bodybuilding",
    "powerlifting",
    "all sports",
  ],
  "Court / Combat": ["tennis", "basketball", "court / combat", "combat", "all sports"],
  "General Gym": ["general gym", "bodybuilding", "strength", "swimming", "other", "all sports"],
};

export function matchesScienceSportFilter(
  itemSports: string[] | undefined,
  selectedSport: ScienceSportFilter | null,
): boolean {
  if (!selectedSport) return true;
  if (!itemSports || itemSports.length === 0) return true;
  const aliases = SCIENCE_SPORT_ALIASES[selectedSport];
  return itemSports.some((s) => {
    const lower = s.trim().toLowerCase();
    return lower === selectedSport.toLowerCase() || aliases.includes(lower);
  });
}

/** Maps legacy video level strings ("All levels") cleanly onto our 3 ExperienceLevel options. */
export function matchesExperienceFilter(
  itemLevels: string[] | string,
  selectedLevel: string,
): boolean {
  if (!selectedLevel || selectedLevel === "All") return true;
  if (Array.isArray(itemLevels)) {
    return itemLevels.includes(selectedLevel) || itemLevels.includes("All levels");
  }
  return itemLevels === selectedLevel || itemLevels === "All levels";
}

export function matchesAgeFilter(itemAges: string[] | undefined, selectedAge: string): boolean {
  if (!selectedAge || selectedAge === "All") return true;
  if (!itemAges || itemAges.length === 0) return true;
  if (itemAges.includes(selectedAge)) return true;
  if (selectedAge === "Older Adult / Masters (45+)" && itemAges.includes("Masters (45+)")) {
    return true;
  }
  return false;
}
