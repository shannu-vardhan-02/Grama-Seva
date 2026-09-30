import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage, LANGUAGE_OPTIONS } from "../context/LanguageContext";
import ConfirmModal from "./ConfirmModal";
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
  Home,
  Search,
  User,
  Sun,
  Moon,
  Globe,
  ChevronDown,
  ChevronUp,
  Check,
  Fingerprint,
} from "lucide-react";

import GramaSevaLogo from "./GramaSevaLogo";
import logoImg from "../assets/grama-seva-logo.jpg";

const NAV = [
  { to: "/book-service", labelKey: "searchWorkers", defaultLabel: "Search Workers", icon: Search },
  { to: "/reviews",      labelKey: "reviews",       defaultLabel: "Reviews",        icon: MessageSquare },
  { to: "/vetting-queue",labelKey: "vettingQueue",  defaultLabel: "Vetting Queue",  icon: ShieldAlert },
  { to: "/users",        labelKey: "manageUsers",   defaultLabel: "Manage Users",   icon: Users },
  { to: "/settings",     labelKey: "settings",      defaultLabel: "Settings",       icon: Settings },
];

const ROLE_ACCESS = {
  Customer: ["/book-service", "/reviews", "/settings"],
  Worker:   ["/book-service", "/reviews", "/settings"],
  Admin:    ["/book-service", "/vetting-queue", "/users", "/settings"],
};

const BOTTOM_NAV = {
  Customer: [
    { to: "/",            label: "Home",     icon: Home },
    { to: "/book-service",label: "Workers",  icon: Search },
    { to: "/reviews",     label: "Reviews",  icon: MessageSquare },
    { to: "/settings",    label: "Profile",  icon: User },
  ],
  Worker: [
    { to: "/",            label: "Home",     icon: Home },
    { to: "/book-service",label: "Directory",icon: Search },
    { to: "/reviews",     label: "Reviews",  icon: MessageSquare },
    { to: "/settings",    label: "Profile",  icon: User },
  ],
  Admin: [
    { to: "/book-service",   label: "Workers",  icon: Search },
    { to: "/vetting-queue",  label: "Vetting",  icon: ShieldAlert },
    { to: "/users",          label: "Users",    icon: Users },
    { to: "/settings",       label: "Settings", icon: Settings },
  ],
};

// Role accent colors
const ROLE_COLORS = {
  Customer: { bg: "rgba(24,99,220,0.12)", color: "#1863dc" },
  Worker:   { bg: "rgba(255,119,89,0.12)", color: "#ff7759" },
  Admin:    { bg: "rgba(0,60,51,0.15)", color: "#4ade80" },
};

export default function AppLayout({ children }) {
  const { currentUser, logout } = useAuth();
  const { notifications, markNotificationsAsRead } = useSocket();
  const { theme, isDark, toggleTheme } = useTheme();
  const { lang, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotif, setShowNotif] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [showReconnectedBanner, setShowReconnectedBanner] = useState(false);

  useEffect(() => {
    const handleClick = (e) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setLangDropdownOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnectedBanner(true);
      const timer = setTimeout(() => setShowReconnectedBanner(false), 3500);
      return () => clearTimeout(timer);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnectedBanner(false);
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add("drawer-open");
    } else {
      document.body.classList.remove("drawer-open");
    }
    return () => document.body.classList.remove("drawer-open");
  }, [mobileMenuOpen]);

  if (!currentUser) return <>{children}</>;

  const handleLogout = () => {
    setShowSignOutConfirm(true);
  };

  const doLogout = () => {
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
  const bottomNavItems = BOTTOM_NAV[currentUser.role] || BOTTOM_NAV.Admin;

  const initials = (currentUser.name || "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const currentNav = visibleNav.find((n) => location.pathname.startsWith(n.to));
  const currentLabel = currentNav ? (t(currentNav.labelKey) || currentNav.defaultLabel) : "Grama Seva";
  const roleStyle = ROLE_COLORS[currentUser.role] || ROLE_COLORS.Customer;

  return (
    <div className="app-layout" style={{
      display: "flex", minHeight: "100vh",
      background: isDark ? "#0d0e12" : "#f8f8f8",
      color: isDark ? "#f0f1f5" : "#17171c",
      fontFamily: "'Inter', sans-serif",
    }}>

      {/* ── Mobile overlay backdrop ── */}
      {mobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
          style={{ background: "rgba(23,23,28,0.55)", backdropFilter: "blur(4px)" }}
        />
      )}

      {/* ── LEFT SIDEBAR — Cohere Near-Black ── */}
      <aside
        className={`sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}
        style={{
          width: "232px",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          background: "#17171c",
          color: "#ffffff",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          zIndex: 50,
        }}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="hamburger-btn"
          style={{
            position: "absolute", top: "14px", right: "10px",
            background: "rgba(255,255,255,0.07)",
            border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)",
            borderRadius: "6px", padding: "6px",
            alignItems: "center", justifyContent: "center",
          }}
          aria-label="Close menu"
        >
          <X size={16} />
        </button>

        {/* Brand */}
        <div style={{
          padding: "22px 18px 18px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", gap: "10px",
        }}>
          <div style={{
            width: "30px", height: "30px", borderRadius: "6px",
            overflow: "hidden", flexShrink: 0,
          }}>
            <img src={logoImg} alt="Grama Seva" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div>
            <div style={{
              fontFamily: "'Space Grotesk', 'Inter', sans-serif",
              fontSize: "16px", fontWeight: 600, color: "#ffffff",
              letterSpacing: "-0.32px", lineHeight: 1.1,
            }}>Grama Seva</div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "9px", color: "rgba(255,255,255,0.3)",
              letterSpacing: "0.18px", textTransform: "uppercase", marginTop: "2px",
            }}>Village Directory</div>
          </div>
        </div>

        {/* Role pill */}
        <div style={{ padding: "12px 18px 8px" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", padding: "3px 10px",
            background: roleStyle.bg,
            color: roleStyle.color,
            borderRadius: "9999px",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "10px", fontWeight: 500, letterSpacing: "0.2px",
            textTransform: "uppercase",
          }}>
            {currentUser.role}
          </span>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: "8px 10px", display: "flex", flexDirection: "column", gap: "1px" }}>
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 12px", borderRadius: "6px",
                fontSize: "13.5px", fontWeight: isActive ? 500 : 400,
                color: isActive ? "#ffffff" : "rgba(255,255,255,0.45)",
                background: isActive ? "rgba(0,60,51,0.2)" : "transparent",
                textDecoration: "none", transition: "all 0.12s",
                letterSpacing: "0",
                minHeight: "42px",
                borderLeft: isActive ? "3px solid #003c33" : "3px solid transparent",
              })}
              onMouseEnter={(e) => {
                if (!e.currentTarget.getAttribute("aria-current")) {
                  e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.getAttribute("aria-current")) {
                  e.currentTarget.style.color = "rgba(255,255,255,0.45)";
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <item.icon size={15} style={{ flexShrink: 0 }} />
              {t(item.labelKey) || item.defaultLabel}
            </NavLink>
          ))}
        </nav>

        {/* Bottom user strip with Popup Menu */}
        <div ref={profileMenuRef} style={{ position: "relative", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {/* Profile Menu Popup */}
          {profileMenuOpen && (
            <div
              className="profile-popup-menu"
              style={{
                position: "absolute",
                bottom: "calc(100% + 8px)",
                left: "8px",
                right: "8px",
                background: isDark ? "#171822" : "#ffffff",
                border: isDark ? "1px solid #282a3a" : "1px solid #e5e7eb",
                borderRadius: "12px",
                boxShadow: isDark
                  ? "0 16px 40px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.05)"
                  : "0 12px 32px rgba(20,20,19,0.12)",
                padding: "6px",
                zIndex: 120,
                display: "flex",
                flexDirection: "column",
                gap: "2px",
              }}
            >
              {/* Header with user info: first word of full name + role pill (no email) */}
              <div style={{
                padding: "8px 10px 9px",
                borderBottom: isDark ? "1px solid #232532" : "1px solid #f0f0f2",
                marginBottom: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
              }}>
                <div style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: isDark ? "#f3f4f8" : "#17171c",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontFamily: "'Inter', sans-serif",
                }}>
                  {(currentUser.name || "User").trim().split(" ")[0]}
                </div>
                <span style={{
                  fontSize: "9px",
                  padding: "2px 7px",
                  borderRadius: "99px",
                  background: roleStyle.bg,
                  color: roleStyle.color,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.2px",
                  flexShrink: 0,
                }}>
                  {currentUser.role}
                </span>
              </div>

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={() => toggleTheme()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 10px",
                  background: "transparent",
                  border: "none",
                  borderRadius: "6px",
                  color: isDark ? "#e5e7eb" : "#374151",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                  transition: "background 0.12s",
                  fontFamily: "'Inter', sans-serif",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {isDark ? <Sun size={15} color="#fbbf24" /> : <Moon size={15} color="#6366f1" />}
                <span style={{ flex: 1 }}>{isDark ? "Light Mode" : "Dark Mode"}</span>
                <span style={{ fontSize: "11px", color: isDark ? "#7e8194" : "#9ca3af" }}>
                  {isDark ? "Dark" : "Light"}
                </span>
              </button>

              {/* Passkeys */}
              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen(false);
                  navigate("/settings#passkeys");
                  setTimeout(() => {
                    const el = document.getElementById("passkeys");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }, 120);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 10px",
                  background: "transparent",
                  border: "none",
                  borderRadius: "6px",
                  color: isDark ? "#e5e7eb" : "#374151",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                  transition: "background 0.12s",
                  fontFamily: "'Inter', sans-serif",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <Fingerprint size={15} color={isDark ? "#34d399" : "#003c33"} />
                <span style={{ flex: 1 }}>Passkeys</span>
                <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "4px", background: isDark ? "rgba(52,211,153,0.15)" : "rgba(0,60,51,0.08)", color: isDark ? "#34d399" : "#003c33", fontWeight: 600 }}>
                  🔑
                </span>
              </button>

              {/* Settings */}
              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen(false);
                  navigate("/settings");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 10px",
                  background: "transparent",
                  border: "none",
                  borderRadius: "6px",
                  color: isDark ? "#e5e7eb" : "#374151",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                  transition: "background 0.12s",
                  fontFamily: "'Inter', sans-serif",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <Settings size={15} color={isDark ? "#9ca3af" : "#6b7280"} />
                <span style={{ flex: 1 }}>Settings</span>
              </button>

              <div style={{ height: "1px", background: isDark ? "#232532" : "#f0f0f2", margin: "4px 0" }} />

              {/* Sign out */}
              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen(false);
                  handleLogout();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 10px",
                  background: "transparent",
                  border: "none",
                  borderRadius: "6px",
                  color: isDark ? "#f87171" : "#dc2626",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                  transition: "background 0.12s",
                  fontFamily: "'Inter', sans-serif",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDark ? "rgba(239, 68, 68, 0.12)" : "rgba(239, 68, 68, 0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <LogOut size={15} color={isDark ? "#f87171" : "#dc2626"} />
                <span style={{ flex: 1 }}>Sign Out</span>
              </button>
            </div>
          )}

          {/* Trigger row */}
          <div
            onClick={() => setProfileMenuOpen((v) => !v)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setProfileMenuOpen((v) => !v);
              }
            }}
            title="Account Menu (Theme, Passkeys, Settings, Sign Out)"
            style={{
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
              background: profileMenuOpen ? "rgba(255,255,255,0.06)" : "transparent",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            }}
            onMouseLeave={(e) => {
              if (!profileMenuOpen) {
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            <div style={{
              width: "30px", height: "30px", borderRadius: "50%",
              background: "rgba(0,60,51,0.6)",
              border: "1px solid rgba(0,150,100,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px", fontWeight: 600, color: "#4ade80", flexShrink: 0,
            }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: "12.5px", fontWeight: 500, color: "rgba(255,255,255,0.9)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                fontFamily: "'Inter', sans-serif",
              }}>{currentUser.name}</div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }}
              title="Sign out directly"
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "rgba(255,255,255,0.3)", display: "flex",
                alignItems: "center", justifyContent: "center",
                padding: "4px", borderRadius: "4px", transition: "color 0.12s", flexShrink: 0,
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.8)"}
              onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── RIGHT CONTENT AREA ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* ── TOP HEADER ── */}
        <header className="top-header" style={{
          height: "52px", display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "0 24px",
          background: isDark ? "rgba(18, 19, 25, 0.95)" : "rgba(255,255,255,0.95)",
          backdropFilter: "saturate(180%) blur(16px)",
          WebkitBackdropFilter: "saturate(180%) blur(16px)",
          borderBottom: isDark ? "1px solid #232532" : "1px solid #e5e7eb",
          position: "sticky", top: 0, zIndex: 100,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              className="hamburger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: "none", border: "none", cursor: "pointer", color: isDark ? "#f3f4f8" : "#17171c",
                alignItems: "center", padding: "4px", borderRadius: "4px",
              }}
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu size={20} />
            </button>
            <span style={{
              fontFamily: "'Space Grotesk', 'Inter', sans-serif",
              fontSize: "16px", fontWeight: 500, color: isDark ? "#f3f4f8" : "#17171c", letterSpacing: "-0.32px",
            }}>
              {currentLabel}
            </span>
          </div>

          {/* Right cluster */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

            {/* Language Selector Dropdown (LEFT to dark/light toggle) */}
            <div ref={langDropdownRef} style={{ position: "relative" }}>
              <button
                onClick={() => setLangDropdownOpen((v) => !v)}
                title="Change language / భాష మార్చండి / भाषा बदलें"
                style={{
                  height: "34px",
                  padding: "0 10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: isDark ? "rgba(255,255,255,0.06)" : "transparent",
                  border: isDark ? "1px solid #282a3a" : "1px solid #e5e7eb",
                  borderRadius: "20px",
                  cursor: "pointer",
                  color: isDark ? "#f3f4f8" : "#17171c",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = isDark ? "#383b4e" : "#d9d9dd";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isDark ? "#282a3a" : "#e5e7eb";
                }}
                aria-label="Select Language"
              >
                <Globe size={14} style={{ color: isDark ? "#34d399" : "#003c33" }} />
                <span style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.2px" }}>
                  {LANGUAGE_OPTIONS.find((o) => o.code === lang)?.short || "EN"}
                </span>
                <ChevronDown
                  size={12}
                  style={{
                    color: isDark ? "#7e8194" : "#93939f",
                    transform: langDropdownOpen ? "rotate(180deg)" : "none",
                    transition: "transform 0.15s",
                  }}
                />
              </button>

              {langDropdownOpen && (
                <div
                  className="lang-dropdown-menu"
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 8px)",
                    background: isDark ? "#171822" : "#ffffff",
                    border: isDark ? "1px solid #282a3a" : "1px solid #e5e7eb",
                    borderRadius: "10px",
                    boxShadow: isDark
                      ? "0 10px 30px rgba(0,0,0,0.5)"
                      : "0 8px 24px rgba(20,20,19,0.1)",
                    padding: "6px",
                    minWidth: "155px",
                    zIndex: 100,
                  }}
                >
                  <div
                    style={{
                      padding: "6px 8px 4px",
                      fontSize: "10px",
                      fontFamily: "'JetBrains Mono', monospace",
                      textTransform: "uppercase",
                      letterSpacing: "0.2px",
                      color: isDark ? "#7e8194" : "#93939f",
                    }}
                  >
                    {t("language") || "Language"}
                  </div>
                  {LANGUAGE_OPTIONS.map((opt) => {
                    const active = lang === opt.code;
                    return (
                      <button
                        key={opt.code}
                        onClick={() => {
                          setLanguage(opt.code);
                          setLangDropdownOpen(false);
                        }}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 10px",
                          borderRadius: "6px",
                          border: "none",
                          background: active
                            ? (isDark ? "rgba(52,211,153,0.12)" : "rgba(0,60,51,0.06)")
                            : "transparent",
                          color: active
                            ? (isDark ? "#34d399" : "#003c33")
                            : (isDark ? "#f3f4f8" : "#17171c"),
                          fontWeight: active ? 600 : 400,
                          fontSize: "13px",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "background 0.12s",
                        }}
                      >
                        <span style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "13px", fontWeight: active ? 600 : 500 }}>
                            {opt.nativeLabel}
                          </span>
                          <span
                            style={{
                              fontSize: "10px",
                              color: isDark ? "#7e8194" : "#93939f",
                            }}
                          >
                            {opt.label}
                          </span>
                        </span>
                        {active && (
                          <Check
                            size={14}
                            style={{ color: isDark ? "#34d399" : "#003c33" }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              style={{
                width: "34px", height: "34px", display: "flex", alignItems: "center",
                justifyContent: "center", background: isDark ? "rgba(255,255,255,0.06)" : "transparent",
                border: isDark ? "1px solid #282a3a" : "1px solid #e5e7eb", borderRadius: "50%",
                cursor: "pointer", color: isDark ? "#fbbf24" : "#616161", transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = isDark ? "#fbbf24" : "#d9d9dd";
                e.currentTarget.style.color = isDark ? "#fde68a" : "#17171c";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = isDark ? "#282a3a" : "#e5e7eb";
                e.currentTarget.style.color = isDark ? "#fbbf24" : "#616161";
              }}
              aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Notification bell */}
            <div style={{ position: "relative" }}>
              <button
                onClick={toggleNotif}
                style={{
                  width: "34px", height: "34px", display: "flex", alignItems: "center",
                  justifyContent: "center", background: isDark ? "rgba(255,255,255,0.06)" : "transparent",
                  border: isDark ? "1px solid #282a3a" : "1px solid #e5e7eb", borderRadius: "50%",
                  cursor: "pointer", color: isDark ? "#b2b5c5" : "#616161", transition: "border-color 0.15s", position: "relative",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = isDark ? "#383b4e" : "#d9d9dd"; e.currentTarget.style.color = isDark ? "#f3f4f8" : "#17171c"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = isDark ? "#282a3a" : "#e5e7eb"; e.currentTarget.style.color = isDark ? "#b2b5c5" : "#616161"; }}
                aria-label="Notifications"
              >
                <Bell size={14} />
                {unread > 0 && (
                  <span style={{
                    position: "absolute", top: "1px", right: "1px",
                    width: "8px", height: "8px", background: "#ff7759",
                    borderRadius: "50%", border: isDark ? "1.5px solid #171822" : "1.5px solid #ffffff",
                  }} />
                )}
              </button>

              {/* Notification dropdown */}
              {showNotif && (
                <div className="notif-dropdown" style={{
                  position: "absolute", right: 0, top: "calc(100% + 8px)",
                  width: "310px", background: isDark ? "#171822" : "#ffffff",
                  border: isDark ? "1px solid #282a3a" : "1px solid #e5e7eb",
                  borderRadius: "8px", boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(0,0,0,0.1)",
                  zIndex: 100, overflow: "hidden",
                }}>
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 16px", borderBottom: isDark ? "1px solid #232532" : "1px solid #e5e7eb",
                  }}>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "11px", fontWeight: 500, color: isDark ? "#7e8194" : "#93939f",
                      textTransform: "uppercase", letterSpacing: "0.22px",
                    }}>Notifications</span>
                    <button
                      onClick={() => setShowNotif(false)}
                      className="no-min-height"
                      style={{ background: "none", border: "none", cursor: "pointer", color: isDark ? "#7e8194" : "#93939f", display: "flex" }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div style={{ maxHeight: "280px", overflowY: "auto" }}>
                    {userNotifs.length === 0 ? (
                      <p style={{ padding: "28px 18px", textAlign: "center", fontSize: "13px", color: isDark ? "#7e8194" : "#93939f" }}>
                        No notifications
                      </p>
                    ) : userNotifs.map((n) => (
                      <div key={n.id} style={{
                        padding: "12px 16px", borderBottom: isDark ? "1px solid #20222d" : "1px solid #f2f2f2",
                        background: !n.isRead ? (isDark ? "rgba(52,211,153,0.08)" : "rgba(0,60,51,0.04)") : "transparent",
                        borderLeft: !n.isRead ? (isDark ? "3px solid #34d399" : "3px solid #003c33") : "3px solid transparent",
                      }}>
                        <div style={{ fontSize: "13px", fontWeight: 500, color: isDark ? "#f3f4f8" : "#17171c", fontFamily: "'Inter', sans-serif" }}>{n.title}</div>
                        <div style={{ fontSize: "12px", color: isDark ? "#b2b5c5" : "#616161", marginTop: "2px", lineHeight: 1.4, fontFamily: "'Inter', sans-serif" }}>{n.message}</div>
                        <div style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: "10px", color: isDark ? "#7e8194" : "#93939f", marginTop: "4px",
                          textTransform: "uppercase", letterSpacing: "0.2px",
                        }}>
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
                padding: "7px 14px", background: isDark ? "#232534" : "#17171c", color: "#ffffff",
                border: isDark ? "1px solid #34374b" : "none", borderRadius: "32px", fontSize: "12.5px", fontWeight: 500,
                cursor: "pointer", letterSpacing: "0", transition: "all 0.15s",
                fontFamily: "'Inter', sans-serif",
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            >
              <LogOut size={13} />
              {t("signOut") || "Sign Out"}
            </button>
          </div>
        </header>

        {/* ── Network Resilience Banners ── */}
        {!isOnline && (
          <div
            className="offline-banner"
            style={{
              background: "#c07000", color: "#ffffff",
              padding: "8px 16px", fontSize: "13px", fontWeight: 500,
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <span>⚡ You are currently offline. Showing cached village directory.</span>
          </div>
        )}

        {showReconnectedBanner && (
          <div
            className="offline-banner"
            style={{
              background: "#003c33", color: "#ffffff",
              padding: "8px 16px", fontSize: "13px", fontWeight: 500,
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <span>✓ Connection restored. Data synchronized in real-time.</span>
          </div>
        )}

        {/* ── Main content ── */}
        <main className="app-main-content" style={{ flex: 1, overflowY: "auto", background: isDark ? "#0d0e12" : "#f8f8f8" }}>
          {children}
        </main>
      </div>

      {/* ── BOTTOM NAVIGATION — Mobile only ── */}
      <nav className="bottom-nav" aria-label="Mobile navigation" style={{
        background: isDark ? "#0d0e12" : "#181715",
        borderTop: isDark ? "1px solid #232532" : "1px solid #252320"
      }}>
        {bottomNavItems.map((item) => {
          const isActive = location.pathname === item.to ||
            (item.to !== "/" && location.pathname.startsWith(item.to));
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`bottom-nav-item no-min-height ${isActive ? "active" : ""}`}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              style={isActive ? { color: isDark ? "#34d399" : "#4ade80" } : {}}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Sign Out Confirmation */}
      <ConfirmModal
        isOpen={showSignOutConfirm}
        title={t("signOut") || "Sign Out"}
        message={t("signOutConfirm") || "Are you sure you want to sign out of your account?"}
        confirmText={t("yesSignOut") || "Yes, Sign Out"}
        cancelText={t("cancel") || "Cancel"}
        variant="danger"
        onCancel={() => setShowSignOutConfirm(false)}
        onConfirm={doLogout}
      />
    </div>
  );
}
