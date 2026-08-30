import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // On mount, check for existing token and load user
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('gs_token');
      if (token) {
        try {
          const res = await api.get('/api/auth/me');
          setCurrentUser(res.data);
        } catch {
          localStorage.removeItem('gs_token');
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  // ── fetchUsers: stable function — does NOT depend on currentUser in closure.
  // The token in localStorage is always up-to-date so the API call is authorised.
  // This avoids the two-render-cycle delay caused by useCallback([currentUser]).
  const fetchUsers = useCallback(async () => {
    if (!localStorage.getItem('gs_token')) return;
    try {
      const res = await api.get('/api/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  }, []); // stable — no deps needed

  // Still run on mount / token-restore so refresh works correctly
  useEffect(() => {
    if (currentUser) fetchUsers();
  }, [currentUser, fetchUsers]);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('gs_token', token);
    setCurrentUser(user);
    // ── Eagerly fetch users immediately — don't wait for the effect cycle ──
    fetchUsers();
    return user;
  };

  const loginWithGoogle = async (credential) => {
    // credential is the Google ID token string from @react-oauth/google
    const res = await api.post('/api/auth/google', { credential });
    const { token, user } = res.data;
    localStorage.setItem('gs_token', token);
    setCurrentUser(user);
    // ── Eagerly fetch users immediately — don't wait for the effect cycle ──
    fetchUsers();
    return user;
  };

  const register = async (userData) => {
    const { name, email, password, role, phone, workerProfile } = userData;
    const body = { name, email, password, role, phone };
    if (role === 'Worker' && workerProfile) {
      body.workerProfile = workerProfile;
    }
    const res = await api.post('/api/auth/register', body);
    const { token, user } = res.data;
    localStorage.setItem('gs_token', token);
    setCurrentUser(user);
    // ── Eagerly fetch users immediately — don't wait for the effect cycle ──
    fetchUsers();
    return user;
  };

  const logout = () => {
    localStorage.removeItem('gs_token');
    setCurrentUser(null);
    setUsers([]);
  };

  const updateWorkerProfile = async (profileData) => {
    if (!currentUser) return;
    const prevUser = { ...currentUser };
    const prevUsers = [...users];
    const targetId = currentUser._id || currentUser.id;

    // 1. Optimistically update local state immediately (0ms UI latency)
    const optimisticUser = {
      ...currentUser,
      ...profileData,
      workerProfile: {
        ...(currentUser.workerProfile || {}),
        ...(profileData.workerProfile || {}),
      },
    };
    setCurrentUser(optimisticUser);
    setUsers(prev => prev.map(u => (u._id || u.id) === targetId ? optimisticUser : u));

    try {
      // 2. Perform backend update in the background
      const res = await api.patch(`/api/users/${targetId}/profile`, profileData);
      setCurrentUser(res.data);
      setUsers(prev => prev.map(u => (u._id || u.id) === targetId ? res.data : u));
      return res.data;
    } catch (err) {
      // 3. Rollback on failure
      setCurrentUser(prevUser);
      setUsers(prevUsers);
      console.error('Failed to update profile, rolled back:', err);
      throw new Error(err.response?.data?.message || err.response?.data?.error || 'Update failed');
    }
  };

  const deleteUser = async (userId) => {
    if (currentUser && (currentUser._id || currentUser.id) === userId) {
      throw new Error('Cannot delete your own logged-in admin account');
    }
    const prevUsers = [...users];

    // 1. Optimistic removal
    setUsers(prev => prev.filter(u => (u._id || u.id) !== userId));

    try {
      // 2. Server delete
      await api.delete(`/api/users/${userId}`);
    } catch (err) {
      // 3. Rollback on error
      setUsers(prevUsers);
      console.error('Failed to delete user, rolled back:', err);
      throw new Error(err.response?.data?.message || 'Delete failed');
    }
  };

  const addUser = async (userData) => {
    const { name, email, password, role, phone, workerProfile } = userData;
    const body = { name, email, password, role, phone };
    if (role === 'Worker' && workerProfile) {
      body.workerProfile = workerProfile;
    }
    const res = await api.post('/api/users', body);
    setUsers(prev => [...prev, res.data]);
    return res.data;
  };

  const verifyWorker = async (workerUserId, status) => {
    const prevUsers = [...users];
    const prevCurrentUser = currentUser ? { ...currentUser } : null;

    // 1. Optimistic verification state update
    const isApproved = status === "Approved";
    setUsers(prev => prev.map(u => {
      if ((u._id || u.id) === workerUserId) {
        return {
          ...u,
          workerProfile: {
            ...(u.workerProfile || {}),
            isVerified: isApproved,
          },
        };
      }
      return u;
    }));

    if (currentUser && (currentUser._id || currentUser.id) === workerUserId) {
      setCurrentUser(prev => ({
        ...prev,
        workerProfile: { ...(prev.workerProfile || {}), isVerified: isApproved },
      }));
    }

    try {
      // 2. Send API request
      const res = await api.patch(`/api/users/${workerUserId}/verify`, { status });
      setUsers(prev => prev.map(u => (u._id || u.id) === workerUserId ? res.data : u));
      if (currentUser && (currentUser._id || currentUser.id) === workerUserId) {
        setCurrentUser(res.data);
      }
      return res.data;
    } catch (err) {
      // 3. Rollback if network/server fails
      setUsers(prevUsers);
      if (prevCurrentUser) setCurrentUser(prevCurrentUser);
      console.error('Failed to verify worker, rolled back:', err);
      throw new Error(err.response?.data?.message || 'Verification update failed');
    }
  };

  const removeWorkerProfileReview = async (workerId, reviewIndex) => {
    const prevUsers = [...users];
    const prevCurrentUser = currentUser ? { ...currentUser } : null;

    // 1. Optimistically update users and currentUser in memory immediately (0ms)
    setUsers(prev => prev.map(u => {
      if ((u._id || u.id) === workerId && u.workerProfile?.reviews) {
        const updatedReviews = u.workerProfile.reviews.filter((_, idx) => idx !== reviewIndex);
        const totalRating = updatedReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0);
        const avg = updatedReviews.length ? totalRating / updatedReviews.length : 0;
        return {
          ...u,
          workerProfile: {
            ...u.workerProfile,
            reviews: updatedReviews,
            reviewCount: updatedReviews.length,
            averageRating: avg,
          },
        };
      }
      return u;
    }));

    if (currentUser && (currentUser._id || currentUser.id) === workerId && currentUser.workerProfile?.reviews) {
      const updatedReviews = currentUser.workerProfile.reviews.filter((_, idx) => idx !== reviewIndex);
      const totalRating = updatedReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0);
      const avg = updatedReviews.length ? totalRating / updatedReviews.length : 0;
      setCurrentUser(prev => ({
        ...prev,
        workerProfile: {
          ...prev.workerProfile,
          reviews: updatedReviews,
          reviewCount: updatedReviews.length,
          averageRating: avg,
        },
      }));
    }

    // 2. If it's a client mock worker, in-memory deletion is done
    if (String(workerId).startsWith("tw-")) {
      return;
    }

    try {
      // 3. Send API delete request to server
      const res = await api.delete(`/api/users/${workerId}/reviews/${reviewIndex}`);
      setUsers(prev => prev.map(u => (u._id || u.id) === workerId ? res.data : u));
      if (currentUser && (currentUser._id || currentUser.id) === workerId) {
        setCurrentUser(res.data);
      }
      return res.data;
    } catch (err) {
      // 4. Rollback on failure
      setUsers(prevUsers);
      if (prevCurrentUser) setCurrentUser(prevCurrentUser);
      console.error('Failed to delete worker profile review, rolled back:', err);
      throw new Error(err.response?.data?.message || 'Failed to delete review');
    }
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f5f5f7', fontFamily: 'SF Pro Text, system-ui, -apple-system, Inter, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '24px', height: '24px', border: '2px solid #0066cc', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <div style={{ fontSize: '15px', color: '#7a7a7a' }}>Loading…</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser, users, login, loginWithGoogle, register, logout, updateWorkerProfile, deleteUser, addUser, verifyWorker, fetchUsers, removeWorkerProfileReview }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
