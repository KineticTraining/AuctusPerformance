import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { AdminSkeleton } from "@/components/site/page-skeletons";
import { adminStatusQuery } from "@/lib/cms.functions";

const LazyAdminStudio = lazy(() =>
  import("@/components/admin/admin-studio").then((m) => ({ default: m.AdminStudio })),
);

function AdminRouteComponent() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <LazyAdminStudio />
    </Suspense>
  );
}

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Studio — Dusk Kinetic Performance" },
      {
        name: "description",
        content:
          "Private content management studio for Dusk Kinetic Performance news, research articles, newsletters, and nutrition protocols.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  pendingComponent: AdminSkeleton,
  loader: ({ context }) => context.queryClient.ensureQueryData(adminStatusQuery()),
  component: AdminRouteComponent,
});
