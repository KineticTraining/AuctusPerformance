import { Check } from "lucide-react";

import { FILTER_SPORTS } from "@/lib/sports";
import { cn } from "@/lib/utils";

type SportFilterProps = {
  selected: string[];
  onChange: (next: string[]) => void;
  maxSelections?: number | null;
  onLimitReached?: (limit: number) => void;
};

export function SportFilter({
  selected,
  onChange,
  maxSelections = null,
  onLimitReached,
}: SportFilterProps) {
  const toggle = (sport: string) => {
    if (selected.includes(sport)) {
      onChange(selected.filter((s) => s !== sport));
      return;
    }
    if (typeof maxSelections === "number" && selected.length >= maxSelections) {
      onLimitReached?.(maxSelections);
      return;
    }
    onChange([...selected, sport]);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {FILTER_SPORTS.map((sport) => {
          const active = selected.includes(sport);
          const atLimit =
            !active && typeof maxSelections === "number" && selected.length >= maxSelections;
          return (
            <button
              key={sport}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(sport)}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-normal whitespace-nowrap transition-colors sm:min-h-9 sm:py-1.5",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : atLimit
                    ? "border-border/50 text-muted-foreground/50 hover:border-border hover:text-muted-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "grid size-4 place-items-center rounded-sm border transition-colors",
                  active
                    ? "border-primary-foreground bg-primary-foreground text-primary"
                    : "border-muted-foreground/60",
                )}
                aria-hidden="true"
              >
                {active && <Check className="size-3" strokeWidth={3} />}
              </span>
              {sport}
            </button>
          );
        })}
        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="px-2 py-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Clear
          </button>
        )}
      </div>
      {typeof maxSelections === "number" && (
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
          {selected.length} / {maxSelections} sport filters selected on your current plan
        </p>
      )}
    </div>
  );
}
