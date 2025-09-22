const { body, param, validationResult } = require('express-validator');
const { isValidEmail, isStrongPassword, isValidShortId, isValidRedirectUrl, sanitizeInput } = require('../utils/security');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
const validateRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, hyphens, and underscores')
    .customSanitizer(sanitizeInput),

  body('email')
    .trim()
    .normalizeEmail()
    .custom((value) => {
      if (!isValidEmail(value)) {
        throw new Error('Please provide a valid email address');
      }
      return true;
    }),

  body('password')
    .custom((value) => {
      if (!isStrongPassword(value)) {
        throw new Error('Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character');
      }
      return true;
    }),

  handleValidationErrors
];

// User login validation
const validateLogin = [
  body('email')
    .trim()
    .normalizeEmail()
    .custom((value) => {
      if (!isValidEmail(value)) {
        throw new Error('Please provide a valid email address');
      }
      return true;
    }),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors
];

// QR code creation validation
const validateQRCreation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters')
    .customSanitizer(sanitizeInput),

  body('targetUrl')
    .trim()
    .custom((value) => {
      if (!isValidRedirectUrl(value)) {
        throw new Error('Please provide a valid URL (http/https)');
      }
      return true;
    })
    .customSanitizer(sanitizeInput),

  body('customShortId')
    .optional()
    .custom((value) => {
      if (value && !isValidShortId(value)) {
        throw new Error('Short ID must be 3-20 characters and contain only letters, numbers, hyphens, or underscores');
      }
      return true;
    })
    .customSanitizer(sanitizeInput),

  handleValidationErrors
];

// QR code update validation
const validateQRUpdate = [
  param('id')
    .isMongoId()
    .withMessage('Invalid QR code ID'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters')
    .customSanitizer(sanitizeInput),

  body('targetUrl')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !isValidRedirectUrl(value)) {
        throw new Error('Please provide a valid URL (http/https)');
      }
      return true;
    })
    .customSanitizer(sanitizeInput),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),

  handleValidationErrors
];

// Short ID validation
const validateShortId = [
  param('shortId')
    .custom((value) => {
      if (!isValidShortId(value)) {
        throw new Error('Invalid short ID format');
      }
      return true;
    })
    .customSanitizer(sanitizeInput),

  handleValidationErrors
];

// QR code ID validation
const validateQRId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid QR code ID'),

  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateQRCreation,
  validateQRUpdate,
  validateShortId,
  validateQRId,
  handleValidationErrors
};