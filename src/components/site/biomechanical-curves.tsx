import { useId } from "react";

/**
 * Clean geometric force-time and movement trajectory graphics.
 * Subtle biomechanical line art for Auctus Performance without neon glows or generic blobs.
 */
export function ForceCurveAccent({ className = "w-full max-w-md" }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const strokeGrad = `force-grad-${uid}`;
  const fillGrad = `force-fill-${uid}`;

  return (
    <svg
      viewBox="0 0 420 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={strokeGrad}
          x1="16"
          y1="118"
          x2="404"
          y2="22"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="var(--brand-amber)" />
          <stop offset="52%" stopColor="var(--brand-orange)" />
          <stop offset="100%" stopColor="var(--brand-indigo)" />
        </linearGradient>
        <linearGradient id={fillGrad} x1="0" y1="20" x2="0" y2="122" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--brand-orange)" stopOpacity="0.14" />
          <stop offset="100%" stopColor="var(--brand-orange)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Calibrated axis hairlines */}
      <line
        x1="16"
        y1="118"
        x2="404"
        y2="118"
        stroke="currentColor"
        strokeOpacity="0.14"
        strokeWidth="1"
      />
      <line
        x1="16"
        y1="22"
        x2="16"
        y2="118"
        stroke="currentColor"
        strokeOpacity="0.14"
        strokeWidth="1"
      />
      <line
        x1="16"
        y1="70"
        x2="404"
        y2="70"
        stroke="currentColor"
        strokeOpacity="0.07"
        strokeDasharray="3 5"
        strokeWidth="1"
      />

      {/* Area fill beneath force-time trajectory */}
      <path
        d="M16 118 C68 118, 92 98, 128 82 C164 66, 188 86, 224 58 C258 31, 294 24, 344 26 L404 26 L404 118 Z"
        fill={`url(#${fillGrad})`}
      />

      {/* Primary force-time curve */}
      <path
        d="M16 118 C68 118, 92 98, 128 82 C164 66, 188 86, 224 58 C258 31, 294 24, 344 26 L404 26"
        stroke={`url(#${strokeGrad})`}
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Secondary baseline recovery envelope */}
      <path
        d="M16 118 C80 116, 145 104, 212 94 C276 84, 338 72, 404 60"
        stroke="currentColor"
        strokeOpacity="0.22"
        strokeDasharray="4 4"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Inflection nodes */}
      <circle cx="128" cy="82" r="3" fill="var(--brand-amber)" />
      <circle cx="224" cy="58" r="3.5" fill="var(--brand-orange)" />
      <circle cx="344" cy="26" r="3" fill="var(--brand-indigo)" />
    </svg>
  );
}

export function StrideVectorDivider({ className = "w-full" }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const grad = `stride-grad-${uid}`;

  return (
    <svg
      viewBox="0 0 640 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={grad} x1="0" y1="16" x2="640" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--brand-amber)" stopOpacity="0.55" />
          <stop offset="50%" stopColor="var(--brand-orange)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="var(--brand-indigo)" stopOpacity="0.45" />
        </linearGradient>
      </defs>
      <line
        x1="0"
        y1="16"
        x2="640"
        y2="16"
        stroke="currentColor"
        strokeOpacity="0.08"
        strokeWidth="1"
      />
      <path
        d="M0 16 H180 C210 16, 224 6, 248 6 C272 6, 286 26, 310 26 C334 26, 348 16, 378 16 H640"
        stroke={`url(#${grad})`}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
