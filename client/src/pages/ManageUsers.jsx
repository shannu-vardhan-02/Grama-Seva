import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Users, UserPlus, Trash2, X } from "lucide-react";

const T = {
  page:  { padding: "40px", background: "#f5f5f7", minHeight: "100vh", fontFamily: "SF Pro Text, system-ui, -apple-system, Inter, sans-serif" },
  card:  { background: "#ffffff", border: "1px solid #e0e0e0", borderRadius: "18px", overflow: "hidden" },
  h1:    { fontFamily: "SF Pro Display, system-ui, -apple-system, Inter, sans-serif", fontSize: "28px", fontWeight: 600, color: "#1d1d1f", letterSpacing: "-0.017em" },
  muted: { fontSize: "14px", color: "#7a7a7a", letterSpacing: "-0.013em" },
  label: { display: "block", fontSize: "12px", fontWeight: 600, color: "#1d1d1f", letterSpacing: "-0.007em", marginBottom: "6px" },
  input: { width: "100%", padding: "10px 14px", background: "#f5f5f7", color: "#1d1d1f", border: "1px solid #e0e0e0", borderRadius: "8px", fontSize: "15px", fontFamily: "SF Pro Text, system-ui, -apple-system, Inter, sans-serif", outline: "none", boxSizing: "border-box" },
  select:{ width: "100%", padding: "10px 14px", background: "#f5f5f7", color: "#1d1d1f", border: "1px solid #e0e0e0", borderRadius: "8px", fontSize: "15px", fontFamily: "SF Pro Text, system-ui, -apple-system, Inter, sans-serif", outline: "none", cursor: "pointer" },
  chip:  (c) => ({ display: "inline-flex", padding: "3px 10px", borderRadius: "9999px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.02em", textTransform: "uppercase",
    background: c==="admin"?"rgba(175,82,222,0.10)":c==="worker"?"rgba(255,149,0,0.12)":c==="green"?"rgba(52,199,89,0.12)":"rgba(0,102,204,0.10)",
    color:      c==="admin"?"#8e44ad":c==="worker"?"#c07000":c==="green"?"#248a3d":"#0066cc" }),
};

export default function ManageUsers() {
  const { currentUser, users, deleteUser, addUser } = useAuth();
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [name,       setName]       = useState("");
  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [phone,      setPhone]      = useState("");
  const [role,       setRole]       = useState("Worker");
  const [skills,     setSkills]     = useState(["electrician"]);
  const [experience, setExperience] = useState(2);
  const [address,    setAddress]    = useState("");
  const [autoVerify, setAutoVerify] = useState(true);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState("");

  if (!currentUser || currentUser.role !== "Admin") {
    return <div style={{ padding: "40px", background: "#faf9f5", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "#6c6a64" }}>Admin access required.</div></div>;
  }

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { name, email, password, role, phone };
      if (role === "Worker") {
        payload.workerProfile = {
          skill: skills[0] || "electrician",
          skills, experience: Number(experience), address, isVerified: autoVerify,
          proofOfWorkUrls: ["https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400"],
        };
      }
      await addUser(payload);
      showToast(`User "${name}" created successfully.`, "success");
      setShowModal(false);
      setName(""); setEmail(""); setPassword(""); setPhone(""); setAddress("");
    } catch (err) { showToast(err.message || "Failed to create user.", "error"); }
  };

  const confirmDelete = (userId) => {
    const target = users.find(u => (u.id || u._id) === userId);
    if (target) {
      setUserToDelete(target);
    }
  };

  const executeDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.id || userToDelete._id);
      showToast(`User "${userToDelete.name}" deleted successfully.`, "success");
      setUserToDelete(null);
    } catch (err) {
      showToast(err.message || "Failed to delete user.", "error");
    }
  };

  const thStyle = { padding: "12px 20px", fontSize: "12px", fontWeight: 600, color: "#7a7a7a", letterSpacing: "0.04em", textTransform: "uppercase", textAlign: "left", borderBottom: "1px solid #f0f0f0", background: "#f5f5f7" };
  const tdStyle = { padding: "14px 20px", fontSize: "14px", color: "#1d1d1f", letterSpacing: "-0.013em", borderBottom: "1px solid #f0f0f0" };

  return (
    <div style={T.page}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
        <div>
          <div style={T.h1}>Member Registry</div>
          <div style={{ ...T.muted, marginTop: "6px" }}>Directory of all customers, workers, and administrators.</div>
        </div>
        <button onClick={() => setShowModal(true)} style={{
          display: "inline-flex", alignItems: "center", gap: "7px",
          padding: "11px 20px", background: "#0066cc", color: "#ffffff",
          border: "none", borderRadius: "9999px", fontSize: "14px", fontWeight: 400,
          cursor: "pointer", letterSpacing: "-0.013em",
          fontFamily: "SF Pro Text, system-ui, -apple-system, Inter, sans-serif",
          transition: "opacity 0.15s, transform 0.1s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
        onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
        onMouseDown={(e)  => e.currentTarget.style.transform = "scale(0.95)"}
        onMouseUp={(e)    => e.currentTarget.style.transform = "scale(1)"}
        >
          <UserPlus size={15} /> Add User
        </button>
      </div>



      <div style={T.card}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Skill / Detail</th>
              <th style={thStyle}>Status</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ transition: "background 0.1s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#fafafa"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ ...tdStyle, fontWeight: 600 }}>{u.name}</td>
                <td style={{ ...tdStyle, color: "#7a7a7a" }}>{u.email}</td>
                <td style={tdStyle}>
                  <span style={T.chip(u.role === "Admin" ? "admin" : u.role === "Worker" ? "worker" : "blue")}>
                    {u.role}
                  </span>
                </td>
                <td style={{ ...tdStyle, color: "#7a7a7a", textTransform: "capitalize" }}>
                  {u.role === "Worker" && u.workerProfile
                    ? `${u.workerProfile.skill} · ${u.workerProfile.experience} yrs`
                    : "—"}
                </td>
                <td style={tdStyle}>
                  {u.role === "Worker" && u.workerProfile ? (
                    <span style={T.chip(u.workerProfile.isVerified ? "green" : "worker")}>
                      {u.workerProfile.isVerified ? "Verified" : "Pending"}
                    </span>
                  ) : (
                    <span style={{ ...T.muted, fontSize: "13px" }}>Active</span>
                  )}
                </td>
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  <button
                    onClick={() => confirmDelete(u.id || u._id)}
                    disabled={(u.id || u._id) === (currentUser.id || currentUser._id)}
                    title="Delete user"
                    style={{
                      background: "none", border: "none", cursor: (u.id || u._id) === (currentUser.id || currentUser._id) ? "not-allowed" : "pointer",
                      color: (u.id || u._id) === (currentUser.id || currentUser._id) ? "#e6dfd8" : "#c64545",
                      padding: "6px", borderRadius: "6px", display: "inline-flex", alignItems: "center",
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {userToDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(24,23,21,0.65)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: "20px" }}>
          <div style={{ background: "#ffffff", border: "1px solid #e6dfd8", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "420px", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "22px", fontWeight: 600, color: "#141413", marginBottom: "12px" }}>
              Confirm Deletion
            </div>
            <p style={{ fontSize: "15px", color: "#6c6a64", lineHeight: 1.5, marginBottom: "24px" }}>
              Are you sure you want to delete <strong>{userToDelete.name}</strong> ({userToDelete.role}) from Grama Seva? This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setUserToDelete(null)}
                style={{
                  padding: "10px 18px", background: "#efe9de", color: "#141413", border: "1px solid #e6dfd8", borderRadius: "8px", fontSize: "14px", fontWeight: 500, cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                style={{
                  padding: "10px 18px", background: "#c64545", color: "#ffffff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 500, cursor: "pointer"
                }}
              >
                Yes, Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "20px" }}>
          <div style={{ background: "#ffffff", border: "1px solid #e0e0e0", borderRadius: "18px", padding: "32px", width: "100%", maxWidth: "440px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div style={{ fontSize: "20px", fontWeight: 600, color: "#1d1d1f", fontFamily: "SF Pro Display, system-ui, -apple-system, Inter, sans-serif" }}>
                Create Account
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#7a7a7a", display: "flex" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              {[
                { label: "Full Name",     state: name,     set: setName,     type: "text",     ph: "Ramesh Kumar" },
                { label: "Email",         state: email,    set: setEmail,    type: "email",    ph: "email@example.com" },
                { label: "Password",      state: password, set: setPassword, type: "password", ph: "" },
                { label: "Phone Number",  state: phone,    set: setPhone,    type: "tel",      ph: "10-digit" },
              ].map((f) => (
                <div key={f.label} style={{ marginBottom: "16px" }}>
                  <label style={T.label}>{f.label}</label>
                  <input type={f.type} required value={f.state} onChange={(e) => f.set(e.target.value)} placeholder={f.ph} style={T.input}
                    onFocus={(e) => { e.target.style.borderColor = "#0071e3"; e.target.style.boxShadow = "0 0 0 3px rgba(0,113,227,0.15)"; }}
                    onBlur={(e)  => { e.target.style.borderColor = "#e0e0e0"; e.target.style.boxShadow = "none"; }}
                  />
                </div>
              ))}

              <div style={{ marginBottom: "16px" }}>
                <label style={T.label}>Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} style={T.select}>
                  <option value="Customer">Customer</option>
                  <option value="Worker">Worker</option>
                  <option value="Admin">Administrator</option>
                </select>
              </div>

              {role === "Worker" && (
                <div style={{ padding: "16px", background: "#f5f5f7", border: "1px solid #e0e0e0", borderRadius: "11px", marginBottom: "16px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#0066cc", marginBottom: "12px" }}>Worker Profile</div>
                  <div style={{ marginBottom: "12px" }}>
                    <label style={T.label}>Skill Category</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {["electrician","mason","plumber","mechanic","carpenter","painter","cleaning","other"].map((s) => (
                        <label key={s} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "#141413" }}>
                          <input
                            type="checkbox"
                            checked={skills.includes(s)}
                            onChange={(e) => {
                              if (e.target.checked) setSkills([...skills, s]);
                              else setSkills(skills.filter(sk => sk !== s));
                            }}
                          />
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                    <div>
                      <label style={T.label}>Experience (Yrs)</label>
                      <input type="number" required value={experience} onChange={(e) => setExperience(e.target.value)} style={T.input}
                        onFocus={(e) => { e.target.style.borderColor = "#0071e3"; e.target.style.boxShadow = "0 0 0 3px rgba(0,113,227,0.15)"; }}
                        onBlur={(e)  => { e.target.style.borderColor = "#e0e0e0"; e.target.style.boxShadow = "none"; }}
                      />
                    </div>
                    <div>
                      <label style={T.label}>Service Area</label>
                      <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Village" style={T.input}
                        onFocus={(e) => { e.target.style.borderColor = "#0071e3"; e.target.style.boxShadow = "0 0 0 3px rgba(0,113,227,0.15)"; }}
                        onBlur={(e)  => { e.target.style.borderColor = "#e0e0e0"; e.target.style.boxShadow = "none"; }}
                      />
                    </div>
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input type="checkbox" checked={autoVerify} onChange={(e) => setAutoVerify(e.target.checked)} style={{ accentColor: "#0066cc", width: "15px", height: "15px" }} />
                    <span style={{ fontSize: "13px", color: "#1d1d1f" }}>Auto-verify (mark as vetted)</span>
                  </label>
                </div>
              )}

              <button type="submit" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", padding: "11px 22px", background: "#0066cc", color: "#ffffff", border: "none", borderRadius: "9999px", fontSize: "17px", fontWeight: 400, cursor: "pointer", letterSpacing: "-0.022em", fontFamily: "SF Pro Text, system-ui, -apple-system, Inter, sans-serif" }}>
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
