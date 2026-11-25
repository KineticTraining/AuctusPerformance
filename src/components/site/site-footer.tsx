import { Link } from "@tanstack/react-router";
import { OPEN_COOKIE_SETTINGS_EVENT } from "./cookie-banner";
import { Logo } from "./logo";

const linkClass =
  "inline-flex min-h-10 items-center text-sm font-normal text-muted-foreground transition-colors hover:text-foreground md:min-h-0";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-surface/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1.25fr_1fr_1fr_1fr] md:px-8">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm font-normal leading-relaxed text-muted-foreground">
            Training progressions, nutrition science, research, and AI video cues.
          </p>
          <p className="text-xs text-muted-foreground">
            <a
              href="mailto:support@auctusperformance.com"
              className="text-foreground underline underline-offset-4 hover:text-brand-amber"
            >
              support@auctusperformance.com
            </a>
          </p>
        </div>

        <div className="space-y-3">
          <p className="eyebrow">Hubs</p>
          <nav aria-label="Platform links" className="flex flex-col gap-1 md:gap-2">
            <Link to="/" className={linkClass}>
              Home
            </Link>
            <Link to="/training" className={linkClass}>
              Training
            </Link>
            <Link to="/dashboard" className={linkClass}>
              Video Library
            </Link>
            <Link to="/nutrition" className={linkClass}>
              Nutrition
            </Link>
            <Link to="/articles" className={linkClass}>
              Latest Science
            </Link>
            <Link to="/submit" className={linkClass}>
              AI Video
            </Link>
          </nav>
        </div>

        <div className="space-y-3">
          <p className="eyebrow">Company</p>
          <nav aria-label="Company links" className="flex flex-col gap-1 md:gap-2">
            <Link to="/about" className={linkClass}>
              About
            </Link>
            <Link to="/pricing" className={linkClass}>
              Plans
            </Link>
            <Link to="/membership" className={linkClass}>
              Membership
            </Link>
            <Link to="/contact" className={linkClass}>
              Contact
            </Link>
            <Link to="/admin" className={linkClass}>
              Admin
            </Link>
          </nav>
        </div>

        <div className="space-y-3">
          <p className="eyebrow">Legal</p>
          <nav aria-label="Legal links" className="flex flex-col gap-1 md:gap-2">
            <Link to="/terms" className={linkClass}>
              Terms
            </Link>
            <Link to="/privacy" className={linkClass}>
              Privacy
            </Link>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent(OPEN_COOKIE_SETTINGS_EVENT))}
              className={`${linkClass} text-left`}
            >
              Cookies
            </button>
          </nav>
        </div>
      </div>

      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Auctus Performance · All rights reserved
      </div>
    </footer>
  );
}
