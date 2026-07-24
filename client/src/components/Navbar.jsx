import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { Bell, Sun, Moon, LogOut, User, Menu, X, Landmark } from "lucide-react";

export default function Navbar({ darkMode, setDarkMode }) {
  const { currentUser, logout } = useAuth();
  const { notifications, markNotificationsAsRead } = useSocket();
  const navigate = useNavigate();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter(
    (n) => currentUser && n.recipient === currentUser.id && !n.isRead
  ).length;

  const handleLogout = () => {
    logout();
    setShowNotifMenu(false);
    navigate("/");
  };

  const handleToggleNotif = () => {
    setShowNotifMenu(!showNotifMenu);
    if (!showNotifMenu) {
      markNotificationsAsRead();
    }
  };

  const userNotifications = notifications.filter(
    (n) => currentUser && n.recipient === currentUser.id
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/85 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/85">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
              <Landmark className="h-6 w-6" />
              <span className="text-xl tracking-tight">Grama Seva</span>
            </Link>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-6">
            {currentUser && (
              <>
                {currentUser.role === "Customer" && (
                  <Link
                    to="/customer-dashboard"
                    className="text-sm font-medium text-gray-700 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400"
                  >
                    Customer Dashboard
                  </Link>
                )}
                {currentUser.role === "Worker" && (
                  <Link
                    to="/worker-dashboard"
                    className="text-sm font-medium text-gray-700 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400"
                  >
                    Worker Dashboard
                  </Link>
                )}
                {currentUser.role === "Admin" && (
                  <Link
                    to="/admin-dashboard"
                    className="text-sm font-medium text-gray-700 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400"
                  >
                    Admin Panel
                  </Link>
                )}
              </>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Notification Bell */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={handleToggleNotif}
                  className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifMenu && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl border border-gray-100 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                    <div className="border-b border-gray-100 px-4 py-2 font-semibold text-gray-800 dark:border-slate-800 dark:text-slate-200">
                      Notifications
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {userNotifications.length === 0 ? (
                        <p className="px-4 py-6 text-center text-sm text-gray-400">No new messages</p>
                      ) : (
                        userNotifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`border-b border-gray-50 px-4 py-3 last:border-0 dark:border-slate-800/50 ${
                              !notif.isRead ? "bg-emerald-50/50 dark:bg-emerald-950/20" : ""
                            }`}
                          >
                            <h4 className="text-xs font-semibold text-gray-900 dark:text-slate-100">
                              {notif.title}
                            </h4>
                            <p className="mt-1 text-xs text-gray-600 dark:text-slate-300">
                              {notif.message}
                            </p>
                            <span className="mt-1 block text-[10px] text-gray-400">
                              {new Date(notif.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Auth Buttons */}
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 dark:bg-emerald-950/30">
                  <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    {currentUser.name} ({currentUser.role})
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-lg bg-red-50 px-3.5 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 shadow-sm"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            {currentUser && (
              <button
                onClick={handleToggleNotif}
                className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-col gap-3">
            {currentUser ? (
              <>
                <div className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300">
                  <User className="h-4 w-4" />
                  <span className="text-xs font-semibold">
                    {currentUser.name} ({currentUser.role})
                  </span>
                </div>
                {currentUser.role === "Customer" && (
                  <Link
                    to="/customer-dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 py-1"
                  >
                    Customer Dashboard
                  </Link>
                )}
                {currentUser.role === "Worker" && (
                  <Link
                    to="/worker-dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 py-1"
                  >
                    Worker Dashboard
                  </Link>
                )}
                {currentUser.role === "Admin" && (
                  <Link
                    to="/admin-dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 py-1"
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 rounded-lg bg-red-50 py-2 text-sm font-semibold text-red-600 dark:bg-red-950/30 dark:text-red-400"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg bg-emerald-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
