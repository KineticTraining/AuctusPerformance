import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { CheckCircle2, KeyRound, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { getMockPendingRecoveryEmail } from "@/lib/mock-supabase";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a New Password — Dusk Kinetic Performance" },
      {
        name: "description",
        content: "Choose a new password for your Dusk Kinetic Performance account.",
      },
      { property: "og:title", content: "Set a New Password — Dusk Kinetic Performance" },
      {
        property: "og:description",
        content: "Update your Dusk Kinetic Performance password securely.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [readyForReset, setReadyForReset] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function checkState() {
      const [{ data }, pendingEmail] = await Promise.all([
        supabase.auth.getSession(),
        Promise.resolve(getMockPendingRecoveryEmail()),
      ]);
      if (!active) return;
      if (data.session) {
        setReadyForReset(true);
        setRecoveryEmail(data.session.user.email ?? null);
      } else if (pendingEmail) {
        setReadyForReset(true);
        setRecoveryEmail(pendingEmail);
      }
    }

    checkState();

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setReadyForReset(true);
        setRecoveryEmail(session?.user?.email ?? null);
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    const confirm = String(fd.get("confirm") ?? "");
    if (password.length < 8) {
      return setError("Password must be at least 8 characters long.");
    }
    if (password !== confirm) {
      return setError("Passwords do not match.");
    }

    setError(null);
    setLoading(true);
    const { error: updateErr } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateErr) {
      setError(updateErr.message);
      return toast.error(updateErr.message);
    }

    setDone(true);
    toast.success("Password updated successfully.");
    setTimeout(() => {
      navigate({ to: "/dashboard", replace: true });
    }, 1000);
  }

  return (
    <div className="flex min-h-[72vh] items-center justify-center px-5 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-7 sm:p-8">
        <span className="block h-[3px] w-14 bg-tricolor" aria-hidden="true" />
        {done ? (
          <div className="mt-6 space-y-4">
            <CheckCircle2 className="size-10 stroke-1 text-success" aria-hidden="true" />
            <h1 className="text-display text-3xl">Password updated</h1>
            <p className="text-sm text-muted-foreground">
              Your credentials have been saved. Redirecting you to your training dashboard...
            </p>
            <Button asChild variant="hero" size="lg" className="w-full">
              <Link to="/dashboard">Continue to Training Library</Link>
            </Button>
          </div>
        ) : !readyForReset ? (
          <div className="mt-6 space-y-4">
            <KeyRound className="size-8 stroke-1 text-brand-amber" aria-hidden="true" />
            <h1 className="text-display text-3xl">Recovery link needed</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Open this page directly from the link in your password-reset email, or request a fresh
              reset email from the sign-in page.
            </p>
            <div className="flex flex-col gap-2.5 pt-2">
              <Button asChild variant="hero" size="lg" className="w-full">
                <Link to="/auth" search={{ mode: "forgot" }}>
                  Request password reset
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="w-full">
                <Link to="/auth">Back to sign in</Link>
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-5" noValidate>
            <div>
              <p className="eyebrow text-brand-amber">Account Recovery</p>
              <h1 className="text-display mt-2 text-4xl">Set new password</h1>
              {recoveryEmail && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Updating credentials for <span className="text-foreground">{recoveryEmail}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm"
                name="confirm"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter new password"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" variant="hero" size="xl" className="w-full" disabled={loading}>
              {loading && <Loader2 className="animate-spin" aria-hidden="true" />}
              Update password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
