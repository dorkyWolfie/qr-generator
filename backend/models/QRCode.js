const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const qrCodeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shortId: {
    type: String,
    unique: true,
    default: () => uuidv4().substring(0, 8),
    validate: {
      validator: function(v) {
        // Allow alphanumeric characters, hyphens, and underscores
        // Length between 3 and 20 characters
        return /^[a-zA-Z0-9_-]{3,20}$/.test(v);
      },
      message: 'Short ID must be 3-20 characters and contain only letters, numbers, hyphens, or underscores'
    }
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  targetUrl: {
    type: String,
    required: true,
    trim: true
  },
  qrCodeData: {
    type: String,
    required: true
  },
  logoPath: {
    type: String,
    default: null
  },
  clicks: {
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

qrCodeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('QRCode', qrCodeSchema);