import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { EmailOtpType } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

const VALID_OTP_TYPES = new Set<EmailOtpType>([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

export const Route = createFileRoute("/auth_/callback")({
  validateSearch: (
    s: Record<string, unknown>,
  ): {
    code?: string | undefined;
    token_hash?: string | undefined;
    type?: string | undefined;
    error?: string | undefined;
    error_description?: string | undefined;
  } => ({
    code: typeof s["code"] === "string" ? s["code"] : undefined,
    token_hash: typeof s["token_hash"] === "string" ? s["token_hash"] : undefined,
    type: typeof s["type"] === "string" ? s["type"] : undefined,
    error: typeof s["error"] === "string" ? s["error"] : undefined,
    error_description:
      typeof s["error_description"] === "string" ? s["error_description"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Completing Sign-In — Dusk Kinetic Performance" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const {
    code,
    token_hash: tokenHash,
    type,
    error,
    error_description: errorDescription,
  } = Route.useSearch();
  const navigate = useNavigate();
  const [statusMessage, setStatusMessage] = useState("Verifying your session…");

  useEffect(() => {
    let active = true;

    async function completeAuth() {
      const notifyOpener = (payload: Record<string, unknown>): boolean => {
        if (typeof window !== "undefined" && window.opener && !window.opener.closed) {
          window.opener.postMessage(payload, window.location.origin);
          window.close();
          window.setTimeout(() => window.close(), 300);
          return true;
        }
        return false;
      };

      if (error || errorDescription) {
        const msg = errorDescription || error || "Sign-in was canceled or denied.";
        if (!active) return;
        setStatusMessage(msg);
        if (!notifyOpener({ type: "SUPABASE_OAUTH_ERROR", error: msg })) {
          navigate({ to: "/auth", search: { oauth_error: msg }, replace: true });
        }
        return;
      }

      try {
        if (code) {
          // When opened as a popup from an embedded iframe, pass the PKCE code back to the
          // opener so the opener exchanges it inside the same storage partition that holds code_verifier.
          if (notifyOpener({ type: "SUPABASE_OAUTH_CODE", code })) {
            return;
          }

          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError || !data.session) {
            throw new Error(exchangeError?.message ?? "Could not exchange authorization code.");
          }
          if (!active) return;
          navigate({ to: type === "recovery" ? "/reset-password" : "/dashboard", replace: true });
          return;
        }

        if (tokenHash && type && VALID_OTP_TYPES.has(type as EmailOtpType)) {
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as EmailOtpType,
          });
          if (verifyError || !data.session) {
            throw new Error(
              verifyError?.message ?? "Email confirmation link is invalid or expired.",
            );
          }
          if (!active) return;
          navigate({ to: type === "recovery" ? "/reset-password" : "/dashboard", replace: true });
          return;
        }

        // Allow implicit hash fragments (e.g. #access_token=...) a brief tick to settle if present
        if (typeof window !== "undefined" && window.location.hash.includes("access_token=")) {
          await new Promise((resolve) => window.setTimeout(resolve, 150));
        }

        const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr) throw new Error(sessionErr.message);

        if (sessionData.session) {
          if (!active) return;
          if (
            !notifyOpener({
              type: "SUPABASE_OAUTH_SUCCESS",
              access_token: sessionData.session.access_token,
              refresh_token: sessionData.session.refresh_token,
            })
          ) {
            navigate({ to: type === "recovery" ? "/reset-password" : "/dashboard", replace: true });
          }
          return;
        }

        throw new Error("No authorization code or active session was returned.");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to complete authentication.";
        if (!active) return;
        setStatusMessage(msg);
        if (!notifyOpener({ type: "SUPABASE_OAUTH_ERROR", error: msg })) {
          navigate({ to: "/auth", search: { oauth_error: msg }, replace: true });
        }
      }
    }

    void completeAuth();
    return () => {
      active = false;
    };
  }, [code, tokenHash, type, error, errorDescription, navigate]);

  return (
    <div className="grid min-h-[calc(100vh-4rem)] place-items-center px-5 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 text-center">
        <Loader2 className="mx-auto size-7 animate-spin text-brand-amber" aria-hidden="true" />
        <h1 className="text-display mt-4 text-2xl">Completing Sign-In</h1>
        <p className="mt-2 text-sm text-muted-foreground">{statusMessage}</p>
      </div>
    </div>
  );
}
