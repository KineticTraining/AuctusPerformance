import { createFileRoute } from "@tanstack/react-router";
import { PricingPlans } from "@/components/pricing/pricing-plans";
import { pricingCatalogQuery } from "@/lib/billing.functions";

export const Route = createFileRoute("/membership")({
  validateSearch: (
    s: Record<string, unknown>,
  ): { session_id?: string | undefined; canceled?: string | undefined } => ({
    session_id:
      typeof s["session_id"] === "string" && s["session_id"] ? s["session_id"] : undefined,
    canceled: typeof s["canceled"] === "string" ? s["canceled"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Membership & Billing — Kinetic" },
      {
        name: "description",
        content: "Upgrade your Kinetic membership or manage billing via Stripe.",
      },
      { property: "og:title", content: "Membership & Billing — Kinetic" },
      { property: "og:description", content: "Choose a Kinetic training membership plan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(pricingCatalogQuery()),
  component: MembershipPage,
});

function MembershipPage() {
  const { session_id: sessionId, canceled } = Route.useSearch();
  return <PricingPlans sessionId={sessionId} canceled={canceled} returnPath="/membership" />;
}
