import React, { useEffect } from "react";
import { AlertTriangle, Trash2, X, AlertCircle } from "lucide-react";

/**
 * Reusable Confirmation Modal Component
 * Replaces native browser window.confirm / alerts with a polished design matching Grama Seva.
 */
export default function ConfirmModal({
  isOpen,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger", // "danger" | "warning" | "primary"
  onConfirm,
  onCancel,
  isLoading = false,
}) {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isLoading) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      iconBg: "rgba(198, 69, 69, 0.12)",
      iconColor: "#c64545",
      btnBg: "#c64545",
      btnHover: "#a93636",
      IconComponent: Trash2,
    },
    warning: {
      iconBg: "rgba(255, 149, 0, 0.12)",
      iconColor: "#c07000",
      btnBg: "#cc785c",
      btnHover: "#b6654b",
      IconComponent: AlertTriangle,
    },
    primary: {
      iconBg: "rgba(204, 120, 92, 0.12)",
      iconColor: "#cc785c",
      btnBg: "#cc785c",
      btnHover: "#b6654b",
      IconComponent: AlertCircle,
    },
  };

  const v = variantStyles[variant] || variantStyles.danger;
  const Icon = v.IconComponent;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(24, 23, 21, 0.65)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
        animation: "butterModalBackdrop 0.35s ease-out forwards",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onCancel();
        }
      }}
    >
      <div
        style={{
          background: "var(--confirm-bg, #ffffff)",
          border: "1px solid var(--confirm-border, #e6dfd8)",
          borderRadius: "18px",
          padding: "28px",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 24px 48px rgba(0, 0, 0, 0.28), 0 8px 16px rgba(0, 0, 0, 0.12)",
          animation: "butterModalCard 0.42s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "20px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: v.iconBg,
              color: v.iconColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon size={22} />
          </div>

          <div style={{ flex: 1 }}>
            <h3
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "20px",
                fontWeight: 600,
                color: "var(--confirm-title, #141413)",
                margin: "0 0 6px 0",
              }}
            >
              {title}
            </h3>
            <p style={{ fontSize: "14px", color: "var(--confirm-text, #6c6a64)", margin: 0, lineHeight: 1.5 }}>
              {message}
            </p>
          </div>

          <button
            onClick={onCancel}
            disabled={isLoading}
            style={{
              background: "none",
              border: "none",
              cursor: isLoading ? "not-allowed" : "pointer",
              color: "var(--confirm-text, #8e8b82)",
              padding: "4px",
              display: "flex",
              borderRadius: "6px",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "24px" }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            style={{
              padding: "10px 18px",
              background: "var(--confirm-cancel-bg, #efe9de)",
              color: "var(--confirm-cancel-text, #141413)",
              border: "1px solid var(--confirm-cancel-border, #e6dfd8)",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--confirm-cancel-hover, #e4dcce)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--confirm-cancel-bg, #efe9de)")}
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              padding: "10px 20px",
              background: v.btnBg,
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: isLoading ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              transition: "opacity 0.15s, transform 0.1s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes butterModalBackdrop {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes butterModalCard {
          from { opacity: 0; transform: translateY(22px) scale(0.92); filter: blur(3px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
      `}</style>
    </div>
  );
}
