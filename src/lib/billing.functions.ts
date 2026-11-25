import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import type Stripe from "stripe";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  ALL_PLANS,
  getTierById,
  type MembershipPlanId,
  type PlanId,
  type PlanInterval,
  type PricingTier,
} from "./plans";

export type CatalogPlan = PricingTier & {
  stripePriceId: string | null;
  currency: string;
};

export type PricingCatalogResponse = {
  configured: boolean;
  keyMode: "test" | "live" | "none";
  webhookConfigured: boolean;
  plans: CatalogPlan[];
  nutritionPackages: CatalogPlan[];
};

export type BillingStatusResponse = {
  configured: boolean;
  keyMode: "test" | "live" | "none";
  webhookConfigured: boolean;
  plan: MembershipPlanId;
  status: "inactive" | "active" | "trialing" | "past_due" | "canceled";
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  hasCustomer: boolean;
  purchasedPrograms: string[];
};

const planIdSchema = z.enum([
  "basic",
  "pro",
  "unlimited_monthly",
  "unlimited_annual",
  "macro_blueprint",
  "nutrition_coaching",
  "program_8week",
]);

function resolveRequestOrigin(): string {
  const req = getRequest();
  const origin = req?.headers.get("origin");
  if (origin) return origin.replace(/\/+$/, "");
  const proto = req?.headers.get("x-forwarded-proto") ?? "http";
  const host = req?.headers.get("x-forwarded-host") ?? req?.headers.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

function formatUsdFromCents(
  cents: number,
  interval: PlanInterval,
  defaultCadence: string,
): { priceDisplay: string; cadenceLabel: string } {
  const dollars = cents / 100;
  const formatted = Number.isInteger(dollars)
    ? `$${dollars.toLocaleString("en-US")}`
    : `$${dollars.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return {
    priceDisplay: formatted,
    cadenceLabel:
      interval === "one_time"
        ? defaultCadence
        : interval === "year"
          ? "per year · Save $200"
          : "per month",
  };
}

const PRICE_CACHE_TTL_MS = 60_000;
let cachedPrices: { key: string; expiresAt: number; data: Stripe.Price[] } | null = null;

export const getPricingCatalog = createServerFn({ method: "GET" }).handler(
  async (): Promise<PricingCatalogResponse> => {
    const { getServerStripeEnv, getStripeClient, getStripeKeyMode, isStripeConfigured } =
      await import("./billing-store.server");
    const configured = isStripeConfigured();
    const keyMode = getStripeKeyMode();
    const webhookConfigured = Boolean(getServerStripeEnv("STRIPE_WEBHOOK_SECRET"));
    const stripe = getStripeClient();

    const envPriceIds: Record<PlanId, string | undefined> = {
      basic: getServerStripeEnv("STRIPE_PRICE_ID_BASIC"),
      pro: getServerStripeEnv("STRIPE_PRICE_ID_PRO"),
      unlimited_monthly: getServerStripeEnv("STRIPE_PRICE_ID_UNLIMITED_MONTHLY"),
      unlimited_annual: getServerStripeEnv("STRIPE_PRICE_ID_ANNUAL"),
      macro_blueprint: getServerStripeEnv("STRIPE_PRICE_ID_MACRO_BLUEPRINT"),
      nutrition_coaching: getServerStripeEnv("STRIPE_PRICE_ID_NUTRITION_COACHING"),
      program_8week: getServerStripeEnv("STRIPE_PRICE_ID_PROGRAM_8WEEK"),
    };

    let stripePrices: Stripe.Price[] = [];
    if (stripe) {
      const secretKey = getServerStripeEnv("STRIPE_SECRET_KEY") ?? "";
      if (cachedPrices && cachedPrices.key === secretKey && Date.now() < cachedPrices.expiresAt) {
        stripePrices = cachedPrices.data;
      } else {
        try {
          const res = await stripe.prices.list({ active: true, limit: 40 });
          stripePrices = res.data;
          cachedPrices = {
            key: secretKey,
            expiresAt: Date.now() + PRICE_CACHE_TTL_MS,
            data: stripePrices,
          };
        } catch {
          stripePrices = [];
        }
      }
    }

    const mappedAll: CatalogPlan[] = ALL_PLANS.map((tier) => {
      const explicitId = envPriceIds[tier.id];
      const matched =
        (explicitId ? stripePrices.find((p) => p.id === explicitId) : undefined) ??
        stripePrices.find(
          (p) =>
            p.metadata?.["plan"] === tier.id ||
            (p.unit_amount === tier.amountCents &&
              ((tier.interval === "one_time" && !p.recurring) ||
                p.recurring?.interval === tier.interval)),
        );

      const unitAmount = matched?.unit_amount ?? tier.amountCents;
      const rawInterval = matched?.recurring?.interval;
      const interval: PlanInterval = matched
        ? rawInterval === "year"
          ? "year"
          : rawInterval === "month"
            ? "month"
            : "one_time"
        : tier.interval;
      const formatted = matched?.unit_amount
        ? formatUsdFromCents(unitAmount, interval, tier.cadenceLabel)
        : null;

      return {
        ...tier,
        amountCents: unitAmount,
        priceDisplay: formatted?.priceDisplay ?? tier.priceDisplay,
        cadenceLabel: formatted?.cadenceLabel ?? tier.cadenceLabel,
        interval,
        stripePriceId: matched?.id ?? explicitId ?? null,
        currency: matched?.currency ?? "usd",
      };
    });

    return {
      configured,
      keyMode,
      webhookConfigured,
      plans: mappedAll.filter((p) => p.kind === "membership"),
      nutritionPackages: mappedAll.filter((p) => p.kind === "nutrition_program"),
    };
  },
);

export const pricingCatalogQuery = () =>
  queryOptions({
    queryKey: ["stripe-pricing-catalog"],
    queryFn: () => getPricingCatalog(),
  });

export const getBillingStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<BillingStatusResponse> => {
    const { getMemberSubscription, getServerStripeEnv, getStripeKeyMode, isStripeConfigured } =
      await import("./billing-store.server");
    const sub = getMemberSubscription(context.userId);
    return {
      configured: isStripeConfigured(),
      keyMode: getStripeKeyMode(),
      webhookConfigured: Boolean(getServerStripeEnv("STRIPE_WEBHOOK_SECRET")),
      plan: sub.plan,
      status: sub.status,
      currentPeriodEnd: sub.currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      hasCustomer: Boolean(sub.stripeCustomerId),
      purchasedPrograms: sub.purchasedPrograms ?? [],
    };
  });

export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { plan: PlanId; returnPath?: "/pricing" | "/membership" | "/nutrition" }) =>
      z
        .object({
          plan: planIdSchema,
          returnPath: z.enum(["/pricing", "/membership", "/nutrition"]).optional(),
        })
        .parse(input),
  )
  .handler(async ({ data, context }): Promise<{ url: string }> => {
    const { getMemberSubscription, getServerStripeEnv, getStripeClient } =
      await import("./billing-store.server");
    const stripe = getStripeClient();
    if (!stripe) {
      throw new Error(
        "Stripe is not configured yet. Add STRIPE_SECRET_KEY to your server environment.",
      );
    }

    const tier = getTierById(data.plan);
    if (!tier) {
      throw new Error("Unknown plan or package.");
    }

    const origin = resolveRequestOrigin();
    const existing = getMemberSubscription(context.userId);
    const returnPath =
      data.returnPath ?? (tier.kind === "nutrition_program" ? "/nutrition" : "/pricing");

    const envPriceMap: Record<PlanId, string | undefined> = {
      basic: getServerStripeEnv("STRIPE_PRICE_ID_BASIC"),
      pro: getServerStripeEnv("STRIPE_PRICE_ID_PRO"),
      unlimited_monthly: getServerStripeEnv("STRIPE_PRICE_ID_UNLIMITED_MONTHLY"),
      unlimited_annual: getServerStripeEnv("STRIPE_PRICE_ID_ANNUAL"),
      macro_blueprint: getServerStripeEnv("STRIPE_PRICE_ID_MACRO_BLUEPRINT"),
      nutrition_coaching: getServerStripeEnv("STRIPE_PRICE_ID_NUTRITION_COACHING"),
      program_8week: getServerStripeEnv("STRIPE_PRICE_ID_PROGRAM_8WEEK"),
    };
    const configuredPriceId = envPriceMap[data.plan];
    const isOneTime = tier.interval === "one_time";

    const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = configuredPriceId
      ? { price: configuredPriceId, quantity: 1 }
      : {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Auctus Performance · ${tier.name}`,
              description: tier.features.slice(0, 2).join(" · "),
            },
            unit_amount: tier.amountCents,
            ...(isOneTime
              ? {}
              : {
                  recurring: {
                    interval: tier.interval === "year" ? "year" : "month",
                  },
                }),
          },
          quantity: 1,
        };

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: isOneTime ? "payment" : "subscription",
      line_items: [lineItem],
      client_reference_id: context.userId,
      metadata: {
        userId: context.userId,
        plan: data.plan,
        kind: tier.kind,
      },
      ...(isOneTime
        ? {
            payment_intent_data: {
              metadata: {
                userId: context.userId,
                plan: data.plan,
                kind: tier.kind,
              },
            },
          }
        : {
            subscription_data: {
              metadata: {
                userId: context.userId,
                plan: data.plan,
                kind: tier.kind,
              },
            },
          }),
      success_url: `${origin}${returnPath}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${returnPath}?canceled=1`,
      ...(existing.stripeCustomerId
        ? { customer: existing.stripeCustomerId }
        : context.claims.email
          ? { customer_email: context.claims.email }
          : {}),
    };

    const session = await stripe.checkout.sessions.create(sessionParams);
    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }
    return { url: session.url };
  });

export const verifyCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { sessionId: string }) =>
    z.object({ sessionId: z.string().min(1).max(200) }).parse(input),
  )
  .handler(async ({ data, context }): Promise<BillingStatusResponse> => {
    const {
      getMemberSubscription,
      getServerStripeEnv,
      getStripeClient,
      getStripeKeyMode,
      getSubscriptionPeriodEndIso,
      isStripeConfigured,
      mapStripeStatus,
      parsePlanId,
      recordPurchasedProgram,
      setMemberSubscription,
    } = await import("./billing-store.server");
    const stripe = getStripeClient();
    if (!stripe) {
      throw new Error("Stripe is not configured.");
    }

    const session = await stripe.checkout.sessions.retrieve(data.sessionId, {
      expand: ["subscription"],
    });

    const ownerId = session.client_reference_id ?? session.metadata?.["userId"];
    if (ownerId && ownerId !== context.userId) {
      throw new Error("This checkout session belongs to a different account.");
    }

    const customerId =
      typeof session.customer === "string" ? session.customer : (session.customer?.id ?? null);
    const expandedSub =
      session.subscription && typeof session.subscription !== "string"
        ? session.subscription
        : null;
    const subscriptionId =
      typeof session.subscription === "string" ? session.subscription : (expandedSub?.id ?? null);

    const plan = parsePlanId(session.metadata?.["plan"], "basic");
    const tier = getTierById(plan);

    if (session.payment_status === "paid" || session.status === "complete") {
      if (tier?.interval === "one_time") {
        const current = recordPurchasedProgram(context.userId, plan);
        const updated = setMemberSubscription({
          ...current,
          stripeCustomerId: customerId ?? current.stripeCustomerId,
        });
        return {
          configured: isStripeConfigured(),
          keyMode: getStripeKeyMode(),
          webhookConfigured: Boolean(getServerStripeEnv("STRIPE_WEBHOOK_SECRET")),
          plan: updated.plan,
          status: updated.status,
          currentPeriodEnd: updated.currentPeriodEnd,
          cancelAtPeriodEnd: updated.cancelAtPeriodEnd,
          hasCustomer: Boolean(updated.stripeCustomerId),
          purchasedPrograms: updated.purchasedPrograms ?? [],
        };
      }

      const existing = getMemberSubscription(context.userId);
      const saved = setMemberSubscription({
        userId: context.userId,
        plan,
        status: expandedSub ? mapStripeStatus(expandedSub.status) : "active",
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        currentPeriodEnd: expandedSub ? getSubscriptionPeriodEndIso(expandedSub) : null,
        cancelAtPeriodEnd: expandedSub?.cancel_at_period_end ?? false,
        purchasedPrograms: existing.purchasedPrograms ?? [],
        updatedAt: new Date().toISOString(),
      });
      return {
        configured: isStripeConfigured(),
        keyMode: getStripeKeyMode(),
        webhookConfigured: Boolean(getServerStripeEnv("STRIPE_WEBHOOK_SECRET")),
        plan: saved.plan,
        status: saved.status,
        currentPeriodEnd: saved.currentPeriodEnd,
        cancelAtPeriodEnd: saved.cancelAtPeriodEnd,
        hasCustomer: Boolean(saved.stripeCustomerId),
        purchasedPrograms: saved.purchasedPrograms ?? [],
      };
    }

    const current = getMemberSubscription(context.userId);
    return {
      configured: isStripeConfigured(),
      keyMode: getStripeKeyMode(),
      webhookConfigured: Boolean(getServerStripeEnv("STRIPE_WEBHOOK_SECRET")),
      plan: current.plan,
      status: current.status,
      currentPeriodEnd: current.currentPeriodEnd,
      cancelAtPeriodEnd: current.cancelAtPeriodEnd,
      hasCustomer: Boolean(current.stripeCustomerId),
      purchasedPrograms: current.purchasedPrograms ?? [],
    };
  });

export const createBillingPortalSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ url: string }> => {
    const { getMemberSubscription, getStripeClient } = await import("./billing-store.server");
    const stripe = getStripeClient();
    if (!stripe) {
      throw new Error("Stripe is not configured.");
    }

    const sub = getMemberSubscription(context.userId);
    if (!sub.stripeCustomerId) {
      throw new Error("No Stripe customer record found for this account yet.");
    }

    const origin = resolveRequestOrigin();
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${origin}/membership`,
    });
    return { url: portalSession.url };
  });
