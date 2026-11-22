import "./lib/error-capture";

import type Stripe from "stripe";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { handleAuthApiRequest } from "./lib/auth-routes.server";
import { executeServerMockDb, type MockRpcAction } from "./lib/mock-supabase";
import {
  findMemberByCustomerId,
  findMemberBySubscriptionId,
  getMemberSubscription,
  getServerStripeEnv,
  getStripeClient,
  getSubscriptionPeriodEndIso,
  mapStripeStatus,
  parsePlanId,
  recordPurchasedProgram,
  setMemberSubscription,
} from "./lib/billing-store.server";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

async function handleStripeWebhook(request: Request): Promise<Response> {
  const stripe = getStripeClient();
  const webhookSecret = getServerStripeEnv("STRIPE_WEBHOOK_SECRET");
  if (!stripe || !webhookSecret) {
    return Response.json(
      {
        error:
          "Stripe webhook is not configured (STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET missing).",
      },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return Response.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid signature";
    return Response.json(
      { error: `Webhook signature verification failed: ${msg}` },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id ?? session.metadata?.["userId"];
      if (userId) {
        const customerId =
          typeof session.customer === "string" ? session.customer : (session.customer?.id ?? null);
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : (session.subscription?.id ?? null);
        const plan = parsePlanId(session.metadata?.["plan"], "basic");
        if (session.mode === "payment") {
          const updated = recordPurchasedProgram(userId, plan);
          if (customerId && !updated.stripeCustomerId) {
            setMemberSubscription({ ...updated, stripeCustomerId: customerId });
          }
        } else {
          const existing = getMemberSubscription(userId);
          setMemberSubscription({
            userId,
            plan,
            status: "active",
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            currentPeriodEnd: null,
            cancelAtPeriodEnd: false,
            purchasedPrograms: existing.purchasedPrograms ?? [],
            updatedAt: new Date().toISOString(),
          });
        }
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      const existing = findMemberBySubscriptionId(sub.id) ?? findMemberByCustomerId(customerId);
      const userId = sub.metadata?.["userId"] ?? existing?.userId;
      if (userId) {
        const existingPlan = existing?.plan && existing.plan !== "free" ? existing.plan : "basic";
        const plan = sub.metadata?.["plan"]
          ? parsePlanId(sub.metadata["plan"], existingPlan)
          : existingPlan;
        setMemberSubscription({
          userId,
          plan: event.type === "customer.subscription.deleted" ? "free" : plan,
          status: mapStripeStatus(sub.status),
          stripeCustomerId: customerId,
          stripeSubscriptionId: sub.id,
          currentPeriodEnd: getSubscriptionPeriodEndIso(sub),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          updatedAt: new Date().toISOString(),
        });
      }
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId =
        typeof invoice.customer === "string" ? invoice.customer : (invoice.customer?.id ?? null);
      if (customerId) {
        const existing = findMemberByCustomerId(customerId);
        if (existing) {
          setMemberSubscription({ ...existing, status: "past_due" });
        }
      }
      break;
    }
    default:
      break;
  }

  return Response.json({ received: true });
}

// Hosting compresses every response at the edge. Never compress a body (gzip, brotli,
// CompressionStream) or set content-encoding here or in a server route: the body gets encoded
// twice and renders garbled.
export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      if (url.pathname.startsWith("/api/auth/")) {
        const authResponse = await handleAuthApiRequest(request);
        if (authResponse) return authResponse;
      }
      if (url.pathname === "/api/stripe/webhook" && request.method === "POST") {
        return await handleStripeWebhook(request);
      }
      if (
        url.pathname === "/api/__mock-supabase" &&
        request.method === "POST" &&
        (!process.env["SUPABASE_URL"] || !process.env["SUPABASE_PUBLISHABLE_KEY"])
      ) {
        const action = (await request.json()) as MockRpcAction;
        return Response.json(executeServerMockDb(action));
      }
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
