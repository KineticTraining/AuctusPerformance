import { Link } from "@tanstack/react-router";
import { PlayCircle, UploadCloud } from "lucide-react";

import { cn } from "@/lib/utils";

export function WorkspaceTabs({ active }: { active: "library" | "analysis" }) {
  return (
    <div
      role="tablist"
      aria-label="Training workspace views"
      className="mb-8 inline-flex flex-wrap gap-1.5 rounded-xl border border-border bg-surface p-1.5"
    >
      <Link
        to="/dashboard"
        role="tab"
        aria-selected={active === "library"}
        className={cn(
          "inline-flex min-h-10 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
          active === "library"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <PlayCircle className="size-4" aria-hidden="true" />
        Training Library
      </Link>
      <Link
        to="/submit"
        role="tab"
        aria-selected={active === "analysis"}
        className={cn(
          "inline-flex min-h-10 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
          active === "analysis"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <UploadCloud className="size-4" aria-hidden="true" />
        AI Video Upload &amp; Analysis
      </Link>
    </div>
  );
}
