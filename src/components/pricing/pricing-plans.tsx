import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Check, CreditCard, ExternalLink, Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { FaqSection } from "@/components/site/social-proof-faq";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import {
  createBillingPortalSession,
  createCheckoutSession,
  getBillingStatus,
  pricingCatalogQuery,
  verifyCheckoutSession,
} from "@/lib/billing.functions";
import { formatDate } from "@/lib/format";
import { PRICING_TIERS, getTierById, type PlanId } from "@/lib/plans";
import { cn } from "@/lib/utils";

type BillingFilter = "all" | "month" | "year";

export type PricingPlansProps = {
  sessionId?: string | undefined;
  canceled?: string | undefined;
  returnPath?: "/pricing" | "/membership";
};

export function PricingPlans({ sessionId, canceled, returnPath = "/pricing" }: PricingPlansProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session, ready } = useAuth();

  const fetchBillingStatus = useServerFn(getBillingStatus);
  const startCheckout = useServerFn(createCheckoutSession);
  const confirmCheckout = useServerFn(verifyCheckoutSession);
  const openPortal = useServerFn(createBillingPortalSession);

  const [intervalFilter, setIntervalFilter] = useState<BillingFilter>("all");
  const [busyPlan, setBusyPlan] = useState<PlanId | "portal" | null>(null);
  const [externalUrl, setExternalUrl] = useState<{ label: string; url: string } | null>(null);
  const [verifiedSessionId, setVerifiedSessionId] = useState<string | null>(null);

  const catalogQuery = useSuspenseQuery(pricingCatalogQuery());

  const billingQuery = useQuery({
    queryKey: ["billing-status", session?.user?.id ?? "anon"],
    queryFn: () => fetchBillingStatus(),
    enabled: ready && Boolean(session),
  });

  useEffect(() => {
    if (canceled) {
      toast.info("Checkout canceled — your plan was not changed.");
    }
  }, [canceled]);

  useEffect(() => {
    if (!ready || !session || !sessionId || verifiedSessionId === sessionId) return;
    setVerifiedSessionId(sessionId);
    confirmCheckout({ data: { sessionId } })
      .then((res) => {
        queryClient.setQueryData(["billing-status", session.user.id], res);
        toast.success("Membership activated — welcome to Dusk Kinetic.");
        navigate({
          to: returnPath,
          search: { session_id: undefined, canceled: undefined },
          replace: true,
        });
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "Could not verify checkout session.";
        toast.error(msg);
      });
  }, [
    ready,
    session,
    sessionId,
    verifiedSessionId,
    confirmCheckout,
    queryClient,
    navigate,
    returnPath,
  ]);

  function redirectToStripe(url: string, label: string) {
    setExternalUrl({ label, url });
    try {
      if (window.self === window.top) {
        window.location.href = url;
      } else if (window.top) {
        window.top.location.href = url;
      }
    } catch {
      // Sandboxed preview iframe blocked top-level navigation; explicit link stays visible.
    }
  }

  async function handleSubscribe(plan: PlanId) {
    if (!session) {
      navigate({ to: "/auth", search: { mode: "signup" } });
      return;
    }
    setBusyPlan(plan);
    setExternalUrl(null);
    try {
      const { url } = await startCheckout({ data: { plan } });
      redirectToStripe(url, "Continue to Stripe Checkout");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to start Stripe Checkout.";
      toast.error(msg);
    } finally {
      setBusyPlan(null);
    }
  }

  async function handlePortal() {
    setBusyPlan("portal");
    setExternalUrl(null);
    try {
      const { url } = await openPortal();
      redirectToStripe(url, "Open Stripe Billing Portal");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to open Stripe Billing Portal.";
      toast.error(msg);
    } finally {
      setBusyPlan(null);
    }
  }

  const configured = billingQuery.data?.configured ?? catalogQuery.data?.configured ?? false;
  const keyMode = billingQuery.data?.keyMode ?? catalogQuery.data?.keyMode ?? "none";
  const status = billingQuery.data?.status ?? "inactive";
  const activePlan = billingQuery.data?.plan ?? "free";
  const activeTier = activePlan !== "free" ? getTierById(activePlan) : undefined;
  const isActive = status === "active" || status === "trialing";

  const allPlans =
    catalogQuery.data?.plans ??
    PRICING_TIERS.map((t) => ({ ...t, stripePriceId: null, currency: "usd" }));
  const visiblePlans =
    intervalFilter === "all"
      ? allPlans
      : allPlans.filter((plan) => plan.interval === intervalFilter);

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
      <span className="block h-[3px] w-16 bg-tricolor" aria-hidden="true" />
      <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="eyebrow">Plans &amp; Pricing</p>
            {configured && (
              <>
                <span className="text-xs text-muted-foreground" aria-hidden="true">
                  ·
                </span>
                <span className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-brand-amber">
                  Stripe {keyMode === "live" ? "Live" : "Test"} Mode
                </span>
              </>
            )}
          </div>
          <h1 className="text-display mt-4 max-w-3xl text-4xl sm:text-5xl md:text-7xl">
            Pick the training tier that fits your season.
          </h1>
          <p className="mt-4 max-w-2xl text-lg font-light text-muted-foreground">
            From focused two-sport mechanics to unlimited coaching and AI video reviews — billed
            securely through Stripe.
          </p>
        </div>

        <div className="inline-flex self-start rounded-full border border-border bg-surface p-1">
          {(
            [
              ["all", "All plans"],
              ["month", "Monthly"],
              ["year", "Annual"],
            ] as const
          ).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setIntervalFilter(val)}
              className={cn(
                "min-h-10 rounded-full px-4 py-1.5 text-sm font-normal whitespace-nowrap transition-colors sm:min-h-9",
                intervalFilter === val
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {!configured && (
        <div className="mt-8 rounded-2xl border border-brand-red/40 bg-surface p-6">
          <p className="eyebrow text-brand-red">Stripe environment setup</p>
          <p className="mt-2 text-sm text-foreground">
            Add your <code className="font-mono text-xs text-brand-amber">STRIPE_SECRET_KEY</code>{" "}
            to your server environment and restart the server to enable live Stripe Checkout
            sessions.
          </p>
        </div>
      )}

      {externalUrl && (
        <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-brand-amber/50 bg-surface p-6 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow text-brand-amber">Checkout session ready</p>
            <p className="mt-1 text-sm text-muted-foreground">
              If Stripe did not open automatically, use the secure link below to complete payment in
              a new tab.
            </p>
          </div>
          <Button asChild variant="hero" size="lg">
            <a href={externalUrl.url} target="_blank" rel="noopener noreferrer">
              {externalUrl.label} <ExternalLink />
            </a>
          </Button>
        </div>
      )}

      {session && billingQuery.isLoading && <Skeleton className="mt-10 h-28 w-full rounded-2xl" />}

      {session && isActive && (
        <div className="mt-10 flex flex-col gap-6 rounded-2xl border border-brand-amber/50 bg-surface p-7 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="inline-flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-brand-amber">
              <ShieldCheck className="size-3.5" aria-hidden="true" /> Active ·{" "}
              {activeTier?.name ?? activePlan}
            </p>
            <p className="text-display text-3xl">Your Dusk Kinetic membership is active.</p>
            <p className="text-sm text-muted-foreground">
              {billingQuery.data?.currentPeriodEnd
                ? `${billingQuery.data.cancelAtPeriodEnd ? "Access ends" : "Renews"} on ${formatDate(billingQuery.data.currentPeriodEnd)}`
                : "Managed through Stripe Billing."}
            </p>
          </div>
          {billingQuery.data?.hasCustomer && (
            <Button
              variant="glass"
              size="lg"
              onClick={handlePortal}
              disabled={busyPlan === "portal"}
              className="min-h-11"
            >
              {busyPlan === "portal" ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <CreditCard aria-hidden="true" />
              )}
              Manage billing
            </Button>
          )}
        </div>
      )}

      <div
        className={cn(
          "mt-12 grid gap-6",
          visiblePlans.length === 1
            ? "max-w-xl"
            : visiblePlans.length === 3
              ? "md:grid-cols-3"
              : "md:grid-cols-2 xl:grid-cols-4",
        )}
      >
        {visiblePlans.map((plan) => {
          const isCurrent = isActive && activePlan === plan.id;
          return (
            <article
              key={plan.id}
              className={cn(
                "flex flex-col justify-between rounded-2xl border bg-surface p-7 transition-colors hover:border-foreground/30",
                plan.highlighted ? "border-brand-amber/60" : "border-border",
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className="eyebrow">{plan.tierLabel}</p>
                  {plan.badge && (
                    <span
                      className={cn(
                        "font-mono text-[0.64rem] uppercase tracking-[0.16em]",
                        plan.highlighted ? "text-brand-amber" : "text-brand-red",
                      )}
                    >
                      {plan.badge}
                    </span>
                  )}
                </div>

                <h2 className="text-display mt-4 text-3xl">{plan.name}</h2>
                <p className="mt-2 min-h-[2.75rem] text-sm font-light text-muted-foreground">
                  {plan.tagline}
                </p>

                <div className="mt-6 flex items-baseline gap-2.5">
                  <span className="text-display text-5xl font-extralight tabular-nums">
                    {plan.priceDisplay}
                  </span>
                  <span className="text-sm text-muted-foreground">{plan.cadenceLabel}</span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl border border-border bg-background/60 p-3 text-xs">
                  <div>
                    <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
                      Sport filters
                    </p>
                    <p className="mt-1 font-medium text-foreground">
                      {plan.maxSportFilters === null
                        ? "Unlimited"
                        : `${plan.maxSportFilters} sports`}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
                      Video reviews
                    </p>
                    <p className="mt-1 font-medium text-foreground">
                      {plan.maxMonthlyReviews === null
                        ? "Unlimited"
                        : `${plan.maxMonthlyReviews} / mo`}
                    </p>
                  </div>
                </div>

                <ul className="mt-6 space-y-3 border-t border-border pt-6 text-sm text-muted-foreground">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3 text-foreground/90">
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-brand-amber/50 text-brand-amber">
                        <Check className="size-3" />
                      </span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                {isCurrent ? (
                  <Button variant="outline" size="xl" className="w-full" disabled>
                    Current plan
                  </Button>
                ) : (
                  <Button
                    variant={plan.highlighted ? "hero" : "glass"}
                    size="xl"
                    className="w-full"
                    disabled={busyPlan !== null || (!configured && Boolean(session))}
                    onClick={() => handleSubscribe(plan.id)}
                  >
                    {busyPlan === plan.id ? (
                      <>
                        <Loader2 className="animate-spin" /> Connecting to Stripe…
                      </>
                    ) : !session ? (
                      <>
                        Sign up &amp; subscribe <ArrowRight />
                      </>
                    ) : (
                      <>
                        Choose {plan.name} <ArrowRight />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {!session && (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already a member?{" "}
          <Link
            to="/auth"
            className="text-foreground underline underline-offset-4 hover:text-brand-amber"
          >
            Sign in to manage your subscription
          </Link>
        </p>
      )}

      <div className="mt-20">
        <FaqSection />
      </div>
    </div>
  );
}
