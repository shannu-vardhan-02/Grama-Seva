import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../api';

const SocketContext = createContext();

// Keep the Haversine distance function as a named export (pages import it)
export function getDistance(coords1, coords2) {
  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const SocketProvider = ({ children }) => {
  const { currentUser, users, updateWorkerProfile } = useAuth();
  
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeDispatch, setActiveDispatch] = useState(null);
  const socketRef = useRef(null);

  // Fetch data from API
  const fetchBookings = useCallback(async () => {
    try {
      const res = await api.get('/api/bookings');
      setBookings(res.data);
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    }
  }, []);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await api.get('/api/reviews');
      setReviews(res.data);
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/api/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  }, []);

  // Connect Socket.io and fetch data when user logs in
  useEffect(() => {
    if (!currentUser) {
      // Disconnect socket on logout
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setBookings([]);
      setReviews([]);
      setNotifications([]);
      setActiveDispatch(null);
      return;
    }

    // Fetch initial data
    fetchBookings();
    fetchReviews();
    fetchNotifications();

    // Connect socket
    const token = localStorage.getItem('gs_token');
    if (!token) return;

    const API_URL =
      import.meta.env.VITE_API_URL ||
      (typeof window !== "undefined" && !window.location.hostname.includes("localhost")
        ? "https://grama-seva-api.onrender.com"
        : "http://localhost:3000");

    const socket = io(API_URL, {
      auth: { token },
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('booking:new', (booking) => {
      setBookings(prev => {
        // Add if not already present
        if (prev.some(b => (b._id || b.id) === (booking._id || booking.id))) return prev;
        return [booking, ...prev];
      });
    });

    socket.on('booking:updated', (booking) => {
      setBookings(prev => prev.map(b => (b._id || b.id) === (booking._id || booking.id) ? booking : b));
    });

    socket.on('notification:new', (notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    socket.on('users:updated', () => {
      // Trigger a refetch of users in AuthContext — we can't do that directly,
      // but the AuthContext refetches when currentUser changes. For now, just refetch bookings.
      fetchBookings();
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [currentUser]); // Only reconnect when user changes

  // Track active dispatch for customer
  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === 'Customer') {
      const pending = bookings.find(b => 
        (b.customer === (currentUser._id || currentUser.id) || b.customer?._id === (currentUser._id || currentUser.id)) && 
        ['Requested', 'Accepted', 'In Progress'].includes(b.status)
      );
      setActiveDispatch(pending || null);
    }
  }, [bookings, currentUser]);

  // Get incoming dispatches for workers
  const getIncomingDispatches = () => {
    if (!currentUser || currentUser.role !== 'Worker' || !currentUser.workerProfile?.isAvailable || !currentUser.workerProfile?.isVerified) {
      return [];
    }
    return bookings.filter(b => {
      if (b.status !== 'Requested' || b.worker) return false;
      if (b.serviceCategory !== currentUser.workerProfile.skill) return false;
      const dist = getDistance(
        currentUser.workerProfile.location.coordinates,
        b.location.coordinates
      );
      return dist <= currentUser.workerProfile.serviceRadius;
    });
  };

  const createBooking = async (category, description, coordinates, address) => {
    try {
      const res = await api.post('/api/bookings', { serviceCategory: category, description, coordinates, address });
      setBookings(prev => [res.data, ...prev]);
      await fetchNotifications(); // Refresh notifications
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || err.response?.data?.error || 'Failed to create booking');
    }
  };

  const acceptBooking = async (bookingId, workerId) => {
    // workerId is ignored — the API determines worker from auth token
    try {
      const res = await api.patch(`/api/bookings/${bookingId}/accept`);
      setBookings(prev => prev.map(b => (b._id || b.id) === bookingId ? res.data : b));
      await fetchNotifications();
    } catch (err) {
      console.error('Failed to accept booking', err);
    }
  };

  const startBooking = async (bookingId) => {
    try {
      const res = await api.patch(`/api/bookings/${bookingId}/start`);
      setBookings(prev => prev.map(b => (b._id || b.id) === bookingId ? res.data : b));
      await fetchNotifications();
    } catch (err) {
      console.error('Failed to start booking', err);
    }
  };

  const completeBooking = async (bookingId) => {
    try {
      const res = await api.patch(`/api/bookings/${bookingId}/complete`);
      setBookings(prev => prev.map(b => (b._id || b.id) === bookingId ? res.data : b));
      await fetchNotifications();
    } catch (err) {
      console.error('Failed to complete booking', err);
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      const res = await api.patch(`/api/bookings/${bookingId}/cancel`);
      setBookings(prev => prev.map(b => (b._id || b.id) === bookingId ? res.data : b));
      await fetchNotifications();
    } catch (err) {
      console.error('Failed to cancel booking', err);
    }
  };

  const submitReview = async (bookingId, rating, comment) => {
    try {
      const res = await api.post('/api/reviews', { bookingId, rating, comment });
      setReviews(prev => [res.data, ...prev]);
      await fetchNotifications();
    } catch (err) {
      throw new Error(err.response?.data?.message || err.response?.data?.error || 'Failed to submit review');
    }
  };

  const submitWorkerReview = async (workerId, rating, comment) => {
    try {
      const res = await api.post(`/api/users/${workerId}/reviews`, { rating, comment });
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || err.response?.data?.error || 'Failed to submit review');
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      await api.patch('/api/notifications/read');
      setNotifications(prev => prev.map(n => 
        n.recipient === (currentUser._id || currentUser.id) ? { ...n, isRead: true } : n
      ));
    } catch (err) {
      console.error('Failed to mark notifications as read', err);
    }
  };

  return (
    <SocketContext.Provider value={{ bookings, reviews, notifications, activeDispatch, getIncomingDispatches, createBooking, acceptBooking, startBooking, completeBooking, cancelBooking, submitReview, submitWorkerReview, markNotificationsAsRead }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
