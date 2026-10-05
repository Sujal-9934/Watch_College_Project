const path = require('path');
const fs = require('fs');
const { asyncHandler } = require('../middleware/errorHandler');

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Allowed image types
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Sanitize filename: keep extension, replace rest with timestamp + random
 */
function sanitizeFilename(originalName) {
  const ext = path.extname(originalName) || '.jpg';
  const base = Date.now() + '-' + Math.random().toString(36).slice(2, 9);
  return base + ext.toLowerCase();
}

// @desc    Upload image (admin)
// @route   POST /api/admin/upload
// @access  Private/Admin
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.files || !req.files.image) {
    return res.status(400).json({
      success: false,
      message: 'No image file uploaded. Use field name "image".',
    });
  }

  const file = req.files.image;

  if (!ALLOWED_MIMES.includes(file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP.',
    });
  }

  if (file.size > MAX_SIZE) {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 5MB.',
    });
  }

  const filename = sanitizeFilename(file.name);
  const filepath = path.join(UPLOAD_DIR, filename);

  await file.mv(filepath);

  const baseUrl = process.env.API_BASE_URL || `${req.protocol}://${req.get('host')}`;
  const imageUrl = `${baseUrl}/uploads/${filename}`;

  res.status(200).json({
    success: true,
    message: 'Image uploaded successfully',
    data: {
      url: imageUrl,
      filename,
    },
  });
});

module.exports = { uploadImage };
