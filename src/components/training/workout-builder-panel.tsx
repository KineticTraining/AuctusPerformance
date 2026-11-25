import {
  ArrowDown,
  ArrowUp,
  BookmarkCheck,
  ChevronDown,
  ChevronRight,
  Copy,
  Dumbbell,
  FolderOpen,
  Lock,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PreviewTier } from "@/lib/athlete-notes";
import type { ExerciseEntry } from "@/lib/training";
import { cn } from "@/lib/utils";

export interface WorkoutItem {
  uid: string;
  exerciseId: string;
  name: string;
  category: string;
  sets: number;
  reps: string;
  notes: string;
}

export interface SavedWorkoutSession {
  id: string;
  title: string;
  savedAt: string;
  items: WorkoutItem[];
}

export function WorkoutBuilderPanel({
  workoutTitle,
  onWorkoutTitleChange,
  items,
  savedWorkouts,
  privateNotes,
  previewTier,
  onTogglePreviewTier,
  onPrivateNoteChange,
  onLoadDemoWorkout,
  onUpdateItem,
  onMoveItem,
  onRemoveItem,
  onClearWorkout,
  onSaveWorkout,
  onLoadSavedWorkout,
  onDeleteSavedWorkout,
  onInspectExercise,
}: {
  workoutTitle: string;
  onWorkoutTitleChange: (title: string) => void;
  items: WorkoutItem[];
  savedWorkouts: SavedWorkoutSession[];
  privateNotes: Record<string, string>;
  previewTier: PreviewTier;
  onTogglePreviewTier: () => void;
  onPrivateNoteChange: (exerciseId: string, note: string) => void;
  onLoadDemoWorkout: () => void;
  onUpdateItem: (uid: string, patch: Partial<Pick<WorkoutItem, "sets" | "reps" | "notes">>) => void;
  onMoveItem: (uid: string, direction: "up" | "down") => void;
  onRemoveItem: (uid: string) => void;
  onClearWorkout: () => void;
  onSaveWorkout: () => void;
  onLoadSavedWorkout: (session: SavedWorkoutSession) => void;
  onDeleteSavedWorkout: (id: string) => void;
  onInspectExercise: (exerciseId: string) => void;
  exerciseLookup?: Map<string, ExerciseEntry>;
}) {
  const [showSaved, setShowSaved] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [expandedItemUids, setExpandedItemUids] = useState<Record<string, boolean>>({});

  const totalSets = items.reduce(
    (sum, item) => sum + (Number.isFinite(item.sets) ? item.sets : 0),
    0,
  );

  function toggleItemEdit(uid: string) {
    setExpandedItemUids((prev) => ({ ...prev, [uid]: !prev[uid] }));
  }

  async function handleCopyWorkout() {
    if (items.length === 0) {
      toast.info("Add at least one exercise before copying.");
      return;
    }
    const header = workoutTitle.trim() || "Auctus Performance Workout";
    const lines = items.map((item, idx) => {
      const priv = privateNotes[item.exerciseId]?.trim();
      return `${idx + 1}. ${item.name} — ${item.sets} × ${item.reps}${item.notes.trim() ? ` (${item.notes.trim()})` : ""}${priv ? ` [Note: ${priv}]` : ""}`;
    });
    const text = `${header}\n${"-".repeat(Math.min(48, header.length))}\n${lines.join("\n")}\n\nTotal: ${items.length} exercises · ${totalSets} sets`;

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        toast.success("Workout copied.");
      } else {
        toast.info("Clipboard unavailable.");
      }
    } catch {
      toast.error("Could not copy. Try saving locally instead.");
    }
  }

  return (
    <aside
      aria-label="Workout Builder"
      className="rounded-2xl border border-border bg-surface p-5 sm:p-6 lg:sticky lg:top-20"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow text-brand-amber">Workout Builder</p>
          <h2 className="text-display mt-1 text-2xl text-foreground">Session</h2>
        </div>
        <div className="text-right font-mono text-xs text-muted-foreground tabular-nums">
          <p className="text-foreground">{items.length} exercises</p>
          <p>{totalSets} sets</p>
        </div>
      </div>

      {/* Workout Name + Collapsible Options */}
      <div className="mt-4 flex items-center gap-2">
        <Input
          id="workout-session-title"
          aria-label="Workout name"
          value={workoutTitle}
          onChange={(e) => onWorkoutTitleChange(e.target.value)}
          placeholder="Workout name"
          maxLength={80}
          className="h-10 flex-1 bg-background text-sm"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-expanded={showOptions}
          onClick={() => setShowOptions((prev) => !prev)}
          className="h-10 shrink-0 gap-1.5 whitespace-nowrap px-3"
        >
          <SlidersHorizontal className="size-3.5" aria-hidden="true" />
          Options
        </Button>
      </div>

      {showOptions && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 bg-background/60 px-3.5 py-2.5 text-xs">
          <span className="text-muted-foreground">
            {previewTier === "pro_preview" ? "Pro Preview active" : "Free tier · Demo unlocked"}
          </span>
          <button
            type="button"
            onClick={onTogglePreviewTier}
            className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-brand-amber underline underline-offset-4 hover:text-foreground"
          >
            {previewTier === "pro_preview" ? "Use Free" : "Enable Pro Preview"}
          </button>
        </div>
      )}

      {/* Exercise Queue */}
      <div className="mt-4 border-t border-border/70 pt-4">
        {items.length === 0 ? (
          <div className="py-6 text-center">
            <Dumbbell className="mx-auto size-6 text-muted-foreground/70" aria-hidden="true" />
            <p className="mt-2.5 text-sm font-medium text-foreground">No exercises added</p>
            <p className="mt-1 text-xs font-light text-muted-foreground">
              Add from the library or load a sample session.
            </p>
            <Button
              type="button"
              variant="hero"
              size="sm"
              onClick={onLoadDemoWorkout}
              className="mt-4 min-h-10 gap-1.5 whitespace-nowrap"
            >
              <Play className="size-3.5" aria-hidden="true" />
              Try Demo Workout
            </Button>
          </div>
        ) : (
          <ol className="max-h-[46vh] divide-y divide-border/70 overflow-y-auto pr-1">
            {items.map((item, idx) => {
              const privateNote = privateNotes[item.exerciseId] ?? "";
              const isExpanded = Boolean(expandedItemUids[item.uid]);

              return (
                <li key={item.uid} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onInspectExercise(item.exerciseId)}
                      className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <p className="truncate text-sm font-medium text-foreground hover:text-brand-amber">
                        <span className="mr-1.5 font-mono text-xs text-brand-amber tabular-nums">
                          {String(idx + 1).padStart(2, "0")}.
                        </span>
                        {item.name}
                      </p>
                      <p className="mt-0.5 font-mono text-[0.7rem] text-muted-foreground tabular-nums">
                        {item.sets} × {item.reps}
                        {item.notes.trim() ? ` · ${item.notes.trim()}` : ""}
                        {privateNote.trim() ? " · Note saved" : ""}
                      </p>
                    </button>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        onClick={() => toggleItemEdit(item.uid)}
                        aria-label={`Edit sets, reps, and note for ${item.name}`}
                        className="inline-flex h-8 items-center gap-1 rounded border border-border/70 px-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {isExpanded ? (
                          <ChevronDown className="size-3.5 text-brand-amber" aria-hidden="true" />
                        ) : (
                          <ChevronRight className="size-3.5" aria-hidden="true" />
                        )}
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => onMoveItem(item.uid, "up")}
                        aria-label={`Move ${item.name} up`}
                        className="grid size-8 place-items-center rounded border border-border/70 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                      >
                        <ArrowUp className="size-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === items.length - 1}
                        onClick={() => onMoveItem(item.uid, "down")}
                        aria-label={`Move ${item.name} down`}
                        className="grid size-8 place-items-center rounded border border-border/70 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                      >
                        <ArrowDown className="size-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.uid)}
                        aria-label={`Remove ${item.name}`}
                        className="grid size-8 place-items-center rounded border border-border/70 text-muted-foreground transition-colors hover:border-destructive/60 hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {/* Collapsible Sets/Reps/Cue + Private Personal Note */}
                  {isExpanded && (
                    <div className="mt-3 space-y-2.5 rounded-xl border border-border/70 bg-background/50 p-3">
                      <div className="grid grid-cols-[4rem_5rem_1fr] gap-2">
                        <div>
                          <label
                            htmlFor={`sets-${item.uid}`}
                            className="block font-mono text-[0.6rem] uppercase tracking-[0.12em] text-muted-foreground"
                          >
                            Sets
                          </label>
                          <Input
                            id={`sets-${item.uid}`}
                            type="number"
                            min={1}
                            max={20}
                            value={item.sets}
                            onChange={(e) => {
                              const val = Math.max(1, Math.min(20, Number(e.target.value) || 1));
                              onUpdateItem(item.uid, { sets: val });
                            }}
                            className="mt-0.5 h-8 bg-background px-2 font-mono text-xs tabular-nums"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`reps-${item.uid}`}
                            className="block font-mono text-[0.6rem] uppercase tracking-[0.12em] text-muted-foreground"
                          >
                            Reps
                          </label>
                          <Input
                            id={`reps-${item.uid}`}
                            value={item.reps}
                            onChange={(e) => onUpdateItem(item.uid, { reps: e.target.value })}
                            maxLength={24}
                            placeholder="6–8"
                            className="mt-0.5 h-8 bg-background px-2 font-mono text-xs tabular-nums"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`notes-${item.uid}`}
                            className="block font-mono text-[0.6rem] uppercase tracking-[0.12em] text-muted-foreground"
                          >
                            Cue
                          </label>
                          <Input
                            id={`notes-${item.uid}`}
                            value={item.notes}
                            onChange={(e) => onUpdateItem(item.uid, { notes: e.target.value })}
                            maxLength={80}
                            placeholder="RPE / tempo"
                            className="mt-0.5 h-8 bg-background px-2 text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor={`private-${item.uid}`}
                          className="flex items-center gap-1 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-muted-foreground"
                        >
                          <Lock className="size-2.5 text-brand-amber" aria-hidden="true" />
                          Personal Note
                        </label>
                        <Input
                          id={`private-${item.uid}`}
                          value={privateNote}
                          onChange={(e) => onPrivateNoteChange(item.exerciseId, e.target.value)}
                          maxLength={300}
                          placeholder="Weight PR, stance, or feel note..."
                          className="mt-0.5 h-8 bg-background px-2 text-xs"
                        />
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* Actions */}
      <div className="mt-5 grid grid-cols-2 gap-2 border-t border-border/70 pt-4">
        <Button
          type="button"
          variant="hero"
          size="sm"
          onClick={onSaveWorkout}
          disabled={items.length === 0}
          className="min-h-10 gap-1.5 whitespace-nowrap"
        >
          <BookmarkCheck className="size-3.5" aria-hidden="true" />
          Save
        </Button>
        <Button
          type="button"
          variant="glass"
          size="sm"
          onClick={handleCopyWorkout}
          disabled={items.length === 0}
          className="min-h-10 gap-1.5 whitespace-nowrap"
        >
          <Copy className="size-3.5" aria-hidden="true" />
          Copy
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowSaved((prev) => !prev)}
          className="min-h-10 gap-1.5 whitespace-nowrap"
        >
          <FolderOpen className="size-3.5" aria-hidden="true" />
          Saved ({savedWorkouts.length})
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClearWorkout}
          disabled={items.length === 0}
          className="min-h-10 gap-1.5 whitespace-nowrap text-muted-foreground hover:text-destructive"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Clear
        </Button>
      </div>

      {showSaved && (
        <div className="mt-4 border-t border-border/70 pt-4">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
            Saved Sessions
          </p>
          {savedWorkouts.length === 0 ? (
            <p className="mt-2 text-xs font-light text-muted-foreground">No saved workouts yet.</p>
          ) : (
            <ul className="mt-2.5 space-y-2">
              {savedWorkouts.map((saved) => (
                <li
                  key={saved.id}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-lg border border-border/70 bg-background/60 px-3 py-2",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onLoadSavedWorkout(saved)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-xs font-medium text-foreground hover:text-brand-amber">
                      {saved.title}
                    </p>
                    <p className="font-mono text-[0.65rem] text-muted-foreground tabular-nums">
                      {saved.items.length} exercises · {saved.savedAt}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteSavedWorkout(saved.id)}
                    aria-label={`Delete saved workout ${saved.title}`}
                    className="grid size-8 shrink-0 place-items-center text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </aside>
  );
}
