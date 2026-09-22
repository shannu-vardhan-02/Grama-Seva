import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useSocket } from "../context/SocketContext";
import { Check, X, ShieldAlert, CheckCircle } from "lucide-react";

export default function VettingQueue() {
  const { currentUser, users, verifyWorker } = useAuth();
  const { isDark } = useTheme();
  const [filter, setFilter] = useState("Pending");

  if (!currentUser || currentUser.role !== "Admin") {
    return <div style={{ padding: "40px", background: "var(--ch-canvas)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "var(--ch-muted)" }}>Admin access required.</div></div>;
  }

  const workers = users.filter((u) => u.role === "Worker");
  const pending  = workers.filter((w) => !w.workerProfile?.isVerified && w.workerProfile?.proofOfWork?.some((p) => p.status === "Pending"));
  const verified = workers.filter((w) => w.workerProfile?.isVerified);
  const rejected = workers.filter((w) => !w.workerProfile?.isVerified && w.workerProfile?.proofOfWork?.every((p) => p.status === "Rejected"));

  let displayList = [];
  if (filter === "Pending") displayList = pending;
  else if (filter === "Approved") displayList = verified;
  else displayList = [...pending, ...verified, ...rejected];

  return (
    <div style={{ background: "var(--ch-canvas)", color: "var(--ch-ink)", padding: "32px 40px", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: "32px" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", color: "var(--ch-muted)", letterSpacing: "0.2px", marginBottom: "8px" }}>
          Administration
        </div>
        <h1 style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: "28px", fontWeight: 400, color: "var(--ch-primary)", letterSpacing: "-0.02em", margin: 0 }}>
          Vetting Queue
        </h1>
      </div>

      <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
        {["All", "Pending", "Approved"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "6px 16px",
              borderRadius: "32px",
              fontSize: "13px",
              fontFamily: "'JetBrains Mono', monospace",
              textTransform: "uppercase",
              border: filter === f ? "1px solid var(--ch-primary)" : "1px solid var(--ch-hairline)",
              background: filter === f ? "var(--ch-primary)" : "transparent",
              color: filter === f ? "var(--ch-canvas)" : "var(--ch-muted)",
              cursor: "pointer",
              transition: "all 0.15s"
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={{ borderTop: "1px solid var(--ch-hairline)" }}>
        {displayList.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--ch-muted)" }}>No records found.</div>
        ) : (
          displayList.map((w) => {
            const prof = w.workerProfile;
            const photo = prof.proofOfWork?.find((p) => p.status === "Pending")?.url || prof.proofOfWork?.[0]?.url;
            return (
              <div key={w.id} style={{ display: "flex", alignItems: "center", padding: "16px 0", borderBottom: "1px solid var(--ch-hairline)", gap: "16px" }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "50%",
                  background: isDark ? "rgba(52,211,153,0.15)" : "#003c33",
                  color: isDark ? "#34d399" : "#ffffff",
                  border: isDark ? "1px solid rgba(52,211,153,0.3)" : "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "14px", fontWeight: "bold"
                }}>
                  {w.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "15px", fontWeight: 500, color: "var(--ch-primary)" }}>{w.name}</div>
                  <div style={{ fontSize: "13px", color: "var(--ch-body-muted)", marginTop: "4px" }}>{w.email} · {prof.address}</div>
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "var(--ch-muted)", textTransform: "uppercase" }}>
                  {prof.skill}
                </div>
                
                <div style={{ display: "flex", gap: "8px" }}>
                  {!prof.isVerified && (
                    <>
                      <button
                        onClick={() => verifyWorker(w.id, "Approved")}
                        style={{
                          padding: "6px 16px",
                          background: isDark ? "#064e3b" : "#003c33",
                          color: isDark ? "#34d399" : "#ffffff",
                          border: isDark ? "1px solid rgba(52,211,153,0.3)" : "none",
                          borderRadius: "32px", fontSize: "13px", cursor: "pointer"
                        }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => verifyWorker(w.id, "Rejected")}
                        style={{
                          padding: "6px 16px", background: "transparent",
                          color: "var(--ch-error)",
                          border: isDark ? "1px solid rgba(248,113,113,0.3)" : "1px solid #ffad9b",
                          borderRadius: "32px", fontSize: "13px", cursor: "pointer"
                        }}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {prof.isVerified && (
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace", fontSize: "11px",
                      color: "var(--ch-deep-green)",
                      background: isDark ? "rgba(52,211,153,0.12)" : "#edfce9",
                      padding: "4px 8px", borderRadius: "16px"
                    }}>
                      VERIFIED
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
