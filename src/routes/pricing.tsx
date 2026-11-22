import { createFileRoute } from "@tanstack/react-router";
import { PricingPlans } from "@/components/pricing/pricing-plans";
import { PricingSkeleton } from "@/components/site/page-skeletons";
import { pricingCatalogQuery } from "@/lib/billing.functions";

export const Route = createFileRoute("/pricing")({
  validateSearch: (
    s: Record<string, unknown>,
  ): { session_id?: string | undefined; canceled?: string | undefined } => ({
    session_id:
      typeof s["session_id"] === "string" && s["session_id"] ? s["session_id"] : undefined,
    canceled: typeof s["canceled"] === "string" ? s["canceled"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Pricing — Kinetic" },
      {
        name: "description",
        content:
          "Compare Kinetic monthly and annual plans for training videos, sport filters, and AI technique reviews.",
      },
      { property: "og:title", content: "Pricing — Kinetic" },
      {
        property: "og:description",
        content: "Monthly and annual sports training membership tiers powered by Stripe.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  pendingComponent: PricingSkeleton,
  loader: ({ context }) => context.queryClient.ensureQueryData(pricingCatalogQuery()),
  component: PricingPage,
});

function PricingPage() {
  const { session_id: sessionId, canceled } = Route.useSearch();
  return <PricingPlans sessionId={sessionId} canceled={canceled} returnPath="/pricing" />;
}
