import mongoose from 'mongoose';

// Each document represents one passkey registered by one user on one device.
// A user can have multiple passkeys (e.g. phone + laptop + hardware key).
const PasskeySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  // base64url-encoded credential ID (used to look up the correct passkey on login)
  credentialID: {
    type: String,
    required: true,
    unique: true,
  },
  // base64-encoded COSE public key Buffer from the authenticator
  credentialPublicKey: {
    type: String,
    required: true,
  },
  // Signature counter — incremented on each use to detect cloned authenticators
  counter: {
    type: Number,
    required: true,
    default: 0,
  },
  // "singleDevice" | "multiDevice" (multiDevice = synced passkey e.g. iCloud Keychain)
  deviceType: {
    type: String,
    enum: ['singleDevice', 'multiDevice'],
    default: 'singleDevice',
  },
  // Whether the passkey is backed up to cloud (e.g. iCloud / Google Password Manager)
  backedUp: {
    type: Boolean,
    default: false,
  },
  // Transport hints: "internal" (biometric), "usb", "nfc", "ble", "hybrid"
  transports: [{ type: String }],
  // Human-readable label the user can set (e.g. "MacBook Touch ID", "Pixel Phone")
  label: {
    type: String,
    default: 'My Passkey',
    maxlength: 64,
  },
  createdAt: { type: Date, default: Date.now },
  lastUsedAt: { type: Date },
});

const Passkey = mongoose.model('Passkey', PasskeySchema);
export default Passkey;
