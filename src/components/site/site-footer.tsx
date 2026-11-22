import { Link } from "@tanstack/react-router";
import { OPEN_COOKIE_SETTINGS_EVENT } from "./cookie-banner";
import { Logo } from "./logo";

const linkClass =
  "text-sm font-normal text-muted-foreground transition-colors hover:text-foreground";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-surface/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1.25fr_1fr_1fr_1fr] md:px-8">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-sm text-sm font-normal leading-relaxed text-muted-foreground">
            Dusk Kinetic Performance unites evidence-based training, athletic nutrition protocols,
            sports science research, and AI technique review.
          </p>
          <p className="text-xs text-muted-foreground">
            Support:{" "}
            <a
              href="mailto:support@duskkinetic.com"
              className="text-foreground underline underline-offset-4 hover:text-brand-amber"
            >
              support@duskkinetic.com
            </a>
          </p>
        </div>

        <div className="space-y-3">
          <p className="eyebrow">Performance Hubs</p>
          <nav aria-label="Platform links" className="flex flex-col gap-2.5">
            <Link to="/" className={linkClass}>
              Home
            </Link>
            <Link to="/dashboard" className={linkClass}>
              Training Library
            </Link>
            <Link to="/nutrition" className={linkClass}>
              Nutrition Hub &amp; 8-Week Program
            </Link>
            <Link to="/articles" className={linkClass}>
              Latest Science
            </Link>
            <Link to="/submit" className={linkClass}>
              AI Video Analysis
            </Link>
          </nav>
        </div>

        <div className="space-y-3">
          <p className="eyebrow">Company &amp; Plans</p>
          <nav aria-label="Company links" className="flex flex-col gap-2.5">
            <Link to="/about" className={linkClass}>
              About
            </Link>
            <Link to="/pricing" className={linkClass}>
              Pricing
            </Link>
            <Link to="/membership" className={linkClass}>
              Membership &amp; Billing
            </Link>
            <Link to="/contact" className={linkClass}>
              Contact &amp; Support
            </Link>
            <Link to="/admin" className={linkClass}>
              Admin Studio
            </Link>
          </nav>
        </div>

        <div className="space-y-3">
          <p className="eyebrow">Legal &amp; Privacy</p>
          <nav aria-label="Legal links" className="flex flex-col gap-2.5">
            <Link to="/terms" className={linkClass}>
              Terms &amp; Conditions
            </Link>
            <Link to="/privacy" className={linkClass}>
              Privacy Policy
            </Link>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent(OPEN_COOKIE_SETTINGS_EVENT))}
              className={`${linkClass} text-left`}
            >
              Cookie preferences
            </button>
          </nav>
        </div>
      </div>

      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Dusk Kinetic Performance · All rights reserved
      </div>
    </footer>
  );
}
