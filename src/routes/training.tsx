import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Dumbbell,
  Eye,
  Play,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { PageWithOutline, type OutlineSection } from "@/components/site/page-outline";
import { WorkingOnCard } from "@/components/site/working-on-card";
import { WorkspaceTabs } from "@/components/site/workspace-tabs";
import { ExerciseDetailDialog } from "@/components/training/exercise-detail-dialog";
import {
  WorkoutBuilderPanel,
  type SavedWorkoutSession,
  type WorkoutItem,
} from "@/components/training/workout-builder-panel";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import {
  AUCTUS_STATE_EVENT,
  loadLocalExerciseNotes,
  loadPreviewTier,
  savePreviewTier,
  savePrivateExerciseNote,
  type PreviewTier,
} from "@/lib/athlete-notes";
import {
  BODY_PART_FILTERS,
  CATEGORY_SUMMARIES,
  computeExercisePrescription,
  EQUIPMENT_FILTERS,
  EXERCISE_CATEGORIES,
  filterAndSortExercises,
  PRIMARY_MUSCLE_GROUPS,
  SORT_OPTIONS,
  TRAINING_AGE_GROUPS,
  TRAINING_EXERCISES,
  TRAINING_EXPERIENCE_LEVELS,
  TRAINING_SPORTS,
  UPPER_BODY_PART_FILTERS,
  type ExerciseEntry,
  type ExerciseSortOption,
  type PrescriptionContext,
} from "@/lib/training";
import { cn } from "@/lib/utils";

const ACTIVE_WORKOUT_STORAGE_KEY = "auctus_workout_builder_v1";
const SAVED_WORKOUTS_STORAGE_KEY = "auctus_saved_workouts_v1";
const INITIAL_VISIBLE_COUNT = 18;

const DEMO_EXERCISE_NAMES = [
  "Back Squat (High-Bar, Low-Bar)",
  "Depth Jump (Drop Jump)",
  "Nordic Hamstring Curl",
  "Copenhagen Plank",
] as const;

const TRAINING_OUTLINE: OutlineSection[] = [
  { id: "training-overview", label: "Overview" },
  { id: "training-focus", label: "Current Focus" },
  { id: "training-filters", label: "Filters" },
  { id: "training-library", label: "Exercises" },
  { id: "training-builder", label: "Workout Builder" },
];

export const Route = createFileRoute("/training")({
  head: () => ({
    meta: [
      { title: "Training & Workout Builder — Auctus Performance" },
      {
        name: "description",
        content:
          "Browse 400+ exercises with Muscle Groups dropdown filtering (Legs, Arms, Core, Full-Body), smart prescriptions, and a clean workout builder.",
      },
      { property: "og:title", content: "Training & Workout Builder — Auctus Performance" },
      {
        property: "og:description",
        content: "Filter exercises by muscle group, equipment, age, level, and sport.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrainingPage,
});

function createUid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `wi-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function TrainingPage() {
  const { session } = useAuth();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [bodyPart, setBodyPart] = useState("All");
  const [equipment, setEquipment] = useState("All");
  const [ageGroup, setAgeGroup] = useState("All");
  const [experienceLevel, setExperienceLevel] = useState("All");
  const [sport, setSport] = useState("All");
  const [sortBy, setSortBy] = useState<ExerciseSortOption>("category");
  const [visibleLimit, setVisibleLimit] = useState(INITIAL_VISIBLE_COUNT);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [mobilePanel, setMobilePanel] = useState<"library" | "builder">("library");
  const [inspectedExercise, setInspectedExercise] = useState<ExerciseEntry | null>(null);

  const [workoutTitle, setWorkoutTitle] = useState("Training Session");
  const [workoutItems, setWorkoutItems] = useState<WorkoutItem[]>([]);
  const [savedWorkouts, setSavedWorkouts] = useState<SavedWorkoutSession[]>([]);
  const [privateNotes, setPrivateNotes] = useState<Record<string, string>>({});
  const [previewTier, setPreviewTier] = useState<PreviewTier>("free");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const rawActive = window.localStorage.getItem(ACTIVE_WORKOUT_STORAGE_KEY);
      if (rawActive) {
        const parsed = JSON.parse(rawActive) as {
          title?: string;
          items?: WorkoutItem[];
        };
        if (typeof parsed.title === "string") setWorkoutTitle(parsed.title);
        if (Array.isArray(parsed.items)) setWorkoutItems(parsed.items);
      }
      const rawSaved = window.localStorage.getItem(SAVED_WORKOUTS_STORAGE_KEY);
      if (rawSaved) {
        const parsedSaved = JSON.parse(rawSaved) as SavedWorkoutSession[];
        if (Array.isArray(parsedSaved)) setSavedWorkouts(parsedSaved);
      }
      const remoteNotes = session?.user?.user_metadata?.["auctus_exercise_notes"] as
        Record<string, string> | undefined;
      setPrivateNotes({
        ...(remoteNotes && typeof remoteNotes === "object" ? remoteNotes : {}),
        ...loadLocalExerciseNotes(),
      });
      setPreviewTier(loadPreviewTier());
    } catch {
      // Ignore malformed localStorage entries
    } finally {
      setHydrated(true);
    }

    const syncTier = () => setPreviewTier(loadPreviewTier());
    window.addEventListener(AUCTUS_STATE_EVENT, syncTier);
    return () => window.removeEventListener(AUCTUS_STATE_EVENT, syncTier);
  }, [session?.user?.id, session?.user?.user_metadata]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        ACTIVE_WORKOUT_STORAGE_KEY,
        JSON.stringify({ title: workoutTitle, items: workoutItems }),
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [hydrated, workoutTitle, workoutItems]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(SAVED_WORKOUTS_STORAGE_KEY, JSON.stringify(savedWorkouts));
    } catch {
      // Ignore storage quota errors
    }
  }, [hydrated, savedWorkouts]);

  useEffect(() => {
    setVisibleLimit(INITIAL_VISIBLE_COUNT);
  }, [search, category, bodyPart, equipment, ageGroup, experienceLevel, sport, sortBy]);

  const prescriptionContext: PrescriptionContext = useMemo(
    () => ({
      ageGroup,
      experienceLevel,
      sport,
      equipment,
    }),
    [ageGroup, experienceLevel, sport, equipment],
  );

  const filteredExercises = useMemo(
    () =>
      filterAndSortExercises(TRAINING_EXERCISES, {
        search,
        category,
        bodyPart,
        equipment,
        ageGroup,
        experienceLevel,
        sport,
        sortBy,
      }),
    [search, category, bodyPart, equipment, ageGroup, experienceLevel, sport, sortBy],
  );

  const visibleExercises = useMemo(
    () => filteredExercises.slice(0, visibleLimit),
    [filteredExercises, visibleLimit],
  );

  const secondaryFilterCount = [
    category !== "All",
    equipment !== "All",
    ageGroup !== "All",
    experienceLevel !== "All",
    sport !== "All",
    sortBy !== "category",
  ].filter(Boolean).length;

  const hasActiveFilters = search.trim() !== "" || bodyPart !== "All" || secondaryFilterCount > 0;

  const inWorkoutIds = useMemo(
    () => new Set(workoutItems.map((item) => item.exerciseId)),
    [workoutItems],
  );

  function resetAllFilters() {
    setSearch("");
    setCategory("All");
    setBodyPart("All");
    setEquipment("All");
    setAgeGroup("All");
    setExperienceLevel("All");
    setSport("All");
    setSortBy("category");
  }

  function handleAddExercise(exercise: ExerciseEntry) {
    const prescription = computeExercisePrescription(exercise, prescriptionContext);
    const newItem: WorkoutItem = {
      uid: createUid(),
      exerciseId: exercise.id,
      name: exercise.name,
      category: exercise.category,
      sets: prescription.setsRepsDefault.sets,
      reps: prescription.setsRepsDefault.reps,
      notes: prescription.setsRepsDefault.note,
    };
    setWorkoutItems((prev) => [...prev, newItem]);
    toast.success(`Added "${exercise.name}".`);
  }

  function handleLoadDemoWorkout() {
    const demoSport = "Basketball";
    const demoLevel = "Intermediate";
    const demoAge = "Young Adult (18–29)";
    setSport(demoSport);
    setExperienceLevel(demoLevel);
    setAgeGroup(demoAge);

    const demoCtx: PrescriptionContext = {
      sport: demoSport,
      experienceLevel: demoLevel,
      ageGroup: demoAge,
      equipment: "All",
    };

    const demoEntries = DEMO_EXERCISE_NAMES.map((name) =>
      TRAINING_EXERCISES.find((ex) => ex.name === name),
    ).filter((ex): ex is ExerciseEntry => Boolean(ex));

    if (demoEntries.length === 0) return;

    const demoItems: WorkoutItem[] = demoEntries.map((ex) => {
      const rx = computeExercisePrescription(ex, demoCtx);
      return {
        uid: createUid(),
        exerciseId: ex.id,
        name: ex.name,
        category: ex.category,
        sets: rx.setsRepsDefault.sets,
        reps: rx.setsRepsDefault.reps,
        notes: rx.setsRepsDefault.note,
      };
    });

    setWorkoutTitle("Demo: Court Power Session");
    setWorkoutItems(demoItems);
    setInspectedExercise(demoEntries[0] ?? null);
    toast.success("Demo session loaded with Basketball · Intermediate prescriptions.");
  }

  function handleUpdateItem(
    uid: string,
    patch: Partial<Pick<WorkoutItem, "sets" | "reps" | "notes">>,
  ) {
    setWorkoutItems((prev) =>
      prev.map((item) => (item.uid === uid ? { ...item, ...patch } : item)),
    );
  }

  function handleMoveItem(uid: string, direction: "up" | "down") {
    setWorkoutItems((prev) => {
      const idx = prev.findIndex((item) => item.uid === uid);
      if (idx === -1) return prev;
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(idx, 1);
      if (!moved) return prev;
      copy.splice(targetIdx, 0, moved);
      return copy;
    });
  }

  function handleRemoveItem(uid: string) {
    setWorkoutItems((prev) => prev.filter((item) => item.uid !== uid));
  }

  function handleClearWorkout() {
    setWorkoutItems([]);
    toast.info("Workout cleared.");
  }

  function handleSaveWorkout() {
    if (workoutItems.length === 0) return;
    const title = workoutTitle.trim() || "Training Session";
    const sessionRecord: SavedWorkoutSession = {
      id: createUid(),
      title,
      savedAt: new Date().toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      items: workoutItems,
    };
    setSavedWorkouts((prev) => [sessionRecord, ...prev].slice(0, 12));
    toast.success(`Saved "${title}".`);
  }

  function handleLoadSavedWorkout(saved: SavedWorkoutSession) {
    setWorkoutTitle(saved.title);
    setWorkoutItems(saved.items.map((item) => ({ ...item, uid: createUid() })));
    toast.success(`Loaded "${saved.title}".`);
  }

  function handleDeleteSavedWorkout(id: string) {
    setSavedWorkouts((prev) => prev.filter((s) => s.id !== id));
    toast.info("Removed saved workout.");
  }

  function handlePrivateNoteChange(exerciseId: string, note: string) {
    setPrivateNotes((prev) => {
      const next = { ...prev };
      if (note.trim()) {
        next[exerciseId] = note;
      } else {
        delete next[exerciseId];
      }
      return next;
    });
    void savePrivateExerciseNote(exerciseId, note, Boolean(session));
  }

  function handleTogglePreviewTier() {
    const next: PreviewTier = previewTier === "pro_preview" ? "free" : "pro_preview";
    setPreviewTier(next);
    savePreviewTier(next);
    toast.success(next === "pro_preview" ? "Pro Preview active." : "Switched to Free tier.");
  }

  function handleInspectById(exerciseId: string) {
    const found = TRAINING_EXERCISES.find((ex) => ex.id === exerciseId);
    if (found) setInspectedExercise(found);
  }

  const filteredRatio = Math.max(
    4,
    Math.round((filteredExercises.length / Math.max(1, TRAINING_EXERCISES.length)) * 100),
  );

  const activeFilterChips: Array<{
    key: string;
    label: string;
    chipClass: string;
    onClear: () => void;
  }> = [
    bodyPart !== "All"
      ? {
          key: "muscle",
          label: `Muscle: ${bodyPart}`,
          chipClass: "border-brand-amber/50 bg-brand-amber/10 text-brand-amber",
          onClear: () => setBodyPart("All"),
        }
      : null,
    equipment !== "All"
      ? {
          key: "equipment",
          label: `Equipment: ${equipment}`,
          chipClass: "border-emerald-400/50 bg-emerald-500/10 text-emerald-300",
          onClear: () => setEquipment("All"),
        }
      : null,
    experienceLevel !== "All"
      ? {
          key: "level",
          label: `Level: ${experienceLevel}`,
          chipClass: "border-indigo-400/50 bg-indigo-500/10 text-indigo-300",
          onClear: () => setExperienceLevel("All"),
        }
      : null,
    ageGroup !== "All"
      ? {
          key: "age",
          label: `Age: ${ageGroup}`,
          chipClass: "border-rose-400/50 bg-rose-500/10 text-rose-300",
          onClear: () => setAgeGroup("All"),
        }
      : null,
    sport !== "All"
      ? {
          key: "sport",
          label: `Sport: ${sport}`,
          chipClass: "border-sky-400/50 bg-sky-500/10 text-sky-300",
          onClear: () => setSport("All"),
        }
      : null,
    category !== "All"
      ? {
          key: "category",
          label: `Pattern: ${CATEGORY_SUMMARIES[category as keyof typeof CATEGORY_SUMMARIES]?.shortLabel ?? category}`,
          chipClass: "border-brand-orange/50 bg-brand-orange/10 text-brand-orange",
          onClear: () => setCategory("All"),
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <PageWithOutline sections={TRAINING_OUTLINE} title="Training">
      <WorkspaceTabs active="exercises" />

      {/* OVERVIEW HEADER & PROMINENT AVAILABLE EXERCISE COUNT GRAPHIC */}
      <header
        id="training-overview"
        className="scroll-mt-24 grid gap-6 border-b border-border/60 pb-8 lg:grid-cols-[1.2fr_0.95fr] lg:items-end"
      >
        <div className="min-w-0">
          <span className="block h-[3px] w-16 bg-tricolor" aria-hidden="true" />
          <p className="eyebrow mt-5 text-brand-amber">Training Library</p>
          <h1 className="text-display mt-2 text-3xl sm:text-5xl">Build your session.</h1>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Button
              type="button"
              variant="glass"
              size="sm"
              onClick={handleLoadDemoWorkout}
              className="min-h-10 gap-1.5 whitespace-nowrap"
            >
              <Play className="size-3.5 text-brand-amber" aria-hidden="true" />
              Try Demo
            </Button>
            <Button asChild variant="hero" size="sm" className="min-h-10 gap-1.5 whitespace-nowrap">
              <Link to="/submit">
                AI Video <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>

        {/* PROMINENT GEOMETRIC AVAILABLE EXERCISE COUNT GRAPHIC */}
        <div
          aria-live="polite"
          className="relative overflow-hidden rounded-2xl border border-brand-amber/35 bg-gradient-to-br from-surface-raised via-surface to-background p-5 sm:p-6"
        >
          <span className="absolute inset-x-0 top-0 h-[3px] bg-tricolor" aria-hidden="true" />
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-brand-amber">
                Exercises Available
              </p>
              <div className="mt-1.5 flex items-baseline gap-2 tabular-nums">
                <span className="text-display text-4xl font-semibold text-foreground sm:text-5xl">
                  {filteredExercises.length}
                </span>
                <span className="font-mono text-sm text-muted-foreground">
                  / {TRAINING_EXERCISES.length}
                </span>
              </div>
            </div>
            <div className="text-right font-mono text-xs text-muted-foreground tabular-nums">
              <span className="text-foreground">{filteredRatio}%</span>
              <span className="block text-[0.65rem] uppercase tracking-[0.12em]">matched</span>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="mt-4 h-2 w-full overflow-hidden rounded-full bg-background/80"
          >
            <div
              className="h-full rounded-full bg-gradient-accent transition-all duration-300"
              style={{ width: `${filteredRatio}%` }}
            />
          </div>

          <p className="mt-2.5 truncate font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground">
            {hasActiveFilters
              ? `${activeFilterChips.length > 0 ? activeFilterChips.map((c) => c.label).join(" · ") : "Search active"}`
              : "All muscle groups · All equipment"}
          </p>
        </div>
      </header>

      {/* COLLAPSIBLE WHAT ARE YOU WORKING ON? BAR */}
      <div id="training-focus" className="mt-6 scroll-mt-24">
        <WorkingOnCard compact defaultOpen={false} />
      </div>

      {/* MOBILE VIEW TOGGLE: LIBRARY VS WORKOUT BUILDER */}
      <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl border border-border bg-surface p-1.5 lg:hidden">
        <button
          type="button"
          onClick={() => setMobilePanel("library")}
          className={cn(
            "min-h-11 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            mobilePanel === "library"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Exercises ({filteredExercises.length})
        </button>
        <button
          type="button"
          onClick={() => setMobilePanel("builder")}
          className={cn(
            "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors tabular-nums",
            mobilePanel === "builder"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Dumbbell className="size-4" aria-hidden="true" />
          Workout ({workoutItems.length})
        </button>
      </div>

      {/* COLOR-CODED SEARCH + MUSCLE GROUPS DROPDOWN + COLLAPSIBLE MORE FILTERS */}
      <section
        id="training-filters"
        aria-label="Exercise Search and Filters"
        className={cn(
          "mt-5 scroll-mt-24 rounded-2xl border border-border bg-surface/80 p-4 sm:p-5",
          mobilePanel === "builder" && "hidden lg:block",
        )}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="exercise-search"
              aria-label="Search exercises"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exercises, muscles, or equipment..."
              className="h-11 bg-background pl-10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Clickable Muscle Groups Dropdown Menu — Amber Accent */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "h-11 min-w-[11.5rem] justify-between gap-2 bg-background px-3.5 text-sm font-normal whitespace-nowrap transition-colors",
                    bodyPart !== "All"
                      ? "border-brand-amber/65 bg-brand-amber/10 text-foreground"
                      : "border-brand-amber/35 hover:border-brand-amber/60",
                  )}
                >
                  <span className="inline-flex min-w-0 items-center gap-2 truncate">
                    <span
                      className="size-2 shrink-0 rounded-full bg-brand-amber"
                      aria-hidden="true"
                    />
                    <span className="text-muted-foreground">Muscles:</span>
                    <span
                      className={cn(
                        "truncate font-medium",
                        bodyPart !== "All" ? "text-brand-amber" : "text-foreground",
                      )}
                    >
                      {bodyPart === "All" ? "All" : bodyPart}
                    </span>
                  </span>
                  <ChevronDown
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-80 w-56 overflow-y-auto">
                <DropdownMenuItem
                  onSelect={() => setBodyPart("All")}
                  className="flex items-center justify-between"
                >
                  <span>All Muscle Groups</span>
                  {bodyPart === "All" && <Check className="size-3.5 text-brand-amber" />}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-brand-amber">
                  Muscle Groups
                </DropdownMenuLabel>
                {PRIMARY_MUSCLE_GROUPS.map((group) => (
                  <DropdownMenuItem
                    key={group}
                    onSelect={() => setBodyPart(group)}
                    className="flex items-center justify-between font-medium"
                  >
                    <span>{group}</span>
                    {bodyPart === group && <Check className="size-3.5 text-brand-amber" />}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
                  Upper &amp; Specific
                </DropdownMenuLabel>
                {UPPER_BODY_PART_FILTERS.map((part) => (
                  <DropdownMenuItem
                    key={part}
                    onSelect={() => setBodyPart(part)}
                    className="flex items-center justify-between"
                  >
                    <span>{part}</span>
                    {bodyPart === part && <Check className="size-3.5 text-brand-amber" />}
                  </DropdownMenuItem>
                ))}
                {BODY_PART_FILTERS.filter(
                  (bp) =>
                    !["Chest", "Back", "Shoulders", "Core", "Full Body / Mobility"].includes(bp),
                ).map((bp) => (
                  <DropdownMenuItem
                    key={bp}
                    onSelect={() => setBodyPart(bp)}
                    className="flex items-center justify-between text-muted-foreground"
                  >
                    <span>{bp}</span>
                    {bodyPart === bp && <Check className="size-3.5 text-brand-amber" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Collapsible More Filters Toggle */}
            <Button
              type="button"
              variant={filtersOpen || secondaryFilterCount > 0 ? "glass" : "outline"}
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen((prev) => !prev)}
              className="h-11 gap-2 whitespace-nowrap px-3.5"
            >
              <SlidersHorizontal className="size-4 text-brand-orange" aria-hidden="true" />
              <span>Filters{secondaryFilterCount > 0 ? ` (${secondaryFilterCount})` : ""}</span>
              <ChevronDown
                className={cn(
                  "size-4 text-muted-foreground transition-transform",
                  filtersOpen && "rotate-180",
                )}
                aria-hidden="true"
              />
            </Button>

            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetAllFilters}
                className="h-11 gap-1.5 whitespace-nowrap px-3 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="size-3.5" aria-hidden="true" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Active Color-Coded Filter Summary Chips */}
        {activeFilterChips.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/50 pt-3">
            {activeFilterChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.onClear}
                className={cn(
                  "inline-flex min-h-8 items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-[0.68rem] transition-opacity hover:opacity-85",
                  chip.chipClass,
                )}
              >
                <span>{chip.label}</span>
                <X className="size-3" aria-hidden="true" />
              </button>
            ))}
          </div>
        )}

        {/* Collapsible Secondary Filters Drawer (Color-Coded per Filter Dimension) */}
        {filtersOpen && (
          <div className="mt-4 grid gap-3 border-t border-border/60 pt-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {/* Equipment — Emerald */}
            <div>
              <Label
                htmlFor="filter-equipment"
                className="mb-1 flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-emerald-300"
              >
                <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                Equipment
              </Label>
              <Select value={equipment} onValueChange={setEquipment}>
                <SelectTrigger
                  id="filter-equipment"
                  className={cn(
                    "h-10 w-full bg-background",
                    equipment !== "All"
                      ? "border-emerald-400/60 text-emerald-200"
                      : "border-emerald-400/30",
                  )}
                >
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Equipment</SelectItem>
                  {EQUIPMENT_FILTERS.map((eq) => (
                    <SelectItem key={eq} value={eq}>
                      {eq}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Experience Level — Indigo */}
            <div>
              <Label
                htmlFor="filter-experience"
                className="mb-1 flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-indigo-300"
              >
                <span className="size-1.5 rounded-full bg-indigo-400" aria-hidden="true" />
                Level
              </Label>
              <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                <SelectTrigger
                  id="filter-experience"
                  className={cn(
                    "h-10 w-full bg-background",
                    experienceLevel !== "All"
                      ? "border-indigo-400/60 text-indigo-200"
                      : "border-indigo-400/30",
                  )}
                >
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Levels</SelectItem>
                  {TRAINING_EXPERIENCE_LEVELS.map((lvl) => (
                    <SelectItem key={lvl} value={lvl}>
                      {lvl}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Age Group — Rose */}
            <div>
              <Label
                htmlFor="filter-age-group"
                className="mb-1 flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-rose-300"
              >
                <span className="size-1.5 rounded-full bg-rose-400" aria-hidden="true" />
                Age Group
              </Label>
              <Select value={ageGroup} onValueChange={setAgeGroup}>
                <SelectTrigger
                  id="filter-age-group"
                  className={cn(
                    "h-10 w-full bg-background",
                    ageGroup !== "All" ? "border-rose-400/60 text-rose-200" : "border-rose-400/30",
                  )}
                >
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Ages</SelectItem>
                  {TRAINING_AGE_GROUPS.map((age) => (
                    <SelectItem key={age} value={age}>
                      {age}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sport — Sky */}
            <div>
              <Label
                htmlFor="filter-sport"
                className="mb-1 flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-sky-300"
              >
                <span className="size-1.5 rounded-full bg-sky-400" aria-hidden="true" />
                Sport
              </Label>
              <Select value={sport} onValueChange={setSport}>
                <SelectTrigger
                  id="filter-sport"
                  className={cn(
                    "h-10 w-full bg-background",
                    sport !== "All" ? "border-sky-400/60 text-sky-200" : "border-sky-400/30",
                  )}
                >
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Sports</SelectItem>
                  {TRAINING_SPORTS.map((sp) => (
                    <SelectItem key={sp} value={sp}>
                      {sp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pattern — Orange */}
            <div>
              <Label
                htmlFor="filter-category"
                className="mb-1 flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-brand-orange"
              >
                <span className="size-1.5 rounded-full bg-brand-orange" aria-hidden="true" />
                Pattern
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger
                  id="filter-category"
                  className={cn(
                    "h-10 w-full bg-background",
                    category !== "All"
                      ? "border-brand-orange/60 text-brand-amber"
                      : "border-brand-orange/30",
                  )}
                >
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Patterns</SelectItem>
                  {EXERCISE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {CATEGORY_SUMMARIES[cat].shortLabel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div>
              <Label
                htmlFor="filter-sort"
                className="mb-1 block font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground"
              >
                Sort
              </Label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as ExerciseSortOption)}>
                <SelectTrigger id="filter-sort" className="h-10 w-full bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </section>

      {/* MAIN 2-COLUMN WORKSPACE: MINIMAL EXERCISE CARDS + CALM WORKOUT BUILDER */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.45fr_0.95fr] lg:items-start">
        <section
          id="training-library"
          aria-label="Exercise Library"
          className={cn("scroll-mt-24", mobilePanel === "builder" && "hidden lg:block")}
        >
          {filteredExercises.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-10 text-center">
              <p className="text-base font-medium text-foreground">No matching exercises.</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetAllFilters}
                className="mt-4 min-h-10"
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                {visibleExercises.map((exercise) => {
                  const prescription = computeExercisePrescription(exercise, prescriptionContext);
                  const isAdded = inWorkoutIds.has(exercise.id);
                  const shortCat = CATEGORY_SUMMARIES[exercise.category].shortLabel;

                  return (
                    <article
                      key={exercise.id}
                      className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-brand-amber/40 sm:p-6"
                    >
                      <div>
                        <p className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-brand-amber">
                          {shortCat} · {exercise.difficulty}
                        </p>
                        <h2 className="text-display mt-2 text-xl text-foreground">
                          <button
                            type="button"
                            onClick={() => setInspectedExercise(exercise)}
                            className="text-left transition-colors hover:text-brand-amber"
                          >
                            {exercise.name}
                          </button>
                        </h2>
                        <p className="mt-2 truncate text-xs text-muted-foreground">
                          {exercise.primaryMuscles.slice(0, 3).join(", ")} ·{" "}
                          <span className="font-mono text-brand-orange tabular-nums">
                            {prescription.setsRepsDefault.sets}×{prescription.setsRepsDefault.reps}
                          </span>
                        </p>
                      </div>

                      <div className="mt-5 flex items-center gap-2 border-t border-border/60 pt-3.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setInspectedExercise(exercise)}
                          className="min-h-10 flex-1 gap-1.5 whitespace-nowrap"
                        >
                          <Eye className="size-3.5" aria-hidden="true" />
                          Details
                        </Button>
                        <Button
                          type="button"
                          variant={isAdded ? "glass" : "hero"}
                          size="sm"
                          onClick={() => handleAddExercise(exercise)}
                          className="min-h-10 flex-1 gap-1.5 whitespace-nowrap"
                        >
                          {isAdded ? (
                            <>
                              <Check className="size-3.5" aria-hidden="true" />
                              Added
                            </>
                          ) : (
                            <>
                              <Plus className="size-3.5" aria-hidden="true" />
                              Add
                            </>
                          )}
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>

              {filteredExercises.length > visibleExercises.length && (
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-surface/60 px-5 py-3.5">
                  <p className="font-mono text-xs text-muted-foreground tabular-nums">
                    {visibleExercises.length} / {filteredExercises.length}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setVisibleLimit((prev) => prev + 24)}
                      className="min-h-10 whitespace-nowrap"
                    >
                      Show 24 more
                    </Button>
                    <Button
                      type="button"
                      variant="glass"
                      size="sm"
                      onClick={() => setVisibleLimit(filteredExercises.length)}
                      className="min-h-10 whitespace-nowrap"
                    >
                      Show all
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* WORKOUT BUILDER COLUMN */}
        <section
          id="training-builder"
          aria-label="Workout Builder"
          className={cn("scroll-mt-24", mobilePanel === "library" && "hidden lg:block")}
        >
          <WorkoutBuilderPanel
            workoutTitle={workoutTitle}
            onWorkoutTitleChange={setWorkoutTitle}
            items={workoutItems}
            savedWorkouts={savedWorkouts}
            privateNotes={privateNotes}
            previewTier={previewTier}
            onTogglePreviewTier={handleTogglePreviewTier}
            onPrivateNoteChange={handlePrivateNoteChange}
            onLoadDemoWorkout={handleLoadDemoWorkout}
            onUpdateItem={handleUpdateItem}
            onMoveItem={handleMoveItem}
            onRemoveItem={handleRemoveItem}
            onClearWorkout={handleClearWorkout}
            onSaveWorkout={handleSaveWorkout}
            onLoadSavedWorkout={handleLoadSavedWorkout}
            onDeleteSavedWorkout={handleDeleteSavedWorkout}
            onInspectExercise={handleInspectById}
          />
        </section>
      </div>

      {/* POP-OUT DETAIL DIALOG WITH ACCORDIONS */}
      <ExerciseDetailDialog
        exercise={inspectedExercise}
        prescriptionContext={prescriptionContext}
        inWorkoutIds={inWorkoutIds}
        privateNote={inspectedExercise ? (privateNotes[inspectedExercise.id] ?? "") : ""}
        onPrivateNoteChange={handlePrivateNoteChange}
        onClose={() => setInspectedExercise(null)}
        onAddExercise={handleAddExercise}
        onInspectExercise={(next) => setInspectedExercise(next)}
      />
    </PageWithOutline>
  );
}
