import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Power, Upload, Plus, Trash2, MapPin, Crosshair } from "lucide-react";

export default function Settings() {
  const { currentUser, updateWorkerProfile } = useAuth();
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
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [locationCoords, setLocationCoords] = useState(
    currentUser?.workerProfile?.location?.coordinates || [0, 0]
  );
  const [geoLoading, setGeoLoading] = useState(false);

  const [powFiles, setPowFiles] = useState([]);
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

  const handleFileChange = (e) => {
    Array.from(e.target.files).forEach((f) => {
      const r = new FileReader();
      r.onloadend = () => setPowFiles((p) => [...p, r.result]);
      r.readAsDataURL(f);
    });
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

  const handleAddGalleryUrl = () => {
    if (!newGalleryUrl.trim()) return;
    setGallery([...gallery, newGalleryUrl.trim()]);
    setNewGalleryUrl("");
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
        if (powFiles.length > 0) {
          const newProofs = powFiles.map((url) => ({ url, submissionDate: new Date().toISOString(), status: "Pending" }));
          payload.workerProfile.proofOfWork = [...(profile.proofOfWork || []), ...newProofs];
        }
      } else if (currentUser.role === "Customer") {
        // Customers can also save location
        payload.workerProfile = {
          location: {
            type: "Point",
            coordinates: locationCoords
          }
        };
      }
      await updateWorkerProfile(payload);
      showToast("Settings saved successfully!", "success");
      setPowFiles([]);
    } catch (err) { showToast(err.message || "Save failed.", "error"); }
  };

  return (
    <div style={{ padding: "40px 24px", background: "#faf9f5", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "32px", fontWeight: 400, color: "#141413" }}>
            Account Settings
          </h1>
          <p style={{ fontSize: "15px", color: "#6c6a64", marginTop: "6px" }}>
            Manage your profile, location, skills, services, and photo gallery.
          </p>
        </div>



        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Worker Availability Status */}
          {currentUser.role === "Worker" && profile && (
            <div style={{ background: "#ffffff", border: "1px solid #e6dfd8", borderRadius: "16px", padding: "24px" }}>
              <div style={{ fontSize: "16px", fontWeight: 600, color: "#141413", marginBottom: "4px" }}>Public Availability</div>
              <p style={{ fontSize: "14px", color: "#6c6a64", marginBottom: "16px" }}>Control whether your profile appears as Available in local directory searches.</p>

              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <button
                  onClick={handleToggleAvailability}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    padding: "10px 20px",
                    background: profile.isAvailable ? "#5db872" : "#efe9de",
                    color: profile.isAvailable ? "#ffffff" : "#c64545",
                    border: profile.isAvailable ? "none" : "1px solid #e6dfd8",
                    borderRadius: "8px", fontSize: "14px", fontWeight: 500, cursor: "pointer"
                  }}
                >
                  <Power size={15} />
                  {profile.isAvailable ? "Online — Accepting Work" : "Offline — Unavailable"}
                </button>

                {!profile.isVerified && (
                  <span style={{ fontSize: "13px", color: "#e8a55a", fontWeight: 500 }}>
                    ⏳ Pending Administrator Approval
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Form */}
          <div style={{ background: "#ffffff", border: "1px solid #e6dfd8", borderRadius: "16px", padding: "32px", boxShadow: "0 2px 12px rgba(20,20,19,0.03)" }}>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "22px", color: "#141413", marginBottom: "20px" }}>
              Personal & Work Profile
            </h2>

            <form onSubmit={handleSave}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }} className="settings-form-grid">
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#141413", marginBottom: "6px" }}>Full Name</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", background: "#faf9f5", border: "1px solid #e6dfd8", borderRadius: "8px", fontSize: "15px", outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#141413", marginBottom: "6px" }}>Phone Number</label>
                  <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", background: "#faf9f5", border: "1px solid #e6dfd8", borderRadius: "8px", fontSize: "15px", outline: "none" }}
                  />
                </div>
              </div>

              {/* Location Picker — Available for all roles */}
              <div style={{ marginBottom: "20px", padding: "18px", background: "#faf9f5", border: "1px solid #e6dfd8", borderRadius: "12px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color: "#cc785c", textTransform: "uppercase", marginBottom: "10px" }}>
                  <MapPin size={14} /> Your Location
                </label>
                <p style={{ fontSize: "13px", color: "#6c6a64", marginBottom: "12px" }}>
                  Set your location for accurate distance calculations. Workers near you will appear first in search results.
                </p>
                <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={geoLoading}
                    style={{
                      padding: "10px 18px", background: "#cc785c", color: "#ffffff", border: "none",
                      borderRadius: "8px", fontSize: "14px", fontWeight: 500, cursor: geoLoading ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", gap: "8px", opacity: geoLoading ? 0.7 : 1,
                    }}
                  >
                    <Crosshair size={15} className={geoLoading ? "animate-spin" : ""} />
                    {geoLoading ? "Detecting..." : "Use My Current Location"}
                  </button>
                  {locationCoords[0] !== 0 && locationCoords[1] !== 0 && (
                    <div style={{ fontSize: "13px", color: "#5db872", fontWeight: 500, display: "flex", alignItems: "center", gap: "4px" }}>
                      ✔ Location set ({locationCoords[1].toFixed(4)}, {locationCoords[0].toFixed(4)})
                    </div>
                  )}
                </div>
              </div>

              {/* Worker Specific Settings */}
              {currentUser.role === "Worker" && profile && (
                <>
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#141413", marginBottom: "8px" }}>
                      Select Skill Categories (Check All That Apply)
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", padding: "14px", background: "#faf9f5", border: "1px solid #e6dfd8", borderRadius: "10px" }}>
                      {[
                        { id: "electrician", label: "Electrician" },
                        { id: "mason", label: "Mason" },
                        { id: "plumber", label: "Plumber" },
                        { id: "carpenter", label: "Carpenter" },
                        { id: "mechanic", label: "Mechanic" },
                        { id: "painter", label: "Painter" },
                        { id: "cleaning", label: "House Cleaning" },
                        { id: "other", label: "General Labour" },
                      ].map((s) => (
                        <label key={s.id} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#141413", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={skills.includes(s.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSkills([...skills, s.id]);
                              else setSkills(skills.filter(sk => sk !== s.id));
                            }}
                            style={{ accentColor: "#cc785c" }}
                          />
                          {s.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#141413", marginBottom: "6px" }}>Village Area / Service Address</label>
                    <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Shamshabad Village Ward 3"
                      style={{ width: "100%", padding: "10px 14px", background: "#faf9f5", border: "1px solid #e6dfd8", borderRadius: "8px", fontSize: "15px", outline: "none" }}
                    />
                    <div style={{ fontSize: "12px", color: "#8e8b82", fontStyle: "italic", marginTop: "4px" }}>
                      💡 Tip: Using your home address as your service area location gives customers the most accurate distance calculation.
                    </div>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#141413", marginBottom: "6px" }}>About & Work Bio</label>
                    <textarea rows="3" value={bio} onChange={(e) => setBio(e.target.value)}
                      placeholder="Describe your specialization, hours, and past work experience..."
                      style={{ width: "100%", padding: "10px 14px", background: "#faf9f5", border: "1px solid #e6dfd8", borderRadius: "8px", fontSize: "14px", outline: "none", resize: "vertical" }}
                    />
                  </div>

                  {/* SERVICES & PRICING MANAGEMENT */}
                  <div style={{ marginBottom: "24px", padding: "18px", background: "#faf9f5", border: "1px solid #e6dfd8", borderRadius: "12px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#cc785c", textTransform: "uppercase", marginBottom: "10px" }}>
                      💲 Services & Pricing (rupees symbol ₹)
                    </label>

                    {services.map((svc, idx) => (
                      <div key={idx} style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
                        <div style={{ flex: 1, padding: "8px 12px", background: "#ffffff", border: "1px solid #e6dfd8", borderRadius: "6px", fontSize: "14px", color: "#141413" }}>
                          {svc.name}
                        </div>
                        <div style={{ padding: "8px 12px", background: "#ffffff", border: "1px solid #e6dfd8", borderRadius: "6px", fontSize: "14px", fontWeight: 600, color: "#cc785c", fontFamily: "'Inter', sans-serif", fontVariantNumeric: "tabular-nums" }}>
                          ₹{svc.price}
                        </div>
                        <button type="button" onClick={() => handleRemoveService(idx)} style={{ background: "none", border: "none", color: "#c64545", cursor: "pointer" }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}

                    <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                      <input type="text" placeholder="Service Name (e.g. Fan Fitting)" value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)}
                        style={{ flex: 1, padding: "8px 12px", background: "#ffffff", border: "1px solid #e6dfd8", borderRadius: "6px", fontSize: "14px", outline: "none" }}
                      />
                      <input type="number" placeholder="Price (₹)" value={newServicePrice} onChange={(e) => setNewServicePrice(e.target.value)}
                        style={{ width: "100px", padding: "8px 12px", background: "#ffffff", border: "1px solid #e6dfd8", borderRadius: "6px", fontSize: "14px", outline: "none", fontFamily: "'Inter', sans-serif" }}
                      />
                      <button type="button" onClick={handleAddService} style={{ padding: "8px 14px", background: "#cc785c", color: "#ffffff", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Plus size={14} /> Add
                      </button>
                    </div>
                  </div>

                  {/* WORK GALLERY MANAGEMENT */}
                  <div style={{ marginBottom: "24px", padding: "18px", background: "#faf9f5", border: "1px solid #e6dfd8", borderRadius: "12px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#cc785c", textTransform: "uppercase", marginBottom: "10px" }}>
                      🖼️ Work Gallery Pictures
                    </label>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "12px" }}>
                      {gallery.map((imgUrl, idx) => (
                        <div key={idx} style={{ position: "relative", aspectRatio: "1.2", borderRadius: "8px", overflow: "hidden", border: "1px solid #e6dfd8" }}>
                          <img src={imgUrl} alt="Work photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <button
                            type="button"
                            onClick={() => setGallery(gallery.filter((_, i) => i !== idx))}
                            style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: "22px", height: "22px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <input type="text" placeholder="Paste Image Web URL..." value={newGalleryUrl} onChange={(e) => setNewGalleryUrl(e.target.value)}
                        style={{ flex: 1, padding: "8px 12px", background: "#ffffff", border: "1px solid #e6dfd8", borderRadius: "6px", fontSize: "14px", outline: "none" }}
                      />
                      <button type="button" onClick={handleAddGalleryUrl} style={{ padding: "8px 14px", background: "#efe9de", color: "#141413", border: "1px solid #e6dfd8", borderRadius: "6px", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
                        Add Picture
                      </button>
                    </div>
                  </div>
                </>
              )}

              <button type="submit" style={{
                width: "100%", padding: "12px 22px", background: "#cc785c", color: "#ffffff",
                border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: 500,
                cursor: "pointer", transition: "background 0.15s"
              }}>
                Save Settings
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
