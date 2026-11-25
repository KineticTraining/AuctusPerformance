import { z } from "zod";

import {
  authenticateUserWithPassword,
  consumeGoogleOAuthState,
  consumeOneTimeOAuthExchangeCode,
  createGoogleOAuthState,
  createPendingSignupOtp,
  isEmailAlreadyRegistered,
  isSupabaseAdminConfigured,
  issueOneTimeOAuthExchangeCode,
  linkOrCreateGoogleAccountAndSession,
  refreshPendingSignupOtp,
  resetLocalPasswordIfPresent,
  rollbackPendingSignupOtp,
  verifySignupOtpAndIssueSession,
} from "./auth-store.server";
import { getSupabaseGoogleCallbackUrl } from "./auth-providers";
import { readEnvFallback } from "./billing-store.server";
import {
  getEmailProviderName,
  isEmailDeliveryConfigured,
  sendVerificationCodeEmail,
} from "./email.server";
import { AGE_GROUPS, EXPERIENCE_LEVELS, SPORTS } from "./sports";

const startSignupSchema = z.object({
  displayName: z.string().trim().min(1, "Enter your full name").max(80),
  sport: z.string().trim().min(1, "Pick your primary sport").max(60),
  level: z.string().trim().min(1, "Pick your experience level").max(40),
  ageGroup: z.string().trim().min(1, "Pick your age group").max(60),
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

const verifyOtpSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit confirmation code"),
});

const resendOtpSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
});

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(1, "Enter your password").max(72),
});

const resetPasswordSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(72),
});

const exchangeSchema = z.object({
  code: z.string().trim().min(10).max(200),
});

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isAllowedOrigin(origin: string, request: Request): boolean {
  try {
    const parsed = new URL(origin);
    const reqUrl = new URL(request.url);
    const forwardedHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    if (parsed.host === reqUrl.host || (forwardedHost && parsed.host === forwardedHost)) {
      return true;
    }
    const appUrl = readEnvFallback("APP_URL");
    if (appUrl && parsed.origin === new URL(appUrl).origin) return true;
    if (parsed.hostname.endsWith(".run.app") && parsed.protocol === "https:") return true;
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") return true;
  } catch {
    return false;
  }
  return false;
}

function checkSameOriginPost(request: Request): Response | null {
  const origin = request.headers.get("origin");
  if (origin && !isAllowedOrigin(origin, request)) {
    return Response.json({ error: "Cross-origin request rejected." }, { status: 403 });
  }
  return null;
}

function resolveGoogleRedirectUri(request: Request, requestedRedirectUri: string | null): string {
  const explicit = readEnvFallback("GOOGLE_REDIRECT_URI");
  if (explicit) return explicit.replace(/\/+$/, "");

  if (requestedRedirectUri) {
    try {
      const parsed = new URL(requestedRedirectUri);
      if (
        parsed.pathname === "/api/auth/google/callback" &&
        isAllowedOrigin(parsed.origin, request)
      ) {
        return `${parsed.origin}/api/auth/google/callback`;
      }
    } catch {
      // Fall through to APP_URL / request host
    }
  }

  const appUrl = readEnvFallback("APP_URL");
  if (appUrl) {
    return `${appUrl.replace(/\/+$/, "")}/api/auth/google/callback`;
  }

  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "localhost:3000";
  return `${proto}://${host}/api/auth/google/callback`;
}

function renderPopupCallbackHtml(
  payload: Record<string, unknown>,
  fallbackRedirect: string,
  heading: string,
  body: string,
): Response {
  const serialized = JSON.stringify(payload).replace(/</g, "\\u003c");
  const safeRedirect = JSON.stringify(fallbackRedirect).replace(/</g, "\\u003c");
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(heading)} — Auctus Performance</title>
    <style>
      body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0a0b0f;color:#f4f4f6;font-family:system-ui,-apple-system,sans-serif;padding:24px;text-align:center}
      .card{max-width:380px;background:#12141c;border:1px solid #262936;border-radius:16px;padding:28px}
      h1{margin:0 0 8px;font-size:20px;font-weight:600}
      p{margin:0;font-size:14px;line-height:1.5;color:#a2a7b8}
    </style>
  </head>
  <body>
    <div class="card">
      <h1>${escapeHtml(heading)}</h1>
      <p>${escapeHtml(body)}</p>
    </div>
    <script>
      (function () {
        var data = ${serialized};
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(data, "*");
          window.close();
          setTimeout(function () { window.close(); }, 300);
        } else {
          window.location.replace(${safeRedirect});
        }
      })();
    </script>
  </body>
</html>`;
  return new Response(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function buildSessionCookieHeader(token: string, request: Request): string {
  const url = new URL(request.url);
  const proto = request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  const isHttps = proto === "https";
  const maxAge = 60 * 60 * 24 * 7;
  if (isHttps) {
    return `dk_session=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=None; Partitioned`;
  }
  return `dk_session=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax`;
}

let cachedSupabaseGoogleCheck: { enabled: boolean; checkedAt: number } | null = null;

async function checkSupabaseGoogleEnabled(): Promise<boolean> {
  const supabaseUrl = process.env["SUPABASE_URL"]?.replace(/\/+$/, "");
  const publishableKey = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!supabaseUrl || !publishableKey) return false;

  const now = Date.now();
  if (cachedSupabaseGoogleCheck?.enabled && now - cachedSupabaseGoogleCheck.checkedAt < 20_000) {
    return true;
  }

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: { apikey: publishableKey },
    });
    if (!res.ok) return false;
    const settings = (await res.json()) as { external?: Record<string, boolean> };
    const enabled = Boolean(settings.external?.["google"]);
    cachedSupabaseGoogleCheck = enabled ? { enabled: true, checkedAt: now } : null;
    return enabled;
  } catch {
    return false;
  }
}

export async function handleAuthApiRequest(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  const path = url.pathname;
  if (!path.startsWith("/api/auth/")) return null;

  if (path === "/api/auth/config-status" && request.method === "GET") {
    const directGoogleConfigured = Boolean(
      readEnvFallback("GOOGLE_CLIENT_ID") && readEnvFallback("GOOGLE_CLIENT_SECRET"),
    );
    const supabaseConfigured = isSupabaseAdminConfigured();
    const supabaseGoogleEnabled = supabaseConfigured ? await checkSupabaseGoogleEnabled() : false;

    return Response.json({
      googleConfigured: directGoogleConfigured,
      supabaseGoogleEnabled,
      emailConfigured: isEmailDeliveryConfigured(),
      emailProvider: getEmailProviderName(),
      supabaseConfigured,
      supabaseGoogleCallbackUrl: getSupabaseGoogleCallbackUrl(process.env["SUPABASE_URL"]),
      supportedSports: SPORTS,
      supportedLevels: EXPERIENCE_LEVELS,
      supportedAgeGroups: AGE_GROUPS,
    });
  }

  if (path === "/api/auth/google/url" && request.method === "GET") {
    const clientId = readEnvFallback("GOOGLE_CLIENT_ID");
    const clientSecret = readEnvFallback("GOOGLE_CLIENT_SECRET");
    if (!clientId || !clientSecret) {
      if (isSupabaseAdminConfigured()) {
        const supabaseGoogleEnabled = await checkSupabaseGoogleEnabled();
        const callbackUrl = getSupabaseGoogleCallbackUrl(process.env["SUPABASE_URL"]);
        if (supabaseGoogleEnabled) {
          return Response.json({
            mode: "supabase",
            supabaseGoogleEnabled: true,
            callbackUrl,
          });
        }
        return Response.json(
          {
            error:
              "Google sign-in is disabled in the connected Supabase project. Enable Google in Supabase Dashboard (Authentication → Providers → Google) with callback URL " +
              callbackUrl +
              " — or set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.",
            code: "GOOGLE_PROVIDER_NOT_ENABLED",
            supabaseCallbackUrl: callbackUrl,
          },
          { status: 503 },
        );
      }

      return Response.json(
        {
          error:
            "Google OAuth is not configured yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file.",
          code: "GOOGLE_OAUTH_NOT_CONFIGURED",
        },
        { status: 503 },
      );
    }

    const redirectUri = resolveGoogleRedirectUri(request, url.searchParams.get("redirect_uri"));
    const { state, codeChallenge } = createGoogleOAuthState(redirectUri);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      access_type: "offline",
      prompt: "select_account",
    });

    return Response.json({
      mode: "direct",
      url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
      redirectUri,
    });
  }

  if (
    (path === "/api/auth/google/callback" || path === "/api/auth/google/callback/") &&
    request.method === "GET"
  ) {
    const oauthError = url.searchParams.get("error");
    if (oauthError) {
      return renderPopupCallbackHtml(
        { type: "GOOGLE_OAUTH_ERROR", error: "Google sign-in was canceled or denied." },
        "/auth?oauth_error=canceled",
        "Sign-in canceled",
        "You can close this window and return to Auctus Performance.",
      );
    }

    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    if (!code || !state) {
      return renderPopupCallbackHtml(
        { type: "GOOGLE_OAUTH_ERROR", error: "Missing OAuth authorization code or state." },
        "/auth?oauth_error=missing_params",
        "Authentication error",
        "Missing authorization details. Please try signing in with Google again.",
      );
    }

    const authReq = consumeGoogleOAuthState(state);
    if (!authReq) {
      return renderPopupCallbackHtml(
        { type: "GOOGLE_OAUTH_ERROR", error: "OAuth session expired or invalid. Please retry." },
        "/auth?oauth_error=expired_state",
        "Session expired",
        "Your Google sign-in request expired. Please close this window and try again.",
      );
    }

    const clientId = readEnvFallback("GOOGLE_CLIENT_ID");
    const clientSecret = readEnvFallback("GOOGLE_CLIENT_SECRET");
    if (!clientId || !clientSecret) {
      return renderPopupCallbackHtml(
        { type: "GOOGLE_OAUTH_ERROR", error: "Google OAuth server credentials missing." },
        "/auth?oauth_error=not_configured",
        "Configuration needed",
        "Google OAuth credentials are not configured on the server.",
      );
    }

    try {
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: authReq.redirectUri,
          grant_type: "authorization_code",
          code_verifier: authReq.codeVerifier,
        }),
      });

      if (!tokenRes.ok) {
        const detail = await tokenRes.text().catch(() => "");
        throw new Error(
          `Google token exchange failed (${tokenRes.status}): ${detail.slice(0, 120)}`,
        );
      }

      const tokenJson = (await tokenRes.json()) as { access_token?: string };
      if (!tokenJson.access_token) {
        throw new Error("Google did not return an access token.");
      }

      const userRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
        headers: { Authorization: `Bearer ${tokenJson.access_token}` },
      });
      if (!userRes.ok) {
        throw new Error(`Failed to load Google profile (${userRes.status}).`);
      }

      const profile = (await userRes.json()) as {
        sub?: string;
        email?: string;
        email_verified?: boolean;
        name?: string;
        picture?: string;
      };

      if (!profile.sub || !profile.email || profile.email_verified === false) {
        throw new Error("A verified Google email address is required to sign in.");
      }

      const session = await linkOrCreateGoogleAccountAndSession({
        sub: profile.sub,
        email: profile.email,
        ...(profile.name ? { name: profile.name } : {}),
        ...(profile.picture ? { picture: profile.picture } : {}),
      });

      const exchangeCode = issueOneTimeOAuthExchangeCode(session);
      return renderPopupCallbackHtml(
        { type: "GOOGLE_OAUTH_SUCCESS", code: exchangeCode },
        `/auth?oauth_code=${encodeURIComponent(exchangeCode)}`,
        "Google account connected",
        "Completing sign-in and returning you to Auctus Performance...",
      );
    } catch (err) {
      console.error("[Google OAuth Callback Error]", err);
      const msg = err instanceof Error ? err.message : "Google sign-in failed.";
      return renderPopupCallbackHtml(
        { type: "GOOGLE_OAUTH_ERROR", error: msg },
        `/auth?oauth_error=${encodeURIComponent(msg)}`,
        "Sign-in failed",
        msg,
      );
    }
  }

  if (path === "/api/auth/google/exchange" && request.method === "POST") {
    const csrfErr = checkSameOriginPost(request);
    if (csrfErr) return csrfErr;
    try {
      const body = exchangeSchema.parse(await request.json());
      const session = consumeOneTimeOAuthExchangeCode(body.code);
      if (!session) {
        return Response.json(
          { error: "OAuth code is invalid or expired. Please try signing in again." },
          { status: 400 },
        );
      }
      return Response.json(session, {
        status: 200,
        headers: {
          "set-cookie": buildSessionCookieHeader(session.access_token, request),
          "cache-control": "no-store",
        },
      });
    } catch (err) {
      const msg = err instanceof z.ZodError ? err.issues[0]?.message : "Invalid exchange code.";
      return Response.json({ error: msg }, { status: 400 });
    }
  }

  if (path === "/api/auth/signup/start" && request.method === "POST") {
    const csrfErr = checkSameOriginPost(request);
    if (csrfErr) return csrfErr;
    try {
      const body = startSignupSchema.parse(await request.json());
      if (!isEmailDeliveryConfigured()) {
        return Response.json(
          {
            error:
              "Email verification delivery is not configured yet. Add RESEND_API_KEY or SMTP_HOST/SMTP_USER/SMTP_PASS to your .env file.",
            code: "EMAIL_PROVIDER_NOT_CONFIGURED",
          },
          { status: 503 },
        );
      }

      if (await isEmailAlreadyRegistered(body.email)) {
        return Response.json(
          { error: "An account with this email already exists. Please sign in instead." },
          { status: 409 },
        );
      }

      const { code } = createPendingSignupOtp({
        email: body.email,
        password: body.password,
        profile: {
          displayName: body.displayName,
          sport: body.sport,
          level: body.level,
          ageGroup: body.ageGroup,
        },
      });

      try {
        const sent = await sendVerificationCodeEmail({
          to: body.email.trim().toLowerCase(),
          name: body.displayName,
          code,
          expiresMinutes: 10,
        });
        return Response.json({
          ok: true,
          email: body.email.trim().toLowerCase(),
          expiresInSeconds: 600,
          resendCooldownSeconds: 60,
          provider: sent.provider,
        });
      } catch (mailErr) {
        rollbackPendingSignupOtp(body.email);
        const msg =
          mailErr instanceof Error ? mailErr.message : "Could not send confirmation email.";
        return Response.json({ error: msg }, { status: 502 });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        return Response.json(
          { error: err.issues[0]?.message ?? "Invalid signup details." },
          { status: 400 },
        );
      }
      const msg = err instanceof Error ? err.message : "Could not start signup verification.";
      return Response.json({ error: msg }, { status: 400 });
    }
  }

  if (path === "/api/auth/signup/verify" && request.method === "POST") {
    const csrfErr = checkSameOriginPost(request);
    if (csrfErr) return csrfErr;
    try {
      const body = verifyOtpSchema.parse(await request.json());
      const session = await verifySignupOtpAndIssueSession(body.email, body.code);
      return Response.json(session, {
        status: 200,
        headers: {
          "set-cookie": buildSessionCookieHeader(session.access_token, request),
          "cache-control": "no-store",
        },
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return Response.json(
          { error: err.issues[0]?.message ?? "Enter your 6-digit code." },
          { status: 400 },
        );
      }
      const msg = err instanceof Error ? err.message : "Could not verify code.";
      return Response.json({ error: msg }, { status: 400 });
    }
  }

  if (path === "/api/auth/signup/resend" && request.method === "POST") {
    const csrfErr = checkSameOriginPost(request);
    if (csrfErr) return csrfErr;
    try {
      const body = resendOtpSchema.parse(await request.json());
      if (!isEmailDeliveryConfigured()) {
        return Response.json(
          { error: "Email delivery is not configured on the server." },
          { status: 503 },
        );
      }

      const refreshed = refreshPendingSignupOtp(body.email);
      await sendVerificationCodeEmail({
        to: body.email.trim().toLowerCase(),
        name: refreshed.displayName,
        code: refreshed.code,
        expiresMinutes: 10,
      });

      return Response.json({
        ok: true,
        resendCooldownSeconds: 60,
        expiresInSeconds: 600,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return Response.json(
          { error: err.issues[0]?.message ?? "Invalid email address." },
          { status: 400 },
        );
      }
      const msg = err instanceof Error ? err.message : "Could not resend confirmation code.";
      if (msg.startsWith("RATE_LIMIT:")) {
        const parts = msg.split(":");
        const retryAfter = Number(parts[1] ?? "60");
        const cleanMsg = parts.slice(2).join(":");
        return Response.json({ error: cleanMsg, retryAfterSeconds: retryAfter }, { status: 429 });
      }
      return Response.json({ error: msg }, { status: 400 });
    }
  }

  if (path === "/api/auth/login" && request.method === "POST") {
    const csrfErr = checkSameOriginPost(request);
    if (csrfErr) return csrfErr;
    try {
      const body = loginSchema.parse(await request.json());
      const session = await authenticateUserWithPassword(body.email, body.password);
      return Response.json(session, {
        status: 200,
        headers: {
          "set-cookie": buildSessionCookieHeader(session.access_token, request),
          "cache-control": "no-store",
        },
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return Response.json(
          { error: err.issues[0]?.message ?? "Invalid login details." },
          { status: 400 },
        );
      }
      const msg = err instanceof Error ? err.message : "Invalid login credentials";
      return Response.json({ error: msg }, { status: 401 });
    }
  }

  if (path === "/api/auth/reset-password" && request.method === "POST") {
    const csrfErr = checkSameOriginPost(request);
    if (csrfErr) return csrfErr;
    try {
      const body = resetPasswordSchema.parse(await request.json());
      const updated = resetLocalPasswordIfPresent(body.email, body.password);
      return Response.json({ ok: true, updated });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not update password.";
      return Response.json({ error: msg }, { status: 400 });
    }
  }

  if (path === "/api/auth/logout" && request.method === "POST") {
    const csrfErr = checkSameOriginPost(request);
    if (csrfErr) return csrfErr;
    return Response.json(
      { ok: true },
      {
        status: 200,
        headers: {
          "set-cookie": "dk_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax",
        },
      },
    );
  }

  return null;
}
