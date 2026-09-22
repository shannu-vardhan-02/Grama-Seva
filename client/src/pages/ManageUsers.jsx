import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { Users, UserPlus, Trash2, X, Search } from "lucide-react";
import ConfirmModal from "../components/ConfirmModal";

export default function ManageUsers() {
  const { currentUser, users, deleteUser, addUser } = useAuth();
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [search, setSearch] = useState("");
  
  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Worker");
  const [skills, setSkills] = useState(["electrician"]);
  const [experience, setExperience] = useState(2);
  const [address, setAddress] = useState("");
  const [autoVerify, setAutoVerify] = useState(true);

  if (!currentUser || currentUser.role !== "Admin") {
    return <div style={{ padding: "40px", background: "#ffffff", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "#616161" }}>Admin access required.</div></div>;
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

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const getRoleChipStyle = (r) => {
    let bg = isDark ? "rgba(96,165,250,0.15)" : "#f1f5ff";
    let color = isDark ? "#60a5fa" : "#1863dc";
    if (r === "Worker") {
      bg = isDark ? "rgba(255,140,115,0.15)" : "#ffad9b";
      color = isDark ? "#ff8c73" : "#ff7759";
    } else if (r === "Admin") {
      bg = isDark ? "rgba(52,211,153,0.15)" : "#edfce9";
      color = isDark ? "#34d399" : "#003c33";
    }
    return { background: bg, color, padding: "4px 8px", borderRadius: "16px", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase" };
  };

  return (
    <div style={{ background: "var(--ch-canvas)", color: "var(--ch-ink)", padding: "32px 40px", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", color: "var(--ch-muted)", letterSpacing: "0.2px", marginBottom: "8px" }}>
            Administration
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: "28px", fontWeight: 400, color: "var(--ch-primary)", letterSpacing: "-0.02em", margin: 0 }}>
            Manage Users
          </h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: "10px 20px", background: isDark ? "#232534" : "#17171c", color: "#ffffff",
            border: isDark ? "1px solid #383b4e" : "none", borderRadius: "32px", fontSize: "14px",
            display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", transition: "opacity 0.15s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
          onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
        >
          <UserPlus size={16} /> Add User
        </button>
      </div>

      <div style={{ marginBottom: "24px", position: "relative", maxWidth: "400px" }}>
        <Search size={16} color="var(--ch-muted)" style={{ position: "absolute", left: "12px", top: "12px" }} />
        <input
          type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: "10px 14px 10px 36px", background: "var(--ch-input-bg)", color: "var(--ch-ink)", border: "1px solid var(--ch-hairline)", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
          onFocus={(e)=>e.target.style.borderColor="var(--ch-action-blue)"} onBlur={(e)=>e.target.style.borderColor="var(--ch-hairline)"}
        />
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ padding: "12px 16px", textAlign: "left", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "var(--ch-muted)", textTransform: "uppercase", borderBottom: "1px solid var(--ch-hairline)" }}>Name</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "var(--ch-muted)", textTransform: "uppercase", borderBottom: "1px solid var(--ch-hairline)" }}>Email</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "var(--ch-muted)", textTransform: "uppercase", borderBottom: "1px solid var(--ch-hairline)" }}>Role</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "var(--ch-muted)", textTransform: "uppercase", borderBottom: "1px solid var(--ch-hairline)" }}>Status</th>
              <th style={{ padding: "12px 16px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "var(--ch-muted)", textTransform: "uppercase", borderBottom: "1px solid var(--ch-hairline)" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} style={{ borderBottom: "1px solid var(--ch-hairline)" }}>
                <td style={{ padding: "16px", fontSize: "14px", color: "var(--ch-primary)", fontWeight: 500 }}>{u.name}</td>
                <td style={{ padding: "16px", fontSize: "14px", color: "var(--ch-body-muted)" }}>{u.email}</td>
                <td style={{ padding: "16px" }}>
                  <span style={getRoleChipStyle(u.role)}>{u.role}</span>
                </td>
                <td style={{ padding: "16px" }}>
                  {u.role === "Worker" && u.workerProfile ? (
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase",
                      color: u.workerProfile.isVerified ? "var(--ch-deep-green)" : "#ff8c73",
                      background: u.workerProfile.isVerified ? (isDark ? "rgba(52,211,153,0.12)" : "#edfce9") : (isDark ? "rgba(255,119,89,0.12)" : "transparent"),
                      padding: u.workerProfile.isVerified ? "3px 8px" : "0", borderRadius: "12px"
                    }}>
                      {u.workerProfile.isVerified ? "Verified" : "Unverified"}
                    </span>
                  ) : (
                    <span style={{ fontSize: "13px", color: "var(--ch-muted)" }}>Active</span>
                  )}
                </td>
                <td style={{ padding: "16px", textAlign: "right" }}>
                  <button onClick={() => confirmDelete(u.id || u._id)} disabled={(u.id || u._id) === (currentUser.id || currentUser._id)} style={{ background: "none", border: "none", color: "var(--ch-error)", cursor: "pointer", fontSize: "13px", textDecoration: "underline", opacity: (u.id || u._id) === (currentUser.id || currentUser._id) ? 0.3 : 1 }}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,10,14,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}>
          <div style={{ background: "var(--ch-canvas)", color: "var(--ch-ink)", padding: "32px", borderRadius: "8px", width: "400px", maxWidth: "100%", border: "1px solid var(--ch-hairline)", boxShadow: "0 16px 40px rgba(0,0,0,0.35)" }}>
            <h2 style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: "20px", color: "var(--ch-primary)", marginTop: 0 }}>Add User</h2>
            <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <input type="text" placeholder="Name" required value={name} onChange={e => setName(e.target.value)} style={{ padding: "10px", background: "var(--ch-input-bg)", color: "var(--ch-ink)", border: "1px solid var(--ch-hairline)", borderRadius: "8px", outline: "none" }} />
              <input type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} style={{ padding: "10px", background: "var(--ch-input-bg)", color: "var(--ch-ink)", border: "1px solid var(--ch-hairline)", borderRadius: "8px", outline: "none" }} />
              <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} style={{ padding: "10px", background: "var(--ch-input-bg)", color: "var(--ch-ink)", border: "1px solid var(--ch-hairline)", borderRadius: "8px", outline: "none" }} />
              <select value={role} onChange={e => setRole(e.target.value)} style={{ padding: "10px", background: "var(--ch-input-bg)", color: "var(--ch-ink)", border: "1px solid var(--ch-hairline)", borderRadius: "8px", outline: "none" }}>
                <option value="Customer">Customer</option>
                <option value="Worker">Worker</option>
                <option value="Admin">Admin</option>
              </select>
              <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "10px", border: "1px solid var(--ch-hairline)", background: "transparent", color: "var(--ch-body-muted)", borderRadius: "32px", cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: "10px", border: isDark ? "1px solid #383b4e" : "none", background: isDark ? "#232534" : "#17171c", color: "#ffffff", borderRadius: "32px", cursor: "pointer" }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!userToDelete}
        title="Confirm User Deletion"
        message={userToDelete ? `Are you sure you want to delete "${userToDelete.name}"?` : ""}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onCancel={() => setUserToDelete(null)}
        onConfirm={executeDelete}
      />
    </div>
  );
}
