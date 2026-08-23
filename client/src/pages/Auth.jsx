import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import ImageUpload from "../components/ImageUpload";
import { ThinkingOrb } from "thinking-orbs";

/* ─── Dark colour palette ─────────────────────────────────── */
const C = {
  pageBg:   "#0e0d0c",
  leftBg:   "#111009",
  cardBg:   "#181512",
  inputBg:  "#1e1b16",
  border:   "#2a2620",
  borderFoc:"#cc785c",
  textPri:  "#f0ede7",
  textMut:  "#6e6a62",
  textSub:  "#a09a90",
  accent:   "#cc785c",
  errorBg:  "#2a1414",
  errorBdr: "rgba(200,60,50,0.25)",
  errorTxt: "#e07070",
  okBg:     "#0e1f14",
  okBdr:    "rgba(50,180,90,0.2)",
  okTxt:    "#5cb87a",
};

/* ─── Styles ──────────────────────────────────────────────── */
const S = {
  /* The outer shell locks to exactly one viewport height */
  page: {
    display: "flex",
    height: "100vh",
    overflow: "hidden",
    fontFamily: "'Inter', -apple-system, sans-serif",
    background: C.pageBg,
  },
  leftPanel: {
    background: C.leftBg,
    color: C.textPri,
    width: "400px",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "48px 44px",
    borderRight: `1px solid ${C.border}`,
  },
  /* Right side scrolls internally if content overflows (e.g. Worker signup) */
  rightPanel: {
    flex: 1,
    background: C.pageBg,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    overflowY: "auto",
    padding: "28px 24px",
  },
  formCard: {
    background: C.cardBg,
    border: `1px solid ${C.border}`,
    borderRadius: "18px",
    padding: "32px 36px",
    width: "100%",
    maxWidth: "440px",
    boxShadow: "0 0 0 1px rgba(204,120,92,0.04), 0 8px 40px rgba(0,0,0,0.55)",
    /* Ensure card never exceeds panel height but lets inner content breathe */
    boxSizing: "border-box",
  },
  label: {
    display: "block",
    fontSize: "10.5px",
    fontWeight: 600,
    color: C.textSub,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "9px 13px",
    background: C.inputBg,
    color: C.textPri,
    border: `1px solid ${C.border}`,
    borderRadius: "8px",
    fontSize: "13.5px",
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
    boxSizing: "border-box",
  },
  inputFocus: {
    borderColor: C.borderFoc,
    boxShadow: "0 0 0 3px rgba(204,120,92,0.12)",
  },
  btnPrimary: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: "100%",
    padding: "11px 22px",
    background: C.accent,
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    letterSpacing: "0.01em",
    cursor: "pointer",
    transition: "opacity 0.15s, transform 0.1s",
    fontFamily: "'Inter', sans-serif",
    minHeight: "42px",
  },
  roleBtn: (active) => ({
    flex: 1,
    padding: "9px 14px",
    background: active ? "rgba(204,120,92,0.12)" : C.inputBg,
    color: active ? C.accent : C.textSub,
    border: active ? `1.5px solid ${C.accent}` : `1px solid ${C.border}`,
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: active ? 600 : 400,
    cursor: "pointer",
    transition: "all 0.15s",
    fontFamily: "'Inter', sans-serif",
  }),
};

/* ─── FormInput ───────────────────────────────────────────── */
function FormInput({ label, type = "text", value, onChange, placeholder, required, suffix }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: "13px" }}>
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
            paddingRight: suffix ? "42px" : "13px",
          }}
        />
        {suffix && (
          <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)" }}>
            {suffix}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Auth page ───────────────────────────────────────────── */
export default function Auth() {
  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isLogin, setIsLogin]       = useState(true);
  const [showPwd, setShowPwd]       = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState("");

  const [name, setName]             = useState("");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [phone, setPhone]           = useState("");
  const [role, setRole]             = useState("Customer");
  const [skills, setSkills]         = useState(["electrician"]);
  const [experience, setExperience] = useState("");
  const [address, setAddress]       = useState("");
  const [bio, setBio]               = useState("");
  const [proofUrls, setProofUrls]   = useState([]);

  useEffect(() => {
    if (searchParams.get("role") === "Worker") {
      setIsLogin(false);
      setRole("Worker");
    }
  }, [searchParams]);

  const redirect = () => setTimeout(() => navigate("/dashboard"), 900);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        setSuccess("Signed in — redirecting…");
        redirect();
      } else {
        if (!name || !email || !password || !phone)
          throw new Error("Please fill in all required fields.");
        const wp = {};
        if (role === "Worker") {
          if (!experience || !address)
            throw new Error("Please enter your experience and service area.");
          Object.assign(wp, {
            skill: skills[0] || "electrician",
            skills,
            experience: Number(experience),
            address,
            bio,
            proofOfWorkUrls: proofUrls.length > 0 ? proofUrls : [],
            coordinates: [
              78.3489 + (Math.random() - 0.5) * 0.04,
              17.2181 + (Math.random() - 0.5) * 0.04,
            ],
          });
        }
        await register({ name, email, password, role, phone, workerProfile: wp });
        setSuccess(
          role === "Worker"
            ? "Registered! Pending administrator approval before profile activation."
            : "Account created successfully."
        );
        redirect();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Authentication failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Google sign-in failed."
      );
    }
  };

  return (
    /* height: 100vh + overflow: hidden = zero page scroll */
    <div style={S.page}>

      {/* ── LEFT — brand panel (desktop only) ───────────── */}
      <div style={S.leftPanel} className="hidden md:flex md:flex-col">

        {/* Logo mark */}
        <div style={{
          width: "40px", height: "40px",
          background: C.accent,
          borderRadius: "10px",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: "16px",
          boxShadow: "0 0 18px rgba(204,120,92,0.28)",
          flexShrink: 0,
        }}>
          <svg width="19" height="19" fill="none" stroke="#fff" strokeWidth="2.2" viewBox="0 0 24 24">
            <path d="M3 21V7l9-4 9 4v14" />
            <path d="M9 21v-6h6v6" />
          </svg>
        </div>

        {/* Brand name */}
        <div style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "24px",
          fontWeight: 400,
          color: C.textPri,
          letterSpacing: "-0.01em",
          marginBottom: "4px",
        }}>
          Grama Seva
        </div>
        <div style={{ fontSize: "12px", color: C.textMut, marginBottom: "36px" }}>
          Rural Service Portal
        </div>

        {/* Headline */}
        <h2 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "28px",
          fontWeight: 400,
          color: C.textPri,
          lineHeight: 1.22,
          letterSpacing: "-0.02em",
          marginBottom: "14px",
        }}>
          Connecting rural talent<br />
          with people who need them.
        </h2>

        {/* Sub-copy */}
        <p style={{ fontSize: "13.5px", color: C.textMut, lineHeight: 1.65, maxWidth: "300px", marginBottom: "40px" }}>
          Empowering local skilled workers across Andhra villages with
          direct community connections and administrator verification.
        </p>

        {/* Feature pills */}
        {[
          { icon: "✓", text: "Verified skill-based profiles" },
          { icon: "✓", text: "Community-driven reviews" },
          { icon: "✓", text: "Admin-approved worker onboarding" },
        ].map((f) => (
          <div key={f.text} style={{
            display: "flex", alignItems: "center", gap: "10px",
            marginBottom: "10px",
          }}>
            <span style={{
              width: "18px", height: "18px", borderRadius: "50%",
              background: "rgba(204,120,92,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "10px", color: C.accent, flexShrink: 0,
            }}>{f.icon}</span>
            <span style={{ fontSize: "13px", color: C.textSub }}>{f.text}</span>
          </div>
        ))}

        {/* Footer */}
        <div style={{
          marginTop: "auto",
          fontSize: "11.5px",
          color: C.textMut,
          borderTop: `1px solid ${C.border}`,
          paddingTop: "16px",
        }}>
          © 2026 Grama Seva Rural Network.
        </div>
      </div>

      {/* ── RIGHT — form (scrolls internally only if needed) ── */}
      <div style={S.rightPanel}>
        <div style={S.formCard}>

          {/* Card header */}
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "24px",
            fontWeight: 400,
            color: C.textPri,
            letterSpacing: "-0.017em",
            lineHeight: 1.1,
            marginBottom: "4px",
          }}>
            {isLogin ? "Sign In" : "Create Account"}
          </h2>
          <p style={{ fontSize: "12.5px", color: C.textMut, marginBottom: "20px" }}>
            {isLogin ? "Welcome back to Grama Seva." : "Join the rural services network."}
          </p>

          {/* Banners */}
          {error && (
            <div style={{
              padding: "10px 13px",
              background: C.errorBg,
              border: `1px solid ${C.errorBdr}`,
              borderRadius: "8px",
              fontSize: "12.5px",
              color: C.errorTxt,
              marginBottom: "14px",
            }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{
              padding: "10px 13px",
              background: C.okBg,
              border: `1px solid ${C.okBdr}`,
              borderRadius: "8px",
              fontSize: "12.5px",
              color: C.okTxt,
              marginBottom: "14px",
            }}>
              {success}
            </div>
          )}

          {/* ── Form ── */}
          <form onSubmit={handleSubmit}>

            {/* Register-only: name + phone */}
            {!isLogin && (
              <>
                <FormInput
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ramesh Kumar"
                  required
                />
                <FormInput
                  label="Phone Number"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit number"
                  required
                />
              </>
            )}

            <FormInput
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />

            {/* Password */}
            <div style={{ marginBottom: "13px" }}>
              <label style={S.label}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  style={{ ...S.input, paddingRight: "42px" }}
                  onFocus={(e) => {
                    e.target.style.borderColor = C.borderFoc;
                    e.target.style.boxShadow = "0 0 0 3px rgba(204,120,92,0.12)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = C.border;
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{
                    position: "absolute", right: "12px", top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: C.textMut, display: "flex", padding: 0,
                  }}
                >
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Role selector + worker fields */}
            {!isLogin && (
              <div style={{ marginBottom: "16px" }}>
                <label style={{ ...S.label, marginBottom: "8px" }}>Account Type</label>
                <div style={{ display: "flex", gap: "8px", marginBottom: role === "Worker" ? "12px" : "0" }}>
                  {["Customer", "Worker"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      style={S.roleBtn(role === r)}
                    >
                      {r === "Customer" ? "👤" : "🔧"} {r}
                    </button>
                  ))}
                </div>

                {role === "Worker" && (
                  <div style={{
                    padding: "14px",
                    background: C.inputBg,
                    border: `1px solid ${C.border}`,
                    borderRadius: "10px",
                  }}>
                    <div style={{
                      fontSize: "10px", fontWeight: 700,
                      color: C.accent, marginBottom: "12px",
                      textTransform: "uppercase", letterSpacing: "0.08em",
                    }}>
                      Worker Profile &amp; Skill Details
                    </div>

                    {/* Skills grid */}
                    <div style={{ marginBottom: "12px" }}>
                      <label style={S.label}>Skills (Select All That Apply)</label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                        {[
                          { id: "electrician", label: "Electrician" },
                          { id: "mason",       label: "Mason" },
                          { id: "plumber",     label: "Plumber" },
                          { id: "carpenter",   label: "Carpenter" },
                          { id: "mechanic",    label: "Mechanic" },
                          { id: "painter",     label: "Painter" },
                          { id: "cleaning",    label: "House Cleaning" },
                          { id: "other",       label: "General Labour" },
                        ].map((s) => (
                          <label key={s.id} style={{
                            display: "flex", alignItems: "center", gap: "6px",
                            fontSize: "12.5px", color: C.textSub, cursor: "pointer",
                          }}>
                            <input
                              type="checkbox"
                              checked={skills.includes(s.id)}
                              onChange={(e) => {
                                if (e.target.checked) setSkills([...skills, s.id]);
                                else setSkills(skills.filter((sk) => sk !== s.id));
                              }}
                              style={{ accentColor: C.accent }}
                            />
                            {s.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Experience & Location side-by-side */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px" }}>
                      <div>
                        <label style={S.label}>Experience (Yrs)</label>
                        <input
                          type="number"
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          placeholder="e.g. 5"
                          required
                          style={S.input}
                        />
                      </div>
                      <div>
                        <label style={S.label}>Village Location</label>
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Shamshabad Ward 3"
                          required
                          style={S.input}
                        />
                      </div>
                    </div>

                    {/* Bio */}
                    <div style={{ marginBottom: "10px" }}>
                      <label style={S.label}>Bio / Work Description</label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows="2"
                        placeholder="Describe your expertise and availability..."
                        style={{
                          ...S.input,
                          height: "auto",
                          resize: "none",
                          padding: "9px 13px",
                        }}
                      />
                    </div>

                    {/* Proof upload */}
                    <div>
                      <ImageUpload
                        mode="multiple"
                        endpoint="proof"
                        label="Proof-of-Work Photo"
                        value={proofUrls}
                        onChange={setProofUrls}
                        maxFiles={3}
                      />
                      <div style={{ fontSize: "10.5px", color: C.textMut, marginTop: "5px", fontStyle: "italic" }}>
                        Upload 1–3 work photos. Reviewed by administrator.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              style={S.btnPrimary}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseDown={(e) => !loading && (e.currentTarget.style.transform = "scale(0.97)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              {loading
                ? <ThinkingOrb state="connecting" size={36} />
                : isLogin ? "Sign In" : "Create Account"
              }
            </button>
          </form>

          {/* Google sign-in */}
          <div style={{ marginTop: "13px", display: "flex", justifyContent: "center" }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google sign-in failed.")}
              width="368"
              shape="pill"
              theme="filled_black"
              size="large"
              text="signin_with"
              logo_alignment="left"
              useOneTap={false}
            />
          </div>

          {/* Switch mode */}
          <div style={{ textAlign: "center", marginTop: "14px" }}>
            <button
              onClick={() => { setIsLogin(!isLogin); setError(""); setSuccess(""); }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: "12.5px", color: C.accent, letterSpacing: "-0.01em",
              }}
            >
              {isLogin
                ? "Don't have an account? Sign Up"
                : "Already have an account? Sign In"}
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
