import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div
      className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16"
      aria-busy="true"
      aria-label="Loading training library"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-14 w-72 sm:w-96" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-12 w-36" />
          <Skeleton className="h-12 w-44" />
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-surface p-6">
            <Skeleton className="h-12 w-16" />
            <Skeleton className="mt-3 h-4 w-32" />
          </div>
        ))}
      </div>

      <Skeleton className="mt-16 h-10 w-52" />
      <div className="mt-6 flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-10 w-36 rounded-full" />
        ))}
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-border bg-surface">
            <Skeleton className="aspect-video w-full rounded-none" />
            <div className="space-y-3 p-5">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SubmitSkeleton() {
  return (
    <div
      className="mx-auto grid max-w-7xl gap-12 px-5 py-12 md:px-8 md:py-16 lg:grid-cols-[1fr_1.3fr]"
      aria-busy="true"
      aria-label="Loading video review workspace"
    >
      <div className="space-y-5">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-14 w-64" />
        <Skeleton className="h-5 w-full max-w-md" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
      <div className="space-y-5">
        <Skeleton className="h-10 w-44" />
        {[1, 2].map((i) => (
          <div key={i} className="space-y-4 rounded-2xl border border-border bg-surface p-6">
            <div className="flex justify-between">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-10 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ArticlesSkeleton() {
  return (
    <div
      className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24"
      aria-busy="true"
      aria-label="Loading news and sports science"
    >
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-4 h-16 w-72 sm:w-96" />
      <Skeleton className="mt-4 h-6 w-full max-w-xl" />
      <Skeleton className="mt-14 h-72 w-full rounded-3xl" />
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4 rounded-2xl border border-border bg-surface p-7">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-4/5" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-4 w-36" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function NutritionSkeleton() {
  return (
    <div
      className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24"
      aria-busy="true"
      aria-label="Loading nutrition hub"
    >
      <Skeleton className="h-4 w-36" />
      <Skeleton className="mt-4 h-16 w-full max-w-2xl" />
      <Skeleton className="mt-10 h-64 w-full rounded-3xl" />
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4 rounded-2xl border border-border bg-surface p-6">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-6 w-4/5" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminSkeleton() {
  return (
    <div
      className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24"
      aria-busy="true"
      aria-label="Loading admin studio"
    >
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-4 h-14 w-80" />
      <Skeleton className="mt-8 h-80 w-full rounded-2xl" />
    </div>
  );
}

export function PricingSkeleton() {
  return (
    <div
      className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24"
      aria-busy="true"
      aria-label="Loading pricing tiers"
    >
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-4 h-16 w-full max-w-2xl" />
      <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-7"
          >
            <div className="space-y-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-36" />
              <Skeleton className="h-12 w-28" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-28 w-full" />
            </div>
            <Skeleton className="mt-8 h-12 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
