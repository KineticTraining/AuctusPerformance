import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const CONSENT_STORAGE_KEY = "kinetic_cookie_consent";
export const OPEN_COOKIE_SETTINGS_EVENT = "kinetic:open-cookie-settings";

type ConsentChoice = "accepted" | "declined";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CONSENT_STORAGE_KEY);
      if (saved !== "accepted" && saved !== "declined") {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }

    const handleReopen = () => setVisible(true);
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, handleReopen);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, handleReopen);
  }, []);

  function saveChoice(choice: ConsentChoice) {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
    } catch {
      // Ignore storage failures in strict private browsing modes
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <aside
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-3 z-50 mx-auto max-w-4xl px-4"
    >
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface/95 px-4 py-3 shadow-2xl backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-5 sm:py-3.5">
        <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
          We use essential cookies for sign-in sessions and optional analytics preferences. Read our{" "}
          <Link
            to="/privacy"
            className="text-foreground underline underline-offset-4 hover:text-brand-amber"
          >
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => saveChoice("declined")}
            className="min-h-11 px-4 sm:min-h-9"
          >
            Decline
          </Button>
          <Button
            type="button"
            variant="hero"
            size="sm"
            onClick={() => saveChoice("accepted")}
            className="min-h-11 px-4 sm:min-h-9"
          >
            Accept
          </Button>
        </div>
      </div>
    </aside>
  );
}
