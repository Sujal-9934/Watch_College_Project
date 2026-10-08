const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { asyncHandler } = require('../middleware/errorHandler');

// Ensure uploads directory exists
const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, '../public/uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Allowed image types
const ALLOWED_MIME_EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
};
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const hasValidImageSignature = (file) => {
  const data = file.data;
  switch (file.mimetype) {
    case 'image/jpeg':
      return data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff;
    case 'image/png':
      return data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    case 'image/gif':
      return data.subarray(0, 6).toString('ascii').match(/^GIF8[79]a$/) !== null;
    case 'image/webp':
      return data.length >= 12 &&
        data.subarray(0, 4).toString('ascii') === 'RIFF' &&
        data.subarray(8, 12).toString('ascii') === 'WEBP';
    default:
      return false;
  }
};

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

  if (!Object.hasOwn(ALLOWED_MIME_EXTENSIONS, file.mimetype)) {
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

  if (!file.data || !hasValidImageSignature(file)) {
    return res.status(400).json({
      success: false,
      message: 'The uploaded file content does not match a supported image type.',
    });
  }

  const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ALLOWED_MIME_EXTENSIONS[file.mimetype]}`;
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
