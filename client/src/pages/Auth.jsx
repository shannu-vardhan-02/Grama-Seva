import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Eye, EyeOff, Mail, User, Phone,
  MapPin, Briefcase, FileText, CheckCircle2,
  ArrowRight, Shield, Star, Users,
} from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import ImageUpload from "../components/ImageUpload";


/* ─── Lightweight spinner — replaces the broken thinking-orbs library ── */
function Spinner({ size = 20, color = "#ffffff" }) {
  return (
    <span style={{
      display: "inline-block",
      width: size,
      height: size,
      borderRadius: "50%",
      border: `2.5px solid ${color}40`,
      borderTopColor: color,
      animation: "auth-spin 0.7s linear infinite",
      flexShrink: 0,
    }} />
  );
}

const C = {
  /* surfaces */
  dark:      "#0f0e0d",
  panelBg:   "rgba(15,14,13,0.0)",  /* transparent — sits on gradient */
  inputBg:   "rgba(255,255,255,0.06)",
  inputBdr:  "rgba(255,255,255,0.12)",
  inputFoc:  "#cc785c",             /* brand coral */
  /* text */
  textPri:   "#faf9f5",
  textMut:   "#a09d96",
  textSub:   "#8e8b82",
  /* accent — brand coral, NOT blue */
  accent:    "#cc785c",
  accentHov: "#b5604a",
  accentLight: "rgba(204,120,92,0.15)",
  /* secondary button */
  btnSec:    "rgba(255,255,255,0.06)",
  btnSecBdr: "rgba(255,255,255,0.12)",
  btnSecHov: "rgba(255,255,255,0.10)",
  /* worker section */
  workerBg:  "rgba(255,255,255,0.04)",
  workerBdr:  "rgba(255,255,255,0.10)",
  /* banners */
  errorBg:   "rgba(198,69,69,0.12)",
  errorBdr:  "rgba(198,69,69,0.30)",
  errorTxt:  "#f87171",
  okBg:      "rgba(93,184,166,0.12)",
  okBdr:     "rgba(93,184,166,0.30)",
  okTxt:     "#5db8a6",
};

/* ─── Trust stats shown on left ────────────────────────────── */
const STATS = [
  { value: "2,400+", label: "Verified workers" },
  { value: "18K+",   label: "Jobs completed" },
  { value: "4.8★",   label: "Avg. rating" },
];

/* ─── Feature bullets shown on register ────────────────────── */
const FEATURES = [
  "Skill-verified worker profiles",
  "Community-driven ratings & reviews",
  "Admin-approved secure onboarding",
];

/* ─── Reusable labelled input ───────────────────────────────── */
function Field({ label, type = "text", value, onChange, placeholder, required, icon: Icon, min, rows, autoComplete }) {
  const [focused, setFocused] = useState(false);
  const isTextarea = type === "textarea";

  const sharedStyle = {
    width: "100%",
    padding: isTextarea ? "12px 16px" : "13px 16px",
    paddingRight: Icon ? "44px" : "16px",
    background: C.inputBg,
    color: C.textPri,
    border: `1px solid ${focused ? C.inputFoc : C.inputBdr}`,
    borderRadius: "10px",
    fontSize: "14px",
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    transition: "border-color 0.18s, box-shadow 0.18s",
    boxSizing: "border-box",
    caretColor: C.accent,
    boxShadow: focused ? `0 0 0 3px rgba(204,120,92,0.18)` : "none",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    resize: isTextarea ? "none" : undefined,
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{
        display: "block",
        fontSize: "10.5px",
        fontWeight: 600,
        color: focused ? C.accent : C.textSub,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        marginBottom: "6px",
        transition: "color 0.18s",
      }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        {isTextarea
          ? <textarea
              value={value}
              onChange={onChange}
              rows={rows || 2}
              placeholder={placeholder}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={sharedStyle}
            />
          : <input
              type={type}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              required={required}
              min={min}
              autoComplete={autoComplete}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={sharedStyle}
            />
        }
        {Icon && (
          <div style={{
            position: "absolute",
            right: "14px",
            top: isTextarea ? "14px" : "50%",
            transform: isTextarea ? "none" : "translateY(-50%)",
            color: focused ? C.accent : C.textMut,
            display: "flex",
            alignItems: "center",
            pointerEvents: "none",
            transition: "color 0.18s",
          }}>
            <Icon size={15} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Role toggle pill ──────────────────────────────────────── */
function RolePill({ active, onClick, emoji, label, desc }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        padding: "14px 16px",
        background: active ? C.accentLight : C.btnSec,
        color: active ? C.accent : C.textSub,
        border: active ? `1.5px solid ${C.accent}` : `1px solid ${C.btnSecBdr}`,
        borderRadius: "12px",
        fontSize: "13.5px",
        fontWeight: active ? 600 : 400,
        cursor: "pointer",
        transition: "all 0.2s",
        fontFamily: "'Inter', sans-serif",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        textAlign: "left",
        lineHeight: 1,
      }}
    >
      <div style={{ fontSize: "20px", marginBottom: "6px" }}>{emoji}</div>
      <div style={{ fontWeight: 600, fontSize: "13px", marginBottom: "2px" }}>{label}</div>
      <div style={{ fontSize: "11px", color: active ? C.accent : C.textMut, opacity: 0.85 }}>{desc}</div>
    </button>
  );
}

/* ─── Auth page ─────────────────────────────────────────────── */
export default function Auth() {
  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  /* UI state */
  const [isLogin, setIsLogin]   = useState(true);
  const [showPwd, setShowPwd]   = useState(false);
  const [pwdFocused, setPwdFocused] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  /* Form fields */
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        // Navigate immediately to primary Search Workers home
        navigate("/book-service", { replace: true });
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
        // Navigate immediately to primary Search Workers home
        navigate("/book-service", { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Authentication failed."
      );
    } finally { setLoading(false); }
  };

  /* Bug fix: proper loading state + error handling for Google OAuth */
  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setGoogleLoading(true);
    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate("/book-service", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Google sign-in failed. Please try again."
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setSuccess("");
  };

  const isAnyLoading = loading || googleLoading;

  /* ─────────────────────────── RENDER ─────────────────────────── */
  return (
    <>
      {/* Inject scrollbar-hiding CSS (Windows needs webkit prefix) */}
      <style>{`
        .auth-panel::-webkit-scrollbar { display: none; }
        .auth-panel { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes subtleFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
          50% { transform: translateY(-12px) rotate(3deg); opacity: 0.8; }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes auth-spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .auth-split-right { display: none !important; }
          .auth-panel { width: 100% !important; }
          .auth-inner { padding: 0 24px !important; }
        }
        .google-btn-wrapper > div { width: 100% !important; }
        .google-btn-wrapper > div > div { width: 100% !important; }
        .google-btn-wrapper iframe { width: 100% !important; }
      `}</style>

      <div style={{
        position: "relative",
        height: "100vh",
        overflow: "hidden",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        background: C.dark,
      }}>

        {/* ── Animated background orbs ── */}
        <div style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          zIndex: 0,
          pointerEvents: "none",
        }}>
          {/* Right side hero image */}
          <div style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: "58%",
            height: "100%",
            backgroundImage: "url('https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1400&q=85&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }} />
          {/* Gradient overlay on image */}
          <div style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: "58%",
            height: "100%",
            background: "linear-gradient(to right, #0f0e0d 0%, rgba(15,14,13,0.85) 30%, rgba(15,14,13,0.3) 100%)",
          }} />
          {/* Ambient glow — coral on bottom left */}
          <div style={{
            position: "absolute",
            bottom: "-80px",
            left: "5%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(204,120,92,0.12) 0%, transparent 70%)",
            filter: "blur(40px)",
          }} />
          {/* Ambient glow — subtle warm on top */}
          <div style={{
            position: "absolute",
            top: "-100px",
            left: "20%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(232,165,90,0.07) 0%, transparent 70%)",
            filter: "blur(60px)",
          }} />
        </div>

        {/* ══════════════ FORM PANEL ══════════════ */}
        <div
          className="auth-panel"
          style={{
            position: "relative",
            zIndex: 2,
            width: "min(50%, 640px)",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
        >
          {/* Subtle left panel frosted background */}
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to right, rgba(15,14,13,0.98) 0%, rgba(15,14,13,0.96) 80%, rgba(15,14,13,0.8) 100%)",
            borderRight: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            zIndex: -1,
          }} />

          {/* Inner padding wrapper */}
          <div
            className="auth-inner"
            style={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100%",
              padding: "0 56px 0 56px",
            }}
          >

            {/* ── Brand header ── */}
            <div style={{
              paddingTop: "40px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexShrink: 0,
            }}>
              <div style={{
                width: "34px",
                height: "34px",
                background: C.accent,
                borderRadius: "9px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 20px rgba(204,120,92,0.35)",
                flexShrink: 0,
              }}>
                <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path d="M3 21V7l9-4 9 4v14" />
                  <path d="M9 21v-6h6v6" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: C.textPri, letterSpacing: "-0.02em" }}>
                  Grama Seva
                </div>
                <div style={{ fontSize: "10.5px", color: C.textMut, marginTop: "1px" }}>
                  Rural Service Portal
                </div>
              </div>
            </div>

            {/* ── Main content — grows to fill, centers vertically ── */}
            <div style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              paddingTop: "28px",
              paddingBottom: "28px",
            }}>

              {/* Eyebrow */}
              <div style={{
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: C.accent,
                marginBottom: "10px",
              }}>
                {isLogin ? "Welcome back" : "Start for free"}
              </div>

              {/* Headline — Playfair Display to match rest of app */}
              <h1 style={{
                fontSize: "clamp(34px, 3.5vw, 48px)",
                fontWeight: 700,
                fontFamily: "'Playfair Display', Georgia, serif",
                color: C.textPri,
                lineHeight: 1.08,
                letterSpacing: "-0.02em",
                marginBottom: "12px",
              }}>
                {isLogin ? "Sign in" : "Create account"}
                <span style={{ color: C.accent }}>.</span>
              </h1>

              {/* Tagline (register only) */}
              {!isLogin && (
                <p style={{
                  fontSize: "14.5px",
                  color: C.textMut,
                  lineHeight: 1.6,
                  marginBottom: "16px",
                  maxWidth: "400px",
                }}>
                  Join the Grama Seva network — connecting rural communities
                  with trusted, verified local talent.
                </p>
              )}

              {/* Feature bullets — register only */}
              {!isLogin && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
                  {FEATURES.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                      <CheckCircle2 size={14} color={C.accent} style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: "13px", color: C.textSub }}>{f}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Switch mode link */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13.5px",
                color: C.textMut,
                marginBottom: isLogin ? "28px" : "20px",
              }}>
                <span>{isLogin ? "Don't have an account?" : "Already a member?"}</span>
                <button onClick={switchMode} style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: C.accent, fontSize: "13.5px", fontWeight: 600,
                  padding: 0, fontFamily: "'Inter', sans-serif",
                  textDecoration: "underline", textDecorationColor: "rgba(204,120,92,0.4)",
                }}>
                  {isLogin ? "Sign Up" : "Log In"}
                </button>
              </div>

              {/* Banners */}
              {error && (
                <div style={{
                  padding: "12px 15px",
                  background: C.errorBg,
                  border: `1px solid ${C.errorBdr}`,
                  borderRadius: "10px",
                  fontSize: "13px",
                  color: C.errorTxt,
                  marginBottom: "18px",
                  backdropFilter: "blur(8px)",
                  lineHeight: 1.5,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                }}>
                  <span style={{ flexShrink: 0, marginTop: "1px" }}>⚠</span>
                  {error}
                </div>
              )}
              {success && (
                <div style={{
                  padding: "12px 15px",
                  background: C.okBg,
                  border: `1px solid ${C.okBdr}`,
                  borderRadius: "10px",
                  fontSize: "13px",
                  color: C.okTxt,
                  marginBottom: "18px",
                  backdropFilter: "blur(8px)",
                  lineHeight: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}>
                  <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
                  {success}
                </div>
              )}

              {/* ── Google OAuth — Primary CTA ── */}
              {googleLoading ? (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  padding: "14px",
                  background: C.btnSec,
                  border: `1px solid ${C.btnSecBdr}`,
                  borderRadius: "10px",
                  marginBottom: "18px",
                  color: C.textMut,
                  fontSize: "14px",
                }}>
                  <Spinner size={20} color={C.textMut} />
                  <span>Signing in with Google…</span>
                </div>
              ) : (
                <div
                  className="google-btn-wrapper"
                  style={{
                    marginBottom: "18px",
                    display: "flex",
                    justifyContent: "stretch",
                  }}
                >
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError("Google sign-in failed. Please try again.")}
                    shape="rectangular"
                    theme="filled_black"
                    size="large"
                    text={isLogin ? "signin_with" : "signup_with"}
                    logo_alignment="left"
                    useOneTap={false}
                    width="528"
                  />
                </div>
              )}

              {/* ── Divider ── */}
              <div style={{
                display: "flex", alignItems: "center", gap: "14px", marginBottom: "18px",
              }}>
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
                <span style={{ fontSize: "12px", color: C.textMut, letterSpacing: "0.04em" }}>or continue with email</span>
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
              </div>

              {/* ── Form ── */}
              <form onSubmit={handleSubmit}>

                {/* Register: Name + Phone side-by-side */}
                {!isLogin && (
                  <div style={{ display: "flex", gap: "12px" }}>
                    <div style={{ flex: 1 }}>
                      <Field label="Full Name" value={name} onChange={(e) => setName(e.target.value)}
                        placeholder="Ramesh Kumar" required icon={User} autoComplete="name" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <Field label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                        placeholder="10-digit number" required icon={Phone} autoComplete="tel" />
                    </div>
                  </div>
                )}

                {/* Email */}
                <Field label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com" required icon={Mail} autoComplete="email" />

                {/* Password */}
                <div style={{ marginBottom: "16px" }}>
                  <label style={{
                    display: "block",
                    fontSize: "10.5px",
                    fontWeight: 600,
                    color: pwdFocused ? C.accent : C.textSub,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                    transition: "color 0.18s",
                  }}>
                    Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPwd ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isLogin ? "Enter your password" : "Min. 8 chars · 1 uppercase · 1 number"}
                      required
                      autoComplete={isLogin ? "current-password" : "new-password"}
                      onFocus={() => setPwdFocused(true)}
                      onBlur={() => setPwdFocused(false)}
                      style={{
                        width: "100%",
                        padding: "13px 44px 13px 16px",
                        background: C.inputBg,
                        color: C.textPri,
                        border: `1px solid ${pwdFocused ? C.inputFoc : C.inputBdr}`,
                        borderRadius: "10px",
                        fontSize: "14px",
                        fontFamily: "'Inter', sans-serif",
                        outline: "none",
                        boxSizing: "border-box",
                        caretColor: C.accent,
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        boxShadow: pwdFocused ? "0 0 0 3px rgba(204,120,92,0.18)" : "none",
                        transition: "border-color 0.18s, box-shadow 0.18s",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      style={{
                        position: "absolute", right: "14px", top: "50%",
                        transform: "translateY(-50%)",
                        background: "none", border: "none", cursor: "pointer",
                        color: C.textMut, display: "flex", alignItems: "center", padding: 0,
                        transition: "color 0.15s",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = C.textPri}
                      onMouseLeave={(e) => e.currentTarget.style.color = C.textMut}
                    >
                      {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Register: Role selector */}
                {!isLogin && (
                  <div style={{ marginBottom: "18px" }}>
                    <label style={{
                      display: "block", fontSize: "10.5px", fontWeight: 600,
                      color: C.textSub, letterSpacing: "0.08em",
                      textTransform: "uppercase", marginBottom: "10px",
                    }}>
                      I want to…
                    </label>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <RolePill
                        active={role === "Customer"}
                        onClick={() => setRole("Customer")}
                        emoji="🏠"
                        label="Hire a Worker"
                        desc="Book local services"
                      />
                      <RolePill
                        active={role === "Worker"}
                        onClick={() => setRole("Worker")}
                        emoji="🔧"
                        label="Offer Services"
                        desc="Get hired for work"
                      />
                    </div>

                    {/* Worker expanded fields */}
                    {role === "Worker" && (
                      <div style={{
                        padding: "20px 20px",
                        background: C.workerBg,
                        border: `1px solid ${C.workerBdr}`,
                        borderRadius: "14px",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        marginTop: "12px",
                      }}>
                        <div style={{
                          fontSize: "10.5px", fontWeight: 700,
                          color: C.accent, marginBottom: "14px",
                          textTransform: "uppercase", letterSpacing: "0.09em",
                          display: "flex", alignItems: "center", gap: "6px",
                        }}>
                          <Shield size={12} />
                          Worker Profile Details
                        </div>

                        {/* Skills grid */}
                        <div style={{ marginBottom: "16px" }}>
                          <label style={{
                            display: "block", fontSize: "10.5px", fontWeight: 600,
                            color: C.textSub, letterSpacing: "0.08em",
                            textTransform: "uppercase", marginBottom: "10px",
                          }}>
                            Skills (select all that apply)
                          </label>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "6px" }}>
                            {[
                              { id: "electrician", label: "Electrician" },
                              { id: "mason",       label: "Mason" },
                              { id: "plumber",     label: "Plumber" },
                              { id: "carpenter",   label: "Carpenter" },
                              { id: "mechanic",    label: "Mechanic" },
                              { id: "painter",     label: "Painter" },
                              { id: "cleaning",    label: "Cleaning" },
                              { id: "other",       label: "Gen. Labour" },
                            ].map((s) => (
                              <label key={s.id} style={{
                                display: "flex", alignItems: "center", gap: "5px",
                                fontSize: "12px", color: skills.includes(s.id) ? C.accent : C.textSub,
                                cursor: "pointer",
                                padding: "7px 8px",
                                background: skills.includes(s.id) ? C.accentLight : "rgba(255,255,255,0.03)",
                                borderRadius: "7px",
                                border: `1px solid ${skills.includes(s.id) ? "rgba(204,120,92,0.35)" : "transparent"}`,
                                transition: "all 0.15s",
                                fontWeight: skills.includes(s.id) ? 600 : 400,
                              }}>
                                <input
                                  type="checkbox"
                                  checked={skills.includes(s.id)}
                                  onChange={(ev) => {
                                    if (ev.target.checked) setSkills([...skills, s.id]);
                                    else setSkills(skills.filter((sk) => sk !== s.id));
                                  }}
                                  style={{ accentColor: C.accent, flexShrink: 0, width: "12px", height: "12px" }}
                                />
                                {s.label}
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Experience & Location */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "2px" }}>
                          <Field label="Experience (Yrs)" type="number" value={experience}
                            onChange={(e) => setExperience(e.target.value)} placeholder="e.g. 5" min="0" required icon={Briefcase} />
                          <Field label="Village / Service Area" value={address}
                            onChange={(e) => setAddress(e.target.value)} placeholder="Shamshabad Ward 3" required icon={MapPin} />
                        </div>

                        {/* Bio */}
                        <Field label="Bio / Work Description" type="textarea" value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Describe your expertise and availability..." icon={FileText} />

                        {/* Proof upload */}
                        <div>
                          <ImageUpload
                            mode="multiple" endpoint="proof" label="Proof-of-Work Photos"
                            value={proofUrls} onChange={setProofUrls} maxFiles={3}
                          />
                          <div style={{ fontSize: "11px", color: C.textMut, marginTop: "6px", fontStyle: "italic" }}>
                            Upload 1–3 work photos. Reviewed by administrator before approval.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Primary CTA ── */}
                <button
                  type="submit"
                  disabled={isAnyLoading}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "14px 28px",
                    background: isAnyLoading
                      ? "rgba(204,120,92,0.5)"
                      : `linear-gradient(135deg, ${C.accent} 0%, ${C.accentHov} 100%)`,
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "14.5px",
                    fontWeight: 600,
                    letterSpacing: "0.01em",
                    cursor: isAnyLoading ? "not-allowed" : "pointer",
                    fontFamily: "'Inter', sans-serif",
                    opacity: isAnyLoading ? 0.75 : 1,
                    transition: "all 0.18s",
                    boxShadow: isAnyLoading ? "none" : "0 4px 20px rgba(204,120,92,0.30)",
                  }}
                  onMouseEnter={(e) => !isAnyLoading && (e.currentTarget.style.boxShadow = "0 6px 28px rgba(204,120,92,0.45)")}
                  onMouseLeave={(e) => !isAnyLoading && (e.currentTarget.style.boxShadow = "0 4px 20px rgba(204,120,92,0.30)")}
                  onMouseDown={(e) => !isAnyLoading && (e.currentTarget.style.transform = "scale(0.98)")}
                  onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  {loading
                    ? <Spinner size={18} color="#ffffff" />
                    : (
                      <>
                        {isLogin ? "Sign In" : "Create Account"}
                        <ArrowRight size={16} style={{ transition: "transform 0.15s" }} />
                      </>
                    )
                  }
                </button>

              </form>

            </div>{/* end flex-1 main content */}

            {/* ── Footer ── */}
            <div style={{
              paddingBottom: "28px",
              paddingTop: "18px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <span style={{ fontSize: "11.5px", color: C.textMut }}>
                © 2026 Grama Seva Rural Network
              </span>
              <span style={{ fontSize: "11.5px", color: C.textMut }}>
                All rights reserved
              </span>
            </div>

          </div>{/* end inner padding wrapper */}
        </div>{/* end form panel */}

        {/* ══════════════ RIGHT INFO PANEL ══════════════ */}
        <div
          className="auth-split-right"
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: "50%",
            height: "100%",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "48px 52px",
            pointerEvents: "none",
          }}
        >
          {/* Stats row */}
          <div style={{
            display: "flex",
            gap: "32px",
            marginBottom: "32px",
          }}>
            {STATS.map((stat) => (
              <div key={stat.label}>
                <div style={{
                  fontSize: "22px",
                  fontWeight: 800,
                  color: "#faf9f5",
                  letterSpacing: "-0.03em",
                  fontFamily: "'Inter', sans-serif",
                  lineHeight: 1,
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: "12px",
                  color: "rgba(250,249,245,0.55)",
                  marginTop: "4px",
                  fontWeight: 400,
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Quote */}
          <div style={{
            background: "rgba(15,14,13,0.6)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: "16px",
            padding: "24px 28px",
            border: "1px solid rgba(255,255,255,0.08)",
            maxWidth: "380px",
          }}>
            <div style={{
              display: "flex",
              gap: "3px",
              marginBottom: "12px",
            }}>
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={13} fill="#cc785c" color="#cc785c" />
              ))}
            </div>
            <p style={{
              fontSize: "14.5px",
              color: "rgba(250,249,245,0.90)",
              lineHeight: 1.65,
              fontStyle: "italic",
              fontFamily: "'Playfair Display', Georgia, serif",
              marginBottom: "16px",
            }}>
              "Grama Seva connected me with a skilled electrician within 2 hours. The verification process gave me real confidence."
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #cc785c, #e8a55a)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: 700,
                color: "#fff",
                flexShrink: 0,
              }}>
                PL
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#faf9f5" }}>Priya Lakshmi</div>
                <div style={{ fontSize: "11.5px", color: "rgba(250,249,245,0.5)" }}>Shamshabad, Telangana</div>
              </div>
            </div>
          </div>

          {/* GS watermark */}
          <div style={{
            position: "absolute",
            top: "36px",
            right: "40px",
            display: "flex",
            alignItems: "center",
            gap: "7px",
            opacity: 0.55,
          }}>
            <svg width="18" height="18" fill="none" stroke="#faf9f5" strokeWidth="2.2" viewBox="0 0 24 24">
              <path d="M3 21V7l9-4 9 4v14" />
              <path d="M9 21v-6h6v6" />
            </svg>
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "15px",
              fontWeight: 700,
              color: "#faf9f5",
              letterSpacing: "0.06em",
            }}>GS</span>
          </div>
        </div>

      </div>
    </>
  );
}
