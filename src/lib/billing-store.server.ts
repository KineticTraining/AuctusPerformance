import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import Stripe from "stripe";
import type { MembershipPlanId, PlanId } from "./plans";

export type MembershipPlan = MembershipPlanId;
export type MembershipStatus = "inactive" | "active" | "trialing" | "past_due" | "canceled";

export type MemberSubscription = {
  userId: string;
  plan: MembershipPlanId;
  status: MembershipStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  purchasedPrograms?: string[];
  updatedAt: string;
};

const STORE_KEY = "__kinetic_billing_store__";
const g = globalThis as unknown as Record<string, Map<string, MemberSubscription> | undefined>;
if (!g[STORE_KEY]) {
  g[STORE_KEY] = new Map<string, MemberSubscription>();
}
const billingStore = g[STORE_KEY]!;

export function readEnvFallback(name: string): string | undefined {
  const direct = process.env[name]?.trim();
  if (direct) return direct;
  for (const file of [".env.local", ".env"]) {
    try {
      const fullPath = resolve(process.cwd(), file);
      if (!existsSync(fullPath)) continue;
      const lines = readFileSync(fullPath, "utf8").split(/\r?\n/);
      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#")) continue;
        const eq = line.indexOf("=");
        if (eq <= 0) continue;
        const k = line.slice(0, eq).trim();
        if (k !== name) continue;
        let v = line.slice(eq + 1).trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
          v = v.slice(1, -1);
        }
        if (v) return v;
      }
    } catch {
      // Ignore unreadable env files
    }
  }
  return undefined;
}

export function getServerStripeEnv(name: string): string | undefined {
  return readEnvFallback(name);
}

export function getMemberSubscription(userId: string): MemberSubscription {
  return (
    billingStore.get(userId) ?? {
      userId,
      plan: "free",
      status: "inactive",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      purchasedPrograms: [],
      updatedAt: new Date().toISOString(),
    }
  );
}

export function setMemberSubscription(sub: MemberSubscription): MemberSubscription {
  const next: MemberSubscription = {
    ...sub,
    purchasedPrograms: sub.purchasedPrograms ?? [],
    updatedAt: new Date().toISOString(),
  };
  billingStore.set(sub.userId, next);
  return next;
}

export function recordPurchasedProgram(userId: string, programId: string): MemberSubscription {
  const existing = getMemberSubscription(userId);
  const nextPrograms = Array.from(new Set([...(existing.purchasedPrograms ?? []), programId]));
  return setMemberSubscription({
    ...existing,
    purchasedPrograms: nextPrograms,
  });
}

export function findMemberByCustomerId(customerId: string): MemberSubscription | undefined {
  for (const sub of billingStore.values()) {
    if (sub.stripeCustomerId === customerId) return sub;
  }
  return undefined;
}

export function findMemberBySubscriptionId(subscriptionId: string): MemberSubscription | undefined {
  for (const sub of billingStore.values()) {
    if (sub.stripeSubscriptionId === subscriptionId) return sub;
  }
  return undefined;
}

let cachedStripe: Stripe | null = null;
let cachedKey: string | undefined;

export function getStripeClient(): Stripe | null {
  const key = readEnvFallback("STRIPE_SECRET_KEY");
  if (!key) return null;
  if (!cachedStripe || cachedKey !== key) {
    cachedStripe = new Stripe(key);
    cachedKey = key;
  }
  return cachedStripe;
}

export function isStripeConfigured(): boolean {
  return Boolean(readEnvFallback("STRIPE_SECRET_KEY"));
}

export function getStripeKeyMode(): "test" | "live" | "none" {
  const key = readEnvFallback("STRIPE_SECRET_KEY");
  if (!key) return "none";
  if (key.startsWith("sk_live_") || key.startsWith("rk_live_")) return "live";
  return "test";
}

export function parsePlanId(raw: unknown, fallback: PlanId = "basic"): PlanId {
  if (
    raw === "basic" ||
    raw === "pro" ||
    raw === "unlimited_monthly" ||
    raw === "unlimited_annual" ||
    raw === "macro_blueprint" ||
    raw === "nutrition_coaching" ||
    raw === "program_8week"
  ) {
    return raw;
  }
  if (raw === "annual") return "unlimited_annual";
  if (raw === "monthly") return "pro";
  return fallback;
}

export function mapStripeStatus(status: Stripe.Subscription.Status): MembershipStatus {
  switch (status) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
    case "incomplete_expired":
      return "canceled";
    default:
      return "inactive";
  }
}

export function getSubscriptionPeriodEndIso(subscription: Stripe.Subscription): string | null {
  const itemEnd = subscription.items.data[0]?.current_period_end;
  if (typeof itemEnd === "number") {
    return new Date(itemEnd * 1000).toISOString();
  }
  return null;
}
