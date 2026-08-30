import React from "react";
import logoImg from "../assets/grama-seva-logo.jpg";

/**
 * Grama Seva Official Brand Logo
 * Features the official emblem: Village Shelter + Sunrise Arc + Interlocking Handshake Heart
 */
export default function GramaSevaLogo({
  size = 36,
  showText = false,
  textVariant = "light", // "light" for dark bg, "dark" for light bg
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
        gap: "12px",
        userSelect: "none",
        ...style,
      }}
    >
      {/* High-Res Official Brand Image Emblem Tile */}
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: `${Math.max(6, Math.round(size * 0.22))}px`,
          overflow: "hidden",
          flexShrink: 0,
          background: "#F4EFEA",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={logoImg}
          alt="Grama Seva Logo"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>

      {/* Typography Brand Lockup */}
      {showText && (
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
          <span
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: `${Math.max(16, Math.round(size * 0.52))}px`,
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
              fontSize: `${Math.max(10, Math.round(size * 0.28))}px`,
              fontWeight: 500,
              color: isDarkText ? "#8e8b82" : "#a09d96",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              marginTop: "2px",
            }}
          >
            Rural Community Services
          </span>
        </div>
      )}
    </div>
  );
}
