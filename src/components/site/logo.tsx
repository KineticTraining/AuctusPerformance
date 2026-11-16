import { Link } from "@tanstack/react-router";

export function LogoMark({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="14" className="fill-foreground" />
      <path d="M18 14h10l-4 16 16-16h12L34 32l12 18H34l-8-12-3 12H13z" className="fill-background" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label="Kinetic home">
      <LogoMark />
      <span className="text-lg font-light uppercase tracking-[0.32em]">
        Kinetic<span className="text-brand-red">.</span>
      </span>
    </Link>
  );
}
