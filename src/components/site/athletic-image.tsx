import { useEffect, useState, type ImgHTMLAttributes } from "react";
import { DEFAULT_GYM_FALLBACK } from "@/lib/media";
import { cn } from "@/lib/utils";

interface AthleticImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

/**
 * Resilient responsive image that keeps a vibrant dusk gradient surface underneath
 * and cleanly swaps to a local in-gym fallback if any image fails to load.
 */
export function AthleticImage({
  src,
  alt,
  className,
  fallbackSrc = DEFAULT_GYM_FALLBACK,
  onError,
  ...props
}: AthleticImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <img
      src={failed ? fallbackSrc : src}
      alt={alt ?? ""}
      referrerPolicy="no-referrer"
      onError={(e) => {
        if (!failed) {
          setFailed(true);
        }
        onError?.(e);
      }}
      className={cn(
        "bg-gradient-to-br from-brand-amber/20 via-brand-coral/15 to-brand-indigo/25",
        className,
      )}
      {...props}
    />
  );
}
