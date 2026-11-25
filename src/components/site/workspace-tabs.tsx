import { Link } from "@tanstack/react-router";
import { Dumbbell, PlayCircle, UploadCloud } from "lucide-react";

import { cn } from "@/lib/utils";

export function WorkspaceTabs({ active }: { active: "exercises" | "library" | "analysis" }) {
  return (
    <div
      role="tablist"
      aria-label="Training workspace views"
      className="mb-8 grid w-full grid-cols-1 gap-1.5 rounded-xl border border-border bg-surface p-1.5 sm:inline-flex sm:w-auto sm:flex-wrap"
    >
      <Link
        to="/training"
        role="tab"
        aria-selected={active === "exercises"}
        className={cn(
          "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:justify-start",
          active === "exercises"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Dumbbell className="size-4 shrink-0" aria-hidden="true" />
        <span>Exercises</span>
      </Link>
      <Link
        to="/dashboard"
        role="tab"
        aria-selected={active === "library"}
        className={cn(
          "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:justify-start",
          active === "library"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <PlayCircle className="size-4 shrink-0" aria-hidden="true" />
        <span>Videos</span>
      </Link>
      <Link
        to="/submit"
        role="tab"
        aria-selected={active === "analysis"}
        className={cn(
          "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:justify-start",
          active === "analysis"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <UploadCloud className="size-4 shrink-0" aria-hidden="true" />
        <span>AI Video</span>
      </Link>
    </div>
  );
}
