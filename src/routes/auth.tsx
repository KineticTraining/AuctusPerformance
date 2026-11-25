import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRight, Loader2, MailCheck, RefreshCw, ShieldCheck } from "lucide-react";
import "@lovable.dev/cloud-auth-js/styles.css";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Provider } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";
import {
  buildGoogleOAuthCredentials,
  getAppAuthCallbackUrl,
  getDirectGoogleCallbackUrl,
  GOOGLE_OAUTH_PROVIDER,
  LOVABLE_GOOGLE_PROVIDER,
} from "@/lib/auth-providers";
import { AthleticImage } from "@/components/site/athletic-image";
import { AGE_GROUPS, EXPERIENCE_LEVELS, SPORTS } from "@/lib/sports";
import { SITE_MEDIA } from "@/lib/media";

type Mode = "signin" | "signup" | "forgot";

export const Route = createFileRoute("/auth")({
  validateSearch: (
    s: Record<string, unknown>,
  ): {
    mode?: Mode | undefined;
    oauth_code?: string | undefined;
    oauth_error?: string | undefined;
  } => ({
    mode: s["mode"] === "signup" || s["mode"] === "forgot" ? s["mode"] : undefined,
    oauth_code: typeof s["oauth_code"] === "string" ? s["oauth_code"] : undefined,
    oauth_error: typeof s["oauth_error"] === "string" ? s["oauth_error"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in or Join — Auctus Performance" },
      {
        name: "description",
        content:
          "Sign in to Auctus Performance or create an athlete account to access training, nutrition, and video review.",
      },
      { property: "og:title", content: "Sign in or Join — Auctus Performance" },
      {
        property: "og:description",
        content:
          "Access your Auctus Performance training library, nutrition protocols, and video review.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const signUpSchema = z.object({
  displayName: z.string().trim().min(1, "Enter your full name").max(80),
  sport: z.string().min(1, "Pick your primary sport"),
  level: z.string().min(1, "Pick your experience level"),
  ageGroup: z.string().min(1, "Pick your age group"),
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(1, "Enter your password"),
});

function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
      />
    </svg>
  );
}

function AuthPage() {
  const {
    mode = "signin",
    oauth_code: oauthCodeParam,
    oauth_error: oauthErrorParam,
  } = Route.useSearch();
  const navigate = useNavigate();
  const { session, ready } = useAuth();
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [oauthNotice, setOauthNotice] = useState<string | null>(null);
  const [isLovableHost, setIsLovableHost] = useState(false);
  const [checkEmail, setCheckEmail] = useState<string | null>(null);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const [resendingConfirmation, setResendingConfirmation] = useState(false);
  const [pendingOtpEmail, setPendingOtpEmail] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sport, setSport] = useState("");
  const [level, setLevel] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const oauthPollRef = useRef<number | null>(null);
  const isLocalFallback = !import.meta.env["VITE_SUPABASE_URL"];

  const clearOAuthPoll = useCallback(() => {
    if (oauthPollRef.current !== null) {
      window.clearInterval(oauthPollRef.current);
      oauthPollRef.current = null;
    }
  }, []);

  useEffect(() => clearOAuthPoll, [clearOAuthPoll]);

  useEffect(() => {
    setIsLovableHost(
      /(?:^|\.)(?:lovable\.app|lovableproject\.com|lovableproject-dev\.com)$/i.test(
        window.location.hostname,
      ),
    );
  }, []);

  useEffect(() => {
    if (ready && session) navigate({ to: "/dashboard", replace: true });
  }, [ready, session, navigate]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const exchangeGoogleCode = useCallback(
    async (code: string) => {
      setOauthLoading(true);
      try {
        const res = await fetch("/api/auth/google/exchange", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ code }),
        });
        const body = (await res.json()) as {
          access_token?: string;
          refresh_token?: string;
          error?: string;
        };
        if (!res.ok || !body.access_token || !body.refresh_token) {
          toast.error(body.error ?? "Google sign-in didn't complete. Please try again.");
          return;
        }
        const { error } = await supabase.auth.setSession({
          access_token: body.access_token,
          refresh_token: body.refresh_token,
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("Signed in with Google.");
        navigate({ to: "/dashboard", replace: true });
      } catch {
        toast.error("Failed to complete Google sign-in. Please retry.");
      } finally {
        setOauthLoading(false);
      }
    },
    [navigate],
  );

  useEffect(() => {
    if (oauthErrorParam) {
      toast.error(oauthErrorParam);
      navigate({
        to: "/auth",
        search: { mode: mode === "signin" ? undefined : mode },
        replace: true,
      });
    } else if (oauthCodeParam) {
      void exchangeGoogleCode(oauthCodeParam);
    }
  }, [oauthCodeParam, oauthErrorParam, exchangeGoogleCode, navigate, mode]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;

      const data = event.data as {
        type?: string;
        code?: string;
        access_token?: string;
        refresh_token?: string;
        error?: string;
      } | null;
      if (!data?.type) return;

      if (data.type === "GOOGLE_OAUTH_SUCCESS" && data.code) {
        clearOAuthPoll();
        void exchangeGoogleCode(data.code);
      } else if (data.type === "SUPABASE_OAUTH_CODE" && data.code) {
        clearOAuthPoll();
        void supabase.auth.exchangeCodeForSession(data.code).then(({ error }) => {
          setOauthLoading(false);
          if (error) {
            toast.error(error.message);
            return;
          }
          toast.success("Signed in with Google.");
          navigate({ to: "/dashboard", replace: true });
        });
      } else if (data.type === "SUPABASE_OAUTH_SUCCESS") {
        clearOAuthPoll();
        if (data.access_token && data.refresh_token) {
          void supabase.auth
            .setSession({
              access_token: data.access_token,
              refresh_token: data.refresh_token,
            })
            .then(({ error }) => {
              setOauthLoading(false);
              if (error) {
                toast.error(error.message);
                return;
              }
              toast.success("Signed in with Google.");
              navigate({ to: "/dashboard", replace: true });
            });
        } else {
          setOauthLoading(false);
          navigate({ to: "/dashboard", replace: true });
        }
      } else if (data.type === "GOOGLE_OAUTH_ERROR" || data.type === "SUPABASE_OAUTH_ERROR") {
        clearOAuthPoll();
        setOauthLoading(false);
        toast.error(data.error ?? "Google sign-in didn't complete.");
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [clearOAuthPoll, exchangeGoogleCode, navigate]);

  function setMode(m: Mode) {
    setErrors({});
    setOauthNotice(null);
    setCheckEmail(null);
    setUnconfirmedEmail(null);
    setPendingOtpEmail(null);
    setOtpCode("");
    setOtpError(null);
    setResendCooldown(0);
    navigate({ to: "/auth", search: { mode: m === "signin" ? undefined : m }, replace: true });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = Object.fromEntries(fd.entries()) as Record<string, string>;
    setErrors({});

    if (mode === "forgot") {
      const parsed = z.string().trim().email("Enter a valid email address").safeParse(raw["email"]);
      if (!parsed.success) {
        return setErrors({ email: parsed.error.issues[0]?.message ?? "Enter a valid email" });
      }
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setLoading(false);
      if (error) return toast.error(error.message);
      setCheckEmail(parsed.data);
      toast.success("Password reset instructions sent.");
      return;
    }

    if (mode === "signup") {
      const parsed = signUpSchema.safeParse({ ...raw, sport, level, ageGroup });
      if (!parsed.success) {
        return setErrors(
          Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])),
        );
      }
      setLoading(true);
      try {
        const res = await fetch("/api/auth/signup/start", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(parsed.data),
        });
        const body = (await res.json()) as {
          ok?: boolean;
          email?: string;
          code?: string;
          resendCooldownSeconds?: number;
          error?: string;
        };

        if (res.status === 503 && body.code === "EMAIL_PROVIDER_NOT_CONFIGURED") {
          const { data: supaData, error: supaErr } = await supabase.auth.signUp({
            email: parsed.data.email,
            password: parsed.data.password,
            options: {
              emailRedirectTo: getAppAuthCallbackUrl(window.location.origin),
              data: {
                display_name: parsed.data.displayName,
                sport: parsed.data.sport,
                level: parsed.data.level,
                age_group: parsed.data.ageGroup,
              },
            },
          });
          if (supaErr) {
            toast.error(supaErr.message);
            setErrors({ email: supaErr.message });
            return;
          }
          if (supaData.session && supaData.user) {
            await supabase.from("profiles").upsert({
              id: supaData.user.id,
              display_name: parsed.data.displayName,
              sport: parsed.data.sport,
              level: parsed.data.level,
            });
            toast.success("Account created — welcome to Auctus Performance.");
            navigate({ to: "/dashboard", replace: true });
            return;
          }
          if (Array.isArray(supaData.user?.identities) && supaData.user.identities.length === 0) {
            const existsMsg =
              "An account with this email may already exist. Try signing in or resetting your password.";
            setErrors({ email: existsMsg });
            toast.error(existsMsg);
            return;
          }
          setCheckEmail(parsed.data.email);
          toast.success("Confirmation link sent to your email.");
          return;
        }

        if (!res.ok || !body.ok) {
          toast.error(body.error ?? "Could not send confirmation code.");
          return;
        }
        setPendingOtpEmail(body.email ?? parsed.data.email.trim().toLowerCase());
        setOtpCode("");
        setOtpError(null);
        setResendCooldown(body.resendCooldownSeconds ?? 60);
        toast.success("6-digit confirmation code sent to your email.");
      } catch {
        toast.error("Unable to reach verification service. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    const parsed = signInSchema.safeParse(raw);
    if (!parsed.success) {
      return setErrors(
        Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])),
      );
    }
    setUnconfirmedEmail(null);
    setLoading(true);
    try {
      if (!isLocalFallback) {
        const { data: signInData, error } = await supabase.auth.signInWithPassword(parsed.data);
        if (!error && signInData.session) {
          toast.success("Signed in.");
          navigate({ to: "/dashboard", replace: true });
          return;
        }
        if (error && error.message.toLowerCase().includes("email not confirmed")) {
          const msg = "Please confirm your email address using the link sent to your inbox.";
          setUnconfirmedEmail(parsed.data.email);
          setErrors({ password: msg });
          toast.error(msg);
          return;
        }
      }

      // Fall back to server /api/auth/login (also handles migrated local accounts & sets session cookie)
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const loginBody = (await loginRes.json()) as {
        access_token?: string;
        refresh_token?: string;
        error?: string;
      };
      if (!loginRes.ok || !loginBody.access_token || !loginBody.refresh_token) {
        const rawMsg = loginBody.error ?? "Invalid login credentials";
        const lower = rawMsg.toLowerCase();
        if (lower.includes("email not confirmed") || lower.includes("confirm your email")) {
          setUnconfirmedEmail(parsed.data.email);
        }
        const msg = rawMsg === "Invalid login credentials" ? "Wrong email or password." : rawMsg;
        setErrors({ password: msg });
        toast.error(msg);
        return;
      }

      const { error: sessionErr } = await supabase.auth.setSession({
        access_token: loginBody.access_token,
        refresh_token: loginBody.refresh_token,
      });
      if (sessionErr) {
        setErrors({ password: sessionErr.message });
        toast.error(sessionErr.message);
        return;
      }
      toast.success("Signed in.");
      navigate({ to: "/dashboard", replace: true });
    } catch {
      toast.error("Sign-in request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendConfirmation() {
    if (!unconfirmedEmail || resendingConfirmation) return;
    setResendingConfirmation(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: unconfirmedEmail,
        options: { emailRedirectTo: getAppAuthCallbackUrl(window.location.origin) },
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success(`Confirmation email resent to ${unconfirmedEmail}.`);
    } catch {
      toast.error("Could not resend confirmation email.");
    } finally {
      setResendingConfirmation(false);
    }
  }

  async function verifyEmailOtp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pendingOtpEmail) return;
    const clean = otpCode.replace(/\D/g, "");
    if (clean.length !== 6) {
      setOtpError("Enter all 6 digits from your confirmation email.");
      return;
    }
    setOtpError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: pendingOtpEmail, code: clean }),
      });
      const body = (await res.json()) as {
        access_token?: string;
        refresh_token?: string;
        error?: string;
      };
      if (!res.ok || !body.access_token || !body.refresh_token) {
        const msg = body.error ?? "Invalid or expired confirmation code.";
        setOtpError(msg);
        toast.error(msg);
        return;
      }
      const { error } = await supabase.auth.setSession({
        access_token: body.access_token,
        refresh_token: body.refresh_token,
      });
      if (error) {
        setOtpError(error.message);
        toast.error(error.message);
        return;
      }
      toast.success("Email verified — welcome to Auctus Performance.");
      navigate({ to: "/dashboard", replace: true });
    } catch {
      setOtpError("Verification request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function resendEmailOtp() {
    if (!pendingOtpEmail || resendCooldown > 0 || resending) return;
    setResending(true);
    setOtpError(null);
    try {
      const res = await fetch("/api/auth/signup/resend", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: pendingOtpEmail }),
      });
      const body = (await res.json()) as {
        ok?: boolean;
        resendCooldownSeconds?: number;
        retryAfterSeconds?: number;
        error?: string;
      };
      if (!res.ok || !body.ok) {
        if (typeof body.retryAfterSeconds === "number") {
          setResendCooldown(body.retryAfterSeconds);
        }
        const msg = body.error ?? "Could not resend confirmation code.";
        setOtpError(msg);
        toast.error(msg);
        return;
      }
      setResendCooldown(body.resendCooldownSeconds ?? 60);
      setOtpCode("");
      toast.success("A new 6-digit confirmation code was sent.");
    } catch {
      toast.error("Failed to resend confirmation code.");
    } finally {
      setResending(false);
    }
  }

  async function oauth(provider: Provider | "lovable") {
    if (provider === GOOGLE_OAUTH_PROVIDER) {
      setOauthLoading(true);
      setOauthNotice(null);
      try {
        const redirectUri = getDirectGoogleCallbackUrl(window.location.origin);
        const res = await fetch(
          `/api/auth/google/url?redirect_uri=${encodeURIComponent(redirectUri)}`,
        );
        const body = (await res.json()) as {
          mode?: "direct" | "supabase";
          url?: string;
          code?: string;
          error?: string;
          supabaseCallbackUrl?: string;
        };

        const openOAuthPopupOrRedirect = (oauthUrl: string) => {
          const popup = window.open(
            oauthUrl,
            "google_oauth_popup",
            "width=520,height=680,menubar=no,toolbar=no,status=no",
          );
          if (!popup) {
            if (window.self === window.top) {
              window.location.assign(oauthUrl);
              return;
            }
            setOauthLoading(false);
            toast.error("Popup was blocked. Allow popups for this site to sign in with Google.");
            return;
          }
          clearOAuthPoll();
          oauthPollRef.current = window.setInterval(() => {
            if (popup.closed) {
              clearOAuthPoll();
              setOauthLoading(false);
            }
          }, 500);
        };

        if (res.ok && body.mode === "supabase") {
          const supaRes = await supabase.auth.signInWithOAuth(
            buildGoogleOAuthCredentials(getAppAuthCallbackUrl(window.location.origin), {
              skipBrowserRedirect: true,
            }),
          );
          if (supaRes.error) {
            setOauthLoading(false);
            toast.error(supaRes.error.message);
            return;
          }
          const oauthUrl = supaRes.data?.url;
          if (!oauthUrl) {
            setOauthLoading(false);
            toast.error("Supabase did not return a Google OAuth URL.");
            return;
          }
          openOAuthPopupOrRedirect(oauthUrl);
          return;
        }

        if (!res.ok || !body.url) {
          setOauthLoading(false);
          const msg =
            body.error ?? "Google sign-in is not enabled in the auth provider configuration yet.";
          setOauthNotice(msg);
          toast.error(msg);
          return;
        }

        openOAuthPopupOrRedirect(body.url);
        return;
      } catch {
        setOauthLoading(false);
        toast.error("Google sign-in couldn't start. Please try again.");
        return;
      }
    }

    const result = await lovable.auth.signInWithOAuth(LOVABLE_GOOGLE_PROVIDER, {
      redirect_uri: `${window.location.origin}/dashboard`,
    });
    if (result.error) {
      toast.error("Sign-in didn't complete. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard", replace: true });
  }

  const title = pendingOtpEmail
    ? "Verify your email"
    : mode === "signup"
      ? "Join Auctus Performance"
      : mode === "forgot"
        ? "Reset your password"
        : "Welcome back";

  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <AthleticImage
          src={SITE_MEDIA.authCourt.src}
          alt={SITE_MEDIA.authCourt.alt}
          width={SITE_MEDIA.authCourt.width}
          height={SITE_MEDIA.authCourt.height}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-center brightness-90 saturate-[1.1]"
        />
        <div className="absolute inset-0 bg-fade-up" />
        <div className="absolute bottom-12 left-12 right-12">
          <span className="block h-[3px] w-16 bg-tricolor" aria-hidden="true" />
          <p className="eyebrow mt-5 text-brand-amber">Auctus Performance</p>
          <p className="text-display mt-3 text-5xl xl:text-6xl">
            Every rep counts.
            <br />
            Finish stronger.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-12 sm:px-5 sm:py-16">
        <div className="w-full max-w-md">
          <h1 className="text-display text-4xl sm:text-5xl">{title}</h1>
          <p className="mt-2 text-muted-foreground">
            {pendingOtpEmail
              ? "Enter the 6-digit code sent to your inbox to activate your account."
              : mode === "signup"
                ? "Create your athlete profile for tailored training, nutrition, and AI review."
                : mode === "forgot"
                  ? "Enter your email and we will send a secure password recovery link."
                  : "Sign in to access your training dashboard."}
          </p>

          {pendingOtpEmail ? (
            <form
              onSubmit={verifyEmailOtp}
              className="mt-8 space-y-6 rounded-2xl border border-border bg-surface p-6 sm:p-7"
              noValidate
            >
              <div className="flex items-start gap-3">
                <ShieldCheck
                  className="mt-0.5 size-6 shrink-0 text-brand-amber"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-medium text-foreground">Confirmation code sent</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    We sent a 6-digit code to{" "}
                    <span className="font-medium text-foreground">{pendingOtpEmail}</span>. It
                    expires in 10 minutes.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <Label className="font-mono text-[0.68rem] font-normal uppercase tracking-[0.16em] text-muted-foreground">
                  6-digit confirmation code
                </Label>
                <div className="flex justify-center pt-1">
                  <InputOTP
                    maxLength={6}
                    value={otpCode}
                    onChange={(value) => {
                      setOtpCode(value);
                      if (otpError) setOtpError(null);
                    }}
                    aria-label="6-digit email confirmation code"
                  >
                    <InputOTPGroup>
                      <InputOTPSlot
                        index={0}
                        className="h-12 w-10 border-border bg-background text-base sm:w-11"
                      />
                      <InputOTPSlot
                        index={1}
                        className="h-12 w-10 border-border bg-background text-base sm:w-11"
                      />
                      <InputOTPSlot
                        index={2}
                        className="h-12 w-10 border-border bg-background text-base sm:w-11"
                      />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot
                        index={3}
                        className="h-12 w-10 border-border bg-background text-base sm:w-11"
                      />
                      <InputOTPSlot
                        index={4}
                        className="h-12 w-10 border-border bg-background text-base sm:w-11"
                      />
                      <InputOTPSlot
                        index={5}
                        className="h-12 w-10 border-border bg-background text-base sm:w-11"
                      />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {otpError && (
                  <p className="text-center text-xs font-medium text-destructive">{otpError}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="hero"
                size="xl"
                className="w-full"
                disabled={loading || otpCode.length !== 6}
              >
                {loading && <Loader2 className="animate-spin" aria-hidden="true" />}
                Verify &amp; create account
              </Button>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-xs">
                <button
                  type="button"
                  onClick={resendEmailOtp}
                  disabled={resendCooldown > 0 || resending}
                  className="inline-flex items-center gap-1.5 font-medium text-brand-amber disabled:cursor-not-allowed disabled:text-muted-foreground"
                >
                  <RefreshCw
                    className={resending ? "size-3.5 animate-spin" : "size-3.5"}
                    aria-hidden="true"
                  />
                  {resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : resending
                      ? "Sending new code..."
                      : "Resend code"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPendingOtpEmail(null);
                    setOtpCode("");
                    setOtpError(null);
                  }}
                  className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
                >
                  Use a different email
                </button>
              </div>
            </form>
          ) : checkEmail ? (
            <div className="mt-10 rounded-2xl border border-border bg-surface p-6">
              <MailCheck className="size-8 stroke-1 text-brand-amber" aria-hidden="true" />
              <p className="mt-4 font-medium text-foreground">Check your inbox</p>
              <p className="mt-1 text-sm text-muted-foreground">
                We sent a link to <span className="text-foreground">{checkEmail}</span>.{" "}
                {mode === "forgot"
                  ? "Open the link in that email to set a new password."
                  : "Confirm your email to activate your Auctus Performance account."}
              </p>

              {mode === "forgot" && isLocalFallback && (
                <div className="mt-5 rounded-xl border border-brand-amber/40 bg-background/70 p-4">
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-brand-amber">
                    Preview Environment Notice
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Local preview auth is active without outbound SMTP email. Continue directly to
                    the password update screen below:
                  </p>
                  <Button asChild variant="hero" size="sm" className="mt-3 gap-1.5">
                    <Link to="/reset-password">
                      Open Reset Password screen <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                </div>
              )}

              <Button variant="link" className="mt-3 px-0" onClick={() => setMode("signin")}>
                Back to sign in
              </Button>
            </div>
          ) : (
            <>
              {mode !== "forgot" && (
                <div className="mt-8 grid gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="xl"
                    disabled={oauthLoading}
                    onClick={() => oauth(GOOGLE_OAUTH_PROVIDER)}
                    className="border-[#8E918F] bg-[#131314] text-[#E3E3E3] hover:bg-[#131314]/90 hover:text-[#E3E3E3]"
                  >
                    {oauthLoading ? (
                      <Loader2 className="animate-spin" aria-hidden="true" />
                    ) : (
                      <GoogleIcon />
                    )}
                    Continue with Google
                  </Button>
                  {isLovableHost && (
                    <button
                      type="button"
                      className="lovable-auth-button"
                      onClick={() => oauth("lovable")}
                    >
                      Continue with Lovable
                    </button>
                  )}
                  {oauthNotice && (
                    <p className="rounded-lg border border-brand-amber/40 bg-surface px-3.5 py-2.5 text-xs leading-relaxed text-muted-foreground">
                      {oauthNotice}
                    </p>
                  )}
                  <div className="my-3 flex items-center gap-3 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
                    <span className="h-px flex-1 bg-border" /> or with email{" "}
                    <span className="h-px flex-1 bg-border" />
                  </div>
                </div>
              )}

              <form
                onSubmit={onSubmit}
                className={mode === "forgot" ? "mt-8 space-y-5" : "space-y-5"}
                noValidate
              >
                {mode === "signup" && (
                  <>
                    <Field label="Full name" error={errors["displayName"]}>
                      <Input
                        name="displayName"
                        autoComplete="name"
                        placeholder="Jordan Ellis"
                        maxLength={80}
                      />
                    </Field>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Primary sport" error={errors["sport"]}>
                        <Select value={sport} onValueChange={setSport}>
                          <SelectTrigger aria-label="Primary sport">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {SPORTS.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Experience level" error={errors["level"]}>
                        <Select value={level} onValueChange={setLevel}>
                          <SelectTrigger aria-label="Experience level">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {EXPERIENCE_LEVELS.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                    <Field label="Age group" error={errors["ageGroup"]}>
                      <Select value={ageGroup} onValueChange={setAgeGroup}>
                        <SelectTrigger aria-label="Age group">
                          <SelectValue placeholder="Select age bracket" />
                        </SelectTrigger>
                        <SelectContent>
                          {AGE_GROUPS.map((a) => (
                            <SelectItem key={a} value={a}>
                              {a}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </>
                )}
                <Field label="Email" error={errors["email"]}>
                  <Input
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    maxLength={255}
                  />
                </Field>
                {mode !== "forgot" && (
                  <Field
                    label="Password"
                    error={errors["password"]}
                    action={
                      mode === "signin" ? (
                        <button
                          type="button"
                          onClick={() => setMode("forgot")}
                          className="inline-flex min-h-11 items-center text-xs text-brand-amber underline-offset-4 hover:underline sm:min-h-0"
                        >
                          Forgot password?
                        </button>
                      ) : undefined
                    }
                  >
                    <Input
                      name="password"
                      type="password"
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      placeholder={mode === "signup" ? "At least 8 characters" : "••••••••"}
                      className="h-11"
                    />
                  </Field>
                )}
                {unconfirmedEmail && mode === "signin" && (
                  <div className="rounded-lg border border-brand-amber/40 bg-surface px-3.5 py-2.5 text-xs text-muted-foreground">
                    <p>
                      Need a new confirmation link for{" "}
                      <span className="font-medium text-foreground">{unconfirmedEmail}</span>?
                    </p>
                    <button
                      type="button"
                      onClick={handleResendConfirmation}
                      disabled={resendingConfirmation}
                      className="mt-1.5 font-medium text-brand-amber underline underline-offset-4 disabled:opacity-60"
                    >
                      {resendingConfirmation
                        ? "Sending confirmation email..."
                        : "Resend confirmation email"}
                    </button>
                  </div>
                )}
                <Button
                  type="submit"
                  variant="hero"
                  size="xl"
                  className="w-full"
                  disabled={loading}
                >
                  {loading && <Loader2 className="animate-spin" aria-hidden="true" />}
                  {mode === "signup"
                    ? "Create account"
                    : mode === "forgot"
                      ? "Send reset link"
                      : "Sign in"}
                </Button>
              </form>

              <p className="mt-8 text-center text-sm text-muted-foreground">
                {mode === "signup" ? (
                  <>
                    Already a member?{" "}
                    <button
                      type="button"
                      className="text-foreground underline underline-offset-4 hover:text-brand-amber"
                      onClick={() => setMode("signin")}
                    >
                      Sign in
                    </button>
                  </>
                ) : mode === "forgot" ? (
                  <button
                    type="button"
                    className="text-foreground underline underline-offset-4 hover:text-brand-amber"
                    onClick={() => setMode("signin")}
                  >
                    Back to sign in
                  </button>
                ) : (
                  <>
                    New to Auctus Performance?{" "}
                    <button
                      type="button"
                      className="text-foreground underline underline-offset-4 hover:text-brand-amber"
                      onClick={() => setMode("signup")}
                    >
                      Create an account
                    </button>
                  </>
                )}
              </p>
            </>
          )}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  action,
  children,
}: {
  label: string;
  error?: string | undefined;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="font-mono text-[0.68rem] font-normal uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </Label>
        {action}
      </div>
      {children}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
