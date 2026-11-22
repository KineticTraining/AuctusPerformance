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

export const AGE_GROUPS = [
  "Youth / Teen (Under 18)",
  "Young Adult (18–29)",
  "Adult (30–45)",
  "Older Adult / Masters (45+)",
] as const;

export type AgeGroup = (typeof AGE_GROUPS)[number];

export const EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export const ARTICLE_CATEGORIES = [
  "Recovery",
  "Strength & Power",
  "Injury Prevention",
  "Nutrition",
  "Psychology",
  "Training Science",
] as const;

export const NUTRITION_GROUPS = [
  "Macronutrients",
  "Vitamins",
  "Macrominerals",
  "Trace Minerals",
] as const;

export type NutritionGroup = (typeof NUTRITION_GROUPS)[number];

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
