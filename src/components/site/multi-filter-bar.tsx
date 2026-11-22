import { RotateCcw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AGE_GROUPS, EXPERIENCE_LEVELS } from "@/lib/sports";

export interface MultiFilterBarProps {
  ageGroup: string;
  onAgeGroupChange: (val: string) => void;
  experienceLevel: string;
  onExperienceLevelChange: (val: string) => void;
  topic?: string | undefined;
  onTopicChange?: ((val: string) => void) | undefined;
  topicLabel?: string | undefined;
  topics?: readonly string[] | undefined;
  search?: string | undefined;
  onSearchChange?: ((val: string) => void) | undefined;
  searchPlaceholder?: string | undefined;
  hasActiveFilters: boolean;
  onReset: () => void;
  resultCount?: number | undefined;
  totalCount?: number | undefined;
}

export function MultiFilterBar({
  ageGroup,
  onAgeGroupChange,
  experienceLevel,
  onExperienceLevelChange,
  topic,
  onTopicChange,
  topicLabel = "Topic / Category",
  topics,
  search,
  onSearchChange,
  searchPlaceholder = "Search protocols or keywords...",
  hasActiveFilters,
  onReset,
  resultCount,
  totalCount,
}: MultiFilterBarProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-12">
        {onSearchChange && (
          <div className="lg:col-span-4">
            <label
              htmlFor="multi-filter-search"
              className="mb-1.5 block font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground"
            >
              Search
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="multi-filter-search"
                type="search"
                value={search ?? ""}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-10 bg-background pl-9 text-sm"
              />
            </div>
          </div>
        )}

        <div className={onSearchChange ? "lg:col-span-3" : "lg:col-span-4"}>
          <label className="mb-1.5 block font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
            Age Group
          </label>
          <Select value={ageGroup} onValueChange={onAgeGroupChange}>
            <SelectTrigger aria-label="Filter by age group" className="h-10 bg-background text-sm">
              <SelectValue placeholder="All ages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All age groups</SelectItem>
              {AGE_GROUPS.map((age) => (
                <SelectItem key={age} value={age}>
                  {age}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className={onSearchChange ? "lg:col-span-2" : "lg:col-span-4"}>
          <label className="mb-1.5 block font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
            Experience Level
          </label>
          <Select value={experienceLevel} onValueChange={onExperienceLevelChange}>
            <SelectTrigger
              aria-label="Filter by experience level"
              className="h-10 bg-background text-sm"
            >
              <SelectValue placeholder="All levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All levels</SelectItem>
              {EXPERIENCE_LEVELS.map((lvl) => (
                <SelectItem key={lvl} value={lvl}>
                  {lvl}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {topics && topics.length > 0 && onTopicChange && (
          <div className={onSearchChange ? "lg:col-span-3" : "lg:col-span-4"}>
            <label className="mb-1.5 block font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
              {topicLabel}
            </label>
            <Select value={topic ?? "All"} onValueChange={onTopicChange}>
              <SelectTrigger
                aria-label={`Filter by ${topicLabel}`}
                className="h-10 bg-background text-sm"
              >
                <SelectValue placeholder="All topics" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All categories</SelectItem>
                {topics.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-3">
        <p className="font-mono text-xs text-muted-foreground tabular-nums">
          {typeof resultCount === "number" && typeof totalCount === "number"
            ? `Showing ${resultCount} of ${totalCount} items`
            : "Combine any age group, level, and category filters dynamically"}
        </p>

        <Button
          type="button"
          variant={hasActiveFilters ? "outline" : "ghost"}
          size="sm"
          onClick={onReset}
          disabled={!hasActiveFilters}
          className="min-h-9 gap-1.5 text-xs"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Reset filters
        </Button>
      </div>
    </div>
  );
}
