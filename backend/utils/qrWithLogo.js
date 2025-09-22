const QRCode = require('qrcode');
const { createCanvas, loadImage } = require('canvas');

async function generateQRWithLogo(text, logoPath = null) {
  try {
    // Generate QR code as buffer
    const qrBuffer = await QRCode.toBuffer(text, {
      errorCorrectionLevel: 'H', // High error correction for logo overlay
      type: 'png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 300
    });

    if (!logoPath) {
      // No logo, return base64 of QR code
      return `data:image/png;base64,${qrBuffer.toString('base64')}`;
    }

    // Load QR code and logo images
    const qrImage = await loadImage(qrBuffer);
    const logoImage = await loadImage(logoPath);

    // Create canvas
    const canvas = createCanvas(qrImage.width, qrImage.height);
    const ctx = canvas.getContext('2d');

    // Draw QR code
    ctx.drawImage(qrImage, 0, 0);

    // Calculate logo size (about 25% of QR code size for larger appearance)
    const logoSize = Math.min(qrImage.width, qrImage.height) * 0.25;
    const logoX = (qrImage.width - logoSize) / 2;
    const logoY = (qrImage.height - logoSize) / 2;

    // Add white background behind logo for better visibility
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(logoX - 4, logoY - 4, logoSize + 8, logoSize + 8);

    // Draw logo with sharp edges (no clipping)
    ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);

    // Add white border around logo (rectangular)
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(logoX - 2, logoY - 2, logoSize + 4, logoSize + 4);

    // Return base64 data URL
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error generating QR with logo:', error);
    // Fallback to regular QR code
    return await QRCode.toDataURL(text);
  }
}

module.exports = { generateQRWithLogo };