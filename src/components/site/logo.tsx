import { Link } from "@tanstack/react-router";
import { useId } from "react";

export function LogoMark({ className = "size-8" }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const curveId = `auctus-curve-${uid}`;

  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={curveId} x1="6" y1="26" x2="30" y2="9" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="55%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>
      </defs>
      <rect
        x="1.25"
        y="1.25"
        width="33.5"
        height="33.5"
        rx="8.5"
        fill="currentColor"
        fillOpacity="0.03"
        stroke="currentColor"
        strokeOpacity="0.14"
        strokeWidth="1"
      />
      {/* Crisp geometric apex "A" */}
      <path
        d="M9.5 26.5L18 8.5L26.5 26.5"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Ascending force-time kinetic curve intersecting the apex */}
      <path
        d="M6.5 23.5C11.5 23.5 14 17.2 18.2 17.2C22.4 17.2 25.2 12.6 29.5 10.5"
        stroke={`url(#${curveId})`}
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
      aria-label="Auctus Performance home"
    >
      <LogoMark className="size-8 text-foreground transition-transform duration-200 group-hover:scale-[1.03]" />
      <span className="font-display text-base font-semibold tracking-tight text-foreground sm:text-lg">
        Auctus <span className="text-sunset">Performance</span>
      </span>
    </Link>
  );
}
