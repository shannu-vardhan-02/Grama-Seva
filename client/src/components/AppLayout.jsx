import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import {
  LayoutDashboard,
  Wrench,
  Clock,
  MessageSquare,
  ShieldAlert,
  Users,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  X,
  Menu,
  Landmark,
} from "lucide-react";

const NAV = [
  { to: "/dashboard",    label: "Dashboard",       icon: LayoutDashboard },
  { to: "/book-service", label: "Search Workers",  icon: Wrench },
  { to: "/reviews",      label: "Reviews",         icon: MessageSquare },
  { to: "/vetting-queue",label: "Vetting Queue",   icon: ShieldAlert },
  { to: "/users",        label: "Manage Users",    icon: Users },
  { to: "/settings",     label: "Settings",        icon: Settings },
];

const ROLE_ACCESS = {
  Customer: ["/dashboard", "/book-service", "/reviews", "/settings"],
  Worker:   ["/dashboard", "/reviews", "/settings"],
  Admin:    ["/dashboard", "/vetting-queue", "/users", "/settings"],
};

export default function AppLayout({ children }) {
  const { currentUser, logout } = useAuth();
  const { notifications, markNotificationsAsRead } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotif, setShowNotif] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  if (!currentUser) return <>{children}</>;

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const toggleNotif = () => {
    setShowNotif((v) => !v);
    if (!showNotif) markNotificationsAsRead();
  };

  const userNotifs = notifications.filter((n) => n.recipient === currentUser.id);
  const unread    = userNotifs.filter((n) => !n.isRead).length;
  const allowed   = ROLE_ACCESS[currentUser.role] || [];
  const visibleNav = NAV.filter((item) => allowed.includes(item.to));

  const initials = (currentUser.name || "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const currentLabel = visibleNav.find((n) => location.pathname.startsWith(n.to))?.label || "Grama Seva";

  return (
    <div className="app-layout" style={{ display: "flex", minHeight: "100vh", background: "#faf9f5", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Mobile overlay ── */}
      {mobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(20,20,19,0.5)",
            zIndex: 49, display: "none",
          }}
        />
      )}

      {/* ── LEFT SIDEBAR — Dark Navy ── */}
      <aside
        className={`sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}
        style={{
          width: "230px",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          background: "#181715",
          color: "#faf9f5",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
          borderRight: "1px solid #252320",
          zIndex: 50,
        }}
      >
        {/* Brand */}
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid #252320" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "8px", background: "#cc785c",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Landmark size={16} color="#fff" />
            </div>
            <div>
              <div style={{
                fontFamily: "'Playfair Display', Georgia, serif", fontSize: "18px", fontWeight: 400,
                color: "#faf9f5", letterSpacing: "-0.01em",
              }}>Grama Seva</div>
              <div style={{ fontSize: "11px", color: "#a09d96", marginTop: "1px" }}>Rural Service Portal</div>
            </div>
          </div>
        </div>

        {/* Role pill */}
        <div style={{ padding: "14px 20px 10px" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", padding: "3px 10px",
            background: "#252320", color: "#cc785c", borderRadius: "9999px",
            fontSize: "11px", fontWeight: 600, letterSpacing: "0.04em",
            textTransform: "uppercase", border: "1px solid #3d3d3a",
          }}>
            {currentUser.role}
          </span>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: "8px 12px", display: "flex", flexDirection: "column", gap: "2px" }}>
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 12px", borderRadius: "8px",
                fontSize: "14px", fontWeight: isActive ? 600 : 400,
                color: isActive ? "#ffffff" : "rgba(255,255,255,0.55)",
                background: isActive ? "rgba(255,255,255,0.10)" : "transparent",
                textDecoration: "none", transition: "all 0.15s", letterSpacing: "-0.01em",
              })}
              onMouseEnter={(e) => {
                if (!e.currentTarget.getAttribute("aria-current")) {
                  e.currentTarget.style.color = "rgba(255,255,255,0.85)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.getAttribute("aria-current")) {
                  e.currentTarget.style.color = "rgba(255,255,255,0.55)";
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <item.icon size={16} style={{ flexShrink: 0 }} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom user strip */}
        <div style={{
          padding: "16px 16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex", alignItems: "center", gap: "10px",
        }}>
          <div style={{
            width: "30px", height: "30px", borderRadius: "50%", background: "#cc785c",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "12px", fontWeight: 600, color: "#ffffff", flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: "13px", fontWeight: 600, color: "#ffffff",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{currentUser.name}</div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "rgba(255,255,255,0.45)", display: "flex",
              alignItems: "center", justifyContent: "center",
              padding: "4px", borderRadius: "6px", transition: "color 0.15s", flexShrink: 0,
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#ffffff"}
            onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.45)"}
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* ── RIGHT CONTENT AREA ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* ── SUB-NAV frosted parchment ── */}
        <header className="top-header" style={{
          height: "52px", display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "0 24px",
          background: "rgba(245,245,247,0.92)", backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          borderBottom: "1px solid rgba(0,0,0,0.08)", position: "sticky", top: 0, zIndex: 40,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              className="hamburger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: "none", border: "none", cursor: "pointer", color: "#141413",
                display: "none", alignItems: "center", padding: "4px",
              }}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <span style={{
              fontFamily: "'Playfair Display', Georgia, serif", fontSize: "18px",
              fontWeight: 500, color: "#1d1d1f", letterSpacing: "-0.01em",
            }}>
              {currentLabel}
            </span>
          </div>

          {/* Right cluster */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

            {/* Notification bell */}
            <div style={{ position: "relative" }}>
              <button
                onClick={toggleNotif}
                style={{
                  width: "36px", height: "36px", display: "flex", alignItems: "center",
                  justifyContent: "center", background: "rgba(0,0,0,0.04)",
                  border: "1px solid rgba(0,0,0,0.08)", borderRadius: "50%",
                  cursor: "pointer", color: "#1d1d1f", transition: "background 0.15s", position: "relative",
                }}
              >
                <Bell size={15} />
                {unread > 0 && (
                  <span style={{
                    position: "absolute", top: "2px", right: "2px",
                    width: "8px", height: "8px", background: "#ff3b30",
                    borderRadius: "50%", border: "1.5px solid #f5f5f7",
                  }} />
                )}
              </button>

              {/* Notification dropdown */}
              {showNotif && (
                <div className="notif-dropdown" style={{
                  position: "absolute", right: 0, top: "calc(100% + 8px)",
                  width: "320px", background: "#ffffff", border: "1px solid #e6dfd8",
                  borderRadius: "16px", boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
                  zIndex: 100, overflow: "hidden",
                }}>
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 18px", borderBottom: "1px solid #e6dfd8",
                  }}>
                    <span style={{ fontSize: "14px", fontWeight: 600, color: "#141413" }}>Notifications</span>
                    <button onClick={() => setShowNotif(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#8e8b82", display: "flex" }}>
                      <X size={14} />
                    </button>
                  </div>
                  <div style={{ maxHeight: "280px", overflowY: "auto" }}>
                    {userNotifs.length === 0 ? (
                      <p style={{ padding: "28px 18px", textAlign: "center", fontSize: "14px", color: "#8e8b82" }}>
                        No notifications
                      </p>
                    ) : userNotifs.map((n) => (
                      <div key={n.id} style={{
                        padding: "12px 18px", borderBottom: "1px solid rgba(0,0,0,0.05)",
                        background: !n.isRead ? "rgba(204,120,92,0.06)" : "transparent",
                      }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#141413" }}>{n.title}</div>
                        <div style={{ fontSize: "13px", color: "#6c6a64", marginTop: "2px", lineHeight: 1.4 }}>{n.message}</div>
                        <div style={{ fontSize: "11px", color: "#8e8b82", marginTop: "4px" }}>
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sign out button */}
            <button
              className="signout-btn"
              onClick={handleLogout}
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "7px 14px", background: "#181715", color: "#ffffff",
                border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 400,
                cursor: "pointer", letterSpacing: "-0.01em", transition: "transform 0.1s",
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.95)"}
              onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              <LogOut size={13} />
              Sign Out
            </button>
          </div>
        </header>

        {/* ── Main content ── */}
        <main style={{ flex: 1, overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
