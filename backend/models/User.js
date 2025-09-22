const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z0-9_-]+$/.test(v);
      },
      message: 'Username can only contain letters, numbers, hyphens, and underscores'
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return validator.isEmail(v);
      },
      message: 'Please provide a valid email address'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    validate: {
      validator: function(v) {
        // Strong password: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
        return validator.isStrongPassword(v, {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        });
      },
      message: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  accountLocked: {
    type: Boolean,
    default: false
  },
  lockUntil: {
    type: Date
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    // Increased salt rounds for better security
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  if (this.accountLocked && this.lockUntil > Date.now()) {
    throw new Error('Account is temporarily locked due to too many failed login attempts');
  }

  const isMatch = await bcrypt.compare(candidatePassword, this.password);

  if (!isMatch) {
    this.failedLoginAttempts += 1;

    // Lock account after 5 failed attempts
    if (this.failedLoginAttempts >= 5) {
      this.accountLocked = true;
      this.lockUntil = Date.now() + 30 * 60 * 1000; // 30 minutes
    }

    await this.save();
    return false;
  }

  // Reset failed attempts on successful login
  if (this.failedLoginAttempts > 0) {
    this.failedLoginAttempts = 0;
    this.accountLocked = false;
    this.lockUntil = undefined;
  }

  this.lastLogin = new Date();
  await this.save();

  return true;
};

module.exports = mongoose.model('User', userSchema);