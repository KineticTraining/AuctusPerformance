import { Link } from "@tanstack/react-router";

export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="14" className="fill-surface-raised" />
      <path d="M18 14h10l-4 16 16-16h12L34 32l12 18H34l-8-12-3 12H13z" className="fill-primary" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label="Kinetic home">
      <LogoMark />
      <span className="text-display text-2xl tracking-wide">
        Kinetic<span className="text-primary">.</span>
      </span>
    </Link>
  );
}
