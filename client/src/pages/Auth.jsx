import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import ImageUpload from "../components/ImageUpload";
import BloomingFlower from "../components/BloomingFlower";
import { ThinkingOrb } from "thinking-orbs";

/* ─── Dark colour palette ─────────────────────────────────── */
const C = {
  pageBg:    "#0e0d0c",
  leftBg:    "#111009",
  cardBg:    "#181512",
  inputBg:   "#1e1b16",
  border:    "#2a2620",
  borderFoc: "#cc785c",
  textPri:   "#f0ede7",
  textMut:   "#6e6a62",
  textSub:   "#a09a90",
  accent:    "#cc785c",
  accentDim: "#7a3f28",
  errorBg:   "#2a1414",
  errorBdr:  "rgba(200,60,50,0.25)",
  errorTxt:  "#e07070",
  okBg:      "#0e1f14",
  okBdr:     "rgba(50,180,90,0.2)",
  okTxt:     "#5cb87a",
};

/* ─── Styles ──────────────────────────────────────────────── */
const S = {
  page: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Inter', -apple-system, sans-serif",
    background: C.pageBg,
  },
  leftPanel: {
    background: C.leftBg,
    color: C.textPri,
    width: "420px",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    padding: "56px 44px",
    borderRight: `1px solid ${C.border}`,
    position: "relative",
    overflow: "hidden",
  },
  rightPanel: {
    flex: 1,
    background: C.pageBg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 24px",
  },
  formCard: {
    background: C.cardBg,
    border: `1px solid ${C.border}`,
    borderRadius: "18px",
    padding: "40px",
    width: "100%",
    maxWidth: "450px",
    boxShadow: "0 0 0 1px rgba(204,120,92,0.04), 0 8px 40px rgba(0,0,0,0.55)",
  },
  label: {
    display: "block",
    fontSize: "11px",
    fontWeight: 600,
    color: C.textSub,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: "7px",
  },
  input: {
    width: "100%",
    padding: "11px 15px",
    background: C.inputBg,
    color: C.textPri,
    border: `1px solid ${C.border}`,
    borderRadius: "9px",
    fontSize: "14px",
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
    boxSizing: "border-box",
  },
  inputFocus: {
    borderColor: C.borderFoc,
    boxShadow: `0 0 0 3px rgba(204,120,92,0.12)`,
  },
  select: {
    width: "100%",
    padding: "11px 15px",
    background: C.inputBg,
    color: C.textPri,
    border: `1px solid ${C.border}`,
    borderRadius: "9px",
    fontSize: "14px",
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    cursor: "pointer",
  },
  btnPrimary: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: "100%",
    padding: "13px 22px",
    background: C.accent,
    color: "#ffffff",
    border: "none",
    borderRadius: "9px",
    fontSize: "14px",
    fontWeight: 600,
    letterSpacing: "0.01em",
    cursor: "pointer",
    transition: "opacity 0.15s, transform 0.1s",
    fontFamily: "'Inter', sans-serif",
    minHeight: "46px",
  },
  roleBtn: (active) => ({
    flex: 1,
    padding: "11px 16px",
    background: active ? "rgba(204,120,92,0.12)" : C.inputBg,
    color: active ? C.accent : C.textSub,
    border: active ? `1.5px solid ${C.accent}` : `1px solid ${C.border}`,
    borderRadius: "9px",
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

/* ─── Auth page ───────────────────────────────────────────── */
export default function Auth() {
  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isLogin, setIsLogin]     = useState(true);
  const [showPwd, setShowPwd]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");

  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [phone, setPhone]         = useState("");
  const [role, setRole]           = useState("Customer");
  const [skills, setSkills]       = useState(["electrician"]);
  const [experience, setExperience] = useState("");
  const [address, setAddress]     = useState("");
  const [bio, setBio]             = useState("");
  const [proofUrls, setProofUrls] = useState([]);

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
    <div style={S.page} className="flex-col md:flex-row">

      {/* ── LEFT — brand panel ───────────────────────────── */}
      <div style={S.leftPanel} className="hidden md:flex w-full md:w-[420px] p-6 md:p-14">
        <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>

          {/* Top: brand + copy */}
          <div>
            {/* Logo */}
            <div style={{ marginBottom: "40px" }}>
              <div style={{
                width: "42px", height: "42px",
                background: C.accent,
                borderRadius: "11px",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "18px",
                boxShadow: `0 0 20px rgba(204,120,92,0.3)`,
              }}>
                <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path d="M3 21V7l9-4 9 4v14" />
                  <path d="M9 21v-6h6v6" />
                </svg>
              </div>
              <div style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "26px",
                fontWeight: 400,
                color: C.textPri,
                letterSpacing: "-0.01em",
              }}>
                Grama Seva
              </div>
              <div style={{ fontSize: "13px", color: C.textMut, marginTop: "4px" }}>
                Rural Service Portal
              </div>
            </div>

            <h2 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "31px",
              fontWeight: 400,
              color: C.textPri,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              marginBottom: "14px",
            }}>
              Connecting rural talent<br />
              with people who need them.
            </h2>
            <p style={{ fontSize: "14px", color: C.textMut, lineHeight: 1.65, maxWidth: "320px" }}>
              Empowering local skilled workers across Andhra villages with
              direct community connections and administrator verification.
            </p>
          </div>

          {/* Middle: Blooming Flower */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            padding: "16px 0",
          }}>
            <BloomingFlower size={220} color={C.accent} />
            <span style={{ fontSize: "11px", color: C.textMut, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              hover to bloom
            </span>
          </div>

          {/* Bottom: copyright */}
          <div style={{
            fontSize: "12px",
            color: C.textMut,
            borderTop: `1px solid ${C.border}`,
            paddingTop: "18px",
          }}>
            © 2026 Grama Seva Rural Network.
          </div>
        </div>
      </div>

      {/* ── RIGHT — form ─────────────────────────────────── */}
      <div style={S.rightPanel}>
        <div style={S.formCard}>

          {/* Header */}
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "27px",
            fontWeight: 400,
            color: C.textPri,
            letterSpacing: "-0.017em",
            lineHeight: 1.1,
            marginBottom: "6px",
          }}>
            {isLogin ? "Sign In" : "Create Account"}
          </h2>
          <p style={{ fontSize: "13px", color: C.textMut, marginBottom: "24px" }}>
            {isLogin ? "Welcome back to Grama Seva." : "Join the rural services network."}
          </p>

          {/* Error / Success banners */}
          {error && (
            <div style={{
              padding: "11px 14px",
              background: C.errorBg,
              border: `1px solid ${C.errorBdr}`,
              borderRadius: "9px",
              fontSize: "13px",
              color: C.errorTxt,
              marginBottom: "16px",
            }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{
              padding: "11px 14px",
              background: C.okBg,
              border: `1px solid ${C.okBdr}`,
              borderRadius: "9px",
              fontSize: "13px",
              color: C.okTxt,
              marginBottom: "16px",
            }}>
              {success}
            </div>
          )}

          {/* ── Form ── */}
          <form onSubmit={handleSubmit}>
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
                    position: "absolute", right: "14px", top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: C.textMut, display: "flex",
                  }}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Role selector */}
            {!isLogin && (
              <div style={{ marginBottom: "20px" }}>
                <label style={{ ...S.label, marginBottom: "10px" }}>Account Type</label>
                <div style={{ display: "flex", gap: "10px" }}>
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
                    marginTop: "16px",
                    padding: "16px",
                    background: C.inputBg,
                    border: `1px solid ${C.border}`,
                    borderRadius: "12px",
                  }}>
                    <div style={{
                      fontSize: "11px", fontWeight: 600,
                      color: C.accent, marginBottom: "14px",
                      textTransform: "uppercase", letterSpacing: "0.07em",
                    }}>
                      Worker Profile &amp; Skill Details
                    </div>

                    {/* Skills grid */}
                    <div style={{ marginBottom: "14px" }}>
                      <label style={S.label}>Select Skills (Select All That Apply)</label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
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
                            display: "flex", alignItems: "center", gap: "7px",
                            fontSize: "13px", color: C.textSub, cursor: "pointer",
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

                    {/* Experience & Location */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                      <div>
                        <label style={S.label}>Experience (Years)</label>
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

                    <div style={{
                      fontSize: "11px", color: C.textMut,
                      fontStyle: "italic", marginBottom: "14px",
                    }}>
                      💡 Using your home address gives customers the most accurate distance.
                    </div>

                    {/* Bio */}
                    <div style={{ marginBottom: "12px" }}>
                      <label style={S.label}>Bio / Work Description</label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows="2"
                        placeholder="Describe your expertise, specialization, and availability..."
                        style={{
                          ...S.input,
                          height: "auto",
                          borderRadius: "9px",
                          resize: "vertical",
                          padding: "10px 14px",
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
                      <div style={{ fontSize: "11px", color: C.textMut, marginTop: "6px", fontStyle: "italic" }}>
                        Upload 1–3 photos showing your previous work. Reviewed by administrator.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{ ...S.btnPrimary, opacity: loading ? 1 : 1 }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseDown={(e) => !loading && (e.currentTarget.style.transform = "scale(0.97)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              {loading ? (
                <ThinkingOrb state="connecting" size={40} />
              ) : (
                isLogin ? "Sign In" : "Create Account"
              )}
            </button>
          </form>

          {/* Google sign-in */}
          <div style={{ marginTop: "16px", display: "flex", justifyContent: "center" }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google sign-in failed.")}
              width="370"
              shape="pill"
              theme="filled_black"
              size="large"
              text="signin_with"
              logo_alignment="left"
              useOneTap={false}
            />
          </div>

          {/* Toggle login / register */}
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button
              onClick={() => { setIsLogin(!isLogin); setError(""); setSuccess(""); }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: "13px", color: C.accent, letterSpacing: "-0.01em",
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
