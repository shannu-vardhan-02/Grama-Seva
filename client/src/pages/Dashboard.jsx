import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket, getDistance } from "../context/SocketContext";
import { Search, Phone, Star, MapPin, Award, CheckCircle, ShieldAlert, Check, X, Copy, Filter, Navigation, Edit3, ArrowRight, Briefcase, Users, ClipboardList } from "lucide-react";

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
   CUSTOMER DASHBOARD — Quick Stats, Recent Bookings, Quick Links
───────────────────────────────────────────────────────── */
function CustomerSearchDashboard({ user, users }) {
  const { bookings } = useSocket();

  const myBookings = bookings.filter(b => {
    const custId = b.customer?._id || b.customer;
    return custId === (user._id || user.id);
  });
  const activeBookings = myBookings.filter(b => ['Requested', 'Accepted', 'In Progress'].includes(b.status));
  const completedBookings = myBookings.filter(b => b.status === 'Completed');
  const verifiedWorkers = users.filter(u => u.role === 'Worker' && u.workerProfile?.isVerified);

  return (
    <div style={{ padding: "40px 24px", background: "#faf9f5", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* Welcome Header */}
        <div style={{ marginBottom: "36px" }}>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "36px", fontWeight: 400, color: "#141413", letterSpacing: "-0.02em" }}>
            Welcome back, {user.name?.split(" ")[0] || "Customer"}
          </h1>
          <p style={{ fontSize: "15px", color: "#6c6a64", marginTop: "6px" }}>
            Your personal dashboard — view your activity and find skilled workers in your village area.
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "32px" }}>
          <div style={{ background: "#ffffff", border: "1px solid #e6dfd8", borderRadius: "14px", padding: "20px 24px" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#8e8b82", textTransform: "uppercase", letterSpacing: "0.04em" }}>Active Requests</div>
            <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", fontSize: "32px", fontWeight: 700, color: "#cc785c", marginTop: "4px", fontVariantNumeric: "tabular-nums" }}>{activeBookings.length}</div>
          </div>
          <div style={{ background: "#ffffff", border: "1px solid #e6dfd8", borderRadius: "14px", padding: "20px 24px" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#8e8b82", textTransform: "uppercase", letterSpacing: "0.04em" }}>Completed Jobs</div>
            <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", fontSize: "32px", fontWeight: 700, color: "#5db872", marginTop: "4px", fontVariantNumeric: "tabular-nums" }}>{completedBookings.length}</div>
          </div>
          <div style={{ background: "#ffffff", border: "1px solid #e6dfd8", borderRadius: "14px", padding: "20px 24px" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#8e8b82", textTransform: "uppercase", letterSpacing: "0.04em" }}>Available Workers</div>
            <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", fontSize: "32px", fontWeight: 700, color: "#141413", marginTop: "4px", fontVariantNumeric: "tabular-nums" }}>{verifiedWorkers.length}</div>
          </div>
        </div>

        {/* Quick Action — Find Workers */}
        <a
          href="/book-service"
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "linear-gradient(135deg, #cc785c 0%, #a9583e 100%)", color: "#ffffff",
            borderRadius: "16px", padding: "24px 28px", marginBottom: "32px",
            textDecoration: "none", transition: "transform 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
          onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
        >
          <div>
            <div style={{ fontSize: "20px", fontWeight: 600, marginBottom: "4px" }}>🔍 Find Skilled Workers</div>
            <div style={{ fontSize: "14px", opacity: 0.85 }}>Browse verified workers, view profiles, and contact them directly</div>
          </div>
          <ArrowRight size={24} />
        </a>

        {/* Recent Activity */}
        <div style={{ background: "#ffffff", border: "1px solid #e6dfd8", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 12px rgba(20,20,19,0.03)" }}>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "22px", color: "#141413", marginBottom: "20px" }}>
            Recent Activity
          </h2>

          {myBookings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <ClipboardList size={40} color="#8e8b82" style={{ margin: "0 auto 12px" }} />
              <div style={{ fontSize: "16px", fontWeight: 600, color: "#141413" }}>No bookings yet</div>
              <p style={{ fontSize: "14px", color: "#6c6a64", marginTop: "6px" }}>Head to <a href="/book-service" style={{ color: "#cc785c", fontWeight: 600, textDecoration: "none" }}>Find Workers</a> to get started!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {myBookings.slice(0, 8).map(booking => {
                const statusColors = {
                  Requested: { bg: "rgba(0,102,204,0.10)", color: "#0066cc" },
                  Accepted: { bg: "rgba(52,199,89,0.12)", color: "#248a3d" },
                  "In Progress": { bg: "rgba(255,149,0,0.12)", color: "#c07000" },
                  Completed: { bg: "rgba(52,199,89,0.12)", color: "#248a3d" },
                  Cancelled: { bg: "rgba(255,59,48,0.10)", color: "#c0392b" },
                };
                const sc = statusColors[booking.status] || statusColors.Requested;

                return (
                  <div key={booking._id || booking.id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "14px 18px", background: "#faf9f5", border: "1px solid #e6dfd8", borderRadius: "10px",
                  }}>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#141413", textTransform: "capitalize" }}>
                        {booking.serviceCategory} — {booking.description?.slice(0, 50) || "Service request"}
                      </div>
                      <div style={{ fontSize: "12px", color: "#8e8b82", marginTop: "3px" }}>
                        {booking.workerName ? `Assigned to ${booking.workerName}` : "Searching for worker..."}
                        {" · "}
                        {new Date(booking.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                    </div>
                    <span style={{
                      display: "inline-flex", padding: "4px 12px", borderRadius: "9999px",
                      fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.02em",
                      background: sc.bg, color: sc.color
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

  return (
    <div style={{ padding: "40px 24px", background: "#faf9f5", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "36px", fontWeight: 400, color: "#141413" }}>
              Worker Profile Console
            </h1>
            <p style={{ fontSize: "15px", color: "#6c6a64", marginTop: "6px" }}>
              Manage your worker credentials and check your administrator vetting status.
            </p>
          </div>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "6px 14px", borderRadius: "9999px", fontSize: "13px", fontWeight: 600,
            background: profile.isVerified ? "#eaf6ee" : "#fff5e6",
            color: profile.isVerified ? "#248a3d" : "#c07000",
            border: profile.isVerified ? "1px solid #c2e9cb" : "1px solid #fce3b8",
          }}>
            {profile.isVerified ? "✔ Approved & Active" : "⏳ Pending Administrator Approval"}
          </span>
        </div>

        {!profile.isVerified ? (
          <div style={{ padding: "20px 24px", background: "#fff5e6", border: "1px solid #fce3b8", borderRadius: "14px", marginBottom: "28px", color: "#c07000", display: "flex", gap: "14px" }}>
            <ShieldAlert size={24} style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <div style={{ fontSize: "16px", fontWeight: 600 }}>Under Review by Administrator</div>
              <div style={{ fontSize: "14px", marginTop: "4px", lineHeight: 1.5 }}>
                Your worker application and proof details have been submitted to the administrator. Once approved, your profile and contact number will become visible to local customers.
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: "20px 24px", background: "#eaf6ee", border: "1px solid #c2e9cb", borderRadius: "14px", marginBottom: "28px", color: "#248a3d", display: "flex", gap: "14px" }}>
            <CheckCircle size={24} style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <div style={{ fontSize: "16px", fontWeight: 600 }}>Profile Live & Verified</div>
              <div style={{ fontSize: "14px", marginTop: "4px", lineHeight: 1.5 }}>
                The administrator has verified your profile. Customers in your village can now view your services, gallery photos, and contact you directly.
              </div>
            </div>
          </div>
        )}

        <div style={{ background: "#ffffff", border: "1px solid #e6dfd8", borderRadius: "16px", padding: "32px", boxShadow: "0 2px 12px rgba(20,20,19,0.03)" }}>
          <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "22px", color: "#141413", marginBottom: "20px" }}>Your Registered Details</h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#8e8b82", textTransform: "uppercase" }}>Full Name</div>
              <div style={{ fontSize: "16px", fontWeight: 600, color: "#141413", marginTop: "4px" }}>{user.name}</div>
            </div>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#8e8b82", textTransform: "uppercase" }}>Contact Phone</div>
              <div style={{ fontSize: "16px", fontWeight: 600, color: "#141413", marginTop: "4px" }}>{user.phone || "Not provided"}</div>
            </div>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#8e8b82", textTransform: "uppercase" }}>Skills</div>
              <div style={{ fontSize: "16px", fontWeight: 600, color: "#141413", marginTop: "4px", textTransform: "capitalize" }}>
                {profile.skills?.join(", ") || profile.skill || "General"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#8e8b82", textTransform: "uppercase" }}>Experience</div>
              <div style={{ fontSize: "16px", fontWeight: 600, color: "#141413", marginTop: "4px" }}>{profile.experience || 0} Years</div>
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#8e8b82", textTransform: "uppercase" }}>Village / Service Area</div>
            <div style={{ fontSize: "15px", color: "#141413", marginTop: "4px" }}>{profile.address || "Not specified"}</div>
          </div>

          <div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#8e8b82", textTransform: "uppercase" }}>Bio Description</div>
            <div style={{ fontSize: "15px", color: "#3d3d3a", marginTop: "4px", lineHeight: 1.5 }}>{profile.bio || "No description provided."}</div>
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

  return (
    <div style={{ padding: "40px 24px", background: "#faf9f5", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "36px", fontWeight: 400, color: "#141413" }}>
            Administrator Panel
          </h1>
          <p style={{ fontSize: "15px", color: "#6c6a64", marginTop: "6px" }}>
            Review worker registration applications, inspect proof of work, and grant approval for public directory listing.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "32px" }}>
          <div style={{ background: "#ffffff", border: "1px solid #e6dfd8", borderRadius: "14px", padding: "20px 24px" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#8e8b82", textTransform: "uppercase" }}>Total Members</div>
            <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", fontSize: "32px", fontWeight: 700, color: "#141413", marginTop: "4px", fontVariantNumeric: "tabular-nums" }}>{users.length}</div>
          </div>
          <div style={{ background: "#ffffff", border: "1px solid #e6dfd8", borderRadius: "14px", padding: "20px 24px" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#8e8b82", textTransform: "uppercase" }}>Approved Workers</div>
            <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", fontSize: "32px", fontWeight: 700, color: "#5db872", marginTop: "4px", fontVariantNumeric: "tabular-nums" }}>{verified}</div>
          </div>
          <div style={{ background: "#ffffff", border: "1px solid #e6dfd8", borderRadius: "14px", padding: "20px 24px" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#8e8b82", textTransform: "uppercase" }}>Pending Approval</div>
            <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", fontSize: "32px", fontWeight: 700, color: "#cc785c", marginTop: "4px", fontVariantNumeric: "tabular-nums" }}>{pending.length}</div>
          </div>
        </div>

        {/* Pending Queue */}
        <div style={{ background: "#ffffff", border: "1px solid #e6dfd8", borderRadius: "16px", padding: "32px", boxShadow: "0 2px 12px rgba(20,20,19,0.03)" }}>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "24px", color: "#141413", marginBottom: "20px" }}>
            Worker Approvals Queue ({pending.length})
          </h2>

          {pending.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <CheckCircle size={40} color="#5db872" style={{ margin: "0 auto 12px" }} />
              <div style={{ fontSize: "17px", fontWeight: 600, color: "#141413" }}>All worker requests cleared!</div>
              <div style={{ fontSize: "14px", color: "#6c6a64", marginTop: "4px" }}>There are no pending worker verification applications at this time.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {pending.map((w) => {
                const prof = w.workerProfile || {};
                const photo = prof.proofOfWork?.[0]?.url;

                return (
                  <div key={w.id || w._id} style={{
                    padding: "24px", background: "#faf9f5", border: "1px solid #e6dfd8", borderRadius: "14px",
                    display: "flex", justifyContent: "space-between", gap: "20px", alignItems: "flex-start",
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 600, color: "#141413", margin: 0 }}>
                          {w.name}
                        </h3>
                        <span style={{ padding: "3px 10px", borderRadius: "9999px", background: "#efe9de", color: "#cc785c", fontSize: "12px", fontWeight: 600, textTransform: "capitalize" }}>
                          {prof.skills?.join(", ") || prof.skill || "Worker"}
                        </span>
                      </div>

                      <div style={{ fontSize: "14px", color: "#6c6a64", marginBottom: "6px" }}>
                        📞 <strong>Phone:</strong> {w.phone || "N/A"} · 📍 <strong>Village:</strong> {prof.address || "Shamshabad"} · 🏆 <strong>Experience:</strong> {prof.experience || 0} yrs
                      </div>

                      {prof.bio && <div style={{ fontSize: "14px", color: "#3d3d3a", fontStyle: "italic", marginBottom: "12px" }}>"{prof.bio}"</div>}

                      {photo && (
                        <div>
                          <div style={{ fontSize: "11px", fontWeight: 600, color: "#8e8b82", textTransform: "uppercase", marginBottom: "6px" }}>Submitted Proof Photo</div>
                          <img src={photo} alt="Proof of work" style={{ width: "160px", height: "100px", objectFit: "cover", borderRadius: "8px", border: "1px solid #e6dfd8" }} />
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", flexShrink: 0 }}>
                      <button
                        onClick={() => verifyWorker(w.id || w._id, "Approved")}
                        style={{
                          padding: "10px 20px", background: "#5db872", color: "#ffffff", border: "none",
                          borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer",
                          display: "flex", alignItems: "center", gap: "6px",
                        }}
                      >
                        <Check size={16} /> Approve Worker
                      </button>
                      <button
                        onClick={() => verifyWorker(w.id || w._id, "Rejected")}
                        style={{
                          padding: "10px 20px", background: "#ffffff", color: "#c64545", border: "1px solid #c64545",
                          borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer",
                          display: "flex", alignItems: "center", gap: "6px",
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
