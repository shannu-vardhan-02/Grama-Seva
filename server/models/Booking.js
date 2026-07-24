import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerName: { type: String, required: true },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    workerName: { type: String, default: null },
    serviceCategory: { type: String, required: true },
    description: { type: String, required: true },
    location: {
      type: { type: String, default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    address: { type: String, required: true },
    status: {
      type: String,
      enum: ['Requested', 'Accepted', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Requested',
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

BookingSchema.index({ location: '2dsphere' });

BookingSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

const Booking = mongoose.model('Booking', BookingSchema);
export default Booking;
