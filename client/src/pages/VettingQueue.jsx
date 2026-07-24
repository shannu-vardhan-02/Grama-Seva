import React from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { Check, X, ShieldAlert, CheckCircle } from "lucide-react";

const T = {
  page:  { padding: "40px", background: "#f5f5f7", minHeight: "100vh", fontFamily: "SF Pro Text, system-ui, -apple-system, Inter, sans-serif" },
  card:  { background: "#ffffff", border: "1px solid #e0e0e0", borderRadius: "18px", padding: "28px" },
  h1:    { fontFamily: "SF Pro Display, system-ui, -apple-system, Inter, sans-serif", fontSize: "28px", fontWeight: 600, color: "#1d1d1f", letterSpacing: "-0.017em" },
  muted: { fontSize: "14px", color: "#7a7a7a", letterSpacing: "-0.013em" },
  value: { fontSize: "15px", fontWeight: 600, color: "#1d1d1f", letterSpacing: "-0.013em" },
  chip:  (c) => ({ display: "inline-flex", padding: "3px 10px", borderRadius: "9999px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.02em", textTransform: "uppercase",
    background: c==="blue"?"rgba(0,102,204,0.10)":c==="green"?"rgba(52,199,89,0.12)":c==="orange"?"rgba(255,149,0,0.12)":"rgba(0,0,0,0.06)",
    color:      c==="blue"?"#0066cc":c==="green"?"#248a3d":c==="orange"?"#c07000":"#7a7a7a" }),
};

export default function VettingQueue() {
  const { currentUser, users, verifyWorker } = useAuth();

  if (!currentUser || currentUser.role !== "Admin") {
    return <div style={{ ...T.page, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={T.muted}>Admin access required.</div></div>;
  }

  const workers = users.filter((u) => u.role === "Worker");
  const pending  = workers.filter((w) => !w.workerProfile?.isVerified && w.workerProfile?.proofOfWork?.some((p) => p.status === "Pending"));
  const verified = workers.filter((w) => w.workerProfile?.isVerified);
  const rejected = workers.filter((w) => !w.workerProfile?.isVerified && w.workerProfile?.proofOfWork?.every((p) => p.status === "Rejected"));

  return (
    <div style={T.page}>
      <div style={{ marginBottom: "32px" }}>
        <div style={T.h1}>Vetting Queue</div>
        <div style={{ ...T.muted, marginTop: "6px" }}>Review and approve worker profile submissions.</div>
      </div>

      {/* Summary row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "28px" }}>
        {[
          { label: "Pending Review", num: pending.length,  color: "#c07000" },
          { label: "Verified",       num: verified.length, color: "#248a3d" },
          { label: "Rejected",       num: rejected.length, color: "#c0392b" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#ffffff", border: "1px solid #e0e0e0", borderRadius: "18px", padding: "20px 24px" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#7a7a7a", letterSpacing: "0.04em", textTransform: "uppercase" }}>{s.label}</div>
            <div style={{ fontFamily: "SF Pro Display, system-ui, -apple-system, Inter, sans-serif", fontSize: "40px", fontWeight: 600, letterSpacing: "-0.022em", color: s.color, lineHeight: 1.1, marginTop: "4px" }}>{s.num}</div>
          </div>
        ))}
      </div>

      {/* Pending applications */}
      <div style={T.card}>
        <div style={{ fontSize: "14px", fontWeight: 600, color: "#1d1d1f", marginBottom: "20px" }}>
          Pending Applications ({pending.length})
        </div>

        {pending.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <CheckCircle size={48} color="#e0e0e0" style={{ margin: "0 auto 14px" }} />
            <div style={{ fontSize: "17px", fontWeight: 600, color: "#1d1d1f" }}>Queue is clear</div>
            <div style={{ ...T.muted, marginTop: "6px" }}>All worker applications have been reviewed.</div>
          </div>
        ) : pending.map((w, i) => {
          const prof  = w.workerProfile;
          const photo = prof.proofOfWork?.find((p) => p.status === "Pending")?.url;
          return (
            <div key={w.id} style={{
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              padding: "20px 0",
              borderTop: i > 0 ? "1px solid #f0f0f0" : "none",
              gap: "20px",
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  {/* Avatar */}
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(0,102,204,0.10)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 600, color: "#0066cc", flexShrink: 0 }}>
                    {w.name.charAt(0)}
                  </div>
                  <div>
                    <div style={T.value}>{w.name}</div>
                    <div style={{ ...T.muted, fontSize: "13px" }}>{w.email} · {w.phone}</div>
                  </div>
                  <span style={T.chip("blue")}>{prof.skill}</span>
                </div>

                <div style={{ display: "flex", gap: "20px", marginBottom: "8px" }}>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 600, color: "#7a7a7a", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: "2px" }}>Experience</div>
                    <div style={{ fontSize: "13px", color: "#1d1d1f" }}>{prof.experience} years</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 600, color: "#7a7a7a", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: "2px" }}>Service Area</div>
                    <div style={{ fontSize: "13px", color: "#1d1d1f" }}>{prof.address}</div>
                  </div>
                </div>

                {prof.bio && (
                  <div style={{ fontSize: "13px", color: "#7a7a7a", fontStyle: "italic", marginBottom: "10px" }}>"{prof.bio}"</div>
                )}

                {photo && (
                  <div style={{ width: "160px", borderRadius: "8px", overflow: "hidden", border: "1px solid #e0e0e0" }}>
                    <img src={photo} alt="Proof of work" style={{ width: "100%", height: "90px", objectFit: "cover", display: "block" }} />
                  </div>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
                <button onClick={() => verifyWorker(w.id, "Approved")} style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "9px 18px", background: "#248a3d", color: "#ffffff",
                  border: "none", borderRadius: "9999px", fontSize: "14px", fontWeight: 400,
                  cursor: "pointer", fontFamily: "SF Pro Text, system-ui, -apple-system, Inter, sans-serif",
                  transition: "opacity 0.15s, transform 0.1s",
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.95)"}
                onMouseUp={(e)   => e.currentTarget.style.transform = "scale(1)"}
                >
                  <Check size={14} /> Approve
                </button>
                <button onClick={() => verifyWorker(w.id, "Rejected")} style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "9px 18px", background: "transparent", color: "#ff3b30",
                  border: "1px solid rgba(255,59,48,0.3)", borderRadius: "9999px",
                  fontSize: "14px", fontWeight: 400, cursor: "pointer",
                  fontFamily: "SF Pro Text, system-ui, -apple-system, Inter, sans-serif",
                  transition: "opacity 0.15s, transform 0.1s",
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.95)"}
                onMouseUp={(e)   => e.currentTarget.style.transform = "scale(1)"}
                >
                  <X size={14} /> Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Approved workers */}
      {verified.length > 0 && (
        <div style={{ ...T.card, marginTop: "20px" }}>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#1d1d1f", marginBottom: "16px" }}>
            Verified Workers ({verified.length})
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" }}>
            {verified.map((w) => (
              <div key={w.id} style={{ padding: "14px", background: "#f5f5f7", borderRadius: "11px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#1d1d1f" }}>{w.name}</div>
                  <span style={T.chip("green")}>Verified</span>
                </div>
                <div style={{ fontSize: "13px", color: "#7a7a7a", textTransform: "capitalize" }}>
                  {w.workerProfile.skill} · {w.workerProfile.experience} yrs
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
