import React from "react";

/**
 * Grama Seva Official Brand Logo
 * Combines:
 * 1. The Village Sunrise Arc (Community & Rural Growth)
 * 2. Village Shelter Rooftop (Home & Local Services - Grama)
 * 3. Connected Hands / Heart Nodes (Trust, Craftsmanship & Service - Seva)
 */
export default function GramaSevaLogo({
  size = 32,
  showText = false,
  textVariant = "light", // "light" for dark backgrounds, "dark" for light backgrounds
  style = {},
  className = "",
}) {
  const isDarkText = textVariant === "dark";

  return (
    <div
      className={`grama-seva-logo-lockup ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        userSelect: "none",
        ...style,
      }}
    >
      {/* SVG Icon Emblem */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="gsCoralGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#e5896e" />
            <stop offset="100%" stopColor="#cc785c" />
          </linearGradient>
          <linearGradient id="gsSunGrad" x1="12" y1="4" x2="36" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f5b061" />
            <stop offset="100%" stopColor="#cc785c" />
          </linearGradient>
        </defs>

        {/* Outer squircle tile */}
        <rect width="48" height="48" rx="12" fill="url(#gsCoralGrad)" />

        {/* Rising Sun Rays */}
        <path
          d="M14 18L11 15M24 13V9M34 18L37 15"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeOpacity="0.85"
        />

        {/* Sunrise Arch */}
        <path
          d="M15 22C15 17.0294 19.0294 13 24 13C28.9706 13 33 17.0294 33 22"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeOpacity="0.8"
        />

        {/* Village Rooftop Canopy (Grama) */}
        <path
          d="M9 25L24 14L39 25"
          stroke="#ffffff"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Community Helping Hands / Heart (Seva) */}
        <path
          d="M19 28.5C16.5 26 16.5 22.5 19 20C21.5 17.5 24 20 24 20C24 20 26.5 17.5 29 20C31.5 22.5 31.5 26 29 28.5L24 33.5L19 28.5Z"
          fill="#181715"
          fillOpacity="0.9"
        />

        {/* Central Interlocking Hands Detail */}
        <path
          d="M21 24.5L24 27.5L27 24.5M24 27.5V31"
          stroke="#ffffff"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Typography Brand Lockup (Optional) */}
      {showText && (
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
          <span
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: `${Math.max(16, size * 0.52)}px`,
              fontWeight: 600,
              color: isDarkText ? "#141413" : "#faf9f5",
              letterSpacing: "-0.02em",
            }}
          >
            Grama Seva
          </span>
          <span
            style={{
              fontFamily: "'Inter', -apple-system, sans-serif",
              fontSize: `${Math.max(10, size * 0.3)}px`,
              fontWeight: 500,
              color: isDarkText ? "#8e8b82" : "#a09d96",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              marginTop: "3px",
            }}
          >
            Rural Community Portal
          </span>
        </div>
      )}
    </div>
  );
}
