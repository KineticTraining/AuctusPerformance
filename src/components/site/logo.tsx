import { Link } from "@tanstack/react-router";
import { useId } from "react";

export function LogoMark({ className = "size-8" }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const arcId = `dk-arc-${uid}`;
  const horizonId = `dk-horizon-${uid}`;

  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={arcId} x1="6" y1="24" x2="30" y2="6" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="52%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#FB7185" />
        </linearGradient>
        <linearGradient
          id={horizonId}
          x1="5"
          y1="27"
          x2="31"
          y2="27"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="60%" stopColor="#FB7185" />
          <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="34" height="34" rx="9" fill="currentColor" fillOpacity="0.04" />
      <rect
        x="1"
        y="1"
        width="34"
        height="34"
        rx="9"
        stroke="url(#dk-arc-fallback)"
        strokeOpacity="0"
      />
      {/* Golden-hour horizon arc */}
      <path
        d="M7.5 22.5a10.5 10.5 0 0 1 21 0"
        stroke={`url(#${arcId})`}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Forward kinetic stride / force-time vector */}
      <path
        d="M11 22.5L16.8 11.8L20.8 18.6L26.5 10.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Twilight horizon baseline */}
      <line
        x1="6.5"
        y1="27"
        x2="29.5"
        y2="27"
        stroke={`url(#${horizonId})`}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo() {
  return (
    <Link
      to="/"
      className="group flex shrink-0 items-center gap-2.5 whitespace-nowrap"
      aria-label="Dusk Kinetic Performance home"
    >
      <LogoMark className="size-8 text-foreground transition-transform duration-200 group-hover:scale-[1.03]" />
      <span className="font-display text-base font-semibold tracking-tight text-foreground sm:text-lg">
        Dusk <span className="text-sunset">Kinetic</span>
      </span>
    </Link>
  );
}
