import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useTheme } from "../context/ThemeContext";
import { Search, Phone, Star, MapPin, Award, CheckCircle, ShieldAlert, Check, X, Copy, Filter, Navigation, Edit3, ArrowRight, Briefcase, Users, ClipboardList } from "lucide-react";
import { StatCardSkeleton, BookingRowSkeleton } from "../components/SkeletonLoader";

export default function Dashboard() {
  const { currentUser, users, verifyWorker } = useAuth();

  if (!currentUser) return null;

  if (currentUser.role === "Customer")
    return <CustomerSearchDashboard user={currentUser} users={users} />;
  if (currentUser.role === "Worker")
    return <WorkerView user={currentUser} />;
  if (currentUser.role === "Admin")
    return <AdminView user={currentUser} users={users} verifyWorker={verifyWorker} />;
  return null;
}

/* ─────────────────────────────────────────────────────────
   CUSTOMER DASHBOARD
───────────────────────────────────────────────────────── */
function CustomerSearchDashboard({ user, users }) {
  const { bookings } = useSocket();
  const { isDark } = useTheme();

  const myBookings = bookings.filter(b => {
    const custId = b.customer?._id || b.customer;
    return custId === (user._id || user.id);
  });
  const activeBookings = myBookings.filter(b => ['Requested', 'Accepted', 'In Progress'].includes(b.status));
  const completedBookings = myBookings.filter(b => b.status === 'Completed');
  const verifiedWorkers = users.filter(u => u.role === 'Worker' && u.workerProfile?.isVerified);

  return (
    <div style={{ background: "var(--ch-canvas, #ffffff)", minHeight: "100vh", fontFamily: "'Inter', sans-serif", padding: "32px 40px", transition: "background 0.3s ease" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* Welcome Header */}
        <div style={{ marginBottom: "36px" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--ch-muted, #93939f)", textTransform: "uppercase", letterSpacing: "0.2px", marginBottom: "8px" }}>OVERVIEW</div>
          <h1 style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: "36px", fontWeight: 400, color: "var(--ch-primary, #17171c)", letterSpacing: "-0.04em", margin: 0 }}>
            Welcome back, {user.name?.split(" ")[0] || "Customer"}
          </h1>
          <p style={{ fontSize: "15px", color: "var(--ch-body-muted, #616161)", marginTop: "8px" }}>
            Your personal dashboard — view your activity and find skilled workers in your village area.
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
          <div style={{ background: "var(--ch-card-bg, #ffffff)", border: "1px solid var(--ch-hairline, #d9d9dd)", borderRadius: "8px", padding: "20px 24px", borderLeft: "3px solid var(--ch-coral, #ff7759)" }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", fontWeight: 400, color: "var(--ch-muted, #93939f)", textTransform: "uppercase", letterSpacing: "0.2px" }}>Active Requests</div>
            <div style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: "36px", fontWeight: 400, color: "var(--ch-coral, #ff7759)", marginTop: "8px", lineHeight: 1 }}>{activeBookings.length}</div>
          </div>
          <div style={{ background: "var(--ch-card-bg, #ffffff)", border: "1px solid var(--ch-hairline, #d9d9dd)", borderRadius: "8px", padding: "20px 24px", borderLeft: `3px solid ${isDark ? "#34d399" : "var(--ch-deep-green, #003c33)"}` }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", fontWeight: 400, color: "var(--ch-muted, #93939f)", textTransform: "uppercase", letterSpacing: "0.2px" }}>Completed Jobs</div>
            <div style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: "36px", fontWeight: 400, color: isDark ? "#34d399" : "var(--ch-deep-green, #003c33)", marginTop: "8px", lineHeight: 1 }}>{completedBookings.length}</div>
          </div>
          <div style={{ background: "var(--ch-card-bg, #ffffff)", border: "1px solid var(--ch-hairline, #d9d9dd)", borderRadius: "8px", padding: "20px 24px", borderLeft: `3px solid ${isDark ? "#60a5fa" : "var(--ch-primary, #17171c)"}` }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", fontWeight: 400, color: "var(--ch-muted, #93939f)", textTransform: "uppercase", letterSpacing: "0.2px" }}>Available Workers</div>
            <div style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: "36px", fontWeight: 400, color: isDark ? "#60a5fa" : "var(--ch-primary, #17171c)", marginTop: "8px", lineHeight: 1 }}>{verifiedWorkers.length}</div>
          </div>
        </div>

        {/* Quick Action Banner */}
        <a
          href="/book-service"
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: isDark ? "linear-gradient(135deg, #164e3f 0%, #0d2822 100%)" : "var(--ch-deep-green, #003c33)",
            border: isDark ? "1px solid rgba(52,211,153,0.3)" : "none",
            color: "#ffffff",
            borderRadius: "8px", padding: "24px 28px", marginBottom: "32px",
            textDecoration: "none"
          }}
        >
          <div>
            <div style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: "22px", fontWeight: 400, letterSpacing: "-0.02em", marginBottom: "4px" }}>Find Skilled Workers</div>
            <div style={{ fontSize: "14px", opacity: 0.9 }}>Browse verified workers, view profiles, and contact them directly</div>
          </div>
          <ArrowRight size={24} style={{ flexShrink: 0 }} />
        </a>

        {/* Recent Activity */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--ch-muted, #93939f)", textTransform: "uppercase", letterSpacing: "0.2px", marginBottom: "8px" }}>HISTORY</div>
          <h2 style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: "24px", fontWeight: 400, color: "var(--ch-primary, #17171c)", letterSpacing: "-0.02em", margin: "0 0 20px 0" }}>
            Recent Activity
          </h2>

          {myBookings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", background: "var(--ch-card-bg, #ffffff)", border: "1px solid var(--ch-hairline, #e5e7eb)", borderRadius: "8px" }}>
              <ClipboardList size={40} color="var(--ch-muted, #93939f)" style={{ margin: "0 auto 12px", strokeWidth: 1.5 }} />
              <div style={{ fontSize: "16px", color: "var(--ch-ink, #212121)" }}>No bookings yet</div>
              <p style={{ fontSize: "14px", color: "var(--ch-body-muted, #616161)", marginTop: "6px" }}>Head to <a href="/book-service" style={{ color: isDark ? "#60a5fa" : "var(--ch-action-blue, #1863dc)", textDecoration: "none" }}>Find Workers</a> to get started!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {myBookings.slice(0, 8).map(booking => {
                const statusColors = {
                  Requested:    { bg: isDark ? "rgba(96,165,250,0.15)" : "rgba(24,99,220,0.1)",   color: isDark ? "#60a5fa" : "#1863dc" },
                  Accepted:     { bg: isDark ? "rgba(52,211,153,0.15)" : "rgba(0,60,51,0.1)",     color: isDark ? "#34d399" : "#003c33" },
                  "In Progress":{ bg: isDark ? "rgba(251,191,36,0.15)" : "rgba(255,119,89,0.1)",  color: isDark ? "#fbbf24" : "#ff7759" },
                  Completed:    { bg: isDark ? "rgba(52,211,153,0.15)" : "rgba(0,60,51,0.12)",    color: isDark ? "#34d399" : "#003c33" },
                  Cancelled:    { bg: isDark ? "rgba(239,68,68,0.15)" : "rgba(179,0,0,0.1)",     color: isDark ? "#f87171" : "#b30000" },
                };
                const sc = statusColors[booking.status] || statusColors.Requested;

                return (
                  <div key={booking._id || booking.id} style={{ background: "var(--ch-card-bg, #ffffff)", border: "1px solid var(--ch-hairline, #e5e7eb)", borderRadius: "8px", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "14px", color: "var(--ch-ink, #212121)", textTransform: "capitalize", fontWeight: 500 }}>
                        {booking.serviceCategory} — {booking.description?.slice(0, 50) || "Service request"}
                      </div>
                      <div style={{ fontSize: "14px", color: "var(--ch-body-muted, #616161)", marginTop: "4px" }}>
                        {booking.workerName ? `Assigned to ${booking.workerName}` : "Searching for worker..."}
                        {" · "}
                        {new Date(booking.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                    </div>
                    <span style={{
                      display: "inline-flex", padding: "4px 12px", borderRadius: "9999px",
                      fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.2px",
                      background: sc.bg, color: sc.color, whiteSpace: "nowrap",
                    }}>
                      {booking.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   WORKER VIEW
───────────────────────────────────────────────────────── */
function WorkerView({ user }) {
  const profile = user.workerProfile || {};
  const { isDark } = useTheme();

  return (
    <div style={{ background: "var(--ch-canvas, #ffffff)", minHeight: "100vh", fontFamily: "'Inter', sans-serif", padding: "32px 40px", transition: "background 0.3s ease" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        
        {/* Worker Quick Action / Header */}
        <div style={{
          background: isDark ? "var(--ch-card-bg)" : "var(--ch-primary, #17171c)", color: "#ffffff",
          border: `1px solid ${isDark ? "var(--ch-hairline)" : "transparent"}`,
          borderRadius: "8px", padding: "24px 28px", marginBottom: "32px",
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px"
        }}>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: "24px", fontWeight: 400, letterSpacing: "-0.02em", marginBottom: "4px" }}>
              Worker Profile Console
            </div>
            <div style={{ fontSize: "14px", opacity: 0.9 }}>
              Manage your credentials and check vetting status.
            </div>
          </div>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "6px 14px", borderRadius: "9999px", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.2px",
            background: profile.isVerified ? (isDark ? "rgba(52,211,153,0.2)" : "rgba(0,60,51,0.2)") : "rgba(255,119,89,0.2)",
            color: profile.isVerified ? (isDark ? "#34d399" : "#4d8b7d") : "#ffad9b",
            whiteSpace: "nowrap",
          }}>
            {profile.isVerified ? "✔ Active" : "⏳ Pending"}
          </span>
        </div>

        {!profile.isVerified ? (
          <div style={{ padding: "16px 20px", background: "var(--ch-card-bg, #ffffff)", border: "1px solid var(--ch-hairline, #e5e7eb)", borderRadius: "8px", marginBottom: "28px", display: "flex", gap: "14px" }}>
            <ShieldAlert size={20} color="var(--ch-coral, #ff7759)" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--ch-ink, #212121)" }}>Under Review by Administrator</div>
              <div style={{ fontSize: "14px", marginTop: "4px", lineHeight: 1.5, color: "var(--ch-body-muted, #616161)" }}>
                Your worker application and proof details have been submitted to the administrator. Once approved, your profile and contact number will become visible to local customers.
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: "16px 20px", background: "var(--ch-card-bg, #ffffff)", border: "1px solid var(--ch-hairline, #e5e7eb)", borderRadius: "8px", marginBottom: "28px", display: "flex", gap: "14px" }}>
            <CheckCircle size={20} color={isDark ? "#34d399" : "var(--ch-deep-green, #003c33)"} style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--ch-ink, #212121)" }}>Profile Live & Verified</div>
              <div style={{ fontSize: "14px", marginTop: "4px", lineHeight: 1.5, color: "var(--ch-body-muted, #616161)" }}>
                The administrator has verified your profile. Customers in your village can now view your services, gallery photos, and contact you directly.
              </div>
            </div>
          </div>
        )}

        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--ch-muted, #93939f)", textTransform: "uppercase", letterSpacing: "0.2px", marginBottom: "8px" }}>DETAILS</div>
        <h3 style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: "24px", fontWeight: 400, color: "var(--ch-primary, #17171c)", letterSpacing: "-0.02em", margin: "0 0 20px 0" }}>
          Your Registered Details
        </h3>

        <div style={{ background: isDark ? "var(--ch-surface-subtle)" : "var(--ch-soft-stone, #eeece7)", border: isDark ? "1px solid var(--ch-hairline)" : "none", borderRadius: "8px", padding: "24px" }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px", marginBottom: "24px" }}>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--ch-muted, #93939f)", textTransform: "uppercase", letterSpacing: "0.2px" }}>Full Name</div>
              <div style={{ fontSize: "16px", color: "var(--ch-ink, #212121)", marginTop: "4px" }}>{user.name}</div>
            </div>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--ch-muted, #93939f)", textTransform: "uppercase", letterSpacing: "0.2px" }}>Contact Phone</div>
              <div style={{ fontSize: "16px", color: "var(--ch-ink, #212121)", marginTop: "4px" }}>{user.phone || "Not provided"}</div>
            </div>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--ch-muted, #93939f)", textTransform: "uppercase", letterSpacing: "0.2px" }}>Skills</div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }}>
                {(profile.skills || [profile.skill] || ["General"]).filter(Boolean).map((s, i) => (
                  <span key={i} style={{
                    border: "1px solid var(--ch-coral, #ff7759)", color: "var(--ch-coral, #ff7759)",
                    borderRadius: "32px", padding: "3px 12px", fontSize: "12px", textTransform: "capitalize"
                  }}>{s}</span>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--ch-muted, #93939f)", textTransform: "uppercase", letterSpacing: "0.2px" }}>Experience</div>
              <div style={{ fontSize: "16px", color: "var(--ch-ink, #212121)", marginTop: "4px" }}>{profile.experience || 0} Years</div>
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--ch-muted, #93939f)", textTransform: "uppercase", letterSpacing: "0.2px" }}>Village / Service Area</div>
            <div style={{ fontSize: "14px", color: "var(--ch-ink, #212121)", marginTop: "4px" }}>{profile.address || "Not specified"}</div>
          </div>

          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--ch-muted, #93939f)", textTransform: "uppercase", letterSpacing: "0.2px" }}>Bio Description</div>
            <div style={{ fontSize: "14px", color: "var(--ch-body-muted, #616161)", marginTop: "4px", lineHeight: 1.5 }}>{profile.bio || "No description provided."}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   ADMIN VIEW
───────────────────────────────────────────────────────── */
function AdminView({ users, verifyWorker }) {
  const workers = users.filter((u) => u.role === "Worker");
  const verified = workers.filter((w) => w.workerProfile?.isVerified).length;
  const pending = workers.filter((w) => !w.workerProfile?.isVerified);
  const { isDark } = useTheme();

  return (
    <div style={{ background: "var(--ch-canvas, #ffffff)", minHeight: "100vh", fontFamily: "'Inter', sans-serif", padding: "32px 40px", transition: "background 0.3s ease" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        
        {/* Admin Quick Action Banner */}
        <div style={{
          background: isDark ? "var(--ch-surface-subtle)" : "var(--ch-pale-blue, #f1f5ff)",
          border: `1px solid ${isDark ? "var(--ch-hairline)" : "transparent"}`,
          color: "var(--ch-primary, #17171c)",
          borderRadius: "8px", padding: "24px 28px", marginBottom: "32px",
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px"
        }}>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: "24px", fontWeight: 400, letterSpacing: "-0.02em", marginBottom: "4px" }}>
              Administrator Panel
            </div>
            <div style={{ fontSize: "14px", opacity: 0.9 }}>
              Review worker registration applications, inspect proof of work, and grant approval.
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
          <div style={{ background: "var(--ch-card-bg, #ffffff)", border: "1px solid var(--ch-hairline, #d9d9dd)", borderRadius: "8px", padding: "20px 24px", borderLeft: `3px solid ${isDark ? "#60a5fa" : "var(--ch-primary, #17171c)"}` }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", fontWeight: 400, color: "var(--ch-muted, #93939f)", textTransform: "uppercase", letterSpacing: "0.2px" }}>Total Members</div>
            <div style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: "36px", fontWeight: 400, color: isDark ? "#60a5fa" : "var(--ch-primary, #17171c)", marginTop: "8px", lineHeight: 1 }}>{users.length}</div>
          </div>
          <div style={{ background: "var(--ch-card-bg, #ffffff)", border: "1px solid var(--ch-hairline, #d9d9dd)", borderRadius: "8px", padding: "20px 24px", borderLeft: `3px solid ${isDark ? "#34d399" : "var(--ch-deep-green, #003c33)"}` }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", fontWeight: 400, color: "var(--ch-muted, #93939f)", textTransform: "uppercase", letterSpacing: "0.2px" }}>Approved Workers</div>
            <div style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: "36px", fontWeight: 400, color: isDark ? "#34d399" : "var(--ch-deep-green, #003c33)", marginTop: "8px", lineHeight: 1 }}>{verified}</div>
          </div>
          <div style={{ background: "var(--ch-card-bg, #ffffff)", border: "1px solid var(--ch-hairline, #d9d9dd)", borderRadius: "8px", padding: "20px 24px", borderLeft: "3px solid var(--ch-coral, #ff7759)" }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", fontWeight: 400, color: "var(--ch-muted, #93939f)", textTransform: "uppercase", letterSpacing: "0.2px" }}>Pending Approval</div>
            <div style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: "36px", fontWeight: 400, color: "var(--ch-coral, #ff7759)", marginTop: "8px", lineHeight: 1 }}>{pending.length}</div>
          </div>
        </div>

        {/* Pending Queue */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--ch-muted, #93939f)", textTransform: "uppercase", letterSpacing: "0.2px", marginBottom: "8px" }}>VETTING</div>
          <h2 style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: "24px", fontWeight: 400, color: "var(--ch-primary, #17171c)", letterSpacing: "-0.02em", margin: "0 0 20px 0" }}>
            Worker Approvals Queue
          </h2>

          {pending.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", background: "var(--ch-card-bg, #ffffff)", border: "1px solid var(--ch-hairline, #d9d9dd)", borderRadius: "8px" }}>
              <CheckCircle size={40} color={isDark ? "#34d399" : "var(--ch-deep-green, #003c33)"} style={{ margin: "0 auto 12px", strokeWidth: 1.5 }} />
              <div style={{ fontSize: "16px", color: "var(--ch-ink, #212121)" }}>All worker requests cleared!</div>
              <div style={{ fontSize: "14px", color: "var(--ch-body-muted, #616161)", marginTop: "4px" }}>There are no pending worker verification applications at this time.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0", background: "var(--ch-card-bg, #ffffff)", border: "1px solid var(--ch-hairline, #d9d9dd)", borderRadius: "8px", overflow: "hidden" }}>
              {pending.map((w, index) => {
                const prof = w.workerProfile || {};
                const photo = prof.proofOfWork?.[0]?.url;

                return (
                  <div key={w.id || w._id} style={{
                    padding: "24px", background: "var(--ch-card-bg, #ffffff)", borderBottom: index < pending.length - 1 ? "1px solid var(--ch-hairline, #d9d9dd)" : "none",
                    display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "flex-start"
                  }}>
                    <div style={{ flex: "1 1 300px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                        <h3 style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: "20px", fontWeight: 400, color: "var(--ch-primary, #17171c)", margin: 0 }}>
                          {w.name}
                        </h3>
                        <span style={{
                          padding: "2px 8px", borderRadius: "9999px", background: "rgba(255,119,89,0.1)", color: "var(--ch-coral, #ff7759)",
                          fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.2px"
                        }}>
                          {prof.skills?.join(", ") || prof.skill || "Worker"}
                        </span>
                      </div>

                      <div style={{ fontSize: "14px", color: "var(--ch-body-muted, #616161)", marginBottom: "8px" }}>
                        <strong>Phone:</strong> {w.phone || "N/A"} &nbsp;|&nbsp; <strong>Village:</strong> {prof.address || "Unspecified"} &nbsp;|&nbsp; <strong>Experience:</strong> {prof.experience || 0} yrs
                      </div>

                      {prof.bio && <div style={{ fontSize: "14px", color: "var(--ch-ink, #212121)", marginBottom: "12px" }}>{prof.bio}</div>}

                      {photo && (
                        <div>
                          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--ch-muted, #93939f)", textTransform: "uppercase", letterSpacing: "0.2px", marginBottom: "6px" }}>Submitted Proof Photo</div>
                          <img src={photo} alt="Proof of work" style={{ width: "160px", height: "100px", objectFit: "cover", borderRadius: "4px", border: "1px solid var(--ch-hairline, #d9d9dd)" }} />
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button
                        onClick={() => verifyWorker(w.id || w._id, "Approved")}
                        style={{
                          padding: "8px 16px", background: isDark ? "#10b981" : "var(--ch-deep-green, #003c33)", color: isDark ? "#0d0e12" : "#ffffff", border: "none",
                          borderRadius: "9999px", fontSize: "14px", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
                        }}
                      >
                        <Check size={16} /> Approve
                      </button>
                      <button
                        onClick={() => verifyWorker(w.id || w._id, "Rejected")}
                        style={{
                          padding: "8px 16px", background: isDark ? "rgba(239,68,68,0.15)" : "rgba(179,0,0,0.05)", color: isDark ? "#f87171" : "#b30000", border: "none",
                          borderRadius: "9999px", fontSize: "14px", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
                        }}
                      >
                        <X size={16} /> Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

