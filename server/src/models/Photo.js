const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    storageUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    storagePublicId: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    width: {
      type: Number,
      default: 0,
    },
    height: {
      type: Number,
      default: 0,
    },
    mimeType: {
      type: String,
      default: '',
    },
    selected: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for performance
photoSchema.index({ eventId: 1, createdAt: -1 });
photoSchema.index({ uploadedBy: 1 });
photoSchema.index({ eventId: 1, selected: 1 });

module.exports = mongoose.model('Photo', photoSchema);
