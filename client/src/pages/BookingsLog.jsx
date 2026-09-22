import React from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useTheme } from "../context/ThemeContext";

export default function BookingsLog() {
  const { currentUser } = useAuth();
  const { bookings } = useSocket();
  const { isDark } = useTheme();

  const T = {
    page: {
      padding: "40px",
      background: isDark ? "var(--ch-canvas)" : "#f5f5f7",
      minHeight: "100vh",
      fontFamily: "SF Pro Text, system-ui, -apple-system, Inter, sans-serif",
      transition: "background 0.3s ease, color 0.3s ease",
    },
    card: {
      background: isDark ? "var(--ch-card-bg)" : "#ffffff",
      border: `1px solid ${isDark ? "var(--ch-hairline)" : "#e0e0e0"}`,
      borderRadius: "18px",
      overflow: "hidden",
    },
    h1: {
      fontFamily: "SF Pro Display, system-ui, -apple-system, Inter, sans-serif",
      fontSize: "28px",
      fontWeight: 600,
      color: isDark ? "#f1f2f6" : "#1d1d1f",
      letterSpacing: "-0.017em",
    },
    muted: {
      fontSize: "14px",
      color: isDark ? "#9ca3af" : "#7a7a7a",
      letterSpacing: "-0.013em",
    },
    chip: (c) => ({
      display: "inline-flex",
      padding: "3px 10px",
      borderRadius: "9999px",
      fontSize: "11px",
      fontWeight: 600,
      letterSpacing: "0.02em",
      textTransform: "uppercase",
      background:
        c === "green"
          ? isDark ? "rgba(52,211,153,0.15)" : "rgba(52,199,89,0.12)"
          : c === "orange"
          ? isDark ? "rgba(251,191,36,0.15)" : "rgba(255,149,0,0.12)"
          : c === "blue"
          ? isDark ? "rgba(96,165,250,0.15)" : "rgba(0,102,204,0.10)"
          : isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
      color:
        c === "green"
          ? isDark ? "#34d399" : "#248a3d"
          : c === "orange"
          ? isDark ? "#fbbf24" : "#c07000"
          : c === "blue"
          ? isDark ? "#60a5fa" : "#0066cc"
          : isDark ? "#9ca3af" : "#7a7a7a",
    }),
  };

  if (!currentUser || currentUser.role !== "Admin") {
    return (
      <div style={{ ...T.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={T.muted}>Admin access required.</div>
      </div>
    );
  }

  const counts = {
    total: bookings.length,
    active: bookings.filter((b) => ["Requested", "Accepted", "In Progress"].includes(b.status)).length,
    completed: bookings.filter((b) => b.status === "Completed").length,
    pending: bookings.filter((b) => b.status === "Requested").length,
  };

  const thStyle = {
    padding: "12px 20px",
    fontSize: "12px",
    fontWeight: 600,
    color: isDark ? "#9ca3af" : "#7a7a7a",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    textAlign: "left",
    borderBottom: `1px solid ${isDark ? "var(--ch-hairline)" : "#f0f0f0"}`,
    background: isDark ? "#171822" : "#f5f5f7",
  };
  const tdStyle = {
    padding: "14px 20px",
    fontSize: "14px",
    color: isDark ? "#e5e7eb" : "#1d1d1f",
    letterSpacing: "-0.013em",
    borderBottom: `1px solid ${isDark ? "var(--ch-hairline)" : "#f0f0f0"}`,
  };

  return (
    <div style={T.page}>
      <div style={{ marginBottom: "28px" }}>
        <div style={T.h1}>Live Monitor</div>
        <div style={{ ...T.muted, marginTop: "6px" }}>Real-time dispatch log across all active and historical bookings.</div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        {[
          { label: "Total Bookings", num: counts.total, color: isDark ? "#f1f2f6" : "#1d1d1f" },
          { label: "Active Now", num: counts.active, color: isDark ? "#60a5fa" : "#0066cc" },
          { label: "Completed", num: counts.completed, color: isDark ? "#34d399" : "#248a3d" },
          { label: "Broadcasting", num: counts.pending, color: isDark ? "#fbbf24" : "#c07000" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: isDark ? "var(--ch-card-bg)" : "#ffffff",
              border: `1px solid ${isDark ? "var(--ch-hairline)" : "#e0e0e0"}`,
              borderRadius: "18px",
              padding: "20px 24px",
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: 600, color: isDark ? "#9ca3af" : "#7a7a7a", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              {s.label}
            </div>
            <div
              style={{
                fontFamily: "SF Pro Display, system-ui, -apple-system, Inter, sans-serif",
                fontSize: "40px",
                fontWeight: 600,
                color: s.color,
                letterSpacing: "-0.022em",
                lineHeight: 1.1,
                marginTop: "4px",
              }}
            >
              {s.num}
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={T.card}>
        <div
          style={{
            padding: "16px 20px",
            borderBottom: `1px solid ${isDark ? "var(--ch-hairline)" : "#f0f0f0"}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: "14px", fontWeight: 600, color: isDark ? "#f1f2f6" : "#1d1d1f" }}>Dispatch Activity Log</div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: isDark ? "#34d399" : "#248a3d", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: "12px", color: isDark ? "#9ca3af" : "#7a7a7a" }}>Live</span>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Customer</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Worker</th>
                <th style={thStyle}>Description</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr
                  key={b.id}
                  onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "rgba(255, 255, 255, 0.03)" : "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: "12px", color: isDark ? "#9ca3af" : "#7a7a7a" }}>
                    {b.id.slice(0, 10)}…
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{b.customerName}</td>
                  <td style={{ ...tdStyle, textTransform: "capitalize", color: isDark ? "#60a5fa" : "#0066cc", fontWeight: 600 }}>
                    {b.serviceCategory}
                  </td>
                  <td style={tdStyle}>
                    {b.workerName ? (
                      <span style={{ fontWeight: 600 }}>{b.workerName}</span>
                    ) : (
                      <span style={{ fontSize: "13px", color: isDark ? "#6b7280" : "#aaa", fontStyle: "italic" }}>Broadcasting…</span>
                    )}
                  </td>
                  <td style={{ ...tdStyle, maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: isDark ? "#9ca3af" : "#7a7a7a" }}>
                    {b.description}
                  </td>
                  <td style={tdStyle}>
                    <span
                      style={T.chip(
                        b.status === "Completed"
                          ? "green"
                          : b.status === "In Progress"
                          ? "blue"
                          : b.status === "Requested"
                          ? "orange"
                          : "gray"
                      )}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: isDark ? "#9ca3af" : "#7a7a7a", fontSize: "14px" }}>
                    No dispatch records yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </div>
  );
}
