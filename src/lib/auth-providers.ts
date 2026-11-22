import type { Provider, SignInWithOAuthCredentials } from "@supabase/supabase-js";
import type { OAuthProvider } from "@lovable.dev/cloud-auth-js";

export const SUPABASE_PROJECT_REF = "akovjzmgpqsislnsokun";
export const GOOGLE_OAUTH_PROVIDER: Provider = "google";
export const LOVABLE_GOOGLE_PROVIDER: OAuthProvider = "google";
export const GOOGLE_OAUTH_SCOPES = "openid email profile";

export type AuthProviderConfig = {
  id: Provider;
  label: string;
  enabled: boolean;
  scopes: string;
};

export const AUTH_PROVIDERS: Record<"google", AuthProviderConfig> = {
  google: {
    id: GOOGLE_OAUTH_PROVIDER,
    label: "Google",
    enabled: true,
    scopes: GOOGLE_OAUTH_SCOPES,
  },
};

export function getSupabaseGoogleCallbackUrl(supabaseUrl?: string): string {
  const envUrl =
    typeof import.meta !== "undefined"
      ? (import.meta.env?.["VITE_SUPABASE_URL"] as string | undefined)
      : undefined;
  const base = (supabaseUrl || envUrl || `https://${SUPABASE_PROJECT_REF}.supabase.co`).replace(
    /\/+$/,
    "",
  );
  return `${base}/auth/v1/callback`;
}

export function getAppAuthCallbackUrl(origin: string): string {
  return `${origin.replace(/\/+$/, "")}/auth/callback`;
}

export function getDirectGoogleCallbackUrl(origin: string): string {
  return `${origin.replace(/\/+$/, "")}/api/auth/google/callback`;
}

export function buildGoogleOAuthCredentials(
  redirectTo: string,
  options?: { skipBrowserRedirect?: boolean },
): SignInWithOAuthCredentials {
  return {
    provider: GOOGLE_OAUTH_PROVIDER,
    options: {
      redirectTo,
      scopes: GOOGLE_OAUTH_SCOPES,
      skipBrowserRedirect: options?.skipBrowserRedirect ?? true,
      queryParams: {
        access_type: "offline",
        prompt: "select_account",
      },
    },
  };
}
