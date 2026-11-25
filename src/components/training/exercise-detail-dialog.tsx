import { Check, Lock, Plus } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  computeExercisePrescription,
  findExerciseByPairingName,
  type ExerciseEntry,
  type PrescriptionContext,
} from "@/lib/training";
import { ExerciseVisual } from "./exercise-visual";

export function ExerciseDetailDialog({
  exercise,
  prescriptionContext,
  inWorkoutIds,
  privateNote = "",
  onPrivateNoteChange,
  onClose,
  onAddExercise,
  onInspectExercise,
}: {
  exercise: ExerciseEntry | null;
  prescriptionContext: PrescriptionContext;
  inWorkoutIds: Set<string>;
  privateNote?: string;
  onPrivateNoteChange?: (exerciseId: string, note: string) => void;
  onClose: () => void;
  onAddExercise: (exercise: ExerciseEntry) => void;
  onInspectExercise: (exercise: ExerciseEntry) => void;
}) {
  const prescription = exercise ? computeExercisePrescription(exercise, prescriptionContext) : null;
  const isAdded = exercise ? inWorkoutIds.has(exercise.id) : false;

  return (
    <Dialog open={Boolean(exercise)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto bg-surface p-5 sm:p-7">
        {exercise && prescription && (
          <>
            <DialogHeader className="pr-8 text-left">
              <p className="eyebrow text-brand-amber">
                {exercise.category.split(":")[0]} · {exercise.difficulty}
              </p>
              <DialogTitle className="text-display mt-1.5 text-2xl text-foreground sm:text-3xl">
                {exercise.name}
              </DialogTitle>
              <DialogDescription className="pt-1 font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
                {exercise.primaryMuscles.join(", ")} · {exercise.equipment.join(" / ")}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/60 px-4 py-3">
              <div className="font-mono text-xs text-foreground tabular-nums">
                <span className="text-brand-amber">
                  {prescription.setsRepsDefault.sets} × {prescription.setsRepsDefault.reps}
                </span>{" "}
                · {prescription.setsRepsDefault.note}
              </div>
              <Button
                type="button"
                variant={isAdded ? "glass" : "hero"}
                size="sm"
                onClick={() => onAddExercise(exercise)}
                className="min-h-10 gap-1.5 whitespace-nowrap"
              >
                {isAdded ? (
                  <>
                    <Check className="size-3.5" aria-hidden="true" />
                    Add Another
                  </>
                ) : (
                  <>
                    <Plus className="size-3.5" aria-hidden="true" />
                    Add to Workout
                  </>
                )}
              </Button>
            </div>

            <Accordion
              type="multiple"
              defaultValue={["execution", "prescription"]}
              className="mt-4 divide-y divide-border/70 rounded-xl border border-border/80 bg-background/40 px-4 sm:px-5"
            >
              <AccordionItem value="execution" className="border-border/70">
                <AccordionTrigger className="py-4 text-left text-sm font-medium text-foreground hover:text-brand-amber hover:no-underline">
                  Instructions &amp; Visual
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pb-5">
                  <ExerciseVisual
                    name={exercise.name}
                    category={exercise.category}
                    image={exercise.image}
                    primaryMuscles={exercise.primaryMuscles}
                  />
                  <p className="text-sm font-light leading-relaxed text-foreground/90">
                    {exercise.purpose}
                  </p>
                  <ol className="space-y-2 border-t border-border/60 pt-3">
                    {exercise.steps.map((step, idx) => (
                      <li key={step} className="flex items-start gap-2.5 text-sm leading-relaxed">
                        <span className="mt-0.5 font-mono text-xs text-brand-amber tabular-nums">
                          0{idx + 1}.
                        </span>
                        <span className="font-light text-foreground/90">{step}</span>
                      </li>
                    ))}
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="prescription" className="border-border/70">
                <AccordionTrigger className="py-4 text-left text-sm font-medium text-foreground hover:text-brand-amber hover:no-underline">
                  Smart Loading &amp; Frequency
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pb-5 text-sm">
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted-foreground">
                    {prescription.contextSummary}
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-brand-amber">
                        How to Load
                      </p>
                      <p className="mt-1 font-light leading-relaxed text-muted-foreground">
                        {prescription.howToLoad}
                      </p>
                    </div>
                    <div>
                      <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-brand-amber">
                        Frequency
                      </p>
                      <p className="mt-1 font-light leading-relaxed text-muted-foreground">
                        {prescription.howFrequently}
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="pairings" className="border-border/70">
                <AccordionTrigger className="py-4 text-left text-sm font-medium text-foreground hover:text-brand-amber hover:no-underline">
                  Recommended Pairings ({prescription.recommendedPairings.length})
                </AccordionTrigger>
                <AccordionContent className="pb-5">
                  <div className="flex flex-wrap gap-2">
                    {prescription.recommendedPairings.map((pairName) => {
                      const matched = findExerciseByPairingName(pairName);
                      const pairAdded = matched ? inWorkoutIds.has(matched.id) : false;

                      return matched ? (
                        <div
                          key={pairName}
                          className="flex items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs"
                        >
                          <button
                            type="button"
                            onClick={() => onInspectExercise(matched)}
                            className="text-left text-foreground hover:text-brand-amber"
                          >
                            {matched.name}
                          </button>
                          <button
                            type="button"
                            onClick={() => onAddExercise(matched)}
                            aria-label={`Add paired exercise ${matched.name} to workout`}
                            className="ml-1.5 inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.1em] text-brand-amber hover:bg-brand-amber/15"
                          >
                            {pairAdded ? <Check className="size-3" /> : <Plus className="size-3" />}
                            {pairAdded ? "In plan" : "Add"}
                          </button>
                        </div>
                      ) : (
                        <span key={pairName} className="text-xs text-muted-foreground">
                          {pairName}
                        </span>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {onPrivateNoteChange && (
                <AccordionItem value="notes" className="border-b-0">
                  <AccordionTrigger className="py-4 text-left text-sm font-medium text-foreground hover:text-brand-amber hover:no-underline">
                    <span className="inline-flex items-center gap-2">
                      <Lock className="size-3.5 text-brand-amber" aria-hidden="true" />
                      Personal Note
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-5">
                    <Input
                      aria-label={`Personal note for ${exercise.name}`}
                      value={privateNote}
                      onChange={(e) => onPrivateNoteChange(exercise.id, e.target.value)}
                      maxLength={300}
                      placeholder="Weight PR, stance width, or feel note..."
                      className="h-10 bg-background text-sm"
                    />
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
