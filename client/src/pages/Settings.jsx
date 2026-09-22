import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { Power, Plus, Trash2, MapPin, Crosshair, X, Sun, Moon, Check } from "lucide-react";
import ImageUpload from "../components/ImageUpload";

export default function Settings() {
  const { currentUser, updateWorkerProfile } = useAuth();
  const { theme, isDark, setTheme } = useTheme();
  const { showToast } = useToast();

  const [name, setName] = useState(currentUser?.name || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [bio, setBio] = useState(currentUser?.workerProfile?.bio || "");
  const [address, setAddress] = useState(currentUser?.workerProfile?.address || "");
  const [skills, setSkills] = useState(currentUser?.workerProfile?.skills || [currentUser?.workerProfile?.skill || "electrician"]);
  const [services, setServices] = useState(currentUser?.workerProfile?.services || [
    { name: "General Fitting & Repair", price: 150 },
    { name: "Full Day Inspection", price: 500 }
  ]);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  
  const [gallery, setGallery] = useState(currentUser?.workerProfile?.gallery || [
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400"
  ]);

  const [locationCoords, setLocationCoords] = useState(
    currentUser?.workerProfile?.location?.coordinates || [0, 0]
  );
  const [geoLoading, setGeoLoading] = useState(false);

  const [powUrls, setPowUrls] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!currentUser) return null;
  const profile = currentUser.workerProfile;

  const handleToggleAvailability = () => {
    if (!profile.isVerified) { showToast("Your profile must be verified by an administrator before you can toggle availability.", "error"); return; }
    try {
      updateWorkerProfile({ workerProfile: { isAvailable: !profile.isAvailable } });
      showToast(`Status set to ${!profile.isAvailable ? "Available" : "Unavailable"}.`, "success");
    } catch { showToast("Failed to update status.", "error"); }
  };

  const handleAddService = () => {
    if (!newServiceName.trim() || !newServicePrice) return;
    setServices([...services, { name: newServiceName.trim(), price: Number(newServicePrice) }]);
    setNewServiceName("");
    setNewServicePrice("");
  };

  const handleRemoveService = (idx) => {
    setServices(services.filter((_, i) => i !== idx));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation not supported by your browser.", "error");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationCoords([pos.coords.longitude, pos.coords.latitude]);
        setGeoLoading(false);
        showToast("Location updated! Save to apply.", "success");
      },
      (err) => {
        setGeoLoading(false);
        showToast("Could not get location. Please enable location permissions.", "error");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { name, phone };
      if (currentUser.role === "Worker" && profile) {
        payload.workerProfile = {
          bio,
          address,
          skill: skills[0] || "electrician",
          skills,
          services,
          gallery,
          location: {
            type: "Point",
            coordinates: locationCoords
          }
        };
        if (powUrls.length > 0) {
          const newProofs = powUrls.map((url) => ({ url, submissionDate: new Date().toISOString(), status: "Pending" }));
          payload.workerProfile.proofOfWork = [...(profile.proofOfWork || []), ...newProofs];
        }
      } else if (currentUser.role === "Customer") {
        payload.workerProfile = {
          location: {
            type: "Point",
            coordinates: locationCoords
          }
        };
      }
      await updateWorkerProfile(payload);
      showToast("Settings saved successfully!", "success");
      setPowUrls([]);
    } catch (err) { showToast(err.message || "Save failed.", "error"); }
  };

  const pageStyle = {
    background: "var(--ch-canvas)",
    color: "var(--ch-ink)",
    padding: "32px 40px",
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif"
  };

  const cardStyle = {
    background: "var(--ch-card-bg)",
    border: "1px solid var(--ch-hairline)",
    borderRadius: "8px",
    padding: "28px 32px"
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px",
    background: "var(--ch-input-bg)",
    border: "1px solid var(--ch-hairline)",
    borderRadius: "8px", fontSize: "14px", outline: "none",
    color: "var(--ch-ink)", boxSizing: "border-box"
  };

  const labelStyle = {
    display: "block", fontSize: "10px", fontWeight: "bold",
    fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase",
    color: "var(--ch-muted)", marginBottom: "6px", letterSpacing: "0.2px"
  };

  return (
    <div className="settings-page-padding" style={pageStyle}>
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>
        <div style={{ marginBottom: "32px" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", color: "var(--ch-muted)", letterSpacing: "0.2px", marginBottom: "8px" }}>
            Preferences
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: "28px", fontWeight: 400, color: "var(--ch-primary)", letterSpacing: "-0.02em", margin: 0 }}>
            Account Settings
          </h1>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* ── THEME PREFERENCES SECTION ── */}
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
              <div>
                <h2 style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: "20px", color: "var(--ch-primary)", margin: 0 }}>
                  Appearance & Theme
                </h2>
                <p style={{ fontSize: "14px", color: "var(--ch-body-muted)", margin: "4px 0 20px" }}>
                  Choose how Grama Seva looks to you. Light mode is the default.
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {/* Light Mode Card */}
              <div
                onClick={() => setTheme("light")}
                style={{
                  padding: "16px 20px",
                  borderRadius: "10px",
                  border: theme === "light" ? "2px solid #10b981" : "1px solid var(--ch-hairline)",
                  background: theme === "light" ? (isDark ? "#172b22" : "#f0fdf4") : "var(--ch-input-bg)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                  transition: "all 0.15s",
                }}
              >
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  background: theme === "light" ? "#10b981" : "rgba(120,120,130,0.15)",
                  color: theme === "light" ? "#ffffff" : "var(--ch-muted)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Sun size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: "14.5px", fontWeight: 600, color: "var(--ch-primary)" }}>
                      Light Mode <span style={{ fontSize: "11px", fontWeight: 400, color: "var(--ch-muted)" }}>(Default)</span>
                    </div>
                    {theme === "light" && <Check size={16} color="#10b981" />}
                  </div>
                  <div style={{ fontSize: "12.5px", color: "var(--ch-body-muted)", marginTop: "4px", lineHeight: 1.4 }}>
                    Crisp daylight canvas with warm, high-contrast text.
                  </div>
                </div>
              </div>

              {/* Dark Mode Card */}
              <div
                onClick={() => setTheme("dark")}
                style={{
                  padding: "16px 20px",
                  borderRadius: "10px",
                  border: theme === "dark" ? "2px solid #34d399" : "1px solid var(--ch-hairline)",
                  background: theme === "dark" ? (isDark ? "rgba(52, 211, 153, 0.12)" : "#f0fdf4") : "var(--ch-input-bg)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                  transition: "all 0.15s",
                }}
              >
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  background: theme === "dark" ? "#34d399" : "rgba(120,120,130,0.15)",
                  color: theme === "dark" ? "#0d0e12" : "var(--ch-muted)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Moon size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: "14.5px", fontWeight: 600, color: "var(--ch-primary)" }}>
                      Dark Mode
                    </div>
                    {theme === "dark" && <Check size={16} color="#34d399" />}
                  </div>
                  <div style={{ fontSize: "12.5px", color: "var(--ch-body-muted)", marginTop: "4px", lineHeight: 1.4 }}>
                    Deep obsidian slate with softened emerald accents.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {currentUser.role === "Worker" && profile && (
            <div style={cardStyle}>
              <h2 style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: "20px", color: "var(--ch-primary)", marginBottom: "4px", margin: 0 }}>Public Availability</h2>
              <p style={{ fontSize: "14px", color: "var(--ch-body-muted)", marginBottom: "16px" }}>Control whether your profile appears as Available in local directory searches.</p>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <button
                  onClick={handleToggleAvailability}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    padding: "10px 20px",
                    background: profile.isAvailable ? (isDark ? "#064e3b" : "#003c33") : "var(--ch-soft-stone)",
                    color: profile.isAvailable ? "#34d399" : "var(--ch-body-muted)",
                    border: profile.isAvailable ? "1px solid rgba(52,211,153,0.3)" : "1px solid var(--ch-hairline)",
                    borderRadius: "32px", fontSize: "14px", fontWeight: 500, cursor: "pointer"
                  }}
                >
                  <Power size={15} />
                  {profile.isAvailable ? "Online — Accepting Work" : "Offline — Unavailable"}
                </button>
                {!profile.isVerified && (
                  <span style={{ fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#ff7759", textTransform: "uppercase" }}>
                    Pending Approval
                  </span>
                )}
              </div>
            </div>
          )}

          <div style={cardStyle}>
            <h2 style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: "20px", color: "var(--ch-primary)", marginBottom: "24px", margin: 0 }}>
              Personal & Work Profile
            </h2>
            <form onSubmit={handleSave}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} onFocus={(e)=>e.target.style.borderColor="#1863dc"} onBlur={(e)=>e.target.style.borderColor="#d9d9dd"} />
                </div>
                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} onFocus={(e)=>e.target.style.borderColor="#1863dc"} onBlur={(e)=>e.target.style.borderColor="#d9d9dd"} />
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--ch-hairline)", paddingTop: "24px", marginTop: "24px" }}>
                <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: "6px", color: "var(--ch-action-blue)" }}>
                  <MapPin size={14} /> Your Location
                </label>
                <p style={{ fontSize: "13px", color: "var(--ch-body-muted)", marginBottom: "12px" }}>
                  Set your location for accurate distance calculations.
                </p>
                <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={geoLoading}
                    style={{
                      padding: "8px 16px", background: "transparent", color: "var(--ch-action-blue)", border: "1px solid var(--ch-action-blue)",
                      borderRadius: "32px", fontSize: "13px", fontWeight: 500, cursor: geoLoading ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", gap: "8px", opacity: geoLoading ? 0.7 : 1,
                    }}
                  >
                    <Crosshair size={14} className={geoLoading ? "animate-spin" : ""} />
                    {geoLoading ? "Detecting..." : "Use My Current Location"}
                  </button>
                  {locationCoords[0] !== 0 && locationCoords[1] !== 0 && (
                    <div style={{ fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "var(--ch-deep-green)", display: "flex", alignItems: "center", gap: "4px" }}>
                      ✔ Location set
                    </div>
                  )}
                </div>
              </div>

              {currentUser.role === "Worker" && profile && (
                <>
                  <div style={{ borderTop: "1px solid var(--ch-hairline)", paddingTop: "24px", marginTop: "24px" }}>
                    <label style={labelStyle}>Skill Categories</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {[
                        { id: "electrician", label: "Electrician" }, { id: "mason", label: "Mason" }, { id: "plumber", label: "Plumber" },
                        { id: "carpenter", label: "Carpenter" }, { id: "mechanic", label: "Mechanic" }, { id: "painter", label: "Painter" },
                        { id: "cleaning", label: "House Cleaning" }, { id: "other", label: "General Labour" }
                      ].map((s) => {
                        const isSelected = skills.includes(s.id);
                        return (
                          <div
                            key={s.id}
                            onClick={() => {
                              if (isSelected) setSkills(skills.filter(sk => sk !== s.id));
                              else setSkills([...skills, s.id]);
                            }}
                            style={{
                              display: "inline-flex", alignItems: "center", gap: "6px",
                              padding: "6px 12px", borderRadius: "32px", fontSize: "13px", cursor: "pointer",
                              border: isSelected ? "1px solid #ff7759" : "1px solid var(--ch-hairline)",
                              color: isSelected ? "#ff7759" : "var(--ch-body-muted)",
                              background: isSelected ? (isDark ? "rgba(255,119,89,0.15)" : "#ffffff") : "var(--ch-soft-stone)"
                            }}
                          >
                            {s.label}
                            {isSelected && <X size={12} />}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ marginTop: "24px" }}>
                    <label style={labelStyle}>Village Area / Service Address</label>
                    <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Shamshabad Village Ward 3" style={inputStyle} onFocus={(e)=>e.target.style.borderColor="var(--ch-action-blue)"} onBlur={(e)=>e.target.style.borderColor="var(--ch-hairline)"}
                    />
                  </div>

                  <div style={{ marginTop: "24px" }}>
                    <label style={labelStyle}>About & Work Bio</label>
                    <textarea rows="3" value={bio} onChange={(e) => setBio(e.target.value)}
                      placeholder="Describe your specialization..." style={{ ...inputStyle, resize: "vertical" }} onFocus={(e)=>e.target.style.borderColor="var(--ch-action-blue)"} onBlur={(e)=>e.target.style.borderColor="var(--ch-hairline)"}
                    />
                  </div>

                  <div style={{ borderTop: "1px solid var(--ch-hairline)", paddingTop: "24px", marginTop: "24px" }}>
                    <label style={labelStyle}>Services & Pricing (₹)</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {services.map((svc, idx) => (
                        <div key={idx} style={{ display: "flex", gap: "10px", alignItems: "center", padding: "8px", borderBottom: "1px solid var(--ch-hairline)" }}>
                          <div style={{ flex: 1, fontSize: "14px", color: "var(--ch-ink)" }}>{svc.name}</div>
                          <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--ch-deep-green)" }}>₹{svc.price}</div>
                          <button type="button" onClick={() => handleRemoveService(idx)} style={{ background: "none", border: "none", color: "#ff7759", cursor: "pointer" }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      <div style={{ display: "flex", gap: "10px", marginTop: "12px", alignItems: "center" }}>
                        <input type="text" placeholder="Service Name" value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} style={{ ...inputStyle, flex: 1 }} onFocus={(e)=>e.target.style.borderColor="var(--ch-action-blue)"} onBlur={(e)=>e.target.style.borderColor="var(--ch-hairline)"} />
                        <input type="number" placeholder="Price (₹)" value={newServicePrice} onChange={(e) => setNewServicePrice(e.target.value)} style={{ ...inputStyle, width: "100px" }} onFocus={(e)=>e.target.style.borderColor="var(--ch-action-blue)"} onBlur={(e)=>e.target.style.borderColor="var(--ch-hairline)"} />
                        <button type="button" onClick={handleAddService} style={{ padding: "10px 16px", background: "var(--ch-soft-stone)", color: "var(--ch-ink)", border: "1px solid var(--ch-hairline)", borderRadius: "32px", fontSize: "13px", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Plus size={14} /> Add
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid var(--ch-hairline)", paddingTop: "24px", marginTop: "24px" }}>
                    <label style={labelStyle}>Work Gallery Photos</label>
                    <div style={{ border: "1px dashed var(--ch-hairline)", borderRadius: "8px", padding: "16px", background: "var(--ch-soft-stone)" }}>
                      <ImageUpload mode="multiple" endpoint="gallery" label="Upload Photos" value={gallery} onChange={setGallery} maxFiles={6} />
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid var(--ch-hairline)", paddingTop: "24px", marginTop: "24px" }}>
                    <label style={labelStyle}>Proof-of-Work Photo</label>
                    <div style={{ border: "1px dashed var(--ch-hairline)", borderRadius: "8px", padding: "16px", background: "var(--ch-soft-stone)" }}>
                      <ImageUpload mode="multiple" endpoint="gallery" label="Upload Proofs" value={powUrls} onChange={setPowUrls} maxFiles={3} />
                    </div>
                  </div>
                </>
              )}

              <div style={{ marginTop: "32px" }}>
                <button type="submit" style={{
                  padding: "12px 24px",
                  background: isDark ? "#232534" : "#17171c",
                  color: "#ffffff",
                  border: isDark ? "1px solid #383b4e" : "none",
                  borderRadius: "32px", fontSize: "14px", fontWeight: 500,
                  cursor: "pointer", transition: "opacity 0.15s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
                onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
