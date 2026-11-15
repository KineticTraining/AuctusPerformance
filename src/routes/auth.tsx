import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, MailCheck } from "lucide-react";
import "@lovable.dev/cloud-auth-js/styles.css";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";
import { LEVELS, SPORTS } from "@/lib/sports";
import heroImg from "@/assets/hero-sprinter.jpg";

type Mode = "signin" | "signup" | "forgot";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { mode?: Mode } => ({
    mode: s.mode === "signup" || s.mode === "forgot" ? s.mode : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in or join — Kinetic" },
      { name: "description", content: "Sign in to your Kinetic membership or create an account to start training." },
      { property: "og:title", content: "Sign in or join — Kinetic" },
      { property: "og:description", content: "Access your training dashboard, video library and AI technique review." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const signUpSchema = z.object({
  displayName: z.string().trim().min(1, "Enter your name").max(80),
  sport: z.string().min(1, "Pick your sport"),
  level: z.string().min(1, "Pick your level"),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(1, "Enter your password"),
});

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
    </svg>
  );
}

function AuthPage() {
  const { mode = "signin" } = Route.useSearch();
  const navigate = useNavigate();
  const { session, ready } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sport, setSport] = useState("");
  const [level, setLevel] = useState("");

  useEffect(() => {
    if (ready && session) navigate({ to: "/dashboard", replace: true });
  }, [ready, session, navigate]);

  function setMode(m: Mode) {
    setErrors({});
    setCheckEmail(null);
    navigate({ to: "/auth", search: { mode: m === "signin" ? undefined : m }, replace: true });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = Object.fromEntries(fd.entries()) as Record<string, string>;
    setErrors({});

    if (mode === "forgot") {
      const parsed = z.string().trim().email().safeParse(raw.email);
      if (!parsed.success) return setErrors({ email: "Enter a valid email" });
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setLoading(false);
      if (error) return toast.error(error.message);
      setCheckEmail(parsed.data);
      return;
    }

    if (mode === "signup") {
      const parsed = signUpSchema.safeParse({ ...raw, sport, level });
      if (!parsed.success) {
        return setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      }
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { display_name: parsed.data.displayName, sport: parsed.data.sport, level: parsed.data.level },
        },
      });
      setLoading(false);
      if (error) return toast.error(error.message);
      if (!data.session) setCheckEmail(parsed.data.email);
      return;
    }

    const parsed = signInSchema.safeParse(raw);
    if (!parsed.success) {
      return setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (error) return toast.error(error.message === "Invalid login credentials" ? "Wrong email or password" : error.message);
    navigate({ to: "/dashboard" });
  }

  async function oauth(provider: "google" | "lovable") {
    const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
    if (result.error) return toast.error("Sign-in didn't complete. Please try again.");
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  }

  const title = mode === "signup" ? "Join the lab" : mode === "forgot" ? "Reset password" : "Welcome back";

  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <img src={heroImg} alt="" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover object-[75%_center]" />
        <div className="absolute inset-0 bg-fade-up" />
        <div className="absolute bottom-12 left-12 right-12">
          <p className="eyebrow">Members train with intent</p>
          <p className="text-display mt-3 text-6xl">Every rep counts.<br />Make it count right.</p>
        </div>
      </div>

      <div className="flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-md">
          <h1 className="text-display text-5xl">{title}</h1>
          <p className="mt-2 text-muted-foreground">
            {mode === "signup"
              ? "Create your athlete profile to unlock the library and AI video review."
              : mode === "forgot"
                ? "We'll email you a link to set a new password."
                : "Sign in to your training dashboard."}
          </p>

          {checkEmail ? (
            <div className="mt-10 rounded-2xl border border-primary/30 bg-primary/10 p-6">
              <MailCheck className="size-8 text-primary" />
              <p className="mt-4 font-semibold">Check your inbox</p>
              <p className="mt-1 text-sm text-muted-foreground">
                We sent a link to <span className="text-foreground">{checkEmail}</span>.{" "}
                {mode === "forgot" ? "Open it to choose a new password." : "Confirm your email to activate your membership."}
              </p>
              <Button variant="link" className="mt-2 px-0" onClick={() => setMode("signin")}>
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
                    onClick={() => oauth("google")}
                    className="border-[#8E918F] bg-[#131314] text-[#E3E3E3] hover:bg-[#131314]/90 hover:text-[#E3E3E3]"
                  >
                    <GoogleIcon /> Continue with Google
                  </Button>
                  <button type="button" className="lovable-auth-button" onClick={() => oauth("lovable")}>
                    Continue with Lovable
                  </button>
                  <div className="my-3 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
                    <span className="h-px flex-1 bg-border" /> or with email <span className="h-px flex-1 bg-border" />
                  </div>
                </div>
              )}

              <form onSubmit={onSubmit} className={mode === "forgot" ? "mt-8 space-y-5" : "space-y-5"} noValidate>
                {mode === "signup" && (
                  <>
                    <Field label="Full name" error={errors.displayName}>
                      <Input name="displayName" autoComplete="name" placeholder="Jordan Ellis" maxLength={80} />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Primary sport" error={errors.sport}>
                        <Select value={sport} onValueChange={setSport}>
                          <SelectTrigger aria-label="Primary sport"><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            {SPORTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Level" error={errors.level}>
                        <Select value={level} onValueChange={setLevel}>
                          <SelectTrigger aria-label="Level"><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            {LEVELS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                  </>
                )}
                <Field label="Email" error={errors.email}>
                  <Input name="email" type="email" autoComplete="email" placeholder="you@example.com" maxLength={255} />
                </Field>
                {mode !== "forgot" && (
                  <Field
                    label="Password"
                    error={errors.password}
                    action={
                      mode === "signin" ? (
                        <button type="button" onClick={() => setMode("forgot")} className="text-xs font-semibold text-primary hover:underline">
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
                    />
                  </Field>
                )}
                <Button type="submit" variant="hero" size="xl" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="animate-spin" />}
                  {mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Sign in"}
                </Button>
              </form>

              <p className="mt-8 text-center text-sm text-muted-foreground">
                {mode === "signup" ? (
                  <>Already a member? <button className="font-semibold text-primary hover:underline" onClick={() => setMode("signin")}>Sign in</button></>
                ) : mode === "forgot" ? (
                  <button className="font-semibold text-primary hover:underline" onClick={() => setMode("signin")}>Back to sign in</button>
                ) : (
                  <>New to Kinetic? <button className="font-semibold text-primary hover:underline" onClick={() => setMode("signup")}>Create an account</button></>
                )}
              </p>
            </>
          )}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, action, children }: { label: string; error?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</Label>
        {action}
      </div>
      {children}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
