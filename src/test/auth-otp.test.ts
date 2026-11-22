import { describe, expect, it } from "vitest";

import {
  consumeGoogleOAuthState,
  consumeOneTimeOAuthExchangeCode,
  createGoogleOAuthState,
  createPendingSignupOtp,
  hashPassword,
  issueOneTimeOAuthExchangeCode,
  linkOrCreateGoogleAccountAndSession,
  MAX_OTP_ATTEMPTS,
  refreshPendingSignupOtp,
  rollbackPendingSignupOtp,
  verifyPassword,
  verifySignupOtpAndIssueSession,
} from "@/lib/auth-store.server";
import {
  AUTH_PROVIDERS,
  buildGoogleOAuthCredentials,
  getAppAuthCallbackUrl,
  getSupabaseGoogleCallbackUrl,
  GOOGLE_OAUTH_PROVIDER,
} from "@/lib/auth-providers";

describe("Auth store: OTP verification, rate limiting, and Google OAuth state", () => {
  it("hashes and verifies passwords with scrypt salts", () => {
    const hash = hashPassword("StrongSprintPass123!");
    expect(hash).toContain(":");
    expect(verifyPassword("StrongSprintPass123!", hash)).toBe(true);
    expect(verifyPassword("WrongPass!", hash)).toBe(false);
  });

  it("creates, rejects invalid attempts, resends with cooldown, and verifies a 6-digit OTP", async () => {
    const email = `otp-test-${Date.now()}@example.com`;
    const { code, expiresAt } = createPendingSignupOtp({
      email,
      password: "AthletePassword!9",
      profile: {
        displayName: "Jordan Test",
        sport: "Track & Sprint",
        level: "Intermediate",
        ageGroup: "Young Adult (18–29)",
      },
    });

    expect(code).toMatch(/^\d{6}$/);
    expect(expiresAt).toBeGreaterThan(Date.now());

    // Immediate resend triggers 60s rate limit
    expect(() => refreshPendingSignupOtp(email)).toThrow(/RATE_LIMIT:/);

    // Wrong OTP decrements remaining attempts
    await expect(verifySignupOtpAndIssueSession(email, "000000")).rejects.toThrow(
      new RegExp(`attempts? remaining`),
    );

    // Correct OTP succeeds and auto-issues session
    const session = await verifySignupOtpAndIssueSession(email, code);
    expect(session.access_token.split(".")).toHaveLength(3);
    expect(session.user.email).toBe(email);
    expect(session.user.user_metadata.display_name).toBe("Jordan Test");

    // Reusing consumed OTP fails
    await expect(verifySignupOtpAndIssueSession(email, code)).rejects.toThrow(
      /No pending confirmation/,
    );
  });

  it("locks verification after MAX_OTP_ATTEMPTS failed tries", async () => {
    const email = `otp-lock-${Date.now()}@example.com`;
    const { code } = createPendingSignupOtp({
      email,
      password: "AthletePassword!9",
      profile: {
        displayName: "Lock Test",
        sport: "Basketball",
        level: "Beginner",
        ageGroup: "Teen (13–17)",
      },
    });
    const wrongCode = code === "111111" ? "222222" : "111111";

    for (let i = 0; i < MAX_OTP_ATTEMPTS; i++) {
      await expect(verifySignupOtpAndIssueSession(email, wrongCode)).rejects.toThrow();
    }
    await expect(verifySignupOtpAndIssueSession(email, code)).rejects.toThrow(/Too many invalid/);
    rollbackPendingSignupOtp(email);
  });

  it("creates single-use PKCE OAuth state and exchange codes and links Google accounts", async () => {
    const { state, codeChallenge } = createGoogleOAuthState(
      "https://example.com/api/auth/google/callback",
    );
    expect(state.length).toBeGreaterThan(10);
    expect(codeChallenge.length).toBeGreaterThan(20);

    const consumed = consumeGoogleOAuthState(state);
    expect(consumed?.redirectUri).toBe("https://example.com/api/auth/google/callback");
    expect(consumeGoogleOAuthState(state)).toBeNull();

    const googleEmail = `google-${Date.now()}@example.com`;
    const session = await linkOrCreateGoogleAccountAndSession({
      sub: "google-sub-12345",
      email: googleEmail,
      name: "Sam Runner",
    });

    const exchangeCode = issueOneTimeOAuthExchangeCode(session);
    const exchanged = consumeOneTimeOAuthExchangeCode(exchangeCode);
    expect(exchanged?.user.email).toBe(googleEmail);
    expect(consumeOneTimeOAuthExchangeCode(exchangeCode)).toBeNull();
  });

  it("configures Google OAuth provider and Supabase callback URLs", () => {
    expect(GOOGLE_OAUTH_PROVIDER).toBe("google");
    expect(AUTH_PROVIDERS.google.enabled).toBe(true);
    expect(getSupabaseGoogleCallbackUrl()).toBe(
      "https://akovjzmgpqsislnsokun.supabase.co/auth/v1/callback",
    );
    const appCallback = getAppAuthCallbackUrl("https://example.com");
    expect(appCallback).toBe("https://example.com/auth/callback");

    const creds = buildGoogleOAuthCredentials(appCallback);
    expect(creds.provider).toBe("google");
    expect(creds.options?.redirectTo).toBe("https://example.com/auth/callback");
    expect(creds.options?.skipBrowserRedirect).toBe(true);
    expect(creds.options?.scopes).toContain("email");
  });
});
