import { Link } from "@tanstack/react-router";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-surface/40">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-12 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-sm text-sm font-light text-muted-foreground">
            Evidence-based training, coaching content and AI technique review for athletes who want to get better on purpose.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-normal text-muted-foreground">
          <Link to="/articles" className="hover:text-foreground">Sports Science</Link>
          <Link to="/dashboard" className="hover:text-foreground">Member dashboard</Link>
          <Link to="/submit" className="hover:text-foreground">Video review</Link>
          <Link to="/auth" className="hover:text-foreground">Sign in</Link>
        </nav>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Kinetic Performance Lab
      </div>
    </footer>
  );
}
