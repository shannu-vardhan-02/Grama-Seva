import React, { useState, useEffect, useCallback } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { Power, Plus, Trash2, MapPin, Crosshair, X, Sun, Moon, Check, Key, Fingerprint } from "lucide-react";
import ImageUpload from "../components/ImageUpload";
import ConfirmModal from "../components/ConfirmModal";

export default function Settings() {
  const { currentUser, updateWorkerProfile, registerPasskey } = useAuth();
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

  // Passkey management state
  const [passkeys, setPasskeys] = React.useState([]);
  const [passkeysLoading, setPasskeysLoading] = React.useState(true);
  const [passkeyAdding, setPasskeyAdding] = React.useState(false);
  const [passkeyLabel, setPasskeyLabel] = React.useState('');
  const [showLabelInput, setShowLabelInput] = useState(false);
  const [passkeyToDelete, setPasskeyToDelete] = useState(null);
  const [isDeletingPasskey, setIsDeletingPasskey] = useState(false);

  if (!currentUser) return null;
  const profile = currentUser.workerProfile;

  // Fetch registered passkeys for this user
  const fetchPasskeys = useCallback(async () => {
    setPasskeysLoading(true);
    try {
      const res = await api.get('/api/auth/passkeys');
      setPasskeys(res.data);
    } catch { setPasskeys([]); }
    finally { setPasskeysLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchPasskeys(); }, []);

  const handleAddPasskey = async () => {
    if (!passkeyLabel.trim()) { showToast('Please enter a name for this passkey.', 'error'); return; }
    setPasskeyAdding(true);
    try {
      await registerPasskey(passkeyLabel.trim());
      showToast('Passkey added successfully! 🔑', 'success');
      setPasskeyLabel('');
      setShowLabelInput(false);
      await fetchPasskeys();
    } catch (err) {
      const isCancel = err?.name === 'NotAllowedError' || err?.message?.includes('cancelled');
      const isAlreadyRegistered = err?.name === 'InvalidStateError' || err?.message?.includes('already registered') || err?.response?.status === 409;
      if (isCancel) {
        showToast('Passkey setup was cancelled.', 'info');
      } else if (isAlreadyRegistered) {
        showToast('This device already has a registered passkey for your account.', 'warning');
      } else {
        showToast(err.response?.data?.message || err.message || 'Failed to add passkey.', 'error');
      }
    } finally { setPasskeyAdding(false); }
  };

  const handleConfirmDeletePasskey = async () => {
    if (!passkeyToDelete) return;
    setIsDeletingPasskey(true);
    try {
      await api.delete(`/api/auth/passkeys/${passkeyToDelete._id}`);
      setPasskeys(prev => prev.filter(pk => pk._id !== passkeyToDelete._id));
      showToast(`Removed "${passkeyToDelete.label}" passkey.`, 'success');
    } catch {
      showToast('Failed to remove passkey.', 'error');
    } finally {
      setIsDeletingPasskey(false);
      setPasskeyToDelete(null);
    }
  };

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return null;
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return mins <= 1 ? 'Just now' : `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

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

            {/* ── Security & Passkeys Card ────────────────────────── */}
            <div id="passkeys" style={{ marginTop: '32px', background: 'var(--ch-card-bg)', border: '1px solid var(--ch-hairline)', borderRadius: '12px', padding: '24px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '10px', background: isDark ? 'rgba(52,211,153,0.12)' : 'rgba(0,60,51,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Fingerprint size={18} color={isDark ? '#34d399' : '#003c33'} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--ch-ink)' }}>Passkeys</div>
                    <div style={{ fontSize: '12px', color: 'var(--ch-muted, #75758a)', marginTop: '1px' }}>Sign in with biometrics or PIN — no password needed</div>
                  </div>
                </div>
                {!showLabelInput && (
                  <button
                    type="button"
                    onClick={() => setShowLabelInput(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: isDark ? 'rgba(52,211,153,0.12)' : 'rgba(0,60,51,0.08)', color: isDark ? '#34d399' : '#003c33', border: `1px solid ${isDark ? 'rgba(52,211,153,0.3)' : 'rgba(0,60,51,0.2)'}`, borderRadius: '32px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.18s' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    <Plus size={14} /> Add Passkey
                  </button>
                )}
              </div>

              {/* Add passkey — label input */}
              {showLabelInput && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', padding: '16px', background: isDark ? 'rgba(52,211,153,0.06)' : 'rgba(0,60,51,0.04)', borderRadius: '10px', border: `1px solid ${isDark ? 'rgba(52,211,153,0.2)' : 'rgba(0,60,51,0.12)'}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: isDark ? '#9ca3af' : '#75758a', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px', fontFamily: "'JetBrains Mono', monospace" }}>Name this passkey</div>
                    <input
                      type="text"
                      value={passkeyLabel}
                      onChange={e => setPasskeyLabel(e.target.value)}
                      placeholder="e.g. MacBook Touch ID, iPhone Face ID"
                      maxLength={64}
                      autoFocus
                      style={{ width: '100%', padding: '9px 12px', background: isDark ? 'var(--ch-input-bg)' : '#fff', color: 'var(--ch-ink)', border: '1px solid var(--ch-hairline)', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddPasskey(); if (e.key === 'Escape') { setShowLabelInput(false); setPasskeyLabel(''); } }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end' }}>
                    <button type="button" onClick={handleAddPasskey} disabled={passkeyAdding || !passkeyLabel.trim()} style={{ padding: '9px 16px', background: isDark ? '#34d399' : '#003c33', color: isDark ? '#0d1117' : '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: passkeyAdding || !passkeyLabel.trim() ? 'not-allowed' : 'pointer', opacity: passkeyAdding || !passkeyLabel.trim() ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '6px', transition: 'opacity 0.15s' }}>
                      {passkeyAdding ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg> : <Key size={14} />}
                      Create
                    </button>
                    <button type="button" onClick={() => { setShowLabelInput(false); setPasskeyLabel(''); }} style={{ padding: '9px 12px', background: 'transparent', border: '1px solid var(--ch-hairline)', borderRadius: '8px', fontSize: '13px', color: 'var(--ch-ink)', cursor: 'pointer', opacity: 0.7 }}>
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Passkey list */}
              {passkeysLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ch-muted, #75758a)', fontSize: '13px', padding: '8px 0' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
                  Loading passkeys…
                </div>
              ) : passkeys.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--ch-muted, #75758a)', fontSize: '13px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.4 }}>🔑</div>
                  No passkeys registered yet.<br />Add one above to enable passwordless sign-in.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {passkeys.map(pk => (
                    <div key={pk._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: isDark ? 'rgba(255,255,255,0.03)' : '#f9fafb', border: '1px solid var(--ch-hairline)', borderRadius: '10px', transition: 'background 0.15s' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '9px', background: isDark ? 'rgba(255,255,255,0.06)' : '#f0f0f4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Key size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 500, fontSize: '14px', color: 'var(--ch-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pk.label}</div>
                        <div style={{ fontSize: '11px', color: 'var(--ch-muted, #75758a)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ textTransform: 'capitalize' }}>{pk.deviceType === 'multiDevice' ? '☁ Synced' : '📱 Device'}</span>
                          {pk.lastUsedAt && <span>· Last used {formatRelativeTime(pk.lastUsedAt)}</span>}
                          {!pk.lastUsedAt && <span style={{ opacity: 0.6 }}>· Never used</span>}
                          {pk.backedUp && <span style={{ color: isDark ? '#34d399' : '#059669' }}>· Backed up</span>}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPasskeyToDelete(pk)}
                        title="Remove passkey"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '8px', background: 'transparent', border: '1px solid transparent', color: isDark ? '#9ca3af' : '#9ca3af', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}
                        onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(239,68,68,0.1)' : '#fff0f0'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = isDark ? '#9ca3af' : '#9ca3af'; e.currentTarget.style.borderColor = 'transparent'; }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Compact Appearance Toggle ── */}
          <div style={{
            ...cardStyle,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {isDark ? <Moon size={16} color="#fbbf24" /> : <Sun size={16} color="#f59e0b" />}
              <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--ch-ink)' }}>
                Appearance
              </span>
            </div>
            {/* Horizontal segmented toggle */}
            <div style={{
              display: 'flex',
              background: isDark ? 'rgba(255,255,255,0.06)' : '#f0f0f4',
              borderRadius: '9999px',
              padding: '3px',
              gap: '2px',
            }}>
              {[
                { value: 'light', icon: <Sun size={13} />, label: 'Light' },
                { value: 'dark',  icon: <Moon size={13} />, label: 'Dark'  },
              ].map((opt) => {
                const isActive = theme === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTheme(opt.value)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      padding: '5px 12px', borderRadius: '9999px',
                      border: 'none', cursor: 'pointer',
                      fontSize: '12px', fontWeight: isActive ? 600 : 400,
                      background: isActive
                        ? (isDark ? '#34d399' : '#17171c')
                        : 'transparent',
                      color: isActive
                        ? (isDark ? '#0d1117' : '#ffffff')
                        : (isDark ? '#9ca3af' : '#6b7280'),
                      transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Passkey Removal */}
      <ConfirmModal
        isOpen={!!passkeyToDelete}
        title="Remove Passkey?"
        message={`Are you sure you want to remove "${passkeyToDelete?.label || 'this passkey'}"? You will no longer be able to use this device to sign in with biometrics or PIN.`}
        confirmText="Remove Passkey"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeletingPasskey}
        onCancel={() => setPasskeyToDelete(null)}
        onConfirm={handleConfirmDeletePasskey}
      />
    </div>
  );
}
