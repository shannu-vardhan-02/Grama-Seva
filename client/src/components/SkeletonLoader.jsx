import React from "react";

export function SkeletonPulse({ className = "", style = {}, width, height, borderRadius = "8px" }) {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        width: width || "100%",
        height: height || "16px",
        borderRadius,
        background: "linear-gradient(90deg, #ece6dc 0%, #f7f3ed 50%, #ece6dc 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmerWave 1.6s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

export function WorkerCardSkeleton() {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e6dfd8",
        borderRadius: "16px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        {/* Avatar */}
        <SkeletonPulse width="48px" height="48px" borderRadius="50%" />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* Name */}
          <SkeletonPulse width="65%" height="18px" />
          {/* Village & Exp */}
          <SkeletonPulse width="40%" height="12px" />
        </div>
      </div>

      {/* Bio lines */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <SkeletonPulse width="100%" height="12px" />
        <SkeletonPulse width="85%" height="12px" />
      </div>

      {/* Services tags */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <SkeletonPulse width="80px" height="24px" borderRadius="9999px" />
        <SkeletonPulse width="110px" height="24px" borderRadius="9999px" />
        <SkeletonPulse width="70px" height="24px" borderRadius="9999px" />
      </div>

      {/* Footer buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", paddingTop: "14px", borderTop: "1px solid #f0ebe4" }}>
        <SkeletonPulse width="90px" height="32px" borderRadius="8px" />
        <SkeletonPulse width="110px" height="36px" borderRadius="8px" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e6dfd8",
        borderRadius: "14px",
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <SkeletonPulse width="50%" height="12px" />
      <SkeletonPulse width="35%" height="32px" borderRadius="6px" />
    </div>
  );
}

export function BookingRowSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 18px",
        background: "#faf9f5",
        border: "1px solid #e6dfd8",
        borderRadius: "12px",
        gap: "14px",
      }}
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
        <SkeletonPulse width="60%" height="16px" />
        <SkeletonPulse width="35%" height="12px" />
      </div>
      <SkeletonPulse width="90px" height="26px" borderRadius="9999px" />
    </div>
  );
}
