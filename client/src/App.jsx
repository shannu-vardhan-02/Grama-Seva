import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { ToastProvider } from "./context/ToastContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AppLayout from "./components/AppLayout";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import BookService from "./pages/BookService";
import ActiveJob from "./pages/ActiveJob";
import Reviews from "./pages/Reviews";
import VettingQueue from "./pages/VettingQueue";
import ManageUsers from "./pages/ManageUsers";
import BookingsLog from "./pages/BookingsLog";
import Settings from "./pages/Settings";

const ROLE_ACCESS = {
  Customer: ["/dashboard", "/book-service", "/active-job", "/reviews", "/settings"],
  Worker: ["/dashboard", "/active-job", "/reviews", "/settings"],
  Admin: ["/dashboard", "/book-service", "/active-job", "/reviews", "/vetting-queue", "/users", "/bookings", "/settings"],
};

// Route protector verifying role permissions
function ProtectedRoute({ children, path }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  const allowedPaths = ROLE_ACCESS[currentUser.role] || [];
  if (!allowedPaths.includes(path)) {
    // Redirect role to default allowed path
    return <Navigate to="/dashboard" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />

      {/* Unified Dashboards and Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute path="/dashboard">
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/book-service"
        element={
          <ProtectedRoute path="/book-service">
            <BookService />
          </ProtectedRoute>
        }
      />
      <Route
        path="/active-job"
        element={
          <ProtectedRoute path="/active-job">
            <ActiveJob />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reviews"
        element={
          <ProtectedRoute path="/reviews">
            <Reviews />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute path="/settings">
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Admin specific pages */}
      <Route
        path="/vetting-queue"
        element={
          <ProtectedRoute path="/vetting-queue">
            <VettingQueue />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute path="/users">
            <ManageUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings"
        element={
          <ProtectedRoute path="/bookings">
            <BookingsLog />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "268660327430-78mr3oh6eomhjtcbai9fvm35v1v5ogfq.apps.googleusercontent.com"}>
      <AuthProvider>
        <SocketProvider>
          <ToastProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </ToastProvider>
        </SocketProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
