import { ARMS_CORE_POWER_EXERCISES } from "./catalog-arms-core-power";
import { LOWER_BODY_EXERCISES } from "./catalog-lower";
import { PLYO_SAQ_MOBILITY_EXERCISES } from "./catalog-plyo-saq-mobility";
import { UPPER_BODY_EXERCISES } from "./catalog-upper";
import type { ExerciseEntry } from "./types";

export * from "./types";

export const TRAINING_EXERCISES: ExerciseEntry[] = [
  ...LOWER_BODY_EXERCISES,
  ...UPPER_BODY_EXERCISES,
  ...ARMS_CORE_POWER_EXERCISES,
  ...PLYO_SAQ_MOBILITY_EXERCISES,
];

export const EXERCISE_BY_ID = new Map<string, ExerciseEntry>(
  TRAINING_EXERCISES.map((ex) => [ex.id, ex]),
);

export const EXERCISE_BY_NAME_LOWER = new Map<string, ExerciseEntry>(
  TRAINING_EXERCISES.map((ex) => [ex.name.toLowerCase(), ex]),
);

export function findExerciseByPairingName(label: string): ExerciseEntry | undefined {
  const clean = label.trim().toLowerCase();
  const exact = EXERCISE_BY_NAME_LOWER.get(clean);
  if (exact) return exact;
  return TRAINING_EXERCISES.find((ex) => {
    const exLower = ex.name.toLowerCase();
    return (
      exLower.startsWith(clean) ||
      exLower.includes(clean) ||
      clean.includes(exLower.split(" (")[0] ?? "")
    );
  });
}
