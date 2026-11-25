import { describe, expect, it } from "vitest";

import {
  computeExercisePrescription,
  EXERCISE_CATEGORIES,
  filterAndSortExercises,
  findExerciseByPairingName,
  TRAINING_EXERCISES,
  type ExerciseFilterState,
} from "@/lib/training";

const BASE_FILTERS: ExerciseFilterState = {
  search: "",
  category: "All",
  bodyPart: "All",
  equipment: "All",
  ageGroup: "All",
  experienceLevel: "All",
  sport: "All",
  sortBy: "category",
};

describe("Auctus Performance 12-Category Exercise Catalog", () => {
  it("populates all 12 movement categories with 220+ unique exercises", () => {
    expect(EXERCISE_CATEGORIES).toHaveLength(12);
    expect(TRAINING_EXERCISES.length).toBeGreaterThanOrEqual(220);

    const ids = new Set(TRAINING_EXERCISES.map((ex) => ex.id));
    expect(ids.size).toBe(TRAINING_EXERCISES.length);

    for (const category of EXERCISE_CATEGORIES) {
      const items = TRAINING_EXERCISES.filter((ex) => ex.category === category);
      expect(items.length).toBeGreaterThanOrEqual(10);
    }
  });

  it("includes key spot-checked exercises across every category with complete instructions and pairings", () => {
    const requiredNames = [
      "Back Squat (High-Bar, Low-Bar)",
      "Pendulum Squat",
      "Nordic Hamstring Curl",
      "Spoto Press",
      "Z-Press (seated on floor)",
      "Chest-to-Bar Pull-Up",
      "Kroc Row",
      "Bayesian Cable Curl",
      "JM Press",
      "Copenhagen Plank",
      "Power Clean",
      "Depth Jump (Drop Jump)",
      "Pro Agility Shuttle (5-10-5)",
      "Ankle Dorsiflexion Knee-to-Wall",
    ];

    for (const name of requiredNames) {
      const found = TRAINING_EXERCISES.find((ex) => ex.name === name);
      expect(found, `Expected exercise ${name}`).toBeDefined();
      expect(found?.purpose.length).toBeGreaterThan(15);
      expect(found?.primaryMuscles.length).toBeGreaterThanOrEqual(1);
      expect(found?.steps.length).toBeGreaterThanOrEqual(2);
      expect(found?.pairings.length).toBeGreaterThanOrEqual(1);
    }

    for (const ex of TRAINING_EXERCISES) {
      expect(ex.purpose.length).toBeGreaterThan(10);
      expect(ex.primaryMuscles.length).toBeGreaterThanOrEqual(1);
      expect(ex.steps.length).toBeGreaterThanOrEqual(2);
      expect(ex.pairings.length).toBeGreaterThanOrEqual(1);
    }

    expect(findExerciseByPairingName("Nordic Hamstring Curl")?.name).toBe("Nordic Hamstring Curl");
  });

  it("filters accurately by search, bodyPart, equipment, ageGroup, experienceLevel, and sport and sorts correctly", () => {
    const quadBarbell = filterAndSortExercises(TRAINING_EXERCISES, {
      ...BASE_FILTERS,
      bodyPart: "Quads",
      equipment: "Barbell & Free Weights",
    });
    expect(quadBarbell.length).toBeGreaterThan(5);
    expect(
      quadBarbell.every(
        (ex) => ex.bodyParts.includes("Quads") && ex.equipment.includes("Barbell & Free Weights"),
      ),
    ).toBe(true);

    const basketballPlyos = filterAndSortExercises(TRAINING_EXERCISES, {
      ...BASE_FILTERS,
      category: "Plyometrics (Upper & Lower)",
      sport: "Basketball",
      sortBy: "az",
    });
    expect(basketballPlyos.length).toBeGreaterThan(5);
    for (let i = 1; i < basketballPlyos.length; i += 1) {
      expect(
        basketballPlyos[i - 1]!.name.localeCompare(basketballPlyos[i]!.name),
      ).toBeLessThanOrEqual(0);
    }

    const searchNordic = filterAndSortExercises(TRAINING_EXERCISES, {
      ...BASE_FILTERS,
      search: "nordic",
    });
    expect(searchNordic.some((ex) => ex.name.includes("Nordic"))).toBe(true);

    for (const group of ["Legs", "Arms", "Core", "Full-Body"] as const) {
      const matched = filterAndSortExercises(TRAINING_EXERCISES, {
        ...BASE_FILTERS,
        bodyPart: group,
      });
      expect(matched.length, `Expected exercises for muscle group ${group}`).toBeGreaterThan(20);
    }
  });

  it("computes context-aware smart prescriptions tailored to age, experience, and sport", () => {
    const backSquat = TRAINING_EXERCISES.find((ex) => ex.name === "Back Squat (High-Bar, Low-Bar)");
    expect(backSquat).toBeDefined();

    const beginnerYouth = computeExercisePrescription(backSquat!, {
      ageGroup: "Youth / Teen (Under 18)",
      experienceLevel: "Beginner",
      sport: "Basketball",
      equipment: "Barbell & Free Weights",
    });
    const advancedMasters = computeExercisePrescription(backSquat!, {
      ageGroup: "Older Adult / Masters (45+)",
      experienceLevel: "Advanced",
      sport: "General Gym / Strength",
      equipment: "Barbell & Free Weights",
    });

    expect(beginnerYouth.setsRepsDefault.sets).toBeLessThan(advancedMasters.setsRepsDefault.sets);
    expect(beginnerYouth.howToLoad.toLowerCase()).toContain("posture");
    expect(advancedMasters.howFrequently).toContain("72h");
    expect(beginnerYouth.howFrequently).toContain("Basketball");
  });
});
