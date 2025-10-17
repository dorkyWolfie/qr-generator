const mongoose = require('mongoose');
const crypto = require('crypto');

const wifiPortalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  portalId: {
    type: String,
    unique: true,
    default: () => crypto.randomBytes(8).toString('hex'),
    required: true
  },
  slug: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        // Allow alphanumeric characters and hyphens
        // Length between 3 and 50 characters
        return /^[a-z0-9-]{3,50}$/.test(v);
      },
      message: 'Slug must be 3-50 characters and contain only lowercase letters, numbers, and hyphens'
    }
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  ssid: {
    type: String,
    required: true,
    trim: true,
    maxlength: 32 // Standard WiFi SSID max length
  },
  password: {
    type: String,
    required: false, // Optional for open networks (nopass)
    trim: true,
    maxlength: 63, // Standard WPA2 max length
    default: ''
  },
  security: {
    type: String,
    enum: ['WPA', 'WPA2', 'WPA3', 'WEP', 'nopass'],
    default: 'WPA2'
  },
  instructions: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: 'Welcome! Please connect to our WiFi network using the credentials below.'
  },
  qrCodeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QRCode',
    default: null
  },
  qrCodeData: {
    type: String,
    default: null
  },
  visits: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

wifiPortalSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster lookups (slug already has unique index from schema definition)
wifiPortalSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('WiFiPortal', wifiPortalSchema);
