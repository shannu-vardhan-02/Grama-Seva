import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Eye, EyeOff, Mail, User, Phone,
  MapPin, Briefcase, FileText, CheckCircle2,
  ArrowRight, Shield, Star, Users, Sun, Moon,
} from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { useTheme } from "../context/ThemeContext";
import ImageUpload from "../components/ImageUpload";
import GramaSevaLogo from "../components/GramaSevaLogo";

function Spinner({ size = 20, color = "#17171c" }) {
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

const STATS = [
  { value: "2,400+", label: "Verified workers" },
  { value: "18K+",   label: "Jobs completed" },
  { value: "4.8★",   label: "Avg. rating" },
];

const FEATURES = [
  "Skill-verified worker profiles",
  "Community-driven ratings & reviews",
  "Admin-approved secure onboarding",
];

function Field({ label, type = "text", value, onChange, placeholder, required, icon: Icon, min, rows, autoComplete }) {
  const { isDark } = useTheme();
  const [focused, setFocused] = useState(false);
  const isTextarea = type === "textarea";

  const sharedStyle = {
    width: "100%",
    padding: "10px 14px",
    paddingRight: Icon ? "40px" : "14px",
    background: isDark ? "var(--ch-input-bg)" : "#ffffff",
    color: isDark ? "#f1f2f6" : "#212121",
    border: `1px solid ${focused ? (isDark ? "#60a5fa" : "#1863dc") : (isDark ? "var(--ch-hairline)" : "#d9d9dd")}`,
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    transition: "all 0.2s",
    boxSizing: "border-box",
    boxShadow: focused ? (isDark ? "0 0 0 3px rgba(96,165,250,0.2)" : "0 0 0 3px rgba(24,99,220,0.15)") : "none",
    resize: isTextarea ? "none" : undefined,
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{
        display: "block",
        fontSize: "10px",
        fontWeight: 600,
        color: isDark ? "#9ca3af" : "#75758a",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        marginBottom: "6px",
        fontFamily: "'JetBrains Mono', monospace",
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
            right: "12px",
            top: isTextarea ? "12px" : "50%",
            transform: isTextarea ? "none" : "translateY(-50%)",
            color: focused ? (isDark ? "#60a5fa" : "#1863dc") : (isDark ? "#9ca3af" : "#93939f"),
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
          }}>
            <Icon size={16} />
          </div>
        )}
      </div>
    </div>
  );
}

function RolePill({ active, onClick, emoji, label, desc }) {
  const { isDark } = useTheme();
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        padding: "12px 14px",
        background: active
          ? (isDark ? "rgba(52,211,153,0.15)" : "rgba(0,60,51,0.07)")
          : (isDark ? "var(--ch-card-bg)" : "#ffffff"),
        border: active
          ? `1.5px solid ${isDark ? "#34d399" : "#003c33"}`
          : `1px solid ${isDark ? "var(--ch-hairline)" : "#d9d9dd"}`,
        borderRadius: "8px",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.2s",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ fontSize: "18px", marginBottom: "4px" }}>{emoji}</div>
      <div style={{ fontWeight: 600, fontSize: "13px", color: active ? (isDark ? "#34d399" : "#003c33") : (isDark ? "#f1f2f6" : "#212121"), marginBottom: "2px" }}>
        {label}
      </div>
      <div style={{ fontSize: "11px", color: active ? (isDark ? "#a7f3d0" : "#003c33") : (isDark ? "#9ca3af" : "#75758a") }}>
        {desc}
      </div>
    </button>
  );
}

export default function Auth() {
  const { login, register, loginWithGoogle } = useAuth();
  const { isDark, toggleTheme } = useTheme();
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

  const isAnyLoading = loading || googleLoading;

  return (
    <>
      <style>{`
        .auth-container { display: flex; height: 100vh; overflow: hidden; font-family: 'Inter', sans-serif; }
        .auth-left { width: 45%; background-color: #003c33; padding: 48px; display: flex; flex-direction: column; justify-content: space-between; position: relative; overflow: hidden; }
        .auth-right { width: 55%; background-color: ${isDark ? "var(--ch-canvas)" : "#ffffff"}; display: flex; flex-direction: column; overflow-y: auto; transition: background-color 0.3s ease; }
        .auth-mobile-header { display: none; padding: 14px 20px; border-bottom: 1px solid ${isDark ? "var(--ch-hairline)" : "#d9d9dd"}; background: ${isDark ? "var(--ch-canvas)" : "#ffffff"}; }
        @keyframes auth-spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .auth-left { display: none; }
          .auth-right { width: 100%; }
          .auth-mobile-header { display: flex; align-items: center; justify-content: space-between; }
          .mobile-hide-logo { display: none !important; }
        }
        .google-btn-wrapper > div { width: 100% !important; }
        .google-btn-wrapper iframe { width: 100% !important; }
        .tab-btn { flex: 1; padding: 12px; text-align: center; font-size: 15px; font-weight: 500; cursor: pointer; transition: all 0.2s; border-bottom: 2px solid transparent; color: ${isDark ? "#9ca3af" : "#75758a"}; }
        .tab-btn.active { color: ${isDark ? "#34d399" : "#003c33"}; border-bottom-color: ${isDark ? "#34d399" : "#003c33"}; font-weight: 600; }
        
        .worker-card {
           background: rgba(255,255,255,0.06);
           border: 1px solid rgba(255,255,255,0.1);
           border-radius: 8px;
           padding: 12px;
           display: flex;
           align-items: center;
           gap: 12px;
        }
        .worker-avatar {
           width: 32px; height: 32px; border-radius: 50%;
           background: #4ade80; color: #003c33; display: flex; align-items: center; justify-content: center;
           font-weight: 600; font-size: 12px;
        }
      `}</style>

      <div className="auth-container">
        {/* LEFT PANEL */}
        <div className="auth-left">
          {/* Decorative shapes */}
          <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,222,128,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }} />
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <img src="/grama-seva-logo.jpg" alt="Logo" style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover' }} />
              <div style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: '32px', fontWeight: 600, color: '#ffffff', letterSpacing: '-0.03em' }}>
                Grama Seva
              </div>
            </div>
            <div style={{ fontSize: '18px', color: 'rgba(255,255,255,0.75)', maxWidth: '80%' }}>
              Verified Village Workers. Direct Contact.
            </div>

            <div style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {FEATURES.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CheckCircle2 size={16} color="#4ade80" />
                  <span style={{ color: '#ffffff', fontSize: '15px' }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            {/* Worker Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '40px', opacity: 0.8 }}>
              <div className="worker-card">
                <div className="worker-avatar">RK</div>
                <div>
                  <div style={{ color: '#fff', fontSize: '13px', fontWeight: 500 }}>Ramesh Kumar</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>Electrician • 4.9★</div>
                </div>
              </div>
              <div className="worker-card" style={{ transform: 'translateY(16px)' }}>
                <div className="worker-avatar" style={{ background: '#ff7759', color: '#fff' }}>SL</div>
                <div>
                  <div style={{ color: '#fff', fontSize: '13px', fontWeight: 500 }}>Sujatha L.</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>Tailoring • 4.8★</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '32px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '32px' }}>
              {STATS.map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', fontFamily: "'Space Grotesk', sans-serif" }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="auth-right">
          {/* Mobile Header */}
          <div className="auth-mobile-header">
            <GramaSevaLogo size={32} showText={true} />
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: `1px solid ${isDark ? "var(--ch-hairline)" : "#e5e7eb"}`,
                background: isDark ? "var(--ch-surface-subtle)" : "#f3f4f6",
                color: isDark ? "#fbbf24" : "#4b5563",
                cursor: "pointer",
              }}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>

          {/* Desktop Theme Toggle Bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 24px 0', width: '100%', boxSizing: 'border-box' }} className="mobile-hide-logo">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "9999px",
                border: `1px solid ${isDark ? "var(--ch-hairline)" : "#e5e7eb"}`,
                background: isDark ? "var(--ch-card-bg)" : "#f9fafb",
                color: isDark ? "#fbbf24" : "#4b5563",
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
              <span style={{ color: isDark ? "#e5e7eb" : "#4b5563" }}>{isDark ? "Light Mode" : "Dark Mode"}</span>
            </button>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 24px 40px' }}>
            <div style={{ width: '100%', maxWidth: '440px' }}>
              
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'inline-flex', marginBottom: '16px' }} className="mobile-hide-logo">
                   <GramaSevaLogo size={40} showText={false} />
                </div>
                <h1 style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: '28px', fontWeight: 600, color: isDark ? "#f1f2f6" : "#17171c", letterSpacing: '-0.02em', margin: 0 }}>
                  {isLogin ? "Sign in to Grama Seva" : "Create an account"}
                </h1>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', borderBottom: `1px solid ${isDark ? "var(--ch-hairline)" : "#d9d9dd"}`, marginBottom: '24px' }}>
                <div className={"tab-btn " + (isLogin ? 'active' : '')} onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}>
                  Log In
                </div>
                <div className={"tab-btn " + (!isLogin ? 'active' : '')} onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}>
                  Register
                </div>
              </div>

              {/* Banners */}
              {error && (
                <div style={{ padding: '12px 16px', background: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fff0f0', border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.3)' : '#ffcdd2'}`, borderRadius: '8px', color: isDark ? '#f87171' : '#b30000', fontSize: '13px', marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ marginTop: '2px' }}>⚠</span>
                  <div>{error}</div>
                </div>
              )}
              {success && (
                <div style={{ padding: '12px 16px', background: isDark ? 'rgba(52, 211, 153, 0.15)' : '#f0fdf4', border: `1px solid ${isDark ? 'rgba(52, 211, 153, 0.3)' : '#bbf7d0'}`, borderRadius: '8px', color: isDark ? '#34d399' : '#166534', fontSize: '13px', marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <CheckCircle2 size={16} />
                  <div>{success}</div>
                </div>
              )}

              {/* Google Auth */}
              <div style={{ marginBottom: '24px' }}>
                {googleLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '12px', border: `1px solid ${isDark ? "var(--ch-hairline)" : "#d9d9dd"}`, borderRadius: '32px' }}>
                    <Spinner size={20} color={isDark ? "#34d399" : "#17171c"} />
                  </div>
                ) : (
                  <div className="google-btn-wrapper">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => setError("Google sign-in failed.")}
                      shape="pill"
                      theme={isDark ? "filled_black" : "outline"}
                      size="large"
                      text={isLogin ? "signin_with" : "signup_with"}
                      width="440"
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div style={{ flex: 1, height: '1px', background: isDark ? 'var(--ch-hairline)' : '#d9d9dd' }} />
                <div style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#93939f', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or</div>
                <div style={{ flex: 1, height: '1px', background: isDark ? 'var(--ch-hairline)' : '#d9d9dd' }} />
              </div>

              <form onSubmit={handleSubmit}>
                {!isLogin && (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <Field label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ramesh Kumar" required icon={User} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <Field label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit number" required icon={Phone} />
                    </div>
                  </div>
                )}

                <Field label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required icon={Mail} />

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: isDark ? '#9ca3af' : '#75758a', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px', fontFamily: "'JetBrains Mono', monospace" }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPwd ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isLogin ? "Enter your password" : "Min. 8 characters"}
                      required
                      onFocus={() => setPwdFocused(true)}
                      onBlur={() => setPwdFocused(false)}
                      style={{
                        width: '100%',
                        padding: '10px 40px 10px 14px',
                        background: isDark ? 'var(--ch-input-bg)' : '#ffffff',
                        color: isDark ? '#f1f2f6' : '#212121',
                        border: `1px solid ${pwdFocused ? (isDark ? '#60a5fa' : '#1863dc') : (isDark ? 'var(--ch-hairline)' : '#d9d9dd')}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'all 0.2s',
                        boxSizing: 'border-box',
                        boxShadow: pwdFocused ? (isDark ? '0 0 0 3px rgba(96,165,250,0.2)' : '0 0 0 3px rgba(24,99,220,0.15)') : 'none',
                      }}
                    />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: isDark ? '#9ca3af' : '#93939f', display: 'flex', padding: 0 }}>
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: isDark ? '#9ca3af' : '#75758a', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px', fontFamily: "'JetBrains Mono', monospace" }}>
                      I want to...
                    </label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <RolePill active={role === "Customer"} onClick={() => setRole("Customer")} emoji="🏠" label="Hire a Worker" desc="Book local services" />
                      <RolePill active={role === "Worker"} onClick={() => setRole("Worker")} emoji="🔧" label="Offer Services" desc="Get hired for work" />
                    </div>

                    {role === "Worker" && (
                      <div style={{ marginTop: '16px', padding: '16px', background: isDark ? 'var(--ch-surface-subtle)' : '#f1f5ff', border: `1px solid ${isDark ? 'var(--ch-hairline)' : '#d9d9dd'}`, borderRadius: '12px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#60a5fa' : '#1863dc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Shield size={14} /> Worker Profile Details
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                          <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: isDark ? '#9ca3af' : '#75758a', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px', fontFamily: "'JetBrains Mono', monospace" }}>
                            Skills (select all that apply)
                          </label>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
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
                              <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: isDark ? '#e5e7eb' : '#212121', cursor: 'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={skills.includes(s.id)}
                                  onChange={(ev) => {
                                    if (ev.target.checked) setSkills([...skills, s.id]);
                                    else setSkills(skills.filter((sk) => sk !== s.id));
                                  }}
                                  style={{ accentColor: isDark ? '#34d399' : '#1863dc', width: '14px', height: '14px' }}
                                />
                                {s.label}
                              </label>
                            ))}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                          <div style={{ flex: 1 }}><Field label="Experience (Yrs)" type="number" value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="e.g. 5" min="0" required icon={Briefcase} /></div>
                          <div style={{ flex: 1 }}><Field label="Service Area" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Shamshabad" required icon={MapPin} /></div>
                        </div>

                        <Field label="Bio / Description" type="textarea" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Describe your expertise..." icon={FileText} />

                        <div>
                          <ImageUpload mode="multiple" endpoint="proof" label="Proof-of-Work Photos" value={proofUrls} onChange={setProofUrls} maxFiles={3} />
                          <div style={{ fontSize: '11px', color: isDark ? '#9ca3af' : '#75758a', marginTop: '6px' }}>Upload 1-3 work photos.</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isAnyLoading}
                  style={{
                    width: '100%',
                    padding: '12px 24px',
                    background: isAnyLoading
                      ? (isDark ? '#374151' : '#93939f')
                      : (isDark ? '#34d399' : '#17171c'),
                    color: isDark ? '#0d0e12' : '#ffffff',
                    border: 'none',
                    borderRadius: '32px',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: isAnyLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'background 0.2s',
                  }}
                >
                  {loading ? <Spinner size={20} color={isDark ? "#0d0e12" : "#ffffff"} /> : (
                    <>
                      {isLogin ? "Sign In" : "Create Account"}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
