const multer = require('multer');

// Use memory storage — files stay in RAM buffer, uploaded directly to Cloudinary
const storage = multer.memoryStorage();

// File filter — only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, and WebP are allowed.`),
      false
    );
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 20,                   // Max 20 files per request
  },
});

module.exports = upload;
