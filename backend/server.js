require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const { rateLimitConfig } = require('./utils/security');

const authRoutes = require('./routes/auth');
const qrRoutes = require('./routes/qr');
const errorHandler = require('./middleware/errorHandler');

const app = express();

connectDB();

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const generalLimiter = rateLimit(rateLimitConfig.general);
const authLimiter = rateLimit(rateLimitConfig.auth);
const qrLimiter = rateLimit(rateLimitConfig.qrCreation);

// Apply general rate limiting to all routes EXCEPT /r/ redirects
app.use((req, res, next) => {
  if (req.path.startsWith('/r/')) {
    // Skip rate limiting for redirect endpoints
    return next();
  }
  return generalLimiter(req, res, next);
});

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use(express.json({ limit: '10mb' })); // Limit JSON payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for rate limiting (if behind reverse proxy)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/qr', qrLimiter, qrRoutes);

app.get('/r/:shortId', async (req, res) => {
  try {
    const QRCodeModel = require('./models/QRCode');
    const { isValidRedirectUrl, sanitizeInput } = require('./utils/security');
    const { shortId } = req.params;

    // Sanitize shortId parameter
    const sanitizedShortId = sanitizeInput(shortId);

    if (!sanitizedShortId) {
      return res.status(400).send('<h1>Invalid QR code identifier</h1>');
    }

    const qrCode = await QRCodeModel.findOne({ shortId: sanitizedShortId, isActive: true });

    if (!qrCode) {
      return res.status(404).send('<h1>QR Code not found or inactive</h1>');
    }

    // Validate the target URL before redirecting
    if (!isValidRedirectUrl(qrCode.targetUrl)) {
      console.warn(`Blocked redirect to potentially malicious URL: ${qrCode.targetUrl}`);
      return res.status(403).send('<h1>Redirect blocked for security reasons</h1>');
    }

    // Increment click counter
    qrCode.clicks += 1;
    await qrCode.save();

    // Safe redirect
    res.redirect(qrCode.targetUrl);
  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).send('<h1>Server error</h1>');
  }
});

app.get('/health', (req, res) => {
  res.json({
    message: 'QR Generator API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Security features enabled`);
});