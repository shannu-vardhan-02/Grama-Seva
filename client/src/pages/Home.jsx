import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowRight, X, Menu, Landmark } from "lucide-react";

export default function Home() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const closeDrawer = () => setMobileDrawerOpen(false);

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: "#faf9f5", minHeight: "100vh" }}>

      {/* ── GLOBAL NAV ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "#181715", color: "#faf9f5",
        height: "56px", display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 24px",
        borderBottom: "1px solid #252320",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "28px", height: "28px", background: "#cc785c", borderRadius: "6px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="15" height="15" fill="none" stroke="#fff" strokeWidth="2.2" viewBox="0 0 24 24">
              <path d="M3 21V7l9-4 9 4v14"/>
              <path d="M9 21v-6h6v6"/>
            </svg>
          </div>
          <span style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "20px", fontWeight: 400, color: "#faf9f5", letterSpacing: "-0.01em",
          }}>Grama Seva</span>
        </div>

        {/* Desktop nav links */}
        <div className="home-nav-links">
          <Link to="/book-service" style={{ fontSize: "14px", color: "#a09d96", textDecoration: "none" }}>Search Workers</Link>
          <Link to={currentUser ? "/book-service" : "/auth"} style={{ fontSize: "14px", color: "#a09d96", textDecoration: "none" }}>Portal</Link>
        </div>

        {/* Desktop auth button */}
        <div className="home-nav-auth">
          {currentUser ? (
            <Link to="/book-service" style={{
              padding: "8px 18px", background: "#cc785c", color: "#ffffff",
              borderRadius: "8px", fontSize: "14px", fontWeight: 500, textDecoration: "none",
            }}>Search Workers</Link>
          ) : (
            <Link to="/auth" style={{
              padding: "8px 18px", background: "#cc785c", color: "#ffffff",
              borderRadius: "8px", fontSize: "14px", fontWeight: 500, textDecoration: "none",
            }}>Sign In</Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="home-mobile-menu-btn"
          onClick={() => setMobileDrawerOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </nav>

      {/* ── MOBILE SLIDE DRAWER ── */}
      <div className={`home-mobile-drawer ${mobileDrawerOpen ? "open" : ""}`} aria-modal="true" role="dialog">
        <div className="home-mobile-drawer-overlay" onClick={closeDrawer} />
        <div className="home-mobile-drawer-panel">
          {/* Drawer header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "24px", height: "24px", background: "#cc785c", borderRadius: "5px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Landmark size={13} color="#fff" />
              </div>
              <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "17px", color: "#faf9f5" }}>Grama Seva</span>
            </div>
            <button
              onClick={closeDrawer}
              style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "8px", padding: "8px", cursor: "pointer", color: "#a09d96", display: "flex" }}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* Drawer links */}
          <Link
            to="/book-service"
            onClick={closeDrawer}
            style={{ display: "flex", alignItems: "center", gap: "10px", padding: "13px 14px", borderRadius: "10px", color: "#faf9f5", textDecoration: "none", fontSize: "15px", fontWeight: 500, background: "rgba(255,255,255,0.05)" }}
          >
            🔍 Search Workers
          </Link>
          <Link
            to={currentUser ? "/book-service" : "/auth"}
            onClick={closeDrawer}
            style={{ display: "flex", alignItems: "center", gap: "10px", padding: "13px 14px", borderRadius: "10px", color: "#a09d96", textDecoration: "none", fontSize: "15px", fontWeight: 400 }}
          >
            🏛️ Portal
          </Link>

          <div style={{ marginTop: "auto", paddingTop: "24px" }}>
            {currentUser ? (
              <Link
                to="/book-service"
                onClick={closeDrawer}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "13px 20px", background: "#cc785c", color: "#ffffff", borderRadius: "10px", fontSize: "15px", fontWeight: 600, textDecoration: "none" }}
              >
                Find Workers
              </Link>
            ) : (
              <>
                <Link
                  to="/auth"
                  onClick={closeDrawer}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "13px 20px", background: "#cc785c", color: "#ffffff", borderRadius: "10px", fontSize: "15px", fontWeight: 600, textDecoration: "none", marginBottom: "10px" }}
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?role=Worker"
                  onClick={closeDrawer}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "13px 20px", background: "transparent", color: "#a09d96", borderRadius: "10px", fontSize: "14px", fontWeight: 400, textDecoration: "none", border: "1px solid #3d3d3a" }}
                >
                  Apply as a Worker
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── HERO BAND ── */}
      <section className="home-hero-section" style={{
        background: "#faf9f5",
        borderBottom: "1px solid #e6dfd8",
      }}>
        <div style={{ maxWidth: "780px", margin: "0 auto", textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "6px 14px", borderRadius: "9999px",
            background: "#efe9de", border: "1px solid #e6dfd8",
            fontSize: "13px", fontWeight: 500, color: "#cc785c", marginBottom: "24px",
          }}>
            <span>✶ Direct Community Contact Directory</span>
          </div>

          <h1 className="home-hero-heading" style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 400, color: "#141413",
            lineHeight: 1.12, letterSpacing: "-0.025em", marginBottom: "24px",
          }}>
            Skilled Village Workers.<br />Direct Contact &amp; Verification.
          </h1>

          <p className="home-hero-desc" style={{
            fontWeight: 400, color: "#3d3d3a", lineHeight: 1.6,
            maxWidth: "620px", margin: "0 auto 36px",
          }}>
            Connecting rural households with administrator-verified electricians, masons, plumbers, and local craftsmen across Andhra villages.
          </p>

          <div className="home-cta-buttons">
            <Link to="/book-service" className="home-cta-btn" style={{
              padding: "13px 28px", background: "#cc785c", color: "#ffffff",
              borderRadius: "8px", fontSize: "16px", fontWeight: 500,
              textDecoration: "none", display: "inline-flex", alignItems: "center",
              gap: "8px", transition: "background 0.15s",
            }}>
              Search Workers <ArrowRight size={18} />
            </Link>
            {!currentUser && (
              <Link to="/auth?role=Worker" className="home-cta-btn" style={{
                padding: "13px 28px", background: "#efe9de", color: "#141413",
                borderRadius: "8px", fontSize: "16px", fontWeight: 500,
                textDecoration: "none", border: "1px solid #e6dfd8", display: "inline-block",
              }}>
                Apply as a Worker
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── SKILL CATEGORIES ── */}
      <section style={{ background: "#f5f0e8", padding: "80px 24px", borderBottom: "1px solid #e6dfd8" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "32px", fontWeight: 400, color: "#141413", marginBottom: "12px",
            }}>
              Essential Village Skill Categories
            </h2>
            <p style={{ fontSize: "16px", color: "#6c6a64" }}>
              Explore experienced local craftsmen vetted by village administrators.
            </p>
          </div>

          <div className="home-categories-grid">
            {[
              { emoji: "⚡", title: "Electricians",   desc: "House wiring, motor pumps, inverter lines" },
              { emoji: "🧱", title: "Masons & Builders", desc: "Slab work, plastering, stone walls" },
              { emoji: "🔧", title: "Plumbers",       desc: "PVC lines, borewells, tap fittings" },
              { emoji: "🪵", title: "Carpenters",     desc: "Teak doors, furniture, wooden roofs" },
              { emoji: "⚙️", title: "Mechanics",      desc: "Tractors, diesel engines, auto repairs" },
              { emoji: "🖌️", title: "Painters",       desc: "Whitewashing, exterior emulsion, varnish" },
              { emoji: "🧹", title: "House Cleaning", desc: "Deep sanitation, water tank cleaning" },
              { emoji: "🏠", title: "General Labour", desc: "Harvest help, garden clearing, heavy work" },
            ].map((svc) => (
              <div key={svc.title} className="home-category-card" style={{
                background: "#ffffff", border: "1px solid #e6dfd8",
                borderRadius: "12px", padding: "28px",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.07)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
              >
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>{svc.emoji}</div>
                <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "20px", fontWeight: 600, color: "#141413", marginBottom: "6px" }}>{svc.title}</h3>
                <p style={{ fontSize: "14px", color: "#6c6a64", lineHeight: 1.5, marginBottom: "16px" }}>{svc.desc}</p>
                <Link to="/book-service" style={{ fontSize: "14px", color: "#cc785c", fontWeight: 500, textDecoration: "none" }}>
                  Find {svc.title} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — Dark Band ── */}
      <section style={{ background: "#181715", color: "#faf9f5", padding: "80px 24px" }}>
        <div style={{ maxWidth: "980px", margin: "0 auto", textAlign: "center" }}>
          <div style={{
            display: "inline-block", padding: "4px 12px", borderRadius: "9999px",
            background: "#252320", color: "#cc785c", fontSize: "12px",
            fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "20px",
          }}>
            Administrator Vetting Workflow
          </div>

          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(1.6rem, 4vw, 2.25rem)", fontWeight: 400, color: "#faf9f5",
            lineHeight: 1.2, marginBottom: "20px",
          }}>
            How Grama Seva Protects Village Trust
          </h2>

          <div className="home-features-grid" style={{ textAlign: "left", marginTop: "48px" }}>
            {[
              { icon: "📝", step: "1. Worker Application", desc: "Workers register through their dedicated console, submitting skill categories, years of practice, village address, and proof of work." },
              { icon: "🛡️", step: "2. Administrator Approval", desc: "The village administrator inspects submitted worker documents. Profiles remain hidden until explicitly approved." },
              { icon: "📞", step: "3. Direct Community Contact", desc: "Once verified, workers are published to the public search directory. Customers view full profiles and call workers directly." },
            ].map(f => (
              <div key={f.step} style={{ background: "#252320", border: "1px solid #3d3d3a", borderRadius: "12px", padding: "28px" }}>
                <div style={{ fontSize: "24px", marginBottom: "12px" }}>{f.icon}</div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", color: "#faf9f5", marginBottom: "8px" }}>{f.step}</h3>
                <p style={{ fontSize: "14px", color: "#a09d96", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#181715", borderTop: "1px solid #252320", padding: "48px 24px 32px", color: "#a09d96" }}>
        <div style={{ maxWidth: "980px", margin: "0 auto" }}>
          <div className="home-footer-top" style={{ borderBottom: "1px solid #252320", paddingBottom: "24px", marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "24px", height: "24px", background: "#cc785c", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="13" height="13" fill="none" stroke="#fff" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path d="M3 21V7l9-4 9 4v14"/>
                </svg>
              </div>
              <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "20px", color: "#faf9f5" }}>Grama Seva</span>
            </div>
            <div style={{ fontSize: "13px", color: "#8e8b82" }}>Connecting rural talent across Andhra villages</div>
          </div>

          <div className="home-footer-bottom">
            <div>© 2026 Grama Seva Rural Development. All rights reserved.</div>
            <div style={{ display: "flex", gap: "20px" }}>
              <Link to="/book-service" style={{ color: "#a09d96", textDecoration: "none" }}>Search Workers</Link>
              <Link to="/auth" style={{ color: "#a09d96", textDecoration: "none" }}>Sign In</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
