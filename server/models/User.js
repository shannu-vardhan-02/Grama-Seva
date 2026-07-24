import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: {
      type: String,
      required: function () {
        return this.authProvider === 'local';
      },
    },
    role: { type: String, enum: ['Customer', 'Worker', 'Admin'], default: 'Customer' },
    phone: { type: String, default: '' },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    googleId: { type: String, sparse: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    workerProfile: {
      skill: {
        type: String,
        enum: ['electrician', 'mason', 'plumber', 'mechanic', 'carpenter', 'painter', 'cleaning', 'general', 'other'],
        default: 'other',
      },
      experience: { type: Number, default: 0 },
      bio: { type: String, default: '' },
      address: { type: String, default: '' },
      location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] },
      },
      serviceRadius: { type: Number, default: 10 },
      isAvailable: { type: Boolean, default: true },
      isVerified: { type: Boolean, default: false },
      proofOfWork: [
        {
          url: String,
          submissionDate: { type: Date, default: Date.now },
          status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
        },
      ],
      averageRating: { type: Number, default: 0 },
      reviewCount: { type: Number, default: 0 },
      skills: [{ type: String }],
      services: [{ name: { type: String }, price: { type: Number } }],
      gallery: [{ type: String }],
      reviews: [
        {
          customerName: { type: String },
          rating: { type: Number },
          comment: { type: String },
          date: { type: String },
        },
      ],
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

UserSchema.index({ 'workerProfile.location': '2dsphere' });

const User = mongoose.model('User', UserSchema);
export default User;
