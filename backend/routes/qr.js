const express = require('express');
const QRCode = require('qrcode');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const QRCodeModel = require('../models/QRCode');
const auth = require('../middleware/auth');
const { generateQRWithLogo } = require('../utils/qrWithLogo');
const { validateQRCreation, validateQRUpdate, validateShortId, validateQRId } = require('../middleware/validation');

const router = express.Router();

// Helper function to delete logo file
const deleteLogo = async (logoPath) => {
  if (logoPath) {
    try {
      await fs.unlink(logoPath);
      console.log(`Logo file deleted: ${logoPath}`);
    } catch (error) {
      console.error(`Failed to delete logo file: ${logoPath}`, error.message);
    }
  }
};

// Ensure uploads directory exists
const ensureUploadsDir = async () => {
  try {
    await fs.access('uploads/logos/');
  } catch (error) {
    await fs.mkdir('uploads/logos/', { recursive: true });
    console.log('Created uploads/logos/ directory');
  }
};

// Initialize uploads directory
ensureUploadsDir();

// Configure multer for logo uploads with enhanced security
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/logos/')
  },
  filename: function (req, file, cb) {
    // Generate secure filename with timestamp and random string
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedOriginalName = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9]/g, '');
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `logo-${uniqueSuffix}-${sanitizedOriginalName}${extension}`);
  }
});

// Enhanced file filter with stricter validation
const fileFilter = (req, file, cb) => {
  // Allowed MIME types
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  // Allowed file extensions
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  // Check MIME type and extension
  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // Reduced to 2MB for security
    files: 1 // Only allow 1 file
  },
  fileFilter: fileFilter
});

router.post('/create', auth, upload.single('logo'), validateQRCreation, async (req, res) => {
  try {
    const { title, targetUrl, customShortId } = req.body;

    if (!title || !targetUrl) {
      return res.status(400).json({ message: 'Title and target URL are required' });
    }

    const logoPath = req.file ? req.file.path : null;

    // Check if custom shortId is provided and if it already exists
    if (customShortId) {
      const existingQR = await QRCodeModel.findOne({ shortId: customShortId });
      if (existingQR) {
        return res.status(400).json({ message: 'This custom short ID is already taken. Please choose a different one.' });
      }
    }

    const qrCodeRecord = new QRCodeModel({
      userId: req.user._id,
      title,
      targetUrl,
      qrCodeData: 'temp',
      logoPath: logoPath,
      ...(customShortId && { shortId: customShortId })
    });

    const redirectUrl = `${process.env.CLIENT_URL}/r/${qrCodeRecord.shortId}`;
    const qrCodeDataUrl = await generateQRWithLogo(redirectUrl, logoPath);

    qrCodeRecord.qrCodeData = qrCodeDataUrl;
    await qrCodeRecord.save();

    res.status(201).json({
      message: 'QR Code created successfully',
      qrCode: {
        id: qrCodeRecord._id,
        shortId: qrCodeRecord.shortId,
        title: qrCodeRecord.title,
        targetUrl: qrCodeRecord.targetUrl,
        qrCodeData: qrCodeRecord.qrCodeData,
        redirectUrl,
        clicks: qrCodeRecord.clicks,
        isActive: qrCodeRecord.isActive,
        createdAt: qrCodeRecord.createdAt,
        hasLogo: !!qrCodeRecord.logoPath
      }
    });
  } catch (error) {
    // If QR code creation fails and we uploaded a logo, clean it up
    if (logoPath) {
      await deleteLogo(logoPath);
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/my-codes', auth, async (req, res) => {
  try {
    const qrCodes = await QRCodeModel.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    const codesWithRedirectUrl = qrCodes.map(code => ({
      id: code._id,
      shortId: code.shortId,
      title: code.title,
      targetUrl: code.targetUrl,
      qrCodeData: code.qrCodeData,
      redirectUrl: `${process.env.CLIENT_URL}/r/${code.shortId}`,
      clicks: code.clicks,
      isActive: code.isActive,
      createdAt: code.createdAt,
      updatedAt: code.updatedAt,
      hasLogo: !!code.logoPath
    }));

    res.json({ qrCodes: codesWithRedirectUrl });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', auth, validateQRUpdate, async (req, res) => {
  try {
    const { title, targetUrl, isActive } = req.body;
    const qrCodeId = req.params.id;

    const qrCode = await QRCodeModel.findOne({
      _id: qrCodeId,
      userId: req.user._id
    });

    if (!qrCode) {
      return res.status(404).json({ message: 'QR Code not found' });
    }

    if (title !== undefined) qrCode.title = title;
    if (targetUrl !== undefined) qrCode.targetUrl = targetUrl;
    if (isActive !== undefined) qrCode.isActive = isActive;

    await qrCode.save();

    res.json({
      message: 'QR Code updated successfully',
      qrCode: {
        id: qrCode._id,
        shortId: qrCode.shortId,
        title: qrCode.title,
        targetUrl: qrCode.targetUrl,
        qrCodeData: qrCode.qrCodeData,
        redirectUrl: `${process.env.CLIENT_URL}/r/${qrCode.shortId}`,
        clicks: qrCode.clicks,
        isActive: qrCode.isActive,
        createdAt: qrCode.createdAt,
        updatedAt: qrCode.updatedAt,
        hasLogo: !!qrCode.logoPath
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, validateQRId, async (req, res) => {
  try {
    const qrCodeId = req.params.id;

    const qrCode = await QRCodeModel.findOneAndDelete({
      _id: qrCodeId,
      userId: req.user._id
    });

    if (!qrCode) {
      return res.status(404).json({ message: 'QR Code not found' });
    }

    // Delete associated logo file if it exists
    await deleteLogo(qrCode.logoPath);

    res.json({ message: 'QR Code deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check if a shortId is available
router.get('/check-shortid/:shortId', auth, validateShortId, async (req, res) => {
  try {
    const { shortId } = req.params;

    // Validate shortId format
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(shortId)) {
      return res.status(400).json({
        available: false,
        message: 'Short ID must be 3-20 characters and contain only letters, numbers, hyphens, or underscores'
      });
    }

    const existingQR = await QRCodeModel.findOne({ shortId });

    res.json({
      available: !existingQR,
      message: existingQR ? 'This short ID is already taken' : 'This short ID is available'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/redirect/:shortId', async (req, res) => {
  try {
    const { shortId } = req.params;

    const qrCode = await QRCodeModel.findOne({ shortId, isActive: true });

    if (!qrCode) {
      return res.status(404).json({ message: 'QR Code not found or inactive' });
    }

    qrCode.clicks += 1;
    await qrCode.save();

    res.redirect(qrCode.targetUrl);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;