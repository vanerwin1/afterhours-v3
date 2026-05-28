"use client";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
  /**
   * How visible the aurora is.
   * "subtle"  (default) — barely-there shimmer, matches AfterHours dark palette.
   * "medium"  — clearly visible, good for standalone hero use.
   * "vivid"   — original Aceternity intensity.
   */
  intensity?: "subtle" | "medium" | "vivid";
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = false,
  intensity = "subtle",
  ...props
}: AuroraBackgroundProps) => {
  const opacityClass =
    intensity === "subtle" ? "opacity-[0.17]" :
    intensity === "medium" ? "opacity-[0.30]" :
    "opacity-50";

  return (
    <div
      className={cn("relative bg-transparent", className)}
      {...props}
    >
      {/* ── Aurora shimmer layer ──────────────────────────────────────────── */}
      {/* position:absolute + inset-0 → spans the full height of this wrapper */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div
          className={cn(
            // Dark-mode only gradients — site is always dark, no invert trick needed.
            // --blue-600, --indigo-400, etc. are declared in globals.css @theme inline
            // because Tailwind v4 doesn't use tailwind.config.js (no addVariablesForColors).
            `[--dark-gradient:repeating-linear-gradient(100deg,#000_0%,#000_7%,transparent_10%,transparent_12%,#000_16%)]
             [--aurora:repeating-linear-gradient(100deg,var(--blue-600,#2563eb)_10%,var(--indigo-400,#818cf8)_15%,var(--blue-400,#60a5fa)_20%,var(--violet-400,#a78bfa)_25%,var(--blue-500,#3b82f6)_30%)]
             [background-image:var(--dark-gradient),var(--aurora)]
             [background-size:300%,_200%]
             [background-position:50%_50%,50%_50%]
             filter blur-[14px]
             after:content-[""] after:absolute after:inset-0
             after:[background-image:var(--dark-gradient),var(--aurora)]
             after:[background-size:200%,_100%]
             after:animate-aurora after:[background-attachment:fixed] after:mix-blend-difference
             pointer-events-none absolute -inset-[10px] will-change-[background-position]`,
            opacityClass,
            showRadialGradient &&
              "[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]"
          )}
        />
      </div>

      {/* ── Content — sits above the aurora via relative + z-index ──────── */}
      <div className="relative z-[1]">{children}</div>
    </div>
  );
};
