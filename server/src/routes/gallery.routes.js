const router = require('express').Router();
const {
  createGallery,
  publishGallery,
  getGalleryAdmin,
  getGalleryPublic,
  verifyPin,
  getGalleryPhotos,
} = require('../controllers/gallery.controller');
const { authenticate, authorizeAdmin, verifyGalleryToken } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createGallerySchema, verifyPinSchema } = require('../utils/validators');

// === Admin routes (require authentication) ===
// These are mounted under /api/events/:eventId/gallery in app.js
const adminRouter = require('express').Router({ mergeParams: true });
adminRouter.use(authenticate);
adminRouter.use(authorizeAdmin);

adminRouter.post('/', validate(createGallerySchema), createGallery);
adminRouter.put('/publish', publishGallery);
adminRouter.get('/', getGalleryAdmin);

// === Public routes ===
// These are mounted under /api/gallery in app.js
router.get('/:slug', getGalleryPublic);
router.post('/:slug/verify', validate(verifyPinSchema), verifyPin);
router.get('/:slug/photos', verifyGalleryToken, getGalleryPhotos);

module.exports = { publicRouter: router, adminRouter };
