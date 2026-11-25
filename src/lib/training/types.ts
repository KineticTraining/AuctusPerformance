export const EXERCISE_CATEGORIES = [
  "Lower Body: Squat & Knee-Dominant",
  "Lower Body: Hinge & Posterior Chain",
  "Upper Body: Horizontal Push",
  "Upper Body: Vertical Push",
  "Upper Body: Vertical Pull",
  "Upper Body: Horizontal Pull",
  "Isolation: Arms (Biceps, Triceps, Forearms)",
  "Core & Rotational Stability",
  "Olympic Weightlifting & Power",
  "Plyometrics (Upper & Lower)",
  "Speed, Agility, Quickness (SAQ) & Conditioning",
  "Mobility, Prehab & Gymnastics Holds",
] as const;

export type ExerciseCategory = (typeof EXERCISE_CATEGORIES)[number];

export const BODY_PART_FILTERS = [
  "Quads",
  "Hamstrings",
  "Glutes",
  "Calves",
  "Chest",
  "Back",
  "Shoulders",
  "Triceps",
  "Biceps",
  "Forearms / Grip",
  "Core",
  "Full Body / Mobility",
] as const;

export type BodyPartFilter = (typeof BODY_PART_FILTERS)[number];

export const PRIMARY_MUSCLE_GROUPS = ["Legs", "Arms", "Core", "Full-Body"] as const;

export type PrimaryMuscleGroup = (typeof PRIMARY_MUSCLE_GROUPS)[number];

export const UPPER_BODY_PART_FILTERS = ["Chest", "Back", "Shoulders"] as const;

export function matchesMuscleGroupFilter(ex: ExerciseEntry, filterValue: string): boolean {
  if (!filterValue || filterValue === "All") return true;
  if (filterValue === "Legs") {
    return (
      ex.bodyParts.includes("Quads") ||
      ex.bodyParts.includes("Hamstrings") ||
      ex.bodyParts.includes("Glutes") ||
      ex.bodyParts.includes("Calves")
    );
  }
  if (filterValue === "Arms") {
    return (
      ex.bodyParts.includes("Biceps") ||
      ex.bodyParts.includes("Triceps") ||
      ex.bodyParts.includes("Forearms / Grip")
    );
  }
  if (filterValue === "Core") {
    return ex.bodyParts.includes("Core");
  }
  if (filterValue === "Full-Body") {
    const hasLower =
      ex.bodyParts.includes("Quads") ||
      ex.bodyParts.includes("Hamstrings") ||
      ex.bodyParts.includes("Glutes");
    const hasUpperOrCore =
      ex.bodyParts.includes("Back") ||
      ex.bodyParts.includes("Shoulders") ||
      ex.bodyParts.includes("Chest") ||
      ex.bodyParts.includes("Core");
    return ex.bodyParts.includes("Full Body / Mobility") || (hasLower && hasUpperOrCore);
  }
  return ex.bodyParts.includes(filterValue as BodyPartFilter);
}

export const EQUIPMENT_FILTERS = [
  "Barbell & Free Weights",
  "Dumbbells & Kettlebells",
  "Machines & Cables",
  "Bodyweight & Calisthenics",
] as const;

export type EquipmentBucket = (typeof EQUIPMENT_FILTERS)[number];

export const TRAINING_AGE_GROUPS = [
  "Youth / Teen (Under 18)",
  "Young Adult (18–29)",
  "Adult (30–45)",
  "Older Adult / Masters (45+)",
] as const;

export type TrainingAgeGroup = (typeof TRAINING_AGE_GROUPS)[number];

export const TRAINING_EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

export type TrainingExperienceLevel = (typeof TRAINING_EXPERIENCE_LEVELS)[number];

export const TRAINING_SPORTS = [
  "General Gym / Strength",
  "Basketball",
  "Soccer / Field Sports",
  "Track & Sprint",
  "Court / Combat",
] as const;

export type TrainingSport = (typeof TRAINING_SPORTS)[number];

export const SORT_OPTIONS = [
  { value: "category", label: "Category Order" },
  { value: "az", label: "Alphabetical (A–Z)" },
  { value: "muscle", label: "Primary Muscle" },
  { value: "level", label: "Experience Level" },
] as const;

export type ExerciseSortOption = (typeof SORT_OPTIONS)[number]["value"];

export type DemandTier =
  "high_cns" | "compound" | "accessory" | "power_plyo" | "saq_conditioning" | "mobility_prehab";

export interface ExerciseEntry {
  id: string;
  name: string;
  category: ExerciseCategory;
  subcategory: string;
  equipment: EquipmentBucket[];
  bodyParts: BodyPartFilter[];
  primaryMuscles: string[];
  secondaryMuscles: string[];
  movementPattern: string;
  difficulty: TrainingExperienceLevel;
  demandTier: DemandTier;
  sports: TrainingSport[];
  ageGroups?: TrainingAgeGroup[];
  purpose: string;
  steps: string[];
  pairings: string[];
  image: string;
}

export interface PrescriptionContext {
  ageGroup: string;
  experienceLevel: string;
  sport: string;
  equipment: string;
}

export interface ExercisePrescription {
  setsRepsDefault: { sets: number; reps: string; note: string };
  howToLoad: string;
  howFrequently: string;
  recommendedPairings: string[];
  contextSummary: string;
}

export const CATEGORY_SUMMARIES: Record<
  ExerciseCategory,
  { shortLabel: string; focus: string; defaultImage: string }
> = {
  "Lower Body: Squat & Knee-Dominant": {
    shortLabel: "Squat & Knee",
    focus: "Quadriceps, glutes, adductors, and core stability.",
    defaultImage: "/images/squat.jpg",
  },
  "Lower Body: Hinge & Posterior Chain": {
    shortLabel: "Hinge & Posterior",
    focus: "Hamstrings, glutes, spinal erectors, and calves.",
    defaultImage: "/images/deadlift.jpg",
  },
  "Upper Body: Horizontal Push": {
    shortLabel: "Horizontal Push",
    focus: "Pectorals, anterior deltoids, and triceps.",
    defaultImage: "/images/gym-hero-athletics.jpg",
  },
  "Upper Body: Vertical Push": {
    shortLabel: "Vertical Push",
    focus: "Anterior/lateral deltoids, upper trapezius, and triceps.",
    defaultImage: "/images/gym-kettlebell-strength.jpg",
  },
  "Upper Body: Vertical Pull": {
    shortLabel: "Vertical Pull",
    focus: "Latissimus dorsi, teres major, rhomboids, biceps, and forearms.",
    defaultImage: "/images/gym-arena-cta.jpg",
  },
  "Upper Body: Horizontal Pull": {
    shortLabel: "Horizontal Pull",
    focus: "Mid/upper back (trapezius, rhomboids), rear deltoids, lats, and biceps.",
    defaultImage: "/images/hamstrings.jpg",
  },
  "Isolation: Arms (Biceps, Triceps, Forearms)": {
    shortLabel: "Arms & Grip",
    focus: "Elbow flexors, elbow extensors, and wrist/grip musculature.",
    defaultImage: "/images/gym-kettlebell-strength.jpg",
  },
  "Core & Rotational Stability": {
    shortLabel: "Core & Rotation",
    focus: "Rectus abdominis, obliques, transverse abdominis, and anti-movement.",
    defaultImage: "/images/gym-coaching-lab.jpg",
  },
  "Olympic Weightlifting & Power": {
    shortLabel: "Olympic & Power",
    focus: "Explosive triple extension, rate of force development, and coordination.",
    defaultImage: "/images/gym-hero-athletics.jpg",
  },
  "Plyometrics (Upper & Lower)": {
    shortLabel: "Plyometrics",
    focus: "Stretch-shortening cycle (SSC), reactive strength, and elastic recoil.",
    defaultImage: "/images/plyometrics.jpg",
  },
  "Speed, Agility, Quickness (SAQ) & Conditioning": {
    shortLabel: "SAQ & Conditioning",
    focus: "Acceleration, top-end velocity, change of direction, and energy systems.",
    defaultImage: "/images/gym-power-sleds.jpg",
  },
  "Mobility, Prehab & Gymnastics Holds": {
    shortLabel: "Mobility & Prehab",
    focus: "End-range joint control, scapular health, and isometric tension.",
    defaultImage: "/images/warmup-mobility.jpg",
  },
};

export function slugifyExercise(categoryIdx: number, name: string): string {
  const clean = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `ex-${categoryIdx + 1}-${clean}`;
}

export function computeExercisePrescription(
  exercise: ExerciseEntry,
  ctx: PrescriptionContext,
): ExercisePrescription {
  const exp: TrainingExperienceLevel =
    ctx.experienceLevel === "Beginner" ||
    ctx.experienceLevel === "Intermediate" ||
    ctx.experienceLevel === "Advanced"
      ? ctx.experienceLevel
      : exercise.difficulty;

  const age = ctx.ageGroup !== "All" ? ctx.ageGroup : "Young Adult (18–29)";
  const sport = ctx.sport !== "All" ? ctx.sport : "General Gym / Strength";

  const isYouth = age.includes("Youth");
  const isMasters = age.includes("Older Adult") || age.includes("Masters");
  const isAdult = age.includes("Adult (30");

  // Sets, reps & loading cue by demandTier + experience + age
  let sets = 3;
  let reps = "8–10";
  let loadCue = "RPE 7–8 (2–3 reps in reserve) with crisp technical tempo.";

  switch (exercise.demandTier) {
    case "high_cns": {
      if (exp === "Beginner") {
        sets = 3;
        reps = "6–8";
        loadCue = isYouth
          ? "Light-to-moderate bar speed (RPE 6 / 3–4 RIR); earn positional mastery before adding weight."
          : "RPE 6.5–7.5 (2–3 RIR), 2–3s controlled eccentric, pause cleanly at depth.";
      } else if (exp === "Intermediate") {
        sets = 4;
        reps = isMasters ? "5–8" : "4–6";
        loadCue = isMasters
          ? "72–82% 1RM (RPE 7.5 / 2–3 RIR) after 2–3 progressive warm-up sets; prioritize joint integrity."
          : "75–85% 1RM (RPE 8 / 1–2 RIR); accelerate every concentric rep with 2–3 min rest.";
      } else {
        sets = isMasters ? 4 : 5;
        reps = isMasters ? "4–6" : "3–5";
        loadCue = isMasters
          ? "78–86% 1RM (RPE 8 / 2 RIR) with controlled eccentric and strict bar-path speed."
          : "82–90% 1RM (RPE 8–9 / 1–2 RIR) or wave loading with 3+ min full CNS recovery.";
      }
      break;
    }
    case "compound": {
      if (exp === "Beginner") {
        sets = 3;
        reps = "8–12";
        loadCue =
          "RPE 6.5–7.5 (3 RIR); own full range of motion and balanced left/right stability.";
      } else if (exp === "Intermediate") {
        sets = 3;
        reps = "6–10";
        loadCue = isMasters
          ? "RPE 7.5–8 (2 RIR) with 2–3s lowering tempo to load muscle without joint rush."
          : "RPE 7.5–8.5 (1–2 RIR); progress weight or 1 rep each week while form stays strict.";
      } else {
        sets = 4;
        reps = "6–8";
        loadCue =
          "RPE 8–9 (1–2 RIR); use micro-loading or pause/tempo progressions to break plateaus.";
      }
      break;
    }
    case "accessory": {
      sets = exp === "Beginner" ? 2 : 3;
      reps = exp === "Advanced" ? "10–15" : "10–12";
      loadCue =
        exp === "Beginner"
          ? "Moderate load (RPE 7 / 3 RIR); feel the target muscle stretch and squeeze without swinging."
          : "Controlled 2s eccentric (RPE 8–9 / 1–2 RIR); focus on local fatigue rather than ego weight.";
      break;
    }
    case "power_plyo": {
      sets = exp === "Beginner" ? 3 : 4;
      reps = isYouth ? "3–4" : exp === "Beginner" ? "3–5" : "3–5 (max intent)";
      loadCue = isMasters
        ? "Submaximal volume, crisp landings, full 90–120s rest between sets; stop the set if contact speed slows."
        : exp === "Beginner"
          ? "Bodyweight or light 5–10% BW load; stick quiet landings before chasing height or distance."
          : "Maximum velocity intent (20–40% 1RM on loaded jumps / 60–80% on Olympic variants); 2–3 min rest.";
      break;
    }
    case "saq_conditioning": {
      sets = exp === "Beginner" ? 3 : 4;
      reps =
        exercise.subcategory.includes("Linear Speed") || exercise.subcategory.includes("Agility")
          ? "15–30m / 1 rep"
          : "20–30s hard / 60–90s rest";
      loadCue = isMasters
        ? "Build intensity progressively over 3 warm-up efforts; keep total high-speed contacts conservative."
        : "Full 60–120s recovery on speed/agility reps so quality never degrades into fatigue jogging.";
      break;
    }
    case "mobility_prehab": {
      sets = 2;
      reps = exercise.name.toLowerCase().includes("hold") ? "20–40s" : "8–12 / side";
      loadCue =
        "Zero pain, steady nasal breathing, and 2-second pauses at end range without forcing passive bounce.";
      break;
    }
  }

  if (isYouth && exercise.demandTier !== "mobility_prehab") {
    loadCue = `${loadCue} Keep external loading secondary to posture and clean movement patterns.`;
  } else if (isAdult && exercise.demandTier === "high_cns") {
    loadCue = `${loadCue} Include 2 ramp-up warm-up sets before working load.`;
  }

  // Frequency recommendation by demandTier, age, and sport season
  let freq = "2x / week";
  if (exercise.demandTier === "high_cns") {
    if (isMasters) {
      freq = "1–2x / week (72h recovery between heavy lower/axial sessions)";
    } else if (sport !== "General Gym / Strength") {
      freq = `Off-season: 2x / week · In-season ${sport}: 1x / week (2–3 crisp sets)`;
    } else {
      freq =
        exp === "Beginner" ? "2x / week (non-consecutive days)" : "1–2x / week per primary lift";
    }
  } else if (exercise.demandTier === "compound") {
    freq = isMasters
      ? "2x / week with 48–72h between overlapping patterns"
      : sport !== "General Gym / Strength"
        ? `2x / week in off-season · 1–2x / week in-season (${sport})`
        : "2–3x / week";
  } else if (exercise.demandTier === "accessory") {
    freq = exp === "Beginner" ? "2x / week" : "2–3x / week at the end of strength sessions";
  } else if (exercise.demandTier === "power_plyo") {
    freq = isMasters
      ? "1–2x / week (low total ground contacts: 20–35/session)"
      : "2x / week before heavy lifting on fresh legs (48–72h spacing)";
  } else if (exercise.demandTier === "saq_conditioning") {
    freq =
      sport === "Track & Sprint"
        ? "2–3x / week (max-velocity & acceleration spaced by 48h)"
        : "1–2x / week paired with practice or conditioning days";
  } else {
    freq = "3–5x / week in warm-ups or dedicated 10-minute recovery blocks";
  }

  // Equipment tailoring note if filtered
  const equipNote =
    ctx.equipment !== "All" && !exercise.equipment.includes(ctx.equipment as EquipmentBucket)
      ? `Adapted outside ${ctx.equipment}`
      : null;

  const activeTags = [
    ctx.experienceLevel !== "All" ? ctx.experienceLevel : `${exercise.difficulty} baseline`,
    ctx.ageGroup !== "All" ? ctx.ageGroup : null,
    ctx.sport !== "All" ? ctx.sport : null,
    equipNote,
  ].filter(Boolean);

  return {
    setsRepsDefault: {
      sets,
      reps,
      note: `RPE ${exp === "Beginner" ? "7" : exp === "Intermediate" ? "8" : "8.5"}`,
    },
    howToLoad: loadCue,
    howFrequently: freq,
    recommendedPairings: exercise.pairings,
    contextSummary: activeTags.join(" · "),
  };
}

export interface ExerciseFilterState {
  search: string;
  category: string;
  bodyPart: string;
  equipment: string;
  ageGroup: string;
  experienceLevel: string;
  sport: string;
  sortBy: ExerciseSortOption;
}

const LEVEL_RANK: Record<TrainingExperienceLevel, number> = {
  Beginner: 0,
  Intermediate: 1,
  Advanced: 2,
};

const CATEGORY_RANK = new Map<ExerciseCategory, number>(
  EXERCISE_CATEGORIES.map((cat, idx) => [cat, idx]),
);

export function filterAndSortExercises(
  list: ExerciseEntry[],
  filters: ExerciseFilterState,
): ExerciseEntry[] {
  const q = filters.search.trim().toLowerCase();

  const filtered = list.filter((ex) => {
    if (filters.category !== "All" && ex.category !== filters.category) return false;
    if (!matchesMuscleGroupFilter(ex, filters.bodyPart)) {
      return false;
    }
    if (
      filters.equipment !== "All" &&
      !ex.equipment.includes(filters.equipment as EquipmentBucket)
    ) {
      return false;
    }
    if (filters.experienceLevel !== "All" && ex.difficulty !== filters.experienceLevel) {
      return false;
    }
    if (
      filters.ageGroup !== "All" &&
      ex.ageGroups &&
      !ex.ageGroups.includes(filters.ageGroup as TrainingAgeGroup)
    ) {
      return false;
    }
    if (filters.sport !== "All" && !ex.sports.includes(filters.sport as TrainingSport)) {
      return false;
    }
    if (q) {
      const haystack = [
        ex.name,
        ex.category,
        ex.subcategory,
        ex.movementPattern,
        ...ex.primaryMuscles,
        ...ex.secondaryMuscles,
        ...ex.bodyParts,
        ...ex.equipment,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const sorted = [...filtered];
  if (filters.sortBy === "az") {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else if (filters.sortBy === "muscle") {
    sorted.sort((a, b) => {
      const mA = a.primaryMuscles[0] ?? "";
      const mB = b.primaryMuscles[0] ?? "";
      return mA.localeCompare(mB) || a.name.localeCompare(b.name);
    });
  } else if (filters.sortBy === "level") {
    sorted.sort(
      (a, b) => LEVEL_RANK[a.difficulty] - LEVEL_RANK[b.difficulty] || a.name.localeCompare(b.name),
    );
  } else {
    sorted.sort((a, b) => {
      const cA = CATEGORY_RANK.get(a.category) ?? 99;
      const cB = CATEGORY_RANK.get(b.category) ?? 99;
      return cA - cB;
    });
  }

  return sorted;
}
