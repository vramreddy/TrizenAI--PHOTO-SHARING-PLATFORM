const Photo = require('../models/Photo');
const Event = require('../models/Event');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');

/**
 * POST /api/events/:eventId/photos
 * Upload photos to an event (Team Member must be assigned)
 */
const uploadPhotos = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check membership — admin (event owner) or assigned team member
    const isOwner = event.createdBy.toString() === req.user._id.toString();
    const isMember = event.teamMembers.some(
      (m) => m.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this event',
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }

    // Upload all files to Cloudinary
    const folder = `snapshare/events/${eventId}`;
    const uploadPromises = req.files.map(async (file) => {
      const result = await uploadToCloudinary(file.buffer, folder, file.originalname);

      return Photo.create({
        eventId,
        uploadedBy: req.user._id,
        filename: `${Date.now()}_${file.originalname}`,
        originalName: file.originalname,
        storageUrl: result.url,
        thumbnailUrl: result.thumbnailUrl,
        storagePublicId: result.publicId,
        fileSize: result.bytes || file.size,
        width: result.width,
        height: result.height,
        mimeType: file.mimetype,
      });
    });

    const photos = await Promise.all(uploadPromises);

    res.status(201).json({
      success: true,
      message: `${photos.length} photo(s) uploaded successfully`,
      data: { photos },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/events/:eventId/photos
 * List photos for an event with pagination and filters
 */
const getPhotos = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const {
      page = 1,
      limit = 30,
      selected,
      uploadedBy,
      sort = '-createdAt',
    } = req.query;

    // Verify event exists and user has access
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const isOwner = event.createdBy.toString() === req.user._id.toString();
    const isMember = event.teamMembers.some(
      (m) => m.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this event',
      });
    }

    // Build filter
    const filter = { eventId };
    if (selected !== undefined) {
      filter.selected = selected === 'true';
    }
    if (uploadedBy) {
      filter.uploadedBy = uploadedBy;
    }

    // For team members, optionally limit to own photos
    // (they CAN see all photos in their event, per the SRD)

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [photos, total] = await Promise.all([
      Photo.find(filter)
        .populate('uploadedBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Photo.countDocuments(filter),
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

/**
 * PATCH /api/events/:eventId/photos/select
 * Bulk select/deselect photos (Admin only)
 */
const selectPhotos = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { photoIds, selected } = req.body;

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

    const result = await Photo.updateMany(
      { _id: { $in: photoIds }, eventId },
      { $set: { selected } }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} photo(s) ${selected ? 'selected' : 'deselected'}`,
      data: { modifiedCount: result.modifiedCount },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/events/:eventId/photos/:photoId
 * Delete a photo (Admin or the uploader)
 */
const deletePhoto = async (req, res, next) => {
  try {
    const { eventId, photoId } = req.params;

    const photo = await Photo.findOne({ _id: photoId, eventId });
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found',
      });
    }

    // Check permission: admin (event owner) or the uploader
    const event = await Event.findById(eventId);
    const isOwner = event.createdBy.toString() === req.user._id.toString();
    const isUploader = photo.uploadedBy.toString() === req.user._id.toString();

    if (!isOwner && !isUploader) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own photos',
      });
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(photo.storagePublicId);

    // Delete from database
    await Photo.deleteOne({ _id: photoId });

    res.json({
      success: true,
      message: 'Photo deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadPhotos, getPhotos, selectPhotos, deletePhoto };
