const jwt = require('jsonwebtoken');
const Gallery = require('../models/Gallery');
const Photo = require('../models/Photo');
const Event = require('../models/Event');
const generateSlug = require('../utils/generateSlug');

/**
 * POST /api/events/:eventId/gallery
 * Create or update gallery for an event (Admin only)
 */
const createGallery = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { title, description, pin } = req.body;

    // Verify event ownership
    const event = await Event.findOne({
      _id: eventId,
      createdBy: req.user._id,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or access denied',
      });
    }

    // Check if gallery already exists for this event
    let gallery = await Gallery.findOne({ eventId });

    if (gallery) {
      // Update existing gallery
      gallery.title = title || gallery.title;
      gallery.description = description !== undefined ? description : gallery.description;
      if (pin) {
        gallery.pinHash = pin; // Will be hashed by pre-save hook
      }

      // Update photo count
      const photoCount = await Photo.countDocuments({ eventId, selected: true });
      gallery.photoCount = photoCount;

      await gallery.save();
    } else {
      // Create new gallery
      const slug = generateSlug(title || event.name);
      const photoCount = await Photo.countDocuments({ eventId, selected: true });

      gallery = await Gallery.create({
        eventId,
        title,
        description,
        slug,
        pinHash: pin, // Will be hashed by pre-save hook
        photoCount,
        createdBy: req.user._id,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Gallery saved successfully',
      data: { gallery: gallery.toJSON() },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/events/:eventId/gallery/publish
 * Publish or unpublish gallery (Admin only)
 */
const publishGallery = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { published = true } = req.body;

    // Verify event ownership
    const event = await Event.findOne({
      _id: eventId,
      createdBy: req.user._id,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or access denied',
      });
    }

    const gallery = await Gallery.findOne({ eventId });
    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: 'Gallery not found. Create a gallery first.',
      });
    }

    // Must have selected photos to publish
    if (published) {
      const selectedCount = await Photo.countDocuments({ eventId, selected: true });
      if (selectedCount === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot publish gallery with no selected photos',
        });
      }
      gallery.photoCount = selectedCount;
      gallery.publishedAt = new Date();
    }

    gallery.published = published;
    await gallery.save();

    res.json({
      success: true,
      message: `Gallery ${published ? 'published' : 'unpublished'} successfully`,
      data: { gallery: gallery.toJSON() },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/events/:eventId/gallery
 * Get gallery details (Admin view)
 */
const getGalleryAdmin = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const gallery = await Gallery.findOne({ eventId })
      .populate('createdBy', 'name email');

    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: 'Gallery not found',
      });
    }

    // Update photo count
    const photoCount = await Photo.countDocuments({ eventId, selected: true });

    res.json({
      success: true,
      data: {
        gallery: {
          ...gallery.toJSON(),
          photoCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/gallery/:slug
 * Get gallery metadata (public)
 */
const getGalleryPublic = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const filter = {
      $or: [{ slug }, { slug: new RegExp(`^${slug}`) }],
      published: true,
    };

    const gallery = await Gallery.findOne(filter)
      .select('title description slug photoCount publishedAt');

    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: 'Gallery not found',
      });
    }

    // Check expiration
    if (gallery.expiresAt && new Date() > gallery.expiresAt) {
      return res.status(410).json({
        success: false,
        message: 'This gallery has expired',
      });
    }

    res.json({
      success: true,
      data: { gallery },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/gallery/:slug/verify
 * Verify gallery PIN and return a gallery access token
 */
const verifyPin = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { pin } = req.body;

    const filter = {
      $or: [{ slug }, { slug: new RegExp(`^${slug}`) }],
      published: true,
    };

    const gallery = await Gallery.findOne(filter).select('+pinHash');
    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: 'Gallery not found',
      });
    }

    // Check expiration
    if (gallery.expiresAt && new Date() > gallery.expiresAt) {
      return res.status(410).json({
        success: false,
        message: 'This gallery has expired',
      });
    }

    // Verify PIN
    const isMatch = await gallery.comparePin(pin);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect PIN',
      });
    }

    // Generate gallery access token (separate from user JWT)
    const galleryToken = jwt.sign(
      { galleryId: gallery._id, slug: gallery.slug },
      process.env.GALLERY_TOKEN_SECRET,
      { expiresIn: process.env.GALLERY_TOKEN_EXPIRES_IN || '2h' }
    );

    res.json({
      success: true,
      message: 'Gallery access granted',
      data: {
        galleryToken,
        gallery: gallery.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/gallery/:slug/photos
 * Get published gallery photos (requires gallery token)
 */
const getGalleryPhotos = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 30 } = req.query;

    const filter = {
      $or: [{ slug }, { slug: new RegExp(`^${slug}`) }],
      published: true,
    };

    const gallery = await Gallery.findOne(filter);
    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: 'Gallery not found',
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [photos, total] = await Promise.all([
      Photo.find({ eventId: gallery.eventId, selected: true })
        .select('storageUrl thumbnailUrl width height originalName createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Photo.countDocuments({ eventId: gallery.eventId, selected: true }),
    ]);

    res.json({
      success: true,
      data: {
        photos,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGallery,
  publishGallery,
  getGalleryAdmin,
  getGalleryPublic,
  verifyPin,
  getGalleryPhotos,
};
