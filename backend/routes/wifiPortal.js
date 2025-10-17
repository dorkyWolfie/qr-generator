const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const WiFiPortal = require('../models/WiFiPortal');
const QRCodeModel = require('../models/QRCode');
const auth = require('../middleware/auth');
const { sanitizeInput, isValidUrl } = require('../utils/security');
const { body, param, validationResult } = require('express-validator');

// Validation middleware
const validatePortalCreation = [
  body('title').trim().notEmpty().isLength({ max: 100 }).withMessage('Title is required and must be less than 100 characters'),
  body('slug').trim().notEmpty().isLength({ min: 3, max: 50 }).matches(/^[a-z0-9-]+$/).withMessage('Slug must be 3-50 characters (lowercase letters, numbers, hyphens)'),
  body('ssid').trim().notEmpty().isLength({ max: 32 }).withMessage('SSID is required and must be less than 32 characters'),
  body('password').custom((value, { req }) => {
    // Password is optional for open networks (nopass)
    if (req.body.security === 'nopass') {
      return true;
    }
    // Password is required for secured networks
    if (!value || value.trim().length === 0) {
      throw new Error('Password is required for secured networks');
    }
    if (value.length > 63) {
      throw new Error('Password must be less than 63 characters');
    }
    return true;
  }),
  body('security').optional().isIn(['WPA', 'WPA2', 'WPA3', 'WEP', 'nopass']).withMessage('Invalid security type'),
  body('instructions').optional().isLength({ max: 1000 }).withMessage('Instructions must be less than 1000 characters')
];

const validatePortalUpdate = [
  body('title').optional().trim().isLength({ max: 100 }).withMessage('Title must be less than 100 characters'),
  body('ssid').optional().trim().isLength({ max: 32 }).withMessage('SSID must be less than 32 characters'),
  body('password').optional().custom((value, { req }) => {
    // Password can be empty for open networks (nopass)
    if (req.body.security === 'nopass') {
      return true;
    }
    if (value && value.length > 63) {
      throw new Error('Password must be less than 63 characters');
    }
    return true;
  }),
  body('security').optional().isIn(['WPA', 'WPA2', 'WPA3', 'WEP', 'nopass']).withMessage('Invalid security type'),
  body('instructions').optional().isLength({ max: 1000 }).withMessage('Instructions must be less than 1000 characters'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean')
];

// Create a new WiFi portal
router.post('/create', auth, validatePortalCreation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, slug, ssid, password, security, instructions } = req.body;

    // Check if slug already exists
    const existingPortal = await WiFiPortal.findOne({ slug: slug.toLowerCase().trim() });
    if (existingPortal) {
      return res.status(400).json({ success: false, message: 'This slug is already taken' });
    }

    // Generate portal URL
    const portalUrl = `${process.env.CLIENT_URL}/wifi/${slug.toLowerCase().trim()}`;

    // Generate QR code for the portal URL
    const qrCodeDataUrl = await QRCode.toDataURL(portalUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 512,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Create WiFi portal
    const wifiPortal = new WiFiPortal({
      userId: req.user._id,
      title: sanitizeInput(title),
      slug: slug.toLowerCase().trim(),
      ssid: sanitizeInput(ssid),
      password: password, // Store as-is for WiFi connection
      security: security || 'WPA2',
      instructions: instructions ? sanitizeInput(instructions) : undefined,
      qrCodeData: qrCodeDataUrl
    });

    await wifiPortal.save();

    res.status(201).json({
      success: true,
      message: 'WiFi portal created successfully',
      portal: {
        portalId: wifiPortal.portalId,
        slug: wifiPortal.slug,
        title: wifiPortal.title,
        ssid: wifiPortal.ssid,
        security: wifiPortal.security,
        instructions: wifiPortal.instructions,
        qrCodeData: wifiPortal.qrCodeData,
        portalUrl,
        visits: wifiPortal.visits,
        isActive: wifiPortal.isActive,
        createdAt: wifiPortal.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating WiFi portal:', error);
    res.status(500).json({ success: false, message: 'Server error while creating WiFi portal' });
  }
});

// Get all portals for authenticated user
router.get('/my-portals', auth, async (req, res) => {
  try {
    const portals = await WiFiPortal.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select('-password'); // Don't send password in list view for security

    const portalsWithUrls = portals.map(portal => ({
      portalId: portal.portalId,
      slug: portal.slug,
      title: portal.title,
      ssid: portal.ssid,
      security: portal.security,
      instructions: portal.instructions,
      qrCodeData: portal.qrCodeData,
      portalUrl: `${process.env.CLIENT_URL}/wifi/${portal.slug}`,
      visits: portal.visits,
      isActive: portal.isActive,
      createdAt: portal.createdAt,
      updatedAt: portal.updatedAt
    }));

    res.json({ success: true, portals: portalsWithUrls });
  } catch (error) {
    console.error('Error fetching portals:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching portals' });
  }
});

// Get single portal by portalId (authenticated, with password)
router.get('/portal/:portalId', auth, async (req, res) => {
  try {
    const { portalId } = req.params;

    const portal = await WiFiPortal.findOne({
      portalId: sanitizeInput(portalId),
      userId: req.user._id
    });

    if (!portal) {
      return res.status(404).json({ success: false, message: 'Portal not found' });
    }

    res.json({
      success: true,
      portal: {
        portalId: portal.portalId,
        slug: portal.slug,
        title: portal.title,
        ssid: portal.ssid,
        password: portal.password, // Include password for owner
        security: portal.security,
        instructions: portal.instructions,
        qrCodeData: portal.qrCodeData,
        portalUrl: `${process.env.CLIENT_URL}/wifi/${portal.slug}`,
        visits: portal.visits,
        isActive: portal.isActive,
        createdAt: portal.createdAt,
        updatedAt: portal.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching portal:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching portal' });
  }
});

// Update portal
router.put('/portal/:portalId', auth, validatePortalUpdate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { portalId } = req.params;
    const updates = req.body;

    const portal = await WiFiPortal.findOne({
      portalId: sanitizeInput(portalId),
      userId: req.user._id
    });

    if (!portal) {
      return res.status(404).json({ success: false, message: 'Portal not found' });
    }

    // Update allowed fields
    if (updates.title !== undefined) portal.title = sanitizeInput(updates.title);
    if (updates.ssid !== undefined) portal.ssid = sanitizeInput(updates.ssid);
    if (updates.password !== undefined) portal.password = updates.password;
    if (updates.security !== undefined) portal.security = updates.security;
    if (updates.instructions !== undefined) portal.instructions = sanitizeInput(updates.instructions);
    if (updates.isActive !== undefined) portal.isActive = updates.isActive;

    await portal.save();

    res.json({
      success: true,
      message: 'Portal updated successfully',
      portal: {
        portalId: portal.portalId,
        slug: portal.slug,
        title: portal.title,
        ssid: portal.ssid,
        password: portal.password,
        security: portal.security,
        instructions: portal.instructions,
        qrCodeData: portal.qrCodeData,
        portalUrl: `${process.env.CLIENT_URL}/wifi/${portal.slug}`,
        visits: portal.visits,
        isActive: portal.isActive,
        createdAt: portal.createdAt,
        updatedAt: portal.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating portal:', error);
    res.status(500).json({ success: false, message: 'Server error while updating portal' });
  }
});

// Delete portal
router.delete('/portal/:portalId', auth, async (req, res) => {
  try {
    const { portalId } = req.params;

    const portal = await WiFiPortal.findOneAndDelete({
      portalId: sanitizeInput(portalId),
      userId: req.user._id
    });

    if (!portal) {
      return res.status(404).json({ success: false, message: 'Portal not found' });
    }

    res.json({ success: true, message: 'Portal deleted successfully' });
  } catch (error) {
    console.error('Error deleting portal:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting portal' });
  }
});

// Check slug availability (public, but rate-limited)
router.get('/check-slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    // Validate slug format
    if (!/^[a-z0-9-]{3,50}$/.test(slug)) {
      return res.json({ available: false, message: 'Invalid slug format' });
    }

    const existing = await WiFiPortal.findOne({ slug: slug.toLowerCase() });
    res.json({ available: !existing });
  } catch (error) {
    console.error('Error checking slug:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Public route: Get portal by slug (for visitors)
router.get('/public/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const portal = await WiFiPortal.findOne({
      slug: sanitizeInput(slug.toLowerCase()),
      isActive: true
    });

    if (!portal) {
      return res.status(404).json({ success: false, message: 'Portal not found or inactive' });
    }

    // Increment visit counter
    portal.visits += 1;
    await portal.save();

    // Return portal info (without userId for privacy)
    res.json({
      success: true,
      portal: {
        title: portal.title,
        ssid: portal.ssid,
        password: portal.password,
        security: portal.security,
        instructions: portal.instructions,
        slug: portal.slug
      }
    });
  } catch (error) {
    console.error('Error fetching public portal:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching portal' });
  }
});

module.exports = router;
