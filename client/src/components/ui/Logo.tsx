import React from "react";

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

export default function Logo({ size = 36, showWordmark = true, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`} style={{ fontFamily: "var(--font-sora)" }}>
      {/* SVG Logo: minimalist magnifying glass with cyan data-wave */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="DataSearch logo"
      >
        {/* Outer lens circle */}
        <circle
          cx="17"
          cy="17"
          r="12"
          stroke="oklch(0.93 0.003 286)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Inner lens glow fill */}
        <circle
          cx="17"
          cy="17"
          r="12"
          fill="oklch(0.65 0.18 200 / 0.06)"
        />
        {/* Data-wave — cyan path inside the lens */}
        <path
          d="M10 17 C12 14, 14 20, 17 17 C20 14, 22 20, 24 17"
          stroke="oklch(0.65 0.18 200)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Handle */}
        <line
          x1="26"
          y1="26"
          x2="36"
          y2="36"
          stroke="oklch(0.93 0.003 286)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>

      {showWordmark && (
        <span
          style={{
            fontFamily: "var(--font-sora)",
            fontWeight: 700,
            fontSize: "1.25rem",
            letterSpacing: "-0.02em",
            color: "oklch(0.93 0.003 286)",
          }}
        >
          Data
          <span style={{ color: "oklch(0.65 0.18 200)" }}>Search</span>
        </span>
      )}
    </div>
  );
}
