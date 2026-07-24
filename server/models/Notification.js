import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    channel: { type: String, enum: ['in-app', 'email', 'both'], default: 'in-app' },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;
