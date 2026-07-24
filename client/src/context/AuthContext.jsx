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
          localStorage.removeItem('gs_current_user');
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  // Fetch users whenever currentUser changes (and is not null)
  const fetchUsers = useCallback(async () => {
    if (!currentUser) return;
    try {
      const res = await api.get('/api/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('gs_token', token);
    localStorage.setItem('gs_current_user', JSON.stringify(user));
    setCurrentUser(user);
    return user;
  };

  const loginWithGoogle = async (credential) => {
    // credential is the Google ID token string from @react-oauth/google
    const res = await api.post('/api/auth/google', { credential });
    const { token, user } = res.data;
    localStorage.setItem('gs_token', token);
    localStorage.setItem('gs_current_user', JSON.stringify(user));
    setCurrentUser(user);
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
    localStorage.setItem('gs_current_user', JSON.stringify(user));
    setCurrentUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('gs_token');
    localStorage.removeItem('gs_current_user');
    setCurrentUser(null);
    setUsers([]);
  };

  const updateWorkerProfile = async (profileData) => {
    if (!currentUser) return;
    try {
      const res = await api.patch(`/api/users/${currentUser._id || currentUser.id}/profile`, profileData);
      setCurrentUser(res.data);
      // Update in users array too
      setUsers(prev => prev.map(u => (u._id || u.id) === (currentUser._id || currentUser.id) ? res.data : u));
    } catch (err) {
      console.error('Failed to update profile', err);
      throw new Error(err.response?.data?.message || err.response?.data?.error || 'Update failed');
    }
  };

  const deleteUser = async (userId) => {
    if (currentUser && (currentUser._id || currentUser.id) === userId) {
      throw new Error('Cannot delete your own logged-in admin account');
    }
    await api.delete(`/api/users/${userId}`);
    setUsers(prev => prev.filter(u => (u._id || u.id) !== userId));
  };

  const addUser = async (userData) => {
    const { name, email, password, role, phone, workerProfile } = userData;
    const body = { name, email, password, role, phone };
    if (role === 'Worker' && workerProfile) {
      body.workerProfile = workerProfile;
    }
    const res = await api.post('/api/users', body);
    setUsers(prev => [...prev, res.data]);
  };

  const verifyWorker = async (workerUserId, status) => {
    const res = await api.patch(`/api/users/${workerUserId}/verify`, { status });
    setUsers(prev => prev.map(u => (u._id || u.id) === workerUserId ? res.data : u));
    // Also update currentUser if it's the same user (unlikely for admin verifying, but safe)
    if ((currentUser._id || currentUser.id) === workerUserId) {
      setCurrentUser(res.data);
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
    <AuthContext.Provider value={{ currentUser, users, login, loginWithGoogle, register, logout, updateWorkerProfile, deleteUser, addUser, verifyWorker, fetchUsers }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
