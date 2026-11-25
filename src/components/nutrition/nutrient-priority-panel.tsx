import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  getNutrientPriority,
  type NutrientEntry,
  type NutrientPriorityTier,
} from "@/lib/nutrition-data";
import { cn } from "@/lib/utils";

const TIER_STYLES: Record<
  NutrientPriorityTier,
  {
    accentText: string;
    barColor: string;
    borderAccent: string;
    shortTag: string;
  }
> = {
  high: {
    accentText: "text-brand-amber",
    barColor: "bg-brand-amber",
    borderAccent: "border-brand-amber/40",
    shortTag: "High Priority",
  },
  situational: {
    accentText: "text-brand-orange",
    barColor: "bg-brand-orange",
    borderAccent: "border-brand-orange/40",
    shortTag: "Situational Priority",
  },
  baseline: {
    accentText: "text-brand-indigo",
    barColor: "bg-brand-indigo",
    borderAccent: "border-brand-indigo/35",
    shortTag: "Baseline Coverage",
  },
};

export function NutrientPriorityPanel({
  nutrient,
  onOpenModal,
}: {
  nutrient: NutrientEntry | null;
  onOpenModal: (entry: NutrientEntry) => void;
}) {
  if (!nutrient) {
    return (
      <aside
        aria-label="Nutrient Priority Explorer"
        className="rounded-2xl border border-border bg-surface p-6 sm:p-7 lg:sticky lg:top-24"
      >
        <p className="eyebrow text-brand-amber">Interactive Priority Inspector</p>
        <h3 className="text-display mt-3 text-2xl text-foreground">Hover or select any nutrient</h3>
        <p className="mt-3 text-sm font-light leading-relaxed text-muted-foreground">
          Point at or tap any macronutrient, vitamin, or mineral to inspect its athletic priority
          tier, typical U.S. dietary intake coverage, and why it matters for performance and daily
          health.
        </p>
      </aside>
    );
  }

  const priority = getNutrientPriority(nutrient);
  const style = TIER_STYLES[priority.tier];

  return (
    <aside
      aria-label="Nutrient Priority Explorer"
      aria-live="polite"
      className={cn(
        "rounded-2xl border bg-surface p-6 transition-colors duration-150 sm:p-7 lg:sticky lg:top-24",
        style.borderAccent,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow text-muted-foreground">
            {nutrient.group}
            {nutrient.subgroup ? ` · ${nutrient.subgroup}` : ""}
          </p>
          <h3 className="text-display mt-2.5 text-2xl text-foreground sm:text-3xl">
            {nutrient.name}
          </h3>
        </div>
      </div>

      {/* Priority indicator line (clean typographic readout, no pill capsules) */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-y border-border/70 py-3 text-xs">
        <span className={cn("font-mono uppercase tracking-[0.14em]", style.accentText)}>
          {priority.tierLabel}
        </span>
      </div>

      {/* Typical Diet Coverage Gauge */}
      <div className="mt-5">
        <div className="flex items-baseline justify-between gap-2 text-xs">
          <span className="font-mono uppercase tracking-[0.14em] text-muted-foreground">
            Typical U.S. Intake Coverage
          </span>
          <span className={cn("font-mono text-sm font-medium tabular-nums", style.accentText)}>
            {priority.coverageScore}%
          </span>
        </div>

        <div className="mt-2.5 h-2 w-full overflow-hidden rounded-sm bg-background">
          <div
            className={cn("h-full transition-all duration-300 ease-out", style.barColor)}
            style={{ width: `${Math.min(100, Math.max(8, priority.coverageScore))}%` }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground/80">
          <span>Common shortfall</span>
          <span>Target met</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{priority.gapSignal}</p>
      </div>

      {/* Verified Intake Comparison */}
      <div className="mt-6 space-y-3 border-t border-border/70 pt-5 text-sm">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
            Body Needs
          </p>
          <p className="mt-1 leading-relaxed text-foreground/95">{nutrient.summarized.bodyNeeds}</p>
        </div>
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
            Average American Gets
          </p>
          <p className="mt-1 leading-relaxed text-muted-foreground">
            {nutrient.summarized.averageAmericanGets}
          </p>
        </div>
      </div>

      {/* Why Priority */}
      <div className="mt-6 border-t border-border/70 pt-5">
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-brand-amber">
            Why We Prioritize It
          </p>
          <span className="text-xs text-muted-foreground">{priority.athleticFocus}</span>
        </div>
        <p className="mt-2 text-sm font-light leading-relaxed text-foreground/90">
          {priority.priorityWhy}
        </p>
      </div>

      {/* Primary Action */}
      <div className="mt-6">
        <Button
          type="button"
          variant="glass"
          size="lg"
          onClick={() => onOpenModal(nutrient)}
          className="min-h-11 w-full justify-between"
        >
          <span>Read Summarized &amp; In-Depth Profile</span>
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </aside>
  );
}
