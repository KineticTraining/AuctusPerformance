import { Check } from "lucide-react";

import { FILTER_SPORTS } from "@/lib/sports";
import { cn } from "@/lib/utils";

type SportFilterProps = {
  selected: string[];
  onChange: (next: string[]) => void;
};

export function SportFilter({ selected, onChange }: SportFilterProps) {
  const toggle = (sport: string) =>
    onChange(selected.includes(sport) ? selected.filter((s) => s !== sport) : [...selected, sport]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {FILTER_SPORTS.map((sport) => {
        const active = selected.includes(sport);
        return (
          <button
            key={sport}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(sport)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-normal transition-colors",
              active ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            <span
              className={cn(
                "grid size-4 place-items-center rounded-sm border transition-colors",
                active ? "border-primary-foreground bg-primary-foreground text-primary" : "border-muted-foreground/60",
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
  );
}
