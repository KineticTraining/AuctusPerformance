import { Check, ChevronDown, ChevronRight, Compass, Loader2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import {
  AUCTUS_STATE_EVENT,
  DEFAULT_WORKING_ON,
  FOCUS_AREAS,
  FOCUS_STATUSES,
  loadLocalWorkingOnFocus,
  saveWorkingOnFocus,
  type FocusArea,
  type FocusStatus,
  type WorkingOnFocus,
} from "@/lib/athlete-notes";
import { cn } from "@/lib/utils";

const AREA_PROMPTS: Record<FocusArea, string> = {
  Training: "e.g., Squat depth + 10m sprint starts 2x/week",
  Nutrition: "e.g., 140g daily protein + pre-practice hydration",
  Recovery: "e.g., 8h sleep anchor + eccentric hamstring work",
};

export function WorkingOnCard({
  compact = false,
  defaultOpen = true,
}: {
  compact?: boolean;
  defaultOpen?: boolean;
}) {
  const { session } = useAuth();
  const [focus, setFocus] = useState<WorkingOnFocus>(DEFAULT_WORKING_ON);
  const [hydrated, setHydrated] = useState(false);
  const [expanded, setExpanded] = useState(defaultOpen);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    const syncFromStorageAndAccount = () => {
      const local = loadLocalWorkingOnFocus();
      const remote = session?.user?.user_metadata?.["auctus_focus"] as
        Partial<WorkingOnFocus> | undefined;

      if (
        remote &&
        typeof remote.goal === "string" &&
        (!local.updatedAt || (remote.updatedAt && remote.updatedAt > local.updatedAt))
      ) {
        setFocus({
          area: FOCUS_AREAS.includes(remote.area as FocusArea)
            ? (remote.area as FocusArea)
            : "Training",
          status: FOCUS_STATUSES.includes(remote.status as FocusStatus)
            ? (remote.status as FocusStatus)
            : "Building Base",
          goal: remote.goal,
          updatedAt: typeof remote.updatedAt === "string" ? remote.updatedAt : "",
        });
      } else {
        setFocus(local);
      }
      setHydrated(true);
    };

    syncFromStorageAndAccount();
    window.addEventListener(AUCTUS_STATE_EVENT, syncFromStorageAndAccount);
    return () => window.removeEventListener(AUCTUS_STATE_EVENT, syncFromStorageAndAccount);
  }, [session?.user?.id, session?.user?.user_metadata]);

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!focus.goal.trim()) {
      toast.error("Add a short note before saving.");
      return;
    }
    setSaving(true);
    try {
      const result = await saveWorkingOnFocus(focus, Boolean(session));
      const updated = loadLocalWorkingOnFocus();
      setFocus(updated);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
      toast.success(result.syncedRemote ? "Focus saved to account." : "Focus saved locally.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      aria-label="What Are You Working On"
      className={cn(
        "rounded-2xl border border-border bg-surface",
        compact ? "px-5 py-4 sm:px-6" : "p-6 sm:p-8",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((prev) => !prev)}
          className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2
                className={cn(
                  "text-display text-foreground",
                  compact ? "text-lg sm:text-xl" : "text-2xl sm:text-3xl",
                )}
              >
                What Are You Working On?
              </h2>
              {hydrated && (
                <span className="font-mono text-xs text-brand-amber">
                  {focus.area} · {focus.status}
                </span>
              )}
            </div>
            {!expanded && hydrated && focus.goal && (
              <p className="mt-1 truncate text-xs text-muted-foreground">{focus.goal}</p>
            )}
          </div>

          <span className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
            {expanded ? "Hide" : "Edit"}
            {expanded ? (
              <ChevronDown className="size-4 text-brand-amber" aria-hidden="true" />
            ) : (
              <ChevronRight className="size-4 text-brand-amber" aria-hidden="true" />
            )}
          </span>
        </button>
      </div>

      {expanded && (
        <form
          onSubmit={handleSave}
          className="mt-5 space-y-4 border-t border-border/60 pt-5"
          noValidate
        >
          <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
            <div>
              <Label className="mb-1.5 block font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
                Pillar
              </Label>
              <div className="grid grid-cols-3 gap-1 rounded-xl border border-border bg-background/70 p-1">
                {FOCUS_AREAS.map((area) => {
                  const selected = focus.area === area;
                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() => setFocus((prev) => ({ ...prev, area }))}
                      className={cn(
                        "min-h-10 rounded-lg px-2 py-1.5 text-xs font-medium whitespace-nowrap transition-colors sm:text-sm",
                        selected
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {area}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label
                htmlFor="working-on-status"
                className="mb-1.5 block font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground"
              >
                Phase
              </Label>
              <Select
                value={focus.status}
                onValueChange={(v) => setFocus((prev) => ({ ...prev, status: v as FocusStatus }))}
              >
                <SelectTrigger id="working-on-status" className="h-12 w-full bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FOCUS_STATUSES.map((st) => (
                    <SelectItem key={st} value={st}>
                      {st}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <Label
                htmlFor="working-on-goal"
                className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground"
              >
                Current Goal
              </Label>
              <span className="font-mono text-[0.65rem] text-muted-foreground tabular-nums">
                {focus.goal.length}/400
              </span>
            </div>
            <Textarea
              id="working-on-goal"
              rows={2}
              maxLength={400}
              value={focus.goal}
              onChange={(e) => setFocus((prev) => ({ ...prev, goal: e.target.value }))}
              placeholder={AREA_PROMPTS[focus.area]}
              className="bg-background text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <span className="inline-flex items-center gap-1.5 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
              <Compass className="size-3.5 text-brand-orange" aria-hidden="true" />
              {session ? "Synced" : "Local"}
              {hydrated && focus.updatedAt
                ? ` · ${new Date(focus.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
                : ""}
            </span>

            <Button
              type="submit"
              variant={justSaved ? "glass" : "hero"}
              size="default"
              disabled={saving}
              className="min-h-10 shrink-0 gap-2 whitespace-nowrap"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Saving…
                </>
              ) : justSaved ? (
                <>
                  <Check className="size-4 text-success" aria-hidden="true" />
                  Saved
                </>
              ) : (
                "Save Focus"
              )}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
