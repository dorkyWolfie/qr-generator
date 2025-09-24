const validator = require('validator');
const sanitizeHtml = require('sanitize-html');

// URL validation for redirects
const isValidRedirectUrl = (url) => {
  try {
    // Basic URL validation
    if (!validator.isURL(url, {
      protocols: ['http', 'https'],
      require_protocol: true,
      require_valid_protocol: true,
      allow_underscores: false
    })) {
      return false;
    }

    const parsed = new URL(url);

    // Blocked domains (add more as needed)
    const blockedDomains = [
      'malicious-site.com',
      'phishing-site.com',
      // Add known malicious domains
    ];

    // Blocked TLDs that are commonly used for malicious purposes
    const blockedTlds = [
      '.tk', '.ml', '.ga', '.cf'
    ];

    // Check if domain is blocked
    if (blockedDomains.includes(parsed.hostname.toLowerCase())) {
      return false;
    }

    // Check if TLD is blocked
    if (blockedTlds.some(tld => parsed.hostname.toLowerCase().endsWith(tld))) {
      return false;
    }

    // Prevent localhost redirects in production
    if (process.env.NODE_ENV === 'production') {
      const localhostPatterns = [
        'localhost',
        '127.0.0.1',
        '0.0.0.0',
        '::1'
      ];

      if (localhostPatterns.some(pattern => parsed.hostname.includes(pattern))) {
        return false;
      }
    }

    // Prevent redirects to IP addresses in production
    if (process.env.NODE_ENV === 'production') {
      // Simple IP regex check
      const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
      if (ipRegex.test(parsed.hostname)) {
        return false;
      }
    }

    return true;
  } catch (error) {
    return false;
  }
};

// Sanitize user input
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'discard'
  }).trim();
};

// Validate and sanitize shortId
const isValidShortId = (shortId) => {
  if (!shortId || typeof shortId !== 'string') return false;

  // Only allow alphanumeric, hyphens, and underscores
  const shortIdRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return shortIdRegex.test(shortId);
};

// Validate email format
const isValidEmail = (email) => {
  return validator.isEmail(email, {
    allow_utf8_local_part: false,
    require_tld: true,
    ignore_max_length: false
  });
};

// Strong password validation
const isStrongPassword = (password) => {
  return validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  });
};

// Rate limiting configuration
const rateLimitConfig = {
  // General API rate limiting
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Rate limiting for auth endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 auth attempts per windowMs
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Rate limiting for QR code creation
  qrCreation: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 500, // limit each IP to 500 QR codes per hour
    message: 'Too many QR codes created, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  }
};

module.exports = {
  isValidRedirectUrl,
  sanitizeInput,
  isValidShortId,
  isValidEmail,
  isStrongPassword,
  rateLimitConfig
};