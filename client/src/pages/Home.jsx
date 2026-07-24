import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Search, Phone, ShieldCheck, Users, MapPin, ArrowRight } from "lucide-react";

export default function Home() {
  const { currentUser } = useAuth();

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: "#faf9f5", minHeight: "100vh" }}>

      {/* ── GLOBAL NAV ── */}
      <nav style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "#181715",
        color: "#faf9f5",
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        borderBottom: "1px solid #252320",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "28px", height: "28px", background: "#cc785c", borderRadius: "6px",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <svg width="15" height="15" fill="none" stroke="#fff" strokeWidth="2.2" viewBox="0 0 24 24">
              <path d="M3 21V7l9-4 9 4v14"/>
              <path d="M9 21v-6h6v6"/>
            </svg>
          </div>
          <span style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "20px",
            fontWeight: 400,
            color: "#faf9f5",
            letterSpacing: "-0.01em",
          }}>Grama Seva</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          <Link to="/book-service" style={{ fontSize: "14px", color: "#a09d96", textDecoration: "none" }}>Search Workers</Link>
          <Link to={currentUser ? "/dashboard" : "/auth"} style={{ fontSize: "14px", color: "#a09d96", textDecoration: "none" }}>Portal</Link>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          {currentUser ? (
            <Link to="/dashboard" style={{
              padding: "8px 18px",
              background: "#cc785c",
              color: "#ffffff",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 500,
              textDecoration: "none",
            }}>Dashboard</Link>
          ) : (
            <Link to="/auth" style={{
              padding: "8px 18px",
              background: "#cc785c",
              color: "#ffffff",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 500,
              textDecoration: "none",
            }}>Sign In</Link>
          )}
        </div>
      </nav>

      {/* ── HERO BAND — Warm Cream ── */}
      <section style={{
        background: "#faf9f5",
        padding: "96px 24px",
        textAlign: "center",
        borderBottom: "1px solid #e6dfd8",
      }}>
        <div style={{ maxWidth: "780px", margin: "0 auto" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 14px",
            borderRadius: "9999px",
            background: "#efe9de",
            border: "1px solid #e6dfd8",
            fontSize: "13px",
            fontWeight: 500,
            color: "#cc785c",
            marginBottom: "24px",
          }}>
            <span>✶ Direct Community Contact Directory</span>
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(2.4rem, 5vw, 3.6rem)",
            fontWeight: 400,
            color: "#141413",
            lineHeight: 1.12,
            letterSpacing: "-0.025em",
            marginBottom: "24px",
          }}>
            Skilled Village Workers.<br />Direct Contact & Verification.
          </h1>

          <p style={{
            fontSize: "18px",
            fontWeight: 400,
            color: "#3d3d3a",
            lineHeight: 1.6,
            maxWidth: "620px",
            margin: "0 auto 36px",
          }}>
            Connecting rural households with administrator-verified electricians, masons, plumbers, and local craftsmen across Andhra villages.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "center" }}>
            <Link to="/book-service" style={{
              padding: "13px 28px",
              background: "#cc785c",
              color: "#ffffff",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: 500,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              transition: "background 0.15s",
            }}>
              Search Workers <ArrowRight size={18} />
            </Link>
            {!currentUser && (
              <Link to="/auth?role=Worker" style={{
                padding: "13px 28px",
                background: "#efe9de",
                color: "#141413",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: 500,
                textDecoration: "none",
                border: "1px solid #e6dfd8",
              }}>
                Apply as a Worker
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── SKILL CATEGORIES — Surface Soft ── */}
      <section style={{
        background: "#f5f0e8",
        padding: "80px 24px",
        borderBottom: "1px solid #e6dfd8",
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "32px",
              fontWeight: 400,
              color: "#141413",
              marginBottom: "12px",
            }}>
              Essential Village Skill Categories
            </h2>
            <p style={{ fontSize: "16px", color: "#6c6a64" }}>
              Explore experienced local craftsmen vetted by village administrators.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "20px",
          }}>
            {[
              { emoji: "⚡", title: "Electricians", desc: "House wiring, motor pumps, inverter lines" },
              { emoji: "🧱", title: "Masons & Builders", desc: "Slab work, plastering, stone walls" },
              { emoji: "🔧", title: "Plumbers", desc: "PVC lines, borewells, tap fittings" },
              { emoji: "🪵", title: "Carpenters", desc: "Teak doors, furniture, wooden roofs" },
              { emoji: "⚙️", title: "Mechanics", desc: "Tractors, diesel engines, auto repairs" },
              { emoji: "🖌️", title: "Painters", desc: "Whitewashing, exterior emulsion, varnish" },
              { emoji: "🧹", title: "House Cleaning", desc: "Deep sanitation, water tank cleaning" },
              { emoji: "🏠", title: "General Labour", desc: "Harvest help, garden clearing, heavy work" },
            ].map((svc) => (
              <div key={svc.title} style={{
                background: "#ffffff",
                border: "1px solid #e6dfd8",
                borderRadius: "12px",
                padding: "28px",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}>
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

      {/* ── DARK NAVY BAND — Product Surface ── */}
      <section style={{
        background: "#181715",
        color: "#faf9f5",
        padding: "80px 24px",
      }}>
        <div style={{ maxWidth: "980px", margin: "0 auto", textAlign: "center" }}>
          <div style={{
            display: "inline-block",
            padding: "4px 12px",
            borderRadius: "9999px",
            background: "#252320",
            color: "#cc785c",
            fontSize: "12px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "20px",
          }}>
            Administrator Vetting Workflow
          </div>

          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "36px",
            fontWeight: 400,
            color: "#faf9f5",
            lineHeight: 1.2,
            marginBottom: "20px",
          }}>
            How Grama Seva Protects Village Trust
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
            textAlign: "left",
            marginTop: "48px",
          }}>
            <div style={{ background: "#252320", border: "1px solid #3d3d3a", borderRadius: "12px", padding: "28px" }}>
              <div style={{ fontSize: "24px", marginBottom: "12px" }}>📝</div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", color: "#faf9f5", marginBottom: "8px" }}>1. Worker Application</h3>
              <p style={{ fontSize: "14px", color: "#a09d96", lineHeight: 1.6 }}>
                Workers register through their dedicated console, submitting skill categories, years of practice, village address, and proof of work.
              </p>
            </div>

            <div style={{ background: "#252320", border: "1px solid #3d3d3a", borderRadius: "12px", padding: "28px" }}>
              <div style={{ fontSize: "24px", marginBottom: "12px" }}>🛡️</div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", color: "#faf9f5", marginBottom: "8px" }}>2. Administrator Approval</h3>
              <p style={{ fontSize: "14px", color: "#a09d96", lineHeight: 1.6 }}>
                The village administrator inspects submitted worker documents. Profiles remain hidden until explicitly approved.
              </p>
            </div>

            <div style={{ background: "#252320", border: "1px solid #3d3d3a", borderRadius: "12px", padding: "28px" }}>
              <div style={{ fontSize: "24px", marginBottom: "12px" }}>📞</div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", color: "#faf9f5", marginBottom: "8px" }}>3. Direct Community Contact</h3>
              <p style={{ fontSize: "14px", color: "#a09d96", lineHeight: 1.6 }}>
                Once verified, workers are published to the public search directory. Customers view full profiles and call workers directly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER — Dark Navy ── */}
      <footer style={{
        background: "#181715",
        borderTop: "1px solid #252320",
        padding: "48px 24px 32px",
        color: "#a09d96",
      }}>
        <div style={{ maxWidth: "980px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", borderBottom: "1px solid #252320", paddingBottom: "24px", marginBottom: "24px" }}>
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

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", fontSize: "13px" }}>
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
