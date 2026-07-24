import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, Upload } from "lucide-react";
import { GoogleLogin } from '@react-oauth/google';

const S = {
  page: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Inter', -apple-system, sans-serif",
    background: "#faf9f5",
  },
  leftPanel: {
    background: "#181715",
    color: "#faf9f5",
    width: "420px",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    padding: "56px 44px",
    justifyContent: "between",
    borderRight: "1px solid #252320",
  },
  rightPanel: {
    flex: 1,
    background: "#faf9f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 24px",
  },
  formCard: {
    background: "#ffffff",
    border: "1px solid #e6dfd8",
    borderRadius: "16px",
    padding: "40px",
    width: "100%",
    maxWidth: "440px",
    boxShadow: "0 4px 24px rgba(20,20,19,0.04)",
  },
  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    color: "#141413",
    letterSpacing: "-0.007em",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "11px 15px",
    background: "#faf9f5",
    color: "#141413",
    border: "1px solid #e6dfd8",
    borderRadius: "8px",
    fontSize: "15px",
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
    boxSizing: "border-box",
  },
  inputFocus: {
    borderColor: "#cc785c",
    boxShadow: "0 0 0 3px rgba(204,120,92,0.15)",
  },
  select: {
    width: "100%",
    padding: "11px 15px",
    background: "#faf9f5",
    color: "#141413",
    border: "1px solid #e6dfd8",
    borderRadius: "8px",
    fontSize: "15px",
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    cursor: "pointer",
  },
  btnPrimary: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: "12px 22px",
    background: "#cc785c",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: 500,
    letterSpacing: "-0.01em",
    cursor: "pointer",
    transition: "background 0.15s, transform 0.1s",
    fontFamily: "'Inter', sans-serif",
  },
  btnSecondary: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: "12px 22px",
    background: "transparent",
    color: "#cc785c",
    border: "1px solid #cc785c",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s",
    fontFamily: "'Inter', sans-serif",
    marginTop: "10px",
  },
  roleBtn: (active) => ({
    flex: 1,
    padding: "12px 16px",
    background: active ? "#efe9de" : "#faf9f5",
    color: active ? "#cc785c" : "#141413",
    border: active ? "1.5px solid #cc785c" : "1px solid #e6dfd8",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: active ? 600 : 400,
    cursor: "pointer",
    transition: "all 0.15s",
    fontFamily: "'Inter', sans-serif",
  }),
};

function FormInput({ label, type = "text", value, onChange, placeholder, required, suffix }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={S.label}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            ...S.input,
            ...(focused ? S.inputFocus : {}),
            paddingRight: suffix ? "44px" : "14px",
          }}
        />
        {suffix && (
          <div style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)" }}>
            {suffix}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Auth() {
  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isLogin, setIsLogin] = useState(true);
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Customer");
  const [skills, setSkills] = useState(["electrician"]);
  const [experience, setExperience] = useState("");
  const [address, setAddress] = useState("");
  const [bio, setBio] = useState("");
  const [proofFiles, setProofFiles] = useState([]);

  useEffect(() => {
    if (searchParams.get("role") === "Worker") { setIsLogin(false); setRole("Worker"); }
  }, [searchParams]);

  const handleFile = (e) => {
    Array.from(e.target.files).forEach((f) => {
      const r = new FileReader();
      r.onloadend = () => setProofFiles((p) => [...p, r.result]);
      r.readAsDataURL(f);
    });
  };

  const redirect = () => setTimeout(() => navigate("/dashboard"), 900);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      if (isLogin) {
        const user = await login(email, password);
        setSuccess("Signed in — redirecting…");
        redirect();
      } else {
        if (!name || !email || !password || !phone) throw new Error("Please fill in all required fields.");
        const wp = {};
        if (role === "Worker") {
          if (!experience || !address) throw new Error("Please enter your experience and service area.");
          Object.assign(wp, {
            skill: skills[0] || "electrician",
            skills, experience: Number(experience), address, bio,
            proofOfWorkUrls: proofFiles.length > 0 ? proofFiles : ["https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400"],
            coordinates: [78.3489 + (Math.random() - 0.5) * 0.04, 17.2181 + (Math.random() - 0.5) * 0.04],
          });
        }
        await register({ name, email, password, role, phone, workerProfile: wp });
        setSuccess(role === "Worker" ? "Registered! Pending administrator approval before profile activation." : "Account created successfully.");
        redirect();
      }
    } catch (err) { setError(err.response?.data?.message || err.response?.data?.error || err.message || "Authentication failed."); }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Google sign-in failed.");
    }
  };

  return (
    <div style={S.page} className="flex-col md:flex-row">
      {/* LEFT — brand panel */}
      <div style={S.leftPanel} className="w-full md:w-[420px] p-6 md:p-14">
        <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            {/* Brand Header */}
            <div style={{ marginBottom: "40px" }}>
              <div style={{
                width: "40px", height: "40px",
                background: "#cc785c",
                borderRadius: "10px",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "16px",
              }}>
                <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path d="M3 21V7l9-4 9 4v14"/>
                  <path d="M9 21v-6h6v6"/>
                </svg>
              </div>
              <div style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "26px", fontWeight: 400, color: "#faf9f5", letterSpacing: "-0.01em",
              }}>Grama Seva</div>
              <div style={{ fontSize: "14px", color: "#a09d96", marginTop: "4px" }}>Rural Service Portal</div>
            </div>

            <h2 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "32px", fontWeight: 400, color: "#faf9f5",
              lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: "16px",
            }}>
              Connecting rural talent<br />with people who need them.
            </h2>
            <p style={{ fontSize: "15px", color: "#a09d96", lineHeight: 1.6, maxWidth: "340px" }}>
              Empowering local skilled workers across Andhra villages with direct community connections and administrator verification.
            </p>
          </div>

          <div style={{ fontSize: "13px", color: "#6c6a64", borderTop: "1px solid #252320", paddingTop: "20px", marginTop: "24px" }}>
            © 2026 Grama Seva Rural Network.
          </div>
        </div>
      </div>

      {/* RIGHT — form */}
      <div style={S.rightPanel}>
        <div style={S.formCard}>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "28px", fontWeight: 400, color: "#141413",
            letterSpacing: "-0.017em", lineHeight: 1.1, marginBottom: "6px",
          }}>
            {isLogin ? "Sign In" : "Create Account"}
          </h2>
          <p style={{ fontSize: "14px", color: "#6c6a64", marginBottom: "24px" }}>
            {isLogin ? "Welcome back to Grama Seva." : "Join the rural services network."}
          </p>

          {error && (
            <div style={{ padding: "12px 14px", background: "#fff2f2", border: "1px solid rgba(255,59,48,0.2)", borderRadius: "8px", fontSize: "14px", color: "#c0392b", marginBottom: "16px" }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ padding: "12px 14px", background: "#f0fff4", border: "1px solid rgba(52,199,89,0.2)", borderRadius: "8px", fontSize: "14px", color: "#248a3d", marginBottom: "16px" }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <FormInput label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ramesh Kumar" required />
                <FormInput label="Phone Number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit number" required />
              </>
            )}

            <FormInput label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required />

            <div style={{ marginBottom: "16px" }}>
              <label style={S.label}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  style={{ ...S.input, paddingRight: "44px" }}
                  onFocus={(e) => { e.target.style.borderColor = "#cc785c"; e.target.style.boxShadow = "0 0 0 3px rgba(204,120,92,0.15)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#e6dfd8"; e.target.style.boxShadow = "none"; }}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
                  position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "#8e8b82", display: "flex",
                }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Role selector */}
            {!isLogin && (
              <div style={{ marginBottom: "20px" }}>
                <label style={{ ...S.label, marginBottom: "10px" }}>Account Type</label>
                <div style={{ display: "flex", gap: "10px" }}>
                  {["Customer", "Worker"].map((r) => (
                    <button key={r} type="button" onClick={() => setRole(r)} style={S.roleBtn(role === r)}>
                      {r === "Customer" ? "👤" : "🔧"} {r}
                    </button>
                  ))}
                </div>

                {role === "Worker" && (
                  <div style={{ marginTop: "16px", padding: "16px", background: "#faf9f5", border: "1px solid #e6dfd8", borderRadius: "11px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "#cc785c", marginBottom: "14px", textTransform: "uppercase" }}>
                      Worker Profile & Skill Details
                    </div>

                    <div style={{ marginBottom: "14px" }}>
                      <label style={S.label}>Select Skills (Select All That Apply)</label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
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

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                      <div>
                        <label style={S.label}>Experience (Years)</label>
                        <input type="number" value={experience} onChange={(e) => setExperience(e.target.value)}
                          placeholder="e.g. 5" required style={S.input}
                        />
                      </div>
                      <div>
                        <label style={S.label}>Village Location</label>
                        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                          placeholder="Shamshabad Ward 3" required style={S.input}
                        />
                      </div>
                    </div>

                    <div style={{ fontSize: "11px", color: "#8e8b82", fontStyle: "italic", marginBottom: "14px" }}>
                      💡 Tip: Using your home address as your service area location gives customers the most accurate distance calculation.
                    </div>

                    <div style={{ marginBottom: "12px" }}>
                      <label style={S.label}>Bio / Work Description</label>
                      <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows="2"
                        placeholder="Describe your expertise, specialization, and availability..."
                        style={{ ...S.input, height: "auto", borderRadius: "8px", resize: "vertical", padding: "10px 14px" }}
                      />
                    </div>

                    <div>
                      <label style={S.label}>Proof-of-Work Photo</label>
                      <div style={{
                        border: "1px dashed #e6dfd8",
                        borderRadius: "8px", padding: "16px",
                        textAlign: "center", position: "relative", cursor: "pointer",
                        background: "#ffffff",
                      }}>
                        <input type="file" accept="image/*" onChange={handleFile}
                          style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
                        <Upload size={18} color="#8e8b82" style={{ margin: "0 auto 4px" }} />
                        <div style={{ fontSize: "12px", color: "#8e8b82" }}>
                          {proofFiles.length > 0 ? `${proofFiles.length} file(s) selected` : "Click to upload proof photo"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button type="submit" style={S.btnPrimary}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
              onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.95)"}
              onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              {isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div style={{ marginTop: "12px" }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google sign-in failed.")}
              width="100%"
              shape="pill"
              theme="outline"
              size="large"
              text="signin_with"
            />
          </div>

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button onClick={() => setIsLogin(!isLogin)} style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: "14px", color: "#0066cc", letterSpacing: "-0.013em",
            }}>
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
