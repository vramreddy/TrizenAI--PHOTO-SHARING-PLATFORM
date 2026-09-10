const router = require('express').Router({ mergeParams: true });
const {
  uploadPhotos,
  getPhotos,
  selectPhotos,
  deletePhoto,
} = require('../controllers/photo.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const { selectPhotosSchema } = require('../utils/validators');

// All photo routes require authentication
router.use(authenticate);

router.post('/', upload.array('photos', 20), uploadPhotos);
router.get('/', getPhotos);
router.patch('/select', authorizeAdmin, validate(selectPhotosSchema), selectPhotos);
router.delete('/:photoId', deletePhoto);

module.exports = router;
