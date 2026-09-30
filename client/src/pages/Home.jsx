import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  ArrowRight,
  X,
  Menu,
  Zap,
  Layers,
  Droplets,
  Hammer,
  Settings,
  Paintbrush,
  Home as HomeIcon,
  Users,
  ClipboardList,
  ShieldCheck,
  PhoneCall,
  FileText,
  Sun,
  Moon,
} from "lucide-react";
import logoImg from "../assets/grama-seva-logo.jpg";

// -- Animated Verified SVG · cycles through 60 exported frames --
const FRAME_COUNT = 60;
const FRAME_INTERVAL_MS = 60; // ~16fps
const VerifiedAnimatedSVG = ({ isDark }) => {
  const [frame, setFrame] = useState(1);
  useEffect(() => {
    const id = setInterval(() => {
      setFrame((f) => (f >= FRAME_COUNT ? 1 : f + 1));
    }, FRAME_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);
  const uuid = "d9181743-b835-4310-81fd-66a571f6cd53";
  const src = `/verified_animated_svg/${uuid}-${frame}.svg`;
  return (
    <div
      style={{
        width: "150px",
        height: "150px",
        borderRadius: "20px",
        overflow: "hidden",
        background: isDark ? "#1a1c26" : "rgba(255,255,255,0.6)",
        boxShadow: isDark
          ? "0 0 0 1px rgba(52,211,153,0.15), 0 8px 32px rgba(0,0,0,0.35)"
          : "0 4px 24px rgba(0,0,0,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      className="ch-narrow-verified-svg"
    >
      <img
        src={src}
        alt="Admin verified animation"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
    </div>
  );
};

// -- Inline SVG icons for capability cards (thin-line geometric) --
const CapIcon = ({ children }) => (
  <div className="ch-cap-icon">
    <svg
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="40"
      height="40"
    >
      {children}
    </svg>
  </div>
);

const CAPABILITIES = [
  {
    mono: "Electrical",
    title: "Electricians",
    desc: "House wiring, motor pumps, inverter lines, and generator hookups.",
    icon: (
      <CapIcon>
        <path d="M22 4 L14 22 h8 L18 36 L30 18 h-8 Z" />
      </CapIcon>
    ),
  },
  {
    mono: "Masonry",
    title: "Masons & Builders",
    desc: "Slab work, plastering, stone walls, and structural reinforcements.",
    icon: (
      <CapIcon>
        <rect x="6" y="18" width="28" height="8" rx="1" />
        <rect x="10" y="10" width="20" height="8" rx="1" />
        <rect x="14" y="2" width="12" height="8" rx="1" />
      </CapIcon>
    ),
  },
  {
    mono: "Plumbing",
    title: "Plumbers",
    desc: "PVC pipelines, borewells, overhead tank fittings, and tap repairs.",
    icon: (
      <CapIcon>
        <path d="M10 8 Q10 20 20 20 Q30 20 30 32" />
        <circle cx="10" cy="6" r="3" />
        <circle cx="30" cy="34" r="3" />
        <path d="M6 20 h8 M22 20 h8" />
      </CapIcon>
    ),
  },
  {
    mono: "Carpentry",
    title: "Carpenters",
    desc: "Teak doors, modular furniture, wooden roofs, and frame joints.",
    icon: (
      <CapIcon>
        <rect x="4" y="14" width="32" height="14" rx="2" />
        <path d="M14 14 V28 M20 14 V28 M26 14 V28" />
        <path d="M8 10 L20 4 L32 10" />
      </CapIcon>
    ),
  },
  {
    mono: "Mechanical",
    title: "Mechanics",
    desc: "Tractors, diesel engines, pump repairs, and auto servicing.",
    icon: (
      <CapIcon>
        <circle cx="20" cy="20" r="6" />
        <path d="M20 4 V10 M20 30 V36 M4 20 H10 M30 20 H36" />
        <path d="M8.7 8.7 l4.2 4.2 M27.1 27.1 l4.2 4.2 M8.7 31.3 l4.2-4.2 M27.1 12.9 l4.2-4.2" />
      </CapIcon>
    ),
  },
  {
    mono: "Painting",
    title: "Painters",
    desc: "Whitewashing, exterior emulsion, varnish, and waterproofing.",
    icon: (
      <CapIcon>
        <path d="M12 4 L28 4 L28 28 Q20 36 12 28 Z" />
        <path d="M16 14 H24 M16 20 H24" />
        <path d="M28 12 Q36 12 36 20 Q36 28 28 24" />
      </CapIcon>
    ),
  },
  {
    mono: "Sanitation",
    title: "House Cleaning",
    desc: "Deep sanitation, water tank cleaning, and post-construction cleanup.",
    icon: (
      <CapIcon>
        <path d="M8 36 Q8 28 14 26 L20 8 L26 26 Q32 28 32 36" />
        <path d="M14 26 Q20 22 26 26" />
        <path d="M18 8 Q20 4 22 8" />
      </CapIcon>
    ),
  },
  {
    mono: "Labour",
    title: "General Labour",
    desc: "Harvest help, garden clearing, loading, and heavy agricultural work.",
    icon: (
      <CapIcon>
        <circle cx="20" cy="10" r="5" />
        <path d="M12 36 V24 Q12 16 20 16 Q28 16 28 24 V36" />
        <path d="M8 26 Q12 24 12 24" />
        <path d="M32 26 Q28 24 28 24" />
      </CapIcon>
    ),
  },
];

const HOW_IT_WORKS = [
  {
    step: "Step 01",
    title: "Worker Application",
    desc: "Workers register through their dedicated console, submitting skill categories, years of practice, village address, and proof of work.",
    icon: <FileText size={20} />,
  },
  {
    step: "Step 02",
    title: "Administrator Approval",
    desc: "The village administrator inspects submitted worker documents. Profiles remain hidden until explicitly approved and verified.",
    icon: <ShieldCheck size={20} />,
  },
  {
    step: "Step 03",
    title: "Direct Community Contact",
    desc: "Once verified, workers are published to the public search directory. Customers view full profiles and call workers directly · no middleman.",
    icon: <PhoneCall size={20} />,
  },
];

const TRUST_SERVICES = [
  { name: "Andhra Pradesh", icon: <HomeIcon size={22} /> },
  { name: "Village Admin", icon: <ShieldCheck size={22} /> },
  { name: "Rural Workers", icon: <Users size={22} /> },
  { name: "Community Trust", icon: <ClipboardList size={22} /> },
  { name: "Verified Profiles", icon: <Settings size={22} /> },
];

const SAMPLE_WORKERS = [
  {
    name: "Ravi Kumar",
    skill: "Electrician",
    status: "Verified",
    chip: "ch-chip-green",
    avatar: "?",
  },
  {
    name: "Suresh Reddy",
    skill: "Mason & Builder",
    status: "Active",
    chip: "ch-chip-green",
    avatar: "??",
  },
  {
    name: "Lakshmi Devi",
    skill: "House Cleaning",
    status: "Pending",
    chip: "ch-chip-yellow",
    avatar: "??",
  },
];

export default function Home() {
  const { currentUser } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const closeDrawer = () => setMobileDrawerOpen(false);

  return (
    <div
      style={{
        background: "var(--ch-canvas)",
        color: "var(--ch-ink)",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      {/* Page-level background image · light mode only */}
      {!isDark && (
        <div className="ch-page-bg" aria-hidden="true">
          <img src="/layout_bg.png" alt="" className="ch-page-bg-img" />
          {/* Soft gradient fade at the bottom so there's no hard cut */}
          <div className="ch-page-bg-fade" />
        </div>
      )}
      {/* -- ANNOUNCEMENT BAR -- */}
      {announcementVisible && (
        <div className="ch-announcement-bar">
          <span>
            Administrator-verified workers across Andhra villages.{" "}
            <Link to="/book-service">Search the directory ?</Link>
          </span>
          <button
            className="ch-announcement-close"
            onClick={() => setAnnouncementVisible(false)}
            aria-label="Dismiss announcement"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* -- GLOBAL NAV -- */}
      <nav className="ch-nav">
        <div className="ch-nav-inner">
          {/* Logo */}
          <Link to="/" className="ch-nav-logo">
            <div className="ch-nav-logo-mark">
              <img src={logoImg} alt="Grama Seva" />
            </div>
            <span className="ch-nav-logo-text">Grama Seva</span>
          </Link>

          {/* Desktop right CTA */}
          <div className="ch-nav-right">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              style={{
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: isDark ? "rgba(255,255,255,0.06)" : "transparent",
                border: "1px solid var(--ch-hairline)",
                borderRadius: "50%",
                cursor: "pointer",
                color: isDark ? "#fbbf24" : "var(--ch-ink)",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--ch-primary)";
                e.currentTarget.style.background = isDark
                  ? "rgba(251, 191, 36, 0.12)"
                  : "rgba(0,0,0,0.04)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--ch-hairline)";
                e.currentTarget.style.background = isDark
                  ? "rgba(255,255,255,0.06)"
                  : "transparent";
              }}
              aria-label={
                isDark ? "Switch to Light Mode" : "Switch to Dark Mode"
              }
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {currentUser ? (
              <Link to="/book-service" className="ch-btn-primary">
                Open Directory <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link to="/auth" className="ch-nav-link">
                  Sign In
                </Link>
                <Link to="/book-service" className="ch-btn-primary">
                  Search Workers <ArrowRight size={14} />
                </Link>
              </>
            )}
          </div>

          {/* Mobile actions cluster */}
          <div
            style={{ display: "none", alignItems: "center", gap: "8px" }}
            className="ch-mobile-nav-cluster"
          >
            <button
              onClick={toggleTheme}
              style={{
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: isDark ? "rgba(255,255,255,0.06)" : "transparent",
                border: "1px solid var(--ch-hairline)",
                borderRadius: "50%",
                cursor: "pointer",
                color: isDark ? "#fbbf24" : "var(--ch-ink)",
              }}
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              className="ch-nav-mobile-btn"
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* -- MOBILE DRAWER -- */}
      <div
        className={`ch-mobile-drawer ${mobileDrawerOpen ? "open" : ""}`}
        aria-modal="true"
        role="dialog"
      >
        <div className="ch-mobile-drawer-overlay" onClick={closeDrawer} />
        <div className="ch-mobile-drawer-panel">
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="ch-nav-logo-mark">
                <img src={logoImg} alt="Grama Seva" />
              </div>
              <span className="ch-nav-logo-text">Grama Seva</span>
            </div>
            <button
              onClick={closeDrawer}
              style={{
                background: "var(--ch-soft-stone)",
                border: "none",
                borderRadius: "8px",
                padding: "8px",
                cursor: "pointer",
                color: "var(--ch-slate)",
                display: "flex",
              }}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* Links */}
          <Link
            to="/book-service"
            onClick={closeDrawer}
            className="ch-mobile-nav-link"
          >
            Search Workers
          </Link>
          <Link
            to={currentUser ? "/book-service" : "/auth"}
            onClick={closeDrawer}
            className="ch-mobile-nav-link"
          >
            Portal
          </Link>
          <Link
            to="/auth?role=Worker"
            onClick={closeDrawer}
            className="ch-mobile-nav-link"
          >
            Join as Worker
          </Link>

          {/* Theme switch in drawer */}
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              background: "var(--ch-soft-stone)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--ch-ink)",
              }}
            >
              Appearance
            </span>
            <button
              onClick={toggleTheme}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                background: "var(--ch-canvas)",
                border: "1px solid var(--ch-hairline)",
                borderRadius: "20px",
                color: isDark ? "#fbbf24" : "var(--ch-ink)",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 500,
              }}
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
              {isDark ? "Light" : "Dark"}
            </button>
          </div>

          <div
            style={{
              marginTop: "auto",
              paddingTop: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {currentUser ? (
              <Link
                to="/book-service"
                onClick={closeDrawer}
                className="ch-btn-primary"
                style={{ justifyContent: "center" }}
              >
                Open Directory <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link
                  to="/book-service"
                  onClick={closeDrawer}
                  className="ch-btn-primary"
                  style={{ justifyContent: "center" }}
                >
                  Search Workers
                </Link>
                <Link
                  to="/auth"
                  onClick={closeDrawer}
                  className="ch-btn-pill-outline"
                  style={{ justifyContent: "center" }}
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* -- HERO BAND -- */}
      <section className="ch-hero">
        <div className="ch-hero-inner">
          {/* Mono label */}
          <div className="ch-hero-mono-label">
            Village Labour Directory · Andhra Pradesh
          </div>

          {/* Monumental headline */}
          <h1 className="ch-hero-headline">
            Skilled Workers.
            <br />
            Verified &amp; Direct.
          </h1>

          {/* Sub-headline */}
          <p className="ch-hero-subhead">
            Connect with administrator-verified electricians, masons, plumbers,
            and craftsmen across rural Andhra villages — direct contact, no
            intermediary.
          </p>

          {/* CTAs */}
          <div className="ch-hero-ctas">
            <Link
              to="/book-service"
              className="ch-btn-primary"
              style={{ fontSize: "15px", padding: "13px 28px" }}
            >
              Search Workers <ArrowRight size={16} />
            </Link>
            {!currentUser && (
              <Link to="/auth?role=Worker" className="ch-btn-secondary">
                Apply as a Worker
              </Link>
            )}
          </div>

          {/* -- Hero Media Composition -- */}
          <div className="ch-hero-media">
            {/* Wide dark card · agent console mockup */}
            <div className="ch-hero-card-wide">
              {/* Subtle background pattern */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(ellipse at 70% 20%, rgba(0,80,60,0.35) 0%, transparent 60%)",
                  pointerEvents: "none",
                }}
              />
              <div className="ch-console">
                <div className="ch-console-bar">
                  <div className="ch-console-dot" />
                  <div className="ch-console-dot" style={{ opacity: 0.5 }} />
                  <div className="ch-console-dot" style={{ opacity: 0.25 }} />
                  <span className="ch-console-title">
                    Worker Directory · Live
                  </span>
                </div>
                {SAMPLE_WORKERS.map((w) => (
                  <div key={w.name} className="ch-console-row">
                    <div className="ch-console-avatar">{w.avatar}</div>
                    <span className="ch-console-name">{w.name}</span>
                    <span className="ch-console-skill">{w.skill}</span>
                    <span className={`ch-console-chip ${w.chip}`}>
                      {w.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Narrow stone card · contextual info */}
            <div className="ch-hero-card-narrow">
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: isDark
                    ? "linear-gradient(160deg, #161720 0%, #0f1018 100%)"
                    : "linear-gradient(160deg, #eeece7 0%, #e4e1d8 100%)",
                }}
              />
              {/* Animated SVG · desktop only */}
              <div
                style={{
                  position: "relative",
                  zIndex: 2,
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingBottom: "8px",
                }}
                className="ch-narrow-svg-area"
              >
                <VerifiedAnimatedSVG isDark={isDark} />
              </div>
              <div style={{ position: "relative", zIndex: 2 }}>
                <div className="ch-narrow-badge">
                  <ShieldCheck size={11} />
                  Admin Verified
                </div>
                <div className="ch-narrow-heading">
                  Andhra Pradesh
                  <br />
                  Village Services
                </div>
                <div className="ch-narrow-sub">
                  Profiles reviewed and approved by local village
                  administrators.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -- TRUST STRIP -- */}
      <section className="ch-trust-strip">
        <div className="ch-trust-label">
          Serving communities across Andhra Pradesh
        </div>
        <div className="ch-trust-logos">
          {TRUST_SERVICES.map((s) => (
            <div key={s.name} className="ch-trust-logo-item">
              <div className="ch-trust-logo-icon">{s.icon}</div>
              <span className="ch-trust-logo-name">{s.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* -- SKILL CAPABILITIES -- */}
      <section className="ch-capabilities">
        <div className="ch-capabilities-inner">
          <div className="ch-section-header">
            <div>
              <div className="ch-section-mono">Services</div>
              <h2 className="ch-section-heading">
                Village Skill
                <br />
                Categories
              </h2>
            </div>
            <Link to="/book-service" className="ch-btn-pill-outline">
              Browse All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="ch-capability-grid">
            {CAPABILITIES.map((cap) => (
              <div key={cap.title} className="ch-capability-card">
                {cap.icon}
                <div className="ch-cap-mono">{cap.mono}</div>
                <div className="ch-cap-title">{cap.title}</div>
                <div className="ch-cap-desc">{cap.desc}</div>
                <Link to="/book-service" className="ch-cap-link">
                  Find {cap.title} <ArrowRight size={12} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- HOW IT WORKS · Dark Feature Band -- */}
      <section className="ch-dark-band">
        <div className="ch-dark-band-inner">
          <div className="ch-dark-band-header">
            <div className="ch-dark-mono">Process</div>
            <h2 className="ch-dark-heading">
              How Grama Seva
              <br />
              Protects Village Trust
            </h2>
            <p className="ch-dark-subhead">
              A transparent three-step vetting workflow administered by elected
              village representatives.
            </p>
          </div>
          <div className="ch-dark-steps">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="ch-dark-step">
                <div className="ch-step-number">{step.step}</div>
                <div className="ch-step-icon">{step.icon}</div>
                <div className="ch-step-title">{step.title}</div>
                <div className="ch-step-desc">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- CTA BAND · Pale green split layout -- */}
      <section className="ch-cta-band">
        <div className="ch-cta-band-inner">
          {/* Left: copy + CTA */}
          <div className="ch-cta-band-left">
            <div className="ch-cta-band-mono">Get Started</div>
            <h2 className="ch-cta-band-heading">
              Find the Right
              <br />
              Worker Today
            </h2>
            <p className="ch-cta-band-body">
              Every worker in our directory has been personally reviewed by the
              local village administrator. Browse profiles, view skill
              certifications, and contact workers directly by phone — no booking
              fee, no commission.
            </p>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <Link
                to="/book-service"
                className="ch-btn-primary"
                style={{
                  background: "var(--ch-deep-green)",
                  fontSize: "15px",
                  padding: "13px 28px",
                }}
              >
                Search Workers <ArrowRight size={16} />
              </Link>
              {!currentUser && (
                <Link
                  to="/auth?role=Worker"
                  className="ch-btn-pill-outline"
                  style={{
                    borderColor: "var(--ch-deep-green)",
                    color: "var(--ch-deep-green)",
                  }}
                >
                  Apply as a Worker
                </Link>
              )}
            </div>
          </div>

          {/* Right: Worker console panel */}
          <div className="ch-cta-band-right">
            <div className="ch-worker-console">
              <div className="ch-wc-header">
                <span className="ch-wc-title">Verified Worker Panel</span>
                <span className="ch-wc-status">4 online now</span>
              </div>
              {[
                {
                  name: "Ravi Kumar",
                  skill: "Electrician · 8 yrs",
                  badge: "Verified",
                  bStyle: {
                    background: "rgba(74,222,128,0.15)",
                    color: "#4ade80",
                  },
                  avatar: "?",
                },
                {
                  name: "Suresh Reddy",
                  skill: "Mason · 12 yrs",
                  badge: "Verified",
                  bStyle: {
                    background: "rgba(74,222,128,0.15)",
                    color: "#4ade80",
                  },
                  avatar: "??",
                },
                {
                  name: "Anand Babu",
                  skill: "Plumber · 6 yrs",
                  badge: "Active",
                  bStyle: {
                    background: "rgba(251,191,36,0.15)",
                    color: "#fbbf24",
                  },
                  avatar: "??",
                },
                {
                  name: "Kavya Sharma",
                  skill: "Painter · 4 yrs",
                  badge: "Verified",
                  bStyle: {
                    background: "rgba(74,222,128,0.15)",
                    color: "#4ade80",
                  },
                  avatar: "???",
                },
              ].map((w) => (
                <div key={w.name} className="ch-wc-worker">
                  <div className="ch-wc-avatar">{w.avatar}</div>
                  <div className="ch-wc-info">
                    <div className="ch-wc-name">{w.name}</div>
                    <div className="ch-wc-meta">{w.skill}</div>
                  </div>
                  <span className="ch-wc-badge" style={w.bStyle}>
                    {w.badge}
                  </span>
                </div>
              ))}
              <div className="ch-wc-footer">
                <span className="ch-wc-count">248 verified workers</span>
                <Link
                  to="/book-service"
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.45)",
                    textDecoration: "none",
                    fontFamily: "var(--ch-font-mono)",
                    letterSpacing: "0.22px",
                    textTransform: "uppercase",
                  }}
                >
                  View All ?
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -- FOOTER -- */}
      <footer className="ch-footer">
        <div className="ch-footer-inner">
          <div className="ch-footer-top">
            {/* Brand column */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "16px",
                }}
              >
                <div
                  className="ch-nav-logo-mark"
                  style={{ width: "28px", height: "28px" }}
                >
                  <img src={logoImg} alt="Grama Seva" />
                </div>
                <span className="ch-footer-brand-name">Grama Seva</span>
              </div>
              <p className="ch-footer-brand-tag">
                Administrator-verified rural skilled worker directory across
                Andhra Pradesh villages.
              </p>
            </div>

            {/* Platform links */}
            <div>
              <div className="ch-footer-col-heading">Platform</div>
              <div className="ch-footer-links">
                <Link to="/book-service" className="ch-footer-link">
                  Search Workers
                </Link>
                <Link to="/auth" className="ch-footer-link">
                  Sign In
                </Link>
                <Link to="/auth?role=Worker" className="ch-footer-link">
                  Join as a Worker
                </Link>
                <Link
                  to={currentUser ? "/book-service" : "/auth"}
                  className="ch-footer-link"
                >
                  Portal
                </Link>
              </div>
            </div>

            {/* Categories */}
            <div>
              <div className="ch-footer-col-heading">Categories</div>
              <div className="ch-footer-links">
                <Link to="/book-service" className="ch-footer-link">
                  Electricians
                </Link>
                <Link to="/book-service" className="ch-footer-link">
                  Masons & Builders
                </Link>
                <Link to="/book-service" className="ch-footer-link">
                  Plumbers
                </Link>
                <Link to="/book-service" className="ch-footer-link">
                  Carpenters
                </Link>
                <Link to="/book-service" className="ch-footer-link">
                  All Services
                </Link>
              </div>
            </div>
          </div>

          <div className="ch-footer-bottom">
            <span className="ch-footer-copy">
              © 2026 Grama Seva Rural Development. Developed by{" "}
              <strong style={{ color: "var(--ch-ink)" }}>
                Pedapatruni Shanmukh Vardhan
              </strong>
              . All rights reserved.
            </span>
            <div className="ch-footer-bottom-links">
              <Link to="/book-service" className="ch-footer-bottom-link">
                Search Workers
              </Link>
              <Link to="/auth" className="ch-footer-bottom-link">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
