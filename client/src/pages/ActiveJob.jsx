import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { MapPin, Star, CheckCircle, Clock, Play, Check, AlertTriangle } from "lucide-react";

const T = {
  page:  { padding: "40px", background: "#f5f5f7", minHeight: "100vh", fontFamily: "SF Pro Text, system-ui, -apple-system, Inter, sans-serif" },
  card:  { background: "#ffffff", border: "1px solid #e0e0e0", borderRadius: "18px", padding: "28px" },
  h1:    { fontFamily: "SF Pro Display, system-ui, -apple-system, Inter, sans-serif", fontSize: "28px", fontWeight: 600, color: "#1d1d1f", letterSpacing: "-0.017em" },
  muted: { fontSize: "14px", color: "#7a7a7a", letterSpacing: "-0.013em" },
  label: { fontSize: "12px", fontWeight: 600, color: "#7a7a7a", letterSpacing: "0.04em", textTransform: "uppercase" },
  value: { fontSize: "15px", fontWeight: 600, color: "#1d1d1f", letterSpacing: "-0.013em" },
  chip:  (c) => ({ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: "9999px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.02em", textTransform: "uppercase",
    background: c==="blue"?"rgba(0,102,204,0.10)":c==="green"?"rgba(52,199,89,0.12)":c==="orange"?"rgba(255,149,0,0.12)":"rgba(0,0,0,0.06)",
    color:      c==="blue"?"#0066cc":c==="green"?"#248a3d":c==="orange"?"#c07000":"#7a7a7a" }),
  btnBlue:  { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "11px 22px", background: "#0066cc", color: "#fff", border: "none", borderRadius: "9999px", fontSize: "15px", fontWeight: 400, cursor: "pointer", fontFamily: "SF Pro Text, system-ui, -apple-system, Inter, sans-serif", transition: "opacity 0.15s, transform 0.1s", letterSpacing: "-0.013em" },
  btnGreen: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "11px 22px", background: "#248a3d", color: "#fff", border: "none", borderRadius: "9999px", fontSize: "15px", fontWeight: 400, cursor: "pointer", fontFamily: "SF Pro Text, system-ui, -apple-system, Inter, sans-serif", transition: "opacity 0.15s, transform 0.1s", letterSpacing: "-0.013em" },
};

function StepIndicator({ steps, current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
      {steps.map((step, i) => {
        const done    = i < current;
        const active  = i === current;
        const pending = i > current;
        return (
          <React.Fragment key={step}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                background: done ? "#248a3d" : active ? "#0066cc" : "#f5f5f7",
                border: done ? "1px solid #248a3d" : active ? "1px solid #0066cc" : "1px solid #e0e0e0",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {done
                  ? <Check size={14} color="#fff" />
                  : <span style={{ fontSize: "12px", fontWeight: 600, color: active ? "#fff" : "#7a7a7a" }}>{i + 1}</span>
                }
              </div>
              <span style={{ fontSize: "11px", fontWeight: active ? 600 : 400, color: active ? "#0066cc" : done ? "#248a3d" : "#7a7a7a", whiteSpace: "nowrap" }}>{step}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ height: "1px", flex: 1, background: done ? "#248a3d" : "#e0e0e0", marginBottom: "18px", minWidth: "32px" }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function ActiveJob() {
  const { currentUser } = useAuth();
  const { bookings, reviews, acceptBooking, startBooking, completeBooking, addReview } = useSocket();

  const [rating,  setRating]  = useState(5);
  const [comment, setComment] = useState("");
  const [reviewed, setReviewed] = useState(false);

  if (!currentUser) return null;

  const STEPS = ["Requested", "Accepted", "In Progress", "Completed"];

  if (currentUser.role === "Customer") {
    const mine   = bookings.filter((b) => b.customer === currentUser.id);
    const active = mine.find((b) => ["Requested","Accepted","In Progress","Completed"].includes(b.status));

    if (!active) {
      return (
        <div style={T.page}>
          <div style={T.h1}>Active Job</div>
          <div style={{ ...T.muted, marginTop: "6px", marginBottom: "32px" }}>Track your current dispatch in real time.</div>
          <div style={{ ...T.card, textAlign: "center", padding: "60px 40px" }}>
            <CheckCircle size={48} color="#e0e0e0" style={{ margin: "0 auto 16px" }} />
            <div style={{ fontSize: "17px", fontWeight: 600, color: "#1d1d1f" }}>No active request</div>
            <div style={{ ...T.muted, marginTop: "6px" }}>Head to "Book Service" to submit a new request.</div>
          </div>
        </div>
      );
    }

    const stepIdx = STEPS.indexOf(active.status);
    const alreadyReviewed = reviews.some((r) => r.bookingId === active.id && r.customer === currentUser.id);

    const handleReview = (e) => {
      e.preventDefault();
      addReview({ bookingId: active.id, workerId: active.worker, workerName: active.workerName, rating, comment });
      setReviewed(true);
    };

    return (
      <div style={T.page}>
        <div style={T.h1}>Active Job</div>
        <div style={{ ...T.muted, marginTop: "6px", marginBottom: "32px" }}>Track your dispatch in real time.</div>

        <div style={{ maxWidth: "680px" }}>
          {/* Progress steps */}
          <div style={{ ...T.card, marginBottom: "20px" }}>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#1d1d1f", marginBottom: "20px" }}>Dispatch Progress</div>
            <StepIndicator steps={STEPS} current={stepIdx} />
          </div>

          {/* Details */}
          <div style={T.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <div style={{ fontSize: "17px", fontWeight: 600, color: "#1d1d1f", textTransform: "capitalize", marginBottom: "6px" }}>
                  {active.serviceCategory}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <MapPin size={13} color="#0066cc" />
                  <span style={T.muted}>{active.address}</span>
                </div>
              </div>
              <span style={T.chip(active.status === "Completed" ? "green" : active.status === "Requested" ? "orange" : "blue")}>
                {active.status}
              </span>
            </div>

            <div style={{ padding: "14px", background: "#f5f5f7", borderRadius: "11px", marginBottom: "20px" }}>
              <div style={{ ...T.label, marginBottom: "6px" }}>Job Description</div>
              <div style={T.muted}>{active.description}</div>
            </div>

            {active.status === "Requested" && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ display: "inline-block", width: "24px", height: "24px", border: "2px solid #0066cc", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#0066cc", marginTop: "12px" }}>Broadcasting to nearby workers…</div>
                <div style={{ ...T.muted, marginTop: "4px" }}>Auto-assigns in 8 seconds if no one accepts.</div>
              </div>
            )}

            {(active.status === "Accepted" || active.status === "In Progress") && active.workerName && (
              <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px", background: "rgba(0,102,204,0.04)", border: "1px solid rgba(0,102,204,0.12)", borderRadius: "11px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(0,102,204,0.10)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 600, color: "#0066cc", flexShrink: 0 }}>
                  {active.workerName.charAt(0)}
                </div>
                <div>
                  <div style={T.value}>{active.workerName}</div>
                  <div style={T.muted}>Worker assigned · heading to your location</div>
                </div>
              </div>
            )}

            {active.status === "Completed" && !alreadyReviewed && !reviewed && (
              <form onSubmit={handleReview} style={{ marginTop: "20px", padding: "20px", background: "#f5f5f7", borderRadius: "11px" }}>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#1d1d1f", marginBottom: "14px" }}>Rate this service</div>
                <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
                  {[1,2,3,4,5].map((s) => (
                    <button key={s} type="button" onClick={() => setRating(s)} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}>
                      <Star size={24} fill={s <= rating ? "#0066cc" : "none"} color={s <= rating ? "#0066cc" : "#e0e0e0"} />
                    </button>
                  ))}
                </div>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows="3"
                  placeholder="Share your experience…"
                  style={{ width: "100%", padding: "10px 14px", background: "#ffffff", border: "1px solid #e0e0e0", borderRadius: "8px", fontSize: "15px", fontFamily: "SF Pro Text, system-ui, -apple-system, Inter, sans-serif", outline: "none", resize: "vertical", marginBottom: "12px", boxSizing: "border-box" }}
                />
                <button type="submit" style={T.btnBlue}><Star size={14} /> Submit Review</button>
              </form>
            )}

            {(reviewed || alreadyReviewed) && active.status === "Completed" && (
              <div style={{ marginTop: "20px", padding: "16px", background: "rgba(52,199,89,0.06)", border: "1px solid rgba(52,199,89,0.2)", borderRadius: "11px", fontSize: "14px", color: "#248a3d", display: "flex", gap: "8px", alignItems: "center" }}>
                <CheckCircle size={16} /> Thank you for your review!
              </div>
            )}
          </div>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (currentUser.role === "Worker") {
    const active = bookings.find((b) => b.worker === currentUser.id && ["Accepted","In Progress"].includes(b.status));
    const incoming = bookings.filter((b) => b.status === "Requested" && !b.worker);

    return (
      <div style={T.page}>
        <div style={T.h1}>Active Job</div>
        <div style={{ ...T.muted, marginTop: "6px", marginBottom: "32px" }}>Manage your current assignment and incoming requests.</div>

        <div style={{ maxWidth: "680px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Current assignment */}
          <div style={T.card}>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#1d1d1f", marginBottom: "16px" }}>Current Assignment</div>
            {active ? (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                  <div>
                    <div style={{ fontSize: "17px", fontWeight: 600, color: "#1d1d1f", textTransform: "capitalize" }}>{active.serviceCategory}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "4px" }}>
                      <MapPin size={13} color="#0066cc" />
                      <span style={T.muted}>{active.address}</span>
                    </div>
                  </div>
                  <span style={T.chip(active.status === "In Progress" ? "blue" : "orange")}>{active.status}</span>
                </div>
                <div style={{ padding: "12px", background: "#f5f5f7", borderRadius: "11px", marginBottom: "16px" }}>
                  <div style={T.muted}>{active.description}</div>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  {active.status === "Accepted"
                    ? <button onClick={() => startBooking(active.id)} style={T.btnBlue}><Play size={14} /> Start Work</button>
                    : <button onClick={() => completeBooking(active.id)} style={T.btnGreen}><CheckCircle size={14} /> Mark Complete</button>
                  }
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <Clock size={36} color="#e0e0e0" style={{ margin: "0 auto 10px" }} />
                <div style={{ fontSize: "15px", fontWeight: 600, color: "#1d1d1f" }}>No active assignment</div>
                <div style={{ ...T.muted, marginTop: "4px" }}>Incoming requests will appear below.</div>
              </div>
            )}
          </div>

          {/* Incoming requests */}
          {incoming.length > 0 && (
            <div style={T.card}>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#1d1d1f", marginBottom: "14px" }}>Incoming Requests ({incoming.length})</div>
              {incoming.map((b) => (
                <div key={b.id} style={{ padding: "14px", background: "#f5f5f7", borderRadius: "11px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#1d1d1f", textTransform: "capitalize" }}>{b.serviceCategory}</div>
                    <div style={{ ...T.muted, marginTop: "2px" }}>{b.customerName} · {b.address}</div>
                  </div>
                  <button onClick={() => acceptBooking(b.id)} style={{ padding: "8px 16px", background: "#0066cc", color: "#fff", border: "none", borderRadius: "9999px", fontSize: "13px", fontWeight: 400, cursor: "pointer", flexShrink: 0 }}>
                    Accept
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return null;
}
