import Notification from '../models/Notification.js';

export const createNotification = async (io, { recipient, booking, title, message, channel = 'in-app' }) => {
  try {
    const notif = await Notification.create({ recipient, booking, title, message, channel });
    if (io) {
      io.to(`user:${recipient}`).emit('notification:new', notif);
    }
    return notif;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};
