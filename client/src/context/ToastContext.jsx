import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext();

let toastIdCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = ++toastIdCounter;
    setToasts(prev => [...prev, { id, message, type, entering: true }]);

    // Auto-dismiss
    timersRef.current[id] = setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
        delete timersRef.current[id];
      }, 300);
    }, duration);

    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};

function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      pointerEvents: 'none',
    }}>
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const typeStyles = {
    success: {
      background: '#ffffff',
      borderLeft: '4px solid #34c759',
      icon: '✓',
      iconBg: 'rgba(52,199,89,0.12)',
      iconColor: '#248a3d',
    },
    error: {
      background: '#ffffff',
      borderLeft: '4px solid #ff3b30',
      icon: '✕',
      iconBg: 'rgba(255,59,48,0.10)',
      iconColor: '#c0392b',
    },
    info: {
      background: '#ffffff',
      borderLeft: '4px solid #007aff',
      icon: 'ℹ',
      iconBg: 'rgba(0,122,255,0.10)',
      iconColor: '#0066cc',
    },
    warning: {
      background: '#ffffff',
      borderLeft: '4px solid #ff9500',
      icon: '⚠',
      iconBg: 'rgba(255,149,0,0.12)',
      iconColor: '#c07000',
    },
  };

  const s = typeStyles[toast.type] || typeStyles.success;

  return (
    <div
      style={{
        background: s.background,
        borderLeft: s.borderLeft,
        borderRadius: '12px',
        padding: '14px 18px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minWidth: '300px',
        maxWidth: '440px',
        pointerEvents: 'auto',
        animation: toast.exiting
          ? 'toastSlideOut 0.3s ease-in forwards'
          : 'toastSlideIn 0.3s ease-out forwards',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div style={{
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        background: s.iconBg,
        color: s.iconColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: 700,
        flexShrink: 0,
      }}>
        {s.icon}
      </div>

      <div style={{
        flex: 1,
        fontSize: '14px',
        fontWeight: 500,
        color: '#1d1d1f',
        lineHeight: 1.4,
      }}>
        {toast.message}
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#8e8b82',
          fontSize: '16px',
          padding: '2px 4px',
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        ×
      </button>

      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes toastSlideOut {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

export const useToast = () => useContext(ToastContext);
